import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/staff.css";  

const Staff = () => {
    const { role, token } = useAuth(); 
    const [staffList, setStaffList] = useState([]);
    const [newStaff, setNewStaff] = useState({ name: "", role: "waiter", salary: "", shift_timing: "" });
    const [editingStaff, setEditingStaff] = useState(null);

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

    // Handle updating staff
    const updateStaff = () => {
        if (!editingStaff) return;

        authAxios.put(`/staff/${editingStaff.staff_id}`, editingStaff)
            .then(response => {
                alert(response.data.message);
                setEditingStaff(null);
                fetchStaff();  // Refresh the staff list
            })
            .catch(error => alert("Error updating staff: " + error.response?.data?.error || "Failed to update staff."));
    };

    // Handle deleting staff
    const deleteStaff = (staffId) => {
        if (window.confirm("Are you sure you want to delete this staff member?")) {
            authAxios.delete(`/staff/${staffId}`)
                .then(response => {
                    alert(response.data.message);
                    fetchStaff();  // Refresh the staff list
                })
                .catch(error => alert("Error deleting staff: " + error.response?.data?.error || "Failed to delete staff."));
        }
    };

    return (
        <div className="staff-page">
            <h1 className="staff-title">Manage Staff</h1>

            <div className="add-staff-section">
                <h3>{editingStaff ? "Edit Staff" : "Add New Staff"}</h3>
                <input 
                    type="text" 
                    placeholder="Enter staff name" 
                    value={editingStaff ? editingStaff.name : newStaff.name} 
                    onChange={(e) => 
                        editingStaff 
                            ? setEditingStaff({ ...editingStaff, name: e.target.value })
                            : setNewStaff({ ...newStaff, name: e.target.value })
                    } 
                />
                <select 
                    value={editingStaff ? editingStaff.role : newStaff.role} 
                    onChange={(e) => 
                        editingStaff
                            ? setEditingStaff({ ...editingStaff, role: e.target.value })
                            : setNewStaff({ ...newStaff, role: e.target.value })
                    }
                >
                    <option value="waiter">Waiter</option>
                    <option value="chef">Chef</option>
                </select>
                <input 
                    type="number" 
                    placeholder="Enter salary" 
                    value={editingStaff ? editingStaff.salary : newStaff.salary} 
                    onChange={(e) => 
                        editingStaff
                            ? setEditingStaff({ ...editingStaff, salary: e.target.value })
                            : setNewStaff({ ...newStaff, salary: e.target.value })
                    } 
                />
                <input 
                    type="text" 
                    placeholder="Enter shift timing" 
                    value={editingStaff ? editingStaff.shift_timing : newStaff.shift_timing} 
                    onChange={(e) => 
                        editingStaff
                            ? setEditingStaff({ ...editingStaff, shift_timing: e.target.value })
                            : setNewStaff({ ...newStaff, shift_timing: e.target.value })
                    } 
                />
                {editingStaff ? (
                    <>
                        <button onClick={updateStaff} className="update-staff-btn">Update Staff</button>
                        <button onClick={() => setEditingStaff(null)} className="Scancel-btn">Cancel</button>
                    </>
                ) : (
                    <button onClick={addStaff} className="add-staff-btn">Add Staff</button>
                )}
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
                            <div className="staff-actions">
                                <button 
                                    onClick={() => setEditingStaff(staff)} 
                                    className="Sedit-btn"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => deleteStaff(staff.staff_id)} 
                                    className="Sdelete-btn"
                                >
                                    Lay off
                                </button>
                            </div>
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