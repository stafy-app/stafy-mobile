// app/register.tsx

import {View, Text} from "react-native";
import {Link} from "expo-router";

export default function RegisterScreen(){

    return(
        <View>
            <Text> Hello Register! </Text>
            <Link href={"/"}>Home</Link>
        </View>
    )
}