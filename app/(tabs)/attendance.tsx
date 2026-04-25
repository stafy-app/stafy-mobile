// app/(tabs)/attendance.tsx

import {View, Text} from "react-native";

import HeaderThemed from "@/src/components/HeaderThemed";
import CalendarThemed from "@/src/components/attendance/CalendarThemed"
import ActivitySelectorThemed from "@/src/components/attendance/ActivitySelectorThemed";

export default function AttendanceScreen() {

    const handleDateSelection = (date: Date) => {
        console.log("Date selected:", date.toISOString());
    }

    return (
        <View className={"flex-1 bg-secondary-50"}>
            {/* HeaderThemed Section */}
            <HeaderThemed/>

            {/* CalendarThemed Section */}
            <View className={"mt-3"}>
                <CalendarThemed onDateSelect={handleDateSelection}/>
            </View>

            {/* Activity Selector Section */}
            <ActivitySelectorThemed />

            {/*<Text>Attendance Screen</Text>*/}
        </View>
    )
}