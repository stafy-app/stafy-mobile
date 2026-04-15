// src/components/DropdownThemed.tsx

import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useState } from 'react';

interface Option {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
}

export default function CustomDropdown({
                                           options,
                                           value,
                                           onSelect,
                                           placeholder = "Selectează o opțiune",
                                           icon
                                       }: CustomDropdownProps) {
    // Set if is open or not
    const [isOpen, setIsOpen] = useState(false);

    // Find the value of the selected option
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <View className="w-full py-2">

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsOpen(true)}
                className={`flex-row items-center justify-between w-full bg-white rounded-lg px-4 h-14 border ${
                    isOpen ? 'border-primary-500' : 'border-secondary-200'
                }`}
            >
                <View className="flex-row items-center flex-1">
                    {icon && <View className="mr-3">{icon}</View>}
                    <Text className={`text-base ${selectedOption ? 'text-secondary-900' : 'text-secondary-500'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </Text>
                </View>
                <ChevronDown color={isOpen ? "#F77518" : "#94a3b8"} size={20} />
            </TouchableOpacity>

            {/* 2. Fereastra (Modalul) care apare peste tot ecranul când dai click */}
            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
            >
                {/* Fundalul întunecat care închide modalul dacă apeși pe el */}
                <Pressable
                    className="flex-1 bg-black/40 justify-center px-6"
                    onPress={() => setIsOpen(false)}
                >
                    {/* Cutiuta albă din centru cu lista de opțiuni */}
                    <View className="bg-white rounded-2xl max-h-[60%] overflow-hidden">
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => {
                                const isSelected = item.value === value;
                                return (
                                    <TouchableOpacity
                                        className={`flex-row items-center justify-between p-4 border-b border-secondary-100 ${
                                            isSelected ? 'bg-primary-50' : 'bg-white'
                                        }`}
                                        onPress={() => {
                                            onSelect(item.value);
                                            setIsOpen(false); // Închidem lista după ce a ales
                                        }}
                                    >
                                        <Text className={`text-base ${isSelected ? 'text-primary-600 font-bold' : 'text-secondary-900'}`}>
                                            {item.label}
                                        </Text>
                                        {isSelected && <Check color="#F77518" size={20} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}