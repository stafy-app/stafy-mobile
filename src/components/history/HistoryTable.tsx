// src/components/history/HistoryTable.tsx

import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Vibration} from "react-native";

import DeletePopupThemed from "@/src/components/ui/DeletePopupThemed";
import {TimeEntry} from "@/src/types/api";

interface HistoryTableProps {
    timeEntries: TimeEntry[];
    onDelete: (id: number) => void;
}


export default function HistoryTable({timeEntries, onDelete}: HistoryTableProps) {

    const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<TimeEntry | null>(null);

    const handleLongPress = (item: TimeEntry) => {
        Vibration.vibrate(100);
        setShowDeletePopup(true)
        setSelectedItem(item);
        console.log("Long press on item:", item);
    }


    return (
        <ScrollView className="flex-1" contentContainerStyle={{padding: 20}}>

            {/* Main card container with rounded corners and subtle shadow */}
            <View className="bg-white rounded-2xl overflow-hidden border border-secondary-100 shadow-sm">

                {/* Card Title Header */}
                <View className="px-5 py-4">
                    <Text className="text-xl font-bold text-secondary-900">Ultimele intrări</Text>
                </View>

                {/* Table Header: Defines column titles and layout proportions */}
                <View className="flex-row bg-secondary-50/50 px-5 py-2 border-y border-secondary-100">
                    <Text
                        className="flex-[1.5] text-[11px] font-bold text-secondary-400 tracking-wider uppercase">Activitate</Text>
                    <Text
                        className="flex-1 text-[11px] font-bold text-secondary-400 tracking-wider uppercase">Data</Text>
                    <Text
                        className="flex-1 text-[11px] font-bold text-secondary-400 tracking-wider uppercase text-center">Durată</Text>
                    <Text
                        className="flex-1 text-[11px] font-bold text-secondary-400 tracking-wider uppercase text-right">Tarif</Text>
                </View>

                {/* Table Body */}
                {timeEntries.map((item, index) => {

                    const isLastItem = index === timeEntries.length - 1;

                    // activity_total is in RON, NOT minutes — do not divide by 60
                    const durationInHours = Number(item.activity_hours.toFixed(2));

                    // Backend now sends a raw ISO datetime — formatting is client presentation logic.
                    const formattedDate = new Intl.DateTimeFormat('ro-RO', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    }).format(new Date(item.activity_date));

                    return (
                        <TouchableOpacity
                            key={item.id}
                            onLongPress={() => handleLongPress(item)}
                            delayLongPress={500}
                            activeOpacity={0.7}
                            className={`flex-row px-5 py-4 items-center ${!isLastItem ? 'border-b border-secondary-50' : ''}`}
                        >
                            {/* Activity Column */}
                            <View className="flex-[1.5] justify-center">
                                <Text className="text-base font-bold text-secondary-900">{item.activity_name}</Text>
                            </View>

                            {/* Date Column */}
                            <View className="flex-1 justify-center">
                                <Text className="text-sm font-medium text-secondary-500">{formattedDate}</Text>
                            </View>

                            {/* Duration Column */}
                            <View className="flex-1 items-center justify-center">
                                <Text
                                    className="text-sm font-bold text-secondary-900">{durationInHours}h</Text>
                            </View>

                            {/* Rate Column */}
                            <View className="flex-1 items-end justify-center">
                                <Text className="text-sm font-bold text-secondary-900">{item.rate_hour} lei</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}

            </View>

            {/* Delete Popup */}
            <DeletePopupThemed visible={showDeletePopup}
                               onCancel={() => setShowDeletePopup(false)}
                               onConfirm={() => {
                                   if (selectedItem) onDelete(selectedItem.id)
                                   setShowDeletePopup(false)
                               }}/>
        </ScrollView>
    )
}
