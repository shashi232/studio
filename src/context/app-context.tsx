"use client";

import React, { createContext, useState, useCallback, ReactNode } from 'react';

interface AppContextType {
  isFallDetected: boolean;
  triggerFallAlert: () => void;
  dismissFallAlert: () => void;
}

export const AppContext = createContext<AppContextType>({
  isFallDetected: false,
  triggerFallAlert: () => {},
  dismissFallAlert: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isFallDetected, setIsFallDetected] = useState(false);

  const triggerFallAlert = useCallback(() => {
    setIsFallDetected(true);
  }, []);

  const dismissFallAlert = useCallback(() => {
    setIsFallDetected(false);
  }, []);

  return (
    <AppContext.Provider value={{ isFallDetected, triggerFallAlert, dismissFallAlert }}>
      {children}
    </AppContext.Provider>
  );
};
