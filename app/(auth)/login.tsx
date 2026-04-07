// app/login.tsx

import {View, Text, Image, TextInput, Alert} from "react-native";
import {Link} from "expo-router";

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
        //console.log("Login");
       // console.log(email);

        try{
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);

            await login(email, password);

        }catch (e){
            console.log(e);
            Alert.alert("Eroare", "Email sau parola incorecte");
        }finally {
            setIsLoading(false);
        }
    }

    return (

    <View className={"flex-1 w-full bg-secondary-50 items-center justify-center"}>

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