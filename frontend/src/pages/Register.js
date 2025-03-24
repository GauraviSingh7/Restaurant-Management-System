import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/register.css";

const Register = () => {
    const { login } = useAuth();  // Add login method from context
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        // Input validation
        if (!name || !email || !password || !role) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:5000/auth/register", {
                name,
                email,
                password,
                role
            });

            console.log(response.data);
            
            // Automatically login after successful registration
            const loginResponse = await axios.post(
                "http://127.0.0.1:5000/auth/login", 
                { email, password, role },
                { withCredentials: true }
            );

            if (loginResponse.data.access_token) {
                login(loginResponse.data.access_token, loginResponse.data.role);
                alert("Registration and Login Successful!");
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Registration Error:", error.response?.data?.error || error);
            alert(error.response?.data?.error || "Registration Failed");
        }
    };

    return (
        <div className="main-RegContainer">
        <div className="register-container">
            <div className="register-form">
                <h2 className="register-title">REGISTER</h2>
                <label className="input-label">USERNAME</label>
                <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter a username"
                />
                <label className="input-label">EMAIL</label>
                <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                />
                <label className="input-label">PASSWORD</label>
                <input
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                />
                <label className="input-label">ROLE</label>
                <select
                    className="input-field"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="" disabled>
                        Select a role
                    </option>
                    <option value="customer">Customer</option>
                    {/* <option value="manager">Manager</option> */}
                </select>
                <button className="register-btn" onClick={handleRegister}>
                    REGISTER
                </button>
            </div>

            <img
                src={require("../assets/registerPizza.jpeg")} 
                alt="Register Illustration"
                className="register-image"
            />
        </div>
        </div>
    );
};

export default Register;