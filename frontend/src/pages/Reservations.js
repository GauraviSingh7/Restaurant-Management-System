import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/reservations.css";

const Reservations = () => {
    const { role } = useAuth();
    const [reservationTime, setReservationTime] = useState("");
    const [capacity, setCapacity] = useState("");
    const [upcomingReservations, setUpcomingReservations] = useState([]);
    const [reservationHistory, setReservationHistory] = useState([]);
    const [showReservationForm, setShowReservationForm] = useState(false);
    const [showReservations, setShowReservations] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [reservationDetails, setReservationDetails] = useState(null);
    const [error, setError] = useState("");

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

            const response = await axios.get("http://127.0.0.1:5000/reservations/", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const upcoming = response.data.filter(res => res.status !== "cancelled");
            const history = response.data.filter(res => res.status === "cancelled");

            setUpcomingReservations(upcoming);
            setReservationHistory(history);
        } catch (error) {
            console.error("Error fetching reservations:", error.response?.data?.error || error);
        }
    };

    const handleReserve = async (e) => {
        e.preventDefault();
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

            const response = await axios.post("http://127.0.0.1:5000/reservations/", {
                reservation_time: reservationTime,
                capacity: capacity,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setReservationDetails(response.data);
            setReservationTime("");
            setCapacity("");
            fetchReservations();
        } catch (error) {
            console.error("Reservation Error:", error.response?.data?.error || error);
            setError(error.response?.data?.error || "Failed to make reservation");
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You need to log in to cancel a reservation.");
                return;
            }

            await axios.delete(`http://127.0.0.1:5000/reservations/cancel/${reservationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchReservations();
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
            <h2 className="reservations-title">Reservations</h2>
            <div className="reservations-buttons">
                <button className="reservations-btn" onClick={() => {
                    setShowReservationForm(true);
                    setShowReservations(false);
                    setShowHistory(false);
                }}>Make a Reservation</button>

                <button className="reservations-btn" onClick={() => {
                    setShowReservationForm(false);
                    setShowReservations(true);
                    setShowHistory(false);
                }}>Upcoming Reservations</button>

                <button className="reservations-btn" onClick={() => {
                    setShowReservationForm(false);
                    setShowReservations(false);
                    setShowHistory(true);
                }}>Reservation History</button>
            </div>
            {/* Reservation Form */}
            {showReservationForm && role === "customer" && (
                <div className="reservations-form-container">
                    <h3>Book a Table</h3>
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
                        <button type="submit" className="reservations-reserve-btn">Reserve Now</button>
                        {error && <p className="reservations-error">{error}</p>}
                        {reservationDetails && (
                            <div className="reservation-details">
                                <h3>Reservation Confirmed</h3>
                                <p>Table ID: {reservationDetails.table_id}</p>
                                <p>Status: Reserved</p>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Upcoming Reservations */}
            {showReservations && (
                <div className="reservations-list">
                    <h3>Upcoming Reservations</h3>
                    {upcomingReservations.length === 0 ? (
                        <p className="reservations-error">No upcoming reservations.</p>
                    ) : (
                        upcomingReservations.map((res) => (
                            <div key={res.reservation_id} className="reservations-item">
                                <p><strong>Date & Time:</strong> {formatDateTime(res.reservation_time)}</p>
                                <p><strong>Table:</strong> {res.table_id}</p>
                                <p><strong>Capacity:</strong> {res.capacity} People</p>
                                <p><strong>Status:</strong> {res.status}</p>
                                <button
                                    className="reservations-cancel-btn"
                                    onClick={() => handleCancelReservation(res.reservation_id)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Reservation History */}
            {showHistory && (
                <div className="reservations-list">
                    <h3>Reservation History</h3>
                    {reservationHistory.length === 0 ? (
                        <p className="reservations-error">No past reservations.</p>
                    ) : (
                        reservationHistory.map((res) => (
                            <div key={res.reservation_id} className="reservations-item">
                                <p><strong>Date & Time:</strong> {formatDateTime(res.reservation_time)}</p>
                                <p><strong>Table:</strong> {res.table_id}</p>
                                <p><strong>Capacity:</strong> {res.capacity} People</p>
                                <p><strong>Status:</strong> {res.status}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Reservations;
