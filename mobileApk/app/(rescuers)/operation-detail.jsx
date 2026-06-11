import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Linking,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router , useRouter} from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ── Severity config ────────────────────────────────────────────────────────────
const SEVERITY_BADGE = {
    high: { bg: "bg-red-100", text: "text-red-500", label: "High Priority" },
    medium: {
        bg: "bg-orange-100",
        text: "text-orange-500",
        label: "Medium Priority",
    },
    low: { bg: "bg-blue-100", text: "text-blue-500", label: "Low Priority" },
};

// ── Generate a readable Mission ID from operation id ──────────────────────────
function generateMissionId(id, type) {
    const prefix = type ? type.slice(0, 2).toUpperCase() : "OP";
    const padded = String(id).padStart(4, "0");
    return `${prefix}-2024-${padded}`;
}

// ── Section Card ───────────────────────────────────────────────────────────────
function SectionCard({ children }) {
    return (
        <View className="bg-white rounded-2xl px-6 py-6 mb-5 shadow-[0_4px_8px_rgba(0,0,0,0.15)] border border-slate-300">
            {children}
        </View>
    );
}

function SectionRow({ label, value, isLast }) {
    return (
        <View className={!isLast ? "mb-4" : ""}>
            <Text className="text-[15px] text-gray-600 font-medium mb-1">
                {label}
            </Text>
            <Text className="text-[13px] font-semibold text-gray-800">
                {value}
            </Text>
        </View>
    );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function OperationDetailScreen() {
    const params = useLocalSearchParams();
    let uRouter = useRouter();
    // Parse detail — passed as JSON string or individual params
    let detail;
    try {
        detail = params.detail ? JSON.parse(params.detail) : params;
    } catch {
        detail = params;
    }

    const {
        id = "1",
        title = "Operation",
        type = "flood",
        severity = "high",
        assignedAt = "N/A",
        location = "Unknown",
        latitude = 0,
        longitude = 0,
        phoneNumber,
    } = detail;

    const severityKey = severity.toLowerCase();
    const badge = SEVERITY_BADGE[severityKey] ?? SEVERITY_BADGE.low;
    const missionId = generateMissionId(id, type);

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleNavigate = () => {
        uRouter.push({
            pathname: "/(rescuers)/navigation",
            params: { lat: latitude, lng: longitude},
        });
    };

    const handleCall = () => {
        if (!phoneNumber) {
            Alert.alert(
                "No Number",
                "No phone number available for this operation.",
            );
            return;
        }
        Linking.openURL(`tel:${phoneNumber}`).catch(() =>
            Alert.alert("Error", "Could not make the call."),
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* ── Header ── */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
                {/* Back button */}
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#111827" />
                </TouchableOpacity>

                {/* Title */}
                <Text className="flex-1 text-center text-2xl font-bold text-gray-900">
                    Operation Details
                </Text>

                {/* Spacer to balance layout */}
                <View style={{ width: 28 }} />
            </View>

            <View className="flex-1 px-4 pt-5">
                {/* Title + Badge */}
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                </Text>
                <View
                    className={`self-start px-4 py-1.5 rounded-xl ${badge.bg} mb-5`}
                >
                    <Text className={`text-[14px] font-bold ${badge.text}`}>
                        {badge.label}
                    </Text>
                </View>

                {/* ── Mission Info ── */}
                <SectionCard>
                    <SectionRow label="Mission ID" value={missionId} />
                    <View className="h-px bg-slate-300 mb-5" />
                    <SectionRow
                        label="Assigned Time"
                        value={assignedAt}
                        isLast
                    />
                </SectionCard>

                {/* ── Location ── */}
                <SectionCard>
                    <Text className="text-[17px] text-gray-500 font-medium mb-1">
                        Location
                    </Text>
                    <Text className="text-[16px] font-semibold text-gray-800">
                        {location}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                        {Number(latitude).toFixed(4)}° N,{" "}
                        {Number(longitude).toFixed(4)}° E
                    </Text>
                </SectionCard>
            </View>

            {/* ── Sticky bottom buttons ── */}
            <View className="px-4 pb-6 pt-2 bg-gray-50">
                {/* Navigate */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleNavigate}
                    className="bg-blue-500 rounded-2xl py-4 items-center justify-center mb-3"
                    style={{ elevation: 2 }}
                >
                    <Text className="text-white text-[16px] font-bold tracking-widest uppercase">
                        Navigate
                    </Text>
                </TouchableOpacity>

                {/* Call Victim */}
                <TouchableOpacity
                    onPress={handleCall}
                    className="flex-row items-center justify-center py-3 gap-x-2 border border-blue-500 rounded-2xl"
                >
                    <Ionicons name="call-outline" size={23} color="#3B82F6" />
                    <Text className="text-blue-500 text-[16px] font-semibold">
                        Call Victim
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
