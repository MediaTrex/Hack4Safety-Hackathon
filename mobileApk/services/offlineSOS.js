import * as Location from "expo-location";
import SendSMS from "react-native-sms";
import AsyncStorage from "@react-native-async-storage/async-storage";

const POLICE_NUMBER = "100"; // Nepal Police

export const getLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return null;
        const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });
        return loc.coords;
    } catch (e) {
        return null;
    }
};

export const sendSOSSms = async () => {
    const coords = await getLocation();

    const locationText = coords
        ? `My location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`
        : "Location unavailable";

    const body = `SOS ALERT! I need help. ${locationText}. Time: ${new Date().toLocaleString("ne-NP")}`;

    return new Promise((resolve) => {
        SendSMS.send(
            {
                body,
                recipients: [POLICE_NUMBER],
                successTypes: ["sent", "queued"],
            },
            (completed, cancelled, error) => {
                resolve({ completed, cancelled, error, coords });
            },
        );
    });
};

export const markOpenedByShortcut = async () => {
    await AsyncStorage.setItem("openedByShortcut", "true");
};

export const wasOpenedByShortcut = async () => {
    const val = await AsyncStorage.getItem("openedByShortcut");
    await AsyncStorage.removeItem("openedByShortcut"); // clear after reading
    return val === "true";
};
