import { useState } from 'react';
import { Plus, X, Droplets, Dumbbell, Check } from 'lucide-react';

export default function QuickActions({ onWaterAdd, onQuickExercise }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(null);

  const handleAction = (action, type) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    action();
    setShowSuccess(type);
    setTimeout(() => {
      setShowSuccess(null);
      setIsOpen(false);
    }, 800);
  };

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-40">
      {/* Action buttons */}
      {isOpen && (
        <div className="flex flex-col gap-3 mb-3 items-end">
          {/* Water button */}
          <button
            onClick={() => handleAction(onWaterAdd, 'water')}
            className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {showSuccess === 'water' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Droplets className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">+1 Water</span>
          </button>

          {/* Quick exercise button */}
          <button
            onClick={() => handleAction(onQuickExercise, 'exercise')}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {showSuccess === 'exercise' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Dumbbell className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">Complete Next</span>
          </button>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => {
          if (navigator.vibrate) {
            navigator.vibrate(30);
          }
          setIsOpen(!isOpen);
        }}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen 
            ? 'bg-gray-600 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
