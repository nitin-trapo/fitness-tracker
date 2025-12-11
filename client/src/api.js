import db from './db/database.js';
import { seedDatabase } from './db/seed.js';

// Helper to get today's date string
const getDateString = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Helper to get or create daily log
const getOrCreateDailyLog = async (date) => {
  let log = await db.daily_logs.where('log_date').equals(date).first();
  if (!log) {
    const id = await db.daily_logs.add({
      log_date: date,
      weight: null,
      water_intake: 0,
      notes: ''
    });
    log = await db.daily_logs.get(id);
  }
  return log;
};

// Initialize database on first load
let initialized = false;
const initDb = async () => {
  if (!initialized) {
    await seedDatabase();
    initialized = true;
  }
};

const api = {
  // Get today's data
  getToday: async () => {
    await initDb();
    const date = getDateString();
    const dayOfWeek = new Date().getDay();
    
    // Get workout for today
    const workout = await db.workouts.where('day_of_week').equals(dayOfWeek).first();
    
    // Get exercises for this workout
    let exercises = [];
    if (workout && !workout.is_rest_day) {
      exercises = await db.exercises.where('workout_id').equals(workout.id).toArray();
      exercises.sort((a, b) => a.order_index - b.order_index);
    }
    
    // Get all meals
    const meals = await db.meals.orderBy('order_index').toArray();
    
    // Get or create daily log
    const dailyLog = await getOrCreateDailyLog(date);
    
    // Get exercise completion status
    const exerciseLogs = await db.exercise_logs
      .where('daily_log_id').equals(dailyLog.id).toArray();
    const exerciseLogMap = {};
    exerciseLogs.forEach(log => {
      exerciseLogMap[log.exercise_id] = log;
    });
    
    // Get meal completion status
    const mealLogs = await db.meal_logs
      .where('daily_log_id').equals(dailyLog.id).toArray();
    const mealLogMap = {};
    mealLogs.forEach(log => {
      mealLogMap[log.meal_id] = log;
    });
    
    // Merge completion status
    const exercisesWithStatus = exercises.map(ex => ({
      ...ex,
      completed: exerciseLogMap[ex.id]?.completed || false,
      sets_completed: exerciseLogMap[ex.id]?.sets_completed || 0
    }));
    
    const mealsWithStatus = meals.map(meal => ({
      ...meal,
      items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items,
      completed: mealLogMap[meal.id]?.completed || false
    }));
    
    return {
      date,
      dayOfWeek,
      workout: workout ? {
        ...workout,
        muscle_groups: typeof workout.muscle_groups === 'string' 
          ? JSON.parse(workout.muscle_groups) 
          : workout.muscle_groups
      } : null,
      exercises: exercisesWithStatus,
      meals: mealsWithStatus,
      dailyLog
    };
  },

  // Get data for specific date
  getDay: async (date) => {
    await initDb();
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    
    const workout = await db.workouts.where('day_of_week').equals(dayOfWeek).first();
    
    let exercises = [];
    if (workout && !workout.is_rest_day) {
      exercises = await db.exercises.where('workout_id').equals(workout.id).toArray();
      exercises.sort((a, b) => a.order_index - b.order_index);
    }
    
    const meals = await db.meals.orderBy('order_index').toArray();
    const dailyLog = await getOrCreateDailyLog(date);
    
    const exerciseLogs = await db.exercise_logs
      .where('daily_log_id').equals(dailyLog.id).toArray();
    const exerciseLogMap = {};
    exerciseLogs.forEach(log => {
      exerciseLogMap[log.exercise_id] = log;
    });
    
    const mealLogs = await db.meal_logs
      .where('daily_log_id').equals(dailyLog.id).toArray();
    const mealLogMap = {};
    mealLogs.forEach(log => {
      mealLogMap[log.meal_id] = log;
    });
    
    const exercisesWithStatus = exercises.map(ex => ({
      ...ex,
      completed: exerciseLogMap[ex.id]?.completed || false,
      sets_completed: exerciseLogMap[ex.id]?.sets_completed || 0
    }));
    
    const mealsWithStatus = meals.map(meal => ({
      ...meal,
      items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items,
      completed: mealLogMap[meal.id]?.completed || false
    }));
    
    return {
      date,
      dayOfWeek,
      workout: workout ? {
        ...workout,
        muscle_groups: typeof workout.muscle_groups === 'string' 
          ? JSON.parse(workout.muscle_groups) 
          : workout.muscle_groups
      } : null,
      exercises: exercisesWithStatus,
      meals: mealsWithStatus,
      dailyLog
    };
  },

  // Get all workouts
  getWorkouts: async () => {
    await initDb();
    const workouts = await db.workouts.orderBy('day_of_week').toArray();
    return workouts.map(w => ({
      ...w,
      muscle_groups: typeof w.muscle_groups === 'string' 
        ? JSON.parse(w.muscle_groups) 
        : w.muscle_groups
    }));
  },

  // Get all meals
  getMeals: async () => {
    await initDb();
    const meals = await db.meals.orderBy('order_index').toArray();
    return meals.map(meal => ({
      ...meal,
      items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items
    }));
  },

  // Update daily log (weight, water, notes)
  updateDailyLog: async (date, data) => {
    await initDb();
    const dailyLog = await getOrCreateDailyLog(date);
    await db.daily_logs.update(dailyLog.id, {
      ...data,
      updated_at: new Date().toISOString()
    });
    return await db.daily_logs.get(dailyLog.id);
  },

  // Toggle exercise completion
  toggleExercise: async (date, exerciseId, completed, setsCompleted = 0) => {
    await initDb();
    const dailyLog = await getOrCreateDailyLog(date);
    
    const existing = await db.exercise_logs
      .where('[daily_log_id+exercise_id]')
      .equals([dailyLog.id, exerciseId])
      .first();
    
    if (existing) {
      await db.exercise_logs.update(existing.id, { completed, sets_completed: setsCompleted });
    } else {
      await db.exercise_logs.add({
        daily_log_id: dailyLog.id,
        exercise_id: exerciseId,
        completed,
        sets_completed: setsCompleted,
        notes: ''
      });
    }
    return { success: true };
  },

  // Toggle meal completion
  toggleMeal: async (date, mealId, completed) => {
    await initDb();
    const dailyLog = await getOrCreateDailyLog(date);
    
    const existing = await db.meal_logs
      .where('[daily_log_id+meal_id]')
      .equals([dailyLog.id, mealId])
      .first();
    
    if (existing) {
      await db.meal_logs.update(existing.id, { completed });
    } else {
      await db.meal_logs.add({
        daily_log_id: dailyLog.id,
        meal_id: mealId,
        completed
      });
    }
    return { success: true };
  },

  // Get progress history
  getProgress: async (days = 30) => {
    await initDb();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await db.daily_logs.toArray();
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.log_date);
      return logDate >= startDate && logDate <= endDate;
    });
    
    // Sort by date
    filteredLogs.sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
    
    // Get exercise and meal completion for each day
    const progressData = await Promise.all(filteredLogs.map(async (log) => {
      const exerciseLogs = await db.exercise_logs
        .where('daily_log_id').equals(log.id).toArray();
      const mealLogs = await db.meal_logs
        .where('daily_log_id').equals(log.id).toArray();
      
      const exercisesCompleted = exerciseLogs.filter(e => e.completed).length;
      const mealsCompleted = mealLogs.filter(m => m.completed).length;
      
      return {
        date: log.log_date,
        weight: log.weight,
        water_intake: log.water_intake,
        exercises_completed: exercisesCompleted,
        meals_completed: mealsCompleted
      };
    }));
    
    return progressData;
  },

  // Get streak
  getStreak: async () => {
    await initDb();
    const logs = await db.daily_logs.orderBy('log_date').reverse().toArray();
    
    let streak = 0;
    const today = getDateString();
    let checkDate = new Date();
    
    for (const log of logs) {
      const expectedDate = getDateString(checkDate);
      if (log.log_date === expectedDate) {
        // Check if any exercises or meals were completed
        const exerciseLogs = await db.exercise_logs
          .where('daily_log_id').equals(log.id).toArray();
        const mealLogs = await db.meal_logs
          .where('daily_log_id').equals(log.id).toArray();
        
        const hasActivity = exerciseLogs.some(e => e.completed) || 
                           mealLogs.some(m => m.completed);
        
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
    
    return { streak };
  },

  // ============ CUSTOMIZATION ============

  // Get exercises for a workout
  getExercises: async (workoutId) => {
    await initDb();
    const exercises = await db.exercises
      .where('workout_id').equals(workoutId)
      .toArray();
    return exercises.sort((a, b) => a.order_index - b.order_index);
  },

  // Add exercise
  addExercise: async (data) => {
    await initDb();
    const id = await db.exercises.add(data);
    return await db.exercises.get(id);
  },

  // Update exercise
  updateExercise: async (id, data) => {
    await initDb();
    await db.exercises.update(id, data);
    return await db.exercises.get(id);
  },

  // Delete exercise
  deleteExercise: async (id) => {
    await initDb();
    await db.exercises.delete(id);
    return { success: true };
  },

  // Add meal
  addMeal: async (data) => {
    await initDb();
    const mealData = {
      ...data,
      items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items)
    };
    const id = await db.meals.add(mealData);
    const meal = await db.meals.get(id);
    return {
      ...meal,
      items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items
    };
  },

  // Update meal
  updateMeal: async (id, data) => {
    await initDb();
    const mealData = {
      ...data,
      items: typeof data.items === 'string' ? data.items : JSON.stringify(data.items)
    };
    await db.meals.update(id, mealData);
    const meal = await db.meals.get(id);
    return {
      ...meal,
      items: typeof meal.items === 'string' ? JSON.parse(meal.items) : meal.items
    };
  },

  // Delete meal
  deleteMeal: async (id) => {
    await initDb();
    await db.meals.delete(id);
    return { success: true };
  },

  // Reset database (for settings)
  resetDatabase: async () => {
    const { resetDatabase } = await import('./db/seed.js');
    await resetDatabase();
    return { success: true };
  }
};

export default api;
