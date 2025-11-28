// contexts/NotificationContext.js - Global notification/toast context

'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
};

function notificationReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            ...action.payload,
          },
        ],
      };
    case 'REMOVE':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case 'CLEAR':
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

/**
 * NotificationProvider - Provides global notification state
 */
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((notification) => {
    const id = dispatch({ type: 'ADD', payload: notification });
    
    // Auto-remove after duration (default 5 seconds)
    if (notification.duration !== false) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        dispatch({ type: 'REMOVE', payload: Date.now() });
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Custom hook to use notifications
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  return {
    ...context,
    success: (message, options = {}) =>
      context.addNotification({ type: 'success', message, ...options }),
    error: (message, options = {}) =>
      context.addNotification({ type: 'error', message, ...options }),
    warning: (message, options = {}) =>
      context.addNotification({ type: 'warning', message, ...options }),
    info: (message, options = {}) =>
      context.addNotification({ type: 'info', message, ...options }),
  };
}

export default NotificationContext;
