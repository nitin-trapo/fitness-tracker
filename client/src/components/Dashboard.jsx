import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  UtensilsCrossed, 
  Droplets, 
  Scale, 
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  StickyNote,
  Plus,
  Minus,
  Save,
  Quote
} from 'lucide-react';
import api from '../api';
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

export default function Dashboard({ data, onExerciseToggle, onMealToggle, onDailyLogUpdate }) {
  const [streak, setStreak] = useState(0);
  const [weight, setWeight] = useState('');
  const [waterIntake, setWaterIntake] = useState(0);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    api.getStreak().then(res => setStreak(res.streak)).catch(() => {});
    api.getRandomQuote().then(res => setQuote(res)).catch(() => {});
  }, []);

  useEffect(() => {
    if (data?.dailyLog) {
      setWeight(data.dailyLog.weight || '');
      setWaterIntake(data.dailyLog.water_intake || 0);
      setNotes(data.dailyLog.notes || '');
    }
  }, [data]);

  if (!data) return null;

  const { workout, exercises, meals, dailyLog } = data;
  const completedExercises = exercises.filter(e => e.completed).length;
  const completedMeals = meals.filter(m => m.completed).length;
  const workoutProgress = exercises.length > 0 ? (completedExercises / exercises.length) * 100 : 0;
  const dietProgress = meals.length > 0 ? (completedMeals / meals.length) * 100 : 0;

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleWaterChange = (delta) => {
    const newValue = Math.max(0, waterIntake + delta);
    setWaterIntake(newValue);
    onDailyLogUpdate({ water_intake: newValue });
  };

  const handleWeightSave = () => {
    if (weight) {
      onDailyLogUpdate({ weight: parseFloat(weight) });
    }
  };

  const handleNotesSave = () => {
    onDailyLogUpdate({ notes });
    setShowNotes(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{dayName}</h2>
          <p className="text-sm sm:text-base text-gray-500">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTimer(!showTimer)}
            className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
            title="Rest Timer"
          >
            <Clock className="w-5 h-5 text-blue-600" />
          </button>
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-base font-semibold text-orange-600">{streak}d</span>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      {quote && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <Quote className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm sm:text-base text-gray-700 italic">"{quote.quote_text}"</p>
              <p className="text-xs text-gray-500 mt-1">— {quote.author}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timer Modal */}
      {showTimer && (
        <Timer onClose={() => setShowTimer(false)} />
      )}

      {/* Quick Stats - Single Row */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* Workout Progress */}
        <div className="card !p-3 flex-1 min-w-[140px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Workout</p>
              <p className="text-base font-bold text-blue-600">{completedExercises}/{exercises.length}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${workoutProgress}%` }} />
          </div>
        </div>

        {/* Diet Progress */}
        <div className="card !p-3 flex-1 min-w-[140px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Meals</p>
              <p className="text-base font-bold text-green-600">{completedMeals}/{meals.length}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${dietProgress}%` }} />
          </div>
        </div>

        {/* Water Intake */}
        <div className="card !p-3 flex-1 min-w-[140px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Droplets className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Water</p>
              <p className="text-base font-bold text-cyan-600">{waterIntake}/10</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={() => handleWaterChange(-1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="bg-cyan-600 h-1.5 rounded-full" style={{ width: `${Math.min((waterIntake / 10) * 100, 100)}%` }} />
            </div>
            <button onClick={() => handleWaterChange(1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weight */}
        <div className="card !p-3 flex-1 min-w-[140px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Weight</p>
              <p className="text-base font-bold text-purple-600">{weight ? `${weight} kg` : '--'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="kg"
              className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              step="0.1"
            />
            <button onClick={handleWeightSave} className="w-7 h-7 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center">
              <Save className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Today's Workout */}
        <div className="card !p-3 sm:!p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Today's Workout</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {workout?.is_rest_day ? 'Rest Day' : workout?.workout_type}
                </p>
              </div>
            </div>
            {!workout?.is_rest_day && (
              <div className="hidden sm:flex gap-1">
                {workout?.muscle_groups?.map((muscle, i) => (
                  <span key={i} className="badge badge-blue text-xs">{muscle}</span>
                ))}
              </div>
            )}
          </div>

          {workout?.is_rest_day ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Rest Day</h4>
              <p className="text-sm text-gray-500">Take it easy and recover!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto -mx-1 px-1">
              {exercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  onClick={() => onExerciseToggle(exercise.id, !exercise.completed)}
                  className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all touch-target ${
                    exercise.completed 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-transparent'
                  }`}
                >
                  {exercise.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm sm:text-base font-medium truncate ${exercise.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                      {exercise.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{exercise.sets} × {exercise.reps}</p>
                  </div>
                  <span className={`badge text-[10px] sm:text-xs ${categoryColors[exercise.category] || 'badge-blue'}`}>
                    {exercise.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Meals */}
        <div className="card !p-3 sm:!p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Today's Meals</h3>
                <p className="text-xs sm:text-sm text-gray-500">Weight Gain Diet</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto -mx-1 px-1">
            {meals.map((meal) => (
              <div 
                key={meal.id}
                onClick={() => onMealToggle(meal.id, !meal.completed)}
                className={`p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all touch-target ${
                  meal.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {meal.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm sm:text-base font-medium truncate ${meal.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                        {meal.name}
                      </p>
                      <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">{meal.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                      {meal.items?.map(item => item.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Daily Notes</h3>
              <p className="text-sm text-gray-500">Track your thoughts and progress</p>
            </div>
          </div>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="btn btn-secondary text-sm"
          >
            {showNotes ? 'Cancel' : (notes ? 'Edit' : 'Add Note')}
          </button>
        </div>

        {showNotes ? (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your workout? Any observations about your diet? Track your progress here..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              rows={4}
            />
            <button onClick={handleNotesSave} className="btn btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Notes
            </button>
          </div>
        ) : notes ? (
          <p className="text-gray-600 whitespace-pre-wrap">{notes}</p>
        ) : (
          <p className="text-gray-400 italic">No notes for today. Click "Add Note" to add one.</p>
        )}
      </div>
    </div>
  );
}
