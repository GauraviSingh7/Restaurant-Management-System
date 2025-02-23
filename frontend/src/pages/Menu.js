import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/menu.css"; // Ensure CSS file exists

const Menu = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Fetch categories from backend
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/menu/categories")
            .then(response => setCategories(response.data))
            .catch(error => console.error("Error fetching categories:", error));
    }, []);

    // Fetch menu items when category is selected
    const fetchMenuItems = (categoryId) => {
        axios.get(`http://127.0.0.1:5000/menu?category_id=${categoryId}`)  // 🔥 Send category_id in request
            .then(response => {
                setMenuItems(response.data); // ✅ Now it fetches only selected category
                setSelectedCategory(categoryId);
            })
            .catch(error => console.error("Error fetching menu items:", error));
    };

    return (
        <div className="menu-page">
            <h1 className="menu-title">Our Menu</h1>

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

            <div className="menu-items">
                {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                        <div key={item.menu_id} className="menu-card">
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <p className="price">${item.price.toFixed(2)}</p>
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
