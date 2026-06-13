import { Ionicons } from "@expo/vector-icons";
import { Linking, Platform } from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { useAppContext } from "../../../context/AppContext";
import { useFocusEffect, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import api from "../../../api/api";

// ── Emergency types config ─────────────────────────────────────────────────────
const EMERGENCY_TYPES = [
    { label: "Flood", icon: "🌊" },
    { label: "Landslide", icon: "⛰️" },
    { label: "Accident", icon: "🚗" },
    { label: "Fire", icon: "🔥" },
    { label: "Other", icon: "➕" },
];

// ── Pulse ring ─────────────────────────────────────────────────────────────────
function PulseRing({ delay = 0 }) {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(scale, {
                        toValue: 1.7,
                        duration: 1400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 1400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.5,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        );
        anim.start();
        return () => anim.stop();
    }, []);

    return (
        <Animated.View
            style={{ transform: [{ scale }], opacity }}
            className="absolute w-40 h-40 rounded-full bg-red-300"
        />
    );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function SOSScreen() {
    const {
        latitude,
        longitude,
        address,
        accuracy,
        permissionStatus,
        requestPermission,
    } = useAppContext();

    function openAppSettings() {
        if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
        } else {
            Linking.openSettings();
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (
                permissionStatus === "undetermined" ||
                permissionStatus === "denied"
            ) {
                requestPermission();
            }
            return () => {};
        }, [permissionStatus, requestPermission]),
    );

    if (permissionStatus === "denied") {
        openAppSettings();
    }

    const [formData, setFormData] = useState({
        emergencyType: "Flood",
        details: "",
    });
    const [sending, setSending] = useState(false);

    const location = {
        city: address?.city,
        region: address?.region,
        lat: latitude,
        lng: longitude,
        accuracy,
    };

    // ── Handle Send ──────────────────────────────────────────────────────────────
    const handleSend = async () => {
        let phone = await AsyncStorage.getItem("phone");
        // 1. Permission check
        if (
            permissionStatus === "undetermined" ||
            permissionStatus === "denied"
        ) {
            requestPermission();
        }

        // 3. Emergency type check (shouldn't happen but guard anyway)
        if (!formData.emergencyType) {
            Toast.show({
                type: "error",
                text1: "Select emergency type",
                text2: "Please pick an emergency type.",
            });
            return;
        }

        setSending(true);
        try {
            // 4. Build alert object
            const newAlert = {
                id: Date.now().toString(),
                sentAt: new Date().toISOString(),
                type: formData.emergencyType.toLowerCase(),
                phoneNumber: `${phone}`,
                additionalDetail: formData.details.trim() || null,
                latitude: latitude ?? null,
                longitude: longitude ?? null,
                address: {
                    city: address?.city ?? null,
                    state: address?.region ?? null,
                },
            };

            const dataToSend = {
                location: {
                    type: "Point",
                    coordinates: [newAlert.longitude, newAlert.latitude],
                },
                address: `${newAlert.address.city}, ${newAlert.address.state}`,
                emergency_type: `${newAlert.type}`,
                mobile_no: `${phone}`,
                additional_details: `${newAlert.additionalDetail}`,
            };

            // 5. TODO: send to your backend here
            let { data } = await api.post("/sos", dataToSend);
            // console.log(data);

            // get data from api
            //             {
            //   "_id": "ObjectId('6a2959146933a38e2a70520a')",
            //   "operation_id": "OS-2026-06-10-1",
            //   "sos_id": "6a2959136933a38e2a705209",
            //   "assignId": "6a29583e6933a38e2a705207",
            //   "sos_location": {
            //     "type": "Point",
            //     "coordinates": [
            //       56.0449,
            //       61.8672
            //     ]
            //   },
            //   "rescue_team_location": {   type:"point" , coordinates:[22.3567 , 33.4876]  },
            //   "status": "assigned",
            //   "taskStatus": "accepted",
            //   "created_at": "2026-06-10T12:31:16.464+00:00",
            //   "updated_at": "2026-06-10T13:11:28.942+00:00"
            // }

            //modify the newAlert data with api data
            let newData = {
                ...newAlert,
                operationDetail: data.operation,
            };

            // 6. Save to AsyncStorage
            const raw = await AsyncStorage.getItem("alerts");
            const existing = raw ? JSON.parse(raw) : [];
            await AsyncStorage.setItem(
                "alerts",
                JSON.stringify([...existing, newData]),
            );

            // 7. Success toast
            Toast.show({
                type: "success",
                text1: "Alert Sent ✅",
                text2: "Emergency services have been notified.",
            });

            // 8. Reset form
            setFormData({
                emergencyType: "Flood",
                details: "",
            });

            // 9. Navigate to tracking screen
            router.push("/(citizens)/track-your-SOSs");
        } catch (err) {
            console.error("SOS send error:", err);
            Toast.show({
                type: "error",
                text1: "Failed to send",
                text2: "Could not send alert. Please try again.",
            });
        } finally {
            setSending(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <ScreenWrapper>
            <View className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

                {/* Header */}
                <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900">
                        SOS Emergency
                    </Text>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: 40,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* SOS Button */}
                    <View className="items-center justify-center py-10">
                        <View className="w-44 h-44 items-center justify-center">
                            <PulseRing delay={0} />
                            <PulseRing delay={600} />
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={sending}
                                activeOpacity={0.82}
                                className="w-44 h-44 rounded-full bg-red-500 items-center justify-center"
                                style={{
                                    shadowColor: "#ef4444",
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 14,
                                    elevation: 10,
                                }}
                            >
                                <Text className="text-white text-6xl font-black tracking-widest">
                                    SOS
                                </Text>
                                <Text className="text-white text-[10px] font-bold tracking-widest mt-0.5 opacity-90">
                                    TAP TO ALERT
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Location card */}
                    <View
                        className="flex-row items-start bg-white border border-gray-200 rounded-2xl p-4 mb-6"
                        style={{
                            shadowColor: "#000",
                            shadowOpacity: 0.06,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 2,
                        }}
                    >
                        <View className="items-center justify-center mr-3 mt-0.5 gap-2">
                            <Ionicons
                                name="location-sharp"
                                color="blue"
                                size={30}
                            />
                        </View>
                        <View className="flex-1 gap-1">
                            <Text className="text-[18px] text-slate-500 font-medium mb-0.5">
                                Your Location
                            </Text>
                            <Text className="text-xl font-bold text-gray-900">
                                {location.city || "---"},{" "}
                                {location.region || "---"}
                            </Text>
                            <Text className="text-[16px] text-gray-700 mt-0.5">
                                {Math.ceil((location.lat ?? 0) * 10000) / 10000}
                                ° N,{" "}
                                {Math.ceil((location.lng ?? 0) * 10000) / 10000}
                                ° E
                            </Text>
                            <Text className="text-[15px] text-green-600 font-semibold mt-1">
                                📡 Accuracy:{" "}
                                {Math.ceil((location.accuracy ?? 0) * 10) / 10}{" "}
                                m
                            </Text>
                        </View>
                    </View>

                    {/* Emergency Type */}
                    <Text className="text-xl font-bold text-gray-900 mb-3">
                        Emergency Type
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {EMERGENCY_TYPES.map(({ label, icon }) => {
                            const selected = formData.emergencyType === label;
                            return (
                                <TouchableOpacity
                                    key={label}
                                    onPress={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            emergencyType: label,
                                        }))
                                    }
                                    activeOpacity={0.75}
                                    className={`items-center justify-center px-2 flex-1 py-2.5 rounded-xl border-2 min-w-16 relative ${
                                        selected
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-200 bg-gray-50"
                                    }`}
                                >
                                    <Text className="text-4xl mb-1">
                                        {icon}
                                    </Text>
                                    <Text
                                        className={`text-xs font-semibold ${
                                            selected
                                                ? "text-blue-700"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {label}
                                    </Text>
                                    {selected && (
                                        <View className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 items-center justify-center">
                                            <Text className="text-white text-[9px] font-bold">
                                                ✓
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Additional Details */}
                    <Text className="text-xl font-bold text-gray-900 mb-3">
                        Additional Details{" "}
                        <Text className="text-gray-400 font-normal text-sm">
                            (Optional)
                        </Text>
                    </Text>
                    <TextInput
                        className="border border-gray-200 rounded-2xl p-4 text-base text-gray-800 bg-gray-50 min-h-24"
                        placeholder="Describe situation..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={formData.details}
                        onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, details: text }))
                        }
                    />

                    {/* Send button */}
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending}
                        activeOpacity={0.85}
                        className={`mt-7 rounded-2xl py-4 items-center ${
                            sending ? "bg-blue-300" : "bg-blue-600"
                        }`}
                    >
                        <Text className="text-white text-base font-extrabold tracking-widest">
                            {sending ? "SENDING…" : "SEND ALERT"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
