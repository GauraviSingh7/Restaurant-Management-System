import React from "react";
import "../styles/welcome.css";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        {/* Left Side - Text Section */}
        <div className="text-section">
          <h1 className="title">PG’S CAFE & BISTRO</h1>
          <p className="subtitle">Welcome to PG’s!<br/> View the menu if you’re just looking.<br/> Login if you like something and want to order!</p>
          
          <div className="button-group">
            <Link to="/menu" className="menu-button">Menu</Link>
            <Link to="/login" className="login-button">Login</Link>
          </div>
          
          <div className="register-section">
            <span className="small-btn-text">New here? </span>
            <Link to="/register" className="register-button">Register</Link>
          </div>
        </div>

        {/* Right Side - Image Section */}
        <div className="image-section">
          <img 
            src={require("../assets/cafeIMG.webp")} 
            alt="Cafe Scene" 
            className="cafe-image"
          />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
