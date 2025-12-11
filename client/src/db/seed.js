import db from './database.js';

// Seed data
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
  // Monday - Push (Incline Focus)
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
  // Tuesday - Pull
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
  // Wednesday - Legs
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
  // Thursday - Push (Flat Focus)
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
  // Friday - Pull (Variation)
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
  // Saturday - Legs (same as Wednesday)
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
  {
    name: 'Pre-Workout',
    time: '5:30 AM',
    meal_type: 'pre_workout',
    items: JSON.stringify([
      { name: '2 Banana', quantity: '2 pcs' },
      { name: 'Dates', quantity: '6 pcs' },
      { name: 'Almonds', quantity: '10 pcs' }
    ]),
    order_index: 0
  },
  {
    name: 'Post-Workout',
    time: '6:30 AM',
    meal_type: 'post_workout',
    items: JSON.stringify([
      { name: 'Mass Gainer', quantity: '1 scoop' },
      { name: 'Milk', quantity: '300ml' },
      { name: 'Daliya', quantity: '30gm' }
    ]),
    order_index: 1
  },
  {
    name: 'Breakfast',
    time: '9:30 AM',
    meal_type: 'main',
    items: JSON.stringify([
      { name: 'Brown Bread', quantity: '4 slices' },
      { name: 'Peanut Butter', quantity: '4 scoops' },
      { name: 'Banana', quantity: '1 pc' },
      { name: 'Multivitamin', quantity: '1 tab' }
    ]),
    order_index: 2
  },
  {
    name: 'Lunch',
    time: '1:00 PM',
    meal_type: 'main',
    items: JSON.stringify([
      { name: 'Roti', quantity: '2-3 pcs' },
      { name: 'Paneer Subji', quantity: '100gm' },
      { name: 'Dahi', quantity: '1 bowl' },
      { name: 'Salad', quantity: '1 bowl' },
      { name: 'Butter Milk', quantity: '1 glass' }
    ]),
    order_index: 3
  },
  {
    name: 'Evening Snack',
    time: '4:00 PM',
    meal_type: 'snack',
    items: JSON.stringify([
      { name: 'Any Fruit', quantity: '1 pc' }
    ]),
    order_index: 4
  },
  {
    name: 'Pre-Dinner Snack',
    time: '6:00 PM',
    meal_type: 'snack',
    items: JSON.stringify([
      { name: 'Dates', quantity: '4 pcs' },
      { name: 'Almonds', quantity: '10 pcs' },
      { name: 'Cashew', quantity: '10 pcs' },
      { name: 'Protein Bar (Chocolate)', quantity: '1 pc' }
    ]),
    order_index: 5
  },
  {
    name: 'Dinner',
    time: '8:00 PM',
    meal_type: 'main',
    items: JSON.stringify([
      { name: 'Roti', quantity: '2-3 pcs' },
      { name: 'Subji', quantity: '1 bowl' },
      { name: 'Rajma', quantity: '100gm' },
      { name: 'Salad', quantity: '1 bowl' },
      { name: 'Butter Milk', quantity: '1 glass' },
      { name: 'Fish Oil', quantity: '2 tabs' }
    ]),
    order_index: 6
  },
  {
    name: 'Before Bed',
    time: '11:00 PM',
    meal_type: 'night',
    items: JSON.stringify([
      { name: 'Mass Gainer', quantity: '1 scoop' },
      { name: 'Milk', quantity: '300ml' }
    ]),
    order_index: 7
  }
];

export async function seedDatabase() {
  try {
    // Check if already seeded
    const workoutCount = await db.workouts.count();
    if (workoutCount > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('🌱 Seeding database...');

    // Seed workouts
    const workoutIds = await db.workouts.bulkAdd(workoutsData, { allKeys: true });
    console.log('✅ Workouts seeded');

    // Create workout ID map (day_of_week -> id)
    const workoutMap = {};
    workoutsData.forEach((w, index) => {
      workoutMap[w.day_of_week] = workoutIds[index];
    });

    // Seed exercises
    const allExercises = [];
    for (const [dayOfWeek, exerciseList] of Object.entries(exercisesData)) {
      const workoutId = workoutMap[parseInt(dayOfWeek)];
      exerciseList.forEach((ex, index) => {
        allExercises.push({
          workout_id: workoutId,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          category: ex.category,
          order_index: index
        });
      });
    }
    await db.exercises.bulkAdd(allExercises);
    console.log('✅ Exercises seeded');

    // Seed meals
    await db.meals.bulkAdd(mealsData);
    console.log('✅ Meals seeded');

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

export async function resetDatabase() {
  try {
    await db.meal_logs.clear();
    await db.exercise_logs.clear();
    await db.daily_logs.clear();
    await db.meals.clear();
    await db.exercises.clear();
    await db.workouts.clear();
    console.log('Database cleared');
    await seedDatabase();
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

export { workoutsData, exercisesData, mealsData };
