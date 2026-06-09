import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

const TAB_BAR_HEIGHT = 75;

export default function ScreenWrapper({
    children,
    bg = "bg-white",
    className = "",
}) {
    const insets = useSafeAreaInsets();

    // Bottom padding = tab bar height + home indicator (bottom inset on iPhone/gesture nav on Android)
    const bottomPadding = TAB_BAR_HEIGHT + insets.bottom;

    return (
        <View
            className={`flex-1 ${className}`}
            style={{ paddingBottom: bottomPadding }}
        >
            {children}
        </View>
    );
}
