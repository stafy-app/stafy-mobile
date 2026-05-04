// app/(tabs)/profile.tsx

import {View, Text} from "react-native";
import SafeScreenWrapper from "@/src/components/SafeScreenWrapper";

import HeaderThemed from "@/src/components/HeaderThemed";

export default function ProfileScreen() {

    return (
        <SafeScreenWrapper>

            {/* Header Section */}
            <HeaderThemed/>

            <View>
                <Text>Profile</Text>
            </View>
        </SafeScreenWrapper>
    )
}