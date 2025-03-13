import React, { createContext, useContext, useState } from "react";

// Create a context for the cart
const CartContext = createContext();

// Hook to use the cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Function to add an item to the cart
    const addToCart = (item) => {
        setCart((prevCart) => [...prevCart, item]);
    };

    // Function to update item quantity
    const updateCartItem = (index, quantity) => {
        setCart((prevCart) => {
            const updatedCart = [...prevCart];
            updatedCart[index].quantity = quantity;
            return updatedCart;
        });
    };

    // Function to remove an item from the cart
    const removeFromCart = (index) => {
        setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    };

    // Calculate total price
    const getTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeFromCart, getTotal }}>
            {children}
        </CartContext.Provider>
    );
};
