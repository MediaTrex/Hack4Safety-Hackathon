import { createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export const AppContext = createContext();
export const AppProvider = ({ children }) => {
    let [language, setLanguage] = useState("en");

    const changeLanguage = async (lang) => {
        await AsyncStorage.setItem("language", lang);
        setLanguage(lang);
    };

    return (
        <AppContext.Provider value={{ language, changeLanguage }}>
            {children}
        </AppContext.Provider>
    );
};

