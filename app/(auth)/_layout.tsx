// app/(auth)/_layout.tsx

import {Stack} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {Uniwind} from "uniwind";
import {View} from "react-native";
import UserProvider from "@/src/context/UserContext";

export default function AuthLayout() {
    Uniwind.setTheme('light');

    return (

        <Stack screenOptions={{headerShown: false}}>

            <Stack.Screen name={'login'}/>
            <Stack.Screen name={'register'}/>

        </Stack>


    );
}