/**
 * NavigationScreen.jsx
 *
 * A full-featured Google Maps navigation screen for Expo (React Native).
 * Styling: NativeWind (Tailwind classes via className prop).
 * Routing API: OSRM (Open Source Routing Machine) — completely free, no API key required.
 *   Endpoint: https://router.project-osrm.org/route/v1/driving/
 *   Why OSRM? It is open-source, free to use for development/learning, returns turn-by-turn
 *   instructions, polyline geometry, distance, and duration. No sign-up or billing required.
 *
 * Dependencies required in your project:
 *   expo install expo-location react-native-maps
 *   npm install @mapbox/polyline          ← decodes OSRM/Google encoded polylines
 *
 * Usage: <NavigationScreen destination={{ latitude: 27.7172, longitude: 85.3240, name: "Kathmandu" }} />
 * Or pass params via Expo Router: router.push({ pathname: '/navigation', params: { lat, lng, name } })
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    StatusBar,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import { decode as decodePolyline } from "@mapbox/polyline";

// ─── Constants ───────────────────────────────────────────────────────────────

/** OSRM public API — free, no key needed. Great for dev/learning. */
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

/**
 * How far (in meters) the user must deviate from the route before
 * a reroute is triggered.
 */
const REROUTE_THRESHOLD_METERS = 50;

/** Location tracking accuracy */
const LOCATION_ACCURACY = Location.Accuracy.BestForNavigation;

/** Camera tilt for navigation feel (degrees) */
const NAV_TILT = 30;

/** Camera zoom during navigation */
const NAV_ZOOM = 17;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Haversine distance between two {latitude, longitude} points, in meters */
function haversineMeters(a, b) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const c =
        sinDLat * sinDLat +
        Math.cos(toRad(a.latitude)) *
            Math.cos(toRad(b.latitude)) *
            sinDLon *
            sinDLon;
    return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

/** Format meters → "350 m" or "1.2 km" */
function formatDistance(meters) {
    if (meters == null) return "--";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}

/** Format seconds → "6 min" or "1 h 12 min" */
function formatDuration(seconds) {
    if (seconds == null) return "--";
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} h ${m} min`;
}

/** Format seconds as ETA clock string → "10:31 AM" */
function formatETA(seconds) {
    if (seconds == null) return "--";
    const arrival = new Date(Date.now() + seconds * 1000);
    return arrival.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Convert m/s to km/h */
function msToKmh(ms) {
    if (ms == null || ms < 0) return 0;
    return Math.round(ms * 3.6);
}

/**
 * Map an OSRM maneuver type + modifier to a simple arrow emoji icon.
 * For production you would swap these for proper SVG icons.
 */
function maneuverIcon(type, modifier) {
    if (!type) return "⬆️";
    const t = type.toLowerCase();
    const m = (modifier || "").toLowerCase();
    if (t === "arrive") return "🏁";
    if (t === "depart") return "🚀";
    if (t === "roundabout" || t === "rotary") return "🔄";
    if (t === "fork") return m.includes("left") ? "↖️" : "↗️";
    if (t === "merge") return "⬆️";
    if (t === "turn") {
        if (m.includes("sharp left")) return "↰";
        if (m.includes("left")) return "⬅️";
        if (m.includes("sharp right")) return "↱";
        if (m.includes("right")) return "➡️";
        if (m.includes("uturn")) return "↩️";
        return "⬆️";
    }
    return "⬆️";
}

// ─── OSRM Routing ─────────────────────────────────────────────────────────────

/**
 * Fetch a driving route from OSRM.
 * Returns { polylineCoords, steps, totalDistance, totalDuration } or null on error.
 *
 * OSRM step shape:
 *   { distance, duration, maneuver: { type, modifier, instruction? },
 *     name, geometry (encoded polyline) }
 */
async function fetchOSRMRoute(origin, destination) {
    const url =
        `${OSRM_BASE}/` +
        `${origin.longitude},${origin.latitude};` +
        `${destination.longitude},${destination.latitude}` +
        `?overview=full&geometries=polyline&steps=true&annotations=false`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const json = await res.json();

    if (json.code !== "Ok" || !json.routes || json.routes.length === 0) {
        throw new Error("No route found");
    }

    const route = json.routes[0];

    // Decode the full overview polyline into [{latitude, longitude}]
    const polylineCoords = decodePolyline(route.geometry).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
    }));

    // Flatten all steps from all legs
    const steps = route.legs.flatMap((leg) => leg.steps || []);

    return {
        polylineCoords,
        steps,
        totalDistance: route.distance, // metres
        totalDuration: route.duration, // seconds
    };
}

// ─── Step tracker ─────────────────────────────────────────────────────────────

/**
 * Given a list of OSRM steps and the current user location,
 * find the index of the step the user is currently on (closest ahead).
 */
function findCurrentStepIndex(steps, userLocation) {
    if (!steps || steps.length === 0) return 0;

    let closestIdx = 0;
    let closestDist = Infinity;

    steps.forEach((step, idx) => {
        if (!step.maneuver || !step.maneuver.location) return;
        const [lng, lat] = step.maneuver.location;
        const d = haversineMeters(userLocation, {
            latitude: lat,
            longitude: lng,
        });
        if (d < closestDist) {
            closestDist = d;
            closestIdx = idx;
        }
    });

    // Advance to the next step if we're very close to the current waypoint
    if (closestDist < 20 && closestIdx + 1 < steps.length) {
        return closestIdx + 1;
    }
    return closestIdx;
}

/**
 * Check whether the user has deviated from the route polyline beyond the threshold.
 */
function isOffRoute(userLocation, polylineCoords) {
    if (!polylineCoords || polylineCoords.length === 0) return false;
    const minDist = Math.min(
        ...polylineCoords.map((pt) => haversineMeters(userLocation, pt)),
    );
    return minDist > REROUTE_THRESHOLD_METERS;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NavigationScreen() {
    const router = useRouter();

    // Accept destination coords from Expo Router params — no name needed
    const params = useLocalSearchParams();
    const destination = {
        latitude: parseFloat(params.lat ?? "27.6966"), // Demo: Butwal, Nepal
        longitude: parseFloat(params.lng ?? "83.4775"),
    };

    // ── State ──────────────────────────────────────────────────────────────────
    const [userLocation, setUserLocation] = useState(null); // {latitude, longitude, speed, heading}
    const [polylineCoords, setPolylineCoords] = useState([]); // route line points
    const [steps, setSteps] = useState([]); // OSRM turn steps
    const [currentStepIdx, setCurrentStepIdx] = useState(0); // which step we're on
    const [totalDistance, setTotalDistance] = useState(null); // metres remaining
    const [totalDuration, setTotalDuration] = useState(null); // seconds remaining
    const [loading, setLoading] = useState(true); // initial load
    const [rerouting, setRerouting] = useState(false); // reroute in progress
    const [error, setError] = useState(null);
    // Reverse-geocoded destination label (fetched from coordinates, not passed in)
    const [destinationName, setDestinationName] = useState(null);

    // ── Refs ───────────────────────────────────────────────────────────────────
    const mapRef = useRef(null);
    const locationSubRef = useRef(null); // expo-location subscription
    const lastRerouteRef = useRef(0); // timestamp of last reroute (throttle)
    const destinationRef = useRef(destination);

    // ── Fetch route ───────────────────────────────────────────────────────────
    const fetchRoute = useCallback(async (from) => {
        try {
            setRerouting(true);
            const data = await fetchOSRMRoute(from, destinationRef.current);
            setPolylineCoords(data.polylineCoords);
            setSteps(data.steps);
            setTotalDistance(data.totalDistance);
            setTotalDuration(data.totalDuration);
            setCurrentStepIdx(0);
        } catch (err) {
            console.warn("Route fetch error:", err.message);
            setError("Could not load route. Check your connection.");
        } finally {
            setRerouting(false);
            setLoading(false);
        }
    }, []);

    // ── Start navigation (permissions + location watch) ───────────────────────
    useEffect(() => {
        let active = true;

        async function startNavigation() {
            // 1. Request foreground location permission
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError("Location permission denied. Enable it in Settings.");
                setLoading(false);
                return;
            }

            // 2. Reverse-geocode destination coords → human-readable label.
            //    Uses expo-location (already installed) — no extra dependency or API key.
            Location.reverseGeocodeAsync({
                latitude: destinationRef.current.latitude,
                longitude: destinationRef.current.longitude,
            })
                .then((results) => {
                    if (!active || !results?.length) return;
                    const p = results[0];
                    // Pick the most specific available field
                    const label =
                        p.name ||
                        p.street ||
                        p.district ||
                        p.city ||
                        p.region ||
                        null;
                    if (label) setDestinationName(label);
                })
                .catch(() => {
                    /* silently ignore if offline or quota hit */
                });

            // 3. Get initial position and fetch the first route
            const initial = await Location.getCurrentPositionAsync({
                accuracy: LOCATION_ACCURACY,
            });
            if (!active) return;

            const initialCoords = {
                latitude: initial.coords.latitude,
                longitude: initial.coords.longitude,
                speed: initial.coords.speed,
                heading: initial.coords.heading,
            };
            setUserLocation(initialCoords);
            await fetchRoute(initialCoords);

            // 4. Watch position continuously
            locationSubRef.current = await Location.watchPositionAsync(
                {
                    accuracy: LOCATION_ACCURACY,
                    timeInterval: 1000, // update every second
                    distanceInterval: 5, // or every 5 metres
                },
                (loc) => {
                    if (!active) return;

                    const coords = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                        speed: loc.coords.speed ?? 0,
                        heading: loc.coords.heading ?? 0,
                    };

                    setUserLocation(coords);

                    // Animate camera to follow user
                    mapRef.current?.animateCamera(
                        {
                            center: {
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                            },
                            heading: coords.heading,
                            pitch: NAV_TILT,
                            zoom: NAV_ZOOM,
                        },
                        { duration: 500 },
                    );

                    // Update current step
                    setSteps((prevSteps) => {
                        const idx = findCurrentStepIndex(prevSteps, coords);
                        setCurrentStepIdx(idx);
                        return prevSteps;
                    });

                    // Reroute if off-track (throttled to once per 10 seconds)
                    const now = Date.now();
                    setPolylineCoords((prevPoly) => {
                        if (
                            prevPoly.length > 0 &&
                            isOffRoute(coords, prevPoly) &&
                            now - lastRerouteRef.current > 10000
                        ) {
                            lastRerouteRef.current = now;
                            fetchRoute(coords); // non-blocking reroute
                        }
                        return prevPoly;
                    });
                },
            );
        }

        startNavigation();

        return () => {
            active = false;
            locationSubRef.current?.remove();
        };
    }, [fetchRoute]);

    // ── Derived navigation values ──────────────────────────────────────────────
    const currentStep = steps[currentStepIdx] ?? null;

    // Distance to next maneuver waypoint
    const distToNextStep = (() => {
        if (!currentStep?.maneuver?.location || !userLocation) return null;
        const [lng, lat] = currentStep.maneuver.location;
        return haversineMeters(userLocation, { latitude: lat, longitude: lng });
    })();

    // Instruction text: prefer OSRM's own instruction string, fall back to name
    const instructionText = (() => {
        if (!currentStep) return "Calculating…";
        const m = currentStep.maneuver;
        if (m?.instruction) return m.instruction; // some OSRM builds emit this
        if (m?.type === "arrive") return "Arrive at destination";
        if (m?.type === "depart") return "Head out";
        const verb = m?.modifier
            ? `Turn ${m.modifier}`
            : m?.type
              ? m.type.charAt(0).toUpperCase() + m.type.slice(1)
              : "Continue";
        return currentStep.name ? `${verb} onto ${currentStep.name}` : verb;
    })();

    const streetName = currentStep?.name || "";
    const icon = maneuverIcon(
        currentStep?.maneuver?.type,
        currentStep?.maneuver?.modifier,
    );
    const speedKmh = msToKmh(userLocation?.speed);

    // ── End navigation ─────────────────────────────────────────────────────────
    const handleEndNavigation = useCallback(() => {
        // Stop location tracking
        locationSubRef.current?.remove();
        locationSubRef.current = null;
        // Clear state
        setPolylineCoords([]);
        setSteps([]);
        // Go back
        router.back();
    }, [router]);

    // ── Error state ────────────────────────────────────────────────────────────
    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-white px-6">
                <Text className="text-xl font-bold text-red-600 mb-3">
                    Navigation Error
                </Text>
                <Text className="text-base text-gray-600 text-center mb-6">
                    {error}
                </Text>
                <TouchableOpacity
                    className="bg-blue-600 px-8 py-3 rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-semibold text-base">
                        Go Back
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Loading state ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#1A73E8" />
                <Text className="mt-4 text-gray-500 text-sm">
                    Getting your location…
                </Text>
            </View>
        );
    }

    // ── Main render ────────────────────────────────────────────────────────────
    const initialRegion = userLocation
        ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
          }
        : undefined;

    return (
        <View className="flex-1">
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />

            {/* ── Full-screen map ── */}
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                className="absolute inset-0"
                style={{ width: "100%", height: "100%" }}
                initialRegion={initialRegion}
                showsUserLocation={false} // We draw our own blue dot for control
                showsCompass={false}
                showsTraffic={true}
                rotateEnabled={true}
                pitchEnabled={true}
                toolbarEnabled={false}
            >
                {/* Blue route polyline */}
                {polylineCoords.length > 1 && (
                    <Polyline
                        coordinates={polylineCoords}
                        strokeColor="#1A73E8"
                        strokeWidth={6}
                        lineCap="round"
                        lineJoin="round"
                    />
                )}

                {/* Current user location — blue pulsing dot */}
                {userLocation && (
                    <Marker
                        coordinate={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        }}
                        anchor={{ x: 0.5, y: 0.5 }}
                        flat={true}
                        rotation={userLocation.heading ?? 0}
                    >
                        {/* Outer halo */}
                        <View className="w-10 h-10 rounded-full bg-blue-200 opacity-50 items-center justify-center">
                            {/* Inner dot */}
                            <View className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white" />
                        </View>
                    </Marker>
                )}

                {/* Destination red pin — label comes from reverse geocoding, not a passed param */}
                <Marker
                    coordinate={{
                        latitude: destination.latitude,
                        longitude: destination.longitude,
                    }}
                    {...(destinationName ? { title: destinationName } : {})}
                    pinColor="red"
                />
            </MapView>

            {/* ── Rerouting banner ── */}
            {rerouting && (
                <View className="absolute top-0 left-0 right-0 bg-orange-500 pt-10 pb-3 px-4 flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="ml-2 text-white font-semibold text-sm">
                        Recalculating route…
                    </Text>
                </View>
            )}

            {/* ── Top navigation instruction card ── */}
            {!rerouting && (
                <View
                    className="absolute left-4 right-4 bg-blue-800 rounded-2xl shadow-lg overflow-hidden"
                    style={{ top: Platform.OS === "ios" ? 56 : 36 }}
                >
                    <View className="flex-row items-center px-4 py-3">
                        {/* Maneuver icon */}
                        <View className="w-12 h-12 rounded-xl bg-blue-600 items-center justify-center mr-3">
                            <Text style={{ fontSize: 24 }}>{icon}</Text>
                        </View>

                        {/* Instruction text */}
                        <View className="flex-1">
                            <Text
                                className="text-white font-bold text-base leading-tight"
                                numberOfLines={2}
                            >
                                {distToNextStep != null
                                    ? `${instructionText} · ${formatDistance(distToNextStep)}`
                                    : instructionText}
                            </Text>
                            {streetName ? (
                                <Text
                                    className="text-blue-200 text-xs mt-0.5"
                                    numberOfLines={1}
                                >
                                    {streetName}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                </View>
            )}

            {/* ── Speed indicator (floating, left side) ── */}
            <View
                className="absolute left-4 bg-white rounded-xl shadow-md px-3 py-2 items-center"
                style={{ bottom: 180 }}
            >
                <Text className="text-gray-800 font-bold text-xl leading-tight">
                    {speedKmh}
                </Text>
                <Text className="text-gray-400 text-xs">km/h</Text>
            </View>

            {/* ── Bottom info panel ── */}
            <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl px-6 pt-4 pb-8">
                {/* Drag handle */}
                <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

                {/* Trip stats row */}
                <View className="flex-row justify-between items-start mb-4">
                    {/* ETA & duration */}
                    <View>
                        <Text className="text-gray-800 font-bold text-2xl leading-tight">
                            {formatDuration(totalDuration)}
                        </Text>
                        <Text className="text-gray-400 text-sm mt-0.5">
                            {formatETA(totalDuration)} ETA
                        </Text>
                    </View>

                    {/* Distance remaining */}
                    <View className="items-end">
                        <Text className="text-gray-800 font-bold text-2xl leading-tight">
                            {formatDistance(totalDistance)}
                        </Text>
                        <Text className="text-gray-400 text-sm mt-0.5">
                            remaining
                        </Text>
                    </View>
                </View>

                {/* End Navigation button */}
                <TouchableOpacity
                    className="border border-red-500 rounded-full py-3 items-center"
                    activeOpacity={0.75}
                    onPress={handleEndNavigation}
                >
                    <Text className="text-red-500 font-semibold text-base tracking-wide">
                        End Navigation
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
