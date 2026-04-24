// app/(tabs)/attendance.tsx

import {View, Text} from "react-native";

import HeaderThemed from "@/src/components/HeaderThemed";

export default function AttendanceScreen() {
    return (
        <View>
            {/* HeaderThemed Section */}
            <HeaderThemed/>

            <Text>Attendance Screen</Text>
        </View>
    )
}