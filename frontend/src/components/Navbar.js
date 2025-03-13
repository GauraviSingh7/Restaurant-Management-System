import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";  // ✅ Import useAuth
import "../App.css";

const Navbar = () => {
    const navigate = useNavigate();
    const { role, logout } = useAuth(); // Use logout method from context

    const handleLogout = () => {
        logout(); // Use the logout method from AuthContext
        navigate("/login");
    };

    // Determine the logo link based on role
    let logoLink = "/";
    if (role === "customer") {
        logoLink = "/dashboard";
    } else if (role === "manager") {
        logoLink = "/dashboard";
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link className="logo" to={logoLink}>PG'S</Link>
                <div className="nav-links">
                    <Link className="nav-link" to="/menu">Menu</Link>
                    {role === "customer" && <Link className="nav-link" to="/reservations">Reservations</Link>}
                    {role === "customer" && <Link className="nav-link" to="/cart">Cart</Link>}
                    {role === "customer" && <Link className="nav-link" to="/payments">Payments</Link>}
                    {role === "manager" && <Link className="nav-link" to="/orders">Orders</Link>}
                    {role === "manager" && <Link className="nav-link" to="/tables">Tables</Link>}
                    {role === "manager" && <Link className="nav-link" to="/staff">Staff</Link>}
                    {role === "manager" && <Link className="nav-link" to="/users">Users</Link>}
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
