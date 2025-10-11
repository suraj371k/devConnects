import { create } from "zustand";
import { axiosClient, useAuthStore } from "./authStore";
import { socket } from "@/lib/socket";

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Message {
  _id: string;
  sender: User;
  receiver: User;
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface MessagesState {
  messages: Message[];
  chatUsers: ChatUser[];
  selectedUser: User | null;
  onlineUsers: string[];
  loading: boolean;
  error: string | null;

  sendMessage: (receiverId: string, text: string) => Promise<void>;
  getMessages: (receiverId: string) => Promise<void>;
  listenMessages: () => () => void;
  getChatUsers: () => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
  clearMessages: () => void;
  initializeSocket: () => void; // NEW: Initialize socket connection
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  chatUsers: [],
  selectedUser: null,
  onlineUsers: [],
  loading: false,
  error: null,

  // NEW: Initialize socket and join user's own room
  initializeSocket: () => {
    const user = useAuthStore.getState().user;
    if (user?._id) {
      socket.emit("joinRoom", user._id);
      console.log(`✅ Joined own room: ${user._id}`);
    }
  },

  sendMessage: async (receiverId, text) => {
    const { messages } = get();
    const user = useAuthStore.getState().user;

    if (!text.trim()) {
      set({ error: "Message cannot be empty" });
      return;
    }

    try {
      set({ loading: true, error: null });

      const response = await axiosClient.post(`/api/message/${receiverId}`, {
        text,
      });

      if (response.data.success) {
        const newMessage = response.data.message;

        // ✅ FIXED: Send to receiver's room with correct structure
        socket.emit("sendMessage", {
          roomId: receiverId,
          message: newMessage, // Changed from 'text' to 'message'
        });

        set({ messages: [...messages, newMessage], loading: false });
        console.log("✅ Message sent successfully");
      }
    } catch (error: any) {
      console.error("❌ Error sending message:", error);
      set({
        error: error.response?.data?.message || "Failed to send message",
        loading: false,
      });
    }
  },

  getMessages: async (receiverId) => {
    try {
      set({ loading: true, error: null });

      const response = await axiosClient.get(`/api/message/${receiverId}`);

      if (response.data.success) {
        set({ messages: response.data.messages, loading: false });
        console.log(`✅ Loaded ${response.data.messages.length} messages`);
      }
    } catch (error: any) {
      console.error("❌ Error fetching messages:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch messages",
        loading: false,
      });
    }
  },

  listenMessages: () => {
    // ✅ FIXED: Changed to "receiveMessage" to match backend
    const handleReceive = (message: Message) => {
      console.log("📨 Received message:", message);
      set((state) => ({
        messages: [...state.messages, message],
      }));
    };

    const handleTyping = ({ socketId, isTyping }: any) => {
      console.log(`${socketId} is ${isTyping ? "typing..." : "stopped typing"}`);
    };

    socket.on("receiveMessage", handleReceive); // ✅ Fixed event name
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("typing", handleTyping);
    };
  },

  getChatUsers: async () => {
    try {
      set({ loading: true, error: null });

      const response = await axiosClient.get("/api/message/users/chats");

      if (response.data.success) {
        const sortedUsers = response.data.users.sort(
          (a: ChatUser, b: ChatUser) => {
            const timeA = new Date(a.lastMessageTime || 0).getTime();
            const timeB = new Date(b.lastMessageTime || 0).getTime();
            return timeB - timeA;
          }
        );
        set({ chatUsers: sortedUsers, loading: false });
        console.log(`✅ Loaded ${response.data.users.length} chat users`);
      }
    } catch (error: any) {
      console.error("❌ Error fetching chat users:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch chat users",
        loading: false,
      });
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
    if (user) {
      get().getMessages(user._id);
    } else {
      set({ messages: [] });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearMessages: () => {
    set({ messages: [], selectedUser: null });
  },
}));