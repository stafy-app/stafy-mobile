// src/components/attendance/CalculatorThemed.tsx


import {View, Text} from "react-native";
import {useState, useEffect} from "react";

import ButtonThemed from "@/src/components/ButtonThemed";


interface CalculatorThemedProps {
    time: number,
    rate: number,
    className?: string,
    onSubmit?: () => void
}

export default function CalculatorThemed({time, rate, className, onSubmit}: CalculatorThemedProps) {

    const [total, setTotal] = useState<number>(0)
    
    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit();
        }
    }
    

    useEffect(() => {
        if (time > 0 && rate > 0) {
            setTotal(time * rate);
        } else {
            setTotal(0);
        }
    }, [time, rate]);

    // console.log("Rate: ", rate)
    // console.log("Time: ", time)
    // console.log("Total: ", total)

    return (
        <View className={"w-full bg-white/80 h-19"}>
            <View className={`${className}`}>
                <View className={"py-2 flex-row justify-between items-center"}>

                    <Text className={"text-secondary-500 font-semibold text-sm"}>Calcul Estimativ</Text>
                    <Text className={"text-secondary-900 font-bold text-sm"}>{time}h x {rate}RON =
                        <Text className={"text-primary-500"}> {total}RON</Text>
                    </Text>

                </View>

                <ButtonThemed onPress={handleSubmit} title={"Salvează"} height={"h-10"} className={"mt-2"}/>
            </View>
        </View>
    )
}
