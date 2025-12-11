import { useState, useEffect } from 'react';
import { Settings, Dumbbell, UtensilsCrossed, Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronUp, Moon, Sun, Download, Database, Bell } from 'lucide-react';
import api from '../api';
import NutritionView from './NutritionView';
import SupplementsView from './SupplementsView';
import NotificationSettings from './NotificationSettings';

const categories = ['Warmup', 'Chest', 'Back', 'Shoulder', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Forearms', 'Traps'];
const mealTypes = [
  { value: 'pre_workout', label: 'Pre-Workout' },
  { value: 'post_workout', label: 'Post-Workout' },
  { value: 'main', label: 'Main Meal' },
  { value: 'snack', label: 'Snack' },
  { value: 'night', label: 'Night' },
];

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState('workout');
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
    // Load dark mode setting
    api.getSettings().then(settings => {
      if (settings.darkMode === 'true') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedWorkout) {
      loadExercises(selectedWorkout.id);
    }
  }, [selectedWorkout]);

  const loadData = async () => {
    try {
      const [workoutsData, mealsData] = await Promise.all([
        api.getWorkouts(),
        api.getMeals()
      ]);
      setWorkouts(workoutsData);
      setMeals(mealsData);
      if (workoutsData.length > 0) {
        const firstNonRest = workoutsData.find(w => !w.is_rest_day) || workoutsData[0];
        setSelectedWorkout(firstNonRest);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadExercises = async (workoutId) => {
    try {
      const data = await api.getExercises(workoutId);
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const handleAddExercise = () => {
    setEditingExercise(null);
    setShowExerciseModal(true);
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleDeleteExercise = async (id) => {
    if (!confirm('Delete this exercise?')) return;
    try {
      await api.deleteExercise(id);
      setExercises(exercises.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleSaveExercise = async (data) => {
    try {
      if (editingExercise) {
        const updated = await api.updateExercise(editingExercise.id, data);
        setExercises(exercises.map(e => e.id === editingExercise.id ? updated : e));
      } else {
        const newExercise = await api.addExercise({ ...data, workout_id: selectedWorkout.id });
        setExercises([...exercises, newExercise]);
      }
      setShowExerciseModal(false);
    } catch (error) {
      console.error('Error saving exercise:', error);
    }
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    setShowMealModal(true);
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setShowMealModal(true);
  };

  const handleDeleteMeal = async (id) => {
    if (!confirm('Delete this meal?')) return;
    try {
      await api.deleteMeal(id);
      setMeals(meals.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleSaveMeal = async (data) => {
    try {
      if (editingMeal) {
        const updated = await api.updateMeal(editingMeal.id, data);
        setMeals(meals.map(m => m.id === editingMeal.id ? updated : m));
      } else {
        const newMeal = await api.addMeal(data);
        setMeals([...meals, newMeal]);
      }
      setShowMealModal(false);
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const handleToggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      await api.updateSetting('darkMode', newValue.toString());
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
          <Settings className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600" />
        </div>
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-xs sm:text-base text-gray-500">Customize your plan</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSection('workout')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all touch-target ${
            activeSection === 'workout' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span className="hidden sm:inline">Workout</span>
          <span className="sm:hidden">Workout</span>
        </button>
        <button
          onClick={() => setActiveSection('diet')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all touch-target ${
            activeSection === 'diet' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span className="hidden sm:inline">Diet</span>
          <span className="sm:hidden">Diet</span>
        </button>
        <button
          onClick={() => setActiveSection('nutrition')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all touch-target ${
            activeSection === 'nutrition' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Nutrition</span>
        </button>
        <button
          onClick={() => setActiveSection('general')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all touch-target ${
            activeSection === 'general' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>General</span>
        </button>
      </div>

      {activeSection === 'workout' ? (
        <div className="space-y-4">
          <div className="card !p-3 sm:!p-5">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Select Workout Day</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {workouts.filter(w => !w.is_rest_day).map(workout => (
                <button
                  key={workout.id}
                  onClick={() => setSelectedWorkout(workout)}
                  className={`p-2 sm:p-3 rounded-xl text-center transition-all touch-target ${
                    selectedWorkout?.id === workout.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-medium">{workout.day_name.slice(0, 3)}</p>
                  <p className="text-[10px] sm:text-xs opacity-75">{workout.workout_type.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedWorkout && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedWorkout.workout_type}</h3>
                  <p className="text-sm text-gray-500">{exercises.length} exercises</p>
                </div>
                <button onClick={handleAddExercise} className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </button>
              </div>

              <div className="space-y-2">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{exercise.name}</p>
                        <p className="text-xs text-gray-500">{exercise.category} • {exercise.sets} × {exercise.reps}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditExercise(exercise)} className="p-2 hover:bg-gray-200 rounded-lg">
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => handleDeleteExercise(exercise.id)} className="p-2 hover:bg-red-100 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
                {exercises.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No exercises yet. Add your first exercise!</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : activeSection === 'diet' ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Diet Plan</h3>
              <p className="text-sm text-gray-500">{meals.length} meals</p>
            </div>
            <button onClick={handleAddMeal} className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </button>
          </div>

          <div className="space-y-2">
            {meals.map((meal, index) => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{meal.name}</p>
                    <p className="text-xs text-gray-500">{meal.time} • {meal.items?.length || 0} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditMeal(meal)} className="p-2 hover:bg-gray-200 rounded-lg">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleDeleteMeal(meal.id)} className="p-2 hover:bg-red-100 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeSection === 'nutrition' ? (
        <div className="space-y-4">
          <div className="card">
            <NutritionView />
          </div>
          <div className="card">
            <SupplementsView />
          </div>
        </div>
      ) : activeSection === 'general' ? (
        <div className="space-y-4">
          {/* Notifications */}
          <div className="card !p-4">
            <NotificationSettings />
          </div>

          {/* Dark Mode Toggle */}
          <div className="card !p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-purple-600" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-500">Switch between light and dark theme</p>
                </div>
              </div>
              <button
                onClick={handleToggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Data Export */}
          <div className="card !p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Export Data</p>
                  <p className="text-xs text-gray-500">Download all your fitness data as JSON</p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="btn btn-secondary text-sm"
              >
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="card !p-4">
            <h3 className="font-medium text-gray-900 mb-2">About</h3>
            <p className="text-sm text-gray-500">Nitin Fitness Tracker v1.0</p>
            <p className="text-xs text-gray-400 mt-1">Track your workouts, diet, and progress across all devices.</p>
          </div>
        </div>
      ) : null}

      {showExerciseModal && (
        <ExerciseModal
          exercise={editingExercise}
          onSave={handleSaveExercise}
          onClose={() => setShowExerciseModal(false)}
        />
      )}

      {showMealModal && (
        <MealModal
          meal={editingMeal}
          onSave={handleSaveMeal}
          onClose={() => setShowMealModal(false)}
        />
      )}
    </div>
  );
}

function ExerciseModal({ exercise, onSave, onClose }) {
  const [name, setName] = useState(exercise?.name || '');
  const [sets, setSets] = useState(exercise?.sets || 3);
  const [reps, setReps] = useState(exercise?.reps || '10-12');
  const [category, setCategory] = useState(exercise?.category || 'Chest');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, sets: parseInt(sets), reps, category });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{exercise ? 'Edit Exercise' : 'Add Exercise'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bench Press"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sets</label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10-12"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MealModal({ meal, onSave, onClose }) {
  const [name, setName] = useState(meal?.name || '');
  const [time, setTime] = useState(meal?.time || '12:00 PM');
  const [mealType, setMealType] = useState(meal?.meal_type || 'main');
  const [items, setItems] = useState(meal?.items || [{ name: '', quantity: '' }]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(item => item.name.trim());
    onSave({ name, time, meal_type: mealType, items: validItems });
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{meal ? 'Edit Meal' : 'Add Meal'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Breakfast"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 9:00 AM"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {mealTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Food Items</label>
              <button type="button" onClick={addItem} className="text-sm text-green-600 hover:text-green-700">
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Food name"
                  />
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Qty"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="p-2 hover:bg-red-100 rounded-lg">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
