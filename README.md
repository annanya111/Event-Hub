# Event-Hub
Event Hub is a full-stack event management system built with React, Node.js, and MongoDB, featuring real-time event registration, capacity tracking, and role-based functionality for users and organizers.

## 🚀 Features
- Create and manage events
- Register for events
- Real-time registration updates
- Capacity tracking

## 🛠 Tech Stack
- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB

## 📦 Setup

### Backend
cd backend
npm install
node server.js

### Frontend
cd frontend
npm install
npm run dev

## 🌐 API Endpoints
- POST /events → Create event
- GET /events → Get all events
- POST /register/:id → Register for event

## 📌 Future Improvements
- Authentication (JWT)
- Role-based dashboard
- Socket.io real-time updates
