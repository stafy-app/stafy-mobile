// src/components/PopupThemed.tsx

import {View, Text, Modal, TouchableOpacity} from 'react-native';
import ButtonThemed from "./ButtonThemed";

interface CustomPopupProps {
    visible: boolean;
    title: string;
    message: string;
    buttonText?: string;
    onClose: () => void;
}

export default function CustomPopup({
                                        visible,
                                        title,
                                        message,
                                        buttonText = "OK",
                                        onClose
                                    }: CustomPopupProps) {

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >

            <View className="flex-1 bg-black/50 justify-center items-center px-6">


                <View className="bg-secondary-50 w-full rounded-2xl p-6 items-center shadow-lg">

                    <Text className="text-2xl font-bold text-secondary-900 mb-2 text-center">
                        {title}
                    </Text>

                    <Text className="text-base text-secondary-600 text-center mb-8">
                        {message}
                    </Text>


                    <ButtonThemed onPress={onClose} title={buttonText}/>

                </View>
            </View>
        </Modal>
    );
}