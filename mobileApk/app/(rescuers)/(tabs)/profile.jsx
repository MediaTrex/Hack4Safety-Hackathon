import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// Replace these icons with your icon library (e.g. @expo/vector-icons)
// Example: import { Feather, Ionicons } from '@expo/vector-icons';

const ChevronRight = () => (
    <Text className="text-gray-400 text-lg font-light">›</Text>
);

function Avatar({ uri, size = 52 }) {
    if (uri) {
        return (
            <Image
                source={{ uri }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
                className="bg-gray-200"
            />
        );
    }
    return (
        <View
            style={{ width: size, height: size, borderRadius: size / 2 }}
            className="bg-blue-100 items-center justify-center overflow-hidden"
        >
            {/* Head */}
            <View
                className="bg-blue-400 rounded-full absolute"
                style={{
                    width: size * 0.38,
                    height: size * 0.38,
                    top: size * 0.14,
                }}
            />
            {/* Body / shoulders */}
            <View
                className="bg-blue-400 rounded-t-full absolute bottom-0"
                style={{ width: size * 0.72, height: size * 0.38 }}
            />
        </View>
    );
}

const MenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center justify-between py-4 px-5"
    >
        <View className="flex-row items-center gap-4">
            <View className="w-8 items-center">{icon}</View>
            <Text className="text-gray-700 text-[18px] font-normal">
                {label}
            </Text>
        </View>
        <ChevronRight />
    </TouchableOpacity>
);

const Divider = () => <View className="h-px bg-gray-300 mx-5" />;

export default function ProfileScreen() {
    let { saveUser, user: u } = useAuth();
    // Replace with your actual user data / auth context
    let user = {
        name: u?.full_name || "Inspector Sharma",
        office: "Butwal Police Office",
        email: u?.email || "inspector.sharma@butwalpd.gov.np",
        team: "Team Alpha",
        unit: "Butwal Rescue Unit 3",
        avatarUri: null, // Replace with a real URI, e.g. user.photoURL
    };

    const handleLogout = async () => {
        // TODO: wire up your auth logout
        console.log("Logout pressed");
        saveUser(null);
        await AsyncStorage.removeItem("token");
        router.replace("/");
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "white",
            }}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header / User identity ── */}
                <View className="bg-gray-50 px-5 pt-8 pb-5">
                    {/* Avatar */}
                    <Avatar size={75} />

                    {/* Name & office */}
                    <Text className="text-[25px] font-bold text-gray-900 leading-tight">
                        {user.name}
                    </Text>

                    <Text className="text-[13px] text-blue-500">
                        {user.email}
                    </Text>
                </View>

                {/* ── Team card ── */}
                <View className="mx-4 mb-5 shadow-sm  border border-gray-200 rounded-2xl">
                    <View className="p-4 bg-white rounded-2xl px-5 py-4 border border-gray-100">
                        <Text className="text-[18px] font-semibold text-gray-800">
                            {user.team}
                        </Text>
                        <Text className="text-[13px] text-gray-500 mt-0.5">
                            {user.unit}
                        </Text>
                    </View>
                </View>

                {/* ── Menu ── */}
                <View className="mx-4 bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
                    <MenuItem
                        icon={
                            <Text className="text-gray-500 text-[18px]">
                                👤
                            </Text>
                        }
                        label="My Profile"
                        onPress={() => console.log("My Profile")}
                    />
                    <Divider />
                    <MenuItem
                        icon={
                            <Text className="text-gray-500 text-[18px]">
                                📞
                            </Text>
                        }
                        label="Emergency Contacts"
                        onPress={() => console.log("Emergency Contacts")}
                    />
                    <Divider />
                    <MenuItem
                        icon={
                            <Text className="text-gray-500 text-[18px]">
                                ⚙️
                            </Text>
                        }
                        label="Settings"
                        onPress={() => console.log("Settings")}
                    />
                    <Divider />
                    <MenuItem
                        icon={
                            <Text className="text-gray-500 text-[18px]">
                                🛟
                            </Text>
                        }
                        label="Help & Support"
                        onPress={() => console.log("Help & Support")}
                    />
                </View>

                {/* ── Logout ── */}
                <View className="mx-4 mt-5 bg-white rounded-2xl shadow-sm border-2 border-red-200 overflow-hidden">
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.7}
                        className="flex-row items-center gap-4 py-4 px-5"
                    >
                        <Feather name="log-out" size={28} color="red" />
                        <Text className="text-red-600 text-[18px]">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
