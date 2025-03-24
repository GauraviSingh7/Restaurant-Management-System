import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/staff.css";  

const Staff = () => {
    const { role, token } = useAuth(); 
    const [staffList, setStaffList] = useState([]);
    const [newStaff, setNewStaff] = useState({ name: "", role: "waiter", salary: "", shift_timing: "" });

    const authAxios = axios.create({
        baseURL: "http://127.0.0.1:5000",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });

    useEffect(() => {
        if (role === "manager") fetchStaff();
    }, [role]);

    const fetchStaff = () => {
        authAxios.get("/staff/")
            .then(response => setStaffList(response.data))
            .catch(error => console.error("Error fetching staff:", error));
    };

    // Handle adding new staff
    const addStaff = () => {
        authAxios.post("/staff/", newStaff)
            .then(response => {
                alert(response.data.message);
                setNewStaff({ name: "", role: "waiter", salary: "", shift_timing: "" });  // Reset form fields
                fetchStaff();  // Refresh the staff list
            })
            .catch(error => alert("Error adding staff: " + error.response?.data?.error || "Failed to add staff."));
    };

    return (
        <div className="staff-page">
            <h1 className="staff-title">Manage Staff</h1>

            <div className="add-staff-section">
                <h3>Add New Staff</h3>
                <input 
                    type="text" 
                    placeholder="Enter staff name" 
                    value={newStaff.name} 
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} 
                />
                <select 
                    value={newStaff.role} 
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                >
                    <option value="waiter">Waiter</option>
                    <option value="chef">Chef</option>
                </select>
                <input 
                    type="number" 
                    placeholder="Enter salary" 
                    value={newStaff.salary} 
                    onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })} 
                />
                <input 
                    type="text" 
                    placeholder="Enter shift timing" 
                    value={newStaff.shift_timing} 
                    onChange={(e) => setNewStaff({ ...newStaff, shift_timing: e.target.value })} 
                />
                <button onClick={addStaff} className="add-staff-btn">Add Staff</button>
            </div>

            {/* Display all staff */}
            <div className="staff-list">
                {staffList.length > 0 ? (
                    staffList.map((staff) => (
                        <div key={staff.staff_id} className="staff-card">
                            <h3>Name: {staff.name}</h3>
                            <p>Role: {staff.role}</p>
                            <p>Salary: ${staff.salary}</p>
                            <p>Shift Timing: {staff.shift_timing}</p>
                        </div>
                    ))
                ) : (
                    <p>No staff members found.</p>
                )}
            </div>
        </div>
    );
};

export default Staff;
