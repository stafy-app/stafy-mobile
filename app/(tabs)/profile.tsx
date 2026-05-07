// app/(tabs)/profile.tsx

import {View, Text, ScrollView} from "react-native";
import SafeScreenWrapper from "@/src/components/SafeScreenWrapper";

import HeaderThemed from "@/src/components/HeaderThemed";
import ProfileInfo from "@/src/components/profile/ProfileInfo";
import {useFocusEffect} from "expo-router";
import {useCallback, useState} from "react";
import {api} from "@/src/services/api";
import useUser from "@/src/hooks/useUser";
import TipCard from "@/src/components/profile/TipCard";

import {BellRing, Clock, Scan, Wallet} from "lucide-react-native";
import HourlyRateCard from "@/src/components/profile/HourlyRateCard";
import PopupEdit from "@/src/components/profile/PopupEdit";

export default function ProfileScreen() {

    const [rates, setRates] = useState<any[]>([])
    
    // Popup state
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedRate, setSelectedRate] = useState<any>(null);


    const {user} = useUser();

    useFocusEffect(
        useCallback(() => {

            const fetchData = async () => {
                try {
                    const response = await api.get("/api/users/me/settings/hourly-rates")

                    if (!response) {
                        console.error("Failed to fetch data")
                        return
                    }

                    console.log("[INFO] Data fetched successfully", response.data.rates)
                    setRates(response.data.rates)
                    //console.log("[INFO] User data: ", user)

                } catch (error) {
                    console.error("Failed to fetch data", error)
                }
            }

            fetchData()
        }, [])
    )
    
    const handleRatePress = (rate: any) => {
        setSelectedRate(rate);
        setIsPopupVisible(true);
    }
    
    const handleSaveRate = (newRateValue: string) => {
        console.log(`Saved new rate for ${selectedRate?.activity_name}: ${newRateValue}`);
        // Aici vei adăuga logica de API pentru a trimite valoarea către server
        // api.put(`/api/rates/${selectedRate.id}`, { rate: newRateValue })
        setIsPopupVisible(false);
    }


    return (
        <SafeScreenWrapper>
            <ScrollView className={"bg-secondary-50"}>

                {/* Header Section */}
                <HeaderThemed/>


                {/* Profile Section */}
                <View className={"mt-10"}>
                    {/*// @ts-ignore*/}
                    <ProfileInfo fullName={user.last_name + " " + user.first_name} role={user?.role}/>
                </View>

                {/* Tips & Tricks Section */}
                <View className={"mt-10 mx-5"}>
                    <Text className={"font-semibold text-lg mb-5"}>Tips & Tricks</Text>

                    <View className={"flex-row flex-wrap justify-between gap-3"}>
                        <TipCard title={"Pontaj Precis"} subtitle={"Verifică zilnic orele înregistrate."}
                                 Icon={Clock} iconColor={"#f97316"} bgColor={"bg-orange-100"}/>

                        <TipCard title={"Gruparea Activități"} subtitle={"Grupează corect: Curs, Demo, Meeting."}
                                 Icon={Scan} iconColor={"#2196F3"} bgColor={"bg-blue-100"}/>

                        <TipCard title={"Notificări"} subtitle={"Nu uita să te pontezi oricând vrei tu."}
                                 Icon={BellRing} iconColor={"#6366f1"} bgColor={"bg-indigo-50"}/>

                        <TipCard title={"Venit Brut"} subtitle={"Urmărește-ți evoluția venitului pe lună."}
                                 Icon={Wallet} iconColor={"#4CAF50"} bgColor={"bg-green-100"}/>
                    </View>

                </View>

                {/* Hourly Rates Section */}

                <View className={"mt-10 mx-5"}>
                    <Text className={"font-semibold text-lg mb-5"}>Tarife Orare</Text>

                    {rates?
                    rates.map((rate) => (
                        <HourlyRateCard 
                            key={rate.activity_id} 
                            title={rate.activity_name}
                            subtitle={""} 
                            price={rate.hourly_rate_gross.toString() + " RON"} 
                            unitLabel={"per Oră"} 
                            onPress={() => handleRatePress(rate)}
                        />
                    ))
                    : null}


                </View>

            </ScrollView>
            
            {/* Popup component */}
            <PopupEdit 
                visible={isPopupVisible}
                title={`Editează Tariful Orar - ${selectedRate?.activity_name || ''}`}
                initialValue={selectedRate?.hourly_rate_gross.toString() || ''}
                onSave={handleSaveRate}
                onCancel={() => setIsPopupVisible(false)}
            />
        </SafeScreenWrapper>

    )
}
