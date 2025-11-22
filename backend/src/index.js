// backend/src/index.js
// CommonJS so run with: node src/index.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const connectDB = require("../db"); // expects your backend/db.js connectDB function

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRY = "7d";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const app = express();
app.use(express.json());
app.use(cookieParser());
const path = require('path');
app.use('/static', express.static(path.join(__dirname, '..', 'public')));


// CORS allowing credentials (important so cookies pass)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// simple request logger
app.use((req, res, next) => {
  console.log(">>>", req.method, req.originalUrl);
  next();
});

function verifyTokenFromReq(req) {
  const token = req.cookies && req.cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function getUserIdFromReq(req) {
  if (req.params && req.params.uid) return Number(req.params.uid);
  if (req.query && req.query.user_id) return Number(req.query.user_id);
  const payload = verifyTokenFromReq(req);
  if (payload && payload.id) return Number(payload.id);
  return null;
}

// Serve image from backend/public/hero.jpg
app.get("/static/hero.jpg", (req, res) => {
  const p = path.join(__dirname, "..", "public", "hero.jpg");
  res.sendFile(p, (err) => {
    if (err) {
      console.error("Image error", err);
      return res.status(404).json({ error: "Image not found" });
    }
  });
});

async function ensureTables(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT 1,
      title VARCHAR(255),
      duration_minutes INT,
      deadline DATETIME,
      priority VARCHAR(50),
      category VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending',
      scheduled_start DATETIME,
      scheduled_end DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS routine_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT 1,
      type VARCHAR(100),
      start_time DATETIME,
      end_time DATETIME,
      meta JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT 1,
      title VARCHAR(255),
      body TEXT,
      read_flag TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Database tables ensured ✓");
}

async function init() {
  const db = await connectDB();

  try {
    await ensureTables(db);
  } catch (err) {
    console.error("Error ensuring tables:", err);
  }

  // ------------------------
  // AUTH routes
  // ------------------------
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      const [exists] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
      if (exists && exists.length) return res.status(400).json({ error: "User already exists" });

      const hash = await bcrypt.hash(password, 10);
      const [result] = await db.execute(
        "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
        [email, hash, name || null]
      );

      const userId = result.insertId;
      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 3600 * 1000,
      });

      res.status(201).json({ id: userId, email, name: name || null });
    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
      if (!rows || rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 3600 * 1000,
      });

      res.json({ id: user.id, email: user.email, name: user.name });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    res.json({ ok: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const payload = verifyTokenFromReq(req);
      if (!payload) return res.status(401).json({ error: "Not authenticated" });

      const [rows] = await db.execute("SELECT id, email, name, created_at FROM users WHERE id = ?", [payload.id]);
      if (!rows || rows.length === 0) return res.status(404).json({ error: "User not found" });

      res.json(rows[0]);
    } catch (err) {
      console.error("Me error:", err);
      res.status(500).json({ error: "Failed" });
    }
  });

  // ------------------------
  // TASKS
  // ------------------------
  app.post("/api/tasks", async (req, res) => {
    try {
      const payload = req.body;
      const user_id = payload.user_id || getUserIdFromReq(req) || 1;
      const { title, duration_minutes = null, deadline = null, priority = null, category = null } = payload;

      if (!title || title.trim() === "") return res.status(400).json({ error: "Title is required" });

      let mysqlDeadline = null;
      if (deadline) {
        const d = new Date(deadline);
        if (isNaN(d.getTime())) return res.status(400).json({ error: "Invalid deadline datetime" });
        mysqlDeadline = d.toISOString().slice(0, 19).replace("T", " ");
      }

      const [result] = await db.execute(
        `INSERT INTO tasks (user_id, title, duration_minutes, deadline, priority, category)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, title, duration_minutes, mysqlDeadline, priority, category]
      );

      const [taskRows] = await db.execute("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
      res.status(201).json(taskRows[0]);
    } catch (err) {
      console.error("Task Create Error:", err);
      res.status(500).json({ error: err.message || "Database error" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const [rows] = await db.execute("SELECT * FROM tasks ORDER BY id DESC");
      res.json(rows);
    } catch (err) {
      console.error("Task Fetch All Error:", err);
      res.status(500).json({ error: err.message || "Database error" });
    }
  });

  app.get("/api/tasks/user/:uid", async (req, res) => {
    try {
      const uid = Number(req.params.uid);
      const [rows] = await db.execute("SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC", [uid]);
      res.json(rows);
    } catch (err) {
      console.error("Task Fetch Error:", err);
      res.status(500).json({ error: err.message || "Database error" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const keys = Object.keys(data);
      if (!keys.length) return res.status(400).send("No fields to update");

      const allowed = new Set(["title","duration_minutes","deadline","priority","category","status","scheduled_start","scheduled_end","user_id"]);
      const filteredKeys = keys.filter((k) => allowed.has(k));
      if (!filteredKeys.length) return res.status(400).send("No valid fields to update");

      const setString = filteredKeys.map((k) => `\`${k}\` = ?`).join(", ");
      const values = [...filteredKeys.map((k) => data[k]), id];
      await db.execute(`UPDATE tasks SET ${setString} WHERE id = ?`, values);

      const [task] = await db.execute("SELECT * FROM tasks WHERE id = ?", [id]);
      res.json(task[0]);
    } catch (err) {
      console.error("Task Update Error:", err);
      res.status(500).json({ error: err.message || "Database error" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.execute("DELETE FROM tasks WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error("Task Delete Error:", err);
      res.status(500).json({ error: err.message || "Database error" });
    }
  });

  // ------------------------
  // notifications
  // ------------------------
  app.get("/api/notifications", async (req, res) => {
    try {
      const uid = Number(req.query.user_id) || getUserIdFromReq(req) || 1;
      const [rows] = await db.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC", [uid]);
      res.json(rows);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
      res.status(500).json({ error: err.message || "Database error" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const { user_id = 1, title = "", body = "" } = req.body;
      const [result] = await db.execute("INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)", [user_id, title, body]);
      const [rows] = await db.execute("SELECT * FROM notifications WHERE id = ?", [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Create Notification Error:", err);
      res.status(500).json({ error: err.message || "Database error" });
    }
  });

  // ------------------------
  // AI RECOMMENDATIONS (fixed routes)
  // ------------------------
  // Route 1: explicit user id in path
  app.get("/api/ai/recommendations/:uid", async (req, res) => {
    try {
      const uid = Number(req.params.uid) || getUserIdFromReq(req) || 1;
      const [logs] = await db.execute("SELECT * FROM routine_logs WHERE user_id = ?", [uid]);

      const hourly = new Array(24).fill(0);
      logs.forEach((l) => {
        const s = new Date(l.start_time);
        const e = new Date(l.end_time);
        let cur = new Date(s);
        while (cur < e) {
          hourly[cur.getHours()]++;
          cur = new Date(cur.getTime() + 60 * 1000);
        }
      });

      const best = hourly.map((v, i) => ({ hour: i, value: v })).sort((a, b) => b.value - a.value)[0];
      const recs = best && best.value > 0 ? [`Your best focus time is ${best.hour}:00 - ${(best.hour + 1) % 24}:00`] : ["Log more study sessions for better recommendations."];

      res.json({ recommendations: recs, hourly });
    } catch (err) {
      console.error("AI Recommendation Error:", err);
      res.status(500).json({ error: "AI error" });
    }
  });

  // Route 2: no param — use query or cookie fallback
  app.get("/api/ai/recommendations", async (req, res) => {
    try {
      const uid = Number(req.query.user_id) || getUserIdFromReq(req) || 1;
      const [logs] = await db.execute("SELECT * FROM routine_logs WHERE user_id = ?", [uid]);

      const hourly = new Array(24).fill(0);
      logs.forEach((l) => {
        const s = new Date(l.start_time);
        const e = new Date(l.end_time);
        let cur = new Date(s);
        while (cur < e) {
          hourly[cur.getHours()]++;
          cur = new Date(cur.getTime() + 60 * 1000);
        }
      });

      const best = hourly.map((v, i) => ({ hour: i, value: v })).sort((a, b) => b.value - a.value)[0];
      const recs = best && best.value > 0 ? [`Your best focus time is ${best.hour}:00 - ${(best.hour + 1) % 24}:00`] : ["Log more study sessions for better recommendations."];

      res.json({ recommendations: recs, hourly });
    } catch (err) {
      console.error("AI Recommendation Error:", err);
      res.status(500).json({ error: "AI error" });
    }
  });

  // ------------------------
  // global error handler
  // ------------------------
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err && err.stack ? err.stack : err);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}

init().catch((err) => {
  console.error("Initialization failed:", err);
  process.exit(1);
});
