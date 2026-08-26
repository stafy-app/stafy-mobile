// app/tests.tsx

// Dev-only screen — not part of the product. Reached via a __DEV__-gated
// link on the Profile tab. Guarded below so it renders nothing in
// production even if someone deep-links to it.

import {View, Text} from "react-native";
import {Redirect} from "expo-router";
import * as Sentry from "@sentry/react-native";
import SafeScreenWrapper from "@/src/components/ui/SafeScreenWrapper";
import ButtonThemed from "@/src/components/ui/ButtonThemed";

export default function TestsScreen() {
    if (!__DEV__) return <Redirect href="/"/>;

    return (
        <SafeScreenWrapper>
            <View className={"flex-1 items-center justify-center gap-4 px-8"}>
                <Text className={"font-semibold text-lg"}>Sentry test</Text>

                <ButtonThemed
                    title={"Trigger Sentry test error"}
                    variant={""}
                    onPress={() => {
                        const eventId = Sentry.captureException(new Error("Sentry test error (TestsScreen)"));
                        console.log("Sentry event id:", eventId);
                    }}
                />
            </View>
        </SafeScreenWrapper>
    )
}
