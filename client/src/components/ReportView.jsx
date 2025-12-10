import { useState, useEffect } from 'react';
import { FileText, Calendar, Dumbbell, UtensilsCrossed, Scale, Droplets, CheckCircle2, XCircle, Clock, StickyNote } from 'lucide-react';
import api from '../api';

export default function ReportView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);

  const fetchReport = async (date) => {
    setLoading(true);
    try {
      const data = await api.getDay(date);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate stats
  const exercisesCompleted = reportData?.exercises?.filter(e => e.completed).length || 0;
  const totalExercises = reportData?.exercises?.length || 0;
  const mealsCompleted = reportData?.meals?.filter(m => m.completed).length || 0;
  const totalMeals = reportData?.meals?.length || 0;
  const workoutProgress = totalExercises > 0 ? Math.round((exercisesCompleted / totalExercises) * 100) : 0;
  const dietProgress = totalMeals > 0 ? Math.round((mealsCompleted / totalMeals) * 100) : 0;
  const overallScore = Math.round((workoutProgress + dietProgress) / 2);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score > 0) return 'Needs Improvement';
    return 'No Data';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Daily Report</h2>
            <p className="text-gray-500">View your progress for any date</p>
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Date Display */}
      <div className="card bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <p className="text-indigo-100 text-sm">Report for</p>
        <h3 className="text-2xl font-bold">{formatDate(selectedDate)}</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reportData ? (
        <>
          {/* Overall Score */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Overall Score</h3>
            <div className="flex items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreColor(overallScore)}`}>
                <span className="text-3xl font-bold">{overallScore}%</span>
              </div>
              <div>
                <p className={`text-xl font-semibold ${getScoreColor(overallScore).split(' ')[0]}`}>
                  {getScoreLabel(overallScore)}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Based on workout and diet completion
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Workout Progress */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Workout</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{workoutProgress}%</p>
              <p className="text-sm text-gray-500">{exercisesCompleted}/{totalExercises} exercises</p>
            </div>

            {/* Diet Progress */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Diet</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{dietProgress}%</p>
              <p className="text-sm text-gray-500">{mealsCompleted}/{totalMeals} meals</p>
            </div>

            {/* Weight */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Weight</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.dailyLog?.weight ? `${reportData.dailyLog.weight} kg` : '—'}
              </p>
              <p className="text-sm text-gray-500">recorded</p>
            </div>

            {/* Water */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-sm text-gray-500">Water</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.dailyLog?.water_intake || 0}
              </p>
              <p className="text-sm text-gray-500">glasses</p>
            </div>
          </div>

          {/* Workout Details */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Workout Details</h3>
              {reportData.workout && !reportData.workout.is_rest_day && (
                <span className="badge badge-blue">{reportData.workout.workout_type}</span>
              )}
            </div>

            {reportData.workout?.is_rest_day ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">Rest Day - No workout scheduled</p>
              </div>
            ) : reportData.exercises?.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reportData.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      exercise.completed ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {exercise.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={exercise.completed ? 'text-green-700' : 'text-gray-600'}>
                        {exercise.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{exercise.sets} × {exercise.reps}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No exercises for this day</p>
            )}
          </div>

          {/* Meals Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Meals Details</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reportData.meals?.map((meal) => (
                <div
                  key={meal.id}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    meal.completed ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {meal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <span className={meal.completed ? 'text-green-700 font-medium' : 'text-gray-600 font-medium'}>
                        {meal.name}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {meal.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {meal.items?.length} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <StickyNote className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Notes</h3>
            </div>
            {reportData.dailyLog?.notes ? (
              <p className="text-gray-700 bg-yellow-50 p-4 rounded-xl">{reportData.dailyLog.notes}</p>
            ) : (
              <p className="text-gray-500 italic">No notes recorded for this day</p>
            )}
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No data available for this date</p>
        </div>
      )}
    </div>
  );
}
