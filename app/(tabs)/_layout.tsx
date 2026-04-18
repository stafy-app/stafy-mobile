// app/(tabs)/_layout.tsx

import {Stack} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {Uniwind} from "uniwind";
import {View} from "react-native";
import UserProvider from "@/src/context/UserContext";
import UserOnly from "@/src/components/auth/UserOnly";


export default function TabsLayout() {
    Uniwind.setTheme('light');

    return (
        <UserOnly>
            <SafeAreaView className="flex-1 bg-secondary-50">
                <Stack screenOptions={{headerShown: false}}/>
            </SafeAreaView>
        </UserOnly>


    );
}