import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import { AvatarFallback } from "@radix-ui/react-avatar";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Chat = () => {
  const { followers, getFollowers } = useUserStore();

  useEffect(() => {
    getFollowers();
  }, [getFollowers]);

  return (
    <div className="bg-black min-h-screen text-gray-200 p-6">
      <h2 className="text-2xl font-semibold mb-6 border-b border-zinc-950 pb-2">
        Messages
      </h2>

      <div className="space-y-4">
        {Array.isArray(followers) && followers.length > 0 ? (
          followers.map((follower) => (
            <div
              key={follower._id}
              className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 transition rounded-xl p-3 shadow-md"
            >
              <Link className="flex gap-4 items-center" to={`/chat/${follower._id}`}>
                {/* Avatar */}
                <Avatar className=" flex items-center justify-center">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xl font-bold bg-blue-500 p-5 text-white flex items-center justify-center">
                    {follower?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Name + Email */}
                <div>
                  <p className="font-medium text-white">{follower.name}</p>
                  <p className="text-sm text-gray-400">{follower.email}</p>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No followers found.</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
