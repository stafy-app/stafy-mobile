// app/(auth)/_layout.tsx

import {Stack} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {Uniwind} from "uniwind";
import {View} from "react-native";
import UserProvider from "@/src/context/UserContext";

export default function AuthLayout() {
    Uniwind.setTheme('light');

    return (
        <SafeAreaView className="flex-1 bg-secondary-50">

            <Stack screenOptions={{headerShown: false}}/>

        </SafeAreaView>

    );
}