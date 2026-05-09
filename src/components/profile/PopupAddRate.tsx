// src/components/profile/PopupAddRate.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

interface PopupAddRateProps {
    visible: boolean;
    onSave: (activityName: string, rate: string) => void;
    onCancel: () => void;
}

export default function PopupAddRate({
                                           visible,
                                           onSave,
                                           onCancel
                                       }: PopupAddRateProps) {

    const [activityName, setActivityName] = useState("");
    const [rate, setRate] = useState("");

    useEffect(() => {
        if (visible) {
            setActivityName("");
            setRate("");
        }
    }, [visible]);

    const handleSave = () => {
        onSave(activityName, rate);
        setActivityName(''); 
        setRate('');
    };

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onCancel}
        >
            {/* Protection against keyboard */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-5">

                    <View className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">

                        <Text className="text-xl font-bold text-secondary-900 mb-4">
                            Adaugă Tarif Nou
                        </Text>

                        <Text className="text-sm font-semibold text-secondary-600 mb-1 ml-1">Nume Activitate</Text>
                        <TextInput
                            className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 text-base text-secondary-900 mb-4"
                            placeholder="ex: Design UI/UX"
                            placeholderTextColor="#94a3b8"
                            value={activityName}
                            onChangeText={setActivityName}
                            autoFocus={true}
                        />

                        <Text className="text-sm font-semibold text-secondary-600 mb-1 ml-1">Tarif (RON/Oră)</Text>
                        <TextInput
                            className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 text-base text-secondary-900 mb-6"
                            placeholder="ex: 150"
                            placeholderTextColor="#94a3b8"
                            value={rate}
                            onChangeText={setRate}
                            keyboardType="numeric"
                        />

                        {/* Actions Button*/}
                        <View className="flex-row justify-end gap-3">
                            <TouchableOpacity
                                onPress={onCancel}
                                activeOpacity={0.7}
                                className="px-5 py-3 rounded-xl bg-secondary-100"
                            >
                                <Text className="text-secondary-600 font-bold text-base">Anulare</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSave}
                                activeOpacity={0.7}
                                className="px-5 py-3 rounded-xl bg-primary-500"
                            >
                                <Text className="text-white font-bold text-base">Adaugă</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
