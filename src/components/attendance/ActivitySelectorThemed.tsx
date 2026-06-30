// src/components/attendance/ActivitySelectorThemed.tsx

import {View, Text, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";

import {api} from "@/src/services/api";
import {HourlyRate} from "@/src/types/api";


interface ActivitySelectorProps {
    onActivitySelect: (activity: string) => void;
    onRateSelect?: (rate: number) => void;
}


export default function ActivitySelectorThemed({onActivitySelect, onRateSelect}: ActivitySelectorProps) {

    const [isLoading, setIsLoading] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const [allActivities, setAllActivities] = useState<HourlyRate[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setIsLoading(true);

                const response = await api.get<{ rates: HourlyRate[] }>("/api/users/me/settings/hourly-rates");

                setAllActivities(response.data.rates);

            } catch (error) {
                console.log("[ERROR] Failed to fetch activities", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivities();
    }, [])


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
                                    setSelectedActivity(activity.activity_name)
                                    onActivitySelect(activity.activity_name)
                                    if (onRateSelect) {
                                        onRateSelect(activity.hourly_rate_gross)
                                    }
                                }}
                                className={`rounded-xl px-5 py-3 border border-secondary-200
                            ${selectedActivity === activity.activity_name ? 'bg-primary-500' : 'bg-white border-secondary-200'}`}
                            >
                                <Text
                                    className={`${selectedActivity === activity.activity_name ? 'text-white' : 'text-secondary-500'}`}
                                >{activity.activity_name}</Text>
                            </TouchableOpacity>
                        )
                    )}
            </View>

            </View>

        </View>
    )

}
