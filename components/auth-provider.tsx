"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { AUTH_COOKIE, AuthUser, demoUser } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const hasCookie = document.cookie.includes(`${AUTH_COOKIE}=authenticated`);

    if (hasCookie) {
      setUser(demoUser);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    login: (email: string) => {
      document.cookie = `${AUTH_COOKIE}=authenticated; path=/; max-age=${60 * 60 * 24 * 7}`;
      setUser({
        ...demoUser,
        email
      });
    },
    logout: () => {
      document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
      setUser(null);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
