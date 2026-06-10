import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useForm, useController } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { router, useRouter } from "expo-router";

// ─── Assets ──────────────────────────────────────────────────────────────────
const FORGOT_PASSWORD_IMG = require("../../assets/forgot-password.png");


// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }) => (
    <View className="flex-row items-center justify-center gap-2 mt-3 mb-1">
        {Array.from({ length: total }).map((_, i) => (
            <View
                key={i}
                className="h-1.5 rounded-full"
                style={{
                    width: i === current - 1 ? 28 : 8,
                    backgroundColor: i < current ? "#2563EB" : "#E5E7EB",
                }}
            />
        ))}
    </View>
);

// ─── OTP Input (uncontrolled by RHF — managed locally, value passed up) ──────
const OtpInput = ({ value, onChange, error }) => {
    const inputs = useRef([]);
    const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

    const handleChange = (text, index) => {
        const cleaned = text.replace(/[^0-9]/g, "").slice(-1);
        const next = [...digits];
        next[index] = cleaned;
        onChange(next.join(""));
        if (cleaned && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
            const next = [...digits];
            next[index - 1] = "";
            onChange(next.join(""));
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <View>
            <View className="flex-row justify-between gap-2 mt-1">
                {digits.map((digit, i) => (
                    <TextInput
                        key={i}
                        ref={(r) => (inputs.current[i] = r)}
                        maxLength={1}
                        keyboardType="number-pad"
                        value={digit}
                        onChangeText={(t) => handleChange(t, i)}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                        selectionColor="#2563EB"
                        className="flex-1 h-14 rounded-xl text-xl font-bold text-gray-800 bg-white"
                        style={{
                            borderWidth: 2,
                            borderColor: error
                                ? "#EF4444"
                                : digit
                                  ? "#2563EB"
                                  : "#E5E7EB",
                            textAlign: "center",
                        }}
                    />
                ))}
            </View>
            {error && (
                <Text className="text-red-500 text-xs mt-2 ml-0.5">
                    {error.message}
                </Text>
            )}
        </View>
    );
};

// ─── Resend Timer ─────────────────────────────────────────────────────────────
const ResendTimer = ({ onResend }) => {
    const [seconds, setSeconds] = useState(45);
    useEffect(() => {
        if (seconds === 0) return;
        const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [seconds]);
    const pad = (n) => String(n).padStart(2, "0");
    return (
        <View className="items-center mt-5">
            {seconds > 0 ? (
                <Text className="text-gray-400 text-sm">
                    Resend OTP in{" "}
                    <Text className="text-blue-600 font-semibold">
                        00:{pad(seconds)}
                    </Text>
                </Text>
            ) : (
                <TouchableOpacity
                    onPress={() => {
                        setSeconds(45);
                        onResend?.();
                    }}
                >
                    <Text className="text-blue-600 font-semibold text-sm">
                        Resend OTP
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// ─── Controlled Text Input (works with useController) ────────────────────────
const ControlledInput = ({
    control,
    name,
    rules,
    label,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "none",
    leftIcon,
    secureEntry = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const {
        field: { value, onChange, onBlur },
        fieldState: { error },
    } = useController({ control, name, rules, defaultValue: "" });

    const isPassword = secureEntry;

    return (
        <View className="mb-5">
            <Text className="text-black text-[15px] font-medium mb-1.5">
                {label}
            </Text>
            <View
                className="flex-row items-center bg-white rounded-xl px-4 h-14"
                style={{
                    borderWidth: 2,
                    borderColor: error ? "#EF4444" : value ? "#2563EB" : "gray",
                }}
            >
                {leftIcon && (
                    <Text className="text-gray-400 text-base mr-3">
                        {leftIcon}
                    </Text>
                )}
                <TextInput
                    className="flex-1 text-base text-gray-800"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                    secureTextEntry={isPassword && !showPassword}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    selectionColor="#2563EB"
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword((s) => !s)}
                        className="pl-2"
                    >
                        <Text className="text-gray-400 text-base">
                            <Feather
                                name={showPassword ? "eye" : "eye-off"}
                                size={24}
                                color="#9CA3AF"
                            />
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text className="text-red-500 text-xs mt-1.5 ml-0.5">
                    {error.message}
                </Text>
            )}
        </View>
    );
};

// ─── Password Strength Bar ────────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
    const calc = () => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    };
    const s = calc();
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#22C55E"];
    if (!password) return null;
    return (
        <View className="-mt-3 mb-4">
            <View className="flex-row gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                    <View
                        key={i}
                        className="flex-1 h-1.5 rounded-full"
                        style={{
                            backgroundColor: i <= s ? colors[s] : "#E5E7EB",
                        }}
                    />
                ))}
            </View>
            <Text className="text-xs mt-1.5" style={{ color: colors[s] }}>
                {labels[s]}
            </Text>
        </View>
    );
};

// ─── Password Rules Checklist ─────────────────────────────────────────────────
const PasswordChecklist = ({ password }) => {
    const rules = [
        ["At least 8 characters", password?.length >= 8],
        ["One uppercase letter", /[A-Z]/.test(password || "")],
        ["One number", /[0-9]/.test(password || "")],
        ["One special character", /[^A-Za-z0-9]/.test(password || "")],
    ];
    return (
        <View className="bg-gray-50 rounded-xl px-4 py-3 mb-5 gap-1.5">
            {rules.map(([hint, met]) => (
                <View key={hint} className="flex-row items-center gap-2">
                    <Text
                        style={{
                            color: met ? "#22C55E" : "#9CA3AF",
                            fontSize: 13,
                            lineHeight: 18,
                        }}
                    >
                        {met ? "✓" : "○"}
                    </Text>
                    <Text
                        className="text-xs"
                        style={{ color: met ? "#16A34A" : "#9CA3AF" }}
                    >
                        {hint}
                    </Text>
                </View>
            ))}
        </View>
    );
};

// ─── Info Banner ──────────────────────────────────────────────────────────────
const InfoBanner = ({ text }) => (
    <View className="flex-row items-start bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 gap-3 justify-center h-25 mt-15">
        <View className="text-blue-500 text-base w-[10%] justify-center items-center h-full">
            <Feather name="info" size={29} color="black" color="#1D4ED8" />
        </View>
        <View className=" flex-1 p-3 ">
            <Text className="flex-1 text-black text-[15px] leading-5">
                {text}
            </Text>
        </View>
    </View>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryButton = ({ label, onPress, loading, disabled }) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={loading || disabled}
        activeOpacity={0.85}
        className="bg-blue-600 rounded-2xl h-14 items-center justify-center"
        style={{
            shadowColor: "#2563EB",
            shadowOpacity: loading ? 0.1 : 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
            opacity: disabled ? 0.7 : 1,
        }}
    >
        {loading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text className="text-white text-base font-bold tracking-wide">
                {label}
            </Text>
        )}
    </TouchableOpacity>
);

// ════════════════════════════════════════════════════════════════════════════
//  STEP 1 — Enter Email
// ════════════════════════════════════════════════════════════════════════════
const Step1 = ({ onNext, onBack }) => {
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit } = useForm({ mode: "onTouched" });

    const onSubmit = async ({ email }) => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800)); // replace with real API call
        setLoading(false);
        onNext(email.trim());
    };

    return (
        <View className="flex-1">
            <TouchableOpacity
                onPress={onBack}
                className=" ml-1 w-9 h-9 items-center justify-center rounded-full"
            >
                <Ionicons name="chevron-back" size={26} color="#374151" />
            </TouchableOpacity>

            {/* Hero image + headings */}
            <View className="items-center mb-8">
                <Text className="text-4xl font-bold text-gray-900 mt-9">
                    Forgot Password?
                </Text>
                <StepIndicator current={1} total={3} />
                <Text className="text-gray-700 text-xs font-medium mt-1 tracking-wide uppercase">
                    Step 1 of 3
                </Text>
                <Image
                    source={FORGOT_PASSWORD_IMG}
                    className="w-70 h-70 rounded-full mt-6 mb-3 bg-blue-50"
                    resizeMode="cover"
                />
                <Text className="text-gray-700 text-[14px] text-center mt-3 px-6 leading-5">
                    Enter your registered email and we'll send you a one-time
                    code to reset your password.
                </Text>
            </View>

            {/* react-hook-form controlled email field */}
            <ControlledInput
                control={control}
                name="email"
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                leftIcon={<Fontisto name="email" size={24} color="black" />}
                rules={{
                    required: "Email is required.",
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address.",
                    },
                }}
            />

            <PrimaryButton
                label="Send OTP"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
            />

            <View className="flex-row justify-center mt-6">
                <Text className="text-gray-500 text-[14px]">
                    Remember your password?{" "}
                </Text>
                <TouchableOpacity onPress={onBack}>
                    <Text className="text-blue-600 text-[14px] font-semibold">
                        Log in
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ════════════════════════════════════════════════════════════════════════════
//  STEP 2 — Verify OTP
// ════════════════════════════════════════════════════════════════════════════
const Step2 = ({ email, onNext, onBack }) => {
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, setValue, watch } = useForm({
        mode: "onChange",
    });
    const otpValue = watch("otp", "");

    const maskedEmail = () => {
        const [name, domain] = email.split("@");
        return name.slice(0, 2) + "****@" + domain;
    };

    const onSubmit = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800)); // replace with real API call
        setLoading(false);
        onNext();
    };

    const {
        fieldState: { error: otpError },
        field: { onChange: rhfOnChange },
    } = useController({
        control,
        name: "otp",
        defaultValue: "",
        rules: {
            required: "Please enter the OTP.",
            minLength: {
                value: 6,
                message: "Please enter the complete 6-digit OTP.",
            },
        },
    });

    return (
        <View className="flex-1">
            <TouchableOpacity
                onPress={onBack}
                className=" ml-1 w-9 h-9 items-center justify-center rounded-full"
            >
                <Ionicons name="chevron-back" size={26} color="#374151" />
            </TouchableOpacity>

            <View className="items-center mb-8">
                <Text className="text-4xl font-bold text-gray-900 mt-12 mb-1">
                    Verify OTP
                </Text>
                <StepIndicator current={2} total={3} />
                <Text className="text-black text-xs font-medium mt-1 tracking-wide uppercase">
                    Step 2 of 3
                </Text>
                <Text className="text-gray-700 text-[16px] text-center mt-10 mb-4 px-6 leading-5">
                    Enter the 6-digit code sent to{"\n"}
                    <Text className="text-blue-600 font-semibold">{email}</Text>
                </Text>
            </View>

            <Text className="text-gray-700 text-[14px] font-medium mb-1.5">
                Enter OTP
            </Text>
            <OtpInput
                value={otpValue}
                onChange={(v) => rhfOnChange(v)}
                error={otpError}
            />

            <ResendTimer onResend={() => console.log("Resend OTP requested")} />

            <View className="mt-12">
                <PrimaryButton
                    label="Verify"
                    onPress={handleSubmit(onSubmit)}
                    loading={loading}
                />
            </View>

            <InfoBanner text="After verification, you will be able to reset your password." />
        </View>
    );
};

// ════════════════════════════════════════════════════════════════════════════
//  STEP 3 — Reset Password
// ════════════════════════════════════════════════════════════════════════════
const Step3 = ({ onBack, onDone }) => {
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, watch } = useForm({ mode: "onTouched" });
    const newPassword = watch("newPassword", "");

    const onSubmit = async ({ newPassword }) => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1000)); // replace with real API call
        setLoading(false);
        onDone?.();
    };

    return (
        <View className="flex-1">
            <TouchableOpacity
                onPress={onBack}
                className=" ml-1 w-9 h-9 items-center justify-center rounded-full"
            >
                <Ionicons name="chevron-back" size={26} color="#374151" />
            </TouchableOpacity>

            <View className="items-center mb-8">
                <Text className="text-4xl font-bold text-gray-900 mt-9">
                    Reset Password
                </Text>
                <StepIndicator current={1} total={3} />
                <Text className="text-gray-700 text-xs font-medium mt-1 tracking-wide uppercase">
                    Step 1 of 3
                </Text>
                <Image
                    source={require("../../assets/lock-open.png")}
                    className="w-50 h-50 rounded-full mt-6 mb-3 bg-blue-50"
                    resizeMode="cover"
                />

                <Text className="text-gray-500 text-sm text-center mt-3 px-6 leading-5">
                    Create a strong new password for your account.
                </Text>
            </View>

            {/* New Password */}
            <ControlledInput
                control={control}
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                secureEntry
                rules={{
                    required: "Password is required.",
                    minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters.",
                    },
                }}
            />

            {/* Strength meter — watches live value */}
            <PasswordStrength password={newPassword} />

            {/* Confirm Password */}
            <ControlledInput
                control={control}
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter new password"
                secureEntry
                rules={{
                    required: "Please confirm your password.",
                    validate: (val) =>
                        val === newPassword || "Passwords do not match.",
                }}
            />

            {/* Live checklist */}
            <PasswordChecklist password={newPassword} />

            <PrimaryButton
                label="Reset Password"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
            />
        </View>
    );
};

// ════════════════════════════════════════════════════════════════════════════
//  ROOT — ForgotPassword
//
//  Usage in navigator:
//    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
//
//  navigation.goBack() is called on step 1 back.
//  navigation.navigate("Login") is called after successful reset.
// ════════════════════════════════════════════════════════════════════════════
export default function ForgotPassword({ navigation }) {
    let goBackScreen = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");

    const goBack = () => {
        if (step === 1) goBackScreen.back();
        else setStep((s) => s - 1);
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "white",
            }}
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 px-2 pb-10">
                        {step === 1 && (
                            <Step1
                                onNext={(e) => {
                                    setEmail(e);
                                    setStep(2);
                                }}
                                onBack={goBack}
                            />
                        )}
                        {step === 2 && (
                            <Step2
                                email={email}
                                onNext={() => setStep(3)}
                                onBack={goBack}
                            />
                        )}
                        {step === 3 && (
                            <Step3
                                onBack={goBack}
                                onDone={() =>
                                    router.replace("/(rescuers)/login-rescuers")
                                }
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
