// src/components/ui/UserOnly.tsx

import useUser from "@/src/hooks/useUser";
import {useRouter} from "expo-router";
import {ReactNode, useEffect} from "react";
import {View, Text} from "react-native";

export default function UserOnly({children}: { children: ReactNode }) {

    const {user, isLoading} = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (user === null) {
            router.replace("/login");
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        )
    }

    if (!user) {
        return (
            <View>
                <Text>Nu esti logat! Acces respins.</Text>
            </View>
        )
    }

    return children;
}
