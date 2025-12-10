import db from './config.js';

function seedDatabase() {
  try {
    console.log('🌱 Seeding database...\n');

    // Clear existing data
    db.exec(`
      DELETE FROM meal_logs;
      DELETE FROM exercise_logs;
      DELETE FROM daily_logs;
      DELETE FROM meals;
      DELETE FROM exercises;
      DELETE FROM workouts;
    `);

    // ============ SEED WORKOUTS ============
    const workouts = [
      { day: 0, name: 'Sunday', type: 'Rest Day', muscles: [], isRest: true },
      { day: 1, name: 'Monday', type: 'Push Day (Incline)', muscles: ['Chest', 'Shoulder', 'Triceps'], isRest: false },
      { day: 2, name: 'Tuesday', type: 'Pull Day', muscles: ['Back', 'Traps', 'Biceps'], isRest: false },
      { day: 3, name: 'Wednesday', type: 'Legs Day', muscles: ['Legs', 'Forearms', 'Abs'], isRest: false },
      { day: 4, name: 'Thursday', type: 'Push Day (Flat)', muscles: ['Chest', 'Shoulder', 'Triceps'], isRest: false },
      { day: 5, name: 'Friday', type: 'Pull Day (Variation)', muscles: ['Back', 'Traps', 'Biceps'], isRest: false },
      { day: 6, name: 'Saturday', type: 'Legs Day', muscles: ['Legs', 'Forearms', 'Abs'], isRest: false }
    ];

    const insertWorkout = db.prepare(
      'INSERT INTO workouts (day_of_week, day_name, workout_type, muscle_groups, is_rest_day) VALUES (?, ?, ?, ?, ?)'
    );
    for (const w of workouts) {
      insertWorkout.run(w.day, w.name, w.type, JSON.stringify(w.muscles), w.isRest ? 1 : 0);
    }
    console.log('✅ Workouts seeded');

    // ============ SEED EXERCISES ============
    const exercises = {
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

    // Get workout IDs
    const workoutRows = db.prepare('SELECT id, day_of_week FROM workouts').all();
    const workoutMap = {};
    workoutRows.forEach(w => workoutMap[w.day_of_week] = w.id);

    // Insert exercises
    const insertExercise = db.prepare(
      'INSERT INTO exercises (workout_id, name, sets, reps, category, order_index) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const [dayOfWeek, exerciseList] of Object.entries(exercises)) {
      const workoutId = workoutMap[dayOfWeek];
      for (let i = 0; i < exerciseList.length; i++) {
        const ex = exerciseList[i];
        insertExercise.run(workoutId, ex.name, ex.sets, ex.reps, ex.category, i);
      }
    }
    console.log('✅ Exercises seeded');

    // ============ SEED MEALS (Diet Plan) ============
    const meals = [
      {
        name: 'Pre-Workout',
        time: '5:30 AM',
        type: 'pre_workout',
        items: [
          { name: '2 Banana', quantity: '2 pcs' },
          { name: 'Dates', quantity: '6 pcs' },
          { name: 'Almonds', quantity: '10 pcs' }
        ]
      },
      {
        name: 'Post-Workout',
        time: '6:30 AM',
        type: 'post_workout',
        items: [
          { name: 'Mass Gainer', quantity: '1 scoop' },
          { name: 'Milk', quantity: '300ml' },
          { name: 'Daliya', quantity: '30gm' }
        ]
      },
      {
        name: 'Breakfast',
        time: '9:30 AM',
        type: 'main',
        items: [
          { name: 'Brown Bread', quantity: '4 slices' },
          { name: 'Peanut Butter', quantity: '4 scoops' },
          { name: 'Banana', quantity: '1 pc' },
          { name: 'Multivitamin', quantity: '1 tab' }
        ]
      },
      {
        name: 'Lunch',
        time: '1:00 PM',
        type: 'main',
        items: [
          { name: 'Roti', quantity: '2-3 pcs' },
          { name: 'Paneer Subji', quantity: '100gm' },
          { name: 'Dahi', quantity: '1 bowl' },
          { name: 'Salad', quantity: '1 bowl' },
          { name: 'Butter Milk', quantity: '1 glass' }
        ]
      },
      {
        name: 'Evening Snack',
        time: '4:00 PM',
        type: 'snack',
        items: [
          { name: 'Any Fruit', quantity: '1 pc' }
        ]
      },
      {
        name: 'Pre-Dinner Snack',
        time: '6:00 PM',
        type: 'snack',
        items: [
          { name: 'Dates', quantity: '4 pcs' },
          { name: 'Almonds', quantity: '10 pcs' },
          { name: 'Cashew', quantity: '10 pcs' },
          { name: 'Protein Bar (Chocolate)', quantity: '1 pc' }
        ]
      },
      {
        name: 'Dinner',
        time: '8:00 PM',
        type: 'main',
        items: [
          { name: 'Roti', quantity: '2-3 pcs' },
          { name: 'Subji', quantity: '1 bowl' },
          { name: 'Rajma', quantity: '100gm' },
          { name: 'Salad', quantity: '1 bowl' },
          { name: 'Butter Milk', quantity: '1 glass' },
          { name: 'Fish Oil', quantity: '2 tabs' }
        ]
      },
      {
        name: 'Before Bed',
        time: '11:00 PM',
        type: 'night',
        items: [
          { name: 'Mass Gainer', quantity: '1 scoop' },
          { name: 'Milk', quantity: '300ml' }
        ]
      }
    ];

    const insertMeal = db.prepare(
      'INSERT INTO meals (name, time, meal_type, items, order_index) VALUES (?, ?, ?, ?, ?)'
    );
    for (let i = 0; i < meals.length; i++) {
      const meal = meals[i];
      insertMeal.run(meal.name, meal.time, meal.type, JSON.stringify(meal.items), i);
    }
    console.log('✅ Meals (Diet Plan) seeded');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}

seedDatabase();
