import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import * as Location from "expo-location";

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
    const [state, setState] = useState({
        latitude: null,
        longitude: null,
        accuracy: null,
        address: {
            city: null,
            district: null,
            region: null,
            country: null,
            street: null,
            postalCode: null,
        },
        permissionStatus: "undetermined",
        isLoading: true,
        error: null,
    });

    const isFetching = useRef(false);

    const fetchLocationAndAddress = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            let coords = null;

            try {
                const result = await Promise.race([
                    Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("timeout")), 10000),
                    ),
                ]);
                coords = result.coords;
            } catch {
                const last = await Location.getLastKnownPositionAsync();
                if (last) coords = last.coords;
            }

            if (!coords) {
                throw new Error(
                    "Could not determine location. Make sure GPS is enabled.",
                );
            }

            const [raw] = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
            });

            setState((prev) => ({
                ...prev,
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy ?? null,
                address: {
                    city: raw?.city ?? null,
                    district: raw?.district ?? null,
                    region: raw?.region ?? null,
                    country: raw?.country ?? null,
                    street: raw?.street ?? null,
                    postalCode: raw?.postalCode ?? null,
                },
                isLoading: false,
                error: null,
            }));
        } catch (err) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: err?.message ?? "Failed to get location",
            }));
        } finally {
            isFetching.current = false;
        }
    }, []);

    const requestPermission = useCallback(async () => {
        const { status: existing } =
            await Location.getForegroundPermissionsAsync();

        if (existing === "granted") {
            setState((prev) => ({ ...prev, permissionStatus: "granted" }));
            await fetchLocationAndAddress();
            return true;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        const granted = status === "granted";

        setState((prev) => ({
            ...prev,
            permissionStatus: granted ? "granted" : "denied",
            isLoading: false,
            error: granted ? null : "Location permission denied",
        }));

        if (granted) await fetchLocationAndAddress();
        return granted;
    }, [fetchLocationAndAddress]);

    useEffect(() => {
        requestPermission();
    }, []);

    

    return (
        <AppContext.Provider value={{ ...state, requestPermission }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx)
        throw new Error("useAppContext must be used inside <AppProvider>");
    return ctx;
}

export default AppContext;
