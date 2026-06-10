import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Keyboard } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function CustomTabBarCitizen({
    state,
    descriptors,
    navigation,
}) {
    //hide tab on map screen
    const currentRoute = state.routes[state.index].name;

    if (currentRoute === "map") {
        return null;
    }

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
        home: "home",
        map: "map-outline",
        alerts: "notifications-outline",
        helpline: "call-outline",
    };

    const renderTab = (routeName) => {
        const route = state.routes.find((r) => r.name === routeName);

        const focused = state.routes[state.index].name === routeName;

        return (
            <TouchableOpacity
                key={route.key}
                className="flex-1 items-center justify-center"
                onPress={() => navigation.navigate(routeName)}
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
                >
                    {routeName === "helpline"
                        ? "Helpline"
                        : routeName.charAt(0).toUpperCase() +
                          routeName.slice(1)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="absolute left-2 right-2 bottom-4">
            <View
                className="h-18.75 bg-white rounded-[28px] flex-row items-center"
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
                    {renderTab("home")}
                    {renderTab("map")}
                </View>

                {/* SPACE FOR SOS */}
                <View className="w-22.5" />

                {/* RIGHT SIDE */}
                <View className="flex-1 flex-row">
                    {renderTab("alerts")}
                    {renderTab("helpline")}
                </View>

                {/* SOS BUTTON */}
                <View
                    className="absolute items-center"
                    style={{
                        left: "50%",
                        marginLeft: -33,
                        top: -18,
                    }}
                >
                    <View className="absolute w-22.5 h-22.5 rounded-full bg-white" />

                    <TouchableOpacity
                        className="w-18 h-18 rounded-full bg-red-500 items-center justify-center border-[5px] border-white"
                        onPress={() => navigation.navigate("sos")}
                    >
                        <Text className="text-white font-bold">SOS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
