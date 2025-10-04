import {
  Home,
  MessageCircle,
  PlusSquare,
  LogOut,
  BellRing,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { user, logoutUser } = useAuthStore();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Logout successfully");
  };

  return (
    <div className="h-full mt-10  sticky top-4">
      <div className="bg-black border border-gray-800 rounded-xl p-4 shadow-xl">
        {/* Brand */}
        <div className="px-2 pb-4">
          <span className="text-lg font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            devConnects
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Button>
          <Button
           onClick={() => navigate('/chat')}
            variant="ghost"
            className="justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Chat</span>
          </Button>
          <Button
            onClick={() => navigate("/create-post")}
            variant="ghost"
            className="justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full"
          >
            <PlusSquare className="h-5 w-5" />
            <span>Create Post</span>
          </Button>
      
          <Button
           onClick={() => navigate('/notifications')}
            variant="ghost"
            className="justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full"
          >
            <BellRing className="h-5 w-5" />
            <span>Notifications</span>
          </Button>
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-gray-800" />

        {/* User section (UI only) */}
        {user && (
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-gray-700">
                <AvatarImage src={(user as any)?.avatar} />
                <AvatarFallback className="bg-gray-800 text-white">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="text-gray-400 cursor-pointer hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
