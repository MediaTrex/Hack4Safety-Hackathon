import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Keyboard } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function CustomTabBarCitizen({
    state,
    descriptors,
    navigation,
}) {
    //hide tab on map screen
    // const currentRoute = state.routes[state.index].name;

    // if (currentRoute === "map") {
    //     return null;
    // }

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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

    if (isKeyboardVisible) return null;

    const icons = {
        dashboard: "home",
        operations: "map-outline",
        helpline: "call-outline",
        profile: "notifications-outline",
    };

    const renderTab = (routeName) => {
        const route = state.routes.find((r) => r.name === routeName);

        const focused = state.routes[state.index].name === routeName;

        return (
            <TouchableOpacity
                className="flex-1 items-center justify-center"
                onPress={() => navigation.navigate(routeName)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={icons[routeName]}
                    size={26}
                    color={focused ? "#2458E8" : "#9CA3AF"}
                />

                <Text
                    className={`text-[11px] mt-1 ${
                        focused
                            ? "text-blue-600 font-semibold"
                            : "text-gray-400"
                    }`}
                    style={{ textTransform: "capitalize" }}
                >
                    {routeName}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="absolute left-2 right-2 bottom-4">
            <View
                className="h-18.75 bg-white rounded-[28px] flex-row items-center justify-between"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                    elevation: 10,
                }}
            >
                {/* LEFT SIDE */}
                <View className="flex-1 flex-row">
                    {renderTab("dashboard")}
                    {renderTab("operations")}
                </View>

                {/* RIGHT SIDE */}
                <View className="flex-1 flex-row">
                    {renderTab("helpline")}
                    {renderTab("profile")}
                </View>
            </View>
        </View>
    );
}
