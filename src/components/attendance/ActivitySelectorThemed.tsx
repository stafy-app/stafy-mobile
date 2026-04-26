// src/components/attendance/ActivitySelectorThemed.tsx

import {View, Text, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";

import {api} from "@/src/services/api";



interface Activity {
    activity_id: number,
    activity_name: string,
    hourly_rate_gross: number
}

interface ActivitySelectorProps {
    onActivitySelect: (activity: string) => void;
}


/**
 * Renders a selectable list of user activities fetched from the backend.
 *
 * The component loads the available activities from the user's hourly rates settings
 * when it is mounted. Each activity is displayed as a selectable button.
 *
 * When an activity is selected, the component updates its internal selected activity
 * state and passes the selected activity name to the onActivitySelect callback.
 *
 * @param onActivitySelect - Callback called with the selected activity name.
 * @returns A React component that renders the activity selector UI.
 */
export default function ActivitySelectorThemed({onActivitySelect}: ActivitySelectorProps) {

    const [isLoading, setIsLoading] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const [allActivities, setAllActivities] = useState<Activity[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setIsLoading(true);

                // Call the backend API to get the activities
                const response = await api.get("/api/users/me/settings/hourly-rates");

                if (!response) {
                    console.error("Failed to fetch activities");
                    return;
                }

                //console.log("[INFO] Activities fetched successfully", response.data.rates[0]);

                setAllActivities(response.data.rates);
                //console.log("[INFO] All activities: ", allActivities);

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
                                }}
                                className={`rounded-xl px-5 py-3 border border-secondary-200
                            ${selectedActivity === activity.activity_name ? 'bg-primary-500' : 'bg-white border-secondary-200'}`}
                            >
                                <Text
                                    className={`${selectedActivity === activity.activity_name ? 'text-white' : 'text-secondary-500'}`}
                                >{activity.activity_name}</Text>
                            </TouchableOpacity>
                        ), //console.log("Selected activity: ", selectedActivity)
                    )}
            </View>

            </View>

        </View>
    )

}
