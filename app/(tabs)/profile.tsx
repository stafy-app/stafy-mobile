// app/(tabs)/profile.tsx

import {View, Text, ScrollView, TouchableOpacity, Vibration} from "react-native";
import SafeScreenWrapper from "@/src/components/ui/SafeScreenWrapper";

import HeaderThemed from "@/src/components/ui/HeaderThemed";
import ProfileInfo from "@/src/components/profile/ProfileInfo";
import {useFocusEffect} from "expo-router";
import {useCallback, useState} from "react";
import {api} from "@/src/services/api";
import useUser from "@/src/hooks/useUser";
import TipCard from "@/src/components/profile/TipCard";

import {BellRing, Clock, Scan, Wallet, Plus} from "lucide-react-native";
import HourlyRateCard from "@/src/components/profile/HourlyRateCard";
import PopupEdit from "@/src/components/profile/PopupEdit";
import ButtonThemed from "@/src/components/ui/ButtonThemed";
import FooterThemed from "@/src/components/ui/FooterThemed";
import PopupAddRate from "@/src/components/profile/PopupAddRate";
import DeletePopupThemed from "@/src/components/ui/DeletePopupThemed";
import {HourlyRate} from "@/src/types/api";

export default function ProfileScreen() {

    const [rates, setRates] = useState<HourlyRate[]>([])

    const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
    const [isAddPopupVisible, setIsAddPopupVisible] = useState(false);
    const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
    const [selectedRate, setSelectedRate] = useState<HourlyRate | null>(null);

    const {user, logout} = useUser();

    useFocusEffect(
        useCallback(() => {
            fetchData()
        }, [])
    )

    const fetchData = async () => {
        try {
            const response = await api.get<{ data: HourlyRate[] }>("/api/v1/users/me/settings/hourly-rates")

            if (!response.data) {
                console.error("Failed to fetch data")
                return
            }

            console.log("[INFO] Data fetched successfully", response.data.data)
            setRates(response.data.data)

        } catch (error) {
            console.error("Failed to fetch data", error)
        }
    }

    const handleRatePress = (rate: HourlyRate) => {
        setSelectedRate(rate);
        setIsEditPopupVisible(true);
    }

    const handleRateLongPress = (rate: HourlyRate) => {
        Vibration.vibrate(100);
        setSelectedRate(rate);
        setIsDeletePopupVisible(true);
    }

    const handleSaveRate = async (newRateValue: string) => {
        console.log(`Saved new rate for ${selectedRate?.activity_name}: ${newRateValue}`);

        try{
            const response = await api.patch("/api/v1/users/me/settings/hourly-rates", {
                "activity_id": selectedRate?.activity_id,
                "hourly_rate_gross": newRateValue,
            })

            if (response){
                console.log("[INFO] Rate updated successfully")
            }

            fetchData()

        }catch(error){
            console.error("Failed to update rate", error)
        }

        setIsEditPopupVisible(false);
    }

    const handleAddRate = async (activityName: string, rate: string) => {
        console.log(`Adding new rate: ${activityName} - ${rate}`);

        try{
            await api.post("/api/v1/users/me/settings/activities", {
                "activity_name": activityName,
                "hourly_rate_gross": rate
            })

            fetchData()

        } catch (error) {
            console.error("Failed to add rate", error)
        }

        setIsAddPopupVisible(false);
    }

    const handleDeleteRate = async () => {
        console.log(`Deleting rate: ${selectedRate?.activity_name}`);

        try {
            await api.delete(`/api/v1/users/me/settings/activities/${selectedRate?.activity_id}`)

            setRates(rates.filter((rate) => rate.activity_id !== selectedRate?.activity_id));

            console.log("[INFO] Rate deleted successfully");
        } catch (error) {
            console.error("Failed to delete rate", error);
        }

        setIsDeletePopupVisible(false);
    }

    if (!user) return null;

    return (
        <SafeScreenWrapper>
            <ScrollView className={"bg-secondary-50"}>

                {/* Header Section */}
                <HeaderThemed/>

                {/* Profile Section */}
                <View className={"mt-10"}>
                    <ProfileInfo
                        fullName={user.last_name + " " + user.first_name}
                        role={user.role}
                        companyName={user.company_name}
                        isOwnCompany={user.is_own_company}
                    />
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
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className={"font-semibold text-lg"}>Tarife Orare</Text>
                        <TouchableOpacity onPress={() => setIsAddPopupVisible(true)} className="p-1">
                            <Plus size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {rates.map((rate) => (
                        <HourlyRateCard
                            key={rate.activity_id}
                            title={rate.activity_name}
                            subtitle={""}
                            price={rate.hourly_rate_gross.toString() + " RON"}
                            unitLabel={"per Oră"}
                            onPress={() => handleRatePress(rate)}
                            onLongPress={() => handleRateLongPress(rate)}
                        />
                    ))}
                </View>

                {/* LogOut Section */}
                <View className={"my-10 mx-5"}>
                    <ButtonThemed title={"Deconectare"} onPress={logout} height={"h-12"}/>
                </View>

                {/* Footer Section */}
                <FooterThemed />
            </ScrollView>

            {/* Popup for Editing */}
            <PopupEdit
                visible={isEditPopupVisible}
                title={`Editează Tariful Orar - ${selectedRate?.activity_name || ''}`}
                initialValue={selectedRate?.hourly_rate_gross.toString() || ''}
                onSave={handleSaveRate}
                onCancel={() => setIsEditPopupVisible(false)}
            />

            {/* Popup for Adding */}
            <PopupAddRate
                visible={isAddPopupVisible}
                onSave={handleAddRate}
                onCancel={() => setIsAddPopupVisible(false)}
            />

            {/* Delete Popup */}
            <DeletePopupThemed
                visible={isDeletePopupVisible}
                onCancel={() => setIsDeletePopupVisible(false)}
                onConfirm={handleDeleteRate}
            />
        </SafeScreenWrapper>
    )
}
