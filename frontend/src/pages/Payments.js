import React, { useEffect, useState } from "react";
import "../styles/payments.css";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showUPIImage, setShowUPIImage] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const token = localStorage.getItem("token");

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch("/payments/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPayments(data);
      setShowHistory(true);
      setShowPaymentForm(false);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const handlePaymentClick = () => {
    setShowPaymentForm(true);
    setShowHistory(false);
    setPaymentMethod("");
    setShowUPIImage(false);
    setPaymentDone(false);
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    setShowUPIImage(method === "upi");
    setPaymentDone(false);
  };

  return (
    <div className="payments-container">
      <h2 className="payments-title">Payments</h2>

      <button className="payments-btn" onClick={handlePaymentClick}>Make a Payment</button>
      <button className="payments-btn" onClick={fetchPaymentHistory}>Show Payment History</button>

      {showPaymentForm && (
        <div className="payments-form">
          <h3>Select Payment Method</h3>
          <select
            className="payments-input"
            onChange={handlePaymentMethodChange}
            value={paymentMethod}
          >
            <option value="">Select Payment Method</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>

          {showUPIImage && (
            <div>
              <img src="/path-to-upi-image.png" alt="UPI QR Code" className="upi-image" />
              <button className="payments-btn" onClick={() => setPaymentDone(true)}>Payment Done</button>
            </div>
          )}

          {paymentDone && <h3 className="thank-you-message">Thank you for your payment!</h3>}
        </div>
      )}

      {showHistory && (
        <div>
          <h3 className="payments-subtitle">My Payment History</h3>
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>{payment.payment_id}</td>
                    <td>{payment.order_id}</td>
                    <td>₹{payment.amount_paid}</td>
                    <td>{payment.payment_method}</td>
                    <td>{new Date(payment.payment_date).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No payment records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
