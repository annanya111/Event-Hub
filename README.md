# Event-Hub - Event Management Dashboard

Event Hub is a full-stack event management system built using React, Node.js, and MongoDB. It allows users to explore events, register in real-time, and enables organizers to manage event capacity efficiently.

---

## ✨ Features

- 🧑‍💼 Event Creation (Organizer)
- 📋 Event Listings
- 📝 User Registration for Events
- ⚡ Real-time Registration Updates (Socket.io)
- 📊 Capacity Tracking for Each Event
- 🔔 Notification System for event updates

---

## 🛠 Tech Stack

**Frontend:**
- React
- Tailwind CSS 

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB

**Real-time:**
- Socket.io

---

## 📸 Screenshots

![Dashboard](./assets/dashboard.png)  
![Events](./assets/events.png)

---

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/vent-hub.git
cd vent-hub
```

---

### 2. Setup Backend
```bash
cd backend
npm install
node server.js
```

---

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints

- `POST /events` → Create event  
- `GET /events` → Get all events  
- `POST /register/:id` → Register for event  

---

## 🚀 Future Improvements

- 🔐 Authentication (JWT)
- 🎟 Paid Events Integration
- 📧 Email Notifications
- 📱 QR Code Check-in System

---

## 💡 Key Highlight

> Real-time event registration system using Socket.io ensures instant updates across all users without refreshing the page.

---

## 👩‍💻 Author

**Annanya Tiwari**
