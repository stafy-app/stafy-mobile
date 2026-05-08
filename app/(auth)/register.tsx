// app/register.tsx

import {View, Text, Alert, ScrollView} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Link, router} from "expo-router";

import {Lock, UserRound, Phone, Briefcase} from "lucide-react-native";

import StafyLogoBlock from "../../src/components/StafyLogoBlock";
import TextInputThemed from "../../src/components/TextInputThemed";
import ButtonThemed from "../../src/components/ButtonThemed";
import DropdownThemed from "../../src/components/DropdownThemed";
import PopupThemed from "../../src/components/PopupThemed";
import SafeScreenWrapper from "../../src/components/SafeScreenWrapper";

import {useState} from "react";
import useUser from "@/src/hooks/useUser";

export default function RegisterScreen() {

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("")
    const [password, setPassword] = useState("");

    const [registerOk, setRegisterOk] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const {register} = useUser();

    const roleOptions = [
        {label: 'Angajat', value: 'employee'},
        {label: 'Manager', value: 'manager'},
    ];


    const handleRegister = async () => {
        //console.log("Login");
        // console.log(email);

        try {

            setIsLoading(true);

            // create data
            const registerData = {
                name: name,
                surname: surname,
                email: email,
                phone: phone,
                role: role,
                password: password,
            }

            // call the register function
            if (await register(registerData)) {
                setRegisterOk(true);
            }

        } catch (e) {
            console.log(e);
            Alert.alert("Eroare", "Email sau parola incorecte");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <SafeScreenWrapper>
            <ScrollView className={"flex-1 w-full bg-secondary-50 "}
                        contentContainerClassName="py-8 px-6 items-center"
                        showsVerticalScrollIndicator={false}>

                {/* Logo Section */}
                <View className={"items-center"}>
                    <StafyLogoBlock width={102} height={102}/>
                </View>

                {/* HeaderThemed Section */}
                <View className={"items-center"}>
                    <Text className={"text-secondary-900 text-4xl font-bold"}>Creeaza cont</Text>
                    <Text className={"mt-4 mb-4 text-lg font-light text-secondary-500"}>Alătură-te comunității Stafy și
                        găsește cele
                        mai bune oportunități.</Text>
                </View>

                {/* Form Section */}
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

                <TextInputThemed placeholder={"Email"} className={"mb-4"}
                                 keyboardType={"email-address"}
                                 value={email}
                                 onChangeText={setEmail}/>

                <TextInputThemed placeholder={"Telefon"} className={"mb-4"}
                                 keyboardType={"number-pad"}
                                 Icon={Phone}
                                 value={phone}
                                 onChangeText={setPhone}/>

                <DropdownThemed placeholder={"Rol"} options={roleOptions}
                                value={role} onSelect={setRole}
                                icon={<Briefcase color="#64748b" size={24}/>}/>

                <TextInputThemed isPassword={true} placeholder={"Password"} Icon={Lock}
                                 value={password}
                                 onChangeText={setPassword}/>

                <ButtonThemed onPress={handleRegister} isLoading={isLoading} title={"Crează contul"}
                              className={"mt-10"}/>

                <View className={"flex-row items-center justify-center mt-10"}>
                    <Text className={"text-base"}> Nu ai cont? </Text>
                    <Link href={"/login"} className={"text-primary-500 text-base"}>Autentifică-te acum</Link>
                </View>

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