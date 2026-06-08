import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Home() {
    const checkStart = async () => {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        if (hasLaunched === null) {
            router.replace("/getting-started");
        }
    };
    checkStart();

    return (
        <View>
            <Text className="text-red-500 bg-amber-200">
                Hello Expo Router 🚀 ghaurav
            </Text>
        </View>
    );
}
