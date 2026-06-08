import { Stack } from "expo-router";
import "../global.css";
import {AuthProvider} from "../context/AuthContext";
import {AppProvider} from "../context/AppContext";

export default function Layout() {
    return (
        <AppProvider>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
        </AppProvider>
    );
}
