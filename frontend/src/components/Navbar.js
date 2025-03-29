import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "../App.css";

const Navbar = () => {
    const navigate = useNavigate();
    const { role, logout } = useAuth(); 

    const handleLogout = () => {
        logout(); 
        navigate("/login");
    };

    const logoLink = role ? "/dashboard" : "/";

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link className="logo" to={logoLink}>PG'S</Link>
                <div className="nav-links">
                    <Link className="nav-link" to="/menu">Menu</Link>

                    {role === "customer" && (
                        <>
                            <Link className="nav-link" to="/reservations">Reservations</Link>
                            <Link className="nav-link" to="/cart">Cart</Link>
                            <Link className="nav-link" to="/payments">Payments</Link>
                            <Link className="nav-link" to="/order_history">Orders</Link>

                        </>
                    )}

                    {role === "manager" && (
                        <>
                            <Link className="nav-link" to="/reservations">Reservations</Link>
                            <Link className="nav-link" to="/orders">Orders</Link>
                            <Link className="nav-link" to="/tables">Tables</Link>
                            <Link className="nav-link" to="/staff">Staff</Link>
                            <Link className="nav-link" to="/inventory">Inventory</Link>
                        </>
                    )}

                    {!role ? (
                        <>
                            <Link className="nav-link" to="/login">Login</Link>
                            <Link className="nav-link" to="/register">Register</Link>
                        </>
                    ) : (
                        <Link className="nav-link logout" onClick={handleLogout} to="/">Logout</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
