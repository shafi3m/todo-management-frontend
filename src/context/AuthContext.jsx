import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "todo_auth_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await getCurrentUser();

        if (!cancelled) {
          setUser(response?.data || null);
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    const receivedToken = response?.data?.token;

    if (!receivedToken) {
      throw new Error("Login response did not contain a token");
    }

    setToken(receivedToken);

    return response;
  };

  const register = async (userData) => {
    return registerUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
    }),
    [token, user, isAuthenticated, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
