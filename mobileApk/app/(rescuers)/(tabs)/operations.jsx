import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { router } from "expo-router";

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icons = {
    flood: "🌊",
    landslide: "⛰️",
    accident: "🚗",
    fire: "🔥",
};

// ── Dummy Data ─────────────────────────────────────────────────────────────────
const OPERATIONS = [
    {
        id: "1",
        title: "Flood Rescue",
        location: "Butwal-11, Rupandehi",
        type: "flood",
        severity: "High",
        assignedAt: "10:20 AM",
        distance: "2 km",
        latitude: 27.7005,
        longitude: 83.4483,
    },
    {
        id: "2",
        title: "Landslide Victim",
        location: "Palpa, Tanahun",
        type: "landslide",
        severity: "Medium",
        assignedAt: "09:45 AM",
        distance: "18 km",
        latitude: 27.8667,
        longitude: 83.9833,
    },
    {
        id: "3",
        title: "Accident",
        location: "Siddharth Hwy, Bhairawa",
        type: "accident",
        severity: "Low",
        assignedAt: "08:30 AM",
        distance: "32 km",
        latitude: 27.5036,
        longitude: 83.4547,
    },
    {
        id: "4",
        title: "Fire Outbreak",
        location: "Tansen, Palpa",
        type: "fire",
        severity: "High",
        assignedAt: "11:05 AM",
        distance: "24 km",
        latitude: 27.8667,
        longitude: 83.55,
    },
    {
        id: "5",
        title: "Flash Flood",
        location: "Devghat, Tanahun",
        type: "flood",
        severity: "Medium",
        assignedAt: "07:50 AM",
        distance: "45 km",
        latitude: 27.8564,
        longitude: 84.4333,
    },
    {
        id: "6",
        title: "Road Accident",
        location: "Mugling, Chitwan",
        type: "accident",
        severity: "Medium",
        assignedAt: "06:30 AM",
        distance: "61 km",
        latitude: 27.8667,
        longitude: 84.5167,
    },
    {
        id: "7",
        title: "Hillside Landslide",
        location: "Besi Sahar, Lamjung",
        type: "landslide",
        severity: "Low",
        assignedAt: "05:15 AM",
        distance: "78 km",
        latitude: 28.2333,
        longitude: 84.3667,
    },
    {
        id: "8",
        title: "Market Fire",
        location: "Waling, Syangja",
        type: "fire",
        severity: "High",
        assignedAt: "04:00 AM",
        distance: "52 km",
        latitude: 27.9833,
        longitude: 83.7833,
    },
];

// ── Severity config ────────────────────────────────────────────────────────────
const SEVERITY_BADGE = {
    high: { bg: "bg-red-500", text: "text-white" },
    medium: { bg: "bg-orange-400", text: "text-white" },
    low: { bg: "bg-blue-500", text: "text-white" },
};

const SEVERITY_ICON_BG = {
    high: "bg-red-50",
    medium: "bg-orange-50",
    low: "bg-blue-50",
};

// ── Filter tabs ────────────────────────────────────────────────────────────────
function buildFilters(ops) {
    const counts = { high: 0, medium: 0, low: 0 };
    ops.forEach((o) => {
        counts[o.severity.toLowerCase()] =
            (counts[o.severity.toLowerCase()] ?? 0) + 1;
    });

    return [
        { key: "All", label: `All (${ops.length})` },
        { key: "high", label: `High (${counts.high || 0})` },
        { key: "medium", label: `Medium (${counts.medium || 0})` },
        { key: "low", label: `Low (${counts.low || 0})` },
    ];
}

function FilterTab({ label, active, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 mr-2 px-4 py-2.5 rounded-xl border ${
                active
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-gray-300"
            }`}
        >
            <Text
                className={`text-[14px] font-semibold ${
                    active ? "text-white" : "text-gray-500"
                }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// ── Operation card ─────────────────────────────────────────────────────────────
function OperationCard({ item }) {
    const badge =
        SEVERITY_BADGE[item.severity.toLowerCase()] ?? SEVERITY_BADGE.Low;
    const iconBg =
        SEVERITY_ICON_BG[item.severity.toLowerCase()] ?? "bg-gray-100";
    // console.log();

    return (
        <View
            className="bg-white rounded-2xl px-4 py-4 mb-3 mx-4"
            style={{
                elevation: 1,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
            }}
        >
            {/* Top row: icon + title + badge */}
            <View className="flex-row items-center ">
                <View
                    className={`w-13 h-13 rounded-full ${iconBg} items-center justify-center mr-3`}
                >
                    <Text style={{ fontSize: 25 }}>{Icons[item.type]}</Text>
                </View>

                <Text className="flex-1 text-[17px] font-bold text-gray-800">
                    {item.title}
                </Text>

                <View className={`${badge.bg} rounded-full px-3 py-1`}>
                    <Text className={`${badge.text} text-[12px] font-semibold`}>
                        {item.severity}
                    </Text>
                </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-300 my-2" />

            {/* Details */}
            <View className="gap-y-2">
                {/* Location */}
                <View className="flex-row items-center">
                    <Text className="text-gray-600 text-[14px] mr-1">📍</Text>
                    <Text className="text-gray-500 text-[14px]">
                        {item.location}
                    </Text>
                </View>

                {/* Assigned time */}
                <View className="flex-row items-center">
                    <Text className="text-gray-400 text-[14px] mr-1">🕐</Text>
                    <Text className="text-gray-500 text-[12px]">
                        Assigned at {item.assignedAt}
                    </Text>
                </View>

                {/* Bottom row: coords + distance */}
                <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-gray-400 text-xs">
                        {item.latitude.toFixed(4)}°N,{" "}
                        {item.longitude.toFixed(4)}°E
                    </Text>
                    <View className="flex-row items-center">
                        <Text className="text-gray-400 text-xs mr-1">👤</Text>
                        <Text className="text-gray-500 text-xs">
                            {item.distance}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function OperationsScreen() {
    const [activeFilter, setActiveFilter] = useState("All");
    const filters = buildFilters(OPERATIONS);

    const filtered =
        activeFilter === "All"
            ? OPERATIONS
            : OPERATIONS.filter(
                  (o) => o.severity.toLowerCase() === activeFilter,
              );

    return (
        <ScreenWrapper>
            <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
                <View className="flex-1">
                    <StatusBar
                        barStyle="dark-content"
                        backgroundColor="#F9FAFB"
                    />

                    {/* ── Page header ── */}
                    <View
                        className="bg-white px-5 pt-6 pb-4"
                        style={{
                            elevation: 2,
                            shadowColor: "#000",
                            shadowOpacity: 0.06,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 2 },
                        }}
                    >
                        <Text className="text-2xl font-bold text-gray-800">
                            Assigned Operations
                        </Text>
                        <Text className="text-[14px] text-slate-600 mt-0.5">
                            {OPERATIONS.length} total missions
                        </Text>

                        {/* Filter tabs */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mt-4"
                            contentContainerStyle={{ paddingRight: 8 }}
                        >
                            {filters.map((f) => (
                                <FilterTab
                                    key={f.key}
                                    label={f.label}
                                    active={activeFilter === f.key}
                                    onPress={() => setActiveFilter(f.key)}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── Operation list ── */}
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <OperationCard item={item} />}
                        contentContainerStyle={{
                            paddingTop: 16,
                            paddingBottom: 24,
                        }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20">
                                <Text style={{ fontSize: 60 }}>📭</Text>
                                <Text className="text-gray-400 text-[16px] mt-3">
                                    No operations found
                                </Text>
                            </View>
                        }
                    />
                </View>
            </SafeAreaView>
        </ScreenWrapper>
    );
}
