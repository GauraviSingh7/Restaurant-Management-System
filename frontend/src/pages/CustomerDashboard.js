import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/CustomerDashboard.css";
import drinksImage from "../assets/drinks.png";
import pizzaImage from "../assets/custPizaa.png";

const CustomerDashboard = () => {
    const [username, setUsername] = useState("");
    const token = localStorage.getItem("token");

    const authAxios = axios.create({
        baseURL: "http://127.0.0.1:5000",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    });

    useEffect(() => {
        fetchUsername();
    }, []);

    const fetchUsername = () => {
        authAxios.get("/auth/username")
            .then(response => {
                setUsername(response.data.username);
            })
            .catch(error => console.error("Error fetching username:", error));
    };

    return (
        <div className="customer-dashboard">
            <h1 className="Cwelcome-message">HEY, {username || "USER"}</h1>

            <img src={drinksImage} alt="Drinks" className="image-left" />
            <img src={pizzaImage} alt="Pizza" className="image-right" />

            <div className="discount-box">
                <p>
                    USE CODE: <span className="bold-word">FULLMARKS20</span>
                    <br />
                    TO GET A 100% DISCOUNT!!!
                </p>
            </div>

            <div className="info-box">
                <h2>Loyalty Points</h2>
                <p>Contact the front desk to check your loyalty points!</p>
            </div>

        </div>
    );
};

export default CustomerDashboard;
