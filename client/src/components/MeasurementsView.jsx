import { useState, useEffect } from 'react';
import { Ruler, Save, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api';

export default function MeasurementsView() {
  const [measurements, setMeasurements] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    chest: '', waist: '', hips: '', left_arm: '', right_arm: '',
    left_thigh: '', right_thigh: '', neck: '', shoulders: '', body_fat_percentage: '', notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allMeasurements, latestMeasurement] = await Promise.all([
        api.getMeasurements(),
        api.getLatestMeasurement()
      ]);
      setMeasurements(allMeasurements);
      setLatest(latestMeasurement);
      if (latestMeasurement) {
        setForm({
          chest: latestMeasurement.chest || '',
          waist: latestMeasurement.waist || '',
          hips: latestMeasurement.hips || '',
          left_arm: latestMeasurement.left_arm || '',
          right_arm: latestMeasurement.right_arm || '',
          left_thigh: latestMeasurement.left_thigh || '',
          right_thigh: latestMeasurement.right_thigh || '',
          neck: latestMeasurement.neck || '',
          shoulders: latestMeasurement.shoulders || '',
          body_fat_percentage: latestMeasurement.body_fat_percentage || '',
          notes: latestMeasurement.notes || ''
        });
      }
    } catch (err) {
      console.error('Error loading measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {};
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '') {
          data[key] = key === 'notes' ? value : parseFloat(value);
        }
      });
      await api.saveMeasurement(data);
      await loadData();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving measurement:', err);
    }
  };

  const getChange = (field) => {
    if (measurements.length < 2) return null;
    const current = measurements[0]?.[field];
    const previous = measurements[1]?.[field];
    if (!current || !previous) return null;
    return (current - previous).toFixed(1);
  };

  const measurementFields = [
    { key: 'chest', label: 'Chest', unit: 'cm' },
    { key: 'waist', label: 'Waist', unit: 'cm' },
    { key: 'hips', label: 'Hips', unit: 'cm' },
    { key: 'shoulders', label: 'Shoulders', unit: 'cm' },
    { key: 'left_arm', label: 'Left Arm', unit: 'cm' },
    { key: 'right_arm', label: 'Right Arm', unit: 'cm' },
    { key: 'left_thigh', label: 'Left Thigh', unit: 'cm' },
    { key: 'right_thigh', label: 'Right Thigh', unit: 'cm' },
    { key: 'neck', label: 'Neck', unit: 'cm' },
    { key: 'body_fat_percentage', label: 'Body Fat', unit: '%' }
  ];

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
          <Ruler className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Body Measurements</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-secondary text-sm"
        >
          {showForm ? 'Cancel' : 'Update'}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {measurementFields.map(({ key, label, unit }) => (
              <div key={key}>
                <label className="text-xs text-gray-500">{label} ({unit})</label>
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  step="0.1"
                  placeholder={label}
                />
              </div>
            ))}
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={2}
          />
          <button onClick={handleSave} className="btn btn-primary w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Measurements
          </button>
        </div>
      ) : latest ? (
        <div className="grid grid-cols-2 gap-2">
          {measurementFields.map(({ key, label, unit }) => {
            const value = latest[key];
            const change = getChange(key);
            if (!value) return null;
            return (
              <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">{label}</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm">{value} {unit}</span>
                  {change && change !== '0.0' && (
                    <span className={`text-xs flex items-center ${parseFloat(change) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(change) > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(parseFloat(change))}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No measurements recorded yet. Click Update to add your first measurement.</p>
      )}
    </div>
  );
}
