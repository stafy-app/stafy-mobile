// app/(tabs)/attendance.tsx

import {Alert, ScrollView, View, Text} from "react-native";
import {useState} from "react";

import {WorkedTimeResult, calculateWorkedTime} from "@/src/utils/calculateWorkedTime";

import HeaderThemed from "@/src/components/ui/HeaderThemed";
import CalendarThemed from "@/src/components/attendance/CalendarThemed"
import ActivitySelectorThemed from "@/src/components/attendance/ActivitySelectorThemed";
import TimeSelectorThemed from "@/src/components/attendance/TimeSelectorThemed";
import CalculatorThemed from "@/src/components/attendance/CalculatorThemed";
import PopupThemed from "@/src/components/ui/PopupThemed";
import SafeScreenWrapper from "@/src/components/ui/SafeScreenWrapper";

import {api} from "@/src/services/api";


export default function AttendanceScreen() {

    const [activityId, setActivityId] = useState<number | null>(null);
    const [rate, setRate] = useState<number>(0)
    const [startTime, setStartTime] = useState(new Date());
    const [stopTime, setStopTime] = useState(new Date());
    const [showSuccess, setShowSuccess] = useState<boolean>(false)

    const workedTime: WorkedTimeResult = calculateWorkedTime(startTime, stopTime)

    const handleDateSelection = (date: Date) => {
        console.log("Date selected:", date.toISOString());
        setStartTime(date)
        setStopTime(date)
    }

    const handleSaveToDb = async () => {

        if(!activityId) {
            Alert.alert("Eroare", "Te rog selectează o activitate!");
            return;
        }

        try {
            const response = await api.post("/api/v1/time-entries/", {
                "time_start": startTime.toISOString(),
                "time_end": stopTime.toISOString(),
                "activity_id": activityId
            })

            if (response) {
                setShowSuccess(true)
                setActivityId(null)
                setRate(0)
            }
        } catch (error) {
            console.error("Error saving time entry:", error);
        }

    }

    return (

        <SafeScreenWrapper>
            <ScrollView className={"flex-1 bg-secondary-50"}>
                {/* HeaderThemed Section */}
                <HeaderThemed/>

                {/* Popup Success Section */}
                {showSuccess ?
                    <PopupThemed title={"Salvat cu succes!"} message={"Înregistrarea este salvată în baza de date."}
                                 visible={showSuccess} onClose={() => setShowSuccess(false)}/> : null}

                {/* CalendarThemed Section */}
                <View className={"mt-3 px-3"}>
                    <CalendarThemed onDateSelect={handleDateSelection}/>
                </View>

                {/* Activity Selector Section */}
                <View className={"my-5 px-3"}>
                    <ActivitySelectorThemed onActivitySelect={
                        (activityId) => setActivityId(activityId)}
                                            onRateSelect={(rate) => setRate(rate)}/>
                </View>


                {/* Time Selector Section */}
                <View className={"my-5 px-3"}>

                    <Text className={"font-semibold text-secondary-500 text-sm mb-2 uppercase tracking-wide"}>INTERVAL
                        ORAR</Text>

                    <View className={"flex-row justify-between"}>
                        <TimeSelectorThemed title={"ORA START"} time={startTime}
                                            onTimeChange={(newTime) => setStartTime(newTime)}/>

                        <TimeSelectorThemed title={"ORA STOP"} time={stopTime}
                                            onTimeChange={(newTime) => setStopTime(newTime)}/>
                    </View>
                </View>

                {/* Calculator Section */}
                <View className={"my-5"}>

                    <CalculatorThemed className={"px-3"}
                                      time={workedTime.totalHours} rate={rate} onSubmit={handleSaveToDb}/>

                </View>

            </ScrollView>
        </SafeScreenWrapper>
    )
}
