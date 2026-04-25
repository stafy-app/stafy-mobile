// src/components/HeaderThemed.tsx

import {View, Text} from "react-native";
import {useState} from "react";
import useUser from "@/src/hooks/useUser";
import {usePathname} from "expo-router";
import routeHelper from "@/src/utils/routeHelper";


export default function HeaderThemed() {

    const pathname = usePathname();

    const {user} = useUser();

    // get the page title
    const pageTitle: string = routeHelper(pathname)

    return(
        <View>
            {/* Future: Image Icon */}

            <View className={"bg-white shadow-sm flex-column items-start pl-5 py-2"}>
                <Text className={"text-secondary-500 font-semibold"}>Bună, {user?.first_name || "Utilizator"}!</Text>
                <Text className={"text-lg font-bold"}>{pageTitle}</Text>
            </View>

        </View>
    )
}