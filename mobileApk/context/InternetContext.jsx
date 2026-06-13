import React, { createContext, useContext, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export const InternetContext = createContext();

export const InternetProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const connected =
                state.isConnected === true &&
                state.isInternetReachable !== false;

            setIsConnected(connected);
            setChecked(true);
        });

        return () => unsubscribe();
    }, []);

    return (
        <InternetContext.Provider value={{ isConnected, checked }}>
            {children}
        </InternetContext.Provider>
    );
};

export const useInternet = () => useContext(InternetContext);
