import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    useEffect(() => {
        AsyncStorage.getItem("user").then((user) => {
            if (user) {
                setUser(JSON.parse(user));
            }
        });
    }, []);

    const [user, setUser] = useState({
        id: "1",
        role: "citizen",
    });

    function saveUser(user) {
        AsyncStorage.setItem("user", JSON.stringify(user)).then(() => {
            setUser(user);
        });
    }

    function logoutCitizen() {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, logoutCitizen , saveUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
