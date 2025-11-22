# 🔄 Routine Flow Documentation (with Authentication)

## Overview
This routine flow includes authentication (register/login) steps and ensures all operations are linked to a specific user.

## Step-by-step Flow

### 0. User Register / Login
- Register: `POST /auth/register` (username, email, password)
- Login: `POST /auth/login` (email, password) → returns JWT token

Client stores JWT (in memory or secure http-only cookie).

### 1. User Adds Tasks (Authenticated)
- `POST /tasks` with Authorization header: `Bearer <JWT>`
- Payload includes title, duration, priority, category, optional deadline
- Backend associates `user_id` from JWT

### 2. User Sets Availability
- `POST /availability` or include availability in profile
- Example payload: `[{ day: "Monday", start: "06:00", end: "09:00" }, ...]`

### 3. AI Processes Tasks (Per User)
- Backend endpoint: `POST /routine/generate` (requires JWT)
- Fetches only tasks & availability for that `user_id`
- Runs scheduling algorithm and returns proposed routine

### 4. User Reviews Routine
- `GET /routine` returns user's saved routines
- User can `PATCH /routine/:id` to edit or `DELETE /routine/:id`

### 5. Routine Saved & Analytics
- Routine stored in `routine` table with `user_id`
- Dashboard shows per-user analytics (time-spent, heatmap, consistency)

### 6. Logout
- Client discards JWT / clears cookies
