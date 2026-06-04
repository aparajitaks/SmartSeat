# 🪑 SmartSeat — Intelligent Restaurant & Cafe Reservation Platform

A full-stack reservation management system that enables customers to book tables at partnered restaurants and cafes while helping businesses efficiently manage seating capacity.

## ✨ Features

### For Customers
- **Browse Restaurants** — Search, filter by cuisine/city/price, and explore restaurant details
- **Smart Table Booking** — Intelligent allocation finds the optimal table for your party size
- **Waitlist Management** — Auto-join waitlist when tables are full, get auto-promoted on cancellations
- **Reservation Tracking** — Full lifecycle (Pending → Confirmed → Checked-In → Completed)
- **Reviews** — Leave reviews for completed reservations

### For Restaurant Owners
- **Analytics Dashboard** — Daily bookings, peak hours, occupancy rates, cancellation rates, top customers
- **Restaurant & Branch Management** — CRUD for restaurants, branches, and tables
- **Reservation Management** — View, check-in, and complete reservations

### Technical Highlights
- **Smart Allocation** — Finds smallest fitting table to maximize capacity utilization
- **Transaction Safety** — MongoDB transactions prevent double-booking
- **Real-Time Updates** — Socket.io for live table availability and waitlist notifications
- **Role-Based Access** — Customer, Restaurant Owner, Admin roles with middleware protection

## 🛠 Tech Stack

| Layer          | Technology                         |
|----------------|------------------------------------|
| Frontend       | React.js, Tailwind CSS, Vite       |
| Backend        | Node.js, Express.js                |
| Database       | MongoDB Atlas (Mongoose ODM)        |
| Auth           | JWT, bcrypt.js                     |
| Real-Time      | Socket.io                          |
| Charts         | Recharts                            |
| Icons          | Lucide React                        |

## 📁 Project Structure

```
SmartSeat/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/          # Mongoose schemas (8 collections)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (allocation, waitlist)
│   ├── seeds/           # Sample data script
│   ├── utils/           # Helper utilities
│   └── server.js        # Express + Socket.io entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout (Navbar, Footer)
│   │   ├── context/     # Auth state management
│   │   ├── pages/       # All route pages
│   │   └── services/    # API client layer
│   └── index.html
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string
npm install
```

### 2. Seed Database

```bash
npm run seed
```

This creates sample users, restaurants, branches, tables, and reservations.

**Demo Credentials:**
| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@smartseat.com      | admin123     |
| Owner    | rajesh@restaurant.com    | owner123     |
| Customer | amit@customer.com        | customer123  |

### 3. Start Backend

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 4. Setup & Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📡 API Endpoints

### Auth
| Method | Endpoint             | Description        | Access  |
|--------|---------------------|--------------------|---------|
| POST   | /api/auth/register  | Register           | Public  |
| POST   | /api/auth/login     | Login              | Public  |
| GET    | /api/auth/me        | Get profile        | Private |

### Restaurants
| Method | Endpoint                     | Description         | Access       |
|--------|------------------------------|---------------------|--------------|
| GET    | /api/restaurants             | List (paginated)    | Public       |
| GET    | /api/restaurants/:id         | Get details         | Public       |
| POST   | /api/restaurants             | Create              | Owner/Admin  |

### Reservations
| Method | Endpoint                        | Description       | Access       |
|--------|---------------------------------|-------------------|--------------|
| POST   | /api/reservations               | Book (smart alloc) | Private     |
| GET    | /api/reservations               | My reservations   | Private      |
| PUT    | /api/reservations/:id/cancel    | Cancel            | Private      |
| PUT    | /api/reservations/:id/check-in  | Check in          | Owner/Admin  |
| PUT    | /api/reservations/:id/complete  | Complete          | Owner/Admin  |

### Analytics
| Method | Endpoint                  | Description    | Access      |
|--------|---------------------------|----------------|-------------|
| GET    | /api/analytics/dashboard  | Dashboard data | Owner/Admin |

## 🧠 Smart Allocation Algorithm

1. Find all tables at branch with `capacity >= partySize`
2. Sort by `capacity ASC` (smallest fitting table first)
3. Check for time slot conflicts within MongoDB transaction
4. If available → create reservation atomically
5. If unavailable → add to waitlist with queue position
6. On cancellation → auto-promote first eligible waitlisted customer

## 📄 License

MIT
