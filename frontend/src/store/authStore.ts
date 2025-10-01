import { create } from "zustand";
import axios from "axios";
import { backendUrl } from "@/lib/backendUrl";

export const axiosClient = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthCredentials {
  name?: string;
  email: string;
  password: string;
  dob?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean; // Add this

  signupUser: (userData: AuthCredentials) => Promise<void>;
  loginUser: (userData: AuthCredentials) => Promise<void>;
  logoutUser: () => Promise<void>;
  profile: () => Promise<User | null>;
  initializeAuth: () => Promise<void>; // Add this
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false, // Track if auth state has been initialized

  signupUser: async (userData) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.post("/api/auth/register", userData, {
        withCredentials: true,
      });
      set({ user: res.data.user, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Signup failed",
        loading: false,
      });
      throw err;
    }
  },

  loginUser: async (userData) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.post("/api/auth/login", userData);
      set({ user: res.data.user, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
      throw err;
    }
  },

  logoutUser: async () => {
    try {
      set({ loading: true, error: null });
      await axiosClient.post("/api/auth/logout", {}, { withCredentials: true });
      set({ user: null, loading: false, initialized: true });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Logout failed",
        loading: false,
      });
      throw err;
    }
  },

  profile: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get("/api/auth/profile", {
        withCredentials: true,
      });
      const apiUser = res.data.user;
      const normalized = apiUser
        ? { id: apiUser.id || apiUser._id, name: apiUser.name, email: apiUser.email }
        : null;
      set({ user: normalized, loading: false });
      return normalized;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Profile fetch failed",
        loading: false,
      });
      set({ user: null });
      return null;
    }
  },

  // Temporary debug version of your initializeAuth
  initializeAuth: async () => {
    if (get().initialized) return;

    try {
      set({ loading: true, error: null });
      console.log("Fetching profile...");

      const res = await axiosClient.get("/api/auth/profile");
      console.log("Profile response:", res.data);

      const apiUser = res.data.user;
      const normalized = apiUser
        ? { id: apiUser.id || apiUser._id, name: apiUser.name, email: apiUser.email }
        : null;
      set({ user: normalized, loading: false, initialized: true });
    } catch (err: any) {
      console.log("Profile fetch error:", err.response?.data);
      set({
        user: null,
        loading: false,
        initialized: true,
        error: null,
      });
    }
  },
}));
