import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    StatusBar,
    Platform,
    Linking,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../../../context/AppContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const LEGEND_HEIGHT = 180;

// ─── Alert type config ────────────────────────────────────────────────────────

const ALERT_CONFIG = {
    flood: {
        label: "Flood",
        color: "#2563EB", // blue-600
        bgColor: "#DBEAFE", // blue-100
        borderColor: "#1D4ED8", // blue-700
        emoji: "🌊",
        icon: "💧",
    },
    landslide: {
        label: "Landslide",
        color: "#D97706", // amber-600
        bgColor: "#FEF3C7", // amber-100
        borderColor: "#B45309", // amber-700
        emoji: "⛰️",
        icon: "🪨",
    },
    accident: {
        label: "Accident",
        color: "#6D28D9", // violet-700
        bgColor: "#EDE9FE", // violet-100
        borderColor: "#5B21B6", // violet-800
        emoji: "🚗",
        icon: "💥",
    },
    fire: {
        label: "Fire",
        color: "#DC2626", // red-600
        bgColor: "#FEE2E2", // red-100
        borderColor: "#B91C1C", // red-700
        emoji: "🔥",
        icon: "🔥",
    },
};

// ─── Filter tabs ───────────────────────────────────────────────────────────────

const FILTERS = [
    { id: "all", label: "All" },
    { id: "flood", label: "Flood" },
    { id: "landslide", label: "Landslide" },
    { id: "accident", label: "Accident" },
    { id: "fire", label: "Fire" },
];

// ─── Mock initial alerts (replace with WebSocket feed) ───────────────────────

const INITIAL_ALERTS = [
    {
        id: "1",
        type: "fire",
        title: "Building Fire",
        latitude: 37.422,
        longitude: -122.084,
        time: "2 min ago",
        severity: "High",
    },
    {
        id: "2",
        type: "flood",
        title: "Flood Warning",
        latitude: 37.425,
        longitude: -122.081,
        time: "5 min ago",
        severity: "Medium",
    },
    {
        id: "3",
        type: "landslide",
        title: "Landslide Risk",
        latitude: 37.419,
        longitude: -122.087,
        time: "12 min ago",
        severity: "High",
    },
    {
        id: "4",
        type: "accident",
        title: "Road Accident",
        latitude: 37.423,
        longitude: -122.079,
        time: "20 min ago",
        severity: "Low",
    },
    {
        id: "5",
        type: "fire",
        title: "Forest Fire",
        latitude: 37.418,
        longitude: -122.09,
        time: "35 min ago",
        severity: "Critical",
    },
    {
        id: "6",
        type: "flood",
        title: "River Overflow",
        latitude: 37.426,
        longitude: -122.083,
        time: "1 hr ago",
        severity: "Medium",
    },
];

// ─── Custom Marker Component ──────────────────────────────────────────────────

const CustomMarker = React.memo(({ alert, isSelected, onPress }) => {
    const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.fire;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isSelected) {
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1.3,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1.1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(scale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        }
    }, [isSelected]);

    return (
        <Marker
            coordinate={{
                latitude: alert.latitude,
                longitude: alert.longitude,
            }}
            onPress={() => onPress(alert)}
            tracksViewChanges={false}
        >
            <Animated.View
                style={{ transform: [{ scale }], alignItems: "center" }}
            >
                {/* Pin body */}
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: config.bgColor,
                        borderWidth: isSelected ? 3 : 2,
                        borderColor: isSelected
                            ? config.color
                            : config.borderColor,
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                    }}
                >
                    <Text style={{ fontSize: 18 }}>{config.emoji}</Text>
                </View>
                {/* Pin tail */}
                <View
                    style={{
                        width: 0,
                        height: 0,
                        borderLeftWidth: 6,
                        borderRightWidth: 6,
                        borderTopWidth: 8,
                        borderLeftColor: "transparent",
                        borderRightColor: "transparent",
                        borderTopColor: config.color,
                        marginTop: -1,
                    }}
                />
            </Animated.View>
        </Marker>
    );
});

// ─── Severity badge ───────────────────────────────────────────────────────────

const SeverityBadge = ({ severity }) => {
    const colors = {
        Critical: { bg: "#FEE2E2", text: "#991B1B" },
        High: { bg: "#FFEDD5", text: "#9A3412" },
        Medium: { bg: "#FEF9C3", text: "#854D0E" },
        Low: { bg: "#DCFCE7", text: "#166534" },
    };
    const c = colors[severity] || colors.Low;
    return (
        <View
            style={{
                backgroundColor: c.bg,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
            }}
        >
            <Text style={{ color: c.text, fontSize: 11, fontWeight: "600" }}>
                {severity}
            </Text>
        </View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LiveDisasterMap({ navigation }) {
    let router = useRouter();
    let { latitude, longitude } = useAppContext();
    const insets = useSafeAreaInsets();

    // State
    const [activeFilter, setActiveFilter] = useState("all");
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [legendVisible, setLegendVisible] = useState(true);

    // Animated values
    const legendAnim = useRef(new Animated.Value(1)).current;
    const detailAnim = useRef(new Animated.Value(0)).current;
    const detailSlide = useRef(new Animated.Value(100)).current;

    // Map ref
    const mapRef = useRef(null);

    // ── WebSocket integration point ───────────────────────────────────────────
    // Uncomment and replace URL when your backend is ready:
    //
    // useEffect(() => {
    //   const ws = new WebSocket("wss://your-backend.com/alerts");
    //
    //   ws.onmessage = (event) => {
    //     const incoming = JSON.parse(event.data);
    //     // Backend can send a single alert object or an array
    //     const newAlerts = Array.isArray(incoming) ? incoming : [incoming];
    //     setAlerts((prev) => {
    //       const existingIds = new Set(prev.map((a) => a.id));
    //       const fresh = newAlerts.filter((a) => !existingIds.has(a.id));
    //       return [...fresh, ...prev];
    //     });
    //   };
    //
    //   ws.onerror = (e) => console.warn("WS error", e.message);
    //   ws.onclose = () => console.log("WS closed");
    //
    //   return () => ws.close();
    // }, []);
    // ─────────────────────────────────────────────────────────────────────────

    // Filtered alerts
    const filteredAlerts =
        activeFilter === "all"
            ? alerts
            : alerts.filter((a) => a.type === activeFilter);

    // Toggle legend
    const toggleLegend = () => {
        if (legendVisible) {
            Animated.timing(legendAnim, {
                toValue: 0,
                duration: 280,
                useNativeDriver: true,
            }).start(() => setLegendVisible(false));
        } else {
            setLegendVisible(true);
            Animated.timing(legendAnim, {
                toValue: 1,
                duration: 280,
                useNativeDriver: true,
            }).start();
        }
    };

    // Show detail sheet
    const showDetail = useCallback((alert) => {
        setSelectedAlert(alert);
        detailAnim.setValue(0);
        detailSlide.setValue(120);
        Animated.parallel([
            Animated.timing(detailAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.spring(detailSlide, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
            }),
        ]).start();
    }, []);

    // Dismiss detail sheet
    const dismissDetail = useCallback(() => {
        Animated.parallel([
            Animated.timing(detailAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(detailSlide, {
                toValue: 120,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setSelectedAlert(null));
    }, []);

    // Map initial region centred on alerts
    const initialRegion = {
        latitude: latitude ?? 27.7175,
        longitude: longitude ?? 85.3251,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            <StatusBar barStyle="dark-content" />

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <View
                style={{
                    paddingTop: insets.top + 8,
                    paddingBottom: 12,
                    paddingHorizontal: 16,
                    backgroundColor: "#FFFFFF",
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: "#E2E8F0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 3,
                    zIndex: 10,
                }}
            >
                <TouchableOpacity
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#111827" />
                    </TouchableOpacity>
                </TouchableOpacity>

                <Text
                    style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: 17,
                        fontWeight: "700",
                        color: "#0F172A",
                        letterSpacing: 0.2,
                    }}
                >
                    Live Disaster Map
                </Text>

                {/* Live indicator */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#22C55E",
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: "#16A34A",
                        }}
                    >
                        LIVE
                    </Text>
                </View>
            </View>

            {/* ── Filter Bar ─────────────────────────────────────────────────── */}
            <View
                style={{
                    backgroundColor: "#FFFFFF",
                    borderBottomWidth: 1,
                    borderBottomColor: "#E2E8F0",
                    paddingVertical: 10,
                    zIndex: 9,
                }}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
                >
                    {FILTERS.map((filter) => {
                        const isActive = activeFilter === filter.id;
                        const config =
                            filter.id !== "all"
                                ? ALERT_CONFIG[filter.id]
                                : null;
                        return (
                            <TouchableOpacity
                                key={filter.id}
                                onPress={() => setActiveFilter(filter.id)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 7,
                                    borderRadius: 20,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 5,
                                    backgroundColor: isActive
                                        ? config
                                            ? config.color
                                            : "#0F172A"
                                        : "#F1F5F9",
                                    borderWidth: 1,
                                    borderColor: isActive
                                        ? config
                                            ? config.borderColor
                                            : "#0F172A"
                                        : "#E2E8F0",
                                }}
                            >
                                {config && (
                                    <Text style={{ fontSize: 13 }}>
                                        {config.emoji}
                                    </Text>
                                )}
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "600",
                                        color: isActive ? "#FFFFFF" : "#475569",
                                    }}
                                >
                                    {filter.label}
                                </Text>
                                {/* badge count */}
                                {filter.id !== "all" && (
                                    <View
                                        style={{
                                            backgroundColor: isActive
                                                ? "rgba(255,255,255,0.25)"
                                                : "#E2E8F0",
                                            borderRadius: 8,
                                            paddingHorizontal: 5,
                                            paddingVertical: 1,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                fontWeight: "700",
                                                color: isActive
                                                    ? "#FFF"
                                                    : "#64748B",
                                            }}
                                        >
                                            {
                                                alerts.filter(
                                                    (a) => a.type === filter.id,
                                                ).length
                                            }
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ── Map + overlays ──────────────────────────────────────────────── */}
            <View style={{ flex: 1 }}>
                <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={initialRegion}
                    // onPress={dismissDetail}
                    showsUserLocation
                    showsMyLocationButton={false}
                >
                    {filteredAlerts.map((alert) => (
                        <CustomMarker
                            key={alert.id}
                            alert={alert}
                            isSelected={selectedAlert?.id === alert.id}
                            onPress={showDetail}
                        />
                    ))}
                </MapView>

                {/* Map controls */}
                <View
                    style={{
                        position: "absolute",
                        right: 12,
                        top: 12,
                        gap: 8,
                    }}
                >
                    {/* My location */}
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: "#FFFFFF",
                            justifyContent: "center",
                            alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.12,
                            shadowRadius: 4,
                            elevation: 4,
                        }}
                        onPress={() =>
                            mapRef.current?.animateToRegion(initialRegion, 600)
                        }
                    >
                        <Text style={{ fontSize: 18 }}>📍</Text>
                    </TouchableOpacity>

                    {/* Alert count badge */}
                    <View
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: "#DC2626",
                            justifyContent: "center",
                            alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 4,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: "800",
                                color: "#FFF",
                            }}
                        >
                            {filteredAlerts.length}
                        </Text>
                    </View>
                </View>

                {/* ── Alert Detail Bottom Sheet ──────────────────────────────────── */}
                {selectedAlert && (
                    <>
                        {/* Backdrop */}
                        <Animated.View
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "#000",
                                opacity: Animated.multiply(detailAnim, 0.2),
                            }}
                            pointerEvents="box-none"
                        />

                        {/* Sheet */}
                        <Animated.View
                            style={{
                                position: "absolute",
                                bottom: legendVisible ? LEGEND_HEIGHT + 50 : 12,
                                left: 12,
                                right: 12,
                                backgroundColor: "#FFFFFF",
                                borderRadius: 16,
                                padding: 16,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: -4 },
                                shadowOpacity: 0.12,
                                shadowRadius: 12,
                                elevation: 10,
                                opacity: detailAnim,
                                transform: [{ translateY: detailSlide }],
                            }}
                        >
                            {/* Handle */}
                            <View
                                style={{
                                    alignItems: "center",
                                    marginBottom: 12,
                                }}
                            >
                                <View
                                    style={{
                                        width: 36,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: "#E2E8F0",
                                    }}
                                />
                            </View>

                            {/* Content */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                {/* Icon */}
                                <View
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 14,
                                        backgroundColor:
                                            ALERT_CONFIG[selectedAlert.type]
                                                ?.bgColor,
                                        borderWidth: 1.5,
                                        borderColor:
                                            ALERT_CONFIG[selectedAlert.type]
                                                ?.borderColor,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ fontSize: 24 }}>
                                        {
                                            ALERT_CONFIG[selectedAlert.type]
                                                ?.emoji
                                        }
                                    </Text>
                                </View>

                                {/* Info */}
                                <View style={{ flex: 1 }}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                            marginBottom: 4,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: "700",
                                                color: "#0F172A",
                                            }}
                                        >
                                            {selectedAlert.title}
                                        </Text>
                                        <SeverityBadge
                                            severity={
                                                selectedAlert.severity ||
                                                "Medium"
                                            }
                                        />
                                    </View>

                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: "#64748B",
                                            marginBottom: 2,
                                        }}
                                    >
                                        {
                                            ALERT_CONFIG[selectedAlert.type]
                                                ?.label
                                        }{" "}
                                        Alert
                                    </Text>

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                color: "#94A3B8",
                                            }}
                                        >
                                            🕐
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                color: "#94A3B8",
                                            }}
                                        >
                                            {selectedAlert.time || "Just now"}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                color: "#CBD5E1",
                                            }}
                                        >
                                            {" "}
                                            •{" "}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                color: "#94A3B8",
                                            }}
                                        >
                                            {selectedAlert.latitude.toFixed(4)},{" "}
                                            {selectedAlert.longitude.toFixed(4)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Close */}
                                <TouchableOpacity
                                    onPress={dismissDetail}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: "#F1F5F9",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: "#64748B",
                                        }}
                                    >
                                        ✕
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Action row */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    marginTop: 14,
                                }}
                            >
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        backgroundColor:
                                            ALERT_CONFIG[selectedAlert.type]
                                                ?.color,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "700",
                                            color: "#FFF",
                                        }}
                                    >
                                        View Details
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        backgroundColor: "#F1F5F9",
                                        alignItems: "center",
                                    }}
                                    onPress={() => {
                                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedAlert.latitude},${selectedAlert.longitude}&travelmode=driving`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: "700",
                                            color: "#475569",
                                        }}
                                    >
                                        Get Directions
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </>
                )}

                {/* ── Legend ────────────────────────────────────────────────────── */}
                {/* Show button when legend is hidden */}
                {!legendVisible && (
                    <TouchableOpacity
                        onPress={toggleLegend}
                        style={{
                            position: "absolute",
                            bottom: 12,
                            left: 12,
                            backgroundColor: "#FFFFFF",
                            borderRadius: 10,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 6,
                            elevation: 4,
                        }}
                    >
                        <Text style={{ fontSize: 13 }}>🗺️</Text>
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: "600",
                                color: "#0F172A",
                            }}
                        >
                            Legend
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Legend panel */}
                {legendVisible && (
                    <Animated.View
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "#FFFFFF",
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            paddingTop: 16,
                            paddingBottom: insets.bottom + 12,
                            paddingHorizontal: 16,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 8,
                            opacity: legendAnim,
                            transform: [
                                {
                                    translateY: legendAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [LEGEND_HEIGHT, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        {/* Header row */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "700",
                                    color: "#0F172A",
                                }}
                            >
                                Legend
                            </Text>
                            <TouchableOpacity
                                onPress={toggleLegend}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 4,
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                    borderRadius: 8,
                                    backgroundColor: "#F1F5F9",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: "600",
                                        color: "#2563EB",
                                    }}
                                >
                                    Hide
                                </Text>
                                <Text
                                    style={{ fontSize: 10, color: "#2563EB" }}
                                >
                                    ▲
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Legend grid */}
                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            {Object.entries(ALERT_CONFIG).map(
                                ([key, config]) => (
                                    <View
                                        key={key}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 6,
                                            backgroundColor: "#F8FAFC",
                                            borderRadius: 8,
                                            paddingHorizontal: 10,
                                            paddingVertical: 6,
                                            minWidth: "44%",
                                            flex: 1,
                                        }}
                                    >
                                        {/* Mini marker */}
                                        <View
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 14,
                                                backgroundColor: config.bgColor,
                                                borderWidth: 1.5,
                                                borderColor: config.borderColor,
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text style={{ fontSize: 13 }}>
                                                {config.emoji}
                                            </Text>
                                        </View>
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                fontWeight: "500",
                                                color: "#334155",
                                            }}
                                        >
                                            {config.label}
                                        </Text>
                                    </View>
                                ),
                            )}

                            {/* Your location */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    backgroundColor: "#F8FAFC",
                                    borderRadius: 8,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    minWidth: "44%",
                                    flex: 1,
                                }}
                            >
                                <View
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: "#DBEAFE",
                                        borderWidth: 1.5,
                                        borderColor: "#2563EB",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ fontSize: 13 }}>📍</Text>
                                </View>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: "500",
                                        color: "#334155",
                                    }}
                                >
                                    Your Location
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}
