import db from './config.js';

function initDatabase() {
  try {
    console.log('🔧 Initializing SQLite database...\n');

    // Create tables
    db.exec(`
      -- Workouts table (stores workout day templates)
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_of_week INTEGER NOT NULL,
        day_name TEXT NOT NULL,
        workout_type TEXT NOT NULL,
        muscle_groups TEXT,
        is_rest_day INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Exercises table
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps TEXT NOT NULL,
        category TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
      );

      -- Meals table (stores meal templates)
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        time TEXT NOT NULL,
        meal_type TEXT,
        items TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Daily logs table (stores user's daily tracking)
      CREATE TABLE IF NOT EXISTS daily_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_date TEXT NOT NULL UNIQUE,
        weight REAL DEFAULT NULL,
        water_intake INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Exercise completion logs
      CREATE TABLE IF NOT EXISTS exercise_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_log_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        sets_completed INTEGER DEFAULT 0,
        notes TEXT,
        FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        UNIQUE (daily_log_id, exercise_id)
      );

      -- Meal completion logs
      CREATE TABLE IF NOT EXISTS meal_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_log_id INTEGER NOT NULL,
        meal_id INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id) ON DELETE CASCADE,
        FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
        UNIQUE (daily_log_id, meal_id)
      );
    `);

    console.log('✅ All tables created successfully');
    console.log('\nRun "npm run db:seed" to populate with workout and diet data');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
}

initDatabase();
