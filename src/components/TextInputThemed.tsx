// src/components/TextInputThemed.tsx

import {View, TextInput, Text, KeyboardTypeOptions} from 'react-native';
import {Mail} from 'lucide-react-native';
import {useState} from 'react';

type TextInputThemedProps = {
    Icon?: any;
    IconSize?: number;
    placeholder?: string;
    text?: string;
    keyboardType?: KeyboardTypeOptions;
    className?: string;
    isPassword?: boolean;
    value?: string;
    onChangeText?: (text: string) => void;
};

export default function TextInputThemed({
                                            Icon = Mail,
                                            IconSize = 24,
                                            placeholder = 'Email',
                                            text = '',
                                            keyboardType = 'default',
                                            className = '',
                                            isPassword = false,
                                            value = '',
                                            onChangeText = () => null,
                                        }: TextInputThemedProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className={`w-full ${className}`}>
            <Text className="mb-2 font-semibold text-base">{text}</Text>

            <View
                className={`flex-row items-center w-full bg-white border rounded-xl px-4 h-14 ${
                    isFocused ? 'border-primary-500' : 'border-secondary-200'
                }`}
            >
                <Icon size={IconSize} className="text-secondary-500"/>
                <TextInput
                    className="flex-1 ml-3 py-3 text-base text-secondary-900 outline-none"
                    placeholder={placeholder}
                    placeholderTextColor="#6B7280"
                    keyboardType={keyboardType}
                    secureTextEntry={isPassword}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>
        </View>
    );
}