import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============ HELPER FUNCTIONS ============

// Get or create daily log for a date
function getOrCreateDailyLog(date) {
  // Check if log exists
  const existing = db.prepare('SELECT * FROM daily_logs WHERE log_date = ?').get(date);

  if (existing) {
    return existing;
  }

  // Create new log
  const result = db.prepare('INSERT INTO daily_logs (log_date) VALUES (?)').run(date);

  return { id: result.lastInsertRowid, log_date: date, weight: null, water_intake: 0, notes: null };
}

// ============ API ROUTES ============

// API root
app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Fitness Tracker API',
    author: 'Nitin Patoliya',
    endpoints: [
      'GET /api/health',
      'GET /api/today',
      'GET /api/day/:date',
      'GET /api/workouts',
      'GET /api/meals',
      'PUT /api/daily-log/:date',
      'POST /api/exercise-log',
      'POST /api/meal-log',
      'GET /api/progress',
      'GET /api/streak'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fitness Tracker API is running' });
});

// Get today's data (workout + meals + log)
app.get('/api/today', (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Get workout for today
    const workout = db.prepare('SELECT * FROM workouts WHERE day_of_week = ?').get(dayOfWeek);

    // Get exercises for today's workout
    let exercises = [];
    if (workout && !workout.is_rest_day) {
      exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index').all(workout.id);
    }

    // Get all meals
    const meals = db.prepare('SELECT * FROM meals ORDER BY order_index').all();

    // Get or create daily log
    const dailyLog = getOrCreateDailyLog(dateStr);

    // Get exercise completion status
    const exerciseLogs = db.prepare('SELECT * FROM exercise_logs WHERE daily_log_id = ?').all(dailyLog.id);

    // Get meal completion status
    const mealLogs = db.prepare('SELECT * FROM meal_logs WHERE daily_log_id = ?').all(dailyLog.id);

    // Map completion status to exercises
    const exerciseLogMap = {};
    exerciseLogs.forEach(log => {
      exerciseLogMap[log.exercise_id] = log;
    });

    const exercisesWithStatus = exercises.map(ex => ({
      ...ex,
      completed: exerciseLogMap[ex.id]?.completed ? true : false,
      sets_completed: exerciseLogMap[ex.id]?.sets_completed || 0
    }));

    // Map completion status to meals
    const mealLogMap = {};
    mealLogs.forEach(log => {
      mealLogMap[log.meal_id] = log;
    });

    const mealsWithStatus = meals.map(meal => ({
      ...meal,
      items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items,
      completed: mealLogMap[meal.id]?.completed ? true : false
    }));

    res.json({
      date: dateStr,
      dayOfWeek,
      workout: workout ? {
        ...workout,
        is_rest_day: workout.is_rest_day ? true : false,
        muscle_groups: typeof workout.muscle_groups === 'string' 
          ? JSON.parse(workout.muscle_groups) 
          : workout.muscle_groups
      } : null,
      exercises: exercisesWithStatus,
      meals: mealsWithStatus,
      dailyLog
    });
  } catch (error) {
    console.error('Error fetching today data:', error);
    res.status(500).json({ error: 'Failed to fetch today data' });
  }
});

// Get data for a specific date
app.get('/api/day/:date', (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get workout for that day
    const workout = db.prepare('SELECT * FROM workouts WHERE day_of_week = ?').get(dayOfWeek);

    // Get exercises
    let exercises = [];
    if (workout && !workout.is_rest_day) {
      exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index').all(workout.id);
    }

    // Get all meals
    const meals = db.prepare('SELECT * FROM meals ORDER BY order_index').all();

    // Get or create daily log
    const dailyLog = getOrCreateDailyLog(date);

    // Get completion statuses
    const exerciseLogs = db.prepare('SELECT * FROM exercise_logs WHERE daily_log_id = ?').all(dailyLog.id);
    const mealLogs = db.prepare('SELECT * FROM meal_logs WHERE daily_log_id = ?').all(dailyLog.id);

    // Map statuses
    const exerciseLogMap = {};
    exerciseLogs.forEach(log => exerciseLogMap[log.exercise_id] = log);

    const mealLogMap = {};
    mealLogs.forEach(log => mealLogMap[log.meal_id] = log);

    res.json({
      date,
      dayOfWeek,
      workout: workout ? {
        ...workout,
        is_rest_day: workout.is_rest_day ? true : false,
        muscle_groups: typeof workout.muscle_groups === 'string' 
          ? JSON.parse(workout.muscle_groups) 
          : workout.muscle_groups
      } : null,
      exercises: exercises.map(ex => ({
        ...ex,
        completed: exerciseLogMap[ex.id]?.completed ? true : false,
        sets_completed: exerciseLogMap[ex.id]?.sets_completed || 0
      })),
      meals: meals.map(meal => ({
        ...meal,
        items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items,
        completed: mealLogMap[meal.id]?.completed ? true : false
      })),
      dailyLog
    });
  } catch (error) {
    console.error('Error fetching day data:', error);
    res.status(500).json({ error: 'Failed to fetch day data' });
  }
});

// Get all workouts (weekly schedule)
app.get('/api/workouts', (req, res) => {
  try {
    const workouts = db.prepare('SELECT * FROM workouts ORDER BY day_of_week').all();
    const result = workouts.map(w => ({
      ...w,
      is_rest_day: w.is_rest_day ? true : false,
      muscle_groups: typeof w.muscle_groups === 'string' ? JSON.parse(w.muscle_groups) : w.muscle_groups
    }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// Get all meals
app.get('/api/meals', (req, res) => {
  try {
    const meals = db.prepare('SELECT * FROM meals ORDER BY order_index').all();
    const result = meals.map(m => ({
      ...m,
      items: typeof m.items === 'string' ? JSON.parse(m.items) : m.items
    }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Update daily log (weight, water, notes)
app.put('/api/daily-log/:date', (req, res) => {
  try {
    const { date } = req.params;
    const { weight, water_intake, notes } = req.body;

    const dailyLog = getOrCreateDailyLog(date);

    const updates = [];
    const values = [];

    if (weight !== undefined) {
      updates.push('weight = ?');
      values.push(weight);
    }
    if (water_intake !== undefined) {
      updates.push('water_intake = ?');
      values.push(water_intake);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (updates.length > 0) {
      values.push(dailyLog.id);
      db.prepare(`UPDATE daily_logs SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    // Fetch updated log
    const updated = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(dailyLog.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating daily log:', error);
    res.status(500).json({ error: 'Failed to update daily log' });
  }
});

// Toggle exercise completion
app.post('/api/exercise-log', (req, res) => {
  try {
    const { date, exercise_id, completed, sets_completed } = req.body;

    const dailyLog = getOrCreateDailyLog(date);

    // Check if log exists
    const existing = db.prepare('SELECT * FROM exercise_logs WHERE daily_log_id = ? AND exercise_id = ?').get(dailyLog.id, exercise_id);

    if (existing) {
      // Update existing
      db.prepare('UPDATE exercise_logs SET completed = ?, sets_completed = ? WHERE id = ?').run(completed ? 1 : 0, sets_completed || 0, existing.id);
    } else {
      // Insert new
      db.prepare('INSERT INTO exercise_logs (daily_log_id, exercise_id, completed, sets_completed) VALUES (?, ?, ?, ?)').run(dailyLog.id, exercise_id, completed ? 1 : 0, sets_completed || 0);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating exercise log:', error);
    res.status(500).json({ error: 'Failed to update exercise log' });
  }
});

// Toggle meal completion
app.post('/api/meal-log', (req, res) => {
  try {
    const { date, meal_id, completed } = req.body;

    const dailyLog = getOrCreateDailyLog(date);

    // Check if log exists
    const existing = db.prepare('SELECT * FROM meal_logs WHERE daily_log_id = ? AND meal_id = ?').get(dailyLog.id, meal_id);

    if (existing) {
      // Update existing
      db.prepare('UPDATE meal_logs SET completed = ? WHERE id = ?').run(completed ? 1 : 0, existing.id);
    } else {
      // Insert new
      db.prepare('INSERT INTO meal_logs (daily_log_id, meal_id, completed) VALUES (?, ?, ?)').run(dailyLog.id, meal_id, completed ? 1 : 0);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating meal log:', error);
    res.status(500).json({ error: 'Failed to update meal log' });
  }
});

// Get progress history (weight tracking)
app.get('/api/progress', (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const logs = db.prepare(
      `SELECT log_date, weight, water_intake 
       FROM daily_logs 
       WHERE weight IS NOT NULL 
       ORDER BY log_date DESC 
       LIMIT ?`
    ).all(parseInt(days));

    res.json(logs.reverse());
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get streak count
app.get('/api/streak', (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const logs = db.prepare(
      `SELECT log_date FROM daily_logs 
       WHERE log_date <= ? 
       ORDER BY log_date DESC`
    ).all(todayStr);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].log_date);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

// ============ CUSTOMIZATION ROUTES ============

// Get exercises for a specific workout day
app.get('/api/exercises/:workoutId', (req, res) => {
  try {
    const { workoutId } = req.params;
    const exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index').all(workoutId);
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Add new exercise
app.post('/api/exercises', (req, res) => {
  try {
    const { workout_id, name, sets, reps, category } = req.body;
    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM exercises WHERE workout_id = ?').get(workout_id);
    const orderIndex = (maxOrder?.max || 0) + 1;
    
    const result = db.prepare(
      'INSERT INTO exercises (workout_id, name, sets, reps, category, order_index) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(workout_id, name, sets, reps, category, orderIndex);
    
    res.json({ id: result.lastInsertRowid, workout_id, name, sets, reps, category, order_index: orderIndex });
  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

// Update exercise
app.put('/api/exercises/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, sets, reps, category } = req.body;
    
    db.prepare('UPDATE exercises SET name = ?, sets = ?, reps = ?, category = ? WHERE id = ?').run(name, sets, reps, category, id);
    
    const updated = db.prepare('SELECT * FROM exercises WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// Delete exercise
app.delete('/api/exercises/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM exercises WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

// Add new meal
app.post('/api/meals', (req, res) => {
  try {
    const { name, time, meal_type, items } = req.body;
    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM meals').get();
    const orderIndex = (maxOrder?.max || 0) + 1;
    
    const result = db.prepare(
      'INSERT INTO meals (name, time, meal_type, items, order_index) VALUES (?, ?, ?, ?, ?)'
    ).run(name, time, meal_type, JSON.stringify(items), orderIndex);
    
    res.json({ id: result.lastInsertRowid, name, time, meal_type, items, order_index: orderIndex });
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: 'Failed to add meal' });
  }
});

// Update meal
app.put('/api/meals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, time, meal_type, items } = req.body;
    
    db.prepare('UPDATE meals SET name = ?, time = ?, meal_type = ?, items = ? WHERE id = ?')
      .run(name, time, meal_type, JSON.stringify(items), id);
    
    const updated = db.prepare('SELECT * FROM meals WHERE id = ?').get(id);
    res.json({
      ...updated,
      items: JSON.parse(updated.items)
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Failed to update meal' });
  }
});

// Delete meal
app.delete('/api/meals/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM meals WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
