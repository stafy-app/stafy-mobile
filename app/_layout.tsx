// app/_layout.tsx

import "../global.css";
import {router, Stack} from "expo-router";
import UserProvider from "@/src/context/UserContext";
import {Uniwind} from "uniwind";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useEffect} from "react";
import {deleteItem, getItem} from "@/src/services/storage";
import {jwtDecode} from "jwt-decode";
import {StatusBar} from "expo-status-bar";
import checkNetwork from "@/src/utils/networkHelper";
import {OfflineManager} from "@/src/services/OfflineManager";
import NetInfo from "@react-native-community/netinfo";



export default function RootLayout() {
    Uniwind.setTheme('light');


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

        // Offline mode sync
        const unsubscribeNetwork = NetInfo.addEventListener(state => {
            // If the phone reconnects to the internet, sync the data
            if (state.isConnected && state.isInternetReachable) {
                console.log("Phone reconnected to the internet, syncing data...")
                OfflineManager.apiSync();
            }
        })

        // Cleanup subscription on unmounting, preventing memory leaks
        return () => unsubscribeNetwork();

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