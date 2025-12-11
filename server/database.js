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

  -- Personal Records (PRs) for tracking best performance
  CREATE TABLE IF NOT EXISTS personal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_name TEXT NOT NULL,
    weight REAL,
    reps INTEGER,
    record_date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Body Measurements tracking
  CREATE TABLE IF NOT EXISTS body_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    measure_date TEXT UNIQUE NOT NULL,
    chest REAL,
    waist REAL,
    hips REAL,
    left_arm REAL,
    right_arm REAL,
    left_thigh REAL,
    right_thigh REAL,
    neck REAL,
    shoulders REAL,
    body_fat_percentage REAL,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Goals tracking
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_type TEXT NOT NULL,
    title TEXT NOT NULL,
    target_value REAL,
    current_value REAL DEFAULT 0,
    unit TEXT,
    target_date TEXT,
    completed INTEGER DEFAULT 0,
    completed_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Achievements/Badges
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge_id TEXT UNIQUE NOT NULL,
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    unlocked INTEGER DEFAULT 0,
    unlocked_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Calorie/Nutrition tracking
  CREATE TABLE IF NOT EXISTS nutrition_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_date TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    calories INTEGER DEFAULT 0,
    protein REAL DEFAULT 0,
    carbs REAL DEFAULT 0,
    fats REAL DEFAULT 0,
    fiber REAL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Supplement tracking
  CREATE TABLE IF NOT EXISTS supplement_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_date TEXT NOT NULL,
    supplement_name TEXT NOT NULL,
    dosage TEXT,
    taken INTEGER DEFAULT 0,
    time_taken TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- User settings/preferences
  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Motivational quotes
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_text TEXT NOT NULL,
    author TEXT DEFAULT 'Unknown'
  );

  -- Workout history with detailed stats
  CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_date TEXT NOT NULL,
    workout_id INTEGER,
    duration_minutes INTEGER,
    total_volume REAL DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    rating INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id)
  );

  -- Exercise sets with weight tracking for PR calculation
  CREATE TABLE IF NOT EXISTS exercise_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_log_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL,
    reps INTEGER,
    completed INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    FOREIGN KEY (exercise_log_id) REFERENCES exercise_logs(id)
  );
`);

export default db;
