import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import { backendUrl } from "@/lib/backendUrl";

// Create axios client with default config
export const axiosClient = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // Important for cookies
  timeout: 10000,
});

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  dob?: string;
  createdAt?: string;
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
  initialized: boolean;

  // Actions
  signupUser: (userData: AuthCredentials) => Promise<void>;
  loginUser: (userData: AuthCredentials) => Promise<void>;
  logoutUser: () => Promise<void>;
  profile: () => Promise<User | null>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
  clearError: () => void;
}

// Helper function to normalize user data
const normalizeUser = (apiUser: any): User | null => {
  if (!apiUser) return null;
  
  return {
    id: apiUser.id || apiUser._id,
    _id: apiUser._id || apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    avatar: apiUser.avatar,
    dob: apiUser.dob,
    createdAt: apiUser.createdAt,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      loading: false,
      error: null,
      initialized: false,

      signupUser: async (userData: AuthCredentials) => {
        try {
          set({ loading: true, error: null });
          
          const res = await axiosClient.post("/api/auth/register", userData);
          
          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            set({ 
              user, 
              loading: false,
              error: null 
            });
          } else {
            throw new Error(res.data.message || "Signup failed");
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Signup failed";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      loginUser: async (userData: AuthCredentials) => {
        try {
          set({ loading: true, error: null });
          
          const res = await axiosClient.post("/api/auth/login", userData);
          
          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            set({ 
              user, 
              loading: false,
              error: null 
            });
          } else {
            throw new Error(res.data.message || "Login failed");
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Login failed";
          set({
            error: errorMessage,
            loading: false,
          });
          throw new Error(errorMessage);
        }
      },

      logoutUser: async () => {
        try {
          set({ loading: true, error: null });
          
          const res = await axiosClient.post("/api/auth/logout");
          
          if (res.data.success) {
            set({ 
              user: null, 
              loading: false,
              error: null,
              initialized: true 
            });
          } else {
            throw new Error(res.data.message || "Logout failed");
          }
        } catch (err: any) {
          // Even if logout request fails, clear local state
          set({ 
            user: null, 
            loading: false,
            initialized: true 
          });
          console.error("Logout error:", err);
        }
      },

      profile: async (): Promise<User | null> => {
        try {
          set({ loading: true, error: null });
          
          const res = await axiosClient.get("/api/auth/profile");
          
          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            set({ 
              user, 
              loading: false,
              error: null 
            });
            return user;
          } else {
            throw new Error(res.data.message || "Profile fetch failed");
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Profile fetch failed";
          set({
            error: errorMessage,
            loading: false,
            user: null,
          });
          return null;
        }
      },

      initializeAuth: async () => {
        // Skip if already initialized
        if (get().initialized) return;

        try {
          set({ loading: true, error: null });
          
          const res = await axiosClient.get("/api/auth/profile");
          
          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            set({ 
              user, 
              loading: false,
              initialized: true,
              error: null 
            });
          } else {
            throw new Error(res.data.message || "Profile fetch failed");
          }
        } catch (err: any) {
          // Silent fail - user is not authenticated
          set({
            user: null,
            loading: false,
            initialized: true,
            error: null, // Don't show error for initial auth check
          });
        }
      },

      clearAuth: () => {
        set({
          user: null,
          error: null,
          loading: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        initialized: state.initialized 
      }),
    }
  )
);

// Optional: Add response interceptor for automatic auth handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);