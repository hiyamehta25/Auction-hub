import { create } from "zustand";
import { User } from "@workspace/api-client-react";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("auction_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("auction_token"),
  isAuthenticated: !!localStorage.getItem("auction_token"),
  login: (user, token) => {
    localStorage.setItem("auction_token", token);
    localStorage.setItem("auction_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("auction_token");
    localStorage.removeItem("auction_user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
