import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from "@/services/auth-service";
import { clearAuthToken, getAuthToken } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!getAuthToken()) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        clearAuthToken();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      setUser,
      async login(payload) {
        const loggedInUser = await loginRequest(payload);
        setUser(loggedInUser);
        return loggedInUser;
      },
      async signup(payload) {
        const createdUser = await signupRequest(payload);
        setUser(createdUser);
        return createdUser;
      },
      async logout() {
        await logoutRequest();
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

