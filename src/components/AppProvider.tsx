"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AppContextType {
  locationLabel: string;
  vaultRoot: string;
  pinCode?: string;
}

const AppContext = createContext<AppContextType>({
  locationLabel: "Local",
  vaultRoot: "",
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppContextType>({ locationLabel: "Local", vaultRoot: "" });

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((c) => setConfig({ locationLabel: c.locationLabel || "Local", vaultRoot: c.vaultRoot || "", pinCode: c.pinCode }))
      .catch(() => {});
  }, []);

  const value = React.useMemo(() => config, [config]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppContext);
}
