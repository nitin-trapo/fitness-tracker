import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

const presetTimes = [
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
];

export default function Timer({ onClose }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePreset = (seconds) => {
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(initialTime);
    setIsRunning(false);
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Rest Timer</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-6">
        <div className="w-40 h-40 relative">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="80" cy="80" r="70" fill="none"
              stroke={timeLeft === 0 ? '#10B981' : '#3B82F6'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-bold ${timeLeft === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {presetTimes.map(preset => (
          <button
            key={preset.seconds}
            onClick={() => handlePreset(preset.seconds)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              initialTime === preset.seconds ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={handleReset} className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isRunning ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
        </button>
        <div className="w-12 h-12" />
      </div>
    </div>
  );
}
