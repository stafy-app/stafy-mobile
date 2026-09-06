// app/complete-registration.tsx

import {View, Text, ScrollView, TouchableOpacity} from "react-native";
import {router} from "expo-router";

import {UserRound, Briefcase} from "lucide-react-native";

import StafyLogoBlock from "@/src/components/ui/StafyLogoBlock";
import TextInputThemed from "@/src/components/ui/TextInputThemed";
import ButtonThemed from "@/src/components/ui/ButtonThemed";
import SafeScreenWrapper from "@/src/components/ui/SafeScreenWrapper";

import {useEffect, useState} from "react";
import useUser from "@/src/hooks/useUser";
import {auth} from "@/src/services/firebase";
import isManagerMobileBlocked from "@/src/utils/isManagerMobileBlocked";

const NAME_MIN = 2;
const NAME_MAX = 30;

export default function CompleteRegistrationScreen() {

    const [role, setRole] = useState("");
    // "Nume" (family name) → backend last_name; "Prenume" (given name) →
    // first_name. Same mapping as register.tsx and stafy-web-app.
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {completeRegistration, logout} = useUser();

    // This screen only makes sense with an already-signed-in Firebase user
    // (reached via login()'s OrphanRegistrationError). Guard the direct-nav
    // edge case (deep link, stale bookmark) rather than crash on a null token.
    useEffect(() => {
        if (!auth.currentUser) {
            router.replace("/login");
        }
    }, []);

    const handleSubmit = async () => {
        if (!role) {
            setError("Alege rolul tău");
            return;
        }
        const ln = lastName.trim();
        const fn = firstName.trim();
        if (!ln || !fn) {
            setError("Completează numele și prenumele");
            return;
        }
        if (ln.length < NAME_MIN || fn.length < NAME_MIN) {
            setError(`Numele și prenumele trebuie să aibă minim ${NAME_MIN} caractere`);
            return;
        }
        if (ln.length > NAME_MAX || fn.length > NAME_MAX) {
            setError(`Numele și prenumele pot avea maxim ${NAME_MAX} de caractere`);
            return;
        }
        setError("");

        try {
            setIsLoading(true);

            if (await completeRegistration({firstName: fn, lastName: ln, role})) {
                if (isManagerMobileBlocked(role)) {
                    router.replace("/manager-mobile-blocked");
                } else {
                    router.replace("/attendance");
                }
            }

        } catch (e: any) {
            setError(e?.message ?? "Nu am putut finaliza înregistrarea");
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <SafeScreenWrapper>
            <ScrollView className={"flex-1 w-full bg-secondary-50"}
                        contentContainerClassName="py-8 px-6 items-center"
                        showsVerticalScrollIndicator={false}>

                <View className={"items-center"}>
                    <StafyLogoBlock width={90} height={90}/>
                </View>

                <View className={"items-center mt-4 mb-8"}>
                    <Text className={"text-secondary-900 text-3xl font-bold text-center"}>Mai sunt câțiva
                        pași</Text>
                    <Text className={"mt-4 text-base font-light text-secondary-500 text-center"}>
                        Contul tău a fost creat, dar înregistrarea nu s-a finalizat ultima dată. Completează
                        datele de mai jos ca să continui.
                    </Text>
                </View>

                <View className={"w-full"}>

                    <Text className={"text-secondary-900 font-semibold text-base mb-2"}>Datele tale</Text>

                    <TextInputThemed placeholder={"Nume"} className={"mb-2"}
                                     keyboardType={"default"}
                                     Icon={UserRound}
                                     value={lastName}
                                     onChangeText={setLastName}/>

                    <TextInputThemed placeholder={"Prenume"}
                                     keyboardType={"default"}
                                     Icon={UserRound}
                                     value={firstName}
                                     onChangeText={setFirstName}/>

                    <View className={"mt-8"}>
                        <Text className={"text-secondary-900 font-semibold text-base"}>Rolul tău</Text>
                        <Text className={"text-sm text-secondary-500 mt-1 mb-3"}>Alege una din variante ca să
                            continui.</Text>

                        <TouchableOpacity onPress={() => setRole("employee")} activeOpacity={0.7}
                                          className={`w-full flex-row items-center bg-white border-2 rounded-xl px-4 h-20 mb-3 ${
                                              role === "employee" ? "border-primary-500" : "border-secondary-200"
                                          }`}>
                            <UserRound size={28} className={"text-primary-500"}/>
                            <View className={"ml-4"}>
                                <Text className={"text-lg font-semibold text-secondary-900"}>Angajat</Text>
                                <Text className={"text-sm text-secondary-500"}>Îmi urmăresc orele lucrate</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setRole("manager")} activeOpacity={0.7}
                                          className={`w-full flex-row items-center bg-white border-2 rounded-xl px-4 h-20 ${
                                              role === "manager" ? "border-primary-500" : "border-secondary-200"
                                          }`}>
                            <Briefcase size={28} className={"text-primary-500"}/>
                            <View className={"ml-4"}>
                                <Text className={"text-lg font-semibold text-secondary-900"}>Manager</Text>
                                <Text className={"text-sm text-secondary-500"}>Îmi coordonez echipa</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {!!error && <Text className={"text-red-500 text-sm mt-4"}>{error}</Text>}

                    <ButtonThemed onPress={handleSubmit} isLoading={isLoading} title={"Continuă"}
                                  className={"mt-8"}/>

                    <TouchableOpacity onPress={handleLogout} className={"mt-8 items-center"}>
                        <Text className={"text-primary-500 text-base"}>Deconectează-te</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeScreenWrapper>
    )
}
