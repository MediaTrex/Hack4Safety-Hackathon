import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── env ─────────────────────────────────────────────────────────────────────

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Map raw status string to display label */
const STATUS_LABELS = {
    not_assign: "Not Assigned",
    assigned: "Team Assigned",
    on_the_way: "On The Way",
    reached: "Team Arrived",
    rescue_started: "Rescue Started",
    victim_safe: "Victim Safe",
    returning: "Returning",
    completed: "Completed",
};

/** Ordered timeline steps shown in Live Updates */
const TIMELINE_STEPS = [
    { key: "assigned", label: "Team Assigned" },
    { key: "on_the_way", label: "Team On The Way" },
    { key: "reached", label: "Team Arrived" },
    { key: "rescue_started", label: "Rescue Started" },
    { key: "victim_safe", label: "Victim Safe" },
    { key: "completed", label: "Rescue Completed" },
];

const STATUS_ORDER = [
    "not_assign",
    "assigned",
    "on_the_way",
    "reached",
    "rescue_started",
    "victim_safe",
    "returning",
    "completed",
];

function getStepState(stepKey, currentStatus) {
    const currentIdx = STATUS_ORDER.indexOf(currentStatus);
    const stepIdx = STATUS_ORDER.indexOf(stepKey);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
}

// ─── StepDot ─────────────────────────────────────────────────────────────────

function StepDot(props) {
    const { state } = props;
    if (state === "done") {
        return (
            <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                <Text className="text-white text-xs font-bold">✓</Text>
            </View>
        );
    }
    if (state === "active") {
        return (
            <View className="w-5 h-5 rounded-full border-2 border-blue-600 bg-blue-100 items-center justify-center">
                <View className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            </View>
        );
    }
    return (
        <View className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
    );
}

// ─── component ───────────────────────────────────────────────────────────────

export default function RescueTrackingScreen() {
    const router = useRouter();
    const { operation: details } = useLocalSearchParams();

    const [data, setData] = useState(null);
    const [mapReady, setMapReady] = useState(false);

    // Distance + ETA come from MapViewDirections.onReady — no haversine needed
    const [distanceKm, setDistanceKm] = useState(null);
    const [etaMinutes, setEtaMinutes] = useState(null);

    const mapRef = useRef(null);
    
    useEffect(() => {
        try {
            setData(JSON.parse(details));
        } catch {
            setData({
                _id: "ObjectId('6a2959146933a38e2a70520a')",
                operation_id: "OS-2026-06-10-1",
                sos_id: "6a2959136933a38e2a705209",
                assignId: "6a29583e6933a38e2a705207",
                sos_location: {
                    type: "Point",
                    coordinates: [56.0449, 61.8672],
                },
                rescue_team_location: {
                    type: "point",
                    coordinates: [56.0449, 61.8],
                },
                status: "victim_safe",
                taskStatus: "accepted",
                created_at: "2026-06-10T12:31:16.464+00:00",
                updated_at: "2026-06-10T13:11:28.942+00:00",
            });
            // fallback test data while developing
        }
    }, [details]);

    const isAssigned = data && data.status !== "not_assign";

    // derive coordinates
    const rescueLat = data?.rescue_team_location?.coordinates?.[1];
    const rescueLon = data?.rescue_team_location?.coordinates?.[0];
    const sosLat = data?.sos_location?.coordinates?.[1];
    const sosLon = data?.sos_location?.coordinates?.[0];

    const currentStatus = data?.status ?? "not_assign";

    // map region centered between both points
    const midLat =
        rescueLat && sosLat ? (rescueLat + sosLat) / 2 : (sosLat ?? 0);
    const midLon =
        rescueLon && sosLon ? (rescueLon + sosLon) / 2 : (sosLon ?? 0);
    const latDelta =
        rescueLat && sosLat
            ? Math.min(Math.abs(rescueLat - sosLat) * 2.5 + 0.05, 80)
            : 0.1;
    const lonDelta =
        rescueLon && sosLon
            ? Math.min(Math.abs(rescueLon - sosLon) * 2.5 + 0.05, 80)
            : 0.1;

    const onMapReady = () => {
        setMapReady(true);
    };

    // ── screen ───────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#111827" />
                    </TouchableOpacity>

                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900">
                        Rescue Tracking
                    </Text>

                    {/* Spacer to balance layout */}
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Team Card ── */}
                    <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center gap-2">
                                <Image
                                    source={require("../../assets/logo.png")}
                                    className="w-15 h-15 rounded-full"
                                    resizeMode="cover"
                                />
                                <View className="ml-2">
                                    <Text className="text-blue-600 font-semibold text-base">
                                        {isAssigned
                                            ? "Team Assigned"
                                            : "No Team Assigned"}
                                    </Text>
                                    <Text className="text-gray-400 text-xs mt-0.5">
                                        {STATUS_LABELS[currentStatus] ??
                                            currentStatus}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-gray-300 text-xl">›</Text>
                        </View>

                        {isAssigned && distanceKm != null && (
                            <View className="flex-row mt-1 pt-3 border-t border-gray-100">
                                <View className="flex-1 items-center">
                                    <Text className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                                        Status
                                    </Text>
                                    <Text className="text-green-500 font-semibold text-sm">
                                        {STATUS_LABELS[currentStatus] ??
                                            currentStatus}
                                    </Text>
                                </View>
                                <View className="w-px bg-gray-100" />
                                <View className="flex-1 items-center">
                                    <Text className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                                        Distance
                                    </Text>
                                    <Text className="text-gray-800 font-semibold text-sm">
                                        {distanceKm.toFixed(1)} km
                                    </Text>
                                </View>
                                <View className="w-px bg-gray-100" />
                                <View className="flex-1 items-center">
                                    <Text className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                                        ETA
                                    </Text>
                                    <Text className="text-gray-800 font-semibold text-sm">
                                        <Text className="text-gray-800 font-bold text-base">
                                            {etaMinutes}
                                        </Text>{" "}
                                        min
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ── Not Assigned State ── */}
                    {!isAssigned && (
                        <View className="mx-4 mt-6 bg-white rounded-2xl p-8 items-center shadow-sm border border-gray-100">
                            <Text className="text-5xl mb-4">🚨</Text>
                            <Text className="text-gray-800 font-semibold text-lg text-center mb-2">
                                No Team Assigned Yet
                            </Text>
                            <Text className="text-gray-400 text-sm text-center leading-5">
                                Please wait — a rescue team will be assigned to
                                you shortly.
                            </Text>
                            <View className="mt-5 flex-row items-center gap-2">
                                <ActivityIndicator
                                    size="small"
                                    color="#3B82F6"
                                />
                                <Text className="text-blue-500 text-sm ml-2">
                                    Waiting for assignment…
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* ── Loading state while data parses ── */}
                    {data === null && (
                        <View className="mx-4 mt-6 bg-white rounded-2xl p-10 items-center shadow-sm border border-gray-100">
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text className="text-gray-400 text-sm mt-3">
                                Loading rescue data…
                            </Text>
                        </View>
                    )}

                    {/* ── Map ── */}
                    {isAssigned && (
                        <View
                            className="mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100"
                            style={{ height: 208, overflow: "hidden" }}
                        >
                            {/* Map loading overlay */}
                            {!mapReady && (
                                <View className="absolute inset-0 bg-gray-100 z-10 items-center justify-center rounded-2xl h-52">
                                    <ActivityIndicator
                                        size="large"
                                        color="#3B82F6"
                                    />
                                    <Text className="text-gray-400 text-sm mt-2">
                                        Loading map…
                                    </Text>
                                </View>
                            )}
                            <MapView
                                ref={mapRef}
                                provider={PROVIDER_GOOGLE}
                                style={{ height: 208, width: "100%" }}
                                initialRegion={{
                                    latitude: midLat,
                                    longitude: midLon,
                                    latitudeDelta: latDelta,
                                    longitudeDelta: lonDelta,
                                }}
                                onMapReady={onMapReady}
                                showsUserLocation={false}
                                showsMyLocationButton={false}
                            >
                                {/* SOS / victim location */}
                                {sosLat && (
                                    <Marker
                                        coordinate={{
                                            latitude: sosLat,
                                            longitude: sosLon,
                                        }}
                                        title="Your Location"
                                        pinColor="#EF4444"
                                    />
                                )}

                                {/* Rescue team location */}
                                {rescueLat && (
                                    <Marker
                                        coordinate={{
                                            latitude: rescueLat,
                                            longitude: rescueLon,
                                        }}
                                        title="Rescue Team"
                                    >
                                        <View className="bg-white rounded-full p-1 shadow border border-gray-200">
                                            <Text className="text-lg">🚑</Text>
                                        </View>
                                    </Marker>
                                )}

                                {/* ── Route via MapViewDirections ── */}
                                {rescueLat && sosLat && (
                                    <MapViewDirections
                                        origin={{
                                            latitude: rescueLat,
                                            longitude: rescueLon,
                                        }}
                                        destination={{
                                            latitude: sosLat,
                                            longitude: sosLon,
                                        }}
                                        apikey={GOOGLE_MAPS_API_KEY}
                                        strokeWidth={5}
                                        strokeColor="#2563EB"
                                        onReady={(result) => {
                                            // Use accurate road distance + duration from Google
                                            setDistanceKm(result.distance);
                                            setEtaMinutes(
                                                Math.ceil(result.duration),
                                            );

                                            // Auto-fit map to the full route
                                            mapRef.current?.fitToCoordinates(
                                                result.coordinates,
                                                {
                                                    edgePadding: {
                                                        top: 60,
                                                        right: 60,
                                                        bottom: 60,
                                                        left: 60,
                                                    },
                                                    animated: true,
                                                },
                                            );
                                        }}
                                        onError={(error) => {
                                            console.log(
                                                "Directions Error:",
                                                error,
                                            );
                                        }}
                                    />
                                )}
                            </MapView>
                        </View>
                    )}

                    {/* ── Live Updates Timeline ── */}
                    {isAssigned && (
                        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <Text className="text-gray-800 font-semibold text-base mb-4">
                                Live Updates
                            </Text>

                            {TIMELINE_STEPS.map((step, idx) => {
                                const state = getStepState(
                                    step.key,
                                    currentStatus,
                                );
                                const isLast =
                                    idx === TIMELINE_STEPS.length - 1;
                                return (
                                    <View key={step.key} className="flex-row">
                                        {/* dot + connector */}
                                        <View className="items-center mr-3">
                                            <StepDot state={state} />
                                            {!isLast && (
                                                <View
                                                    className={`w-0.5 flex-1 mt-1 ${
                                                        state === "done"
                                                            ? "bg-green-400"
                                                            : "bg-gray-200"
                                                    }`}
                                                    style={{ minHeight: 28 }}
                                                />
                                            )}
                                        </View>

                                        {/* label */}
                                        <View className="pb-5 justify-center">
                                            <Text
                                                className={`text-sm font-medium ${
                                                    state === "active"
                                                        ? "text-blue-600"
                                                        : state === "done"
                                                          ? "text-gray-700"
                                                          : "text-gray-300"
                                                }`}
                                            >
                                                {step.label}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* ── Contact Button ── */}
                    {isAssigned && (
                        <TouchableOpacity
                            className="mx-4 mt-5 bg-blue-600 rounded-2xl py-4 flex-row items-center justify-center active:opacity-80 shadow-md"
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-xl mr-2">📞</Text>
                            <Text className="text-white font-semibold text-base">
                                Contact Rescue Team
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
