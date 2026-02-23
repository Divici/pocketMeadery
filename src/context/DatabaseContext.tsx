import React, { createContext, useContext, useEffect, useState } from 'react';
import { openDatabase, type Database } from '../db';

type DatabaseContextValue = {
  db: Database | null;
  error: Error | null;
  ready: boolean;
};

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  error: null,
  ready: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    openDatabase()
      .then(setDb)
      .catch(setError)
      .finally(() => setReady(true));
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, error, ready }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider');
  return ctx;
}
