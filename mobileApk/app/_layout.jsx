import { Stack } from "expo-router";
import "../global.css";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { InternetProvider } from "../context/InternetContext";

export default function Layout() {
    

    return (
        <InternetProvider>
            <AppProvider>
                <AuthProvider>
                    <SafeAreaProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                        <Toast />
                    </SafeAreaProvider>
                </AuthProvider>
            </AppProvider>
        </InternetProvider>
    );
}
