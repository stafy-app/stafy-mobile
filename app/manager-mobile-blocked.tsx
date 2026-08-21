// app/manager-mobile-blocked.tsx

import {Text} from "react-native";
import {router} from "expo-router";

import StafyLogoBlock from "@/src/components/ui/StafyLogoBlock";
import ButtonThemed from "@/src/components/ui/ButtonThemed";
import SafeScreenWrapper from "@/src/components/ui/SafeScreenWrapper";
import useUser from "@/src/hooks/useUser";

export default function ManagerMobileBlocked() {

    const {logout} = useUser();

    // logout() only navigates back to /login as a side effect of Firebase's
    // onAuthStateChanged — which never fires if this screen was reached from
    // the register wizard's role step (no Firebase session exists yet there).
    // Navigate explicitly so the button works from both entry points.
    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <SafeScreenWrapper className={"items-center justify-center px-6"}>

            <StafyLogoBlock width={102} height={102}/>

            <Text className={"text-secondary-900 text-2xl font-bold text-center mt-8 mb-4"}>
                Varianta mobilă e încă în lucru
            </Text>

            <Text className={"text-secondary-500 text-base text-center mb-4"}>
                Contul tău de manager nu este încă disponibil în această aplicație. Revino mai târziu.
            </Text>

            <Text className={"text-secondary-500 text-sm text-center mb-10"}>
                Dacă încerci să îți creezi un cont de manager, te rugăm să o faci din aplicația web, nu din aplicația mobilă.
            </Text>

            <ButtonThemed title={"Deconectare"} onPress={handleLogout}/>

        </SafeScreenWrapper>
    );
}
