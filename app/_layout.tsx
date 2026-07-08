// app/_layout.tsx

import "../global.css";
import {Stack} from "expo-router";
import UserProvider from "@/src/context/UserContext";
import {Uniwind} from "uniwind";
import {SafeAreaProvider} from "react-native-safe-area-context";
// Deprecated — cold-start check used to decode a locally cached backend JWT.
// import {deleteItem, getItem} from "@/src/services/storage";
// import {jwtDecode} from "jwt-decode";
import {StatusBar} from "expo-status-bar";


export default function RootLayout() {
    Uniwind.setTheme('light');

    // Deprecated — this used to decode a locally cached backend JWT and check
    // its `exp` claim manually. Firebase tracks and persists its own session;
    // onAuthStateChanged below fires once on mount with the restored session
    // (or null) after checking the persisted refresh token, no manual expiry
    // math needed.
    // useEffect(() => {
    //
    //     const checkAuth = async () => {
    //         const token = await getItem("stafy_token")
    //
    //         if (token) {
    //
    //             try {
    //                 const decodedToken = jwtDecode(token)
    //                 const currentTime = Date.now() / 1000;
    //
    //                 if (decodedToken.exp && decodedToken.exp < currentTime) {
    //                     console.log("Token has expired");
    //
    //                     await deleteItem("stafy_token")
    //
    //                     router.replace("/login")
    //                     return;
    //                 }
    //
    //                 router.replace("/dashboard")
    //             } catch (error) {
    //                 console.error("Error decoding token:", error);
    //                 router.replace("/login")
    //             }
    //         } else {
    //             router.replace("/login")
    //         }
    //     };
    //
    //     checkAuth();
    //
    // }, [])

    // Removed 2026-07-02 — this was a second, unguarded onAuthStateChanged
    // listener racing UserContext's own (isAuthenticating-guarded) one: it fired
    // router.replace("/dashboard") as soon as Firebase's sign-in resolved
    // internally, before login()/register() finished talking to the backend,
    // landing the user on a screen with a still-null UserContext.user. Cold-start
    // and out-of-band sign-out redirects now live solely in UserContext.tsx's
    // onAuthStateChanged effect.

    return (
        <>
            <StatusBar style="dark"/>

            <UserProvider>
                <SafeAreaProvider>
                    <Stack screenOptions={{headerShown: false}}>
                        <Stack.Screen name="index"/>
                        <Stack.Screen name="(auth)"/>
                        <Stack.Screen name="(tabs)"/>
                    </Stack>
                </SafeAreaProvider>
            </UserProvider>
        </>);

}


// ── Offline Sync (disabled — kept for future use) ────────────────────────────
//
// import {useRef} from "react";
// import checkNetwork from "@/src/utils/networkHelper";
// import {OfflineManager} from "@/src/services/OfflineManager";
// import NetInfo from "@react-native-community/netinfo";
//
// const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//
// Inside useEffect, after checkAuth():
//
// // Offline mode sync — debounced to 2s to avoid multiple rapid triggers
// // NetInfo can emit several events in quick succession when reconnecting
// const unsubscribeNetwork = NetInfo.addEventListener(state => {
//     if (state.isConnected && state.isInternetReachable) {
//
//         // Cancel any previously scheduled sync
//         if (syncTimeoutRef.current) {
//             clearTimeout(syncTimeoutRef.current);
//         }
//
//         // Schedule the sync after 2s — by then the connection is stable
//         syncTimeoutRef.current = setTimeout(() => {
//             console.log("Network stable. Starting offline queue sync...");
//             OfflineManager.apiSync();
//         }, 2000);
//     }
// });
//
// // Cleanup subscription and pending timer on unmounting
// return () => {
//     unsubscribeNetwork();
//     if (syncTimeoutRef.current) {
//         clearTimeout(syncTimeoutRef.current);
//     }
// };
