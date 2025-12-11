import { useState, useEffect } from 'react';
import { Pill, Plus, CheckCircle2, Circle } from 'lucide-react';
import api from '../api';

export default function SupplementsView({ date }) {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplement_name: '', dosage: '' });

  const currentDate = date || new Date().toISOString().split('T')[0];

  const defaultSupplements = [
    { name: 'Multivitamin', dosage: '1 tab' },
    { name: 'Fish Oil', dosage: '2 tabs' },
    { name: 'Creatine', dosage: '5g' },
    { name: 'Protein Powder', dosage: '1 scoop' }
  ];

  useEffect(() => {
    loadSupplements();
  }, [currentDate]);

  const loadSupplements = async () => {
    try {
      const data = await api.getSupplements(currentDate);
      setSupplements(data);
    } catch (err) {
      console.error('Error loading supplements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (name, dosage) => {
    try {
      await api.addSupplement({
        log_date: currentDate,
        supplement_name: name || form.supplement_name,
        dosage: dosage || form.dosage,
        taken: false
      });
      setForm({ supplement_name: '', dosage: '' });
      setShowForm(false);
      await loadSupplements();
    } catch (err) {
      console.error('Error adding supplement:', err);
    }
  };

  const handleToggle = async (id, taken) => {
    try {
      await api.toggleSupplement(id, {
        taken,
        time_taken: taken ? new Date().toLocaleTimeString() : null
      });
      await loadSupplements();
    } catch (err) {
      console.error('Error toggling supplement:', err);
    }
  };

  const takenCount = supplements.filter(s => s.taken).length;

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
          <Pill className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold text-gray-900">Supplements</h3>
        </div>
        <span className="text-sm text-gray-500">{takenCount}/{supplements.length} taken</span>
      </div>

      {supplements.length === 0 && !showForm && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Quick add common supplements:</p>
          <div className="flex flex-wrap gap-2">
            {defaultSupplements.map(sup => (
              <button
                key={sup.name}
                onClick={() => handleAdd(sup.name, sup.dosage)}
                className="px-3 py-1 text-xs bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100"
              >
                + {sup.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {supplements.length > 0 && (
        <div className="space-y-2">
          {supplements.map(sup => (
            <div
              key={sup.id}
              onClick={() => handleToggle(sup.id, !sup.taken)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                sup.taken
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {sup.taken ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium text-sm ${sup.taken ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                  {sup.supplement_name}
                </p>
                <p className="text-xs text-gray-500">{sup.dosage}</p>
              </div>
              {sup.taken && sup.time_taken && (
                <span className="text-xs text-green-600">{sup.time_taken}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-2 text-sm text-pink-600 hover:bg-pink-50 rounded-lg flex items-center justify-center gap-1"
      >
        <Plus className="w-4 h-4" />
        Add Custom Supplement
      </button>

      {showForm && (
        <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
          <input
            type="text"
            value={form.supplement_name}
            onChange={(e) => setForm({ ...form, supplement_name: e.target.value })}
            placeholder="Supplement name"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            placeholder="Dosage (e.g., 1 tab, 5g)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button onClick={() => handleAdd()} className="btn btn-primary w-full text-sm">
            Add Supplement
          </button>
        </div>
      )}
    </div>
  );
}
