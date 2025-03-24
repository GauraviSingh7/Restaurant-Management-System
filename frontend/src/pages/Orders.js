import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 
import "../styles/orders.css";  

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [statusMap, setStatusMap] = useState({});  // Track status for each order
    const { role, token } = useAuth();

    const authAxios = axios.create({
        baseURL: "http://127.0.0.1:5000",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });

    useEffect(() => {
        if (role === "manager") fetchOrders();
    }, [role]);

    const fetchOrders = () => {
        authAxios.get("/orders/")
            .then(response => setOrders(response.data))
            .catch(error => console.error("Error fetching orders:", error));
    };

    const updateOrderStatus = (orderId) => {
        const newStatus = statusMap[orderId];
        if (!newStatus) {
            alert("Please select a status.");
            return;
        }

        authAxios.put(`/orders/${orderId}/status`, { status: newStatus })
            .then(() => fetchOrders())  // Refresh orders after update
            .catch(error => alert(`Error updating status: ${error.response?.data?.error || 'Unable to update order status'}`));
    };

    const handleStatusChange = (orderId, status) => {
        setStatusMap(prev => ({ ...prev, [orderId]: status }));
    };

    return (
        <div className="orders-page">
            <h1 className="orders-title">Manage Orders</h1>

            {orders.length > 0 ? (
                <div className="orders-list">
                    {orders.map((order) => {
                        const totalAmount = parseFloat(order.total_amount);
                        return (
                            <div key={order.order_id} className="order-card">
                                <h3>Order ID: {order.order_id}</h3>
                                <p>Customer ID: {order.customer_id}</p>
                                <p>Total Amount: {!isNaN(totalAmount) ? `$${totalAmount.toFixed(2)}` : "N/A"}</p>
                                <p>Status: {order.status}</p>
                                <p>Table ID: {order.table_id}</p>

                                <div className="status-update">
                                    <select 
                                        value={statusMap[order.order_id] || ""} 
                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <button 
                                        onClick={() => updateOrderStatus(order.order_id)} 
                                        className="update-status-btn"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default Orders;
