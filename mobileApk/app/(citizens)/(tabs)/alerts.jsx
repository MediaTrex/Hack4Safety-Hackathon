import React, { useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Linking,
    Alert,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../components/ScreenWrapper";

// ─── Alert type config ────────────────────────────────────────────────────────

const ALERT_TYPE_CONFIG = {
    flood: {
        label: "Flood Alert",
        iconBg: "#ef4444",
        timeColor: "#ef4444",
        icon: () => (
            <MaterialCommunityIcons name="waves" size={26} color="#fff" />
        ),
    },
    fire: {
        label: "Fire Alert",
        iconBg: "#f97316",
        timeColor: "#f97316",
        icon: () => (
            <MaterialCommunityIcons name="fire" size={26} color="#fff" />
        ),
    },
    landslide: {
        label: "Landslide Risk",
        iconBg: "#f97316",
        timeColor: "#f97316",
        icon: () => (
            <MaterialCommunityIcons name="landslide" size={26} color="#fff" />
        ),
    },
    accident: {
        label: "Accident Alert",
        iconBg: "#eab308",
        timeColor: "#eab308",
        icon: () => <FontAwesome5 name="car-crash" size={21} color="#fff" />,
    },
    other: {
        label: "Alert",
        iconBg: "#6b7280",
        timeColor: "#6b7280",
        icon: () => (
            <MaterialCommunityIcons
                name="alert-circle"
                size={26}
                color="#fff"
            />
        ),
    },
};

// ─── Mock data — replace with your API response ───────────────────────────────

const MOCK_ALERTS = [
    {
        id: "1",
        type: "flood",
        location: "Butwal, Rupandehi",
        time: "2 min ago",
        latitude: 27.7006,
        longitude: 83.4532,
    },
    {
        id: "2",
        type: "landslide",
        location: "Palpa, Tanaahu",
        time: "15 min ago",
        latitude: 27.8643,
        longitude: 83.5474,
    },
    {
        id: "3",
        type: "fire",
        location: "Pokhara, Kaski",
        time: "32 min ago",
        latitude: 28.2096,
        longitude: 83.9856,
    },
    {
        id: "4",
        type: "accident",
        location: "Narayanghat, Chitwan",
        time: "1 hr ago",
        latitude: 27.6933,
        longitude: 84.4281,
    },
    {
        id: "5",
        type: "other",
        location: "Hetauda, Makwanpur",
        time: "2 hr ago",
        latitude: 27.4289,
        longitude: 85.0319,
    },
    {
        id: "6",
        type: "flood",
        location: "Birgunj, Parsa",
        time: "3 hr ago",
        latitude: 27.0104,
        longitude: 84.8772,
    },
    {
        id: "7",
        type: "fire",
        location: "Dharan, Sunsari",
        time: "3 hr ago",
        latitude: 26.8127,
        longitude: 87.2836,
    },
    {
        id: "8",
        type: "accident",
        location: "Bhairahawa, Rupandehi",
        time: "4 hr ago",
        latitude: 27.5055,
        longitude: 83.4536,
    },
    {
        id: "9",
        type: "landslide",
        location: "Beni, Myagdi",
        time: "5 hr ago",
        latitude: 28.354,
        longitude: 83.5727,
    },
    {
        id: "10",
        type: "flood",
        location: "Janakpur, Dhanusha",
        time: "6 hr ago",
        latitude: 26.7288,
        longitude: 85.9256,
    },
    {
        id: "11",
        type: "other",
        location: "Biratnagar, Morang",
        time: "7 hr ago",
        latitude: 26.4831,
        longitude: 87.2798,
    },
    {
        id: "12",
        type: "fire",
        location: "Tulsipur, Dang",
        time: "8 hr ago",
        latitude: 28.1312,
        longitude: 82.2956,
    },
    {
        id: "13",
        type: "accident",
        location: "Kohalpur, Banke",
        time: "9 hr ago",
        latitude: 28.1984,
        longitude: 81.7258,
    },
    {
        id: "14",
        type: "landslide",
        location: "Baglung, Baglung",
        time: "11 hr ago",
        latitude: 28.2692,
        longitude: 83.5876,
    },
    {
        id: "15",
        type: "flood",
        location: "Kalaiya, Bara",
        time: "13 hr ago",
        latitude: 27.0335,
        longitude: 85.0005,
    },
    {
        id: "16",
        type: "other",
        location: "Itahari, Sunsari",
        time: "14 hr ago",
        latitude: 26.6649,
        longitude: 87.2778,
    },
    {
        id: "17",
        type: "fire",
        location: "Nepalgunj, Banke",
        time: "16 hr ago",
        latitude: 28.05,
        longitude: 81.6167,
    },
    {
        id: "18",
        type: "accident",
        location: "Damauli, Tanahun",
        time: "18 hr ago",
        latitude: 27.9614,
        longitude: 84.2925,
    },
    {
        id: "19",
        type: "flood",
        location: "Bardibas, Mahottari",
        time: "20 hr ago",
        latitude: 26.9769,
        longitude: 85.9165,
    },
    {
        id: "20",
        type: "landslide",
        location: "Waling, Syangja",
        time: "22 hr ago",
        latitude: 28.0742,
        longitude: 83.7786,
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const openInMaps = (latitude, longitude) => {
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.canOpenURL(url)
        .then((supported) => {
            if (!supported) {
                Alert.alert(
                    "Error",
                    "Google Maps is not available on this device.",
                );
                return;
            }
            return Linking.openURL(url);
        })
        .catch(() => Alert.alert("Error", "Could not open Google Maps."));
};

// ─── Alert Card Row ──────────────────────────────────────────────────────────

function AlertRow({ item, isLast }) {
    const config = ALERT_TYPE_CONFIG[item.type] ?? ALERT_TYPE_CONFIG.other;
    const title = item.label ?? config.label;

    return (
        <>
            <TouchableOpacity
                className="flex-row items-center px-5 py-5"
                activeOpacity={0.6}
                onPress={() => openInMaps(item.latitude, item.longitude)}
                accessibilityLabel={`${title} at ${item.location}. Tap to view on map.`}
                accessibilityRole="button"
            >
                {/* Colored icon circle */}
                <View
                    className="w-17 h-17 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: config.iconBg }}
                >
                    {config.icon()}
                </View>

                {/* Title + location */}
                <View className="flex-1">
                    <Text
                        className="text-gray-900 font-semibold text-xl"
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    <Text
                        className="text-gray-400 text-sm mt-0.5"
                        numberOfLines={1}
                    >
                        {item.location}
                    </Text>
                </View>

                {/* Relative time */}
                <Text
                    className="text-xs font-semibold ml-2 flex-shrink-0"
                    style={{ color: config.timeColor }}
                >
                    {item.time}
                </Text>
            </TouchableOpacity>

            {/* Divider — hidden after last row */}
            {!isLast && <View className="h-px bg-gray-100 mx-4" />}
        </>
    );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <View className="items-center justify-center py-16 px-8">
            <MaterialCommunityIcons
                name="bell-check-outline"
                size={56}
                color="#d1d5db"
            />
            <Text className="text-gray-700 text-base font-medium mt-4 text-center">
                No active alerts near you
            </Text>
            <Text className="text-gray-300 text-sm mt-1 text-center">
                We'll notify you when something is reported in your area.
            </Text>
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AlertsNearYouScreen() {
    const router = useRouter();

    // TODO: swap MOCK_ALERTS for your real data
    const alerts = MOCK_ALERTS;

    return (
        <ScreenWrapper>
            <SafeAreaView
                edges={["top"]}
                style={{ flex: 1, backgroundColor: "white" }}
            >
                <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />

                {/* ── Header ── */}
                <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
                    {/* Back button */}
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#111827" />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900">
                        Alerts Near You
                    </Text>

                    {/* Spacer to balance layout */}
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingBottom: 28,
                        paddingTop: 4,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Hint banner ── */}
                    <View className="flex-row items-center px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-100 mb-8 mt-3">
                        <Ionicons
                            name="navigate-circle-outline"
                            size={20}
                            color="#3b82f6"
                            style={{ marginRight: 6 }}
                        />
                        <Text className="text-blue-500 text-[12px] font-medium flex-1">
                            Tap any alert to pinpoint its exact location on
                            Google Maps
                        </Text>
                    </View>

                    {/* ── Alerts card ── */}
                    {alerts.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <View
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                elevation: 2,
                                shadowColor: "#000",
                                shadowOpacity: 0.07,
                                shadowRadius: 6,
                                shadowOffset: { width: 0, height: 2 },
                            }}
                        >
                            {alerts.map((item, index) => (
                                <AlertRow
                                    key={item.id}
                                    item={item}
                                    isLast={index === alerts.length - 1}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </ScreenWrapper>
    );
}
