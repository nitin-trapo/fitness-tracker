import axios from 'axios';

const API_BASE = '/api';

const api = {
  // Get today's data
  getToday: () => axios.get(`${API_BASE}/today`).then(res => res.data),

  // Get data for specific date
  getDay: (date) => axios.get(`${API_BASE}/day/${date}`).then(res => res.data),

  // Get all workouts
  getWorkouts: () => axios.get(`${API_BASE}/workouts`).then(res => res.data),

  // Get all meals
  getMeals: () => axios.get(`${API_BASE}/meals`).then(res => res.data),

  // Update daily log (weight, water, notes)
  updateDailyLog: (date, data) => 
    axios.put(`${API_BASE}/daily-log/${date}`, data).then(res => res.data),

  // Toggle exercise completion
  toggleExercise: (date, exerciseId, completed, setsCompleted = 0) =>
    axios.post(`${API_BASE}/exercise-log`, {
      date,
      exercise_id: exerciseId,
      completed,
      sets_completed: setsCompleted
    }).then(res => res.data),

  // Toggle meal completion
  toggleMeal: (date, mealId, completed) =>
    axios.post(`${API_BASE}/meal-log`, {
      date,
      meal_id: mealId,
      completed
    }).then(res => res.data),

  // Get progress history
  getProgress: (days = 30) => 
    axios.get(`${API_BASE}/progress?days=${days}`).then(res => res.data),

  // Get streak
  getStreak: () => axios.get(`${API_BASE}/streak`).then(res => res.data),

  // ============ CUSTOMIZATION ============

  // Get exercises for a workout
  getExercises: (workoutId) => 
    axios.get(`${API_BASE}/exercises/${workoutId}`).then(res => res.data),

  // Add exercise
  addExercise: (data) => 
    axios.post(`${API_BASE}/exercises`, data).then(res => res.data),

  // Update exercise
  updateExercise: (id, data) => 
    axios.put(`${API_BASE}/exercises/${id}`, data).then(res => res.data),

  // Delete exercise
  deleteExercise: (id) => 
    axios.delete(`${API_BASE}/exercises/${id}`).then(res => res.data),

  // Add meal
  addMeal: (data) => 
    axios.post(`${API_BASE}/meals`, data).then(res => res.data),

  // Update meal
  updateMeal: (id, data) => 
    axios.put(`${API_BASE}/meals/${id}`, data).then(res => res.data),

  // Delete meal
  deleteMeal: (id) => 
    axios.delete(`${API_BASE}/meals/${id}`).then(res => res.data),
};

export default api;
