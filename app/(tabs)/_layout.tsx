// app/(tabs)/_layout.tsx

import {Tabs} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {Uniwind} from "uniwind";
import UserOnly from "@/src/components/auth/UserOnly";

import {Clock, LayoutDashboard, History} from "lucide-react-native";


export default function TabsLayout() {
    Uniwind.setTheme('light');

    return (
        <UserOnly>
            <Tabs screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#F77518",
                tabBarItemStyle: {
                    justifyContent: "center",
                    alignItems: "center",
                },
            }}>

                {/* Dashboard Tab */}
                <Tabs.Screen name={"dashboard"}
                             options={{
                                 tabBarIcon: ({color, size}) => (
                                     <LayoutDashboard color={color} size={size} />
                                 )
                             }} />

                {/* Attendance Tab */}
                <Tabs.Screen name={"attendance"}
                             options={{
                                 tabBarIcon: ({focused, color, size}) => (
                                     <Clock color={focused ? color : "#64748b"} size={size}/>
                                 )
                             }}/>

                {/* History Tab */}
                <Tabs.Screen name={"history"}
                             options={{
                                 tabBarIcon: ({focused, color, size}) => (
                                     <History color={focused ? color : "#64748b"} size={size}/>
                                 )
                             }}/>


            </Tabs>
        </UserOnly>
    );
}
