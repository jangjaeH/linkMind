"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { AuthUser } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ error?: string }>;
  signup: (input: {
    username: string;
    email: string;
    name: string;
    password: string;
  }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include"
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = (await response.json()) as { user: AuthUser };
        setUser(data.user);
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login: async (identifier: string, password: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ identifier, password })
      });

      const data = (await response.json()) as { user?: AuthUser; message?: string };

      if (!response.ok || !data.user) {
        return { error: data.message ?? "로그인에 실패했습니다." };
      }

      setUser(data.user);
      return {};
    },
    signup: async (input) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(input)
      });

      const data = (await response.json()) as { user?: AuthUser; message?: string };

      if (!response.ok || !data.user) {
        return { error: data.message ?? "회원가입에 실패했습니다." };
      }

      setUser(data.user);
      return {};
    },
    logout: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
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
