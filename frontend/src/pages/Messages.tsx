import { useParams } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile, Paperclip, Send } from "lucide-react"; 
import { useEffect } from "react";

const Messages = () => {
  const { id } = useParams();
  const { followers , getFollowers } = useUserStore();

  useEffect(() => {
    getFollowers()
  } , [])
  // find the specific follower by ID
  const follower = followers.find((f) => f._id === id);


  // Dummy messages
  const dummyMessages = [
    { id: 1, text: "Hey there!", sender: "follower" },
    { id: 2, text: "Hello! How are you?", sender: "me" },
    { id: 3, text: "I’m good, thanks!", sender: "follower" },
  ];

  if (!follower) {
    return (
      <div className="bg-black min-h-screen text-gray-200 p-6">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="bg-black  min-h-screen flex flex-col text-gray-200">
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
        {dummyMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-xs ${
              msg.sender === "me"
                ? "bg-blue-600 ml-auto text-right"
                : "bg-gray-700 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form className="p-3 border-t mb-1 rounded-md border-gray-800 bg-zinc-900 flex items-center gap-2">
        {/* Emoji button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Smile className="w-5 h-5" />
        </Button>

        {/* Media/File button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Input box */}
        <Input
          className="flex-1 border-none bg-zinc-800 text-gray-200 focus:ring-0 focus:outline-none"
          placeholder="Type a message..."
        />

        {/* Send button */}
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};

export default Messages;
