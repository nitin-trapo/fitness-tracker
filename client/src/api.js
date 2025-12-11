// API client for server-side database
const API_BASE = '/fitness-tracker/api';

const fetchApi = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
};

const api = {
  // Get today's data
  getToday: () => fetchApi('/today'),

  // Get data for specific date
  getDay: (date) => fetchApi(`/day/${date}`),

  // Get all workouts
  getWorkouts: () => fetchApi('/workouts'),

  // Get all meals
  getMeals: () => fetchApi('/meals'),

  // Update daily log (weight, water, notes)
  updateDailyLog: (date, data) => fetchApi(`/daily-log/${date}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Toggle exercise completion
  toggleExercise: (date, exerciseId, completed, setsCompleted = 0) => fetchApi('/exercise-toggle', {
    method: 'POST',
    body: JSON.stringify({ date, exerciseId, completed, setsCompleted })
  }),

  // Toggle meal completion
  toggleMeal: (date, mealId, completed) => fetchApi('/meal-toggle', {
    method: 'POST',
    body: JSON.stringify({ date, mealId, completed })
  }),

  // Get progress history
  getProgress: (days = 30) => fetchApi(`/progress?days=${days}`),

  // Get streak
  getStreak: () => fetchApi('/streak'),

  // Get exercises for a workout
  getExercises: (workoutId) => fetchApi(`/exercises/${workoutId}`),

  // Add exercise
  addExercise: (data) => fetchApi('/exercises', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update exercise
  updateExercise: (id, data) => fetchApi(`/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete exercise
  deleteExercise: (id) => fetchApi(`/exercises/${id}`, { method: 'DELETE' }),

  // Add meal
  addMeal: (data) => fetchApi('/meals', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update meal
  updateMeal: (id, data) => fetchApi(`/meals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete meal
  deleteMeal: (id) => fetchApi(`/meals/${id}`, { method: 'DELETE' }),

  // Reset database
  resetDatabase: () => fetchApi('/reset', { method: 'POST' }),

  // ============ PERSONAL RECORDS ============
  getPersonalRecords: () => fetchApi('/personal-records'),
  getPersonalRecord: (exerciseName) => fetchApi(`/personal-records/${encodeURIComponent(exerciseName)}`),
  addPersonalRecord: (data) => fetchApi('/personal-records', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // ============ BODY MEASUREMENTS ============
  getMeasurements: () => fetchApi('/measurements'),
  getLatestMeasurement: () => fetchApi('/measurements/latest'),
  saveMeasurement: (data) => fetchApi('/measurements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // ============ GOALS ============
  getGoals: () => fetchApi('/goals'),
  addGoal: (data) => fetchApi('/goals', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateGoal: (id, data) => fetchApi(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteGoal: (id) => fetchApi(`/goals/${id}`, { method: 'DELETE' }),

  // ============ ACHIEVEMENTS ============
  getAchievements: () => fetchApi('/achievements'),
  unlockAchievement: (badge_id) => fetchApi('/achievements/unlock', {
    method: 'POST',
    body: JSON.stringify({ badge_id })
  }),

  // ============ NUTRITION ============
  getNutrition: (date) => fetchApi(`/nutrition/${date}`),
  addNutrition: (data) => fetchApi('/nutrition', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteNutrition: (id) => fetchApi(`/nutrition/${id}`, { method: 'DELETE' }),

  // ============ SUPPLEMENTS ============
  getSupplements: (date) => fetchApi(`/supplements/${date}`),
  addSupplement: (data) => fetchApi('/supplements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  toggleSupplement: (id, data) => fetchApi(`/supplements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // ============ SETTINGS ============
  getSettings: () => fetchApi('/settings'),
  updateSetting: (key, value) => fetchApi(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value })
  }),

  // ============ QUOTES ============
  getRandomQuote: () => fetchApi('/quote'),
  getAllQuotes: () => fetchApi('/quotes'),

  // ============ WORKOUT HISTORY ============
  getWorkoutHistory: (days = 30) => fetchApi(`/workout-history?days=${days}`),
  addWorkoutSession: (data) => fetchApi('/workout-sessions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // ============ EXERCISE SETS ============
  getExerciseSets: (exerciseLogId) => fetchApi(`/exercise-sets/${exerciseLogId}`),
  saveExerciseSet: (data) => fetchApi('/exercise-sets', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // ============ WEIGHT HISTORY ============
  getWeightHistory: (days = 90) => fetchApi(`/weight-history?days=${days}`),

  // ============ ACTIVITY CALENDAR ============
  getActivityCalendar: (year, month) => {
    let url = `/activity-calendar?year=${year}`;
    if (month !== undefined) url += `&month=${month}`;
    return fetchApi(url);
  },

  // ============ DATA EXPORT ============
  exportData: () => fetchApi('/export')
};

export default api;
