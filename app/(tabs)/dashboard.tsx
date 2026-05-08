// app/(tabs)/dashboard.tsx

import {View, Text, ScrollView} from "react-native";

import {Clock, Wallet} from "lucide-react-native";

import SafeScreenWrapper from "@/src/components/SafeScreenWrapper";
import HeaderThemed from "@/src/components/HeaderThemed";

import InfoCard from "@/src/components/dashboard/InfoCard";
import {useFocusEffect} from "expo-router";
import {useCallback, useState} from "react";
import {api} from "@/src/services/api";
import {PieChart} from "react-native-gifted-charts";
import PieChartData from "@/src/components/dashboard/PieChartData";

export default function DashboardScreen() {

    const [totalHours, setTotalHours] = useState<number>(0)
    const [totalMoney, setTotalMoney] = useState<number>(0)
    const [timeEntries, setTimeEntries] = useState<any[]>([])

    useFocusEffect(
        useCallback(() => {

            const fetchData = async () => {
                try {
                    const response = await api.get("/dashboard/employee")

                    if (!response) {
                        console.error("Failed to fetch data")
                        return
                    }

                    console.log("[INFO] Data fetched successfully", response.data)

                    setTotalHours(response.data.total_hours)
                    setTotalMoney(response.data.total_gross_salary)
                    setTimeEntries(response.data.time_entries)
                } catch (error) {
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
                <View>
                    <HeaderThemed/>
                </View>

                {/* Time Section */}
                <View className={"mt-10"}>
                    <InfoCard title={"Luna aceasta"} value={totalHours.toString() + "h"} Icon={Clock}/>
                </View>

                {/* Money Section */}
                <View className={"mt-10"}>
                    <InfoCard title={"Salariu estimativ brut"} value={totalMoney.toString() + " RON"} Icon={Wallet}/>
                </View>

                {/* Pie Chart Section */}
                <View className={"my-10 px-4"}>
                    <PieChartData timeEntries={timeEntries} timeTotal={totalHours}/>
                </View>
            </ScrollView>
        </SafeScreenWrapper>
    )

}