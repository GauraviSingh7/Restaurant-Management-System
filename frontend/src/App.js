import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext"; // Import CartProvider
import Navbar from "./components/Navbar";

// Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import CustomerDashboard from "./pages/CustomerDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Orders from "./pages/Orders";
import Reservations from "./pages/Reservations";
import Staff from "./pages/Staff";
import Inventory from "./pages/Inventory";
import Payments from "./pages/Payments";
import Tables from "./pages/Tables";
import Cart from "./pages/Cart";
import PageNotFound from "./pages/PageNotFound";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
    return (
        <AuthProvider> {/* Auth Context */}
            <CartProvider> {/* Cart Context */}
                <Router>
                    <Routes>
                        {/* Home Route */}
                        <Route path="/" element={<Welcome />} />

                        {/* Routes that depend on authentication */}
                        <Route path="*" element={<DefaultRoutes />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
};

const DefaultRoutes = () => {
    const { role } = useAuth(); 

    // Function to determine the correct dashboard
    const getDashboard = () => {
        if (role === "customer") return <CustomerDashboard />;
        if (role === "manager") return <ManagerDashboard />;
        return <PageNotFound />;
    };

    return (
        <div>
            <Navbar /> {/* ✅ Navbar updates dynamically based on role */}
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Common Routes */}
                <Route path="/menu" element={<Menu />} />
                <Route path="/dashboard" element={role ? getDashboard() : <PageNotFound />} />

                {/* Customer-Specific Routes */}
                {role === "customer" && (
                    <>
                        <Route path="/order_history" element={<Orders />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/reservations" element={<Reservations />} />
                    </>
                )}

                {/* Manager-Specific Routes */}
                {role === "manager" && (
                    <>
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/tables" element={<Tables />} />
                        <Route path="/staff" element={<Staff />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/reservations" element={<Reservations />} />
                    </>
                )}

                {/* Catch-All Page Not Found */}
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </div>
    );
};

export default App;
