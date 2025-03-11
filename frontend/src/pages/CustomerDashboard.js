import React from "react";
import "../styles/CustomerDashboard.css";
import drinksImage from "../assets/drinks.png";
import pizzaImage from "../assets/custPizaa.png";

const CustomerDashboard = () => {
    return (
        <div className="customer-dashboard">
            
            <h1 className="welcome-message">HEY, USERNAME</h1>
            
            <img src={drinksImage} alt="Drinks" className="image-left" />
            <img src={pizzaImage} alt="Pizza" className="image-right" />

            <div className="discount-box">
                <p>
                    USE CODE: <span class="bold-word">FULLMARKS20</span>
                    <br />
                    TO GET A 100% DISCOUNT!!!
                </p>
            </div>
        </div>
    );
};

export default CustomerDashboard;