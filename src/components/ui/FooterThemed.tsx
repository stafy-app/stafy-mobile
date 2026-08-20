// src/components/ui/FooterThemed.tsx

import React from 'react';
import { View, Text } from 'react-native';
import Constants from 'expo-constants';

interface FooterThemedProps {
    version?: string;
}

export default function FooterThemed({ version = `v${Constants.expoConfig?.version}` }: FooterThemedProps) {
    return (
        <View className="py-6 items-center justify-center w-full">
            <Text className="text-xs font-medium text-secondary-400 tracking-wider">
                Versiunea {version}
            </Text>
            <Text className="text-[10px] text-secondary-300 mt-1">© 2026 Stafy</Text>
        </View>
    );
}
