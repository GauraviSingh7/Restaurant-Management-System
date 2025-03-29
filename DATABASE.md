# Restaurant Management System Database

A comprehensive restaurant management system database designed to handle various aspects of restaurant operations including user management, menu items, orders, reservations, payments, staff, and inventory tracking.

## Database Schema

The `restaurant_db` database consists of the following tables:

### Users
- Stores customer and manager account information
- Fields: `user_id`, `username`, `password`, `role`, `email`, `created_at`
- Roles: 'customer', 'manager'

### Categories
- Categorizes menu items
- Fields: `category_id`, `name`
- Examples: Beverages, Mocktails, Appetizers, Burgers, Pizzas, Pastas, Desserts

### Menu
- Stores details about food and drink items
- Fields: `menu_id`, `name`, `description`, `price`, `category_id`, `availability`

### Tables
- Manages restaurant seating
- Fields: `table_id`, `capacity`, `status`
- Status options: 'available', 'occupied', 'reserved'

### Orders
- Tracks customer orders
- Fields: `order_id`, `customer_id`, `table_id`, `status`, `total_amount`, `created_at`
- Status options: 'pending', 'completed', 'cancelled'

### Order Items
- Links orders to specific menu items
- Fields: `order_item_id`, `order_id`, `menu_id`, `quantity`, `price`

### Reservations
- Manages table reservations
- Fields: `reservation_id`, `customer_id`, `table_id`, `reservation_time`, `status`, `capacity`
- Status options: 'confirmed', 'pending', 'cancelled', 'completed'

### Payments
- Records payment information for orders
- Fields: `payment_id`, `order_id`, `amount_paid`, `payment_method`, `payment_date`
- Payment methods: 'cash', 'credit_card', 'UPI'

### Staff
- Tracks restaurant employees
- Fields: `staff_id`, `name`, `role`, `salary`, `shift_timing`
- Roles: 'waiter', 'chef', 'manager'

### Inventory
- Manages restaurant supplies
- Fields: `inventory_item_id`, `name`, `quantity_available`

## Relationships

- Menu items belong to Categories
- Orders are linked to Users (customers) and Tables
- Order Items connect Orders to Menu items
- Reservations are linked to Users (customers) and Tables
- Payments are linked to Orders
- Staff roles are independent but interact with Orders and Tables

## Schema Modifications

The database schema has undergone several modifications during development:
- Added `email` column to Users table
- Modified Users' role options from ('customer', 'waiter', 'chef', 'manager') to ('customer', 'manager')
- Added `capacity` column to Reservations table
- Renamed `menu_item_id` to `menu_id` in Order Items table
- Updated Reservations status options to include 'completed'

## Usage

This database serves as the foundation for a restaurant management application, enabling:
- Customer registration and order management
- Menu browsing and ordering
- Table reservation system
- Staff management and scheduling
- Inventory tracking
- Payment processing
