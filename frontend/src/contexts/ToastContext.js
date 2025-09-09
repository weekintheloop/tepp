import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toaster } from '../components/ui/toaster';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 5000,
    action
  }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = {
      id,
      title,
      description,
      variant,
      duration,
      action,
      createdAt: Date.now()
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const toast = useCallback((props) => {
    if (typeof props === 'string') {
      return addToast({ title: props });
    }
    return addToast(props);
  }, [addToast]);

  const success = useCallback((title, description) => {
    return addToast({
      title,
      description,
      variant: 'default',
      duration: 4000
    });
  }, [addToast]);

  const error = useCallback((title, description) => {
    return addToast({
      title,
      description,
      variant: 'destructive',
      duration: 6000
    });
  }, [addToast]);

  const warning = useCallback((title, description) => {
    return addToast({
      title,
      description,
      variant: 'default',
      duration: 5000
    });
  }, [addToast]);

  const info = useCallback((title, description) => {
    return addToast({
      title,
      description,
      variant: 'default',
      duration: 4000
    });
  }, [addToast]);

  const loading = useCallback((title, description) => {
    return addToast({
      title,
      description,
      variant: 'default',
      duration: 0 // Persistent until manually removed
    });
  }, [addToast]);

  const value = {
    toasts,
    toast,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info,
    loading
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};