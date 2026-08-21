// app/register.tsx

import {View, Text, Alert, ScrollView, TouchableOpacity, Animated, Easing} from "react-native";
import {Link, router} from "expo-router";

import {Lock, UserRound, Mail, Briefcase, ChevronLeft} from "lucide-react-native";

import StafyLogoBlock from "@/src/components/ui/StafyLogoBlock";
import TextInputThemed from "@/src/components/ui/TextInputThemed";
import ButtonThemed from "@/src/components/ui/ButtonThemed";
import PopupThemed from "@/src/components/ui/PopupThemed";
import SafeScreenWrapper from "@/src/components/ui/SafeScreenWrapper";

import {useEffect, useRef, useState} from "react";
import useUser from "@/src/hooks/useUser";
import isManagerMobileBlocked from "@/src/utils/isManagerMobileBlocked";

const STEPS = ["role", "identity", "account"] as const;
type Step = typeof STEPS[number];

export default function RegisterScreen() {

    const [stepIndex, setStepIndex] = useState(-1); // -1 = welcome screen, 0..2 = STEPS

    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [stepError, setStepError] = useState("");

    const [registerOk, setRegisterOk] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {register} = useUser();

    const currentStep: Step | "welcome" = stepIndex === -1 ? "welcome" : STEPS[stepIndex];

    // Slow, subtle float loop for the decorative background blobs — purely
    // cosmetic, runs once for the lifetime of the screen (not per-step).
    const blobFloat1 = useRef(new Animated.Value(0)).current;
    const blobFloat2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const float = (anim: Animated.Value, duration: number) => Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
                Animated.timing(anim, {toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
            ])
        );

        const loop1 = float(blobFloat1, 6000);
        const loop2 = float(blobFloat2, 7500);
        loop1.start();
        loop2.start();

        return () => {
            loop1.stop();
            loop2.stop();
        };
    }, []);

    const blob1TranslateY = blobFloat1.interpolate({inputRange: [0, 1], outputRange: [0, -26]});
    const blob2TranslateY = blobFloat2.interpolate({inputRange: [0, 1], outputRange: [0, 22]});

    // Fade + slide-up whenever the step changes, so moving between screens
    // doesn't feel like an instant hard cut.
    const stepFade = useRef(new Animated.Value(0)).current;
    const stepSlide = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        stepFade.setValue(0);
        stepSlide.setValue(16);
        Animated.parallel([
            Animated.timing(stepFade, {toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true}),
            Animated.timing(stepSlide, {toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true}),
        ]).start();
    }, [stepIndex]);

    const goBack = () => setStepIndex((i) => Math.max(-1, i - 1));

    const selectRole = (selected: string) => {
        setRole(selected);

        if (isManagerMobileBlocked(selected)) {
            router.replace("/manager-mobile-blocked");
            return;
        }

        setStepIndex(1); // "identity"
    };

    const handleContinueIdentity = () => {
        if (!name.trim() || !surname.trim()) {
            setStepError("Completează numele și prenumele");
            return;
        }
        setStepError("");
        setStepIndex(2); // "account"
    };

    const handleRegister = async () => {

        if (!email.trim() || !email.includes("@")) {
            setStepError("Introdu o adresă de email validă");
            return;
        }
        if (password.length < 6) {
            setStepError("Parola trebuie să aibă minim 6 caractere");
            return;
        }
        if (password !== confirmPassword) {
            setStepError("Parolele nu coincid");
            return;
        }
        setStepError("");

        try {
            setIsLoading(true);

            const registerData = {
                name: name,
                surname: surname,
                email: email,
                role: role,
                password: password,
            }

            if (await register(registerData)) {
                setRegisterOk(true);
            }

        } catch (e: any) {
            Alert.alert("Eroare", e?.message ?? "Nu am putut crea contul");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeScreenWrapper>

            <Animated.View pointerEvents={"none"}
                           className={"absolute -top-10 -right-16 h-56 w-56 rounded-full bg-primary-100 opacity-60"}
                           style={{transform: [{translateY: blob1TranslateY}]}}/>
            <Animated.View pointerEvents={"none"}
                           className={"absolute -bottom-16 -left-20 h-64 w-64 rounded-full bg-secondary-100 opacity-60"}
                           style={{transform: [{translateY: blob2TranslateY}]}}/>

            <ScrollView className={"flex-1 w-full bg-transparent"}
                        contentContainerClassName={`py-8 px-6 items-center ${currentStep === "welcome" ? "flex-1 justify-center" : ""}`}
                        showsVerticalScrollIndicator={false}>

                <Animated.View className={"w-full items-center"}
                               style={{opacity: stepFade, transform: [{translateY: stepSlide}]}}>

                {currentStep !== "welcome" && (
                    <View className={"w-full flex-row items-center justify-between mb-6"}>
                        <TouchableOpacity onPress={goBack} className={"p-2 -ml-2"}>
                            <ChevronLeft size={26} className={"text-secondary-900"}/>
                        </TouchableOpacity>

                        <View className={"flex-row gap-2"}>
                            {STEPS.map((step, i) => (
                                <View key={step}
                                      className={`h-2 w-2 rounded-full ${i === stepIndex ? "bg-primary-500" : "bg-secondary-200"}`}/>
                            ))}
                        </View>

                        <View className={"w-10"}/>
                    </View>
                )}

                {currentStep === "welcome" && (
                    <View className={"w-full items-center justify-center"}>
                        <View className={"items-center"}>
                            <StafyLogoBlock width={112} height={112}/>
                        </View>

                        <View className={"items-center mt-12"}>
                            <Text className={"text-secondary-900 text-4xl font-bold"}>Bine ai venit</Text>
                            <Text className={"mt-5 text-lg font-light text-secondary-500 text-center px-2"}>
                                Alătură-te comunității Stafy și găsește cele mai bune oportunități.
                            </Text>
                        </View>

                        <ButtonThemed onPress={() => setStepIndex(0)} title={"Începe"} className={"w-full mt-14"}/>

                        <View className={"flex-row items-center justify-center mt-12"}>
                            <Text className={"text-base"}> Ai deja cont? </Text>
                            <Link href={"/login"} className={"text-primary-500 text-base"}>Autentifică-te acum</Link>
                        </View>
                    </View>
                )}

                {currentStep === "role" && (
                    <View className={"w-full"}>
                        <Text className={"text-secondary-900 text-3xl font-bold mb-2"}>Care este rolul tău?</Text>
                        <Text className={"text-base font-light text-secondary-500 mb-8"}>
                            Alege ce descrie cel mai bine activitatea ta.
                        </Text>

                        <TouchableOpacity onPress={() => selectRole("employee")} activeOpacity={0.7}
                                          className={"w-full flex-row items-center bg-white border-2 border-secondary-200 rounded-xl px-4 h-20 mb-4"}>
                            <UserRound size={28} className={"text-primary-500"}/>
                            <View className={"ml-4"}>
                                <Text className={"text-lg font-semibold text-secondary-900"}>Angajat</Text>
                                <Text className={"text-sm text-secondary-500"}>Îmi urmăresc orele lucrate</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => selectRole("manager")} activeOpacity={0.7}
                                          className={"w-full flex-row items-center bg-white border-2 border-secondary-200 rounded-xl px-4 h-20"}>
                            <Briefcase size={28} className={"text-primary-500"}/>
                            <View className={"ml-4"}>
                                <Text className={"text-lg font-semibold text-secondary-900"}>Manager</Text>
                                <Text className={"text-sm text-secondary-500"}>Îmi coordonez echipa</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {currentStep === "identity" && (
                    <View className={"w-full"}>
                        <Text className={"text-secondary-900 text-3xl font-bold mb-2"}>Cum te numești?</Text>
                        <Text className={"text-base font-light text-secondary-500 mb-8"}>
                            Așa te vor vedea colegii și managerul tău în aplicație.
                        </Text>

                        <TextInputThemed placeholder={"Nume"} className={"mb-4"}
                                         keyboardType={"default"}
                                         Icon={UserRound}
                                         value={name}
                                         onChangeText={setName}/>

                        <TextInputThemed placeholder={"Prenume"} className={"mb-4"}
                                         keyboardType={"default"}
                                         Icon={UserRound}
                                         value={surname}
                                         onChangeText={setSurname}/>

                        {!!stepError && <Text className={"text-red-500 text-sm mb-2"}>{stepError}</Text>}

                        <ButtonThemed onPress={handleContinueIdentity} title={"Continuă"} className={"mt-6"}/>
                    </View>
                )}

                {currentStep === "account" && (
                    <View className={"w-full"}>
                        <Text className={"text-secondary-900 text-3xl font-bold mb-2"}>Creează-ți contul</Text>
                        <Text className={"text-base font-light text-secondary-500 mb-8"}>
                            Ultimul pas — ai nevoie de acestea ca să te autentifici data viitoare.
                        </Text>

                        <TextInputThemed placeholder={"Email"} className={"mb-4"}
                                         keyboardType={"email-address"}
                                         Icon={Mail}
                                         value={email}
                                         onChangeText={setEmail}/>

                        <TextInputThemed isPassword={true} placeholder={"Parolă"} className={"mb-4"} Icon={Lock}
                                         value={password}
                                         onChangeText={setPassword}/>

                        <TextInputThemed isPassword={true} placeholder={"Confirmă parola"} Icon={Lock}
                                         value={confirmPassword}
                                         onChangeText={setConfirmPassword}/>

                        {!!stepError && <Text className={"text-red-500 text-sm mt-4"}>{stepError}</Text>}

                        <ButtonThemed onPress={handleRegister} isLoading={isLoading} title={"Crează contul"}
                                      className={"mt-6"}/>
                    </View>
                )}

                </Animated.View>

                <PopupThemed visible={registerOk} title={"Cont creat cu succes!"}
                             message={"Mergi la pagina de autentificare"}
                             buttonText={"Autentificare"} onClose={() => {
                    setRegisterOk(false);
                    router.replace("/login");
                }}/>

            </ScrollView>
        </SafeScreenWrapper>
    )
}
