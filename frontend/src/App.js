import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";  // Import CartProvider
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Reservations from "./pages/Reservations";
import Staff from "./pages/Staff";
import Inventory from "./pages/Inventory";
import Payments from "./pages/Payments";
import Tables from "./pages/Tables";
import CustomerDashboard from "./pages/CustomerDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Welcome from "./pages/Welcome";
import Cart from "./pages/Cart"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

const App = () => {
    return (
        <AuthProvider>  {/* ✅ Wrap entire app in AuthProvider */}
            <CartProvider>  {/* ✅ Wrap entire app in CartProvider */}
                <Router>
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="*" element={<DefaultRoutes />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
};

const DefaultRoutes = () => {
    const { role } = useAuth();  // ✅ Get role from Context

    const getDashboard = () => {
        switch (role) {
            case "customer":
                return <CustomerDashboard />;
            case "manager":
                return <ManagerDashboard />;
            default:
                return <Navigate to="/login" />;
        }
    };

    return (
        <div>
            <Navbar /> {/* ✅ Navbar updates dynamically */}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/dashboard" element={getDashboard()} />
                <Route path="/cart" element={role === "customer" ? <Cart /> : <Navigate to="/" />} /> {/* Cart Page */}
                <Route path="/orders" element={role === "manager" ? <Orders /> : <Navigate to="/" />} />
                <Route path="/reservations" element={role === "customer" || role === "manager" ? <Reservations /> : <Navigate to="/menu" />} />
                <Route path="/tables" element={role === "manager" ? <Tables /> : <Navigate to="/" />} />
                <Route path="/payments" element={role === "customer" || role === "manager" ? <Payments /> : <Navigate to="/" />} />
                <Route path="/staff" element={role === "manager" ? <Staff /> : <Navigate to="/" />} />
                <Route path="/inventory" element={role === "manager" ? <Inventory /> : <Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default App;
