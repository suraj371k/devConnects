import { create } from "zustand";
import { axiosClient } from "./authStore";

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
  };
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;

  sendMessage: (receiverId: string, text: string) => Promise<void>;
  getMessages: (receiverId: string) => Promise<void>;
  clearMessages: () => void; // Add this to clear messages when switching users
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  loading: false,
  error: null,

  sendMessage: async (receiverId: string, text: string) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.post(`/api/message/${receiverId}`, {
        text,
      });
      set((state) => ({
        messages: [...state.messages, res.data.message],
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: "Failed to send message" });
      throw error;
    }
  },

  getMessages: async (receiverId: string) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get(`/api/message/${receiverId}`);
      console.log("Messages response:", res.data);
      set({ messages: res.data.messages, loading: false });
    } catch (error) {
      set({ loading: false, error: "Failed to fetch messages" }); // Fixed error message
      throw error;
    }
  },

  clearMessages: () => set({ messages: [] }),
}));