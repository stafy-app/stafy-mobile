// src/components/attendance/ActivitySelectorThemed.tsx

import {View, Text, TouchableOpacity} from "react-native";
import {useCallback, useState} from "react";
import {useFocusEffect} from "expo-router";

import {api} from "@/src/services/api";
import {HourlyRate} from "@/src/types/api";


interface ActivitySelectorProps {
    onActivitySelect: (activityId: number) => void;
    onRateSelect?: (rate: number) => void;
}


export default function ActivitySelectorThemed({onActivitySelect, onRateSelect}: ActivitySelectorProps) {

    const [isLoading, setIsLoading] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [allActivities, setAllActivities] = useState<HourlyRate[]>([]);

    useFocusEffect(
        useCallback(() => {
            const fetchActivities = async () => {
                try {
                    setIsLoading(true);

                    const response = await api.get<{ data: HourlyRate[] }>("/api/v1/users/me/settings/hourly-rates");

                    setAllActivities(response.data.data);

                } catch (error) {
                    console.log("[ERROR] Failed to fetch activities", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchActivities();
        }, [])
    )


    return (
        <View className={"w-full"}>

            <View>
                <Text className={"text-secondary-500 font-semibold text-sm mb-3"}>Tip activitate</Text>
            <View className={"w-full flex-row flex-wrap space-x-3 space-y-2"}>
                {
                    allActivities.map((activity) => (
                            <TouchableOpacity
                                key={activity.activity_id}
                                onPress={() => {
                                    setSelectedActivityId(activity.activity_id)
                                    onActivitySelect(activity.activity_id)
                                    if (onRateSelect) {
                                        onRateSelect(Number(activity.hourly_rate_gross))
                                    }
                                }}
                                className={`rounded-xl px-5 py-3 border border-secondary-200
                            ${selectedActivityId === activity.activity_id ? 'bg-primary-500' : 'bg-white border-secondary-200'}`}
                            >
                                <Text
                                    className={`${selectedActivityId === activity.activity_id ? 'text-white' : 'text-secondary-500'}`}
                                >{activity.activity_name}</Text>
                            </TouchableOpacity>
                        )
                    )}
            </View>

            </View>

        </View>
    )

}
