export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "error";
