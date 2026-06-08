import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GetStarted() {
    const router = useRouter();

    const handleStart = async () => {
        await AsyncStorage.setItem("hasLaunched", "true");
        router.replace("/");
    };

    return (
        <View className="flex-1 bg-white px-6.25 justify-center">
            {/* Logo */}
            <Image
                source={require("../assets/logo.png")}
                className="w-75 h-75 self-center bg-amber"
                resizeMode="cover"
            />

            {/* Title */}
            <Text className="text-[45px] font-bold text-center text-[#0A2E6B]">
                SAJAG AI
            </Text>

            <Text className="text-center font-semibold mb-6.25 text-xl">
                Together for a Safer Nepal
            </Text>

            {/* Features */}
            <View className="mt-2.5">
                <View className="flex-row mb-5 items-center">
                    <View className="w-13.75 h-13.75 rounded-full bg-[#EAF2FF] justify-center items-center mr-[12px]">
                        <Ionicons name="people" size={32} color="#1E6BFF" />
                    </View>

                    <View className="">
                        <Text className="font-semibold text-[18px] text-[#111]">
                            Report
                        </Text>
                        <Text className="text-[13px] text-[#666] w-[90%]">
                            Report incidents and emergencies in real-time
                        </Text>
                    </View>
                </View>

                <View className="flex-row mb-5 items-center">
                    <View className="w-13.75 h-13.75 rounded-full bg-[#EAF2FF] justify-center items-center mr-[12px]">
                        <Ionicons name="flash" size={32} color="#1E6BFF" />
                    </View>

                    <View>
                        <Text className="font-semibold text-[18px] text-[#111]">
                            Respond
                        </Text>
                        <Text className="text-[13px] text-[#666] w-[90%]">
                            Rescue teams respond efficiently
                        </Text>
                    </View>
                </View>

                <View className="flex-row mb-5 items-center">
                    <View className="w-13.75 h-13.75 rounded-full bg-[#EAF2FF] justify-center items-center mr-[12px]">
                        <Ionicons name="shield" size={32} color="#1E6BFF" />
                    </View>

                    <View>
                        <Text className="font-semibold text-[18px] text-[#111]">
                            Save Lives
                        </Text>
                        <Text className="text-[13px] text-[#666] w-[90%]">
                            AI-powered insights for faster and smarter decisions
                        </Text>
                    </View>
                </View>
            </View>

            {/* Button */}
            <TouchableOpacity
                className="bg-[#1E6BFF] py-3.5 rounded-[10px] mt-6.25"
                onPress={handleStart}
            >
                <Text className="text-white text-center font-semibold text-[18px]">
                    Get Started
                </Text>
            </TouchableOpacity>

            {/* Language Switch */}
            <View className="flex-row justify-center mt-3.75 items-center">
                <TouchableOpacity>
                    <Text className="text-[#333] font-medium">🇳🇵 नेपाली</Text>
                </TouchableOpacity>

                <Text className="mx-2.5 text-[#aaa]">|</Text>

                <TouchableOpacity>
                    <Text className="text-[#333] font-medium">English</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
