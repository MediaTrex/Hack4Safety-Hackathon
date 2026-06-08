import { Tabs } from "expo-router";

export default function CreatorTabs() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="home" />
            <Tabs.Screen name="map" />
            <Tabs.Screen name="sos" />
            <Tabs.Screen name="alerts" />
            <Tabs.Screen name="helpline" />
        </Tabs>
    );
}
