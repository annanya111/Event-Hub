# Event Management Dashboard

A full-stack event management application with real-time features.

## Features

- User authentication with JWT
- Role-based access (organizer/user)
- Event creation and management
- User registration for events
- Real-time registration counts
- Notifications (bonus)

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, Socket.io
- Frontend: React, Vite

## Setup

1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Set up MongoDB and create a `.env` file based on `.env.example`
5. Start the backend: `cd backend && npm run dev`
6. Start the frontend: `cd frontend && npm run dev`

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/events
- POST /api/events (organizer)
- POST /api/registrations
- GET /api/registrations

## Real-time

Uses Socket.io for real-time updates on registrations.