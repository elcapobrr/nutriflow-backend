-- Create database
CREATE DATABASE IF NOT EXISTS nutriflow;
USE nutriflow;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- OAuth fields
  google_id VARCHAR(255) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,
  -- Traditional auth fields
  username VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  -- Common fields
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar VARCHAR(500),
  provider ENUM('google', 'apple', 'email') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_google_id (google_id),
  INDEX idx_apple_id (apple_id),
  INDEX idx_username (username),
  INDEX idx_email (email)
);

-- User profiles table (stores nutrition data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Food entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  calories INT NOT NULL,
  protein DECIMAL(10,2) DEFAULT 0,
  carbs DECIMAL(10,2) DEFAULT 0,
  fats DECIMAL(10,2) DEFAULT 0,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') DEFAULT 'breakfast',
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_timestamp (user_id, timestamp DESC)
);
