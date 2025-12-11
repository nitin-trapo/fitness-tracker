# Fitness Tracker

A client-side fitness tracking application for managing your workout and diet plans. All data is stored locally in your browser using IndexedDB.

## Features

- **Workout Tracking** - Push/Pull/Legs 6-day split with exercise completion
- **Diet Plan** - 8 meals/day weight gain program with meal tracking
- **Weight Tracking** - Log and visualize your weight progress
- **Water Intake** - Track daily water consumption
- **Exercise Timer** - Rest timer with presets for between sets
- **Daily Notes** - Add notes for each day
- **Progress Dashboard** - View streaks, stats, and charts
- **Offline Support** - All data stored locally, works without internet

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: IndexedDB (via Dexie.js) - client-side storage

## Prerequisites

- Node.js 18+

## Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Start the Application

```bash
cd client
npm run dev
```

### 3. Open the App

Visit `http://localhost:3000` in your browser.

The database will be automatically initialized with workout and diet data on first load.

## Project Structure

```
fitness-tracker/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WorkoutTracker.jsx
│   │   │   ├── DietTracker.jsx
│   │   │   ├── WeeklyView.jsx
│   │   │   ├── ProgressView.jsx
│   │   │   ├── ReportView.jsx
│   │   │   ├── SettingsView.jsx
│   │   │   └── Timer.jsx
│   │   ├── db/
│   │   │   ├── database.js  # Dexie database schema
│   │   │   └── seed.js      # Initial workout & diet data
│   │   ├── api.js           # Local database operations
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Workout Schedule

| Day | Type | Muscle Groups |
|-----|------|---------------|
| Monday | Push (Incline) | Chest, Shoulder, Triceps |
| Tuesday | Pull | Back, Traps, Biceps |
| Wednesday | Legs | Legs, Forearms, Abs |
| Thursday | Push (Flat) | Chest, Shoulder, Triceps |
| Friday | Pull (Variation) | Back, Traps, Biceps |
| Saturday | Legs | Legs, Forearms, Abs |
| Sunday | Rest | - |

## Diet Plan (Weight Gain)

| Time | Meal | Key Items |
|------|------|-----------|
| 5:30 AM | Pre-Workout | Banana, Dates, Almonds |
| 6:30 AM | Post-Workout | Mass Gainer, Daliya |
| 9:30 AM | Breakfast | Brown Bread, Peanut Butter, Banana |
| 1:00 PM | Lunch | Roti, Paneer, Dahi, Salad |
| 4:00 PM | Snack | Fruit |
| 6:00 PM | Pre-Dinner | Dates, Nuts, Protein Bar |
| 8:00 PM | Dinner | Roti, Subji, Rajma, Salad |
| 11:00 PM | Before Bed | Mass Gainer, Milk |

## Author

**Nitin Patoliya**

## License

MIT
