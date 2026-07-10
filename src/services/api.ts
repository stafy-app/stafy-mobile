// src/services/api.ts

import axios from 'axios';
import {Platform} from 'react-native';
import {signOut} from 'firebase/auth';
import {auth} from '@/src/services/firebase';
// Deprecated — token used to be read from storage instead of asked from Firebase. See interceptor below.
// import {getItem} from '@/src/services/storage';

const API_URL = Platform.OS === 'web'
    ? (process.env.EXPO_PUBLIC_API_URL ?? 'https://stafy-s5oi.onrender.com/')
    : 'https://stafy-s5oi.onrender.com/';

export const api = axios.create(
    {
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    }
)

// Deprecated — old interceptor read a static backend-issued JWT from storage.
// Firebase ID tokens expire after 1h and must be re-fetched per request instead.
// api.interceptors.request.use(
//     async (config) => {
//
//         try {
//             const token = await getItem('stafy_token')
//
//             if (token) {
//                 config.headers.Authorization = `Bearer ${token}`
//             }
//
//             return config;
//         } catch (error) {
//             console.error("Error getting token from storage:", error);
//             return config;
//         }
//
//
//     }, (error) => {
//         return Promise.reject(error);
//     })

// Interceptor for adding the Firebase ID token to the request headers.
// getIdToken() returns the cached token unless it's near expiry, in which case
// the SDK silently refreshes it — no manual expiry tracking needed.
api.interceptors.request.use(
    async (config) => {

        try {
            const currentUser = auth.currentUser;

            if (currentUser) {
                const idToken = await currentUser.getIdToken();
                config.headers.Authorization = `Bearer ${idToken}`
            }

            return config;
        } catch (error) {
            console.error("Error getting Firebase ID token:", error);
            return config;
        }


    }, (error) => {
        return Promise.reject(error);
    })

// A 401 here means the Firebase ID token was rejected by the backend (expired
// past the SDK's own refresh window, revoked, or the user was disabled in
// Firebase). signOut() triggers onAuthStateChanged in UserContext.tsx, which
// already clears `user`, wipes `stafy_userData`, and redirects to /login —
// no separate logout wiring needed here.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                await signOut(auth);
            } catch (signOutError) {
                console.error("Error signing out after 401:", signOutError);
            }
        }

        return Promise.reject(error);
    })
