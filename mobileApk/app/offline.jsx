import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Vibration,
    StatusBar,
    ActivityIndicator,
    NativeEventEmitter,
    NativeModules,
} from "react-native";
import { sendSOSSms, wasOpenedByShortcut } from "../services/offlineSOS";

export default function OfflineSOSScreen() {
    const [status, setStatus] = useState("idle"); // idle | sending | sent | error
    const [sentCoords, setSentCoords] = useState(null);
    const [autoSent, setAutoSent] = useState(false);

    useEffect(() => {
        checkAndAutoSend();
        setupVolumeListener();
    }, []);

    const checkAndAutoSend = async () => {
        const byShortcut = await wasOpenedByShortcut();
        if (byShortcut) {
            setAutoSent(true);
            await triggerSOS(); // auto-send immediately
        }
    };

    const setupVolumeListener = () => {
        const { VolumeModule } = NativeModules;
        if (!VolumeModule) return;
        VolumeModule.startListening();

        const emitter = new NativeEventEmitter(VolumeModule);
        const sub = emitter.addListener("onDoubleVolumePress", async () => {
            if (status === "idle" || status === "sent") {
                await triggerSOS();
            }
        });
        return () => sub.remove();
    };

    const triggerSOS = async () => {
        Vibration.vibrate([0, 400, 100, 400]);
        setStatus("sending");
        const result = await sendSOSSms();
        if (result.completed) {
            setStatus("sent");
            setSentCoords(result.coords);
        } else {
            setStatus("error");
        }
    };

    const handleSendAgain = async () => {
        setStatus("idle");
        await triggerSOS();
    };

    // AUTO-SENT STATE (opened by shortcut)
    if (autoSent && status === "sent") {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.sentTitle}>SOS Sent</Text>
                <Text style={styles.sentSub}>SMS sent to police (100)</Text>
                {sentCoords && (
                    <Text style={styles.coords}>
                        {sentCoords.latitude.toFixed(5)},{" "}
                        {sentCoords.longitude.toFixed(5)}
                    </Text>
                )}
                <TouchableOpacity
                    style={styles.sendAgainBtn}
                    onPress={handleSendAgain}
                >
                    <Text style={styles.sendAgainText}>Send Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // SENDING STATE
    if (status === "sending") {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />
                <ActivityIndicator size="large" color="#ff3b30" />
                <Text style={styles.sendingText}>
                    {autoSent ? "Auto-sending SOS..." : "Sending SOS..."}
                </Text>
            </View>
        );
    }

    // MANUAL OPEN — show button
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

            <View style={styles.header}>
                <Text style={styles.offlineIcon}>⚠</Text>
                <Text style={styles.offlineText}>No Internet</Text>
                <Text style={styles.subtitle}>
                    SOS will be sent via SMS to police
                </Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.sosBtn,
                    status === "error" && styles.sosBtnError,
                ]}
                onPress={triggerSOS}
                activeOpacity={0.8}
            >
                <Text style={styles.sosBtnText}>
                    {status === "error" ? "RETRY SOS" : "SEND SOS"}
                </Text>
                <Text style={styles.sosBtnSub}>Tap to alert police</Text>
            </TouchableOpacity>

            {status === "error" && (
                <Text style={styles.errorText}>
                    SMS failed. Check signal and try again.
                </Text>
            )}

            <Text style={styles.hint}>Double press volume down anytime</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0d0d0d",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    header: { alignItems: "center", marginBottom: 60 },
    offlineIcon: { fontSize: 40, marginBottom: 8 },
    offlineText: {
        color: "#ff3b30",
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: { color: "#888", fontSize: 14, textAlign: "center" },

    sosBtn: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "#ff3b30",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#ff6b63",
    },
    sosBtnError: { backgroundColor: "#cc2200", borderColor: "#ff4422" },
    sosBtnText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "700",
        letterSpacing: 2,
    },
    sosBtnSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 },

    sendingText: { color: "#888", fontSize: 16, marginTop: 20 },
    errorText: {
        color: "#ff6b63",
        fontSize: 13,
        marginTop: 20,
        textAlign: "center",
    },
    hint: { color: "#444", fontSize: 12, position: "absolute", bottom: 40 },

    // Sent screen
    checkmark: { fontSize: 72, color: "#30d158", marginBottom: 16 },
    sentTitle: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 8,
    },
    sentSub: { color: "#888", fontSize: 15, marginBottom: 12 },
    coords: {
        color: "#555",
        fontSize: 12,
        fontFamily: "monospace",
        marginBottom: 40,
    },
    sendAgainBtn: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "#ff3b30",
    },
    sendAgainText: { color: "#ff3b30", fontSize: 16, fontWeight: "600" },
});
