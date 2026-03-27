import { useEffect, useMemo, useState } from 'react';

import { AuthContext } from './auth-context.js';

const AUTH_STORAGE_KEY = 'rewear-auth';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedValue) {
      return {
        token: null,
        user: null,
      };
    }

    try {
      return JSON.parse(storedValue);
    } catch {
      return {
        token: null,
        user: null,
      };
    }
  });

  useEffect(() => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(authState.token),
    token: authState.token,
    user: authState.user,
    setAuth(session) {
      setAuthState(session);
    },
    signOut() {
      setAuthState({
        token: null,
        user: null,
      });
    },
  }), [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
