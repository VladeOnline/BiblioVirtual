import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type BackendStatusContextValue = {
  isMock: boolean;
  checked: boolean;
};

const BackendStatusContext = createContext<BackendStatusContextValue | undefined>(undefined);

export function BackendStatusProvider({ children }: { children: React.ReactNode }) {
  const [isMock, setIsMock] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    fetch('/api/health', { method: 'GET', signal: controller.signal })
      .then(() => {
        if (!mounted) return;
        setIsMock(false);
        setChecked(true);
      })
      .catch(() => {
        if (!mounted) return;
        setIsMock(true);
        setChecked(true);
      });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const value = useMemo(() => ({ isMock, checked }), [isMock, checked]);

  return <BackendStatusContext.Provider value={value}>{children}</BackendStatusContext.Provider>;
}

export function useBackendStatus() {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error('useBackendStatus must be used within BackendStatusProvider');
  }
  return context;
}

