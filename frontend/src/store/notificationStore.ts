import { create } from "zustand";
import { axiosClient } from "./authStore";

interface User {
  _id: string;
  email: string;
  name: string;
}

interface Notification {
  _id: string;
  from: User;
  to: User;
  count: number;
  type: string;
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  getNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  loading: false,
  error: null,

  getNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get(`/api/notification/get`);
      set({ notifications: res.data.notifications, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error fetching notifications",
        loading: false,
      });
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      set({ loading: true, error: null });
      await axiosClient.delete(`/api/notification/${notificationId}`);
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification._id !== notificationId
        ),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data.message || "error in delete notification",
        loading: false,
      });
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      set({ loading: true, error: null });
      await axiosClient.put(`/api/notification/${notificationId}/read`);

      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        ),
      }));
    } catch (error: any) {
      console.log("Error in mark notification", error);
      set({
        error:
          error.response?.data.message || "Error is mark notification as read",
        loading: false,
      });
      throw error;
    }
  },
}));
