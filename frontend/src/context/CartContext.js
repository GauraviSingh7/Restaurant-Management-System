import React, { createContext, useContext, useState } from "react";

// Create a context for the cart
const CartContext = createContext();

// Hook to use the cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Function to add an item to the cart or update its quantity if it exists
    const addToCart = (item, quantity = 1) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.menu_item_id === item.menu_item_id);

            // If the item is already in the cart, update its quantity
            if (existingItemIndex !== -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            }

            // Otherwise, add the new item with the specified quantity
            return [...prevCart, { ...item, quantity }];
        });
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
