import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import {
    useAudioRecorder,
    useAudioRecorderState,
    useAudioPlayer,
    useAudioPlayerStatus,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
} from "expo-audio";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────
const INCIDENT_TYPES = ["Flood", "Landslide", "Accident", "Fire", "Other"];
const MAX_PHOTOS = 10;
const MAX_WORDS = 200;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}

// ─── Incident Type Checkbox ───────────────────────────────────────────────────
function IncidentCheckbox({ label, checked, onToggle }) {
    return (
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-2 rounded-xl border border-gray-200"
            style={{ backgroundColor: checked ? "#2563eb" : "#fff" }}
        >
            <Text
                className={`text-[13px] font-medium  ${
                    checked ? "text-white" : "text-gray-700"
                }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// ─── Photo Thumbnail ──────────────────────────────────────────────────────────
function PhotoThumb({ uri, index, onRemove }) {
    return (
        <View className="relative mr-2 mb-2">
            <Image
                source={{ uri }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
            />
            <TouchableOpacity
                onPress={() => onRemove(index)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
            >
                <Ionicons name="close" size={11} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

// ─── Waveform Bars (static decorative) ───────────────────────────────────────
const WAVE_HEIGHTS = [
    6, 10, 14, 9, 16, 12, 8, 18, 11, 15, 7, 13, 17, 9, 14, 12, 6, 16, 10, 18, 8,
    13, 15, 11, 7, 16, 12, 9,
];

function WaveformBars({ progress = 0, barCount = 28 }) {
    return (
        <View className="flex-1 flex-row items-center h-8 mx-2">
            {Array.from({ length: barCount }).map((_, i) => {
                const active = i / barCount <= progress;
                return (
                    <View
                        key={i}
                        style={{
                            width: 3,
                            height: WAVE_HEIGHTS[i % WAVE_HEIGHTS.length],
                            marginHorizontal: 1,
                            borderRadius: 2,
                            backgroundColor: active ? "#2563eb" : "#bfdbfe",
                        }}
                    />
                );
            })}
        </View>
    );
}

// ─── Voice Recorder Component ─────────────────────────────────────────────────
// Uses expo-audio's hook-based API:
//   • useAudioRecorder + useAudioRecorderState  → recording
//   • useAudioPlayer + useAudioPlayerStatus     → playback
function VoiceRecorder({ recordingUri, recordingDuration, onChange }) {
    // ── recorder ──
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder, 500);

    // ── player (initialised with null; replaced once we have a URI) ──
    const player = useAudioPlayer(recordingUri ? { uri: recordingUri } : null);
    const playerStatus = useAudioPlayerStatus(player);

    // ── elapsed timer while recording ──
    const [elapsedSecs, setElapsedSecs] = useState(0);
    const timerRef = React.useRef(null);

    const isRecording = recorderState.isRecording;
    const isPlaying = playerStatus.playing;
    const duration = playerStatus.duration ?? recordingDuration ?? 0;
    const position = playerStatus.currentTime ?? 0;
    const progress = duration > 0 ? position / duration : 0;

    // start elapsed timer
    useEffect(() => {
        if (isRecording) {
            setElapsedSecs(0);
            timerRef.current = setInterval(
                () => setElapsedSecs((s) => s + 1),
                1000,
            );
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    // auto-reset position indicator when playback finishes
    useEffect(() => {
        if (playerStatus.didJustFinish) {
            player.seekTo(0);
        }
    }, [playerStatus.didJustFinish]);

    // ── request permission once on mount ──
    useEffect(() => {
        AudioModule.requestRecordingPermissionsAsync().catch(() => {});
    }, []);

    const handleStartRecording = async () => {
        try {
            const perm = await AudioModule.requestRecordingPermissionsAsync();
            if (!perm.granted) {
                Alert.alert(
                    "Permission Required",
                    "Microphone access is needed to record a voice message.",
                );
                return;
            }
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        } catch {
            Alert.alert("Error", "Could not start recording.");
        }
    };

    const handleStopRecording = async () => {
        try {
            await audioRecorder.stop();
            // uri is now available on audioRecorder.uri
            if (audioRecorder.uri) {
                onChange({ uri: audioRecorder.uri, duration: elapsedSecs });
            }
            await setAudioModeAsync({ allowsRecording: false });
        } catch {
            Alert.alert("Error", "Could not stop recording.");
        }
    };

    const handleTogglePlay = () => {
        if (isPlaying) {
            player.pause();
        } else {
            if (playerStatus.currentTime >= duration && duration > 0) {
                player.seekTo(0);
            }
            player.play();
        }
    };

    const handleDelete = () => {
        player.pause();
        onChange(null);
        setElapsedSecs(0);
    };

    // ── RECORDING IN PROGRESS ─────────────────────────────────────────────────
    if (isRecording) {
        return (
            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-3" />
                <Text className="text-red-600 font-semibold flex-1 text-sm">
                    Recording… {formatTime(elapsedSecs)}
                </Text>
                <TouchableOpacity
                    onPress={handleStopRecording}
                    className="bg-red-500 rounded-full px-4 py-1.5"
                >
                    <Text className="text-white text-xs font-bold">Stop</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── PLAYBACK UI ───────────────────────────────────────────────────────────
    if (recordingUri) {
        return (
            <View className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={handleTogglePlay}
                        className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center"
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={18}
                            color="#fff"
                        />
                    </TouchableOpacity>
                    <WaveformBars progress={progress} />
                    <Text className="text-blue-700 text-xs font-semibold w-12 text-right">
                        {isPlaying
                            ? formatTime(position)
                            : formatTime(recordingDuration ?? 0)}
                    </Text>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-blue-500 text-xs">
                        Duration: {formatTime(recordingDuration ?? 0)}
                    </Text>
                    <TouchableOpacity
                        onPress={handleDelete}
                        className="flex-row items-center"
                    >
                        <Ionicons
                            name="trash-outline"
                            size={14}
                            color="#ef4444"
                        />
                        <Text className="text-red-500 text-xs ml-1">
                            Delete
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ── IDLE — TAP TO RECORD ──────────────────────────────────────────────────
    return (
        <TouchableOpacity
            onPress={handleStartRecording}
            className="flex-row items-center border-2 border-dashed border-gray-300 rounded-2xl px-4 py-4"
            activeOpacity={0.7}
        >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Ionicons name="mic-outline" size={22} color="#6b7280" />
            </View>
            <View>
                <Text className="text-gray-700 font-medium text-sm">
                    Tap to record a voice message
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">Optional</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReportIncidentScreen() {
    let router = useRouter();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            incidentType: "flood",
            description: "",
            photos: [],
            voiceMessage: null, // { uri, duration } | null
        },
    });

    const description = watch("description");
    const photos = watch("photos");
    const incidentType = watch("incidentType");
    const voiceMessage = watch("voiceMessage");
    const wordCount = countWords(description);
    const wordsLeft = MAX_WORDS - wordCount;

    // ── Description: enforce word cap ─────────────────────────────────────────
    const handleDescriptionChange = (text, fieldOnChange) => {
        const words = text.trim() === "" ? [] : text.trim().split(/\s+/);
        if (words.length <= MAX_WORDS) {
            fieldOnChange(text);
        } else {
            fieldOnChange(words.slice(0, MAX_WORDS).join(" "));
        }
    };

    // ── Photo picker ──────────────────────────────────────────────────────────
    const pickPhotos = async () => {
        if (photos.length >= MAX_PHOTOS) {
            Alert.alert(
                "Limit reached",
                `You can upload up to ${MAX_PHOTOS} photos.`,
            );
            return;
        }
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Photo library access is needed.",
            );
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: MAX_PHOTOS - photos.length,
        });
        if (!result.canceled) {
            const newUris = result.assets.map((a) => a.uri);
            setValue("photos", [...photos, ...newUris].slice(0, MAX_PHOTOS));
        }
    };

    const removePhoto = (index) => {
        setValue(
            "photos",
            photos.filter((_, i) => i !== index),
        );
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = (data) => {
        console.log(
            "✅ Incident Report Submitted:",
            JSON.stringify(data, null, 2),
        );
        Alert.alert(
            "Report Submitted",
            [
                `Type: ${data.incidentType}`,
                `Words: ${countWords(data.description)}`,
                `Photos: ${data.photos.length}`,
                `Voice: ${data.voiceMessage ? `Yes (${formatTime(data.voiceMessage.duration)})` : "No"}`,
            ].join("\n"),
            [{ text: "OK" }],
        );
    };

    const onError = (errs) => {
      console.log("errrrrrrorrrro",errs);
      
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "white",
            }}
        >
            {/* ── Header ── */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
                {/* Back button */}
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#111827" />
                </TouchableOpacity>

                {/* Title */}
                <Text className="flex-1 text-center text-2xl font-bold text-gray-900">
                    Report Incident
                </Text>

                {/* Spacer to balance layout */}
                <View style={{ width: 28 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 48, paddingTop: 16 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1  }}
            >
                <View className="px-4 gap-y-4 flex-1">
                    
                    {/* ── Incident Type ── */}
                    <View className="bg-white rounded-2xl px-5 pt-5 pb-4 shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                        <Text className="text-[14px] font-bold text-black uppercase tracking-widest mb-3">
                            Incident Type
                        </Text>
                        <Controller
                            control={control}
                            name="incidentType"
                            rules={{
                                required: "Please select any incident type.",
                            }}
                            render={() => (
                                <View className="flex-row flex-wrap gap-2">
                                    {INCIDENT_TYPES.map((type) => (
                                        <IncidentCheckbox
                                            key={type}
                                            label={type}
                                            checked={
                                                incidentType ===
                                                type.toLowerCase()
                                            }
                                            onToggle={() =>
                                                setValue(
                                                    "incidentType",
                                                    type.toLowerCase(),
                                                )
                                            }
                                        />
                                    ))}
                                </View>
                            )}
                        />
                    </View>

                    {/* ── Description ── */}
                    <View className="bg-white rounded-2xl px-5 pt-5 pb-4 shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                        <Text className="text-[14px] font-bold uppercase tracking-widest mb-3">
                            Describe the Situation
                        </Text>
                        <Controller
                            control={control}
                            name="description"
                            rules={{
                                required: "Please describe the situation.",
                                validate: (v) =>
                                    countWords(v) >= 3 ||
                                    "Please provide at least 3 words.",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) =>
                                        handleDescriptionChange(text, onChange)
                                    }
                                    placeholder="Describe what's happening — location, people affected, urgency…"
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    textAlignVertical="top"
                                    className={`border rounded-xl px-4 py-3 text-[13px] text-gray-800 min-h-28 ${
                                        errors.description
                                            ? "border-red-400 bg-red-200"
                                            : "border-gray-400 bg-slate-50"
                                    }`}
                                    style={{
                                        fontFamily:
                                            Platform.OS === "ios"
                                                ? "System"
                                                : undefined,
                                        backgroundColor: "#f3f4f6",
                                        padding: 10,
                                    }}
                                />
                            )}
                        />
                        <View className="flex-row justify-between items-center mt-2">
                            {errors.description ? (
                                <Text className="text-red-500 text-xs flex-1 mr-2">
                                    {errors.description.message}
                                </Text>
                            ) : (
                                <View className="flex-1" />
                            )}
                            <Text
                                className={`text-xs font-semibold ${
                                    wordsLeft <= 0
                                        ? "text-red-500"
                                        : wordsLeft <= 20
                                          ? "text-orange-500"
                                          : "text-gray-400"
                                }`}
                            >
                                {wordsLeft} / {MAX_WORDS} words left
                            </Text>
                        </View>
                    </View>

                    {/* ── Photos ── */}
                    <View className="bg-white rounded-2xl px-5 pt-5 pb-4 shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-[14px] font-bold text-black uppercase tracking-widest">
                                Upload Photos
                            </Text>
                            <Text
                                className={`text-xs font-semibold ${
                                    photos.length >= MAX_PHOTOS
                                        ? "text-orange-500"
                                        : "text-gray-400"
                                }`}
                            >
                                {photos.length} / {MAX_PHOTOS}
                            </Text>
                        </View>

                        <View className="flex-row items-center flex-wrap">
                            {/* First 3 thumbnails */}
                            {photos.slice(0, 3).map((uri, index) => (
                                <PhotoThumb
                                    key={`${uri}-${index}`}
                                    uri={uri}
                                    index={index}
                                    onRemove={removePhoto}
                                />
                            ))}

                            {/* Overflow badge */}
                            {photos.length > 3 && (
                                <View className="w-20 h-20 rounded-xl bg-blue-50 border border-blue-200 items-center justify-center mr-2 mb-2">
                                    <Text className="text-blue-600 font-bold text-xl">
                                        +{photos.length - 3}
                                    </Text>
                                    <Text className="text-blue-400 text-xs">
                                        more
                                    </Text>
                                </View>
                            )}

                            {/* Add button */}
                            {photos.length < MAX_PHOTOS && (
                                <TouchableOpacity
                                    onPress={pickPhotos}
                                    activeOpacity={0.7}
                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 items-center justify-center mb-2"
                                >
                                    <Ionicons
                                        name="add"
                                        size={28}
                                        color="#3b82f6"
                                    />
                                    <Text className="text-blue-500 text-xs font-medium">
                                        Add
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {photos.length === 0 && (
                            <Text className="text-gray-400 text-xs mt-1">
                                Tap + to add up to {MAX_PHOTOS} photos
                            </Text>
                        )}
                    </View>

                    {/* ── Voice Message ── */}
                    <View className="bg-white rounded-2xl px-5 pt-5 pb-4 shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                        <Text className="text-[14px] font-bold text-black uppercase tracking-widest mb-3">
                            Voice Message
                        </Text>
                        <Controller
                            control={control}
                            name="voiceMessage"
                            render={({ field: { onChange, value } }) => (
                                <VoiceRecorder
                                    recordingUri={value?.uri ?? null}
                                    recordingDuration={value?.duration ?? 0}
                                    onChange={onChange}
                                />
                            )}
                        />
                    </View>

                    {/* ── Submit ── */}
                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit, onError)}
                        activeOpacity={0.85}
                        className="bg-blue-600 rounded-2xl py-4 items-center mt-6"
                        style={{
                            shadowColor: "#1d4ed8",
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.35,
                            shadowRadius: 10,
                            elevation: 8,
                        }}
                    >
                        <View className="flex-row items-center gap-x-2">
                            <MaterialIcons name="send" size={18} color="#fff" />
                            <Text className="text-white font-bold text-base tracking-widest">
                                SUBMIT REPORT
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
