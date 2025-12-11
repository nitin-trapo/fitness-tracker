import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'fitness.db'));

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER UNIQUE NOT NULL,
    day_name TEXT NOT NULL,
    workout_type TEXT NOT NULL,
    muscle_groups TEXT DEFAULT '[]',
    is_rest_day INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps TEXT NOT NULL,
    category TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (workout_id) REFERENCES workouts(id)
  );

  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    items TEXT DEFAULT '[]',
    order_index INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_date TEXT UNIQUE NOT NULL,
    weight REAL,
    water_intake INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS exercise_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    daily_log_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    sets_completed INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    UNIQUE(daily_log_id, exercise_id)
  );

  CREATE TABLE IF NOT EXISTS meal_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    daily_log_id INTEGER NOT NULL,
    meal_id INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id),
    FOREIGN KEY (meal_id) REFERENCES meals(id),
    UNIQUE(daily_log_id, meal_id)
  );
`);

export default db;
