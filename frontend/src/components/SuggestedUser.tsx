import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

const Users = () => {
  const {
    suggested,
    loading,
    suggestedUser,
    followUser,
    unfollowUser,
    isUserFollowed,
    isUserLoading,
  } = useUserStore();

  useEffect(() => {
    const loadData = async () => {
      await suggestedUser(); 
    };
    loadData();
  }, [suggestedUser]);

  const handleFollowToggle = async (userId: string) => {
    const isFollowed = isUserFollowed(userId);
    if (isFollowed) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  if (loading)
    return <p className="text-gray-400 p-4">Loading suggested users...</p>;

  if (!suggested.length)
    return <p className="text-gray-400 p-4">No suggestions available.</p>;

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6">
      <h1 className="text-xl font-bold text-white mb-4">Who to follow</h1>

      <div className="space-y-4">
        {suggested.map((user) => {
          const isFollowed = isUserFollowed(user._id);
          const isLoading = isUserLoading(user._id);

          return (
            <div key={user._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{user.name}</p>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>

              <Button
                variant={isFollowed ? "outline" : "default"}
                size="sm"
                onClick={() => handleFollowToggle(user._id)}
                disabled={isLoading}
                className={`${
                  isFollowed
                    ? "border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "bg-white text-black font-bold hover:bg-gray-100"
                } transition-all duration-200`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isFollowed ? (
                  "Unfollow"
                ) : (
                  "Follow"
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Users;
