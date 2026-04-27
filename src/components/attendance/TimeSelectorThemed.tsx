// src/components/attendance/TimeSelectorThemed.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

/**
 * Interface definition for the component properties.
 */
interface TimeSelectorProps {
    title: string;
    time: Date;
    onTimeChange: (newTime: Date) => void;
}


/**
 * Renders a themed time selector component that works across web and mobile platforms.
 *
 * On web, it displays a native HTML `input` of type `time`.
 * On iOS and Android, it displays a touchable field that opens the native
 * `DateTimePicker` in time selection mode.
 *
 * The component formats the selected time using a 24-hour `HH:mm` format and
 * notifies the parent component whenever the user selects a new time.
 *
 * @param title - Label displayed above the time selector.
 * @param time - Current selected time value.
 * @param onTimeChange - Callback called with the updated `Date` when the time changes.
 *
 * @returns A themed cross-platform time selection UI.
 */
export default function TimeSelectorThemed({ title, time, onTimeChange}: TimeSelectorProps) {

    // State to handle the visibility of the native mobile picker
    const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);

    /**
     * Handler for mobile native DateTimePicker.
     */
    const handleMobileTimeSelection = (event: DateTimePickerEvent, selectedDate?: Date) => {
        // Android dismisses the picker automatically, iOS might need manual handling
        if (Platform.OS === "android") {
            setIsPickerVisible(false);
        }

        // If user didn't cancel the action
        if (selectedDate) {
            onTimeChange(selectedDate);
        }
    };

    /**
     * Handler for Web standard HTML <input type="time">.
     */
    const handleWebTimeSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const timeString = event.target.value; // Expected format: "HH:mm"

        if (timeString) {
            const [hours, minutes] = timeString.split(":");

            // Create a new Date object based on the current one to preserve the date context
            const updatedDate = new Date(time);
            updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

            onTimeChange(updatedDate);
        }
    };

    /**
     * Utility to format the Date object into a 24h "HH:mm" string.
     */
    const formatTime24h = (dateObj: Date): string => {
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const formattedTime = formatTime24h(time);

    return (
        <View className="flex-col my-2">
            {/* Header Label */}
            <Text className="text-secondary-500 font-bold text-xs mb-2 uppercase tracking-wide">
                {title}
            </Text>

            {/* Platform Conditional Rendering */}
            {Platform.OS === "web" ? (

                /* --- WEB IMPLEMENTATION --- */
                <View className="bg-white border border-secondary-200 rounded-xl px-4 py-3">
                    {/* @ts-ignore - TS might complain about HTML tags in RN, but Expo Web handles this perfectly */}
                    <input
                        type="time"
                        value={formattedTime}
                        onChange={handleWebTimeSelection}
                        style={{
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: 18,
                            color: "#0f172a", // Dark secondary color
                            width: "100%",
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    />
                </View>
            ) : (
                /* --- MOBILE IMPLEMENTATION (iOS & Android) --- */
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsPickerVisible(true)}
                    className="bg-white border border-secondary-200 rounded-xl px-5 py-3"
                >
                    <Text className="text-secondary-900 text-lg">
                        {formattedTime}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Native Mobile Picker Instantiation */}
            {isPickerVisible && Platform.OS !== "web" && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true} // Forces 24h format, removing AM/PM
                    display="default"
                    onChange={handleMobileTimeSelection}
                />
            )}

            {/* iOS specific: Add a Done button if needed, otherwise default display handles it */}
            {isPickerVisible && Platform.OS === "ios" && (
                <TouchableOpacity
                    className="mt-2 py-2 items-center bg-secondary-100 rounded-lg"
                    onPress={() => setIsPickerVisible(false)}
                >
                    <Text className="text-primary-500 font-semibold text-base">Done</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}