import { apiClient } from "./apiClient";
import { AuthResponse, LoginCredentials, User } from "@/types/auth";

const AUTH_STORAGE_KEY = "centavo_auth_token";
const USER_STORAGE_KEY = "centavo_user";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, response.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
      }
      return response;
    } catch {
      // Fallback mock para desarrollo cuando auth-service aún no está desplegado
      if (credentials.email && credentials.password.length >= 6) {
        const mockUser: User = {
          id: "user-1",
          email: credentials.email,
          name: credentials.email.split("@")[0] || "Usuario Centavo",
        };
        const mockResponse: AuthResponse = {
          user: mockUser,
          token: "mock-jwt-token-centavo",
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEY, mockResponse.token);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockResponse.user));
        }
        return mockResponse;
      }

      throw new Error("Credenciales inválidas. La contraseña debe tener al menos 6 caracteres.");
    }
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_STORAGE_KEY);
  },
};
