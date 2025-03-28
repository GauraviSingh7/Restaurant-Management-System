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
    const [allReservations, setAllReservations] = useState([]);
    const [showReservationForm, setShowReservationForm] = useState(false);
    const [showReservations, setShowReservations] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [reservationDetails, setReservationDetails] = useState(null);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // Search feature

    useEffect(() => {
        fetchReservations();
        
        // Automatically show manager view for managers
        if (role === "manager") {
            setShowReservationForm(false);
            setShowReservations(false);
            setShowHistory(false);
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

            if (role === "manager") {
                setAllReservations(response.data);
            } else {
                const upcoming = response.data.filter(res => res.status !== "cancelled" && res.status !== "completed");
                const history = response.data.filter(res => res.status === "cancelled" || res.status === "completed");

                setUpcomingReservations(upcoming);
                setReservationHistory(history);
            }
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

    const handleUpdateReservation = async (reservationId, newStatus, newTableId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You need to log in to update a reservation.");
                return;
            }

            await axios.put(`http://127.0.0.1:5000/reservations/${reservationId}/status`, {
                status: newStatus,
                table_id: newTableId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchReservations();
        } catch (error) {
            console.error("Error updating reservation:", error.response?.data?.error || error);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    };

    const handleSearch = (reservations) => {
        if (!searchQuery) return reservations;
        return reservations.filter((res) => 
            res.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            formatDateTime(res.reservation_time).toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    return (
        <div className="reservations-container">
            <h2 className="reservations-title">Reservations</h2>
            
            {role === "customer" && (
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
            )}

            {/* <input
                type="text"
                className="reservations-search"
                placeholder="Search reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            /> */}

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

            {showReservations && role === "customer" && (
                <div className="reservations-list">
                    <h3>Upcoming Reservations</h3>
                    {handleSearch(upcomingReservations).length === 0 ? (
                        <p className="reservations-error">No upcoming reservations.</p>
                    ) : (
                        handleSearch(upcomingReservations).map((res) => (
                            <div key={res.reservation_id} className="Upcomingreservations-item">
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

            {showHistory && role === "customer" && (
                <div className="reservations-list">
                    <h3>Reservation History</h3>
                    {handleSearch(reservationHistory).length === 0 ? (
                        <p className="reservations-error">No past reservations.</p>
                    ) : (
                        handleSearch(reservationHistory).map((res) => (
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

            {/* Manager view is now displayed by default when role is manager */}
            {role === "manager" && (
                <div className="Mreservations-list">
                    <h3>All Reservations</h3>
                    <input
                        type="text"
                        className="reservations-search"
                        placeholder="Search reservations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    /> 
                    {handleSearch(allReservations).length === 0 ? (
                        <p className="reservations-error">No reservations found.</p>
                    ) : (
                        <div className="Mreservations-group">
                            {handleSearch(allReservations).map((res) => (
                                <div key={res.reservation_id} className="Mreservations-item">
                                    <p><strong>Date & Time:</strong> {formatDateTime(res.reservation_time)}</p>
                                    <p><strong>Customer Email:</strong> {res.customer_email}</p>
                                    <p><strong>Table:</strong> {res.table_id}</p>
                                    <p><strong>Capacity:</strong> {res.capacity} People</p>
                                    <p><strong>Status:</strong> {res.status}</p>
                                    <button
                                        className="Mreservations-update-btn"
                                        onClick={() => handleUpdateReservation(res.reservation_id, "completed", res.table_id)}
                                    >
                                        Complete
                                    </button>
                                    <button
                                        className="Mreservations-cancel-btn"
                                        onClick={() => handleUpdateReservation(res.reservation_id, "cancelled", res.table_id)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reservations;