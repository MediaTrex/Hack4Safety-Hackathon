import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Icons ──────────────────────────────────────────────────────────────────────
const TYPE_ICONS = {
    flood: "🌊",
    landslide: "⛰️",
    accident: "🚗",
    fire: "🔥",
    other: "🆘",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(isoString) {
    if (!isoString) return "Unknown time";
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Alert Card ─────────────────────────────────────────────────────────────────
function AlertCard({ item, onPress }) {
    const type = item.type?.toLowerCase() ?? "other";

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            activeOpacity={0.85}
            className="bg-white rounded-2xl px-4 py-4 mb-3 mx-4"
            style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.07,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
            }}
        >
            {/* Top row: icon + title + time */}
            <View className="flex-row items-center mb-3">
                <View className="w-13 h-13 rounded-full bg-red-50 items-center justify-center mr-3">
                    <Text style={{ fontSize: 28 }}>
                        {TYPE_ICONS[type] ?? "🆘"}
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className="text-[19px] font-bold text-gray-800">
                        {type.charAt(0).toUpperCase() + type.slice(1)} Emergency
                    </Text>
                    <Text className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(item.sentAt)}
                    </Text>
                </View>
                
                <Ionicons name="chevron-forward" size={23} color="black" />
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-300 mb-3" />

            {/* Details */}
            <View className="gap-y-1.5">
                {/* Address */}
                {(item.address?.city || item.address?.state) && (
                    <View className="flex-row items-center gap-x-1.5">
                        <Ionicons
                            name="location-outline"
                            size={13}
                            color="#9CA3AF"
                        />
                        <Text className="text-xs text-gray-500">
                            {[item.address?.city, item.address?.state]
                                .filter(Boolean)
                                .join(", ")}
                        </Text>
                    </View>
                )}

                {/* Coordinates */}
                {item.latitude && item.longitude && (
                    <View className="flex-row items-center gap-x-1.5">
                        <Ionicons
                            name="navigate-outline"
                            size={13}
                            color="#9CA3AF"
                        />
                        <Text className="text-xs text-gray-400">
                            {Number(item.latitude).toFixed(4)}° N,{" "}
                            {Number(item.longitude).toFixed(4)}° E
                        </Text>
                    </View>
                )}

                {/* Phone */}
                {item.phoneNumber && (
                    <View className="flex-row items-center gap-x-1.5">
                        <Ionicons
                            name="call-outline"
                            size={13}
                            color="#9CA3AF"
                        />
                        <Text className="text-xs text-gray-500">
                            {item.phoneNumber}
                        </Text>
                    </View>
                )}

                {/* Additional details */}
                {item.additionalDetail ? (
                    <View className="flex-row items-start gap-x-1.5 mt-0.5">
                        <Ionicons
                            name="chatbubble-outline"
                            size={13}
                            color="#9CA3AF"
                            style={{ marginTop: 1 }}
                        />
                        <Text
                            className="text-xs text-gray-500 flex-1"
                            numberOfLines={2}
                        >
                            {item.additionalDetail}
                        </Text>
                    </View>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function MyAlertsScreen() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadAlerts();
        }, []),
    );

    async function loadAlerts() {
        try {
            const raw = await AsyncStorage.getItem("alerts");
            const parsed = raw ? JSON.parse(raw) : [];
            setAlerts([...parsed].reverse()); // newest first
        } catch (err) {
            console.error("Failed to load alerts:", err);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    }

    function handleCardPress(item) {
        router.push({
            pathname: "/(citizens)/rescue-tracking",
            params: { operation : JSON.stringify(item.operationDetail) },
        });
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* ── Header ── */}
            <View
                className="flex-row items-center bg-white px-4 py-4 border-b border-gray-100"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className=" rounded-full items-center justify-center mr-3"
                >
                    <Ionicons name="arrow-back" size={26} color="#374151" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">
                        Track your SOSs
                    </Text>
                </View>
                {alerts.length > 0 && (
                    <View className="bg-red-100 px-2.5 py-0.5 rounded-full">
                        <Text className="text-xs font-bold text-red-500">
                            {alerts.length}
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Helper text ── */}
            {!loading && alerts.length > 0 && (
                <View className="flex-row items-center px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-100 mx-4 mt-3">
                    <Ionicons
                        name="location-outline"
                        size={20}
                        color="#3b82f6"
                        style={{ marginRight: 6 }}
                    />
                    <Text className="text-blue-500 text-[12px] font-medium flex-1">
                      Click on your alerts to track rescue
                    </Text>
                </View>
            )}

            {/* ── List ── */}
            {!loading && (
                <FlatList
                    data={alerts}
                    keyExtractor={(item, index) =>
                        item.id ?? item.sentAt ?? String(index)
                    }
                    renderItem={({ item }) => (
                        <AlertCard item={item} onPress={handleCardPress} />
                    )}
                    contentContainerStyle={{
                        paddingTop: 12,
                        paddingBottom: 32,
                        flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text style={{ fontSize: 60 }}>📭</Text>
                            <Text className="text-gray-400 text-[16px] mt-3">
                                No alerts found
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
