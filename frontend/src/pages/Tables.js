import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 
import "../styles/tables.css";  

const Tables = () => {
    const { role, token } = useAuth(); 
    const [tables, setTables] = useState([]);
    const [newCapacity, setNewCapacity] = useState("");
    const [tableStatuses, setTableStatuses] = useState({});

    // Axios instance with token for authorization
    const authAxios = axios.create({
        baseURL: "http://127.0.0.1:5000",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });

    // Fetch tables on load
    useEffect(() => {
        if (role === "manager") fetchTables();
    }, [role]);

    const fetchTables = () => {
        authAxios.get("/tables/")
            .then(response => {
                setTables(response.data);
                // Initialize statuses for each table
                const initialStatuses = response.data.reduce((acc, table) => {
                    acc[table[0]] = table[2]; // Use current table status
                    return acc;
                }, {});
                setTableStatuses(initialStatuses);
            })
            .catch(error => console.error("Error fetching tables:", error));
    };

    // Add a new table
    const addTable = () => {
        authAxios.post("/tables/", { 
            capacity: newCapacity, 
            status: "available" 
        })
            .then(response => {
                alert(response.data.message);
                setNewCapacity("");  // Clear the input
                fetchTables();  // Refresh the table list
            })
            .catch(error => alert("Error adding table: " + error.response?.data?.error || "Failed to add table."));
    };

    // Update table status
    const updateTableStatus = (tableId, newStatus) => {
        authAxios.put(`/tables/${tableId}`, { status: newStatus })
            .then(response => {
                alert(response.data.message);
                fetchTables();  // Refresh the table list
            })
            .catch(error => alert("Error updating table status: " + error.response?.data?.error || "Failed to update table."));
    };

    // Handle status change for a specific table
    const handleStatusChange = (tableId, newStatus) => {
        setTableStatuses(prev => ({
            ...prev,
            [tableId]: newStatus
        }));
    };

    return (
        <div className="tables-page">
            <h1 className="tables-title">Manage Tables</h1>

            <div className="add-table-section">
                <h3>Add a New Table</h3>
                <input 
                    type="number" 
                    placeholder="Enter table capacity" 
                    value={newCapacity} 
                    onChange={(e) => setNewCapacity(e.target.value)} 
                />
                <button onClick={addTable} className="add-table-btn">Add Table</button>
            </div>

            <div className="tables-list">
                {tables.map((table) => (
                    <div key={table[0]} className="table-card">
                        <h3>Table ID: {table[0]}</h3>
                        <p>Capacity: {table[1]}</p>
                        <p>Status: {table[2]}</p>

                        <div className="table-actions">
                            <select 
                                value={tableStatuses[table[0]] || table[2]} 
                                onChange={(e) => handleStatusChange(table[0], e.target.value)}
                            >
                                <option value="available">Available</option>
                                <option value="occupied">Occupied</option>
                                <option value="reserved">Reserved</option>
                            </select>
                            <button 
                                onClick={() => updateTableStatus(table[0], tableStatuses[table[0]])} 
                                className="update-status-btn"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tables;