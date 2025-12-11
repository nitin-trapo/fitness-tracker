import Dexie from 'dexie';

// Create the database
const db = new Dexie('FitnessTrackerDB');

// Define schema
db.version(1).stores({
  workouts: '++id, day_of_week, day_name, workout_type, muscle_groups, is_rest_day',
  exercises: '++id, workout_id, name, sets, reps, category, order_index',
  meals: '++id, name, time, meal_type, items, order_index',
  daily_logs: '++id, &log_date, weight, water_intake, notes',
  exercise_logs: '++id, daily_log_id, exercise_id, completed, sets_completed, notes, [daily_log_id+exercise_id]',
  meal_logs: '++id, daily_log_id, meal_id, completed, [daily_log_id+meal_id]'
});

export default db;
