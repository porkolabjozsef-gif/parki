import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadState, saveState, WatchedApp, AppState as StorageAppState } from './storageService';

interface AppContextType {
  watchedApps: WatchedApp[];
  refreshApps: () => Promise<void>;
  updateApps: (apps: WatchedApp[]) => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  watchedApps: [],
  refreshApps: async () => {},
  updateApps: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [watchedApps, setWatchedApps] = useState<WatchedApp[]>([]);

  const refreshApps = async () => {
    const state = await loadState();
    setWatchedApps(state.watchedApps);
  };

  const updateApps = async (apps: WatchedApp[]) => {
    const state = await loadState();
    await saveState({ ...state, watchedApps: apps });
    setWatchedApps(apps);
  };

  useEffect(() => {
    refreshApps();
  }, []);

  return (
    <AppContext.Provider value={{ watchedApps, refreshApps, updateApps }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
