import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// If you're NOT using expo-router, replace useRouter with your own navigation:
// import { useNavigation } from "@react-navigation/native";

// Icon components (uses expo vector icons — install with: npx expo install @expo/vector-icons)
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import api from "../../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
    let [loading, setLoading] = useState(false);
    let { saveUser } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        // console.log("Login data:", data);
        setLoading(true);
        let res = await fetch(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: data.email,
                    password: data.password,
                }),
            },
        );

        let resData = await res.json();
        setLoading(false);
        // console.log(JSON.stringify(resData, null, 2));
        if (!res.ok) {
            // console.log(resData);
            if (resData.detail === "Invalid credentials") {
                Toast.show({
                    type: "error",
                    text1: "Invalid credentials.",
                    text2: "Please try again.",
                });
                return;
            } else {
                Toast.show({
                    type: "error",
                    text1: "Something went wrong.",
                    text2: "Please try again.",
                });
                return;
            }
        }
        await AsyncStorage.setItem("token", resData.access_token);
        saveUser({
            id: resData.user_id,
            role: "rescuers",
            email: resData.email,
            full_name: resData.full_name,
        });
        // console.log(resData);
        router.replace("/(rescuers)/dashboard");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* ── Back Button ── */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="mt-3 ml-4  items-start justify-center rounded-full text-black"
                accessibilityLabel="Go back"
            >
                <Ionicons name="chevron-back" size={26} color="#374151" />
            </TouchableOpacity>

            {/* ── Main Content ── */}
            <View className="flex-1 px-6 pt-12">
                {/* Heading */}
                <Text className="text-4xl font-bold text-center text-gray-900 mb-1">
                    Welcome Back!
                </Text>
                <Text className="text-sm text-center text-slate-500 mb-10">
                    Login to your SAJAG AI account
                </Text>

                {/* ── User ID / Email Field ── */}
                <Text className="text-[14px] font-medium text-gray-700 mb-1.5">
                    Email or Mobile no.
                </Text>
                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: "Email or Mobile no. is required",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View
                            className={`flex-row items-center border rounded-xl px-3.5 h-13 mb-1 ${
                                errors.email
                                    ? "border-red-400 bg-red-50"
                                    : "border-slate-500 bg-gray-50"
                            }`}
                        >
                            <Ionicons
                                name="person-outline"
                                size={22}
                                color="#9CA3AF"
                                style={{ marginRight: 8 }}
                            />
                            <TextInput
                                className="flex-1 text-sm text-gray-800"
                                placeholder="Enter email or mobile no."
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        </View>
                    )}
                />
                {errors.email && (
                    <Text className="text-xs text-red-500 mb-2 ml-1">
                        {errors.email.message}
                    </Text>
                )}

                {/* ── Password Field ── */}
                <Text className="text-sm font-medium text-gray-700 mb-1.5 mt-3">
                    Password
                </Text>
                <Controller
                    control={control}
                    name="password"
                    rules={{
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View
                            className={`flex-row items-center border rounded-xl px-3.5 h-13 mb-1 ${
                                errors.password
                                    ? "border-red-400 bg-red-50"
                                    : "border-slate-500 bg-gray-50"
                            }`}
                        >
                            <MaterialCommunityIcons
                                name="lock-outline"
                                size={22}
                                color="#9CA3AF"
                                style={{ marginRight: 8 }}
                            />
                            <TextInput
                                className="flex-1 text-sm text-gray-800"
                                placeholder="Enter password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword((prev) => !prev)}
                                hitSlop={{
                                    top: 8,
                                    bottom: 8,
                                    left: 8,
                                    right: 8,
                                }}
                            >
                                <Feather
                                    name={showPassword ? "eye" : "eye-off"}
                                    size={18}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                />
                {errors.password && (
                    <Text className="text-xs text-red-500 mb-2 ml-1">
                        {errors.password.message}
                    </Text>
                )}

                {/* ── Forgot Password ── */}
                <TouchableOpacity
                    onPress={() => router.push("/(rescuers)/forgot-password")}
                    className="self-end mt-3 mb-7"
                >
                    <Text className="text-[13px] font-medium text-blue-600">
                        Forgot Password?
                    </Text>
                </TouchableOpacity>

                {/* ── Login Button ── */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className="bg-blue-600 rounded-xl h-13 items-center justify-center mb-6"
                    activeOpacity={0.85}
                    disabled={loading}
                >
                    <Text className="text-white font-semibold text-[15px]">
                        {loading ? "Logging in..." : "Login"}
                    </Text>
                </TouchableOpacity>

                {/* ── Divider ── */}
                <View className="flex-row items-center mb-5">
                    <View className="flex-1 h-px bg-gray-500" />
                    <Text className="mx-3 text-sm text-black">
                        or continue with
                    </Text>
                    <View className="flex-1 h-px bg-gray-500" />
                </View>

                {/* ── Social Buttons ── */}
                {/* Google */}
                <TouchableOpacity
                    onPress={() => console.log("Google login")}
                    className="flex-row items-center justify-center border border-gray-200 rounded-xl h-15 mb-3 gap-4"
                    activeOpacity={0.8}
                >
                    {/* Replace the View below with <Image source={require("../assets/google-icon.png")} … /> if you have the asset */}
                    <View className="w-6 h-6 mr-3 items-center justify-center">
                        <Image
                            source={require("../../assets/google.png")}
                            className="h-14 w-14"
                        />
                        {/* ↑ swap with a real Google SVG/PNG icon in production */}
                    </View>
                    <Text className="text-[16px] font-medium text-gray-700">
                        Continue with Google
                    </Text>
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                    onPress={() => console.log("Facebook login")}
                    className="flex-row items-center justify-center border border-gray-200 rounded-xl h-15 mb-8 gap-3 "
                    activeOpacity={0.8}
                >
                    <View className="w-6 h-6 mr-3 items-center justify-center rounded-full bg-blue-700">
                        <Image
                            source={require("../../assets/fb.png")}
                            className="h-10 w-10"
                        />
                    </View>
                    <Text className="text-[15px] font-medium text-gray-700">
                        Continue with Facebook
                    </Text>
                </TouchableOpacity>

                {/* ── Sign Up Link ── */}
                <View className="flex-row justify-center items-center">
                    <Text className="text-[14px] text-gray-500">
                        Don't have an account?{" "}
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            router.push("/(rescuers)/register-rescuers")
                        }
                    >
                        <Text className="text-[14px] font-semibold text-blue-600">
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
