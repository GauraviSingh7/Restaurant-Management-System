import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 
import "../styles/reservations.css";

const Reservations = () => {
    const { role } = useAuth();
    const [reservationTime, setReservationTime] = useState("");
    const [capacity, setCapacity] = useState("");
    const [reservationDetails, setReservationDetails] = useState(null);
    const [error, setError] = useState("");

    const handleReserve = async () => {
        if (!reservationTime || !capacity) {
            setError("Please enter reservation time and capacity.");
            return;
        }

        try {
            const token = localStorage.getItem("token");  
            if (!token) {
                setError("You need to log in to make a reservation.");
                return;
            }

            const response = await axios.post(
                "http://127.0.0.1:5000/reservations/",
                {
                    reservation_time: reservationTime,
                    capacity: capacity
                },
                {
                    headers: { Authorization: `Bearer ${token}` }  // ✅ Send token properly
                }
            );

            setReservationDetails(response.data);
            setError("");
            setReservationTime("");  // ✅ Clear input fields
            setCapacity("");
        } catch (error) {
            console.error("Reservation Error:", error.response?.data?.error || error);
            setError(error.response?.data?.error || "Failed to make reservation");
        }
    };

    return (
        <div className="reservations-page">
            <h1 className="reservations-title">Book a Table</h1>

            {role !== "customer" ? (
                <p className="error-message">Only customers can make reservations.</p>
            ) : (
                <div className="reservation-form">
                    <label>Reservation Date & Time:</label>
                    <input
                        type="datetime-local"
                        value={reservationTime}
                        onChange={(e) => setReservationTime(e.target.value)}
                    />

                    <label>Capacity:</label>
                    <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        min="1"
                    />

                    <button className="reserve-btn" onClick={handleReserve}>
                        Reserve Now
                    </button>

                    {error && <p className="error-message">{error}</p>}

                    {reservationDetails && (
                        <div className="reservation-details">
                            <h3>Reservation Confirmed</h3>
                            <p><strong>Table ID:</strong> {reservationDetails.table_id}</p>
                            <p><strong>Status:</strong> Pending</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reservations;
