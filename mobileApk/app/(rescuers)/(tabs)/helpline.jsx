import React, { useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
    Alert,
    Share,
    ScrollView,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAppContext } from "../../../context/AppContext"; //
import { useRouter } from "expo-router";

// ─── Static data ─────────────────────────────────────────────────────────────

const EMERGENCY_CONTACTS = [
    {
        id: "police",
        label: "Nepal Police",
        number: "100",
        iconBg: "#dbeafe", // blue-100
        iconColor: "#1d4ed8", // blue-700
        callBg: "#3b82f6", // blue-500
        labelColor: "#1d4ed8",
        icon: (color) => (
            <FontAwesome5 name="user-shield" size={26} color={color} />
        ),
    },
    {
        id: "ambulance",
        label: "Ambulance",
        number: "102",
        iconBg: "#dcfce7", // green-100
        iconColor: "#15803d", // green-700
        callBg: "#22c55e", // green-500
        labelColor: "#15803d",
        icon: (color) => (
            <FontAwesome5 name="ambulance" size={25} color={color} />
        ),
    },
    {
        id: "fire",
        label: "Fire Service",
        number: "101",
        iconBg: "#fee2e2", // red-100
        iconColor: "#dc2626", // red-600
        callBg: "#ef4444", // red-500
        labelColor: "#dc2626",
        icon: (color) => (
            <MaterialIcons
                name="local-fire-department"
                size={35}
                color={color}
            />
        ),
    },
];

const NAV_LINKS = [
    {
        id: "district",
        label: "District Police Office",
        icon: () => (
            <MaterialIcons name="account-balance" size={26} color="#374151" />
        ),
    },
    {
        id: "hospital",
        label: "Nearby Hospital",
        icon: () => <FontAwesome5 name="hospital" size={25} color="#374151" />,
    },
    {
        id: "shelter",
        label: "Nearby Shelters",
        icon: () => <MaterialIcons name="house" size={29} color="#374151" />,
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeCall = (number) => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url)
        .then((supported) => {
            if (!supported) {
                Alert.alert(
                    "Error",
                    "Phone calls are not supported on this device.",
                );
                return;
            }
            return Linking.openURL(url);
        })
        .catch((err) => Alert.alert("Error", err.message));
};

const openAppSettings = () => {
    Linking.openSettings().catch(() =>
        Alert.alert("Error", "Unable to open settings. Please do it manually."),
    );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ContactCard({ contact }) {
    return (
        <TouchableOpacity
            className="flex-row items-center bg-white rounded-2xl px-6 py-4 mb-3"
            style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.07,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
            }}
            activeOpacity={0.8}
            onPress={() => makeCall(contact.number)}
            accessibilityLabel={`Call ${contact.label} at ${contact.number}`}
            accessibilityRole="button"
        >
            {/* Icon circle */}
            <View
                className="w-18 h-18 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: contact.iconBg }}
            >
                {contact.icon(contact.iconColor)}
            </View>

            {/* Name + number */}
            <View className="flex-1 gap-2">
                <Text
                    className="text-[18px] font-semibold"
                    style={{ color: contact.labelColor }}
                >
                    {contact.label}
                </Text>
                <Text className="text-2xl font-bold text-gray-800">
                    {contact.number}
                </Text>
            </View>

            {/* Call button */}
            <TouchableOpacity
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: contact.callBg }}
                onPress={() => makeCall(contact.number)}
                activeOpacity={0.75}
                accessibilityLabel={`Call ${contact.number}`}
                accessibilityRole="button"
            >
                <Ionicons name="call" size={26} color="#fff" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

function NavRow({ item }) {
    return (
        <TouchableOpacity
            className="flex-row items-center bg-white rounded-xl px-4 py-4 mb-4"
            style={{
                elevation: 1,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
        >
            <View className="w-9 h-9 items-center justify-center mr-3">
                {item.icon()}
            </View>
            <Text className="flex-1 text-gray-700 text-[16px] font-medium">
                {item.label}
            </Text>
            <MaterialIcons name="chevron-right" size={22} color="#9ca3af" />
        </TouchableOpacity>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function EmergencyContactsScreen() {
    let router = useRouter();
    const {
        latitude,
        longitude,
        requestPermission,
        permissionStatus,
        isLoading,
    } = useAppContext();

    // ── On mount: trigger request if undetermined ──
    useEffect(() => {
        if (permissionStatus === "undetermined") {
            requestPermission();
        }
    }, []);

    // ── React to permissionStatus changes — show alert when denied ──
    useEffect(() => {
        if (permissionStatus === "denied") {
            Alert.alert(
                "Location Permission Required",
                "Location access is needed to share your position in an emergency.",
                [
                    { text: "Not Now", style: "cancel" },
                    { text: "Try Again", onPress: requestPermission },
                    { text: "Open Settings", onPress: openAppSettings },
                ],
            );
        }
    }, [permissionStatus]);

    // ── Share location using already-fetched coords from context ──
    const handleShareLocation = async () => {
        if (permissionStatus !== "granted") {
            Alert.alert(
                "Location Not Available",
                "Please grant location permission to share your location.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: openAppSettings },
                ],
            );
            return;
        }

        if (!latitude || !longitude) {
            Alert.alert(
                "Location Unavailable",
                "Still fetching your location. Please try again shortly.",
            );
            return;
        }

        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

        try {
            await Share.share(
                {
                    message: `📍 My current location:\n${mapsUrl}`,
                    url: mapsUrl, // iOS: rich URL preview in share sheet
                    title: "My Location",
                },
                {
                    dialogTitle: "Share My Location", // Android share sheet title
                    subject: "My Emergency Location",
                },
            );
        } catch (err) {
            Alert.alert("Error", err.message || "Could not open share sheet.");
        }
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "white" }}
            edges={["top"]}
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
                    Emergency Contact
                </Text>

                {/* Spacer to balance layout */}
                <View style={{ width: 28 }} />
            </View>

            {/* ── Body ── */}
            <ScrollView
                className="flex-1 px-4 pt-2 mt-6"
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Emergency call cards */}
                {EMERGENCY_CONTACTS.map((c) => (
                    <ContactCard key={c.id} contact={c} />
                ))}

                <View className="h-10" />

                {/* Nav rows */}
                {NAV_LINKS.map((item) => (
                    <NavRow key={item.id} item={item} />
                ))}

                <View className="h-5" />

                {/* ── Share My Location button ── */}
                <TouchableOpacity
                    className="flex-row items-center justify-center border-2 border-red-500 rounded-xl py-3 bg-white"
                    style={{
                        elevation: 1,
                        shadowColor: "#ef4444",
                        shadowOpacity: 0.12,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 2 },
                        opacity: isLoading ? 0.6 : 1,
                    }}
                    activeOpacity={0.75}
                    onPress={handleShareLocation}
                    disabled={isLoading}
                    accessibilityLabel="Share my location"
                    accessibilityRole="button"
                >
                    <MaterialIcons
                        name="share-location"
                        size={34}
                        color="#ef4444"
                        style={{ marginRight: 8 }}
                    />
                    <Text className="text-red-500 font-semibold text-[18px]">
                        {isLoading ? "Getting Location…" : "Share My Location"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
