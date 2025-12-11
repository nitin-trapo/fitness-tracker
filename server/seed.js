import db from './database.js';

const workoutsData = [
  { day_of_week: 0, day_name: 'Sunday', workout_type: 'Rest Day', muscle_groups: '[]', is_rest_day: 1 },
  { day_of_week: 1, day_name: 'Monday', workout_type: 'Push Day (Incline)', muscle_groups: '["Chest","Shoulder","Triceps"]', is_rest_day: 0 },
  { day_of_week: 2, day_name: 'Tuesday', workout_type: 'Pull Day', muscle_groups: '["Back","Traps","Biceps"]', is_rest_day: 0 },
  { day_of_week: 3, day_name: 'Wednesday', workout_type: 'Legs Day', muscle_groups: '["Legs","Forearms","Abs"]', is_rest_day: 0 },
  { day_of_week: 4, day_name: 'Thursday', workout_type: 'Push Day (Flat)', muscle_groups: '["Chest","Shoulder","Triceps"]', is_rest_day: 0 },
  { day_of_week: 5, day_name: 'Friday', workout_type: 'Pull Day (Variation)', muscle_groups: '["Back","Traps","Biceps"]', is_rest_day: 0 },
  { day_of_week: 6, day_name: 'Saturday', workout_type: 'Legs Day', muscle_groups: '["Legs","Forearms","Abs"]', is_rest_day: 0 }
];

const exercisesData = {
  1: [
    { name: 'Incline Push Up', sets: 2, reps: '15', category: 'Warmup' },
    { name: 'Incline Db Press', sets: 3, reps: '10-12', category: 'Chest' },
    { name: 'Incline BB Press', sets: 3, reps: '10-12', category: 'Chest' },
    { name: 'Incline Db Fly', sets: 3, reps: '12-15', category: 'Chest' },
    { name: 'Db Shoulder Press', sets: 3, reps: '10-12', category: 'Shoulder' },
    { name: 'Db Side Lateral', sets: 3, reps: '12-15', category: 'Shoulder' },
    { name: 'Machine Rear Delt', sets: 3, reps: '12-15', category: 'Shoulder' },
    { name: 'Db Skull Crusher', sets: 3, reps: '10-12', category: 'Triceps' },
    { name: 'Push Down', sets: 3, reps: '12-15', category: 'Triceps' },
    { name: 'Seated Dips', sets: 3, reps: '15', category: 'Triceps' }
  ],
  2: [
    { name: 'Chin Up', sets: 2, reps: '10', category: 'Warmup' },
    { name: 'Lat Pulldown Front', sets: 3, reps: '10-12', category: 'Back' },
    { name: 'Cable Seated Row (Rod)', sets: 3, reps: '10-12', category: 'Back' },
    { name: 'Linear Row (Mid Row Machine)', sets: 3, reps: '10-12', category: 'Back' },
    { name: 'Db Front Shrugs', sets: 3, reps: '12-15', category: 'Traps' },
    { name: 'Incline Db Curl', sets: 3, reps: '10-12', category: 'Biceps' },
    { name: 'Z Bar Curl', sets: 3, reps: '10-12', category: 'Biceps' },
    { name: 'Db Hammer Curl', sets: 3, reps: '12-15', category: 'Biceps' }
  ],
  3: [
    { name: 'Free Squats (Close)', sets: 2, reps: '15', category: 'Warmup' },
    { name: 'Standing Calf Raise', sets: 3, reps: '15', category: 'Legs' },
    { name: 'Leg Extension', sets: 3, reps: '12-15', category: 'Legs' },
    { name: 'BB Squats', sets: 3, reps: '10-12', category: 'Legs' },
    { name: 'Leg Curl', sets: 3, reps: '12-15', category: 'Legs' },
    { name: 'Forearms Machine', sets: 3, reps: '15', category: 'Forearms' },
    { name: 'Db Twist', sets: 3, reps: '15', category: 'Forearms' },
    { name: 'Half Crunch', sets: 1, reps: '30', category: 'Abs' },
    { name: 'Leg Raise', sets: 1, reps: '30', category: 'Abs' },
    { name: 'Plank', sets: 1, reps: '60s', category: 'Abs' }
  ],
  4: [
    { name: 'Normal Push Up', sets: 2, reps: '15', category: 'Warmup' },
    { name: 'Flat Db Press', sets: 3, reps: '10-12', category: 'Chest' },
    { name: 'Flat BB Press', sets: 3, reps: '10-12', category: 'Chest' },
    { name: 'Machine Fly', sets: 3, reps: '12-15', category: 'Chest' },
    { name: 'Machine Shoulder Press', sets: 3, reps: '10-12', category: 'Shoulder' },
    { name: 'Db Side Lateral', sets: 3, reps: '12-15', category: 'Shoulder' },
    { name: 'Db Rear Delt', sets: 3, reps: '12-15', category: 'Shoulder' },
    { name: 'Z Bar Skull Crusher', sets: 3, reps: '10-12', category: 'Triceps' },
    { name: 'Rope Push Down', sets: 3, reps: '12-15', category: 'Triceps' },
    { name: 'Seated Dips', sets: 3, reps: '15', category: 'Triceps' }
  ],
  5: [
    { name: 'Chin Up', sets: 2, reps: '10', category: 'Warmup' },
    { name: 'Lat Pulldown Under Grip', sets: 3, reps: '10-12', category: 'Back' },
    { name: 'High Cable D Bar (Small)', sets: 3, reps: '10-12', category: 'Back' },
    { name: 'Hyper Extension', sets: 3, reps: '12', category: 'Back' },
    { name: 'Db Shrugs Straight', sets: 3, reps: '12-15', category: 'Traps' },
    { name: 'BB Wide Grip Curl', sets: 3, reps: '10-12', category: 'Biceps' },
    { name: 'Db Alternate Curl', sets: 3, reps: '10-12', category: 'Biceps' },
    { name: 'Db Hammer Curl', sets: 3, reps: '12-15', category: 'Biceps' }
  ],
  6: [
    { name: 'Free Squats (Close)', sets: 2, reps: '15', category: 'Warmup' },
    { name: 'Standing Calf Raise', sets: 3, reps: '15', category: 'Legs' },
    { name: 'Leg Extension', sets: 3, reps: '12-15', category: 'Legs' },
    { name: 'BB Squats', sets: 3, reps: '10-12', category: 'Legs' },
    { name: 'Leg Curl', sets: 3, reps: '12-15', category: 'Legs' },
    { name: 'Forearms Machine', sets: 3, reps: '15', category: 'Forearms' },
    { name: 'Db Twist', sets: 3, reps: '15', category: 'Forearms' },
    { name: 'Half Crunch', sets: 1, reps: '30', category: 'Abs' },
    { name: 'Leg Raise', sets: 1, reps: '30', category: 'Abs' },
    { name: 'Plank', sets: 1, reps: '60s', category: 'Abs' }
  ]
};

const mealsData = [
  { name: 'Pre-Workout', time: '5:30 AM', meal_type: 'pre_workout', items: JSON.stringify([{ name: '2 Banana', quantity: '2 pcs' }, { name: 'Dates', quantity: '6 pcs' }, { name: 'Almonds', quantity: '10 pcs' }]), order_index: 0 },
  { name: 'Post-Workout', time: '6:30 AM', meal_type: 'post_workout', items: JSON.stringify([{ name: 'Mass Gainer', quantity: '1 scoop' }, { name: 'Milk', quantity: '300ml' }, { name: 'Daliya', quantity: '30gm' }]), order_index: 1 },
  { name: 'Breakfast', time: '9:30 AM', meal_type: 'main', items: JSON.stringify([{ name: 'Brown Bread', quantity: '4 slices' }, { name: 'Peanut Butter', quantity: '4 scoops' }, { name: 'Banana', quantity: '1 pc' }, { name: 'Multivitamin', quantity: '1 tab' }]), order_index: 2 },
  { name: 'Lunch', time: '1:00 PM', meal_type: 'main', items: JSON.stringify([{ name: 'Roti', quantity: '2-3 pcs' }, { name: 'Paneer Subji', quantity: '100gm' }, { name: 'Dahi', quantity: '1 bowl' }, { name: 'Salad', quantity: '1 bowl' }, { name: 'Butter Milk', quantity: '1 glass' }]), order_index: 3 },
  { name: 'Evening Snack', time: '4:00 PM', meal_type: 'snack', items: JSON.stringify([{ name: 'Any Fruit', quantity: '1 pc' }]), order_index: 4 },
  { name: 'Pre-Dinner Snack', time: '6:00 PM', meal_type: 'snack', items: JSON.stringify([{ name: 'Dates', quantity: '4 pcs' }, { name: 'Almonds', quantity: '10 pcs' }, { name: 'Cashew', quantity: '10 pcs' }, { name: 'Protein Bar (Chocolate)', quantity: '1 pc' }]), order_index: 5 },
  { name: 'Dinner', time: '8:00 PM', meal_type: 'main', items: JSON.stringify([{ name: 'Roti', quantity: '2-3 pcs' }, { name: 'Subji', quantity: '1 bowl' }, { name: 'Rajma', quantity: '100gm' }, { name: 'Salad', quantity: '1 bowl' }, { name: 'Butter Milk', quantity: '1 glass' }, { name: 'Fish Oil', quantity: '2 tabs' }]), order_index: 6 },
  { name: 'Before Bed', time: '11:00 PM', meal_type: 'night', items: JSON.stringify([{ name: 'Mass Gainer', quantity: '1 scoop' }, { name: 'Milk', quantity: '300ml' }]), order_index: 7 }
];

const achievementsData = [
  { badge_id: 'first_workout', badge_name: 'First Workout', badge_description: 'Complete your first workout', badge_icon: '🏋️' },
  { badge_id: 'streak_7', badge_name: '7 Day Streak', badge_description: 'Maintain a 7-day workout streak', badge_icon: '🔥' },
  { badge_id: 'streak_30', badge_name: '30 Day Streak', badge_description: 'Maintain a 30-day workout streak', badge_icon: '💪' },
  { badge_id: 'streak_100', badge_name: '100 Day Streak', badge_description: 'Maintain a 100-day workout streak', badge_icon: '🏆' },
  { badge_id: 'early_bird', badge_name: 'Early Bird', badge_description: 'Complete a workout before 6 AM', badge_icon: '🌅' },
  { badge_id: 'hydration_master', badge_name: 'Hydration Master', badge_description: 'Drink 10 glasses of water in a day', badge_icon: '💧' },
  { badge_id: 'meal_prep_pro', badge_name: 'Meal Prep Pro', badge_description: 'Complete all meals for 7 days straight', badge_icon: '🍽️' },
  { badge_id: 'weight_goal', badge_name: 'Weight Goal Achieved', badge_description: 'Reach your target weight', badge_icon: '⚖️' },
  { badge_id: 'pr_breaker', badge_name: 'PR Breaker', badge_description: 'Set a new personal record', badge_icon: '📈' },
  { badge_id: 'consistency_king', badge_name: 'Consistency King', badge_description: 'Complete 50 workouts', badge_icon: '👑' },
  { badge_id: 'century_club', badge_name: 'Century Club', badge_description: 'Complete 100 workouts', badge_icon: '💯' },
  { badge_id: 'iron_will', badge_name: 'Iron Will', badge_description: 'Never skip leg day for a month', badge_icon: '🦵' }
];

const quotesData = [
  { quote_text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { quote_text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote_text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { quote_text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { quote_text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { quote_text: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
  { quote_text: "The difference between try and triumph is a little umph.", author: "Marvin Phillips" },
  { quote_text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
  { quote_text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian" },
  { quote_text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote_text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
  { quote_text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { quote_text: "The harder you work, the luckier you get.", author: "Gary Player" },
  { quote_text: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { quote_text: "No pain, no gain. Shut up and train.", author: "Unknown" },
  { quote_text: "Sweat is just fat crying.", author: "Unknown" },
  { quote_text: "The clock is ticking. Are you becoming the person you want to be?", author: "Greg Plitt" },
  { quote_text: "If it doesn't challenge you, it won't change you.", author: "Fred DeVito" },
  { quote_text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { quote_text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" }
];

export function seedDatabase() {
  const workoutCount = db.prepare('SELECT COUNT(*) as count FROM workouts').get();
  if (workoutCount.count > 0) {
    console.log('Database already seeded');
    seedAchievementsAndQuotes();
    return;
  }

  console.log('Seeding database...');

  const insertWorkout = db.prepare('INSERT INTO workouts (day_of_week, day_name, workout_type, muscle_groups, is_rest_day) VALUES (?, ?, ?, ?, ?)');
  const insertExercise = db.prepare('INSERT INTO exercises (workout_id, name, sets, reps, category, order_index) VALUES (?, ?, ?, ?, ?, ?)');
  const insertMeal = db.prepare('INSERT INTO meals (name, time, meal_type, items, order_index) VALUES (?, ?, ?, ?, ?)');

  const workoutMap = {};
  
  db.transaction(() => {
    for (const w of workoutsData) {
      const result = insertWorkout.run(w.day_of_week, w.day_name, w.workout_type, w.muscle_groups, w.is_rest_day);
      workoutMap[w.day_of_week] = result.lastInsertRowid;
    }

    for (const [dayOfWeek, exercises] of Object.entries(exercisesData)) {
      const workoutId = workoutMap[parseInt(dayOfWeek)];
      exercises.forEach((ex, index) => {
        insertExercise.run(workoutId, ex.name, ex.sets, ex.reps, ex.category, index);
      });
    }

    for (const meal of mealsData) {
      insertMeal.run(meal.name, meal.time, meal.meal_type, meal.items, meal.order_index);
    }
  })();

  seedAchievementsAndQuotes();
  console.log('Database seeded successfully!');
}

function seedAchievementsAndQuotes() {
  const achievementCount = db.prepare('SELECT COUNT(*) as count FROM achievements').get();
  if (achievementCount.count === 0) {
    const insertAchievement = db.prepare('INSERT INTO achievements (badge_id, badge_name, badge_description, badge_icon) VALUES (?, ?, ?, ?)');
    for (const a of achievementsData) {
      insertAchievement.run(a.badge_id, a.badge_name, a.badge_description, a.badge_icon);
    }
  }

  const quoteCount = db.prepare('SELECT COUNT(*) as count FROM quotes').get();
  if (quoteCount.count === 0) {
    const insertQuote = db.prepare('INSERT INTO quotes (quote_text, author) VALUES (?, ?)');
    for (const q of quotesData) {
      insertQuote.run(q.quote_text, q.author);
    }
  }
}

export function resetDatabase() {
  db.exec('DELETE FROM meal_logs');
  db.exec('DELETE FROM exercise_logs');
  db.exec('DELETE FROM daily_logs');
  db.exec('DELETE FROM meals');
  db.exec('DELETE FROM exercises');
  db.exec('DELETE FROM workouts');
  seedDatabase();
}
