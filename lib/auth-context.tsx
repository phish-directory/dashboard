"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  useExtended: boolean;
};

type LoginResult = {
  success?: boolean;
  error?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult | void>;
  logout: () => void;
};

let API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.phish.directory"
    : "http://localhost:3000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token in localStorage
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("phishDirectoryToken");
        if (storedToken) {
          setToken(storedToken);
          await fetchUserProfile(storedToken);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If the token is invalid, clear it
        localStorage.removeItem("phishDirectoryToken");
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Clear invalid token
      localStorage.removeItem("phishDirectoryToken");
      setToken(null);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loginUrl = `${API_BASE_URL}/user/login`;

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      try {
        // Parse the JSON response - do this once and store the result
        const data = await response.json();

        // Check if response is not OK (non-2xx status code)
        if (!response.ok) {
          console.log("Login failed with status:", response.status);
          console.log("Error data from API:", data);

          // For 400 errors on login, display a user-friendly message
          if (response.status === 400) {
            return { error: "Invalid email or password" };
          }

          // For other errors, use the error message from the response
          return { error: data.message || "Login failed" };
        }

        // If we got here, the response was successful
        const { token: authToken } = data;

        // Save token to localStorage
        localStorage.setItem("phishDirectoryToken", authToken);
        setToken(authToken);

        // Fetch user profile
        await fetchUserProfile(authToken);
        return { success: true };
      } catch (e) {
        console.log("Failed to parse response:", e);
        return { error: "Login failed. Please try again." };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { error: "An unexpected error occurred. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("phishDirectoryToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
