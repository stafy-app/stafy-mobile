// app/(tabs)/history.tsx


import {View, Text, ScrollView} from "react-native";

import {api} from "@/src/services/api";

import SafeScreenWrapper from "@/src/components/SafeScreenWrapper";
import HeaderThemed from "@/src/components/HeaderThemed";
import HistoryTable from "@/src/components/history/HistoryTable";
import {useCallback, useEffect, useState} from "react";
import useUser from "@/src/hooks/useUser";
import {useFocusEffect} from "expo-router";

export default function HistoryScreen() {

    const [timeEntries, setTimeEntries] = useState<any[]>([]);

    const {logout} = useUser();

    useFocusEffect(
        useCallback(() => {

            const fetchData = async () => {
                try {
                    const response = await api.get("/dashboard/employee")

                    if (!response){
                        console.error("Failed to fetch data")
                        return
                    }

                    console.log("[INFO] Data fetched successfully", response.data.time_entries)
                    setTimeEntries(response.data.time_entries)
                }catch (error){
                    console.error("Failed to fetch data", error)
                }
            }

            fetchData()
        }, [])
    )


    return (
        <SafeScreenWrapper>
            <ScrollView className={"bg-secondary-50"}>

                {/* Header Section */}
                <HeaderThemed/>

                {/* History Table Section */}
                <HistoryTable timeEntries={timeEntries}/>

            </ScrollView>
        </SafeScreenWrapper>
    )
}