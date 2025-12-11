import express from 'express';
import cors from 'cors';
import db from './database.js';
import { seedDatabase } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database
seedDatabase();

// Helper functions
const getDateString = (date = new Date()) => date.toISOString().split('T')[0];

const getOrCreateDailyLog = (date) => {
  let log = db.prepare('SELECT * FROM daily_logs WHERE log_date = ?').get(date);
  if (!log) {
    const result = db.prepare("INSERT INTO daily_logs (log_date, weight, water_intake, notes) VALUES (?, NULL, 0, '')").run(date);
    log = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(result.lastInsertRowid);
  }
  return log;
};

// API Routes

// Get today's data
app.get('/api/today', (req, res) => {
  try {
    const date = getDateString();
    const dayOfWeek = new Date().getDay();
    
    const workout = db.prepare('SELECT * FROM workouts WHERE day_of_week = ?').get(dayOfWeek);
    
    let exercises = [];
    if (workout && !workout.is_rest_day) {
      exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index').all(workout.id);
    }
    
    const meals = db.prepare('SELECT * FROM meals ORDER BY order_index').all();
    const dailyLog = getOrCreateDailyLog(date);
    
    const exerciseLogs = db.prepare('SELECT * FROM exercise_logs WHERE daily_log_id = ?').all(dailyLog.id);
    const exerciseLogMap = {};
    exerciseLogs.forEach(log => { exerciseLogMap[log.exercise_id] = log; });
    
    const mealLogs = db.prepare('SELECT * FROM meal_logs WHERE daily_log_id = ?').all(dailyLog.id);
    const mealLogMap = {};
    mealLogs.forEach(log => { mealLogMap[log.meal_id] = log; });
    
    const exercisesWithStatus = exercises.map(ex => ({
      ...ex,
      completed: exerciseLogMap[ex.id]?.completed === 1,
      sets_completed: exerciseLogMap[ex.id]?.sets_completed || 0
    }));
    
    const mealsWithStatus = meals.map(meal => ({
      ...meal,
      items: JSON.parse(meal.items || '[]'),
      completed: mealLogMap[meal.id]?.completed === 1
    }));
    
    res.json({
      date,
      dayOfWeek,
      workout: workout ? { ...workout, muscle_groups: JSON.parse(workout.muscle_groups || '[]') } : null,
      exercises: exercisesWithStatus,
      meals: mealsWithStatus,
      dailyLog
    });
  } catch (error) {
    console.error('Error getting today:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get data for specific date
app.get('/api/day/:date', (req, res) => {
  try {
    const date = req.params.date;
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    
    const workout = db.prepare('SELECT * FROM workouts WHERE day_of_week = ?').get(dayOfWeek);
    
    let exercises = [];
    if (workout && !workout.is_rest_day) {
      exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index').all(workout.id);
    }
    
    const meals = db.prepare('SELECT * FROM meals ORDER BY order_index').all();
    const dailyLog = getOrCreateDailyLog(date);
    
    const exerciseLogs = db.prepare('SELECT * FROM exercise_logs WHERE daily_log_id = ?').all(dailyLog.id);
    const exerciseLogMap = {};
    exerciseLogs.forEach(log => { exerciseLogMap[log.exercise_id] = log; });
    
    const mealLogs = db.prepare('SELECT * FROM meal_logs WHERE daily_log_id = ?').all(dailyLog.id);
    const mealLogMap = {};
    mealLogs.forEach(log => { mealLogMap[log.meal_id] = log; });
    
    const exercisesWithStatus = exercises.map(ex => ({
      ...ex,
      completed: exerciseLogMap[ex.id]?.completed === 1,
      sets_completed: exerciseLogMap[ex.id]?.sets_completed || 0
    }));
    
    const mealsWithStatus = meals.map(meal => ({
      ...meal,
      items: JSON.parse(meal.items || '[]'),
      completed: mealLogMap[meal.id]?.completed === 1
    }));
    
    res.json({
      date,
      dayOfWeek,
      workout: workout ? { ...workout, muscle_groups: JSON.parse(workout.muscle_groups || '[]') } : null,
      exercises: exercisesWithStatus,
      meals: mealsWithStatus,
      dailyLog
    });
  } catch (error) {
    console.error('Error getting day:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all workouts
app.get('/api/workouts', (req, res) => {
  try {
    const workouts = db.prepare('SELECT * FROM workouts ORDER BY day_of_week').all();
    res.json(workouts.map(w => ({ ...w, muscle_groups: JSON.parse(w.muscle_groups || '[]') })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all meals
app.get('/api/meals', (req, res) => {
  try {
    const meals = db.prepare('SELECT * FROM meals ORDER BY order_index').all();
    res.json(meals.map(m => ({ ...m, items: JSON.parse(m.items || '[]') })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update daily log
app.put('/api/daily-log/:date', (req, res) => {
  try {
    const { date } = req.params;
    const { weight, water_intake, notes } = req.body;
    
    const dailyLog = getOrCreateDailyLog(date);
    
    const updates = [];
    const values = [];
    
    if (weight !== undefined) { updates.push('weight = ?'); values.push(weight); }
    if (water_intake !== undefined) { updates.push('water_intake = ?'); values.push(water_intake); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    updates.push('updated_at = ?'); values.push(new Date().toISOString());
    values.push(dailyLog.id);
    
    db.prepare(`UPDATE daily_logs SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    
    const updated = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(dailyLog.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle exercise
app.post('/api/exercise-toggle', (req, res) => {
  try {
    const { date, exerciseId, completed, setsCompleted = 0 } = req.body;
    const dailyLog = getOrCreateDailyLog(date);
    
    const existing = db.prepare('SELECT * FROM exercise_logs WHERE daily_log_id = ? AND exercise_id = ?').get(dailyLog.id, exerciseId);
    
    if (existing) {
      db.prepare('UPDATE exercise_logs SET completed = ?, sets_completed = ? WHERE id = ?').run(completed ? 1 : 0, setsCompleted, existing.id);
    } else {
      db.prepare("INSERT INTO exercise_logs (daily_log_id, exercise_id, completed, sets_completed, notes) VALUES (?, ?, ?, ?, '')").run(dailyLog.id, exerciseId, completed ? 1 : 0, setsCompleted);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle meal
app.post('/api/meal-toggle', (req, res) => {
  try {
    const { date, mealId, completed } = req.body;
    const dailyLog = getOrCreateDailyLog(date);
    
    const existing = db.prepare('SELECT * FROM meal_logs WHERE daily_log_id = ? AND meal_id = ?').get(dailyLog.id, mealId);
    
    if (existing) {
      db.prepare('UPDATE meal_logs SET completed = ? WHERE id = ?').run(completed ? 1 : 0, existing.id);
    } else {
      db.prepare('INSERT INTO meal_logs (daily_log_id, meal_id, completed) VALUES (?, ?, ?)').run(dailyLog.id, mealId, completed ? 1 : 0);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress
app.get('/api/progress', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = db.prepare('SELECT * FROM daily_logs WHERE log_date >= ? AND log_date <= ? ORDER BY log_date').all(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    const progressData = logs.map(log => {
      const exerciseLogs = db.prepare('SELECT * FROM exercise_logs WHERE daily_log_id = ?').all(log.id);
      const mealLogs = db.prepare('SELECT * FROM meal_logs WHERE daily_log_id = ?').all(log.id);
      
      return {
        date: log.log_date,
        weight: log.weight,
        water_intake: log.water_intake,
        exercises_completed: exerciseLogs.filter(e => e.completed).length,
        meals_completed: mealLogs.filter(m => m.completed).length
      };
    });
    
    res.json(progressData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get streak
app.get('/api/streak', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM daily_logs ORDER BY log_date DESC').all();
    
    let streak = 0;
    const today = getDateString();
    let checkDate = new Date();
    
    for (const log of logs) {
      const expectedDate = getDateString(checkDate);
      if (log.log_date === expectedDate) {
        const exerciseLogs = db.prepare('SELECT * FROM exercise_logs WHERE daily_log_id = ?').all(log.id);
        const mealLogs = db.prepare('SELECT * FROM meal_logs WHERE daily_log_id = ?').all(log.id);
        
        const hasActivity = exerciseLogs.some(e => e.completed) || mealLogs.some(m => m.completed);
        
        if (hasActivity) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (log.log_date !== today) {
          break;
        }
      } else if (log.log_date < expectedDate) {
        break;
      }
    }
    
    res.json({ streak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get exercises for workout
app.get('/api/exercises/:workoutId', (req, res) => {
  try {
    const exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index').all(req.params.workoutId);
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add exercise
app.post('/api/exercises', (req, res) => {
  try {
    const { workout_id, name, sets, reps, category, order_index } = req.body;
    const result = db.prepare('INSERT INTO exercises (workout_id, name, sets, reps, category, order_index) VALUES (?, ?, ?, ?, ?, ?)').run(workout_id, name, sets, reps, category, order_index || 0);
    const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(result.lastInsertRowid);
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update exercise
app.put('/api/exercises/:id', (req, res) => {
  try {
    const { name, sets, reps, category, order_index } = req.body;
    db.prepare('UPDATE exercises SET name = ?, sets = ?, reps = ?, category = ?, order_index = ? WHERE id = ?').run(name, sets, reps, category, order_index || 0, req.params.id);
    const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete exercise
app.delete('/api/exercises/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add meal
app.post('/api/meals', (req, res) => {
  try {
    const { name, time, meal_type, items, order_index } = req.body;
    const itemsStr = typeof items === 'string' ? items : JSON.stringify(items);
    const result = db.prepare('INSERT INTO meals (name, time, meal_type, items, order_index) VALUES (?, ?, ?, ?, ?)').run(name, time, meal_type, itemsStr, order_index || 0);
    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(result.lastInsertRowid);
    res.json({ ...meal, items: JSON.parse(meal.items || '[]') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update meal
app.put('/api/meals/:id', (req, res) => {
  try {
    const { name, time, meal_type, items, order_index } = req.body;
    const itemsStr = typeof items === 'string' ? items : JSON.stringify(items);
    db.prepare('UPDATE meals SET name = ?, time = ?, meal_type = ?, items = ?, order_index = ? WHERE id = ?').run(name, time, meal_type, itemsStr, order_index || 0, req.params.id);
    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
    res.json({ ...meal, items: JSON.parse(meal.items || '[]') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete meal
app.delete('/api/meals/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PERSONAL RECORDS (PRs) ============

// Get all PRs
app.get('/api/personal-records', (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM personal_records ORDER BY record_date DESC').all();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get PR for specific exercise
app.get('/api/personal-records/:exerciseName', (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM personal_records WHERE exercise_name = ? ORDER BY weight DESC, reps DESC LIMIT 1').get(req.params.exerciseName);
    res.json(records || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new PR
app.post('/api/personal-records', (req, res) => {
  try {
    const { exercise_name, weight, reps, record_date, notes } = req.body;
    const result = db.prepare("INSERT INTO personal_records (exercise_name, weight, reps, record_date, notes) VALUES (?, ?, ?, ?, ?)").run(exercise_name, weight, reps, record_date || new Date().toISOString().split('T')[0], notes || '');
    const record = db.prepare('SELECT * FROM personal_records WHERE id = ?').get(result.lastInsertRowid);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ BODY MEASUREMENTS ============

// Get all measurements
app.get('/api/measurements', (req, res) => {
  try {
    const measurements = db.prepare('SELECT * FROM body_measurements ORDER BY measure_date DESC').all();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest measurement
app.get('/api/measurements/latest', (req, res) => {
  try {
    const measurement = db.prepare('SELECT * FROM body_measurements ORDER BY measure_date DESC LIMIT 1').get();
    res.json(measurement || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update measurement
app.post('/api/measurements', (req, res) => {
  try {
    const { measure_date, chest, waist, hips, left_arm, right_arm, left_thigh, right_thigh, neck, shoulders, body_fat_percentage, notes } = req.body;
    const date = measure_date || new Date().toISOString().split('T')[0];
    
    const existing = db.prepare('SELECT * FROM body_measurements WHERE measure_date = ?').get(date);
    
    if (existing) {
      db.prepare('UPDATE body_measurements SET chest = ?, waist = ?, hips = ?, left_arm = ?, right_arm = ?, left_thigh = ?, right_thigh = ?, neck = ?, shoulders = ?, body_fat_percentage = ?, notes = ? WHERE id = ?')
        .run(chest, waist, hips, left_arm, right_arm, left_thigh, right_thigh, neck, shoulders, body_fat_percentage, notes || '', existing.id);
      res.json(db.prepare('SELECT * FROM body_measurements WHERE id = ?').get(existing.id));
    } else {
      const result = db.prepare('INSERT INTO body_measurements (measure_date, chest, waist, hips, left_arm, right_arm, left_thigh, right_thigh, neck, shoulders, body_fat_percentage, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(date, chest, waist, hips, left_arm, right_arm, left_thigh, right_thigh, neck, shoulders, body_fat_percentage, notes || '');
      res.json(db.prepare('SELECT * FROM body_measurements WHERE id = ?').get(result.lastInsertRowid));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GOALS ============

// Get all goals
app.get('/api/goals', (req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM goals ORDER BY completed ASC, target_date ASC').all();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add goal
app.post('/api/goals', (req, res) => {
  try {
    const { goal_type, title, target_value, current_value, unit, target_date } = req.body;
    const result = db.prepare('INSERT INTO goals (goal_type, title, target_value, current_value, unit, target_date) VALUES (?, ?, ?, ?, ?, ?)')
      .run(goal_type, title, target_value, current_value || 0, unit, target_date);
    res.json(db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update goal
app.put('/api/goals/:id', (req, res) => {
  try {
    const { current_value, completed } = req.body;
    const completedDate = completed ? new Date().toISOString().split('T')[0] : null;
    db.prepare('UPDATE goals SET current_value = ?, completed = ?, completed_date = ? WHERE id = ?')
      .run(current_value, completed ? 1 : 0, completedDate, req.params.id);
    res.json(db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete goal
app.delete('/api/goals/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ACHIEVEMENTS ============

// Get all achievements
app.get('/api/achievements', (req, res) => {
  try {
    const achievements = db.prepare('SELECT * FROM achievements ORDER BY unlocked DESC, badge_name ASC').all();
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlock achievement
app.post('/api/achievements/unlock', (req, res) => {
  try {
    const { badge_id } = req.body;
    const unlockedDate = new Date().toISOString().split('T')[0];
    db.prepare('UPDATE achievements SET unlocked = 1, unlocked_date = ? WHERE badge_id = ?').run(unlockedDate, badge_id);
    res.json(db.prepare('SELECT * FROM achievements WHERE badge_id = ?').get(badge_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ NUTRITION TRACKING ============

// Get nutrition logs for date
app.get('/api/nutrition/:date', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM nutrition_logs WHERE log_date = ? ORDER BY id ASC').all(req.params.date);
    const totals = db.prepare('SELECT SUM(calories) as total_calories, SUM(protein) as total_protein, SUM(carbs) as total_carbs, SUM(fats) as total_fats, SUM(fiber) as total_fiber FROM nutrition_logs WHERE log_date = ?').get(req.params.date);
    res.json({ logs, totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add nutrition log
app.post('/api/nutrition', (req, res) => {
  try {
    const { log_date, meal_name, calories, protein, carbs, fats, fiber, notes } = req.body;
    const result = db.prepare('INSERT INTO nutrition_logs (log_date, meal_name, calories, protein, carbs, fats, fiber, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(log_date, meal_name, calories || 0, protein || 0, carbs || 0, fats || 0, fiber || 0, notes || '');
    res.json(db.prepare('SELECT * FROM nutrition_logs WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete nutrition log
app.delete('/api/nutrition/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM nutrition_logs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SUPPLEMENTS ============

// Get supplements for date
app.get('/api/supplements/:date', (req, res) => {
  try {
    const supplements = db.prepare('SELECT * FROM supplement_logs WHERE log_date = ? ORDER BY id ASC').all(req.params.date);
    res.json(supplements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add supplement log
app.post('/api/supplements', (req, res) => {
  try {
    const { log_date, supplement_name, dosage, taken, time_taken } = req.body;
    const result = db.prepare('INSERT INTO supplement_logs (log_date, supplement_name, dosage, taken, time_taken) VALUES (?, ?, ?, ?, ?)')
      .run(log_date, supplement_name, dosage, taken ? 1 : 0, time_taken);
    res.json(db.prepare('SELECT * FROM supplement_logs WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle supplement taken
app.put('/api/supplements/:id', (req, res) => {
  try {
    const { taken, time_taken } = req.body;
    db.prepare('UPDATE supplement_logs SET taken = ?, time_taken = ? WHERE id = ?').run(taken ? 1 : 0, time_taken, req.params.id);
    res.json(db.prepare('SELECT * FROM supplement_logs WHERE id = ?').get(req.params.id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ USER SETTINGS ============

// Get all settings
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM user_settings').all();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.setting_key] = s.setting_value; });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update setting
app.put('/api/settings/:key', (req, res) => {
  try {
    const { value } = req.body;
    const existing = db.prepare('SELECT * FROM user_settings WHERE setting_key = ?').get(req.params.key);
    if (existing) {
      db.prepare('UPDATE user_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?')
        .run(value, new Date().toISOString(), req.params.key);
    } else {
      db.prepare('INSERT INTO user_settings (setting_key, setting_value) VALUES (?, ?)')
        .run(req.params.key, value);
    }
    res.json({ [req.params.key]: value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MOTIVATIONAL QUOTES ============

// Get random quote
app.get('/api/quote', (req, res) => {
  try {
    const quote = db.prepare('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1').get();
    res.json(quote || { quote_text: "The only bad workout is the one that didn't happen.", author: "Unknown" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all quotes
app.get('/api/quotes', (req, res) => {
  try {
    const quotes = db.prepare('SELECT * FROM quotes').all();
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ WORKOUT SESSIONS/HISTORY ============

// Get workout history
app.get('/api/workout-history', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const sessions = db.prepare(`
      SELECT ws.*, w.workout_type, w.muscle_groups 
      FROM workout_sessions ws 
      LEFT JOIN workouts w ON ws.workout_id = w.id 
      ORDER BY ws.session_date DESC 
      LIMIT ?
    `).all(days);
    res.json(sessions.map(s => ({ ...s, muscle_groups: JSON.parse(s.muscle_groups || '[]') })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add workout session
app.post('/api/workout-sessions', (req, res) => {
  try {
    const { session_date, workout_id, duration_minutes, total_volume, calories_burned, notes, rating } = req.body;
    const result = db.prepare('INSERT INTO workout_sessions (session_date, workout_id, duration_minutes, total_volume, calories_burned, notes, rating) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(session_date, workout_id, duration_minutes, total_volume || 0, calories_burned || 0, notes || '', rating);
    res.json(db.prepare('SELECT * FROM workout_sessions WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EXERCISE SETS WITH WEIGHT ============

// Get sets for exercise log
app.get('/api/exercise-sets/:exerciseLogId', (req, res) => {
  try {
    const sets = db.prepare('SELECT * FROM exercise_sets WHERE exercise_log_id = ? ORDER BY set_number ASC').all(req.params.exerciseLogId);
    res.json(sets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update exercise set
app.post('/api/exercise-sets', (req, res) => {
  try {
    const { exercise_log_id, set_number, weight, reps, completed, notes } = req.body;
    const existing = db.prepare('SELECT * FROM exercise_sets WHERE exercise_log_id = ? AND set_number = ?').get(exercise_log_id, set_number);
    
    if (existing) {
      db.prepare('UPDATE exercise_sets SET weight = ?, reps = ?, completed = ?, notes = ? WHERE id = ?')
        .run(weight, reps, completed ? 1 : 0, notes || '', existing.id);
      res.json(db.prepare('SELECT * FROM exercise_sets WHERE id = ?').get(existing.id));
    } else {
      const result = db.prepare('INSERT INTO exercise_sets (exercise_log_id, set_number, weight, reps, completed, notes) VALUES (?, ?, ?, ?, ?, ?)')
        .run(exercise_log_id, set_number, weight, reps, completed ? 1 : 0, notes || '');
      res.json(db.prepare('SELECT * FROM exercise_sets WHERE id = ?').get(result.lastInsertRowid));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ WEIGHT HISTORY FOR CHARTS ============

// Get weight history
app.get('/api/weight-history', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const weights = db.prepare('SELECT log_date, weight FROM daily_logs WHERE weight IS NOT NULL ORDER BY log_date DESC LIMIT ?').all(days);
    res.json(weights.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ STREAK CALENDAR ============

// Get activity calendar
app.get('/api/activity-calendar', (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null;
    
    let query = 'SELECT log_date FROM daily_logs WHERE strftime("%Y", log_date) = ?';
    let params = [year.toString()];
    
    if (month !== null) {
      query += ' AND strftime("%m", log_date) = ?';
      params.push(month.toString().padStart(2, '0'));
    }
    
    const logs = db.prepare(query).all(...params);
    const activeDates = [];
    
    for (const log of logs) {
      const exerciseLogs = db.prepare('SELECT * FROM exercise_logs el JOIN daily_logs dl ON el.daily_log_id = dl.id WHERE dl.log_date = ? AND el.completed = 1').all(log.log_date);
      const mealLogs = db.prepare('SELECT * FROM meal_logs ml JOIN daily_logs dl ON ml.daily_log_id = dl.id WHERE dl.log_date = ? AND ml.completed = 1').all(log.log_date);
      
      if (exerciseLogs.length > 0 || mealLogs.length > 0) {
        activeDates.push({
          date: log.log_date,
          workouts: exerciseLogs.length,
          meals: mealLogs.length
        });
      }
    }
    
    res.json(activeDates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DATA EXPORT ============

// Export all data as JSON
app.get('/api/export', (req, res) => {
  try {
    const data = {
      daily_logs: db.prepare('SELECT * FROM daily_logs').all(),
      exercise_logs: db.prepare('SELECT * FROM exercise_logs').all(),
      meal_logs: db.prepare('SELECT * FROM meal_logs').all(),
      personal_records: db.prepare('SELECT * FROM personal_records').all(),
      body_measurements: db.prepare('SELECT * FROM body_measurements').all(),
      goals: db.prepare('SELECT * FROM goals').all(),
      nutrition_logs: db.prepare('SELECT * FROM nutrition_logs').all(),
      supplement_logs: db.prepare('SELECT * FROM supplement_logs').all(),
      workout_sessions: db.prepare('SELECT * FROM workout_sessions').all(),
      exercise_sets: db.prepare('SELECT * FROM exercise_sets').all(),
      exported_at: new Date().toISOString()
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
