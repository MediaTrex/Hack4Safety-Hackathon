import { View, Text, Touchable, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Home() {
    let { saveUser, user } = useAuth();
    const [ready, setReady] = useState(false);

    const checkStart = async () => {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        if (hasLaunched === null) {
            router.replace("/getting-started");
        }
    };

    useEffect(() => {
        checkStart();
        if (user?.role === "citizen") router.replace("/(citizens)/home");
        if (user?.role === "rescuers") router.replace("/(rescuers)/dashboard");
        setReady(true);
    }, [user]);

    if (!ready) return null;

    return (
        <View className="bg-white p-4 flex-1">
            <View className="mt-38 mb-15 gap-3">
                <Text className="text-center text-4xl font-bold text-[#0A2E6B]">
                    Choose Your Role
                </Text>
                <Text className="text-center text-[18px] text-slate-700">
                    Select the option that best describes you to continue
                </Text>
            </View>
            <View className="gap-8">
                <View className="w-full p-6  rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.15)] gap-5">
                    <View className="flex-row items-center gap-2">
                        <View className="w-22 h-22 rounded-full bg-[#EAF2FF] justify-center items-center mr-3">
                            <Ionicons name="people" size={44} color="#1E6BFF" />
                        </View>

                        <View className="gap-2">
                            <Text className="font-semibold text-[20px] text-[#0A2E6B]">
                                I am a Citizen
                            </Text>
                            <Text className="text-[16px] text-slate-700 text-wrap max-w-[85%]">
                                Report incidents, send SOS alerts, view live
                                updates and get help.
                            </Text>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity
                            className="flex-row items-center justify-end"
                            onPress={() => {
                                saveUser({ role: "citizen" });
                                router.replace("/(citizens)/home");
                            }}
                        >
                            <Ionicons
                                name="arrow-forward-circle"
                                size={35}
                                color="#1E6BFF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="w-full p-6  rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.15)] gap-5">
                    <View className="flex-row items-center gap-1">
                        <View className="w-22 h-22 rounded-full bg-[#d3fadbdf] justify-center items-center mr-3">
                            <Ionicons
                                name="people"
                                size={44}
                                color="rgb(46, 200, 111)"
                            />
                        </View>

                        <View className="gap-2">
                            <Text className="font-semibold text-[20px] text-[#0A2E6B] max-w-[85%]">
                                I am a Rescue Team Member
                            </Text>
                            <Text className="text-[16px] text-slate-700 text-wrap max-w-[85%]">
                                Access operations, respond to incidents and
                                manage missions.
                            </Text>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity
                            className="flex-row items-center justify-end"
                            onPress={() => {
                                router.push("/(rescuers)/login-rescuers");
                            }}
                        >
                            <Ionicons
                                name="arrow-forward-circle"
                                size={35}
                                color="rgb(46, 200, 111)"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
