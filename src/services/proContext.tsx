import React, { createContext, useContext, useState, useEffect } from 'react';
import { isProUser } from './proService';

interface ProContextType {
  isPro: boolean;
  refreshPro: () => Promise<void>;
}

const ProContext = createContext<ProContextType>({
  isPro: false,
  refreshPro: async () => {},
});

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);

  const refreshPro = async () => {
    const pro = await isProUser();
    setIsPro(pro);
  };

  useEffect(() => {
    refreshPro();
  }, []);

  return (
    <ProContext.Provider value={{ isPro, refreshPro }}>
      {children}
    </ProContext.Provider>
  );
}

export function useProContext() {
  return useContext(ProContext);
}
