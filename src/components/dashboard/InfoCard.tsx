// src/components/dashboard/InfoCard.tsx


import React from 'react';
import {View, Text} from "react-native";

import {Clock} from "lucide-react-native";

interface InfoCardProps {
    title: string;
    value: string;
    Icon: React.ComponentType<{size: number, color: string}>;
}

export default function InfoCard({title="...", value="...", Icon=Clock}: InfoCardProps & { Icon: React.ComponentType<{ size: number, color: string }>}) {


    return (
        <View className={"items-center"}>

            <View className={"bg-white shadow-md rounded-lg w-[90%] py-5 items-center"}>

                <View className={"flex-row items-center gap-10"}>
                    <Icon size={45} color={"#F77518"}/>
                    <View>
                        <Text className={"text-3xl text-secondary-900 font-bold"}>{value}</Text>
                        <Text className={"text-base text-secondary-500 mt-[-5px]"}>{title}</Text>
                    </View>
                </View>

            </View>

        </View>
    )
}