# Restaurant-Management-System

## Description
A full-stack Restaurant Management System built using **Flask (backend), React (frontend), and MySQL (database)** to streamline order management, reservations, and user authentication for customers and managers.

## Features
- **User Authentication**: Separate logins for customers and managers with role-based access.
- **Menu Management**: Categorized vegetarian menu with options like Beverages, Mocktails, Appetizers, Burgers, Pizzas, Pastas, and Desserts.
- **Order Handling**: Customers can place orders, and managers can track them.
- **Reservations**: Customers can book tables, and managers can manage reservations.
- **Payments**: Secure payment processing and order tracking.
- **Database Integration**: MySQL database for efficient data storage and retrieval.

## Technologies Used
- **Frontend**: React, HTML, CSS
- **Backend**: Flask
- **Database**: MySQL

## Installation
### Prerequisites
- Python 3.x
- Node.js & npm
- MySQL

### Backend Setup
```sh
# Clone the repository
git clone https://github.com/GauraviSingh7/Restaurant-Management-System.git
cd Restaurant-Management-System/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies (will be added soon)
pip install -r requirements.txt

# Set up database (Update MySQL credentials in .env file)
python db.py

# Run the Flask server
flask run
```

### Frontend Setup
```sh
cd ../frontend

# Install dependencies
npm install

# Start the React application
npm start
```

## Usage
- Customers can browse the menu, place orders, and book tables.
- Managers can track orders, manage reservations, and update menu items.

## Database Schema
Tables included:
- **Users** (Login management)
- **Menu** (Food items and categories)
- **Orders** (Order tracking)
- **Order Items** (Individual items in an order)
- **Reservations** (Table bookings)
- **Payments** (Transaction records)

### A work in progress still.

