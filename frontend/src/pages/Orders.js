import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 
import "../styles/orders.css";  

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]); // For search functionality
    const [statusMap, setStatusMap] = useState({}); 
    const [searchQuery, setSearchQuery] = useState(""); // Search bar input
    const { role, token } = useAuth();

    const authAxios = axios.create({
        baseURL: "http://127.0.0.1:5000",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });

    useEffect(() => {
        if (role === "manager") {
            fetchOrders();
        } else if (role === "customer") {
            fetchOrderHistory();
        }
    }, [role]);

    // ✅ Manager: Fetch all orders
    const fetchOrders = () => {
        authAxios.get("http://127.0.0.1:5000/orders/")
            .then(response => {
                setOrders(response.data);
                setFilteredOrders(response.data); // Initially, filteredOrders = all orders
            })
            .catch(error => console.error("Error fetching orders:", error));
    };

    // ✅ Customer: Fetch their order history
    const fetchOrderHistory = () => {
        authAxios.get("http://127.0.0.1:5000/orders/order_history")
            .then(response => setOrders(response.data))
            .catch(error => console.error("Error fetching order history:", error));
    };

    // ✅ Manager: Update order status
    const updateOrderStatus = (orderId) => {
        const newStatus = statusMap[orderId];
        if (!newStatus) {
            alert("Please select a status.");
            return;
        }

        authAxios.put(`/orders/${orderId}/status`, { status: newStatus })
            .then(() => fetchOrders()) 
            .catch(error => alert(`Error updating status: ${error.response?.data?.error || 'Unable to update order status'}`));
    };

    // ✅ Track selected status in dropdown (Manager)
    const handleStatusChange = (orderId, status) => {
        setStatusMap(prev => ({ ...prev, [orderId]: status }));
    };

    // ✅ Manager: Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === "") {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order => 
                order.order_id.toString().includes(query)
            );
            setFilteredOrders(filtered);
        }
    };

    return (
        <div className="orders-page">
            <h1 className="orders-title">
                {role === "manager" ? "Manage Orders" : "Your Order History"}
            </h1>

            {/* 🔍 Search Bar (Only for Managers) */}
            {role === "manager" && (
                <input
                    type="text"
                    placeholder="Search by Order ID..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            )}

            {orders.length > 0 ? (
                <div className="orders-list">
                    {(role === "manager" ? filteredOrders : orders).map((order) => {
                        const totalAmount = parseFloat(order.total_amount);
                        
                        return (
                            <div key={order.order_id} className="order-card">
                                <h3>Order ID: {order.order_id}</h3>
                                <p>Status: {order.status}</p>
                                <p>Total Amount: ${!isNaN(totalAmount) ? totalAmount.toFixed(2) : "N/A"}</p>
                                <p>Ordered On: {new Date(order.created_at).toLocaleString()}</p>

                                {/* Customer View: Show ordered items */}
                                {role === "customer" && order.items && (
                                    <>
                                        <p>Items Ordered:</p>
                                        <ul>
                                            {order.items.map((item) => (
                                                <li key={item.menu_item_id}>
                                                    {item.quantity}x {item.name} - ${parseFloat(item.price).toFixed(2)}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {/* Manager View: Order status update */}
                                {role === "manager" && (
                                    <div className="status-update">
                                        <select 
                                            value={statusMap[order.order_id] || ""} 
                                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <button 
                                            onClick={() => updateOrderStatus(order.order_id)} 
                                            className="update-status-btn"
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                )}
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
