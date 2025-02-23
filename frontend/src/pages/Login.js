import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";  // ✅ Import AuthContext
import "../App.css"; // Import the custom CSS

const Login = () => {
    const { setRole } = useAuth();  // ✅ Use Context to update role globally
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRoleLocal] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password || !role) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/auth/login",
                { email, password, role },
                { withCredentials: true }
            );

            console.log("Login Response:", response.data);  // Debugging

            // ✅ Ensure token is stored
            if (response.data.access_token) {
                localStorage.setItem("token", response.data.access_token);
                localStorage.setItem("role", response.data.role);
                setRole(response.data.role);  // ✅ Update Context so Navbar updates instantly
                alert("Login Successful!");

                // Redirect user based on role
                navigate(response.data.role === "customer" ? "/CustomerDashboard" : "/ManagerDashboard");
            } else {
                alert("No token received from server!");
            }
        } catch (error) {
            console.error("Login Error:", error.response?.data?.error || error);
            alert(error.response?.data?.error || "Login Failed");
        }
    };

    return (
        <div className="main-container">
            <div className="login-container">
                <div className="login-image">
                    <img 
                        src={require("../assets/loginCake.jpeg")} 
                        alt="Decorative" 
                        className="login-image"
                    />
                </div>
                <div className="login-form">
                    <h1 className="login-title">LOGIN</h1>
                    <form>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                        <label>Role</label>
                        <select value={role} onChange={(e) => setRoleLocal(e.target.value)} required>
                            <option value="" disabled>Select a role</option>
                            <option value="customer">Customer</option>
                            <option value="manager">Manager</option>
                        </select>

                        <button type="button" className="login-btn" onClick={handleLogin}>
                            LOGIN
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
