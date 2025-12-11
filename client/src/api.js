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
  resetDatabase: () => fetchApi('/reset', { method: 'POST' })
};

export default api;
