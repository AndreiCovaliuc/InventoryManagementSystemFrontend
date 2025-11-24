import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import websocketService from '../services/WebSocketService';
import axios from 'axios';

const PresenceContext = createContext();

export const usePresence = () => useContext(PresenceContext);

export const PresenceProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [entityUpdateTrigger, setEntityUpdateTrigger] = useState(0);
  const [lastEntityUpdate, setLastEntityUpdate] = useState(null);

  // Fetch initial online users from REST API
  const fetchOnlineUsers = useCallback(async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/api/presence/online', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('PresenceContext: Fetched online users:', response.data);
      if (response.data && Array.isArray(response.data)) {
        // Log the first item to see its structure
        if (response.data.length > 0) {
          console.log('PresenceContext: First user object:', response.data[0]);
        }
        // Handle different possible formats from backend
        const userIds = response.data.map(user => {
          // If it's a number, use it directly
          if (typeof user === 'number') return user;
          // Otherwise try various property names
          return user.id || user.userId || user.user_id;
        });
        console.log('PresenceContext: Setting online user IDs:', userIds);
        setOnlineUsers(new Set(userIds));
      }
    } catch (error) {
      console.error('PresenceContext: Error fetching online users:', error);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    // Get user data from localStorage (token is stored inside user object)
    const userStr = localStorage.getItem('user');

    console.log('PresenceContext: Checking for user data...', { hasUser: !!userStr });

    if (!userStr) {
      console.log('PresenceContext: No user found, skipping WebSocket connection');
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (err) {
      console.error('PresenceContext: Error parsing user data:', err);
      return;
    }

    const token = user.token;
    const companyId = user.companyId;

    console.log('PresenceContext: User data:', { hasToken: !!token, companyId });

    if (!token) {
      console.log('PresenceContext: No token found in user data, skipping WebSocket connection');
      return;
    }

    if (!companyId) {
      console.log('PresenceContext: No companyId found, skipping WebSocket connection');
      return;
    }

    // Handle presence updates
    const handlePresenceUpdate = (update) => {
      console.log('PresenceContext: Received presence update:', update);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (update.online) {
          newSet.add(update.userId);
        } else {
          newSet.delete(update.userId);
        }
        console.log('PresenceContext: Online users now:', Array.from(newSet));
        return newSet;
      });
    };

    // Handle entity updates (products, categories, inventory, etc.)
    const handleEntityUpdate = (update) => {
      console.log('PresenceContext: Received entity update:', update);
      setLastEntityUpdate(update);
      setEntityUpdateTrigger(prev => prev + 1);
    };

    // Connect to WebSocket
    console.log('PresenceContext: Connecting to WebSocket...');
    websocketService.connect(token, companyId, handlePresenceUpdate, handleEntityUpdate);
    setIsConnected(true);

    // Fetch initial online users after a short delay to ensure connection is established
    setTimeout(() => {
      fetchOnlineUsers(token);
    }, 500);
  }, [fetchOnlineUsers]);

  useEffect(() => {
    // Use a small delay to handle React StrictMode double-mount
    const timeoutId = setTimeout(() => {
      connectWebSocket();
    }, 100);

    // Listen for logout (user removed from localStorage)
    const handleStorageChange = (e) => {
      if (e.key === 'user' && !e.newValue) {
        console.log('PresenceContext: User logged out, disconnecting WebSocket');
        websocketService.disconnect();
        setOnlineUsers(new Set());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      websocketService.disconnect();
    };
  }, [connectWebSocket]);

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <PresenceContext.Provider value={{
      onlineUsers,
      isUserOnline,
      entityUpdateTrigger,
      lastEntityUpdate
    }}>
      {children}
    </PresenceContext.Provider>
  );
};

export default PresenceContext;
