import React from "react";
import { useCart } from "../context/CartContext";  // Import useCart from CartContext
import { useNavigate } from "react-router-dom";
import "../styles/cart.css";  // Assuming you have a separate CSS file for styling the Cart

const Cart = () => {
    const { cart, updateCartItem, removeFromCart, getTotal } = useCart();  // Access cart functions from context
    const navigate = useNavigate();

    // Handle proceeding to checkout
    const handleCheckout = () => {
        // Navigate to the payments page, passing the cart and total amount
        navigate("/payments", { state: { cart, totalAmount: getTotal() } });
    };

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>

            <div className="cart-content">
                {/* Cart Items Section */}
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <h2>Your cart is empty. Head to our menu to check our delicious dishes!!</h2>
                    ) : (
                        <>
                            {cart.map((item, index) => (
                                <div key={index} className="cart-item">
                                    <h3>{item.name}</h3>
                                    <h4>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateCartItem(index, parseInt(e.target.value))}
                                        />
                                    </h4>
                                    <h4>${item.price.toFixed(2)}</h4>
                                    <button className="remove-btn" onClick={() => removeFromCart(index)}>
                                        Remove
                                    </button>
                                </div>
                            ))}

                            {cart.length !== 0 && (
                                <div className="cart-summary">
                                    <h2>Total: ${getTotal().toFixed(2)}</h2>
                                    <button onClick={handleCheckout} className="checkout-btn">
                                        Proceed to Checkout
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    
                </div>

                {/* Image Section */}
                <div className="cart-images">
                    <img
                        src={require("../assets/cart.jpeg")} 
                        alt="Cart"
                        className="cart-image"
                    />
                </div>
            </div>
        </div>
    );
};

export default Cart;