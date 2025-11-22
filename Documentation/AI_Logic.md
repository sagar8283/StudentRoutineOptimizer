# 🧠 AI Logic – Student Routine Optimizer (Authenticated Users)

## Overview
This document updates the AI logic to work with authenticated users. Each user's tasks and routines are separate and the AI generates personalized routines per user.

### Goals
- Generate personalized routines per user
- Respect user-specific preferences and historical data
- Ensure privacy: only user-owned data is processed

## Inputs (per-user)
- User ID
- Task priority (1–5)
- Task duration (minutes)
- Due date (if applicable)
- Category (Study / Personal / Health / Project)
- User available time slots
- User historical routine patterns (optional)
- User preferences (e.g., preferred study times)

## Weightage System (user-aware)
Each task is assigned a weight (user-specific):

```
weight = (priority * 2) + (duration / 30) + user_preference_modifier
```

`user_preference_modifier` can boost tasks that match user preferred times or categories.

## Scheduling Logic Summary
1. Authenticate user and fetch only that user's tasks and availability.
2. Compute weight for each task.
3. Sort tasks by weight (descending).
4. Fill the user's available time blocks starting from highest-weight tasks.
5. Respect user constraints (no scheduling during blocked times).
6. Add breaks and avoid clustering too many high-effort tasks in a row.
7. Save generated routine with `user_id` reference.

## Outputs
- Optimized routine for a specific user
- Per-user productivity score and analytics
- Recommendations personalized to user's history
