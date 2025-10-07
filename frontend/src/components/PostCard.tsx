import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Heart,
  Share,
  MessageCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
} from "lucide-react";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import CommentForm from "./Comments";
import { Link } from "react-router-dom";

interface PostCardProps {
  postId: string;
  title: string;
  content: string;
  images: string[];
  author?: {
    name: string;
    email: string;
    avatar?: string;
  };
  likes?: number;
  comments?: number;
  shares?: number;
  tags?: string[];
  createdAt?: string;
}

interface EditFormData {
  title: string;
  content: string;
  images: FileList;
}

const PostCard: React.FC<PostCardProps> = ({
  title,
  content,
  images ,
  author,
  shares = 0,
  postId,
  createdAt = "2 hours ago",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showComments, setShowComments] = useState(false); // Fixed variable name

  const { posts, toggleLike, loading, deletePost, updatePost , comments  } = usePostStore();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    defaultValues: {
      title,
      content,
    },
  });

  const handleDeletePost = async (id: string) => {
    await deletePost(id);
    toast.success("Post deleted successfully");
  };

  const handleEditPost = () => {
    setIsEditing(true);
    reset({ title, content });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedImages([]);
    reset({ title, content });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: EditFormData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      await updatePost(postId, formData);
      setIsEditing(false);
      setSelectedImages([]);
      toast.success("Post updated successfully");
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  const post = posts.find((p) => p._id === postId);
  const currentLikes = post?.likes || [];
  // Resolve profile id to navigate to when avatar is clicked. Prefer the
  // author prop (passed from parent) and fall back to the post data from the
  // store. If neither has an id we don't render a link to avoid navigating to
  // `/profile/undefined` which would show the logged-in user's profile.
  const profileId = (author as any)?._id || post?.author?._id || null;
  const isLiked = useMemo(() => {
    if (!user || !user.id) return false;
    return currentLikes.some((id) => {
      return id === user.id || id.toString() === user.id.toString();
    });
  }, [currentLikes, user]);
  const likeCount = currentLikes.length;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLike = () => {
    toggleLike(postId);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const imageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-black border-gray-700 shadow-2xl hover:shadow-gray-900/30 transition-all duration-300 overflow-hidden">
        {/* Card Header */}
        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {profileId ? (
                <Link to={`/profile/${profileId}`}>
                  <Avatar className="h-10 w-10 border-2 border-purple-500/20">
                    <AvatarImage src={author?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                      {author?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar className="h-10 w-10 border-2 border-purple-500/20">
                  <AvatarImage src={author?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                    {author?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-white truncate">
                    {author?.name || "Unknown Author"}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <p className="text-gray-400">{author?.email}</p>
                  <span className="text-gray-600">•</span>
                  <p className="text-gray-500">{createdAt}</p>
                </div>
              </div>
            </div>
            {author?.email === user?.email && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 mr-32 bg-black border border-gray-700 text-white shadow-xl">
                  <DropdownMenuItem
                    onClick={() => handleDeletePost(postId)}
                    className="text-red-500 flex gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleEditPost}
                    className="text-blue-400 flex gap-2 cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Post Content */}
          <div className="px-6 pb-4">
            {isEditing ? (
              <div className="bg-black border border-gray-800 rounded-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Input
                      {...register("title", { required: "Title is required" })}
                      placeholder="Post title"
                      className="bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-0"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Textarea
                      {...register("content", {
                        required: "Content is required",
                      })}
                      placeholder="What's on your mind?"
                      className="bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-0 min-h-[120px] resize-none"
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.content.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Update Images (optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg cursor-pointer transition-colors border border-gray-300"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Images
                      </label>
                      {selectedImages.length > 0 && (
                        <span className="text-gray-400 text-sm">
                          {selectedImages.length} file(s) selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-white hover:bg-gray-200 text-black border border-gray-300 font-medium"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 hover:text-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <motion.h3
                  className="text-xl font-bold text-white mb-2"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {title}
                </motion.h3>
                <p className="text-gray-300 leading-relaxed">{content}</p>
              </>
            )}
          </div>

          {/* Image Carousel */}
          {!isEditing && images.length > 0 && (
            <div className="relative p-2 bg-black">
              <div className="relative h-96 w-full overflow-hidden">
                <AnimatePresence mode="wait" custom={currentIndex}>
                  <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={`post-img-${currentIndex}`}
                    custom={currentIndex}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <motion.button
                      onClick={prevImage}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={nextImage}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </>
                )}

                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-white text-sm">
                    {currentIndex + 1} / {images.length}
                  </span>
                </div>

                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        className={`h-2 w-2 rounded-full transition-all duration-200 ${
                          i === currentIndex
                            ? "bg-white scale-125"
                            : "bg-gray-500 hover:bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          {!isEditing && (
            <div className="px-6 py-3 border-t border-gray-800">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex space-x-4">
                  <span>{likeCount} likes</span>
                  <span>{comments.length} comments</span>
                  <span>{shares} shares</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className="px-2 py-2 border-t border-gray-800">
              <div className="flex justify-around">
                <motion.button
                  onClick={handleLike}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 flex-1 justify-center mx-1"
                >
                  <motion.div
                    animate={{ scale: isLiked ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Heart
                      fill={isLiked ? "#ef4444" : "none"}
                      className={`h-5 w-5 ${
                        isLiked ? "text-red-500" : "text-gray-400"
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`font-medium ${isLiked ? "text-red-400" : ""}`}
                  >
                    Like
                  </span>
                </motion.button>

                <motion.button
                  onClick={toggleComments}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 flex-1 justify-center mx-1 ${
                    showComments
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">Comment</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 flex-1 justify-center mx-1"
                >
                  <Share className="h-5 w-5" />
                  <span className="font-medium">Share</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* Comments Section - Now properly positioned */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-800 px-6 py-4 bg-gray-900/50"
              >
                <CommentForm postId={postId} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostCard;
