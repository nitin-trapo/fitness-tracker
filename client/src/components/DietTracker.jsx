import { UtensilsCrossed, CheckCircle2, Circle, Clock, Zap, Moon, Sun, Coffee } from 'lucide-react';

const mealTypeIcons = {
  'pre_workout': Zap,
  'post_workout': Zap,
  'main': UtensilsCrossed,
  'snack': Coffee,
  'night': Moon,
};

const mealTypeColors = {
  'pre_workout': 'bg-orange-100 text-orange-600',
  'post_workout': 'bg-green-100 text-green-600',
  'main': 'bg-blue-100 text-blue-600',
  'snack': 'bg-purple-100 text-purple-600',
  'night': 'bg-indigo-100 text-indigo-600',
};

export default function DietTracker({ data, onMealToggle }) {
  if (!data) return null;

  const { meals } = data;
  const completedCount = meals.filter(m => m.completed).length;
  const progress = meals.length > 0 ? (completedCount / meals.length) * 100 : 0;

  // Get current hour to highlight current meal
  const currentHour = new Date().getHours();

  const getMealStatus = (time) => {
    const [hourStr] = time.split(':');
    const hour = parseInt(hourStr);
    const isPM = time.toLowerCase().includes('pm');
    const mealHour = isPM && hour !== 12 ? hour + 12 : hour;
    
    if (currentHour < mealHour) return 'upcoming';
    if (currentHour === mealHour) return 'current';
    return 'past';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Diet Plan</h2>
          <p className="text-xs sm:text-base text-gray-500">Weight Gain - {meals.length} Meals/Day</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card !p-3 sm:!p-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm font-medium text-gray-600">Meals Completed</span>
          <span className="text-xs sm:text-sm font-semibold text-green-600">{completedCount}/{meals.length} meals</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3">
          <div className="bg-green-600 h-2 sm:h-3 rounded-full progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Meal Timeline */}
      <div className="space-y-4">
        {meals.map((meal, index) => {
          const Icon = mealTypeIcons[meal.meal_type] || UtensilsCrossed;
          const colorClass = mealTypeColors[meal.meal_type] || 'bg-gray-100 text-gray-600';
          const status = getMealStatus(meal.time);

          return (
            <div
              key={meal.id}
              onClick={() => onMealToggle(meal.id, !meal.completed)}
              className={`card card-hover cursor-pointer relative !p-3 sm:!p-5 touch-target ${
                meal.completed ? 'border-2 border-green-200 bg-green-50/50' : ''
              } ${status === 'current' && !meal.completed ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  meal.completed ? 'bg-green-100' : colorClass.split(' ')[0]
                }`}>
                  {meal.completed ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  ) : (
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass.split(' ')[1]}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 sm:mb-2 gap-2">
                    <h3 className={`text-sm sm:text-base font-semibold truncate ${meal.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                      {meal.name}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-500">{meal.time}</span>
                    </div>
                  </div>

                  {/* Food items */}
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {meal.items?.slice(0, 3).map((item, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs sm:text-sm ${
                          meal.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="font-medium truncate max-w-[80px] sm:max-w-none">{item.name}</span>
                      </span>
                    ))}
                    {meal.items?.length > 3 && (
                      <span className="text-xs text-gray-400">+{meal.items.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Checkbox indicator */}
                <div className="flex-shrink-0">
                  {meal.completed ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
