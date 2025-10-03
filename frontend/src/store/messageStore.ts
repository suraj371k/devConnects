import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { axiosClient } from "./authStore";
import { backendUrl } from "@/lib/backendUrl";

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
  // State
  messages: Message[];
  chatUsers: ChatUser[];
  selectedUser: User | null;
  onlineUsers: string[];
  socket: Socket | null;
  loading: boolean;
  error: string | null;
  isSocketConnected: boolean;

  // Actions
  initializeSocket: () => void;
  disconnectSocket: () => void;
  sendMessage: (receiverId: string, text: string) => Promise<void>;
  getMessages: (receiverId: string) => Promise<void>;
  getChatUsers: () => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  addMessage: (message: Message) => void;
  setOnlineUsers: (users: string[]) => void;
  clearError: () => void;
  clearMessages: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  // Initial state
  messages: [],
  chatUsers: [],
  selectedUser: null,
  onlineUsers: [],
  socket: null,
  loading: false,
  error: null,
  isSocketConnected: false,

  // Initialize Socket.IO connection - cookies are sent automatically
  initializeSocket: () => {
    const socket = io(backendUrl, {
      withCredentials: true, // Important for cookies
    });

    socket.on("connect", () => {
      console.log("✅ Connected to server");
      set({ isSocketConnected: true, error: null });
    });

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from server");
      set({ isSocketConnected: false });
    });

    socket.on("getOnlineUsers", (onlineUsers: string[]) => {
      console.log("📱 Online users:", onlineUsers);
      set({ onlineUsers });
    });

    socket.on("newMessage", (message: Message) => {
      console.log("💬 New message received:", message);
      const { messages, selectedUser, chatUsers } = get();

      // If the message is from the currently selected user, add it to messages
      if (
        selectedUser &&
        (message.sender._id === selectedUser._id ||
          message.receiver._id === selectedUser._id)
      ) {
        const updatedMessages = [...messages, message];
        set({ messages: updatedMessages });
      }

      // Update chat users list with new message
      const updatedChatUsers = chatUsers
        .map((user) => {
          if (
            user._id === message.sender._id ||
            user._id === message.receiver._id
          ) {
            return {
              ...user,
              lastMessage: message.text,
              lastMessageTime: message.createdAt,
            };
          }
          return user;
        })
        .sort((a, b) => {
          const timeA = new Date(a.lastMessageTime || 0).getTime();
          const timeB = new Date(b.lastMessageTime || 0).getTime();
          return timeB - timeA;
        });

      set({ chatUsers: updatedChatUsers });
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      set({
        error: "Failed to connect to chat server",
        isSocketConnected: false,
      });
    });

    set({ socket });
  },

  // Disconnect socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [], isSocketConnected: false });
    }
  },

  // Send message
  sendMessage: async (receiverId: string, text: string) => {
    const { messages } = get();

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

        // Add the actual message to state
        set({
          messages: [...messages, newMessage],
          loading: false,
        });

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

  // Get messages for a specific chat
  getMessages: async (receiverId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await axiosClient.get(`/api/message/${receiverId}`);

      if (response.data.success) {
        set({
          messages: response.data.messages,
          loading: false,
        });
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

  // Get all chat users
  getChatUsers: async () => {
    try {
      set({ loading: true, error: null });

      const response = await axiosClient.get("/api/message/users/chats");

      if (response.data.success) {
        set({
          chatUsers: response.data.users,
          loading: false,
        });
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

  // Set selected user for chat
  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
    if (user) {
      get().getMessages(user._id);
    } else {
      set({ messages: [] });
    }
  },

  // Add message to state
  addMessage: (message: Message) => {
    const { messages } = get();
    set({ messages: [...messages, message] });
  },

  // Set online users
  setOnlineUsers: (users: string[]) => {
    set({ onlineUsers: users });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear messages
  clearMessages: () => {
    set({ messages: [], selectedUser: null });
  },
}));
