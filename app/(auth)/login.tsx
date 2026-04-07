// app/login.tsx

import {View, Text, Image, TextInput} from "react-native";
import {Link} from "expo-router";

import {Lock} from "lucide-react-native";

import StafyLogoBlock from "../../src/components/StafyLogoBlock";
import TextInputThemed from "../../src/components/TextInputThemed";
import ButtonThemed from "../../src/components/ButtonThemed";

export default function LoginScreen() {


    return (

    <View className={"flex-1 w-full bg-secondary-50 items-center justify-center"}>

        <StafyLogoBlock width={102} height={102}/>

        <TextInputThemed placeholder={"Email"} className={"mb-4"}/>
        <TextInputThemed isPassword={true} placeholder={"Password"} Icon={Lock}/>

        <ButtonThemed title={"Intra in cont"} className={"mt-10"}/>

        <View className={"flex-row items-center justify-center mt-10"}>
            <Text className={"text-base"}> Nu ai cont? </Text>
            <Link href={"/register"} className={"text-primary-500 text-base"}>Inregistreaza-te acum</Link>
        </View>

    </View>



   )

}