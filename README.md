# LUXURY ESTATE 🏡 - Complete System Documentation

Welcome to the **LUXURY ESTATE** platform. This document contains a comprehensive breakdown of everything that happens inside the project, detailing the architecture, user roles, core functionalities, and data flows.

---

## 🎯 System Overview

LUXURY ESTATE is a premium, full-stack real estate platform that connects property owners, real estate agents, and clients. It provides a seamless experience for listing properties, scheduling visits, real-time communication, and property management.

The system is built on the **MERN Stack** (MongoDB, Express, React, Node.js) and utilizes modern web technologies to deliver a fast, secure, and highly interactive user experience.

---

## 👥 User Roles & Permissions

The system operates with three distinct user roles, each having specific permissions and a dedicated dashboard.

### 1. Client (Buyer/Tenant)
- **Browse & Search**: Search for properties using advanced filters (location, price, type, bedrooms, etc.).
- **Interactive Map**: View properties on a live map (Leaflet).
- **Wishlist**: Save favorite properties to view later.
- **Compare**: Add multiple properties to a comparison list to evaluate them side-by-side.
- **Bookings**: Schedule a visit/tour for a specific property.
- **Chat**: Send direct messages to property owners or agents to inquire about listings.
- **Reviews**: Leave ratings and reviews for agents/owners after interactions.

### 2. Property Owner / Agent
- **Property Management**: Create, edit, and delete property listings. Upload multiple images per listing.
- **Booking Management**: Receive visit requests from clients. Owners can **Approve**, **Reject**, or mark bookings as **Completed**.
- **Client Communication**: Reply to client inquiries via the built-in chat system.
- **Dashboard**: View statistics of their active listings, pending bookings, and unread messages.

### 3. Administrator
- **User Management**: View, suspend, or delete users (Clients or Owners) from the platform.
- **Property Moderation**: Oversee all property listings and remove any violating content.
- **System Dashboard**: View overall platform statistics (total users, total properties, revenue/activity).

---

## ⚙️ Core Modules & How They Work

### 1. Authentication & Security Module
- **Registration/Login**: Handled via JWT (JSON Web Tokens). Passwords are encrypted using `bcrypt.js` before saving to MongoDB.
- **Protected Routes**: Frontend routes and Backend API endpoints are protected based on user roles. A Client cannot access Owner endpoints, and vice versa.

### 2. Property Management Module
- **Data Structure**: Properties contain details like title, description, price, area, location (address + geo-coordinates), amenities, and status (Available, Sold, Rented).
- **Image Uploads**: Handled using `Multer`. Images are uploaded to the backend server and served statically.
- **Pagination & Filtering**: The backend handles complex queries to filter properties based on user input, ensuring fast load times via pagination.

### 3. Booking Engine
- **Workflow**:
  1. Client selects a date and time on the property page and clicks "Book Visit".
  2. A Booking record is created in the database with status `Pending`.
  3. The Owner receives a Notification.
  4. The Owner goes to their dashboard and updates the status to `Approved` or `Rejected`.
  5. The Client is notified of the status change.

### 4. Chat & Messaging System
- **Conversations**: A Chat room is created between a Client and an Owner when a client initiates contact.
- **Message History**: Messages are stored in the database (`Message` schema) to maintain a full history of the conversation.
- **Inbox**: Users have an Inbox UI to switch between different conversations easily.

### 5. Notification System
- **Triggers**: Notifications are generated automatically for:
  - New bookings.
  - Changes in booking status (Approved/Rejected).
  - New chat messages.
- **Status**: Notifications have a `read` or `unread` status, displaying a badge on the user's navbar until they view it.

### 6. Wishlist & Comparison Module (Frontend Context)
- **Wishlist**: Handled via React Context + LocalStorage/Database. Clients can click the heart icon on any property card to save it.
- **Compare Context**: Allows adding up to 3-4 properties into a temporary drawer. When opened, it renders a table comparing price, area, beds, baths, and amenities.

---

## 💻 Tech Stack & Architecture

### Frontend Architecture
- **React 18**: Component-based UI.
- **Vite**: Extremely fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for highly responsive and modern styling.
- **Framer Motion**: Used for smooth page transitions, modal popups, and micro-animations.
- **React Router Dom**: Handles client-side routing and protected routes layout.
- **Axios**: Configured with interceptors to automatically attach the JWT token to every API request.
- **State Management**: Uses React `Context API` (AuthContext, ThemeContext, CurrencyContext, WishlistContext) to manage global state without complex external libraries.

### Backend Architecture
- **Node.js & Express.js**: RESTful API structure.
- **MongoDB & Mongoose**: NoSQL database for flexible schema design (Users, Properties, Bookings, Chats, Notifications).
- **Geocoding**: Utilizes location services to convert addresses into latitude/longitude for map plotting.
- **Error Handling**: Centralized error handling middleware to catch and format API errors cleanly.

---

## 🗄️ Database Schemas (High-Level)

1. **User Schema**: `name`, `email`, `password`, `role` (client, owner, admin), `profilePicture`, `phone`.
2. **Property Schema**: `title`, `description`, `type`, `price`, `address`, `location` (lat, lng), `bedrooms`, `bathrooms`, `area`, `images` (array), `owner` (Ref to User), `amenities`.
3. **Booking Schema**: `property` (Ref), `client` (Ref), `owner` (Ref), `date`, `time`, `status` (Pending, Approved, Rejected, Completed), `message`.
4. **Chat & Message Schema**: `participants` (Array of Users), `content`, `sender`, `timestamp`, `readStatus`.
5. **Notification Schema**: `recipient`, `type`, `content`, `relatedId` (Ref to Booking/Message), `isRead`.

---

## 🚀 How to Run the Project Locally

### 1. Database Setup
Create a local MongoDB database or a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```
Start the API:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the UI:
```bash
npm run dev
```

---

## 🛠️ Additional Tools & Scripts

- **Make an Admin**: If you need an Admin account, register normally as a user, then run this script to elevate the account:
  ```bash
  cd backend
  node scripts/makeAdmin.js
  ```
- **Postman Collection**: (Recommended) Use Postman to test the backend API endpoints locally before interacting with the UI.

---
*This README serves as the complete documentation for the LUXURY ESTATE platform. It covers every major process, feature, and data flow occurring within the project.*
