import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  UtensilsCrossed, 
  Calendar, 
  TrendingUp,
  Menu,
  X,
  FileText,
  Settings
} from 'lucide-react';
import api from './api';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import DietTracker from './components/DietTracker';
import WeeklyView from './components/WeeklyView';
import ProgressView from './components/ProgressView';
import ReportView from './components/ReportView';
import SettingsView from './components/SettingsView';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'diet', label: 'Diet', icon: UtensilsCrossed },
  { id: 'weekly', label: 'Weekly', icon: Calendar },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fitness Tracker</h1>
                <p className="text-xs text-gray-500">Weight Gain Program</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
