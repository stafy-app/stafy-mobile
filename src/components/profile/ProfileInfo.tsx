// src/components/profile/ProfileInfo.tsx


import React from 'react';
import {View, Text, Image} from "react-native";

interface ProfileInfoProps {
    fullName: string | undefined;
    role: string | undefined;
}


export default function ProfileInfo({fullName, role} : ProfileInfoProps) {


    const getInitials = (fullName: string | undefined) => {
        // @ts-ignore
        const names = fullName.trim().split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        // @ts-ignore
        return fullName.substring(0, 2).toUpperCase();
    };

    return (
        <View className={"w-full items-center"}>

            <View className={"flex-column items-center bg-white shadow-md rounded-lg w-[90%] py-5"}>
                <View className={"flex-column items-center"}>

                    {/*<Image source={{uri: "https://randomuser.me/api/portraits/men/32.jpg"}}*/}
                    {/*className={"w-25 h-25 rounded-full border-3 border-[#F77518]"}*/}
                    {/*       resizeMode="cover"/>*/}

                    <View className="w-28 h-28 rounded-full bg-primary-100 items-center justify-center border-4 border-white shadow-sm">
                        <Text className="text-primary-700 font-bold text-4xl">
                            {getInitials(fullName)}
                        </Text>
                    </View>

                    <Text className={"text-2xl font-bold mt-3"}>{fullName}</Text>
                    <Text className={"text-lg text-primary-500"}>{role}</Text>

                </View>
            </View>

        </View>
    )
}