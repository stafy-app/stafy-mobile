// app/login.tsx

import {View, Text, Alert} from "react-native";
import {Link, router} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";

import {Lock} from "lucide-react-native";

import StafyLogoBlock from "../../src/components/StafyLogoBlock";
import TextInputThemed from "../../src/components/TextInputThemed";
import ButtonThemed from "../../src/components/ButtonThemed";
import {useState} from "react";
import useUser from "@/src/hooks/useUser";


export default function LoginScreen() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {login} = useUser();

    const handleLogin = async () =>{
        // Set loading state to true before starting the login process
        setIsLoading(true);

        try{

            await login(email, password);
            router.replace("/attendance");

        }catch (e){
            console.log(e);
            Alert.alert("Eroare", "Email sau parola incorecte");
        }finally {
            setIsLoading(false);
        }
    }

    return (

    <View className={"flex-1 px-6 w-full bg-secondary-50 items-center justify-center"}>

        <StafyLogoBlock width={102} height={102}/>

        <TextInputThemed placeholder={"Email"} className={"mb-4"}
                         keyboardType={"email-address"}
        value={email}
        onChangeText={setEmail}/>

        <TextInputThemed isPassword={true} placeholder={"Password"} Icon={Lock}
        value={password}
        onChangeText={setPassword}/>

        <ButtonThemed onPress={handleLogin} isLoading={isLoading} title={"Intra in cont"} className={"mt-10"}/>

        <View className={"flex-row items-center justify-center mt-10"}>
            <Text className={"text-base"}> Nu ai cont? </Text>
            <Link href={"/register"} className={"text-primary-500 text-base"}>Inregistreaza-te acum</Link>
        </View>

    </View>



   )

}
