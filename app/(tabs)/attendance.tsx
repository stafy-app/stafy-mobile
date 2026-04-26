// app/(tabs)/attendance.tsx

import {ScrollView, View, Text} from "react-native";
import {useState} from "react";

import HeaderThemed from "@/src/components/HeaderThemed";
import CalendarThemed from "@/src/components/attendance/CalendarThemed"
import ActivitySelectorThemed from "@/src/components/attendance/ActivitySelectorThemed";
import TimeSelectorThemed from "@/src/components/attendance/TimeSelectorThemed";


export default function AttendanceScreen() {

    const [activityName, setActivityName] = useState<string>("");
    const [startTime, setStartTime] = useState(new Date());
    const [stopTime, setStopTime] = useState(new Date());

    const handleDateSelection = (date: Date) => {
        console.log("Date selected:", date.toISOString());
    }

    return (
        <ScrollView className={"flex-1 bg-secondary-50"}>
            {/* HeaderThemed Section */}
            <HeaderThemed/>

            {/* CalendarThemed Section */}
            <View className={"mt-3"}>
                <CalendarThemed onDateSelect={handleDateSelection}/>
            </View>

            {/* Activity Selector Section */}
            <View className={"my-5"}>
                <ActivitySelectorThemed onActivitySelect={
                    (activityName) => setActivityName(activityName)}/>
            </View>


            {/* Time Selector Section */}
            <View className={"my-5"}>

                <Text className={"font-semibold text-secondary-500 text-sm mb-2 uppercase tracking-wide"}>INTERVAL ORAR</Text>

                <View className={"flex-row justify-between"}>
                    <TimeSelectorThemed title={"ORA START"} time={startTime}
                                        onTimeChange={(newTime) => setStartTime(newTime)}/>

                    <TimeSelectorThemed title={"ORA STOP"} time={stopTime}
                                        onTimeChange={(newTime) => setStopTime(newTime)}/>
                </View>
            </View>

            {/*<Text>Attendance Screen</Text>*/}
        </ScrollView>
    )
}