import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    Alert,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenWrapper from "../../../components/ScreenWrapper";
// ── Emergency types config ────────────────────────────────────────────────────
const EMERGENCY_TYPES = [
    { label: "Flood", icon: "🌊" },
    { label: "Landslide", icon: "⛰️" },
    { label: "Accident", icon: "🚗" },
    { label: "Fire", icon: "🔥" },
    { label: "Other", icon: "➕" },
];

// ── Pulse ring ────────────────────────────────────────────────────────────────
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

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SOSScreen({ navigation }) {
    const [formData, setFormData] = useState({
        emergencyType: "Flood",
        phoneNumber: "",
        details: "",
        location: {
            city: "Butwal",
            region: "Rupandehi",
            lat: 28.4379,
            lng: 83.4533,
            accuracy: 6,
        },
    });

    const [sending, setSending] = useState(false);

    const selectType = (label) => {
        setFormData((prev) => ({ ...prev, emergencyType: label }));
    };

    const handleSend = async () => {
        if (!formData.emergencyType) {
            Alert.alert("Select emergency type", "Pick an emergency type.");
            return;
        }
        setSending(true);
        try {
            // 🔌 Replace with your real API call:
            // await fetch("https://your-api.com/sos", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify(formData),
            // });
            await new Promise((r) => setTimeout(r, 1200));
            Alert.alert(
                "✅ Alert Sent",
                "Emergency services have been notified.",
            );
        } catch {
            Alert.alert("Failed", "Could not send alert. Try again.");
        } finally {
            setSending(false);
        }
    };

    const { location } = formData;

    return (
        <ScreenWrapper>
            <View className={`flex-1 bg-white }`}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

                {/* ── Header ─────────────────────────────────────────────────────────── */}
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
                    {/* ── SOS Button ───────────────────────────────────────────────────── */}
                    <View className="items-center justify-center py-10">
                        <View className="w-44 h-44 items-center justify-center">
                            <PulseRing delay={0} />
                            <PulseRing delay={600} />
                            <TouchableOpacity
                                onPress={() =>
                                    Alert.alert(
                                        "SOS Activated",
                                        "Tap SEND ALERT to dispatch emergency services.",
                                    )
                                }
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

                    {/* ── Location card ────────────────────────────────────────────────── */}
                    <View
                        className="flex-row items-start bg-white border border-gray-200 rounded-2xl p-6 mb-6"
                        style={{
                            shadowColor: "#000",
                            shadowOpacity: 0.06,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 2,
                        }}
                    >
                        <View className=" items-center justify-center mr-3 mt-0.5 gap-2">
                            <Text className="">
                                <Ionicons
                                    name="location-sharp"
                                    color="blue"
                                    size={30}
                                />
                            </Text>
                        </View>
                        <View className="flex-1 gap-1">
                            <Text className="text-[18px] text-slate-500 font-medium mb-0.5">
                                Your Location
                            </Text>
                            <Text className="text-2xl font-bold text-gray-900">
                                {location.city}, {location.region}
                            </Text>
                            <Text className="text-[16px] text-gray-700 mt-0.5">
                                {location.lat}° N, {location.lng}° E
                            </Text>
                            <Text className="text-[15px] text-green-600 font-semibold mt-1">
                                📡 Accuracy: {location.accuracy} m
                            </Text>
                        </View>
                    </View>

                    {/* ── Emergency Type ───────────────────────────────────────────────── */}
                    <Text className="text-xl font-bold text-gray-900 mb-3">
                        Emergency Type
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {EMERGENCY_TYPES.map(({ label, icon }) => {
                            const selected = formData.emergencyType === label;
                            return (
                                <TouchableOpacity
                                    key={label}
                                    onPress={() => selectType(label)}
                                    activeOpacity={0.75}
                                    className={`items-center justify-center px-3 py-2.5 rounded-xl border-2 min-w-16 relative ${
                                        selected
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-200 bg-gray-50"
                                    }`}
                                >
                                    <Text className="text-4xl mb-1">
                                        {icon}
                                    </Text>
                                    <Text
                                        className={`text-xs font-semibold ${selected ? "text-blue-700" : "text-gray-500"}`}
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

                    {/* phone number */}
                    <Text className="text-xl font-bold text-gray-900 mb-3">
                        Phone Number
                    </Text>
                    <TextInput
                        className="border border-gray-200 rounded-2xl p-4 text-base text-gray-800 bg-gray-50 mb-6"
                        placeholder="Enter your phone number"
                        placeholderTextColor="#9CA3AF"
                        value={formData.phone}
                        onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, phone: text }))
                        }
                    />

                    {/* ── Additional details ───────────────────────────────────────────── */}
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

                    {/* ── Send button ──────────────────────────────────────────────────── */}
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending}
                        activeOpacity={0.85}
                        className={`mt-7 rounded-2xl py-4 items-center ${sending ? "bg-blue-300" : "bg-blue-600"}`}
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
