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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
