import { Tabs } from "expo-router";
import CustomTabBarRescue from "../../../components/CustomTabBarRescue";

export default function CreatorTabs() {
    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBarRescue {...props} />}
        >
            <Tabs.Screen name="dashboard" />
            <Tabs.Screen name="operations" />
            <Tabs.Screen name="helpline" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}
