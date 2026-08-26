// app/(tabs)/attendance.tsx

import {Alert, ScrollView, View, Text} from "react-native";
import {useCallback, useState} from "react";
import {useFocusEffect} from "expo-router";

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
    // Bumped on every focus to remount ActivitySelectorThemed (see below).
    const [selectorKey, setSelectorKey] = useState(0)

    const workedTime: WorkedTimeResult = calculateWorkedTime(startTime, stopTime)

    // A previously-selected activity can go stale without any visible sign —
    // e.g. the user picks an activity, switches to Dashboard, accepts an
    // invitation to a different company (rewrites company_id server-side), then
    // returns here. ActivitySelectorThemed already refetches its list on focus,
    // but activityId here and its own internal highlight don't reset with it.
    // Clearing both on focus (and remounting the selector via selectorKey, so
    // its internal highlight resets too) means a stale id can never be
    // submitted — the user must always re-pick after navigating back in.
    useFocusEffect(
        useCallback(() => {
            setActivityId(null)
            setRate(0)
            setSelectorKey((key) => key + 1)
        }, [])
    )

    const handleDateSelection = (date: Date) => {
        console.log("Date selected:", date.toISOString());
        setStartTime(date)
        setStopTime(date)
    }

    // ORA STOP is picked on the same calendar day as ORA START (see CalendarThemed).
    // A night shift (e.g. 22:00 -> 06:00) therefore has stopTime chronologically
    // before startTime; mirrors calculateWorkedTime's "add 24h" display logic so the
    // submitted time_end matches what the Calculator already shows the user.
    const getSubmissionTimeEnd = (start: Date, stop: Date): Date => {
        if (stop.getTime() < start.getTime()) {
            return new Date(stop.getTime() + 24 * 60 * 60 * 1000);
        }
        return stop;
    }

    // Backend `code`s reachable from POST /time-entries — mapped to Romanian so
    // this all-Romanian screen doesn't show a raw English backend string
    // (`code`/`detail` shape: stafy-backend's ErrorOut). Anything not listed
    // here falls through to field_errors/detail/the generic fallback below.
    const ERROR_MESSAGES_RO: Record<string, string> = {
        "not_found": "Activitatea selectată nu mai este disponibilă. Te rog selecteaz-o din nou.",
        "entry_already_exists": "Există deja o înregistrare identică pentru acest interval orar.",
    }

    const getErrorMessage = (error: unknown): string => {
        const data = (error as any)?.response?.data;
        if (data?.code && ERROR_MESSAGES_RO[data.code]) {
            return ERROR_MESSAGES_RO[data.code];
        }
        const fieldErrors = data?.field_errors;
        if (fieldErrors) {
            const messages = Object.values(fieldErrors).flat();
            if (messages.length > 0) return messages.join(" ");
        }
        if (data?.detail) return data.detail;
        return "A apărut o eroare la salvare. Te rog încearcă din nou.";
    }

    const handleSaveToDb = async () => {

        if(!activityId) {
            Alert.alert("Eroare", "Te rog selectează o activitate!");
            return;
        }

        const submissionTimeEnd = getSubmissionTimeEnd(startTime, stopTime);

        if (submissionTimeEnd.getTime() === startTime.getTime()) {
            Alert.alert("Eroare", "Ora de start și ora de stop nu pot fi identice.");
            return;
        }

        try {
            const response = await api.post("/api/v1/time-entries/", {
                "time_start": startTime.toISOString(),
                "time_end": submissionTimeEnd.toISOString(),
                "activity_id": activityId
            })

            if (response) {
                setShowSuccess(true)
                setActivityId(null)
                setRate(0)
            }
        } catch (error) {
            console.error("Error saving time entry:", error);
            Alert.alert("Eroare", getErrorMessage(error));
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
                    <ActivitySelectorThemed key={selectorKey} onActivitySelect={
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
