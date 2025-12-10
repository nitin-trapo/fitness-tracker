import { useState } from 'react';
import { Dumbbell, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Timer from './Timer';

const categoryColors = {
  'Warmup': 'badge-yellow',
  'Chest': 'badge-red',
  'Shoulder': 'badge-blue',
  'Triceps': 'badge-purple',
  'Back': 'badge-green',
  'Traps': 'badge-orange',
  'Biceps': 'badge-pink',
  'Legs': 'badge-cyan',
  'Forearms': 'badge-orange',
  'Abs': 'badge-purple',
};

export default function WorkoutTracker({ data, onExerciseToggle }) {
  const [showTimer, setShowTimer] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!data) return null;

  const { workout, exercises } = data;
  const completedCount = exercises.filter(e => e.completed).length;
  const progress = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

  // Group exercises by category
  const groupedExercises = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  if (workout?.is_rest_day) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center card max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rest Day</h2>
          <p className="text-gray-500">Take it easy today! Your muscles need time to recover and grow stronger.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{workout?.workout_type}</h2>
            <div className="flex gap-2 mt-1">
              {workout?.muscle_groups?.map((muscle, i) => (
                <span key={i} className="badge badge-blue">{muscle}</span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => setShowTimer(!showTimer)} className="btn btn-secondary">
          <Clock className="w-4 h-4 mr-2" />
          Rest Timer
        </button>
      </div>

      {/* Timer */}
      {showTimer && <Timer onClose={() => setShowTimer(false)} />}

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-semibold text-blue-600">{completedCount}/{exercises.length} exercises</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-blue-600 h-3 rounded-full progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Exercise List by Category */}
      <div className="space-y-4">
        {Object.entries(groupedExercises).map(([category, categoryExercises]) => {
          const categoryCompleted = categoryExercises.filter(e => e.completed).length;
          const isExpanded = expandedCategory === category || expandedCategory === null;

          return (
            <div key={category} className="card">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`badge ${categoryColors[category] || 'badge-blue'}`}>{category}</span>
                  <span className="text-sm text-gray-500">{categoryCompleted}/{categoryExercises.length} done</span>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="space-y-2">
                  {categoryExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => onExerciseToggle(exercise.id, !exercise.completed)}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                        exercise.completed
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      {exercise.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${exercise.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                          {exercise.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{exercise.sets} × {exercise.reps}</p>
                        <p className="text-xs text-gray-500">sets × reps</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
