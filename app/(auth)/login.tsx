// app/login.tsx

import {View, Text} from "react-native";
import {Link} from "expo-router";

export default function LoginScreen() {

    return (

    <View className={"flex-1 bg-secondary-50"}>
        <Text> Hello World! </Text>
        <Link href={"/"}>Home</Link>
    </View>



   )

}