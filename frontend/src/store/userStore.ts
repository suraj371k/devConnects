import { create } from "zustand";
import { axiosClient } from "./authStore";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  isFollowing: boolean;
  followers: User[];
  suggested: User[];
  followingUsers: string[]; // Track which users are being followed
  loadingUsers: string[]; // Track which users are being processed

  getUsers: () => Promise<void>;
  followUser: (targetUser: string) => Promise<void>;
  unfollowUser: (targetUser: string) => Promise<void>;
  isUserFollowed: (userId: string) => boolean;
  isUserLoading: (userId: string) => boolean;
  suggestedUser: () => Promise<void>;
  getFollowers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  isFollowing: false,
  followingUsers: [],
  loadingUsers: [],
  suggested: [],
  followers: [],

  suggestedUser: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get(`api/user/suggested`);
      set({ suggested: res.data.users, loading: false });
    } catch (error: any) {
      console.error("Error fetching suggested users:", error);
      set({
        error:
          error.response?.data?.message || "Error fetching suggested users",
        loading: false,
      });
    }
  },

  getFollowers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axiosClient.get(`/api/user/followers`);
      set({ followers: response.data.followers.followers, loading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Error fetching suggested users",
        loading: false,
      });
      throw error;
    }
  },

  followUser: async (targetUser: string) => {
    try {
      set((state) => ({
        loadingUsers: [...state.loadingUsers, targetUser],
        error: null,
      }));
      const res = await axiosClient.post(`/api/user/${targetUser}/follow`);
      console.log("Follow response:", res.data);
      set((state) => ({
        isFollowing: res.data.following,
        followingUsers: [...state.followingUsers, targetUser],
        loadingUsers: state.loadingUsers.filter((id) => id !== targetUser),
      }));
    } catch (error: any) {
      console.error("Follow error:", error);
      set((state) => ({
        error: error.response?.data?.message || "Error following user",
        loadingUsers: state.loadingUsers.filter((id) => id !== targetUser),
      }));
    }
  },

  unfollowUser: async (targetUser: string) => {
    try {
      set((state) => ({
        loadingUsers: [...state.loadingUsers, targetUser],
        error: null,
      }));
      const res = await axiosClient.delete(`/api/user/${targetUser}/unfollow`);
      console.log("Unfollow response:", res.data);
      set((state) => ({
        isFollowing: false,
        followingUsers: state.followingUsers.filter((id) => id !== targetUser),
        loadingUsers: state.loadingUsers.filter((id) => id !== targetUser),
      }));
    } catch (error: any) {
      console.error("Unfollow error:", error);
      set((state) => ({
        error: error.response?.data?.message || "Error unfollowing user",
        loadingUsers: state.loadingUsers.filter((id) => id !== targetUser),
      }));
    }
  },

  getUsers: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get(`/api/user`);
      set({ users: res.data.users, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error in get all users",
        loading: false,
      });
    }
  },

  isUserFollowed: (userId: string) => {
    return get().followingUsers.includes(userId);
  },

  isUserLoading: (userId: string) => {
    return get().loadingUsers.includes(userId);
  },
}));
