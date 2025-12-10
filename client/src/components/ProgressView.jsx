import { useState, useEffect } from 'react';
import { TrendingUp, Scale, Droplets, Target, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import api from '../api';

export default function ProgressView({ data, onDailyLogUpdate }) {
  const [progressData, setProgressData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState(75); // Default target

  useEffect(() => {
    Promise.all([
      api.getProgress(30),
      api.getStreak()
    ]).then(([progress, streakData]) => {
      setProgressData(progress);
      setStreak(streakData.streak);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (data?.dailyLog?.weight) {
      setWeight(data.dailyLog.weight);
    }
  }, [data]);

  const handleWeightSave = () => {
    if (weight) {
      onDailyLogUpdate({ weight: parseFloat(weight) });
    }
  };

  // Calculate stats
  const latestWeight = progressData.length > 0 ? progressData[progressData.length - 1]?.weight : null;
  const firstWeight = progressData.length > 0 ? progressData[0]?.weight : null;
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : 0;
  const avgWater = progressData.length > 0 
    ? (progressData.reduce((sum, d) => sum + (d.water_intake || 0), 0) / progressData.length).toFixed(1)
    : 0;

  // Simple chart rendering
  const maxWeight = Math.max(...progressData.map(d => d.weight || 0), targetWeight);
  const minWeight = Math.min(...progressData.filter(d => d.weight).map(d => d.weight), targetWeight) - 2;
  const chartHeight = 200;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
          <p className="text-gray-500">Monitor your fitness journey</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Weight */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Current Weight</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {latestWeight ? `${latestWeight} kg` : 'N/A'}
          </p>
        </div>

        {/* Weight Change */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              weightChange > 0 ? 'bg-green-100' : weightChange < 0 ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {weightChange > 0 ? (
                <ArrowUp className="w-5 h-5 text-green-600" />
              ) : weightChange < 0 ? (
                <ArrowDown className="w-5 h-5 text-red-600" />
              ) : (
                <Minus className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <span className="text-sm text-gray-500">30-Day Change</span>
          </div>
          <p className={`text-2xl font-bold ${
            weightChange > 0 ? 'text-green-600' : weightChange < 0 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {weightChange > 0 ? '+' : ''}{weightChange} kg
          </p>
        </div>

        {/* Streak */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Current Streak</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{streak} days</p>
        </div>

        {/* Avg Water */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-sm text-gray-500">Avg Water/Day</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgWater} glasses</p>
        </div>
      </div>

      {/* Log Today's Weight */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Log Today's Weight</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight in kg"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
          />
          <button onClick={handleWeightSave} className="btn btn-primary">
            Save Weight
          </button>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Weight Progress (Last 30 Days)</h3>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-500">Target: {targetWeight} kg</span>
          </div>
        </div>

        {progressData.length > 0 ? (
          <div className="relative" style={{ height: chartHeight }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              <span>{maxWeight} kg</span>
              <span>{((maxWeight + minWeight) / 2).toFixed(0)} kg</span>
              <span>{minWeight} kg</span>
            </div>

            {/* Chart area */}
            <div className="ml-14 h-full relative border-l border-b border-gray-200">
              {/* Target line */}
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-green-400"
                style={{ 
                  bottom: `${((targetWeight - minWeight) / (maxWeight - minWeight)) * 100}%` 
                }}
              />

              {/* Data points */}
              <svg className="w-full h-full">
                {progressData.map((point, i) => {
                  if (!point.weight) return null;
                  const x = (i / (progressData.length - 1)) * 100;
                  const y = 100 - ((point.weight - minWeight) / (maxWeight - minWeight)) * 100;
                  return (
                    <g key={i}>
                      {i > 0 && progressData[i - 1]?.weight && (
                        <line
                          x1={`${((i - 1) / (progressData.length - 1)) * 100}%`}
                          y1={`${100 - ((progressData[i - 1].weight - minWeight) / (maxWeight - minWeight)) * 100}%`}
                          x2={`${x}%`}
                          y2={`${y}%`}
                          stroke="#3B82F6"
                          strokeWidth="2"
                        />
                      )}
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill="#3B82F6"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <p>No weight data recorded yet. Start logging your weight above!</p>
          </div>
        )}
      </div>

      {/* Recent Logs */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Weight Logs</h3>
        {progressData.length > 0 ? (
          <div className="space-y-2">
            {[...progressData].reverse().slice(0, 7).map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">
                  {new Date(log.log_date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">{log.weight} kg</span>
                  <span className="text-sm text-cyan-600">{log.water_intake} glasses</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No logs yet</p>
        )}
      </div>
    </div>
  );
}
