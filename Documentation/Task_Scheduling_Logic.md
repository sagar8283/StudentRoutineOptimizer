# 🕒 Task Scheduling Logic (Authenticated Users)

## Goal
Schedule tasks per-user while ensuring privacy, no overlap, respecting availability, and prioritizing important tasks.

## Authentication Effects
- All scheduling operations require a valid JWT.
- All DB queries include `WHERE user_id = <current_user_id>`.

## Endpoints to Note
- `POST /tasks` (create task for authenticated user)
- `GET /tasks` (list tasks for user)
- `POST /routine/generate` (generate routine for user)

## Algorithm Steps (per-user)

1. **Retrieve user tasks and availability**
   - SELECT * FROM tasks WHERE user_id = ?

2. **Sort tasks**
   - By priority, deadline urgency, duration

3. **Fit tasks into user time slots**
```
for each task in sorted_tasks:
    for block in user_availability:
        if block has enough free time:
            schedule task
            mark time as used
            break
```

4. **Check overlaps**
```
isOverlapping := (t1.start < t2.end) AND (t2.start < t1.end)
```

5. **Add buffer/breaks**
- After tasks > 45 min, insert 10-minute break.

6. **Return routine (with user_id assigned)**
- Each routine entry: { user_id, task_id, start_time, end_time, day }
