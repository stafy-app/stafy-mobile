// src/DeletePopupThemed.tsx


import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface DeletePopupProps {
    visible: boolean;
    title?: string;
    message?: string;
    cancelText?: string;
    confirmText?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

/**
 * Renders a themed modal popup specifically for destructive actions (Delete).
 *
 * It shows a semi-transparent overlay behind the popup content and provides
 * two distinct buttons: a neutral Cancel button and a red/destructive Confirm button.
 *
 * @param visible - Controls whether the popup is displayed.
 * @param title - Title text displayed at the top of the popup. Defaults to "Ești sigur?".
 * @param message - Message text displayed inside the popup.
 * @param cancelText - Text for the cancel button. Defaults to "Anulare".
 * @param confirmText - Text for the confirm/delete button. Defaults to "Șterge".
 * @param onCancel - Callback called when the cancel action is pressed or the modal is dismissed.
 * @param onConfirm - Callback called when the destructive/confirm action is pressed.
 */
export default function DeletePopupThemed({
                                              visible,
                                              title = "Ești sigur?",
                                              message = "Această acțiune este definitivă și nu poate fi anulată.",
                                              cancelText = "Anulare",
                                              confirmText = "Șterge",
                                              onCancel,
                                              onConfirm
                                          }: DeletePopupProps) {

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel} // For android: close the modal when back button is pressed
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">

                <View className="bg-secondary-50 w-full rounded-2xl p-6 items-center shadow-lg">

                    <Text className="text-2xl font-bold text-secondary-900 mb-2 text-center">
                        {title}
                    </Text>

                    <Text className="text-base text-secondary-600 text-center mb-8">
                        {message}
                    </Text>

                    {/* Row of Buttons (Cancel & Confirm)*/}
                    <View className="flex-row justify-between w-full gap-3">

                        {/*Cancel Button */}
                        <TouchableOpacity
                            onPress={onCancel}
                            activeOpacity={0.7}
                            className="flex-1 bg-secondary-200 py-3.5 rounded-xl items-center"
                        >
                            <Text className="text-secondary-800 font-bold text-base">
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        {/* Confirm Button */}
                        <TouchableOpacity
                            onPress={onConfirm}
                            activeOpacity={0.7}
                            className="flex-1 bg-rose-600 py-3.5 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-base">
                                {confirmText}
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </View>
        </Modal>
    );
}