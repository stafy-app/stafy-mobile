// src/components/ButtonThemed.tsx

import React from 'react';
import {View, TouchableOpacity, ActivityIndicator, Text} from "react-native";

type ButtonThemedProps = {
    title?: string;
    variant?: "primary" | "";
    isLoading?: boolean;
    className?: string;
    onPress?: () => void;
}

export default function ButtonThemed({
                                         title = "Button",
                                         variant = "primary",
                                         isLoading = false,
                                         className = "",
                                         onPress = () =>null,
                                     }: ButtonThemedProps) {

    const isPrimary = variant === "primary";

    const bgClass = isPrimary ? "bg-primary-500" : 'bg-transparent border-2 border-secondary-200';
    const textClass = isPrimary ? "text-white" : 'text-secondary-500';

    return (
        <TouchableOpacity disabled={isLoading} activeOpacity={0.7}
                          className={`w-full h-14 rounded-xl items-center justify-center flex-row ${bgClass}
                           shadow-sm shadow-primary-500/30
                            ${isLoading ? "opacity-50" : ""} ${className}`}
                          onPress={onPress}>

            {isLoading ?
                <ActivityIndicator color={isPrimary ? "white" : "black"}/>
                : <Text className={`font-semibold text-lg ${textClass}`}>{title}</Text>
            }


        </TouchableOpacity>

    )
}