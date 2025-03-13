import React from "react";
import { useCart } from "../context/CartContext";  // Import useCart from CartContext
import { useNavigate } from "react-router-dom";
import "../styles/cart.css";  // Assuming you have a separate CSS file for styling the Cart

const Cart = () => {
    const { cart, updateCartItem, removeFromCart, getTotal } = useCart();  // Access cart functions from context
    const navigate = useNavigate();

    // Handle proceeding to checkout
    const handleCheckout = () => {
        navigate("/payments");  // Redirect to the Payments page
    };

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>

            {/* If the cart is empty, show a message */}
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    {/* Display cart items */}
                    {cart.map((item, index) => (
                        <div key={index} className="cart-item">
                            <h3>{item.name}</h3>
                            <p>Price: ${item.price.toFixed(2)}</p>
                            <p>Quantity: 
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateCartItem(index, parseInt(e.target.value))}
                                />
                            </p>
                            <button onClick={() => removeFromCart(index)}>Remove</button>
                        </div>
                    ))}

                    {/* Display total and checkout button */}
                    <div className="cart-summary">
                        <h2>Total: ${getTotal().toFixed(2)}</h2>
                        <button onClick={handleCheckout} className="checkout-btn">Proceed to Checkout</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
