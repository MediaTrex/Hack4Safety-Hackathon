import { Tabs } from "expo-router";
import CustomTabBarCitizen from "../../../components/CustomTabBarCitizen";

export default function CreatorTabs() {
    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBarCitizen {...props} />}
        >
            <Tabs.Screen name="home" />
            <Tabs.Screen name="map" />
            <Tabs.Screen name="sos" />
            <Tabs.Screen name="alerts" />
            <Tabs.Screen name="helpline" />
        </Tabs>
    );
}
