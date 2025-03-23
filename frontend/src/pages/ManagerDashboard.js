import React from "react";
import "../styles/ManagerDashboard.css";
import drinksImage from "../assets/mDrinks.png";
import dumplingImage from "../assets/dumpling.png";


const ManagerDashboard = () => {
    return (
        <div className="manager-dashboard">
            
            <h1 className="welcome-message">HEY, MANAGER!</h1>
            
            <img src={dumplingImage} alt="dumpling" className="dumpling" />
            <img src={drinksImage} alt="Drinks" className="Drinks" />

            <div className="desc">
                <p>
                    Oversee restaurant operations,</p>
                <p>manage staff, inventory, and orders.</p>
            </div>
        </div>
    );
};

export default ManagerDashboard;