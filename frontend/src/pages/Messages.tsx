import { useParams } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useMessageStore } from "@/store/messageStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile, Paperclip, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

const Messages = () => {
  const { id } = useParams();
  const { followers, getFollowers } = useUserStore();
  const { messages, sendMessage, getMessages, clearMessages } = useMessageStore();
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFollowers();
  }, [getFollowers]);

  const follower = followers.find((f) => f._id === id);

  useEffect(() => {
    if (follower) {
      getMessages(follower._id);
    }
    
    // Cleanup: clear messages when component unmounts or user changes
    return () => {
      clearMessages();
    };
  }, [follower, getMessages, clearMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!follower) {
    return (
      <div className="bg-black min-h-screen text-gray-200 p-6">
        <p>User not found</p>
      </div>
    );
  }

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) return;
    
    try {
      await sendMessage(follower._id, text);
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col text-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-zinc-900">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
          {follower.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{follower.name}</h2>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No messages yet. Start a conversation!</p>
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
                  {msg.text}
                  <div className="text-xs text-gray-300 mt-1 text-right">
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
        >
          <Smile className="w-5 h-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border-none bg-zinc-800 text-gray-200 focus:ring-0 focus:outline-none"
          placeholder="Type a message..."
        />

        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!text.trim()}
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};

export default Messages;