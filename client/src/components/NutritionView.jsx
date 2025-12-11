import { useState, useEffect } from 'react';
import { Apple, Plus, Trash2, Flame } from 'lucide-react';
import api from '../api';

export default function NutritionView({ date }) {
  const [nutrition, setNutrition] = useState({ logs: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    meal_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    notes: ''
  });

  const currentDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadNutrition();
  }, [currentDate]);

  const loadNutrition = async () => {
    try {
      const data = await api.getNutrition(currentDate);
      setNutrition(data);
    } catch (err) {
      console.error('Error loading nutrition:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.meal_name) return;
    try {
      await api.addNutrition({
        log_date: currentDate,
        meal_name: form.meal_name,
        calories: parseInt(form.calories) || 0,
        protein: parseFloat(form.protein) || 0,
        carbs: parseFloat(form.carbs) || 0,
        fats: parseFloat(form.fats) || 0,
        fiber: parseFloat(form.fiber) || 0,
        notes: form.notes
      });
      setForm({ meal_name: '', calories: '', protein: '', carbs: '', fats: '', fiber: '', notes: '' });
      setShowForm(false);
      await loadNutrition();
    } catch (err) {
      console.error('Error adding nutrition:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNutrition(id);
      await loadNutrition();
    } catch (err) {
      console.error('Error deleting nutrition:', err);
    }
  };

  const { totals } = nutrition;
  const dailyGoals = { calories: 3000, protein: 150, carbs: 350, fats: 80 };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">Nutrition Tracking</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-secondary text-sm"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> Add</>}
        </button>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-orange-50 p-2 rounded-lg text-center">
          <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-orange-600">{totals.total_calories || 0}</p>
          <p className="text-[10px] text-gray-500">/ {dailyGoals.calories} kcal</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-lg text-center">
          <p className="text-xs text-gray-500 mb-1">Protein</p>
          <p className="text-sm font-bold text-blue-600">{(totals.total_protein || 0).toFixed(0)}g</p>
          <p className="text-[10px] text-gray-400">/ {dailyGoals.protein}g</p>
        </div>
        <div className="bg-yellow-50 p-2 rounded-lg text-center">
          <p className="text-xs text-gray-500 mb-1">Carbs</p>
          <p className="text-sm font-bold text-yellow-600">{(totals.total_carbs || 0).toFixed(0)}g</p>
          <p className="text-[10px] text-gray-400">/ {dailyGoals.carbs}g</p>
        </div>
        <div className="bg-purple-50 p-2 rounded-lg text-center">
          <p className="text-xs text-gray-500 mb-1">Fats</p>
          <p className="text-sm font-bold text-purple-600">{(totals.total_fats || 0).toFixed(0)}g</p>
          <p className="text-[10px] text-gray-400">/ {dailyGoals.fats}g</p>
        </div>
      </div>

      {showForm && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
          <input
            type="text"
            value={form.meal_name}
            onChange={(e) => setForm({ ...form, meal_name: e.target.value })}
            placeholder="Meal name (e.g., Breakfast, Snack)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              placeholder="Calories"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: e.target.value })}
              placeholder="Protein (g)"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              value={form.carbs}
              onChange={(e) => setForm({ ...form, carbs: e.target.value })}
              placeholder="Carbs (g)"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="number"
              value={form.fats}
              onChange={(e) => setForm({ ...form, fats: e.target.value })}
              placeholder="Fats (g)"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button onClick={handleAdd} className="btn btn-primary w-full text-sm">
            Add Entry
          </button>
        </div>
      )}

      {nutrition.logs.length > 0 ? (
        <div className="space-y-2">
          {nutrition.logs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-sm text-gray-900">{log.meal_name}</p>
                <p className="text-xs text-gray-500">
                  {log.calories} kcal • P: {log.protein}g • C: {log.carbs}g • F: {log.fats}g
                </p>
              </div>
              <button onClick={() => handleDelete(log.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No nutrition logged today. Add your first entry!</p>
      )}
    </div>
  );
}
