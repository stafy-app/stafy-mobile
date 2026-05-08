// src/components/PopupThemed.tsx

import {View, Text, Modal} from 'react-native';
import ButtonThemed from "./ButtonThemed";

interface CustomPopupProps {
    visible: boolean;
    title: string;
    message: string;
    buttonText?: string;
    onClose?: () => void;
}



/**
 * Renders a themed modal popup with a title, message, and close button.
 *
 * The popup is displayed when the `visible` prop is true and uses a fade animation.
 * It shows a semi-transparent overlay behind the popup content and calls `onClose`
 * when the action button is pressed.
 *
 * @param visible - Controls whether the popup is displayed.
 * @param title - Title text displayed at the top of the popup.
 * @param message - Message text displayed inside the popup.
 * @param buttonText - Optional text for the action button. Defaults to `"OK"`.
 * @param onClose - Callback called when the popup action button is pressed.
 * @returns A themed modal popup component.
 */
export default function PopupThemed({
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