import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { Keyboard } from "react-native";
import { useEffect, useState } from "react";

const TAB_BAR_HEIGHT = 75;

export default function ScreenWrapper({
    children,
    className = "",
}) {
    const insets = useSafeAreaInsets();

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () =>
            setKeyboardVisible(true),
        );
        const hideSub = Keyboard.addListener("keyboardDidHide", () =>
            setKeyboardVisible(false),
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // Bottom padding = tab bar height + home indicator (bottom inset on iPhone/gesture nav on Android)
    const bottomPadding = TAB_BAR_HEIGHT + insets.bottom;

    return (
        <View
            style={{
                flex: 1,
                paddingBottom: keyboardVisible
                    ? 0
                    : TAB_BAR_HEIGHT + insets.bottom,
            }}
        >
            {children}
        </View>
    );
}
