// src/components/profile/HourlyRateCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface HourlyRateCardProps {
    title: string;
    subtitle: string;
    price: string;
    unitLabel: string;
    onPress?: () => void;
    onLongPress?: () => void;
}

export default function HourlyRateCard({
                                    title,
                                    subtitle,
                                    price,
                                    unitLabel,
                                    onPress,
                                    onLongPress
                                }: HourlyRateCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={500}
            className="bg-white rounded-2xl p-5 flex-row justify-between items-center shadow-sm border border-secondary-50 w-full mb-3"
        >

            {/* Left side */}
            <View className="flex-1 pr-4">
                <Text className="text-lg font-bold text-secondary-800 mb-1">
                    {title}
                </Text>
                <Text className="text-sm text-secondary-500">
                    {subtitle}
                </Text>
            </View>

            {/* Right side */}
            <View className="items-end">
                <Text className="text-xl font-bold text-primary-500 mb-1">
                    {price}
                </Text>
                <Text className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">
                    {unitLabel}
                </Text>
            </View>

        </TouchableOpacity>
    );
}
