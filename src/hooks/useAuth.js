import { useState, useEffect } from 'react';
import { subscribeToAuth } from '../auth';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    return unsubscribe;
  }, []);

  return { user, loading: user === undefined };
}
