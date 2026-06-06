import { API_BASE_URL } from '../config';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import websocketService from '../services/WebSocketService';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const PresenceContext = createContext();

export const usePresence = () => useContext(PresenceContext);

export const PresenceProvider = ({ children }) => {
  // Drive the WebSocket lifecycle off auth state so it reconnects on
  // login-within-SPA and tears down on logout (not just on page mount).
  const { currentUser } = useContext(AuthContext);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [entityUpdateTrigger, setEntityUpdateTrigger] = useState(0);
  const [lastEntityUpdate, setLastEntityUpdate] = useState(null);

  // Fetch initial online users from REST API
  const fetchOnlineUsers = useCallback(async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/presence/online`, {
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
        // Handle different possible formats from backend. Normalize every id to
        // a Number so Set membership matches the numeric ids the UI checks with.
        const userIds = response.data
          .map(user => (typeof user === 'number' ? user : user.id ?? user.userId ?? user.user_id))
          .map(Number)
          .filter(id => !Number.isNaN(id));
        console.log('PresenceContext: Setting online user IDs:', userIds);
        setOnlineUsers(new Set(userIds));
      }
    } catch (error) {
      console.error('PresenceContext: Error fetching online users:', error);
    }
  }, []);

  // (Re)connect whenever the authenticated session changes. Depending on the
  // primitive token/companyId (not the currentUser object) means we reconnect
  // on login and tear down on logout, but don't churn the socket when unrelated
  // fields of currentUser change (e.g. the /me role merge).
  const token = currentUser?.token;
  const companyId = currentUser?.companyId;

  useEffect(() => {
    if (!token || !companyId) {
      // Logged out (or session not ready): ensure no stale connection/state.
      console.log('PresenceContext: No active session, disconnecting WebSocket');
      websocketService.disconnect();
      setOnlineUsers(new Set());
      return;
    }

    // Handle presence updates pushed over WebSocket. Tolerate different payload
    // shapes (userId/id/user_id, online boolean or status string) and normalize
    // the id to a Number to match what isUserOnline checks against.
    const handlePresenceUpdate = (update) => {
      console.log('PresenceContext: Received presence update:', update);
      const rawId = update.userId ?? update.id ?? update.user_id;
      const userId = Number(rawId);
      if (Number.isNaN(userId)) return;

      const isOnline =
        typeof update.online === 'boolean'
          ? update.online
          : String(update.status).toUpperCase() === 'ONLINE';

      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
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

    console.log('PresenceContext: Connecting to WebSocket...', { companyId });
    websocketService.connect(token, companyId, handlePresenceUpdate, handleEntityUpdate);

    // Fetch initial online users once the connection has had a moment to open.
    const fetchTimeout = setTimeout(() => {
      fetchOnlineUsers(token);
    }, 500);

    return () => {
      clearTimeout(fetchTimeout);
      websocketService.disconnect();
      setOnlineUsers(new Set());
    };
  }, [token, companyId, fetchOnlineUsers]);

  const isUserOnline = (userId) => {
    return onlineUsers.has(Number(userId));
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
