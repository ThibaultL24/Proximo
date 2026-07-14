// src/hooks/use-auth.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMe, login as apiLogin, logout as apiLogout, register as apiRegister } from "../api/auth";
import { getToken } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { email: string; password: string; first_name?: string; last_name?: string; phone?: string }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => apiLogout())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const loggedIn = await apiLogin(email, password);
    setUser(loggedIn);
    return loggedIn;
  }

  async function register(input: { email: string; password: string; first_name?: string; last_name?: string; phone?: string }) {
    const registered = await apiRegister(input);
    setUser(registered);
    return registered;
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
