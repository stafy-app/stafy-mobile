// app/(tabs)/_layout.tsx

import {Stack, Tabs} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {Uniwind} from "uniwind";
import {View} from "react-native";
import UserProvider from "@/src/context/UserContext";
import UserOnly from "@/src/components/auth/UserOnly";

import {Clock, LayoutDashboard} from "lucide-react-native";


export default function TabsLayout() {
    Uniwind.setTheme('light');

    return (
        <UserOnly>
            <SafeAreaView className="flex-1 bg-secondary-50">
                <Tabs screenOptions={{
                    headerShown: false,

                    tabBarActiveTintColor: '#F77518',
                    tabBarInactiveTintColor: '#94a3b8',
                    tabBarShowLabel: false,

                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopWidth: 1,
                        borderTopColor: '#f1f5f9',
                        height: 60,
                        paddingBottom: 10,
                    }
                }}>

                    {/* Attendance Tab */}
                    <Tabs.Screen name={"attendance"}
                    options={{
                        tabBarIcon: ({color, size}) => (
                            <Clock color={color} size={size} />
                        )
                    }} />

                    {/* Dashboard Tab */}
                    <Tabs.Screen name={"dashboard"}
                                 options={{
                                     tabBarIcon: ({color, size}) => (
                                         <LayoutDashboard color={color} size={size} />
                                     )
                                 }} />

                    </Tabs>
            </SafeAreaView>
        </UserOnly>


    );
}