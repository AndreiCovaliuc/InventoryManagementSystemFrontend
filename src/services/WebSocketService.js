import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
    this.isConnecting = false;
    this.lastConnectionAttempt = 0;
  }

  connect(token, companyId, onPresenceUpdate, onEntityUpdate) {
    // Already connected or connecting
    if (this.client && (this.client.connected || this.isConnecting)) {
      console.log('WebSocket: Already connected or connecting, skipping');
      return;
    }

    // Prevent rapid reconnection attempts (wait at least 5 seconds between attempts)
    const now = Date.now();
    if (now - this.lastConnectionAttempt < 5000) {
      console.log('WebSocket: Too soon to reconnect, skipping');
      return;
    }
    this.lastConnectionAttempt = now;

    this.isConnecting = true;

    this.client = new Client({
      // Use SockJS endpoint for better compatibility
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('WebSocket connected successfully!');
        this.isConnecting = false;

        // Subscribe to presence updates for the company
        this.subscriptions.presence = this.client.subscribe(
          `/topic/presence/${companyId}`,
          (message) => {
            const update = JSON.parse(message.body);
            console.log('Presence update received:', update);
            if (onPresenceUpdate) {
              onPresenceUpdate(update);
            }
          }
        );

        // Subscribe to entity updates for the company
        this.subscriptions.updates = this.client.subscribe(
          `/topic/updates/${companyId}`,
          (message) => {
            const update = JSON.parse(message.body);
            console.log('Entity update received:', update);
            if (onEntityUpdate) {
              onEntityUpdate(update);
            }
          }
        );
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        console.error('Details:', frame.body);
        this.isConnecting = false;
      },

      onWebSocketClose: (event) => {
        console.log('WebSocket connection closed', event);
        this.isConnecting = false;
      },

      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
      }
    });

    this.client.activate();
  }

  disconnect() {
    this.isConnecting = false;
    if (this.client) {
      // Unsubscribe from all subscriptions
      Object.values(this.subscriptions).forEach(sub => {
        if (sub) sub.unsubscribe();
      });
      this.subscriptions = {};

      this.client.deactivate();
      this.client = null;
      console.log('WebSocket disconnected');
    }
  }

  isConnected() {
    return this.client && this.client.connected;
  }

  isConnectingOrConnected() {
    return this.isConnecting || (this.client && this.client.connected);
  }
}

export default new WebSocketService();
