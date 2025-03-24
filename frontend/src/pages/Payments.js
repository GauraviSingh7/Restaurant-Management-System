import React, {useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/payments.css";
import axios from "axios";

const Payments = () => {
  const location = useLocation();
  const { cart, totalAmount } = location.state || { cart: [], totalAmount: 0 };  // Get total amount passed from Cart.js

  const [payments, setPayments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
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
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    setShowUPIImage(method === "upi");
    setPaymentDone(false);
  };

  const handlePaymentDone = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("You need to log in to complete the payment.");
            return;
        }

        // Console log to check the updated cart structure with quantity
        console.log("Cart data with quantity:", cart);  // Log the updated cart

        // Ensure cart has valid items with menu_item_id, quantity, and price
        if (!cart || cart.length === 0 || !cart.every(item => item.menu_id && item.quantity && item.price)) {
            console.error("Cart is invalid or missing required fields.");
            return;
        }

        // Step 1: Create a new order and include the items directly in the request
        const orderResponse = await axios.post("http://127.0.0.1:5000/orders/", {
            total_amount: totalAmount,
            status: "pending",  
            items: cart,  
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        const newOrder = orderResponse.data;  // Order details, including the new order_id

        // Step 2: Insert payment
        await axios.post("http://127.0.0.1:5000/payments/", {
            order_id: newOrder.order_id,
            amount_paid: totalAmount,
            payment_method: paymentMethod,
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Payment successful
        setPaymentDone(true);
    } catch (error) {
        console.error("Error completing payment:", error.response?.data?.error || error);
    }
};


  const toggleHistory = () => {
    if (!showHistory) {
      fetchPaymentHistory();  // Fetch history only when it's about to be shown
    }
    setShowHistory(!showHistory);  // Toggle the history display
  };

  return (
    <div className="payments-container">
      <h2 className="payments-title">Payments</h2>

      {/* Show Total Amount */}
      <h3>Total Amount to be Paid:</h3>
      <h2>${totalAmount.toFixed(2)}</h2>

      {/* Payment Method Selection */}
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

        {/* Show UPI Image if UPI is selected */}
        {showUPIImage && (
          <div>
            <img src="/path-to-upi-image.png" alt="UPI QR Code" className="upi-image" />
          </div>
        )}

        {/* Payment Done Button */}
        <button className="payments-btn" onClick={handlePaymentDone}>Payment Done</button>

        {/* Thank You Message after Payment */}
        {paymentDone && <h3 className="thank-you-message">Thank you for your payment!</h3>}
      </div>

      {/* Show/Hide Payment History */}
      <button className="payments-btn" onClick={toggleHistory}>
        {showHistory ? "Hide Payment History" : "Show Payment History"}
      </button>

      {/* Payment History Table */}
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
                  <tr key={payment.payment_id}> {/* Adding the key prop */}
                    <td>{payment.payment_id}</td>
                    <td>{payment.order_id}</td>
                    {/* Ensure amount_paid is valid before calling toFixed */}
                    <td>₹{(payment.amount_paid ? payment.amount_paid.toFixed(2) : "0.00")}</td> 
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
