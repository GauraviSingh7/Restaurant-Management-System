import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 
import { useCart } from "../context/CartContext";  // Use CartContext here
import "../styles/menu.css"; 

const Menu = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { role, token } = useAuth();
    const { addToCart } = useCart();  // Use cart and addToCart from context

    console.log("Current Role:", role);
    console.log("Current Token:", token);

    // Create axios instance with dynamic token handling
    const authAxios = axios.create({
        baseURL: "http://127.0.0.1:5000",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });

    // Fetch categories from backend
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/menu/categories")
            .then(response => setCategories(response.data))
            .catch(error => console.error("Error fetching categories:", error));
    }, []);

    // Fetch menu items when category is selected
    const fetchMenuItems = (categoryId) => {
        axios.get(`http://127.0.0.1:5000/menu?category_id=${categoryId}`)
            .then(response => {
                setMenuItems(response.data);
                setSelectedCategory(categoryId);
            })
            .catch(error => console.error("Error fetching menu items:", error));
    };

    // Handle Add Menu Item (For Manager)
    const addMenuItem = () => {
        if (!token) {
            alert("You must be logged in to add menu items.");
            return;
        }

        const newItem = {
            name: prompt("Enter item name:"),
            description: prompt("Enter description:"),
            price: parseFloat(prompt("Enter price:")),
            category_id: selectedCategory,
            availability: true
        };

        if (!newItem.name || !newItem.description || isNaN(newItem.price)) {
            alert("Invalid input. Please fill all fields correctly.");
            return;
        }

        authAxios.post("/menu", newItem)
            .then(response => {
                alert(response.data.message);
                fetchMenuItems(selectedCategory); // Refresh menu
            })
            .catch(error => {
                console.error("Error adding item:", error.response?.data || error);
                alert(`Error: ${error.response?.data?.error || 'Unable to add menu item'}`);
            });
    };

    // Handle Add to Cart (For Customer only)
    const handleAddToCart = (item) => {
        if (role !== "customer") {
            alert("You must be logged in as a customer to add items to your order.");
            return;
        }

        addToCart({ ...item, quantity: 1 });  // Use addToCart from CartContext
        alert(`${item.name} added to your cart!`);
    };

    // Handle Edit Menu Item (For Manager)
    const editMenuItem = (menuId, oldName, oldDesc, oldPrice) => {
        if (!token) {
            alert("You must be logged in to edit menu items.");
            return;
        }

        const updatedItem = {
            name: prompt("Edit name:", oldName),
            description: prompt("Edit description:", oldDesc),
            price: parseFloat(prompt("Edit price:", oldPrice.toString())),
            category_id: selectedCategory,
            availability: true
        };

        if (!updatedItem.name || !updatedItem.description || isNaN(updatedItem.price)) {
            alert("Invalid input. Please fill all fields correctly.");
            return;
        }

        authAxios.put(`/menu/${menuId}`, updatedItem)
            .then(response => {
                alert(response.data.message);
                fetchMenuItems(selectedCategory); // Refresh menu
            })
            .catch(error => {
                console.error("Error updating item:", error.response?.data || error);
                alert(`Error: ${error.response?.data?.error || 'Unable to update menu item'}`);
                
                // Additional error logging
                if (error.response) {
                    console.log("Response Data:", error.response.data);
                    console.log("Response Status:", error.response.status);
                    console.log("Response Headers:", error.response.headers);
                }
            });
    };

    // Handle Delete Menu Item (For Manager)
    const deleteMenuItem = (menuId) => {
        if (!token) {
            alert("You must be logged in to delete menu items.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this item?")) return;

        authAxios.delete(`/menu/${menuId}`)
            .then(response => {
                alert(response.data.message);
                fetchMenuItems(selectedCategory); // Refresh menu
            })
            .catch(error => {
                console.error("Error deleting item:", error.response?.data || error);
                alert(`Error: ${error.response?.data?.error || 'Unable to delete menu item'}`);
            });
    };

    return (
        <div className="menu-page">
            <h1 className="menu-title">{role === "manager" ? "Menu Management" : "Our Menu"}</h1>

            <div className="category-buttons">
                {categories.map((category) => (
                    <button
                        key={category.category_id}
                        className={`category-btn ${selectedCategory === category.category_id ? "active" : ""}`}
                        onClick={() => fetchMenuItems(category.category_id)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Show "Add Item" button for Managers */}
            {role === "manager" && selectedCategory && (
                <button className="add-btn" onClick={addMenuItem}>+ Add Item</button>
            )}

            <div className="menu-items">
                {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                        <div key={item.menu_id} className="menu-card">
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <p className="price">${item.price.toFixed(2)}</p>

                            {/* Show "Add to Cart" button for Customers */}
                            {role === "customer" && (
                                <button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>Add to Cart</button>
                            )}
                            
                            {/* Show "Edit" and "Delete" buttons for Managers */}
                            {role === "manager" && (
                                <div className="manager-buttons">
                                    <button 
                                        className="edit-btn" 
                                        onClick={() => editMenuItem(item.menu_id, item.name, item.description, item.price)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => deleteMenuItem(item.menu_id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-items">Select a category to view menu items.</p>
                )}
            </div>

        </div>
    );
};

export default Menu;
