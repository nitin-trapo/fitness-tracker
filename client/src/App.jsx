import { useState, useEffect, useCallback } from 'react';
import { 
  Dumbbell, 
  UtensilsCrossed, 
  Calendar, 
  TrendingUp,
  Menu,
  X,
  FileText,
  Settings,
  Home,
  BarChart3
} from 'lucide-react';
import api from './api';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import DietTracker from './components/DietTracker';
import WeeklyView from './components/WeeklyView';
import ProgressView from './components/ProgressView';
import ReportView from './components/ReportView';
import SettingsView from './components/SettingsView';
import QuickActions from './components/QuickActions';
import PullToRefresh from './components/PullToRefresh';
import useSwipeNavigation from './hooks/useSwipeNavigation';
import usePullToRefresh from './hooks/usePullToRefresh';
import notificationService from './services/notifications';

const tabs = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'diet', label: 'Diet', icon: UtensilsCrossed },
  { id: 'weekly', label: 'Weekly', icon: Calendar },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const mobileMainTabs = ['dashboard', 'workout', 'diet', 'progress', 'settings'];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const todayData = await api.getToday();
      setData(todayData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Swipe navigation between tabs
  useSwipeNavigation(mobileMainTabs, activeTab, setActiveTab);

  // Pull to refresh
  const { pullDistance, isRefreshing, threshold } = usePullToRefresh(fetchData);

  useEffect(() => {
    fetchData();
    
    // Initialize notifications on app load
    const initNotifications = async () => {
      try {
        const settings = await api.getSettings();
        if (notificationService.getPermission() === 'granted') {
          if (settings.waterReminders === 'true') {
            notificationService.startWaterReminders(parseInt(settings.waterInterval) || 60);
          }
          if (settings.mealReminders === 'true') {
            const meals = await api.getMeals();
            notificationService.scheduleMealReminders(meals);
          }
        }
      } catch (err) {
        console.log('Notifications not initialized:', err);
      }
    };
    initNotifications();

    return () => {
      notificationService.stopAll();
    };
  }, [fetchData]);

  const handleExerciseToggle = async (exerciseId, completed) => {
    if (!data) return;
    try {
      await api.toggleExercise(data.date, exerciseId, completed);
      // Update local state
      setData(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.id === exerciseId ? { ...ex, completed } : ex
        )
      }));
    } catch (err) {
      console.error('Error toggling exercise:', err);
    }
  };

  const handleMealToggle = async (mealId, completed) => {
    if (!data) return;
    try {
      await api.toggleMeal(data.date, mealId, completed);
      // Update local state
      setData(prev => ({
        ...prev,
        meals: prev.meals.map(meal =>
          meal.id === mealId ? { ...meal, completed } : meal
        )
      }));
    } catch (err) {
      console.error('Error toggling meal:', err);
    }
  };

  const handleDailyLogUpdate = async (updates) => {
    if (!data) return;
    try {
      const updated = await api.updateDailyLog(data.date, updates);
      setData(prev => ({
        ...prev,
        dailyLog: updated
      }));
    } catch (err) {
      console.error('Error updating daily log:', err);
    }
  };

  // Quick action handlers
  const handleQuickWaterAdd = async () => {
    if (!data) return;
    const newWater = (data.dailyLog?.water_intake || 0) + 1;
    await handleDailyLogUpdate({ water_intake: newWater });
  };

  const handleQuickExercise = async () => {
    if (!data) return;
    const nextExercise = data.exercises?.find(e => !e.completed);
    if (nextExercise) {
      await handleExerciseToggle(nextExercise.id, true);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your fitness data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center card max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button onClick={fetchData} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            data={data} 
            onExerciseToggle={handleExerciseToggle}
            onMealToggle={handleMealToggle}
            onDailyLogUpdate={handleDailyLogUpdate}
          />
        );
      case 'workout':
        return (
          <WorkoutTracker 
            data={data} 
            onExerciseToggle={handleExerciseToggle}
          />
        );
      case 'diet':
        return (
          <DietTracker 
            data={data} 
            onMealToggle={handleMealToggle}
          />
        );
      case 'weekly':
        return <WeeklyView />;
      case 'progress':
        return (
          <ProgressView 
            data={data}
            onDailyLogUpdate={handleDailyLogUpdate}
          />
        );
      case 'report':
        return <ReportView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Pull to Refresh Indicator */}
      <PullToRefresh 
        pullDistance={pullDistance} 
        isRefreshing={isRefreshing} 
        threshold={threshold} 
      />
      {/* Header - Compact on mobile */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Smaller on mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Nitin Fitness Tracker</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Weight Gain Program</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Mobile menu button for extra tabs */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 touch-target flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown for extra tabs (Weekly, Report) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
            <nav className="px-3 py-2 space-y-1">
              {tabs.filter(tab => !mobileMainTabs.includes(tab.id)).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all touch-target ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content - Add padding for bottom nav on mobile */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 lg:pb-6">
        {renderContent()}
      </main>

      {/* Quick Actions FAB */}
      {data && !loading && (activeTab === 'dashboard' || activeTab === 'workout') && (
        <QuickActions 
          onWaterAdd={handleQuickWaterAdd}
          onQuickExercise={handleQuickExercise}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.filter(tab => mobileMainTabs.includes(tab.id)).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(20);
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all touch-target ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              <tab.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-[10px] sm:text-xs mt-1 font-medium ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
