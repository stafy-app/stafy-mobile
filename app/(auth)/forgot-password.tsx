// app/(auth)/forgot-password.tsx

import {View, Text, Alert, Platform} from "react-native";
import {Link, router} from "expo-router";

import StafyLogoBlock from "@/src/components/ui/StafyLogoBlock";
import TextInputThemed from "@/src/components/ui/TextInputThemed";
import ButtonThemed from "@/src/components/ui/ButtonThemed";
import {useState} from "react";
import useUser from "@/src/hooks/useUser";

export default function ForgotPasswordScreen() {

    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {resetPassword} = useUser();

    const handleReset = async () => {
        setIsLoading(true);

        try {
            await resetPassword(email);

            if (Platform.OS === 'web') {
                window.alert("Dacă există un cont cu acest email, vei primi un link pentru resetarea parolei.");
                router.replace("/login");
            } else {
                Alert.alert(
                    "Verifică emailul",
                    "Dacă există un cont cu acest email, vei primi un link pentru resetarea parolei.",
                    [{text: "OK", onPress: () => router.replace("/login")}]
                );
            }
        } catch (e) {
            console.log(e);
            if (Platform.OS === 'web') {
                window.alert("Ceva nu a mers bine. Încearcă din nou.");
            } else {
                Alert.alert("Eroare", "Ceva nu a mers bine. Încearcă din nou.");
            }
        } finally {
            setIsLoading(false);
        }
    }


     return (

    <View className={"flex-1 px-6 w-full bg-secondary-50 items-center justify-center"}>

        <StafyLogoBlock width={102} height={102}/>

        <TextInputThemed placeholder={"Email"} className={"mb-4 mt-10"}
                         keyboardType={"email-address"}
        value={email}
        onChangeText={setEmail}/>

        <ButtonThemed onPress={handleReset} isLoading={isLoading} title={"Trimite link de resetare"} className={"mt-6"}/>

        <View className={"flex-row items-center justify-center mt-10"}>
            <Link href={"/login"} className={"text-primary-500 text-base"}>Înapoi la login</Link>
        </View>

    </View>

   )

}