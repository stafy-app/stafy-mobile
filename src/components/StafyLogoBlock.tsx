// src/components/StafyLogoBlock.tsx

import React from 'react';
import {View, Text} from "react-native";

import Stafy_Logo  from "../../src/assets/stafy_logo.svg"

type StafyLogoBlockProps = {
    width?: number;
    height?: number;
};

export default function StafyLogoBlock(
    {width=102, height=102}
) {

    return (
        <View className={"items-center"}>
            <Stafy_Logo width={width} height={height} className={"mb-3"}/>
            <Text className={"text-4xl font-bold text-primary-500 mb-4"}>Stafy</Text>
        </View>
    )
}