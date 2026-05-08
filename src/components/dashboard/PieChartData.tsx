// src/components/dashboard/PieChartData.tsx

import React, { useMemo } from 'react';
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import pieChartHelper from "@/src/utils/pieChartHelper"

interface PieChartDataProps {
    timeEntries: any[];
    timeTotal: number;
}

export default function PieChartData({ timeEntries, timeTotal }: PieChartDataProps) {

    // Get the formatted data
    const processedData = useMemo(
        () => pieChartHelper(timeEntries, timeTotal),
        [timeEntries, timeTotal]
    );

    // Adapt the data format for the PieChart
    const pieData = processedData.map(item => ({
        value: item.percentage,
        color: item.color,
    }));

    return (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-secondary-100 w-full items-center">

            {/* Title Section*/}
            <Text className="text-xl font-bold text-secondary-900 mb-8 self-start">
                Distribuție Activități
            </Text>

            {/* Pie Chart Section*/}
            {pieData.length > 0 ? (
                <View className="mb-10 relative items-center justify-center">
                    <PieChart
                        donut={true}
                        innerRadius={75}
                        radius={100}
                        data={pieData}
                        centerLabelComponent={() => {
                            return (
                                <View className="items-center justify-center">
                                    <Text className="text-3xl font-bold text-primary-500">
                                        100%
                                    </Text>
                                </View>
                            );
                        }}
                    />
                </View>
            ) : (
                <View className="h-48 items-center justify-center mb-6">
                    <Text className="text-secondary-400">Nu există date pentru luna aceasta.</Text>
                </View>
            )}

            {/* Legend Section*/}
            <View className="flex-row justify-between w-full px-2">
                {processedData.map((item, index) => (
                    <View key={index} className="items-center">
                        <View className="flex-row items-center gap-2 mb-1">
                            <View
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <Text className="text-sm font-bold text-secondary-800">
                                {item.activity}
                            </Text>
                        </View>
                        <Text className="text-sm text-secondary-500 font-medium">
                            {item.percentage}%
                        </Text>
                    </View>
                ))}
            </View>

        </View>
    );
}