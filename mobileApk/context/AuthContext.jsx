import { createContext, useContext, useEffect, useState } from "react";
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
        role: "citizen",
    });

    function saveUser(user) {
        AsyncStorage.setItem("user", JSON.stringify(user)).then(() => {
            setUser(user);
        });
    }

    async function logoutCitizen() {
        setUser(null);
        await AsyncStorage.removeItem("user");
    }

    return (
        <AuthContext.Provider value={{ user, logoutCitizen, saveUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
