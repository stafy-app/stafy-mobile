// src/components/profile/TipCard.tsx

import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';


interface TipCardProps {
    title: string;
    subtitle: string;
    Icon: React.ElementType;
    iconColor: string;
    bgColor: string;
}

export default function TipCard({title, subtitle, Icon, iconColor, bgColor}: TipCardProps) {
    return (
        <View
            className="bg-white w-[48%] rounded-2xl p-4 mb-4 shadow-sm border border-secondary-50"
        >

            <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${bgColor}`}>
                <Icon size={20} color={iconColor}/>
            </View>

            {/* Textele */}
            <Text className="text-base font-bold text-secondary-900 mb-1">
                {title}
            </Text>
            <Text className="text-xs text-secondary-500 leading-tight">
                {subtitle}
            </Text>
        </View>
    );
}