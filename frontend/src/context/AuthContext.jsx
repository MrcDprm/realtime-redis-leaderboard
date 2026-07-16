import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api/client';
import { connectSocket, disconnectSocket } from '../socket';

const AuthContext = createContext(null);

const TOKEN_KEY = 'nexus_token';
const USER_KEY = 'nexus_user';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(loadStoredUser);

  useEffect(() => {
    if (token) {
      connectSocket();
    }
  }, [token]);

  const persist = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    connectSocket();
  }, []);

  const register = useCallback(
    async (payload) => {
      const data = await api.register(payload);
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const login = useCallback(
    async (payload) => {
      const data = await api.login(payload);
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      register,
      login,
      logout,
    }),
    [token, user, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
