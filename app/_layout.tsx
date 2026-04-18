// app/_layout.tsx

import "../global.css";
import {Stack} from "expo-router";
import UserProvider from "@/src/context/UserContext";
import {Uniwind} from "uniwind";

export default function RootLayout() {
    Uniwind.setTheme('light');

    return (
        <UserProvider>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </UserProvider>
    );
}