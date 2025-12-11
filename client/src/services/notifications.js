// Notification Service for Water and Diet Reminders

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.waterInterval = null;
    this.mealTimeouts = [];
  }

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check current permission status
  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Show a notification
  show(title, options = {}) {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return null;
    }

    const defaultOptions = {
      icon: '/fitness-tracker/app-icon.png',
      badge: '/fitness-tracker/app-icon.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) options.onClick();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
      
      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Water reminder - every hour
  startWaterReminders(intervalMinutes = 60) {
    this.stopWaterReminders();
    
    const intervalMs = intervalMinutes * 60 * 1000;
    
    this.waterInterval = setInterval(() => {
      const hour = new Date().getHours();
      // Only remind between 7 AM and 10 PM
      if (hour >= 7 && hour <= 22) {
        this.show('💧 Water Reminder', {
          body: 'Time to drink a glass of water! Stay hydrated.',
          tag: 'water-reminder'
        });
      }
    }, intervalMs);

    console.log(`Water reminders started: every ${intervalMinutes} minutes`);
  }

  // Stop water reminders
  stopWaterReminders() {
    if (this.waterInterval) {
      clearInterval(this.waterInterval);
      this.waterInterval = null;
    }
  }

  // Schedule meal reminders based on meal times
  scheduleMealReminders(meals) {
    this.clearMealReminders();

    meals.forEach(meal => {
      const reminderTime = this.parseTime(meal.time);
      if (!reminderTime) return;

      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(reminderTime.hours, reminderTime.minutes, 0, 0);

      // If time has passed today, skip
      if (scheduledTime <= now) return;

      const delay = scheduledTime.getTime() - now.getTime();
      
      const timeout = setTimeout(() => {
        this.show(`🍽️ ${meal.name} Time!`, {
          body: `It's time for your ${meal.name.toLowerCase()}. Don't skip your meal!`,
          tag: `meal-${meal.id}`
        });
      }, delay);

      this.mealTimeouts.push(timeout);
    });

    console.log(`Scheduled ${this.mealTimeouts.length} meal reminders for today`);
  }

  // Clear all meal reminders
  clearMealReminders() {
    this.mealTimeouts.forEach(timeout => clearTimeout(timeout));
    this.mealTimeouts = [];
  }

  // Parse time string like "9:30 AM" to hours and minutes
  parseTime(timeStr) {
    if (!timeStr) return null;
    
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  }

  // Stop all reminders
  stopAll() {
    this.stopWaterReminders();
    this.clearMealReminders();
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
