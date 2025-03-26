import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/inventory.css";

const Inventory = () => {
    const { role, token } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [newItem, setNewItem] = useState({ name: "", quantity_available: "" });
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const authAxios = axios.create({
        baseURL: "http://localhost:5000",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    useEffect(() => {
        if (role === "manager") {
            fetchInventory();
        }
    }, [role]);

    // Search effect
    useEffect(() => {
        // Filter inventory based on search term
        const results = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredInventory(results);
    }, [searchTerm, inventory]);

    const fetchInventory = async () => {
        try {
            const response = await authAxios.get("/inventory/");
            setInventory(response.data);
            setFilteredInventory(response.data);
        } catch (err) {
            setError("Failed to fetch inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    const addInventoryItem = async (e) => {
        e.preventDefault();
        try {
            await authAxios.post("/inventory", newItem);
            setNewItem({ name: "", quantity_available: "" });
            fetchInventory();
        } catch (err) {
            setError("Failed to add inventory item");
        }
    };

    const startEditItem = (item) => {
        setEditingItem({
            inventory_item_id: item.inventory_item_id,
            name: item.name,
            quantity_available: item.quantity_available
        });
    };

    const handleEditInputChange = (e) => {
        setEditingItem({
            ...editingItem,
            [e.target.name]: e.target.value
        });
    };

    const saveEditedItem = async () => {
        try {
            await authAxios.put(`/inventory/${editingItem.inventory_item_id}`, {
                name: editingItem.name,
                quantity_available: editingItem.quantity_available
            });
            fetchInventory();
            setEditingItem(null);
        } catch (err) {
            setError("Failed to update inventory item");
        }
    };

    const cancelEdit = () => {
        setEditingItem(null);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // If not a manager, show unauthorized message
    if (role !== "manager") {
        return <div className="inventory-page">You are not authorized to view this page.</div>;
    }

    return (
        <div className="inventory-page">
            <h1 className="inventory-title">Inventory Management</h1>
            
            {/* Search Input */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search inventory items..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>

            {loading ? <p className="loading">Loading inventory...</p> : null}
            {error ? <p className="error">{error}</p> : null}
            
            <div className="inventory-list">
                {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                        <div key={item.inventory_item_id} className="inventory-card">
                            {editingItem && editingItem.inventory_item_id === item.inventory_item_id ? (
                                <>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editingItem.name}
                                        onChange={handleEditInputChange}
                                        placeholder="Item Name"
                                    />
                                    <input
                                        type="number"
                                        name="quantity_available"
                                        value={editingItem.quantity_available}
                                        onChange={handleEditInputChange}
                                        placeholder="Quantity"
                                    />
                                    <div className="Iedit-buttons">
                                        <button onClick={saveEditedItem} className="save-btn">Save</button>
                                        <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3>{item.name}</h3>
                                    <p>Available: {item.quantity_available}</p>
                                    <button 
                                        onClick={() => startEditItem(item)} 
                                        className="Iedit-btn"
                                    >
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-inventory">No inventory items found</p>
                )}
            </div>
            <form className="add-inventory-form" onSubmit={addInventoryItem}>
                <input
                    type="text"
                    name="name"
                    value={newItem.name}
                    onChange={handleInputChange}
                    placeholder="Item Name"
                    required
                />
                <input
                    type="number"
                    name="quantity_available"
                    value={newItem.quantity_available}
                    onChange={handleInputChange}
                    placeholder="Quantity Available"
                    required
                />
                <button type="submit" className="add-inventory-btn">Add Item</button>
            </form>
        </div>
    );
};

export default Inventory;