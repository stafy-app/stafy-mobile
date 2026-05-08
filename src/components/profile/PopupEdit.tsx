// src/components/profile/PopupEdit.tsx

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

interface PopupEditProps {
    visible: boolean;
    title: string;
    placeholder?: string;
    initialValue?: string;
    onSave: (text: string) => void;
    onCancel: () => void;
}

export default function PopupEdit({
                                           visible,
                                           title,
                                           placeholder = "Scrie aici...",
                                           initialValue = "",
                                           onSave,
                                           onCancel
                                       }: PopupEditProps) {

    const [inputValue, setInputValue] = useState(initialValue);

    useEffect(() => {
        if (visible) {
            setInputValue(initialValue);
        }
    }, [visible, initialValue]);

    const handleSave = () => {
        onSave(inputValue);
        setInputValue(''); // Clean the state
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
                            {title}
                        </Text>

                        <TextInput
                            className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 text-base text-secondary-900 mb-6"
                            placeholder={placeholder}
                            placeholderTextColor="#94a3b8"
                            value={inputValue}
                            onChangeText={setInputValue}
                            autoFocus={true}
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
                                <Text className="text-white font-bold text-base">Salvare</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}