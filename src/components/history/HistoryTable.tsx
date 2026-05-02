// src/components/history/HistoryTable.tsx

import React from 'react';
import {View, Text, ScrollView} from "react-native";

import SafeScreenWrapper from "@/src/components/SafeScreenWrapper";

interface HystoryTableProps {
    timeEntries: any[],
}


export default function HistoryTable({timeEntries}: HystoryTableProps) {

    // Mock data representing recent time entries
    // In production, this will be populated from your Neon database (timeentries & activities tables)
    const mock = [
        { id: 1, activity: "Course", date: "12 Mai", duration: "02:30", rate: "112.5" },
        { id: 2, activity: "Meeting", date: "12 Mai", duration: "00:45", rate: "22.5" },
        { id: 3, activity: "Demo", date: "11 Mai", duration: "01:30", rate: "90.0" },
        { id: 4, activity: "Course", date: "11 Mai", duration: "03:15", rate: "146.2" },
        { id: 5, activity: "Meeting", date: "10 Mai", duration: "01:00", rate: "30.0" },
    ];

    return (
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>

                {/* Main card container with rounded corners and subtle shadow */}
                <View className="bg-white rounded-2xl overflow-hidden border border-secondary-100 shadow-sm">

                    {/* Card Title Header */}
                    <View className="px-5 py-4">
                        <Text className="text-xl font-bold text-secondary-900">Ultimele intrări</Text>
                    </View>

                    {/* Table Header: Defines column titles and layout proportions */}
                    <View className="flex-row bg-secondary-50/50 px-5 py-2 border-y border-secondary-100">
                        {/* Using flex ratios to maintain alignment across different screen sizes */}
                        <Text className="flex-[1.5] text-[11px] font-bold text-secondary-400 tracking-wider uppercase">Activitate</Text>
                        <Text className="flex-1 text-[11px] font-bold text-secondary-400 tracking-wider uppercase">Data</Text>
                        <Text className="flex-1 text-[11px] font-bold text-secondary-400 tracking-wider uppercase text-center">Durată</Text>
                        <Text className="flex-1 text-[11px] font-bold text-secondary-400 tracking-wider uppercase text-right">Tarif</Text>
                    </View>

                    {/* Table Body: Iterates through the entries and renders each row */}
                    {timeEntries.map((item, index) => {

                        // Check if it's the last item to remove the bottom border
                        const isLastItem = index === timeEntries.length - 1;

                        return (
                            <View
                                key={item.id}
                                className={`flex-row px-5 py-4 items-center ${!isLastItem ? 'border-b border-secondary-50' : ''}`}
                            >
                                {/* Activity Column */}
                                <View className="flex-[1.5] justify-center">
                                    <Text className="text-base font-bold text-secondary-900">{item.activity_name}</Text>
                                </View>

                                {/* Date Column */}
                                <View className="flex-1 justify-center">
                                    <Text className="text-sm font-medium text-secondary-500">{item.activity_date}</Text>
                                </View>

                                {/* Duration Column */}
                                <View className="flex-1 items-center justify-center">
                                    <Text className="text-sm font-bold text-secondary-900">{item.activity_total/60}h</Text>
                                </View>

                                {/* Rate Column */}
                                <View className="flex-1 items-end justify-center">
                                    <Text className="text-sm font-bold text-secondary-900">{item.rate_hour} lei</Text>
                                </View>
                            </View>
                        );
                    })}

                </View>

            </ScrollView>
    )
}