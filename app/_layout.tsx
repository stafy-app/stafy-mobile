// app/_layout.tsx

import "../global.css";
import {Stack} from "expo-router";
import UserProvider from "@/src/context/UserContext";
import {Uniwind} from "uniwind";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";


export default function RootLayout() {
    Uniwind.setTheme('light');

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
