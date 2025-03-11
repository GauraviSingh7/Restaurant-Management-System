import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/reservations.css";

const Reservations = () => {
    const { role } = useAuth();
    const [reservationTime, setReservationTime] = useState("");
    const [capacity, setCapacity] = useState("");
    const [upcomingReservations, setUpcomingReservations] = useState([]);
    const [showReservations, setShowReservations] = useState();
    const [viewHistory, setViewHistory] = useState(false);
    const [reservationDetails, setReservationDetails] = useState(null);
    const [error, setError] = useState("");

    // Fetch upcoming reservations
    useEffect(() => {
        if (role === "customer") {
            fetchReservations();
        }
    }, [role]);

    const fetchReservations = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You need to log in to view reservations.");
                return;
            }

            const response = await axios.get(
                "http://127.0.0.1:5000/reservations/",
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUpcomingReservations(response.data);
        } catch (error) {
            console.error("Error fetching reservations:", error.response?.data?.error || error);
        }
    };

    const handleReserve = async (e) => {
        if (e) {
            e.preventDefault();
        }
        setError("");

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
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setReservationDetails(response.data);
            setReservationTime("");
            setCapacity("");
            fetchReservations(); // Refresh reservations list
        } catch (error) {
            console.error("Reservation Error:", error.response?.data?.error || error);
            setError(error.response?.data?.error || "Failed to make reservation");
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!reservationId) {
            console.error("Error: Missing reservation ID.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You need to log in to cancel a reservation.");
                return;
            }

            await axios.delete(`http://127.0.0.1:5000/reservations/cancel/${reservationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove canceled reservation from the UI
            setUpcomingReservations((prevReservations) =>
                prevReservations.filter((res) => res.reservation_id !== reservationId)
            );
        } catch (error) {
            console.error("Error canceling reservation:", error.response?.data?.error || error);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    };

    return (
        <div className="reservations-container">
            {/* Left: Reservation Form */}
            <div className="reservations-form-container">
                <h1 className="reservations-title">Book a Table</h1>
                {role !== "customer" ? (
                    <p className="reservations-error">Only customers can make reservations.</p>
                ) : (
                    <form className="reservations-form" onSubmit={handleReserve}>
                        <label className="reservations-label">Reservation Date & Time:</label>
                        <input
                            type="datetime-local"
                            className="reservations-input"
                            value={reservationTime}
                            onChange={(e) => setReservationTime(e.target.value)}
                            required
                        />
                        <label className="reservations-label">Capacity:</label>
                        <input
                            type="number"
                            className="reservations-input"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            min="1"
                            required
                        />
                        <button type="submit" className="reservations-btn">Reserve Now</button>
                        {error && <p className="reservations-error">{error}</p>}
                        {reservationDetails && (
                            <div className="reservation-details">
                                <h3>Reservation Confirmed</h3>
                                <p>Table ID: {reservationDetails.table_id}</p>
                                <p>Status: Reserved</p>
                            </div>
                        )}
                    </form>
                )}
            </div>
    
            {/* Right: Reservation Details */}
            {role === "customer" && (
                <div className="reservations-right">
                    <div className="reservations-buttons">
                        <button
                            className={`reservations-toggle-btn ${!viewHistory ? 'active' : ''}`}
                            onClick={() => {
                                setViewHistory(false);
                                setShowReservations(!showReservations);
                            }}
                        >
                            Upcoming Reservations
                        </button>
                        <button
                            className={`reservations-toggle-btn ${viewHistory ? 'active' : ''}`}
                            onClick={() => {
                                setViewHistory(true);
                                setShowReservations(!showReservations);
                            }}
                        >
                            Reservation History
                        </button>
                    </div>
    
                    {/* Upcoming Reservations List */}
                    {showReservations && (
                        <div className="reservations-list">
                            <h2 className="reservations-title">
                                {viewHistory ? "Reservation History" : "Upcoming Reservations"}
                            </h2>
                            {upcomingReservations.length === 0 ? (
                                <p className="reservations-error">No {viewHistory ? "past" : "upcoming"} reservations.</p>
                            ) : (
                                upcomingReservations.map((res, index) => (
                                    <div key={index} className="reservations-item">
                                        <p><strong>Date & Time:</strong> {formatDateTime(res.reservation_time)}</p>
                                        <p><strong>Table:</strong> {res.table_id}</p>
                                        <p><strong>Capacity:</strong> {res.capacity} People</p>
                                        <p><strong>Status:</strong> {res.status}</p>
                                        {res.status !== "cancelled" && (
                                            <button
                                                className="reservations-cancel-btn"
                                                onClick={() => handleCancelReservation(res.reservation_id)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reservations;
