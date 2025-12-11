// Real-time sync service using Server-Sent Events (SSE)

class RealtimeSyncService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnected = false;
  }

  // Connect to SSE endpoint
  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    const baseUrl = window.location.origin;
    const sseUrl = `${baseUrl}/fitness-tracker/api/events`;
    
    try {
      this.eventSource = new EventSource(sseUrl);
      
      this.eventSource.onopen = () => {
        console.log('SSE connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners('connection', { status: 'connected' });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        this.isConnected = false;
        this.notifyListeners('connection', { status: 'disconnected' });
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
    }
  }

  // Disconnect from SSE
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, timestamp } = data;
    
    switch (type) {
      case 'connected':
        console.log('SSE connection confirmed');
        break;
      case 'heartbeat':
        // Keep-alive, no action needed
        break;
      case 'daily-log':
      case 'exercise':
      case 'meal':
        // Notify listeners about data update
        this.notifyListeners('data-update', data);
        break;
      default:
        console.log('Unknown SSE message type:', type);
    }
  }

  // Add event listener
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in SSE listener:', error);
        }
      });
    }
  }

  // Check connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
const realtimeSyncService = new RealtimeSyncService();

export default realtimeSyncService;
