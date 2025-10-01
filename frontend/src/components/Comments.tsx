"use client";

import { useForm } from "react-hook-form";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, MessageCircle } from "lucide-react";

interface CommentFormProps {
  postId: string;
}

type CommentFormData = {
  text: string;
};

export default function CommentForm({ postId }: CommentFormProps) {
  const { createComment, loading, error, getComments, comments } =
    usePostStore();
  const { user } = useAuthStore();

  // Fix: Add postId to dependency array to prevent infinite calls
  useEffect(() => {
    if (postId) {
      getComments(postId);
    }
  }, [getComments, postId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<CommentFormData>();

  const watchText = watch("text", "");

  const onSubmit = async (data: CommentFormData) => {
    try {
      await createComment(postId, data.text);
      reset();
      toast.success("Comment posted successfully");
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "just now";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredComments = comments.filter(
    (comment) => comment.postId === postId || !comment.postId
  );

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black border border-gray-800 rounded-lg p-4"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8 border-2 border-gray-700">
              <AvatarImage
                src={
                  user && "avatar" in user ? (user as any).avatar : undefined
                }
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-medium">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="relative">
                <textarea
                  {...register("text", {
                    required: "Comment cannot be empty",
                    minLength: {
                      value: 1,
                      message: "Comment must be at least 1 character",
                    },
                    maxLength: {
                      value: 500,
                      message: "Comment cannot exceed 500 characters",
                    },
                  })}
                  placeholder="Write a thoughtful comment..."
                  className="w-full bg-black border border-zinc-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none resize-none transition-all duration-200"
                  rows={3}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {watchText?.length || 0}/500
                </div>
              </div>

              {errors.text && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-400 text-sm flex items-center space-x-1"
                >
                  <span>⚠️</span>
                  <span>{errors.text.message}</span>
                </motion.p>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Posting as{" "}
                  <span className="text-gray-300 font-medium">
                    {user?.name || "Anonymous"}
                  </span>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !watchText?.trim()}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Post Comment</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg"
          >
            <p className="text-red-400 text-sm flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Comments List */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-gray-400 text-sm font-medium">
          <MessageCircle className="h-4 w-4" />
          <span>
            {filteredComments.length}{" "}
            {filteredComments.length === 1 ? "Comment" : "Comments"}
          </span>
        </div>

        <AnimatePresence>
          {filteredComments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-600" />
              <p className="text-lg font-medium mb-1">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredComments.map((comment, index) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black border border-gray-800/50 rounded-lg p-4 hover:bg-gray-900/70 transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-gray-700">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-sm font-medium">
                        {(comment as any).name?.charAt?.(0) ||
                          comment.user?.name?.charAt?.(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium text-sm truncate">
                          {comment.user?.name || "Anonymous User"}
                        </h4>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-gray-500 text-xs">
                          {formatTimeAgo(
                            comment?.createdAt?.toString?.() ?? ""
                          )}
                        </span>
                      </div>

                      <div className="text-gray-400 text-xs mb-2 truncate">
                        {comment.user?.email}
                      </div>

                      <p className="text-gray-300 text-sm leading-relaxed break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
