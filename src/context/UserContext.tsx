// src/context/UserContext.tsx

import React, {createContext, useEffect, useRef, useState} from 'react';
import {api} from "../services/api";
import {deleteItem, saveItem, getItem} from "@/src/services/storage";
import {router} from "expo-router";
import {User} from "@/src/types/api";
import {auth} from "@/src/services/firebase";
import isManagerMobileBlocked from "@/src/utils/isManagerMobileBlocked";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

// Maps Firebase Auth error codes and backend HTTPException `detail` bodies to
// user-facing Romanian messages. The old code read `error.response.data.message`,
// which never matched FastAPI's `{"detail": "..."}` error shape.
function mapAuthError(error: any): string {
    switch (error?.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return "Email sau parolă incorectă";
        case 'auth/email-already-in-use':
            return "Există deja un cont cu acest email";
        case 'auth/weak-password':
            return "Parola trebuie să aibă minim 6 caractere";
        case 'auth/invalid-email':
            return "Adresa de email nu este validă";
        case 'auth/too-many-requests':
            return "Prea multe încercări. Încearcă din nou mai târziu";
        case 'auth/network-request-failed':
            return "Fără conexiune la internet";
        default:
            return error?.response?.data?.detail ?? error?.message ?? "A apărut o eroare neașteptată";
    }
}


interface RegisterData {
    name: string;
    surname: string;
    email: string;
    role: string;
    password: string;
}

interface CompleteRegistrationData {
    name: string;
    surname: string;
    role: string;
}

// Thrown by login() when the Firebase account exists but the backend row
// doesn't (a previous registration attempt was interrupted before the
// backend call completed — see docs/modules/auth.md, Special Aspects →
// Orphan registration). The user is already Firebase-authenticated at this
// point, so the caller should route to /complete-registration instead of
// showing a dead-end error.
export class OrphanRegistrationError extends Error {
    constructor() {
        super("Înregistrarea nu a fost finalizată ultima dată.");
        this.name = "OrphanRegistrationError";
    }
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (registerData: RegisterData) => Promise<boolean>;
    completeRegistration: (data: CompleteRegistrationData) => Promise<boolean>;
    resetPassword: (email: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);

export default function UserProvider({children}: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Firebase's onAuthStateChanged fires as soon as createUserWithEmailAndPassword
    // / signInWithEmailAndPassword resolves internally — before login()/register()
    // below get a chance to call the backend and set the user themselves. Without
    // this guard, the hydration effect races: it calls getProfile() against a
    // backend row that register() hasn't created yet, fails, and clobbers user
    // state that login()/register() are about to set correctly.
    const isAuthenticating = useRef(false);

    async function login(email: string, password: string) {

        try {
            setIsLoading(true);
            isAuthenticating.current = true;

            const credential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await credential.user.getIdToken();

            try {
                await api.post('/api/v1/auth/login', undefined, {
                    headers: {Authorization: `Bearer ${idToken}`},
                });
            } catch (backendError: any) {
                if (backendError.response?.status === 404) {
                    throw new OrphanRegistrationError();
                }
                throw backendError;
            }

            const userData = await getProfile();

            await saveItem('stafy_userData', JSON.stringify(userData));

            setUser(userData);

            return userData;

        } catch (error: any) {
            if (error instanceof OrphanRegistrationError) {
                throw error;
            }
            throw new Error(mapAuthError(error));
        } finally {
            setIsLoading(false);
            isAuthenticating.current = false;
        }
    }

    // Deprecated — backend no longer accepts email/password on /auth/register,
    // it only accepts first_name/last_name/role plus a Firebase ID token in the
    // Authorization header (email/uid come from the verified token). Kept here
    // for reference until the migration settles. See replacement below.
    // async function register(registerData: RegisterData) {
    //
    //     try {
    //         setIsLoading(true);
    //
    //         const response = await api.post('/auth/register', {
    //             'first_name': registerData.name,
    //             'last_name': registerData.surname,
    //             'email': registerData.email,
    //             'role': registerData.role,
    //             'password': registerData.password,
    //         });
    //
    //         console.log("Response from backend: ", response.data);
    //         setIsLoading(false);
    //
    //         return true
    //     } catch (error: any) {
    //         console.log(error.response.data.message)
    //         throw new Error(error.response.data.message);
    //     }
    //
    // }

    async function register(registerData: RegisterData) {

        try {
            setIsLoading(true);
            isAuthenticating.current = true;

            const credential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
            const idToken = await credential.user.getIdToken();

            try {
                await api.post('/api/v1/auth/register', {
                    first_name: registerData.name,
                    last_name: registerData.surname,
                    role: registerData.role,
                }, {
                    headers: {Authorization: `Bearer ${idToken}`},
                });
            } catch (backendError: any) {
                // Firebase account now exists but the backend row doesn't (network
                // blip, backend down, invalid role). We deliberately do NOT delete
                // the Firebase user here — deletion can itself fail offline, and a
                // half-rolled-back state is worse than a recoverable one. The user
                // recovers via /complete-registration, reached from login()'s
                // OrphanRegistrationError (see completeRegistration() below and
                // docs/modules/auth.md, Special Aspects → Orphan registration).
                console.error(
                    "POST /api/v1/auth/register failed:",
                    backendError?.response?.status,
                    backendError?.response?.data ?? backendError?.message
                );
                throw new Error("Cont creat, dar înregistrarea pe server a eșuat. Contactează administratorul.");
            }

            // Best-effort: if registration auto-joined an inviting manager's
            // company (see stafy-backend/docs/modules/invitations.md), stash the
            // company name so the dashboard's first mount after login can show a
            // native "welcome" alert. Never let this block/fail registration —
            // registration already succeeded above.
            try {
                const profileResponse = await api.get<User>('/api/v1/profile', {
                    headers: {Authorization: `Bearer ${idToken}`},
                });
                if (profileResponse.data.is_own_company === false && profileResponse.data.company_name) {
                    await saveItem('stafy_pendingJoinAlert', profileResponse.data.company_name);
                }
            } catch {
                // Non-fatal — worst case, the welcome alert just doesn't show.
            }

            return true;
        } catch (error: any) {
            throw new Error(mapAuthError(error));
        } finally {
            setIsLoading(false);
            isAuthenticating.current = false;
        }
    }

    // Finishes provisioning the backend row for a Firebase account that
    // already exists — the orphan-registration recovery path. auth.currentUser
    // is guaranteed to be set here: this is only reachable via login()'s
    // OrphanRegistrationError, which fires after signInWithEmailAndPassword
    // already succeeded.
    async function completeRegistration(data: CompleteRegistrationData) {

        try {
            setIsLoading(true);
            isAuthenticating.current = true;

            const firebaseUser = auth.currentUser;
            if (!firebaseUser) {
                throw new Error("Sesiunea a expirat. Te rugăm să te autentifici din nou.");
            }
            const idToken = await firebaseUser.getIdToken();

            try {
                await api.post('/api/v1/auth/register', {
                    first_name: data.name,
                    last_name: data.surname,
                    role: data.role,
                }, {
                    headers: {Authorization: `Bearer ${idToken}`},
                });
            } catch (backendError: any) {
                console.error(
                    "POST /api/v1/auth/register (complete-registration) failed:",
                    backendError?.response?.status,
                    backendError?.response?.data ?? backendError?.message
                );
                throw new Error("Înregistrarea nu a putut fi finalizată. Încearcă din nou mai târziu.");
            }

            const userData = await getProfile();

            await saveItem('stafy_userData', JSON.stringify(userData));

            setUser(userData);

            return true;
        } catch (error: any) {
            throw new Error(mapAuthError(error));
        } finally {
            setIsLoading(false);
            isAuthenticating.current = false;
        }
    }

    async function logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out from Firebase:", error);
        }
        setUser(null);
        await deleteItem('stafy_userData');
    }


    async function resetPassword(email: string) {
        try{
            setIsLoading(true);
            await sendPasswordResetEmail(auth, email);
        }catch(error: any){
            throw new Error(mapAuthError(error));
        }finally {
            setIsLoading(false);
        }
    }


    async function getProfile(): Promise<User> {

        try{
            setIsLoading(true);

            const responseProfile = await api.get<User>('/api/v1/profile')

            if (!responseProfile) {
                console.error("No response received from the server");
                throw new Error("No response received from the server");
            }

            return responseProfile.data;

        }catch (error: any) {
            throw new Error(mapAuthError(error));
        }finally {
            setIsLoading(false);
        }

    }

    // Re-fetches /api/v1/profile and updates both the context and the
    // stafy_userData cache, without touching isLoading — UserOnly unmounts its
    // children while isLoading is true, which would blank the calling screen.
    // Deliberately doesn't call getProfile() (which toggles isLoading itself).
    // First caller: the dashboard's invitation-accept flow, which needs the
    // new company_id/manager_id to show up immediately, not on next cold start.
    async function refreshProfile() {
        const response = await api.get<User>('/api/v1/profile');
        const userData = response.data;
        await saveItem('stafy_userData', JSON.stringify(userData));
        setUser(userData);
    }

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // login()/register() are already driving state themselves and will
            // call the backend in the right order — this listener only handles
            // cold-start hydration and out-of-band sign-outs (e.g. token revoked
            // elsewhere). See isAuthenticating's declaration above for why.
            if (isAuthenticating.current) {
                return;
            }

            try {
                setIsLoading(true);

                if (!firebaseUser) {
                    setUser(null);
                    await deleteItem('stafy_userData');
                    router.replace("/login");
                    return;
                }

                const storedUserData = await getItem('stafy_userData');

                let userData: User;

                if (storedUserData) {
                    userData = JSON.parse(storedUserData);
                    setUser(userData);
                } else {
                    userData = await getProfile();
                    await saveItem('stafy_userData', JSON.stringify(userData));
                    setUser(userData);
                }

                // Cold-start hydration succeeded (or an out-of-band sign-in was
                // detected) — this is the single place that should redirect on
                // auth-state changes. login()/register() are skipped above via
                // isAuthenticating and drive their own post-success navigation.
                if (isManagerMobileBlocked(userData.role)) {
                    router.replace("/manager-mobile-blocked");
                } else {
                    router.replace("/dashboard");
                }

            } catch (error) {
                console.error("Error checking authentication:", error);

                setUser(null);
                await deleteItem('stafy_userData');
                router.replace("/login");

            } finally {
                setIsLoading(false);
            }
        });

        return unsubscribe;

    }, [])

    return (
        <UserContext.Provider
            value={{user, isLoading, login, register, completeRegistration, resetPassword, logout, refreshProfile}}>
            {children}
        </UserContext.Provider>
    )
}
