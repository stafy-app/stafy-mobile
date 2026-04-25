// src/components/attendance/CalendarThemed.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

interface CalendarThemedProps {
    onDateSelect?: (date: Date) => void;
}


/**
 * Renders a themed calendar with month navigation and date selection.
 *
 * The component does not return the selected date directly.
 * When a date is selected, it updates the internal selected date state
 * and optionally passes the selected Date object to the onDateSelect callback.
 *
 * @param onDateSelect - Optional callback that receives the selected Date object.
 * @returns A React component that renders the calendar UI.
 */
export default function CalendarThemed({ onDateSelect }: CalendarThemedProps) {

    // State for the month displayed on the screen, used for navigation
    const [currentMonth, setCurrentMonth] = useState(new Date());
    // State for the date actually selected by the user
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Navigation functions for moving to the previous or next month
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Generates the day matrix for the currently displayed month
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Get the weekday the month starts on, adjusted so Monday is index 0
        const firstDay = new Date(year, month, 1).getDay();
        const startingDayIndex = firstDay === 0 ? 6 : firstDay - 1;

        const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
        const daysInPreviousMonth = new Date(year, month, 0).getDate();

        const days = [];

        // Days from the previous month
        for (let i = startingDayIndex - 1; i >= 0; i--) {
            days.push({
                day: daysInPreviousMonth - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, daysInPreviousMonth - i),
            });
        }

        // Days from the current month
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i),
            });
        }

        // Days from the next month, filling the calendar up to 42 cells
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i),
            });
        }

        return days;
    };

    const days = generateCalendarDays();
    const currentMonthName = MONTHS[currentMonth.getMonth()].toUpperCase();
    const currentYear = currentMonth.getFullYear();

    const handlePress = (dateObj: Date, isCurrentMonth: boolean) => {
        // If the user selects a day outside the current month, navigate to that month
        if (!isCurrentMonth) {
            setCurrentMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
        }

        setSelectedDate(dateObj);

        if (onDateSelect) {
            onDateSelect(dateObj);
        }
    };

    return (
        <View className="w-full">

            {/* Header above the calendar card */}
            <View className="flex-row justify-between items-center mb-4 px-2">
                <Text className="text-secondary-500 font-bold tracking-widest text-sm">
                    {currentMonthName} {currentYear}
                </Text>

                <View className="flex-row space-x-4">
                    <TouchableOpacity onPress={goToPreviousMonth} className="p-1">
                        <ChevronLeft color="#64748b" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goToNextMonth} className="p-1">
                        <ChevronRight color="#64748b" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main white card */}
            <View className="bg-white rounded-3xl p-5 shadow-sm">

                {/* Week days row */}
                <View className="flex-row justify-between mb-1">
                    {WEEK_DAYS.map((day, index) => (
                        <View key={index} className="w-[14.28%] items-center">
                            <Text className="text-secondary-400 font-bold text-xs">{day}</Text>
                        </View>
                    ))}
                </View>

                {/* Dates grid */}
                <View className="flex-row flex-wrap">
                    {days.map((item, index) => {

                        // Check if the current day in the loop is the selected date
                        const isSelected =
                            item.date.getDate() === selectedDate.getDate() &&
                            item.date.getMonth() === selectedDate.getMonth() &&
                            item.date.getFullYear() === selectedDate.getFullYear();

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.7}
                                onPress={() => handlePress(item.date, item.isCurrentMonth)}
                                // w-[14.28%] is exactly 1/7 of the width, creating a perfect 7-column row
                                // h-8 is the height of a single day cell
                                className="w-[14.28%] h-8 aspect-square justify-center items-center"
                            >
                                {/* Circle that changes color when selected */}
                                <View
                                    className={`w-8 h-8 justify-center items-center rounded-[10px] ${
                                        isSelected ? 'bg-primary-500 shadow-lg shadow-primary-500/40' : ''
                                    }`}
                                >
                                    <Text
                                        className={`text-base ${
                                            isSelected
                                                ? 'text-white font-bold'
                                                : item.isCurrentMonth
                                                    ? 'text-secondary-900 font-medium'
                                                    : 'text-secondary-300 font-medium'
                                        }`}
                                    >
                                        {item.day}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}