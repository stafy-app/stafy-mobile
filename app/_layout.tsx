// app/_layout.tsx

import "../global.css";
import {router, Stack} from "expo-router";
import UserProvider from "@/src/context/UserContext";
import {Uniwind} from "uniwind";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useEffect, useRef} from "react";
import {deleteItem, getItem} from "@/src/services/storage";
import {jwtDecode} from "jwt-decode";
import {StatusBar} from "expo-status-bar";
import checkNetwork from "@/src/utils/networkHelper";
import {OfflineManager} from "@/src/services/OfflineManager";
import NetInfo from "@react-native-community/netinfo";



export default function RootLayout() {
    Uniwind.setTheme('light');

    // Ref to hold the debounce timer for network sync
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {

        // Authentication check
        const checkAuth = async () => {
            const token = await getItem("stafy_token")

            if (token) {

                try {
                    const decodedToken = jwtDecode(token)
                    const currentTime = Date.now() / 1000; // Convert to seconds

                    if (decodedToken.exp && decodedToken.exp < currentTime) {
                        console.log("Token has expired");

                        await deleteItem("stafy_token")

                        router.replace("/login")
                        return;
                    }

                    router.replace("/dashboard")
                } catch (error) {
                    console.error("Error decoding token:", error);
                    router.replace("/login")
                }
            } else {
                router.replace("/login")
            }
        };

        checkAuth();

        // Offline mode sync — debounced to 2s to avoid multiple rapid triggers
        // NetInfo can emit several events in quick succession when reconnecting
        const unsubscribeNetwork = NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable) {

                // Cancel any previously scheduled sync
                if (syncTimeoutRef.current) {
                    clearTimeout(syncTimeoutRef.current);
                }

                // Schedule the sync after 2s — by then the connection is stable
                syncTimeoutRef.current = setTimeout(() => {
                    console.log("Network stable. Starting offline queue sync...");
                    OfflineManager.apiSync();
                }, 2000);
            }
        });

        // Cleanup subscription and pending timer on unmounting
        return () => {
            unsubscribeNetwork();
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };

    }, [])

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