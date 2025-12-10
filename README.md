# Fitness Tracker

A full-stack fitness tracking application for managing your workout and diet plans.

## Features

- **Workout Tracking** - Push/Pull/Legs 6-day split with exercise completion
- **Diet Plan** - 8 meals/day weight gain program with meal tracking
- **Weight Tracking** - Log and visualize your weight progress
- **Water Intake** - Track daily water consumption
- **Exercise Timer** - Rest timer with presets for between sets
- **Daily Notes** - Add notes for each day
- **Progress Dashboard** - View streaks, stats, and charts

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MySQL

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+

## Setup Instructions

### 1. Database Setup

Make sure MySQL is running, then update the `.env` file in the `server` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fitness_tracker
DB_PORT=3306
PORT=5000
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Initialize Database

```bash
cd server
npm run db:init
npm run db:seed
```

### 4. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```

### 5. Open the App

Visit `http://localhost:3000` in your browser.

## Project Structure

```
fitness-tracker/
├── server/                 # Backend API
│   ├── db/
│   │   ├── config.js      # Database connection
│   │   ├── init.js        # Create tables
│   │   └── seed.js        # Seed workout & diet data
│   ├── index.js           # Express server & routes
│   ├── package.json
│   └── .env
│
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WorkoutTracker.jsx
│   │   │   ├── DietTracker.jsx
│   │   │   ├── WeeklyView.jsx
│   │   │   ├── ProgressView.jsx
│   │   │   └── Timer.jsx
│   │   ├── api.js         # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/today` | Get today's workout, meals, and log |
| GET | `/api/day/:date` | Get data for specific date |
| GET | `/api/workouts` | Get all workout templates |
| GET | `/api/meals` | Get all meal templates |
| PUT | `/api/daily-log/:date` | Update weight, water, notes |
| POST | `/api/exercise-log` | Toggle exercise completion |
| POST | `/api/meal-log` | Toggle meal completion |
| GET | `/api/progress` | Get weight history |
| GET | `/api/streak` | Get current streak count |

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
