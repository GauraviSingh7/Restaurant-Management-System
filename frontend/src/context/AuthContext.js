import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [role, setRole] = useState(localStorage.getItem("role") || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            console.log("No token found, user not authenticated");
            setRole(null);
            setToken(null);
            return;
        }

        axios.get("http://127.0.0.1:5000/get-role", {
            headers: { "Authorization": `Bearer ${storedToken}` },
            withCredentials: true
        })
        .then(response => {
            console.log("User Role:", response.data.role);
            setRole(response.data.role);
            setToken(storedToken);
            localStorage.setItem("role", response.data.role);
        })
        .catch(error => {
            console.error("Failed to fetch role:", error.response?.data?.msg || error);
            setRole(null);
            setToken(null);
            localStorage.removeItem("role");
            localStorage.removeItem("token");
        });
    }, []);

    // Function to set token when logging in
    const login = (newToken, newRole) => {
        setToken(newToken);
        setRole(newRole);
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", newRole);
    };

    // Function to logout
    const logout = () => {
        setToken(null);
        setRole(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    };

    return (
        <AuthContext.Provider value={{ role, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};