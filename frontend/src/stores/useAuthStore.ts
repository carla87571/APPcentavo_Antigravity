import { create } from "zustand";
import { AuthStatus, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  error: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: "idle",
  error: null,
  setAuth: (user, token) =>
    set({
      user,
      token,
      status: "authenticated",
      error: null,
    }),
  clearAuth: () =>
    set({
      user: null,
      token: null,
      status: "unauthenticated",
      error: null,
    }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: error ? "error" : "idle" }),
}));
