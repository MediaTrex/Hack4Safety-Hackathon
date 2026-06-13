import React, { useCallback, useEffect, useState } from "react";
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
import api from "../../../api/api";
import { useAppContext } from "../../../context/AppContext";

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
    function getTimeElapsed(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();

        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 60) {
            return `${diffSec}s ago`;
        }

        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) {
            return `${diffMin}m ago`;
        }

        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) {
            return `${diffHr}h ago`;
        }

        const diffDay = Math.floor(diffHr / 24);
        if (diffDay < 30) {
            return `${diffDay}d ago`;
        }

        const diffMonth = Math.floor(diffDay / 30);
        if (diffMonth < 12) {
            return `${diffMonth}mo ago`;
        }

        const diffYear = Math.floor(diffDay / 365);
        return `${diffYear}y ago`;
    }
    const config =
        ALERT_TYPE_CONFIG[item.emergency_type] ?? ALERT_TYPE_CONFIG.other;
    const title = config.label;
    // console.log(config);
    // console.log(item);

    return (
        <>
            <TouchableOpacity
                className="flex-row items-center px-5 py-5"
                activeOpacity={0.6}
                onPress={() =>
                    openInMaps(
                        item.location.coordinates[1],
                        item.location.coordinates[0],
                    )
                }
                accessibilityLabel={`${title} at . Tap to view on map.`}
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
                        {item.address}
                    </Text>
                </View>

                {/* Relative time */}
                <Text
                    className="text-xs font-semibold ml-2 flex-shrink-0"
                    style={{ color: config.timeColor }}
                >
                    {getTimeElapsed(item.created_at)}
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
    let { latitude, longitude } = useAppContext();
    const router = useRouter();
    let res;
    let [alerts, setAlerts] = useState([]);
    async function getNearbySos() {
        res = await api.post("/geospatial/nearby-sos", {
            longitude: longitude || 0,
            latitude: latitude || 0,
            max_distance_km: 10,
            limit: 20,
        });
        setAlerts(res?.data?.sos_alerts);
    }
    useEffect(() => {
        getNearbySos();
    }, []);

    // TODO: swap MOCK_ALERTS for your real data

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
                                    key={item._id}
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
