import React, { createContext, useContext, useState, useEffect } from "react";

// Create a context for the cart
const CartContext = createContext();

// Hook to use the cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Initialize cart state from localStorage (if available)
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : []; // Parse the cart from localStorage, or return an empty array if none is found
    });

    // Function to save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);  // Save cart to localStorage whenever the cart state changes

    // Function to add an item to the cart
    const addToCart = (item, quantity = 1) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(
                (cartItem) => cartItem.menu_id === item.menu_id
            );

            if (existingItemIndex !== -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            }

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
