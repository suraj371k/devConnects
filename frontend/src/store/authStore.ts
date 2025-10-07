import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import { backendUrl } from "@/lib/backendUrl";

// Axios client setup
export const axiosClient = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  timeout: 10000,
});

interface Experience {
  _id: string;
  title?: string;
  company: string;
  description: string;
  from: string;
  to: string;
}

interface Follower {
  _id: string;
  name: string;
  email: string;
}

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  dob?: string;
  about?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  experience: Experience[];
  followers: Follower[];
  following: Follower[];
  createdAt?: string;
  updatedAt?: string;
}

interface AuthCredentials {
  name?: string;
  email: string;
  password: string;
  dob?: string;
}

interface UpdateProfileData {
  about?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  experience?: Experience[];
}

interface AuthState {
  user: User | null;
  profileUser?: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  signupUser: (
    userData: AuthCredentials
  ) => Promise<{ success: boolean; message?: string }>;
  loginUser: (
    userData: AuthCredentials
  ) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => Promise<{ success: boolean; message?: string }>;
  profile: () => Promise<User | null>;
  initializeAuth: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; message?: string }>;
  getProfileById: (id: string) => Promise<User | null>
  clearAuth: () => void;
  clearError: () => void;
}

const normalizeUser = (apiUser: any): User | null => {
  if (!apiUser) return null;

  return {
    id: apiUser.id || apiUser._id,
    _id: apiUser._id || apiUser.id,
    name: apiUser.name || "",
    email: apiUser.email || "",
    avatar: apiUser.avatar,
    dob: apiUser.dob,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    about: apiUser.about,
    location: apiUser.location,
    github: apiUser.github,
    linkedin: apiUser.linkedin,
    website: apiUser.website || apiUser.websites, // Handle both 'website' and 'websites'
    experience: apiUser.experience || [],
    followers: apiUser.followers || [],
    following: apiUser.following || [],
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  profileUser: null,
      loading: false,
      error: null,
      initialized: false,

      signupUser: async (userData) => {
        try {
          set({ loading: true, error: null });
          const res = await axiosClient.post("/api/auth/register", userData);

          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            set({ user, loading: false });
            return { success: true, message: "Signup successful" };
          } else {
            const message = res.data.message || "Signup failed";
            set({ loading: false, error: message });
            return { success: false, message };
          }
        } catch (err: any) {
          const message = err.response?.data?.message || "Signup failed";
          set({ loading: false, error: message });
          return { success: false, message };
        }
      },

      getProfileById: async (id: string) => {
        try {
          set({ loading: true, error: null });
          const res = await axiosClient.get(`/api/user/${id}`);
          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            // set the fetched profile into profileUser so we don't overwrite
            // the authenticated `user` in the store
            set({ profileUser: user, loading: false });
            return user;
          } else {
            set({ loading: false, error: res.data.message || "User not found" });
            return null;
          }
        } catch (err: any) {
          set({ loading: false, error: err?.response?.data?.message || "Failed to fetch user" });
          return null;
        }
      },

      loginUser: async (userData) => {
        try {
          set({ loading: true, error: null });
          const res = await axiosClient.post("/api/auth/login", userData);

          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            set({ user, loading: false });
            return { success: true, message: "Login successful" };
          } else {
            const message = res.data.message || "Login failed";
            set({ loading: false, error: message });
            return { success: false, message };
          }
        } catch (err: any) {
          const message = err.response?.data?.message || "Login failed";
          set({ loading: false, error: message });
          return { success: false, message };
        }
      },

      logoutUser: async () => {
        try {
          set({ loading: true, error: null });
          const res = await axiosClient.post("/api/auth/logout");
          if (res.data.success) {
            set({ user: null, loading: false });
            return { success: true, message: "Logout successful" };
          } else {
            return {
              success: false,
              message: res.data.message || "Logout failed",
            };
          }
        } catch (err: any) {
          set({ user: null, loading: false });
          return { success: false, message: "Logout failed" };
        }
      },

      profile: async () => {
        try {
          set({ loading: true, error: null });
          const res = await axiosClient.get("/api/auth/profile");

          console.log("Full profile response:", res.data);

          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            console.log("Normalized user:", user);
            set({ user, loading: false });
            return user;
          } else {
            set({ user: null, loading: false });
            return null;
          }
        } catch (err) {
          console.error("Profile error:", err);
          set({ user: null, loading: false });
          return null;
        }
      },

      updateProfile: async (data: UpdateProfileData) => {
        try {
          set({ loading: true, error: null });
          
          // Prepare the data for the backend
          const updateData: any = { ...data };
          
          // Handle the website field mapping (frontend uses 'website', backend might use 'websites')
          if (data.website) {
            updateData.websites = data.website;
            delete updateData.website;
          }

          const res = await axiosClient.put("/api/auth/update-profile", updateData);

          if (res.data.success || res.data.message === "Profile updated successfully") {
            const user = normalizeUser(res.data.user);
            set({ user, loading: false, error: null });
            return { success: true, message: "Profile updated successfully" };
          } else {
            const message = res.data.message || "Profile update failed";
            set({ loading: false, error: message });
            return { success: false, message };
          }
        } catch (err: any) {
          const message = err.response?.data?.message || "Profile update failed";
          set({ loading: false, error: message });
          return { success: false, message };
        }
      },

      initializeAuth: async () => {
        if (get().initialized) return;

        try {
          const res = await axiosClient.get("/api/auth/profile");
          if (res.data.success) {
            const user = normalizeUser(res.data.user);
            set({ user, initialized: true });
          } else {
            set({ user: null, initialized: true });
          }
        } catch {
          set({ user: null, initialized: true });
        }
      },

      clearAuth: () => {
        set({ user: null, error: null, loading: false });
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
        initialized: state.initialized,
      }),
    }
  )
);

// Handle 401 globally
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);