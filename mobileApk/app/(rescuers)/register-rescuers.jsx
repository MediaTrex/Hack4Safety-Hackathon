import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
    const steps = [1, 2, 3];
    return (
        <View className="flex-row items-center justify-center mt-7 mb-13 px-10">
            {steps.map((step, idx) => {
                const completed = step < currentStep;
                const active = step === currentStep;
                return (
                    <React.Fragment key={step}>
                        {/* Circle */}
                        <View
                            className={`w-9 h-9 rounded-full items-center justify-center border-2 ${
                                completed
                                    ? "bg-green-500 border-green-500"
                                    : active
                                      ? "bg-blue-600 border-blue-600"
                                      : "bg-white border-gray-300"
                            }`}
                        >
                            {completed ? (
                                <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color="white"
                                />
                            ) : (
                                <Text
                                    className={`text-sm font-bold ${
                                        active ? "text-white" : "text-gray-400"
                                    }`}
                                >
                                    {step}
                                </Text>
                            )}
                        </View>
                        {/* Connector line */}
                        {idx < steps.length - 1 && (
                            <View className="flex-1 h-0.5 mx-1">
                                <View
                                    className={`h-full ${
                                        step < currentStep
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                    }`}
                                />
                            </View>
                        )}
                    </React.Fragment>
                );
            })}
        </View>
    );
}

// ─── Shared Input ─────────────────────────────────────────────────────────────
function InputField({
    label,
    placeholder,
    icon,
    rightIcon,
    onRightIconPress,
    error,
    ...inputProps
}) {
    return (
        <View className="mb-4 w-full">
            <Text className="text-[15px] font-medium text-gray-700 mb-1.5">
                {label}
            </Text>
            <View
                className={`flex-row items-center border rounded-xl px-4 h-14 w-full ${
                    error
                        ? "border-red-400 bg-red-50"
                        : "border-slate-500 bg-gray-50"
                }`}
            >
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    className="flex-1 text-sm text-gray-800"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    {...inputProps}
                />
                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text className="text-xs text-red-500 mt-1 ml-1">{error}</Text>
            )}
        </View>
    );
}

// ─── STEP 1: Personal Info ────────────────────────────────────────────────────
function Step1({ onNext, onBack, savedData }) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: savedData || {
            fullName: "",
            mobileNumber: "",
            email: "",
        },
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back → previous screen */}
                    <TouchableOpacity
                        onPress={onBack}
                        className="mt-3 ml-4  items-start justify-center rounded-full"
                    >
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#374151"
                        />
                    </TouchableOpacity>

                    <View className="flex-1 px-6 pt-7">
                        <Text className="text-3xl font-bold text-center text-gray-900 mb-1">
                            Create Account
                        </Text>
                        <Text className="text-[14px] text-center text-black mb-2">
                            Step 1 of 3
                        </Text>

                        <StepIndicator currentStep={1} />

                        {/* Full Name */}
                        <Controller
                            control={control}
                            name="fullName"
                            rules={{ required: "Full name is required" }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <InputField
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    icon={
                                        <Ionicons
                                            name="person-outline"
                                            size={18}
                                            color="#9CA3AF"
                                        />
                                    }
                                    error={errors.fullName?.message}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="words"
                                />
                            )}
                        />

                        {/* Mobile Number */}
                        <Controller
                            control={control}
                            name="mobileNumber"
                            rules={{
                                required: "Mobile number is required",
                                pattern: {
                                    value: /^[+]?[\d\s\-]{7,15}$/,
                                    message: "Enter a valid mobile number",
                                },
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <InputField
                                    label="Mobile Number"
                                    placeholder="Enter mobile number"
                                    icon={
                                        <Feather
                                            name="phone"
                                            size={18}
                                            color="#9CA3AF"
                                        />
                                    }
                                    error={errors.mobileNumber?.message}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="phone-pad"
                                />
                            )}
                        />

                        {/* Email */}
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email address",
                                },
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <InputField
                                    label="Email"
                                    placeholder="Enter email address"
                                    icon={
                                        <MaterialCommunityIcons
                                            name="email-outline"
                                            size={18}
                                            color="#9CA3AF"
                                        />
                                    }
                                    error={errors.email?.message}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            )}
                        />

                        <TouchableOpacity
                            onPress={() => handleSubmit(onNext)()}
                            className="bg-blue-600 rounded-xl h-14 items-center justify-center mt-2 mb-6 w-full"
                            activeOpacity={0.85}
                        >
                            <Text className="text-white font-semibold text-[15px]">
                                Next
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center mb-6">
                            <Text className="text-[14px] text-gray-500">
                                Already have an account?{" "}
                            </Text>
                            <TouchableOpacity onPress={onBack}>
                                <Text className="text-[14px] font-semibold text-blue-600">
                                    Login
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── STEP 2: Set Password ─────────────────────────────────────────────────────
function Step2({ onNext, onBack, savedData }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: savedData || { password: "", confirmPassword: "" },
    });

    const password = watch("password", "");

    const rules = {
        minLength: password.length >= 8,
        hasNumber: /\d/.test(password),
    };

    const RuleRow = ({ met, label }) => (
        <View className="flex-row items-center mb-1.5">
            <Ionicons
                name={met ? "checkmark-circle" : "checkmark-circle-outline"}
                size={16}
                color={met ? "#22C55E" : "#D1D5DB"}
            />
            <Text
                className={`ml-2 text-sm ${met ? "text-gray-700" : "text-gray-400"}`}
            >
                {label}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back → Step 3 */}
                    <TouchableOpacity
                        onPress={onBack}
                        className="mt-3 ml-4 w-9 h-9 items-center justify-center rounded-full bg-gray-100"
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color="#374151"
                        />
                    </TouchableOpacity>

                    <View className="flex-1 px-6 pt-2">
                        <Text className="text-3xl font-bold text-center text-gray-900 mb-1">
                            Set Your Password
                        </Text>
                        <Text className="text-sm text-center text-gray-500 mb-2">
                            Step 2 of 3
                        </Text>

                        <StepIndicator currentStep={2} />

                        {/* Password */}
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "At least 8 characters required",
                                },
                                validate: (v) =>
                                    /\d/.test(v) ||
                                    "Password must include a number",
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <InputField
                                    label="Password"
                                    placeholder="Enter password"
                                    icon={
                                        <MaterialCommunityIcons
                                            name="lock-outline"
                                            size={18}
                                            color="#9CA3AF"
                                        />
                                    }
                                    rightIcon={
                                        <Feather
                                            name={
                                                showPassword ? "eye" : "eye-off"
                                            }
                                            size={18}
                                            color="#9CA3AF"
                                        />
                                    }
                                    onRightIconPress={() =>
                                        setShowPassword((p) => !p)
                                    }
                                    error={errors.password?.message}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    secureTextEntry={!showPassword}
                                />
                            )}
                        />

                        {/* Confirm Password */}
                        <Controller
                            control={control}
                            name="confirmPassword"
                            rules={{
                                required: "Please confirm your password",
                                validate: (v) =>
                                    v === password || "Passwords do not match",
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <InputField
                                    label="Confirm Password"
                                    placeholder="Confirm password"
                                    icon={
                                        <MaterialCommunityIcons
                                            name="lock-outline"
                                            size={18}
                                            color="#9CA3AF"
                                        />
                                    }
                                    rightIcon={
                                        <Feather
                                            name={
                                                showConfirm ? "eye" : "eye-off"
                                            }
                                            size={18}
                                            color="#9CA3AF"
                                        />
                                    }
                                    onRightIconPress={() =>
                                        setShowConfirm((p) => !p)
                                    }
                                    error={errors.confirmPassword?.message}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    secureTextEntry={!showConfirm}
                                />
                            )}
                        />

                        {/* Password Rules */}
                        <View className="bg-gray-50 rounded-xl p-4 mb-6 w-full">
                            <RuleRow
                                met={rules.minLength}
                                label="At least 8 characters"
                            />
                            <RuleRow
                                met={rules.hasNumber}
                                label="Include a number"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => handleSubmit(onNext)()}
                            className="bg-blue-600 rounded-xl h-14 items-center justify-center mb-6 w-full"
                            activeOpacity={0.85}
                        >
                            <Text className="text-white font-semibold text-base">
                                Set Password
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── STEP 3: OTP Verification ─────────────────────────────────────────────────
function Step3({ onNext, onBack, email }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const [timer, setTimer] = useState(45);
    const inputs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timer <= 0) return;
        const id = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [timer]);

    const handleOtpChange = (text, index) => {
        const cleaned = text.replace(/[^0-9]/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = cleaned;
        setOtp(newOtp);
        setOtpError("");
        if (cleaned && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join("");
        if (code.length < 6) {
            setOtpError("Please enter the complete 6-digit OTP");
            return;
        }
        onNext();
    };

    const formatTime = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Back → Step 1 */}
                <TouchableOpacity
                    onPress={onBack}
                    className="mt-3 ml-4 w-9 h-9 items-center justify-center rounded-full bg-gray-100"
                >
                    <Ionicons name="chevron-back" size={20} color="#374151" />
                </TouchableOpacity>

                <View className="flex-1 px-6 pt-2">
                    <Text className="text-3xl font-bold text-center text-gray-900 mb-1">
                        Verify Your Number
                    </Text>
                    <Text className="text-sm text-center text-gray-500 mb-2">
                        Step 3 of 3
                    </Text>

                    <StepIndicator currentStep={3} />

                    {/* Illustration */}
                    <View className="items-center mb-6">
                        <View className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center">
                            <MaterialCommunityIcons
                                name="message-text-outline"
                                size={44}
                                color="#3B82F6"
                            />
                            <View className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-green-500 items-center justify-center border-2 border-white">
                                <Ionicons
                                    name="checkmark"
                                    size={14}
                                    color="white"
                                />
                            </View>
                        </View>
                    </View>

                    <Text className="text-sm text-center text-gray-600 mb-1">
                        We have sent a 6-digit OTP to
                    </Text>
                    <Text className="text-base font-semibold text-center text-blue-600 mb-6">
                        {email}
                    </Text>

                    <Text className="text-sm font-medium text-gray-700 mb-3">
                        Enter OTP
                    </Text>

                    {/* OTP Boxes */}
                    <View className="flex-row justify-between mb-2 w-full">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputs.current[index] = ref)}
                                className={`border rounded-xl text-xl font-bold text-gray-800 ${
                                    otpError
                                        ? "border-red-400 bg-red-50"
                                        : digit
                                          ? "border-blue-500 bg-blue-50"
                                          : "border-gray-200 bg-gray-50"
                                }`}
                                style={{
                                    width: (SCREEN_WIDTH - 64) / 6 - 6,
                                    height: 56,
                                    textAlign: "center",
                                }}
                                value={digit}
                                onChangeText={(text) =>
                                    handleOtpChange(text, index)
                                }
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {otpError ? (
                        <Text className="text-xs text-red-500 mb-3 ml-1">
                            {otpError}
                        </Text>
                    ) : null}

                    {/* Resend */}
                    <View className="flex-row justify-center mb-8 mt-2">
                        {timer > 0 ? (
                            <Text className="text-sm text-gray-500">
                                Resend OTP in{" "}
                                <Text className="font-semibold text-gray-700">
                                    {formatTime(timer)}
                                </Text>
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={() => setTimer(45)}>
                                <Text className="text-sm font-semibold text-blue-600">
                                    Resend OTP
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handleVerify}
                        className="bg-blue-600 rounded-xl h-14 items-center justify-center mb-6 w-full"
                        activeOpacity={0.85}
                    >
                        <Text className="text-white font-semibold text-base">
                            Create Account
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
function SuccessScreen({ onGoToLogin }) {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View className="flex-1 items-center justify-center px-6">
                {/* Confetti dots */}
                <View
                    className="w-full items-center mb-8"
                    style={{ height: 160 }}
                >
                    {/* Decorative coloured dots around the circle */}
                    <View className="absolute" style={{ top: 10, left: "25%" }}>
                        <View className="w-3 h-3 rounded-full bg-yellow-400" />
                    </View>
                    <View className="absolute" style={{ top: 0, right: "28%" }}>
                        <View className="w-2 h-2 rounded-full bg-red-400" />
                    </View>
                    <View
                        className="absolute"
                        style={{ top: 20, right: "18%" }}
                    >
                        <View className="w-3 h-3 rounded-full bg-blue-400" />
                    </View>
                    <View className="absolute" style={{ top: 5, left: "18%" }}>
                        <View className="w-2 h-2 rounded-full bg-green-400" />
                    </View>
                    <View
                        className="absolute"
                        style={{ bottom: 20, left: "20%" }}
                    >
                        <View className="w-3 h-3 rounded-full bg-pink-400" />
                    </View>
                    <View
                        className="absolute"
                        style={{ bottom: 10, right: "22%" }}
                    >
                        <View className="w-2 h-2 rounded-full bg-yellow-300" />
                    </View>
                    <View
                        className="absolute"
                        style={{ bottom: 30, right: "35%" }}
                    >
                        <View className="w-3 h-3 rounded-full bg-purple-400" />
                    </View>
                    <View
                        className="absolute"
                        style={{ bottom: 5, left: "38%" }}
                    >
                        <View className="w-2 h-2 rounded-full bg-red-300" />
                    </View>

                    {/* Big green checkmark circle */}
                    <View
                        className="w-28 h-28 rounded-full bg-green-500 items-center justify-center"
                        style={{ marginTop: 16 }}
                    >
                        <Ionicons name="checkmark" size={60} color="white" />
                    </View>
                </View>

                <Text className="text-2xl font-bold text-blue-600 text-center mb-3">
                    Account Created!
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-5 mb-10">
                    Welcome to SAJAG AI.{"\n"}Your account has been created
                    successfully.
                </Text>

                <TouchableOpacity
                    onPress={onGoToLogin}
                    className="bg-blue-600 rounded-xl h-14 items-center justify-center w-full"
                    activeOpacity={0.85}
                >
                    <Text className="text-white font-semibold text-base">
                        Go to Login
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── ROOT: Signup Flow Orchestrator ──────────────────────────────────────────
export default function SignupScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [step1Data, setStep1Data] = useState(null);
    const [step2Data, setStep2Data] = useState(null);

    const handleStep1Next = (data) => {
        console.log(data);
        setStep1Data(data);
        setStep(2);
    };

    const handleStep3Next = () => setStep(4);
    const handleStep2Next = (data) => {
        setStep2Data(data);
        const payload = {
            fullName: step1Data?.fullName,
            mobileNumber: step1Data?.mobileNumber,
            email: step1Data?.email,
            password: data.password, // ← from Step 3
        };
        console.log("Submitting to backend:", payload);
        // await yourApi.register(payload);
        setStep(3);
    };

    return (
        <>
            {step === 1 && (
                <Step1
                    onNext={handleStep1Next}
                    onBack={() => router.back()}
                    savedData={step1Data}
                />
            )}
            {step === 2 && (
                <Step2
                    onNext={handleStep2Next}
                    onBack={() => setStep(1)}
                    savedData={step2Data}
                />
            )}
            {step === 3 && (
                <Step3
                    onNext={handleStep3Next}
                    onBack={() => setStep(2)}
                    email={step1Data?.email}
                />
            )}
            {step === 4 && (
                <SuccessScreen
                    onGoToLogin={() =>
                        router.replace("/(rescuers)/login-rescuers")
                    }
                />
            )}
        </>
    );
}
