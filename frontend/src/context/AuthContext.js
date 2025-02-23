import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
    const [role, setRole] = useState(localStorage.getItem("role") || null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("No token found, user not authenticated");
            setRole(null);
            return;
        }

        axios.get("http://127.0.0.1:5000/get-role", {
            headers: { "Authorization": `Bearer ${token}` },
            withCredentials: true
        })
        .then(response => {
            console.log("User Role:", response.data.role);
            setRole(response.data.role);
            localStorage.setItem("role", response.data.role);
        })
        .catch(error => {
            console.error("Failed to fetch role:", error.response?.data?.msg || error);
            setRole(null);
            localStorage.removeItem("role");
            localStorage.removeItem("token");
        });
    }, []);

    return (
        <AuthContext.Provider value={{ role, setRole }}>
            {children}
        </AuthContext.Provider>
    );
};