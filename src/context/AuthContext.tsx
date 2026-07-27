import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';
import * as authApi from '../api/auth';
import { getProfile } from '../api/users';
import { setOnLogout } from '../api/client';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  registerUser: (payload: RegisterPayload) => Promise<string>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user !== null;

  const storeAuthData = useCallback(async (authResponse: AuthResponse) => {
    await SecureStore.setItemAsync('accessToken', authResponse.accessToken);
    await SecureStore.setItemAsync('refreshToken', authResponse.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(authResponse.user));
    setUser(authResponse.user);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    await storeAuthData(response);
  }, [storeAuthData]);

  const registerUser = useCallback(async (payload: RegisterPayload): Promise<string> => {
    const response = await authApi.register(payload);
    return response.message;
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      SecureStore.setItemAsync('user', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const userStr = await SecureStore.getItemAsync('user');
        const token = await SecureStore.getItemAsync('accessToken');
        if (userStr && token) {
          const stored = JSON.parse(userStr);
          setUser(stored);

          // Background sync: fetch fresh profile to update avatar/username
          getProfile()
            .then((fresh) => {
              if (fresh.avatar !== stored.avatar || fresh.username !== stored.username) {
                const updated = { ...stored, avatar: fresh.avatar, username: fresh.username };
                setUser(updated);
                SecureStore.setItemAsync('user', JSON.stringify(updated)).catch(() => {});
              }
            })
            .catch(() => { /* silent */ });
        }
      } catch {
        // Invalid stored data, remain logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Register forced logout callback for 401 refresh failures
  useEffect(() => {
    setOnLogout(() => {
      setUser(null);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, registerUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
