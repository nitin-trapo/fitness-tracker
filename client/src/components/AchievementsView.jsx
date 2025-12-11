import { useState, useEffect } from 'react';
import { Trophy, Lock } from 'lucide-react';
import api from '../api';

export default function AchievementsView() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await api.getAchievements();
      setAchievements(data);
    } catch (err) {
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

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
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Achievements</h3>
        </div>
        <span className="text-sm text-gray-500">{unlockedCount}/{achievements.length} unlocked</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`relative p-3 rounded-xl text-center transition-all ${
              achievement.unlocked
                ? 'bg-yellow-50 border-2 border-yellow-200'
                : 'bg-gray-50 border-2 border-gray-100 opacity-60'
            }`}
          >
            <div className="text-2xl mb-1">{achievement.badge_icon}</div>
            <p className={`text-xs font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
              {achievement.badge_name}
            </p>
            {!achievement.unlocked && (
              <div className="absolute top-1 right-1">
                <Lock className="w-3 h-3 text-gray-400" />
              </div>
            )}
            {achievement.unlocked && achievement.unlocked_date && (
              <p className="text-[10px] text-yellow-600 mt-1">
                {new Date(achievement.unlocked_date).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No achievements available yet.</p>
      )}
    </div>
  );
}
