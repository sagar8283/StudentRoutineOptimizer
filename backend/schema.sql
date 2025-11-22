CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  duration INT,
  deadline DATETIME,
  priority VARCHAR(50),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sleep_hours INT,
  study_hours INT,
  screen_time INT,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
