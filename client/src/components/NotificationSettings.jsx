import { useState, useEffect } from 'react';
import { Bell, BellOff, Droplets, UtensilsCrossed, Check } from 'lucide-react';
import notificationService from '../services/notifications';
import api from '../api';

export default function NotificationSettings() {
  const [permission, setPermission] = useState('default');
  const [waterReminders, setWaterReminders] = useState(false);
  const [mealReminders, setMealReminders] = useState(false);
  const [waterInterval, setWaterInterval] = useState(60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setPermission(notificationService.getPermission());
    
    try {
      const settings = await api.getSettings();
      setWaterReminders(settings.waterReminders === 'true');
      setMealReminders(settings.mealReminders === 'true');
      setWaterInterval(parseInt(settings.waterInterval) || 60);

      // Restore reminders if enabled
      if (settings.waterReminders === 'true' && notificationService.getPermission() === 'granted') {
        notificationService.startWaterReminders(parseInt(settings.waterInterval) || 60);
      }
      if (settings.mealReminders === 'true' && notificationService.getPermission() === 'granted') {
        const meals = await api.getMeals();
        notificationService.scheduleMealReminders(meals);
      }
    } catch (err) {
      console.error('Error loading notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermission());
    
    if (granted) {
      // Show test notification
      notificationService.show('🎉 Notifications Enabled!', {
        body: 'You will now receive water and meal reminders.'
      });
    }
  };

  const handleWaterToggle = async () => {
    const newValue = !waterReminders;
    setWaterReminders(newValue);
    
    if (newValue) {
      notificationService.startWaterReminders(waterInterval);
    } else {
      notificationService.stopWaterReminders();
    }

    await api.updateSetting('waterReminders', newValue.toString());
  };

  const handleMealToggle = async () => {
    const newValue = !mealReminders;
    setMealReminders(newValue);
    
    if (newValue) {
      const meals = await api.getMeals();
      notificationService.scheduleMealReminders(meals);
    } else {
      notificationService.clearMealReminders();
    }

    await api.updateSetting('mealReminders', newValue.toString());
  };

  const handleIntervalChange = async (interval) => {
    setWaterInterval(interval);
    await api.updateSetting('waterInterval', interval.toString());
    
    if (waterReminders) {
      notificationService.startWaterReminders(interval);
    }
  };

  const testNotification = () => {
    notificationService.show('🔔 Test Notification', {
      body: 'Notifications are working correctly!'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSupported = notificationService.isSupported();
  const isGranted = permission === 'granted';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Notifications</h3>
      </div>

      {!isSupported ? (
        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Notifications are not supported in this browser. Try using Chrome, Firefox, or Edge.
          </p>
        </div>
      ) : !isGranted ? (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-gray-700 mb-3">
            Enable notifications to get reminders for water intake and meals.
          </p>
          <button
            onClick={handleRequestPermission}
            className="btn btn-primary text-sm"
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </button>
          {permission === 'denied' && (
            <p className="text-xs text-red-600 mt-2">
              Notifications were blocked. Please enable them in your browser settings.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Water Reminders */}
          <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="font-medium text-gray-900">Water Reminders</p>
                  <p className="text-xs text-gray-500">Get reminded to drink water</p>
                </div>
              </div>
              <button
                onClick={handleWaterToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${waterReminders ? 'bg-cyan-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${waterReminders ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {waterReminders && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-600">Remind every:</span>
                <select
                  value={waterInterval}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value={30}>30 min</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            )}
          </div>

          {/* Meal Reminders */}
          <div className="p-3 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Meal Reminders</p>
                  <p className="text-xs text-gray-500">Get reminded at meal times</p>
                </div>
              </div>
              <button
                onClick={handleMealToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${mealReminders ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${mealReminders ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Test Notification */}
          <button
            onClick={testNotification}
            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Test Notification
          </button>
        </div>
      )}
    </div>
  );
}
