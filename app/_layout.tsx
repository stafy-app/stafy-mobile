// app/_layout.tsx

import "../global.css";
import {router, Stack} from "expo-router";
import UserProvider from "@/src/context/UserContext";
import {Uniwind} from "uniwind";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useEffect} from "react";
import {deleteItem, getItem} from "@/src/services/storage";
import {jwtDecode} from "jwt-decode";


export default function RootLayout() {
    Uniwind.setTheme('light');


    useEffect(() => {

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
                }catch (error){
                    console.error("Error decoding token:", error);
                    router.replace("/login")
                }
            } else{
                router.replace("/login")
            }
        };
        checkAuth();
    }, [])

    return (
        <UserProvider>
            <SafeAreaProvider>
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name="index"/>
                    <Stack.Screen name="(auth)"/>
                    <Stack.Screen name="(tabs)"/>
                </Stack>
            </SafeAreaProvider>
        </UserProvider>
    );
}