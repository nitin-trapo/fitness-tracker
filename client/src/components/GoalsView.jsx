import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import api from '../api';

export default function GoalsView() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    goal_type: 'weight',
    title: '',
    target_value: '',
    current_value: '',
    unit: 'kg',
    target_date: ''
  });

  const goalTypes = [
    { value: 'weight', label: 'Weight Goal', unit: 'kg' },
    { value: 'strength', label: 'Strength Goal', unit: 'kg' },
    { value: 'measurement', label: 'Measurement Goal', unit: 'cm' },
    { value: 'habit', label: 'Habit Goal', unit: 'days' },
    { value: 'other', label: 'Other', unit: '' }
  ];

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!form.title || !form.target_value) return;
    try {
      await api.addGoal({
        ...form,
        target_value: parseFloat(form.target_value),
        current_value: form.current_value ? parseFloat(form.current_value) : 0
      });
      setForm({ goal_type: 'weight', title: '', target_value: '', current_value: '', unit: 'kg', target_date: '' });
      setShowForm(false);
      await loadGoals();
    } catch (err) {
      console.error('Error adding goal:', err);
    }
  };

  const handleUpdateGoal = async (id, current_value, completed) => {
    try {
      await api.updateGoal(id, { current_value, completed });
      await loadGoals();
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      await loadGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const getProgress = (goal) => {
    if (!goal.target_value) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

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
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Goals</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-secondary text-sm"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> Add</>}
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
          <select
            value={form.goal_type}
            onChange={(e) => {
              const type = goalTypes.find(t => t.value === e.target.value);
              setForm({ ...form, goal_type: e.target.value, unit: type?.unit || '' });
            }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {goalTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Goal title (e.g., Reach 75kg)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={form.current_value}
              onChange={(e) => setForm({ ...form, current_value: e.target.value })}
              placeholder="Current value"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              value={form.target_value}
              onChange={(e) => setForm({ ...form, target_value: e.target.value })}
              placeholder="Target value"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="Unit (kg, cm, days)"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              value={form.target_date}
              onChange={(e) => setForm({ ...form, target_date: e.target.value })}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button onClick={handleAddGoal} className="btn btn-primary w-full text-sm">
            Add Goal
          </button>
        </div>
      )}

      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map(goal => (
            <div key={goal.id} className={`p-3 rounded-xl border ${goal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateGoal(goal.id, goal.current_value, !goal.completed)}>
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div>
                    <p className={`font-medium text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {goal.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                      {goal.target_date && ` • Due: ${new Date(goal.target_date).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {!goal.completed && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${getProgress(goal)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{getProgress(goal).toFixed(0)}%</span>
                  </div>
                  <input
                    type="number"
                    value={goal.current_value}
                    onChange={(e) => handleUpdateGoal(goal.id, parseFloat(e.target.value) || 0, false)}
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Update progress"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No goals set yet. Add your first goal!</p>
      )}
    </div>
  );
}
