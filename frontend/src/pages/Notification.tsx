import React, { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import {
  Bell,
  Trash2,
  Check,
  Heart,
  MessageCircle,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast, { Toaster } from "react-hot-toast";

const Notification = () => {
  const {
    notifications,
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
    loading,
    error,
  } = useNotificationStore();

  useEffect(() => {
    getNotifications();
  }, []);

  const handleMarkAsRead = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const loadingToast = toast.loading("Marking as read...");
    try {
      await markNotificationAsRead(notificationId);
      toast.success("Marked as read", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to mark as read", { id: loadingToast });
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const loadingToast = toast.loading("Deleting notification...");
    try {
      await deleteNotification(notificationId);
      toast.success("Notification deleted", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to delete notification", { id: loadingToast });
      console.error("Failed to delete:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationMessage = (notification: any) => {
    const name = notification.from?.name || "Someone";
    switch (notification.type) {
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      case "follow":
        return `${name} started following you`;
      default:
        return "New notification";
    }
  };

  const formatDate = (date: Date | string) => {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      return diffInMins < 1 ? "Just now" : `${diffInMins}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #27272a",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Notifications</h1>
          </div>
          <p className="text-gray-400">
            Stay updated with your latest activities
          </p>
        </div>

        {/* Loading State */}
        {loading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="bg-red-950/50 border-red-900 mb-6">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-900 p-6 rounded-full mb-4">
              <Bell className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
            <p className="text-gray-400">
              When you get notifications, they'll show up here
            </p>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isRead = (notification as any).read;

            return (
              <div
                key={notification._id}
                className={`group relative rounded-lg p-4 transition-all duration-200 ${
                  isRead
                    ? "bg-black border border-gray-800 hover:border-gray-700"
                    : "bg-gradient-to-r from-gray-900 to-black border-2 border-blue-500/40 hover:border-blue-500/60"
                }`}
              >
                {/* Unread Indicator */}
                {!isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-base leading-relaxed mb-1 ${
                        !isRead ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {getNotificationMessage(notification)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                      {!isRead && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        className="h-8 w-8 hover:bg-gray-900 hover:text-green-500"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(notification._id, e)}
                      className="h-8 w-8 hover:bg-gray-900 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notification;
