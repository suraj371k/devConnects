import { useParams } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile, Paperclip, Send, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messageStore";

const Messages = () => {
  const { id } = useParams();
  const { followers, getFollowers } = useUserStore();
  const { user } = useAuthStore();
  const {
    messages,
    loading,
    error,
    isSocketConnected,
    onlineUsers,
    sendMessage,
    getMessages,
    setSelectedUser,
    clearError,
  } = useMessagesStore();

  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get followers and set up message store
  useEffect(() => {
    getFollowers();
  }, [getFollowers]);

  // Set selected user and load messages when follower changes
  useEffect(() => {
    if (id && followers.length > 0) {
      const follower = followers.find((f) => f._id === id);
      if (follower) {
        setSelectedUser({ ...follower, id: follower._id });
      }
    }
  }, [id, followers, setSelectedUser]);

  // Clear error when component unmounts or user changes
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const follower = followers.find((f) => f._id === id);

  if (!follower) {
    return (
      <div className="bg-black min-h-screen text-gray-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">User not found</p>
          <p className="text-sm text-gray-500 mt-2">
            The user you're looking for doesn't exist
          </p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim() || loading) return;

    try {
      await sendMessage(follower._id, text);
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId);
  };

  const isOnline = isUserOnline(follower._id);

  return (
    <div className="bg-black min-h-screen flex flex-col text-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              {follower.name.charAt(0).toUpperCase()}
            </div>
            {/* Online Status Indicator */}
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{follower.name}</h2>
            <p className="text-xs text-gray-400">
              {isOnline ? (
                <span className="text-green-400">● Online</span>
              ) : (
                <span className="text-gray-500">○ Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Socket Connection Status */}
        <div className="flex items-center gap-2">
          {isSocketConnected ? (
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <Wifi className="w-4 h-4" />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <WifiOff className="w-4 h-4" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/50 border-b border-red-800 text-red-200 text-sm text-center">
          {error}
          <button
            onClick={clearError}
            className="ml-2 underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <p>No messages yet. Start a conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isSender = msg.sender._id === user?.id;
            return (
              <div
                key={msg._id}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs break-words shadow-md
                    ${
                      isSender
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-700 text-gray-200 rounded-bl-none"
                    }
                  `}
                >
                  {/* Sender name for received messages */}
                  {!isSender && (
                    <div className="text-xs font-semibold text-gray-300 mb-1">
                      {msg.sender.name}
                    </div>
                  )}

                  {msg.text}

                  <div
                    className={`text-xs mt-1 text-right ${
                      isSender ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t mb-1 rounded-md border-gray-800 bg-zinc-900 flex items-center gap-2"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          disabled={loading}
        >
          <Smile className="w-5 h-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          disabled={loading}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border-none bg-zinc-800 text-gray-200 focus:ring-0 focus:outline-none"
          placeholder={loading ? "Sending..." : "Type a message..."}
          disabled={loading}
        />

        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim() || loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default Messages;
