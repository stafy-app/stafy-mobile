// src/components/dashboard/IncomingInvitationCard.tsx

import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from "react-native";
import {Building2, Check, X} from "lucide-react-native";
import {IncomingInvitation} from "@/src/types/api";

interface IncomingInvitationCardProps {
    invitation: IncomingInvitation;
    onAccept: (invitation: IncomingInvitation) => void;
    onReject: (invitation: IncomingInvitation) => void;
    isAccepting: boolean;
    isRejecting: boolean;
}

export default function IncomingInvitationCard({
                                                     invitation,
                                                     onAccept,
                                                     onReject,
                                                     isAccepting,
                                                     isRejecting,
                                                 }: IncomingInvitationCardProps) {

    const isBusy = isAccepting || isRejecting;

    return (
        <View className="bg-white shadow-md rounded-2xl p-5 mx-4 border border-primary-100">

            <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                    <Building2 size={20} color="#F77518"/>
                </View>
                <View className="flex-1">
                    <Text className="text-base font-bold text-secondary-900">
                        Invitație de la {invitation.manager_name}
                    </Text>
                    <Text className="text-xs text-secondary-500">
                        Alătură-te companiei {invitation.company_name}
                    </Text>
                </View>
            </View>

            <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                    disabled={isBusy}
                    activeOpacity={0.7}
                    onPress={() => onReject(invitation)}
                    className={`flex-1 bg-secondary-100 py-3 rounded-xl items-center justify-center flex-row gap-2 ${isBusy ? "opacity-50" : ""}`}
                >
                    {isRejecting ? (
                        <ActivityIndicator color="#57534e"/>
                    ) : (
                        <>
                            <X size={16} color="#57534e"/>
                            <Text className="text-secondary-700 font-semibold text-sm">Respinge</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={isBusy}
                    activeOpacity={0.7}
                    onPress={() => onAccept(invitation)}
                    className={`flex-1 bg-primary-500 py-3 rounded-xl items-center justify-center flex-row gap-2 ${isBusy ? "opacity-50" : ""}`}
                >
                    {isAccepting ? (
                        <ActivityIndicator color="white"/>
                    ) : (
                        <>
                            <Check size={16} color="white"/>
                            <Text className="text-white font-semibold text-sm">Acceptă</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

        </View>
    );
}
