"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services/authService";
import { LoginCredentials } from "@/types/auth";

export function useAuth() {
  const { user, token, status, error, setAuth, clearAuth, setStatus, setError } =
    useAuthStore();

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getToken();
    if (storedUser && storedToken) {
      setAuth(storedUser, storedToken);
    } else {
      clearAuth();
    }
  }, [setAuth, clearAuth]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setStatus("loading");
    setError(null);
    try {
      const response = await authService.login(credentials);
      setAuth(response.user, response.token);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    clearAuth();
  };

  return {
    user,
    token,
    status,
    error,
    isAuthenticated: !!user,
    isLoading: status === "loading",
    login,
    logout,
  };
}
