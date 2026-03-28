import { useEffect, useMemo, useState } from 'react';

import { apiRequest, authHeaders } from '../lib/api.js';
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

  useEffect(() => {
    if (!authState.token) {
      return;
    }

    let isMounted = true;

    const refreshSession = async () => {
      try {
        const data = await apiRequest('/auth/me', {
          headers: authHeaders(authState.token),
        });

        if (!isMounted) {
          return;
        }

        setAuthState((current) => ({
          ...current,
          user: data.user,
        }));
      } catch {
        if (!isMounted) {
          return;
        }

        setAuthState({
          token: null,
          user: null,
        });
      }
    };

    refreshSession();

    return () => {
      isMounted = false;
    };
  }, [authState.token]);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(authState.token),
    token: authState.token,
    user: authState.user,
    async refreshUser() {
      if (!authState.token) {
        return null;
      }

      const data = await apiRequest('/auth/me', {
        headers: authHeaders(authState.token),
      });

      setAuthState((current) => ({
        ...current,
        user: data.user,
      }));

      return data.user;
    },
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
