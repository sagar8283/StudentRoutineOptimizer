const mysql = require("mysql2/promise");

async function connectDB() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",        // no .env
    user: "optimizer",        // no .env
    password: "StrongPassword123",
    database: "student_optimizer",
    port: 3306
  });

  console.log("✓ Connected to MySQL");
  return connection;
}

module.exports = connectDB;
