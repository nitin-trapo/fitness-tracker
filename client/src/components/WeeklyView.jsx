import { useState, useEffect } from 'react';
import { Calendar, Dumbbell, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyView() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWorkouts()
      .then(data => {
        setWorkouts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().getDay();

  const getWorkoutColor = (type) => {
    if (type.includes('Push')) return 'bg-red-100 border-red-200 text-red-700';
    if (type.includes('Pull')) return 'bg-blue-100 border-blue-200 text-blue-700';
    if (type.includes('Legs')) return 'bg-green-100 border-green-200 text-green-700';
    return 'bg-gray-100 border-gray-200 text-gray-700';
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
          <Calendar className="w-7 h-7 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
          <p className="text-gray-500">Push/Pull/Legs Split - 6 Days</p>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {workouts.map((workout) => (
          <div
            key={workout.day_of_week}
            onClick={() => setSelectedDay(selectedDay === workout.day_of_week ? null : workout.day_of_week)}
            className={`card card-hover cursor-pointer ${
              workout.day_of_week === today ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            } ${selectedDay === workout.day_of_week ? 'border-2 border-blue-500' : ''}`}
          >
            <div className="text-center">
              <p className={`text-sm font-medium ${workout.day_of_week === today ? 'text-blue-600' : 'text-gray-500'}`}>
                {workout.day_name}
              </p>
              
              {workout.is_rest_day ? (
                <div className="mt-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-600">Rest</p>
                </div>
              ) : (
                <div className="mt-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${getWorkoutColor(workout.workout_type).split(' ')[0]}`}>
                    <Dumbbell className={`w-6 h-6 ${getWorkoutColor(workout.workout_type).split(' ')[2]}`} />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{workout.workout_type.split(' ')[0]}</p>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {workout.muscle_groups?.slice(0, 2).map((muscle, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {workout.day_of_week === today && (
                <span className="inline-block mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Day Details */}
      {selectedDay !== null && (
        <SelectedDayDetails dayOfWeek={selectedDay} workouts={workouts} />
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Workout Split Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Push</p>
              <p className="text-xs text-gray-500">Chest, Shoulder, Triceps</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Pull</p>
              <p className="text-xs text-gray-500">Back, Traps, Biceps</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Legs</p>
              <p className="text-xs text-gray-500">Legs, Forearms, Abs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Rest</p>
              <p className="text-xs text-gray-500">Recovery Day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedDayDetails({ dayOfWeek, workouts }) {
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get date for selected day of week
    const today = new Date();
    const currentDay = today.getDay();
    const diff = dayOfWeek - currentDay;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    const dateStr = targetDate.toISOString().split('T')[0];

    api.getDay(dateStr)
      .then(data => {
        setDayData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dayOfWeek]);

  const workout = workouts.find(w => w.day_of_week === dayOfWeek);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (workout?.is_rest_day) {
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">{workout.day_name} - Rest Day</h3>
        <p className="text-gray-500">No workout scheduled. Focus on recovery, stretching, and proper nutrition.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">
        {workout?.day_name} - {workout?.workout_type}
      </h3>
      <div className="grid gap-2">
        {dayData?.exercises?.map((exercise, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                {i + 1}
              </span>
              <span className="font-medium text-gray-900">{exercise.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{exercise.sets} × {exercise.reps}</span>
              <span className="badge badge-blue">{exercise.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
