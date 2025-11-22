# 🗄 Database Schema – Student Routine Optimizer (with Authentication)

## Overview
Updated schema includes authentication (users) and links tasks & routines to users.

**ER Diagram (conceptual):**
```
users (1) ─── (∞) tasks (1) ─── (∞) routine
```

(You can view the project deliverables image here: ![](/mnt/data/WhatsApp Image 2025-11-22 at 16.26.37_93142b16.jpg))

## Tables

### 1) `users`
Stores user credentials and profile.

| Field      | Type          | Description |
|------------|---------------|-------------|
| id         | INT (PK)      | User ID |
| username   | VARCHAR(100)  | Unique username |
| email      | VARCHAR(255)  | Unique email |
| password   | VARCHAR(255)  | Hashed password |
| created_at | TIMESTAMP     | Default CURRENT_TIMESTAMP |

### 2) `tasks`
Tasks created by users.

| Field       | Type         | Description |
|-------------|--------------|-------------|
| id          | INT (PK)     | Task ID |
| user_id     | INT (FK)     | References users(id) |
| title       | VARCHAR(255) | Task title |
| description | TEXT         | Details |
| duration    | INT          | Minutes |
| priority    | INT          | 1–5 |
| category    | VARCHAR(100) | Category |
| date        | DATE         | Optional due date |
| created_at  | TIMESTAMP    | Auto timestamp |

### 3) `routine`
Scheduled routine entries per user.

| Field       | Type         | Description |
|-------------|--------------|-------------|
| id          | INT (PK)     | Routine ID |
| user_id     | INT (FK)     | References users(id) |
| task_id     | INT (FK)     | References tasks(id) |
| start_time  | DATETIME     | Start |
| end_time    | DATETIME     | End |
| day         | VARCHAR(20)  | Day of week |
| created_at  | TIMESTAMP    | Auto timestamp |

## Sample SQL

```
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255),
  description TEXT,
  duration INT,
  priority INT,
  category VARCHAR(100),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE routine (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  task_id INT,
  start_time DATETIME,
  end_time DATETIME,
  day VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Security Notes
- Store only hashed passwords (bcrypt recommended).
- Use JWTs with short expiry for authentication.
- Use HTTPS in production.
- Do not log sensitive data.
