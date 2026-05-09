// app/(tabs)/history.tsx


import {View, Text, ScrollView} from "react-native";

import {api} from "@/src/services/api";

import SafeScreenWrapper from "@/src/components/SafeScreenWrapper";
import HeaderThemed from "@/src/components/HeaderThemed";
import HistoryTable from "@/src/components/history/HistoryTable";
import {useCallback, useEffect, useState} from "react";
import useUser from "@/src/hooks/useUser";
import {useFocusEffect} from "expo-router";
import {OfflineManager} from "@/src/services/OfflineManager";

export default function HistoryScreen() {

    const [timeEntries, setTimeEntries] = useState<any[]>([]);

    const {logout} = useUser();

    const handleDeleteEntry = async (entryId: number) => {
        try{
            const response = await api.delete(`/dashboard/employee/time-entry/${entryId}`)

            if (response.data.message){
                console.log("[INFO] Entry deleted successfully")
                // Remove the entry from the state
                setTimeEntries(timeEntries.filter((entry: any) => entry.id !== entryId))
            }
        }catch (error){
            console.error("Failed to delete entry", error)
        }
    }

    useFocusEffect(
        useCallback(() => {

            const fetchData = async () => {
                try {
                    const response = await OfflineManager.apiGet("/dashboard/employee")

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
                <HistoryTable timeEntries={timeEntries} onDelete={handleDeleteEntry}/>

            </ScrollView>
        </SafeScreenWrapper>
    )
}