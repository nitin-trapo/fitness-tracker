import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';

export default function ActivityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadActivity();
  }, [year, month]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const data = await api.getActivityCalendar(year, month + 1);
      setActivityData(data);
    } catch (err) {
      console.error('Error loading activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getActivityForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activityData.find(a => a.date === dateStr);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const activity = getActivityForDate(day);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    days.push(
      <div
        key={day}
        className={`h-8 flex items-center justify-center text-sm rounded-lg relative ${
          isToday ? 'ring-2 ring-blue-500' : ''
        } ${activity ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-600'}`}
      >
        {day}
        {activity && (
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {activity.workouts > 0 && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
            {activity.meals > 0 && <div className="w-1 h-1 bg-green-500 rounded-full" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Activity Calendar</h3>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-gray-900">{monthName}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="h-6 flex items-center justify-center text-xs font-medium text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">{days}</div>
        )}

        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Workout</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Meals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
