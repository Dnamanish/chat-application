#📍 Real-Time Location-Based Chat Application

A real-time anonymous chat application where users can discover and join chat rooms based on their geographic location.
The app allows users nearby to communicate instantly using WebSockets, while messages automatically expire to keep conversations temporary and privacy-focused.

Built as a full-stack project to demonstrate real-time communication, geolocation filtering, and production deployment.

##🚀 Live Demo

Frontend: https://chat-application-seven-sepia.vercel.app/

Backend API: https://chat-application-pxm1.onrender.com

✨ Features

🌍 Location-Based Rooms

Users share their location using the Geolocation API.
Only rooms within 5 km radius are shown.
Distance calculated using the Haversine formula.

💬 Real-Time Messaging

Instant messaging using Socket.IO.
Messages delivered instantly to users in the same room.

👤 Anonymous Users

No authentication required.
Each user gets an anonymous ID.

⌨️ Typing Indicator
Shows when another user is typing
Implemented using debounced socket events

👥 Live User Count
Displays number of users currently in a room
⏳ Auto-Expiring Messages
Messages automatically expire after 2 hours

🗑 Auto-Deleting Rooms
If a room becomes empty:
A 1-hour timer starts
If no one joins again → the room is automatically deleted

📜 Message Persistence
Previous messages are loaded when a user joins a room
Stored in Supabase (PostgreSQL)

🔄 Auto Scroll
Chat automatically scrolls to the latest message

🏗 Tech Stack
Frontend
React (Vite)
Socket.IO Client
Supabase Client
CSS
Backend
Node.js
Express
Socket.IO
Supabase (PostgreSQL)

Deployment

Vercel → Frontend

Render → Backend

🧠 Architecture
User
  │
  ▼
Frontend (React)
  │
  │ Socket.IO
  ▼
Backend (Node + Express)
  │
  ▼
Supabase Database

Flow

1️⃣ User opens app
2️⃣ Browser requests geolocation
3️⃣ Frontend sends location to backend
4️⃣ Backend filters rooms using Haversine distance
5️⃣ User joins room via Socket.IO
6️⃣ Messages broadcast in real time
