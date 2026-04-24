// src/components/HeaderThemed.tsx

import {View, Text} from "react-native";
import {useState} from "react";
import useUser from "@/src/hooks/useUser";


export default function HeaderThemed() {

    const {user} = useUser();

    const [name, setName] = useState("");

    return(
        <View>
            {/* Future: Image Icon */}

            <View>
                <Text>Bună, {user?.first_name || "Utilizator"}!</Text>
                <Text>Adaugare Pontaj!</Text>
            </View>

        </View>
    )
}