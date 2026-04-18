// src/components/auth/UserOnly.tsx


import useUser from "@/src/hooks/useUser";
import {useRouter} from "expo-router";
import {ReactNode, useEffect} from "react";
import {View, Text} from "react-native";

export default function UserOnly({children} : {children: React.ReactNode}) {

    const {user, isLoading} = useUser();
    const router = useRouter();

    // verify when user or authChecked changes
    useEffect(() => {

        // if loading, do nothing
        if (isLoading) return;

        if (user === null) {
            router.replace("/login");
        }

    }, [user, isLoading, router])


    // if loading, show loading
    if (isLoading) {
        return(
            <View>
                <Text>Loading...</Text>
            </View>
        )
    }

    // if user is not logged in, show loading
    if (!user) {
        return(
            <View>
                <Text>Nu esti logat! Acces respins.</Text>
            </View>
        )
    }


    return children;

}