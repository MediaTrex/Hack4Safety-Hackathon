import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
    Feather,
    Ionicons,
    MaterialIcons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { router } from "expo-router";
import ScreenWrapper from "../../../components/ScreenWrapper";

export default function HomeScreen() {
    let { logoutCitizen } = useAuth();

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={{ flexGrow: 1 , }} showsVerticalScrollIndicator={false}>
                <View className="flex-1 bg-white">
                    {/* Header */}
                    <View className="px-5 pt-4">
                        <View className="flex-row items-center justify-end">
                            <View className="flex-row items-center gap-4">
                                <TouchableOpacity
                                    onPress={() => {
                                        logoutCitizen();
                                        router.replace("/");
                                    }}
                                >
                                    <Feather
                                        name="log-out"
                                        size={28}
                                        color="black"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Ionicons
                                        name="notifications-outline"
                                        size={28}
                                        color="#2563eb"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text className="border border-gray-400 px-3 py-2 rounded-lg">
                                        English
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Greeting */}
                        <View className="mt-7">
                            <Text className="text-black text-[17px] font-semibold">
                                Good Evening,
                            </Text>
                            <Text className="text-3xl font-bold text-gray-900">
                                Citizen
                            </Text>
                            <Text className="text-slate-700 mt-1">
                                How can we help you today?
                            </Text>
                        </View>

                        {/* SOS Card */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="bg-red-500 rounded-3xl mt-6 p-10 flex-row items-center shadow-[0_4px_8px_rgba(255,200,20,0.55)]"
                        >
                            <View className="w-26 h-26 rounded-full bg-red-400 items-center justify-center">
                                <MaterialCommunityIcons
                                    name="alarm-light-outline"
                                    size={50}
                                    color="white"
                                />
                            </View>

                            <View className="ml-5 gap-1">
                                <Text className="text-white text-5xl font-bold">
                                    SOS
                                </Text>
                                <Text className="text-white text-xl font-semibold">
                                    Emergency
                                </Text>
                                <Text className="text-red-100 text-base mt-1">
                                    Tap to send SOS alert
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Quick Actions */}
                        <View className="mt-8">
                            <Text className="text-xl font-bold text-gray-800 mb-4">
                                Quick Actions
                            </Text>

                            <View className="flex-row justify-between">
                                <QuickAction
                                    icon={
                                        <MaterialIcons
                                            name="report-problem"
                                            size={39}
                                            color="#2563eb"
                                        />
                                    }
                                    label="Report Incident"
                                    link='/(citizens)/report-incident'
                                />

                                <QuickAction
                                    icon={
                                        <Ionicons
                                            name="location"
                                            size={39}
                                            color="#16a34a"
                                        />
                                    }
                                    label="Live Disaster Map"
                                />

                                <QuickAction
                                    icon={
                                        <Ionicons
                                            name="home"
                                            size={39}
                                            color="#7c3aed"
                                        />
                                    }
                                    label="Nearby Shelters"
                                />

                                <QuickAction
                                    icon={
                                        <Feather
                                            name="phone-call"
                                            size={39}
                                            color="#dc2626"
                                        />
                                    }
                                    label="Emergency Contacts"
                                />
                            </View>
                        </View>

                        {/* Alerts */}
                        <View className="mt-8 mb-8">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-xl font-bold text-gray-800">
                                    Active Alerts Near You
                                </Text>

                                <TouchableOpacity>
                                    <Text className="text-blue-600 font-medium">
                                        View All
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Alert Card 1 */}
                            <View className="bg-white border border-gray-200 rounded-2xl p-4">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row">
                                        <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center">
                                            <MaterialCommunityIcons
                                                name="waves"
                                                size={26}
                                                color="#ef4444"
                                            />
                                        </View>

                                        <View className="ml-3">
                                            <Text className="font-semibold text-gray-800 text-xl">
                                                Flood Alert
                                            </Text>
                                            <Text className="text-gray-500 text-sm">
                                                Butwal, Rupandehi
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-red-500 text-xs font-medium">
                                        2 min ago
                                    </Text>
                                </View>

                                {/* Divider */}
                                <View className="h-px bg-gray-100 my-4" />

                                {/* Alert Card 2 */}
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row">
                                        <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center">
                                            <MaterialIcons
                                                name="warning-amber"
                                                size={26}
                                                color="#f97316"
                                            />
                                        </View>

                                        <View className="ml-3">
                                            <Text className="font-semibold text-gray-800  text-xl">
                                                Landslide Risk
                                            </Text>
                                            <Text className="text-gray-500 text-sm">
                                                Palpa, Tanahu
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-orange-500 text-xs font-medium">
                                        16 min ago
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

function QuickAction({ icon, label , link}) {
    return (
        <TouchableOpacity
            className="w-[22%] items-center border border-gray-200 rounded-2xl p-3 gap-2"
            activeOpacity={0.7}
            onPress={() => router.push(link)}
        >
            <View className=" items-center justify-center">{icon}</View>

            <Text
                className="text-center text-gray-700 text-xs mt-2 font-semibold"
                style={{ flexWrap: "wrap", overflow: "hidden" }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}
