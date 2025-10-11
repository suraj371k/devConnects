import { useEffect, useRef } from "react";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import PostCard from "./PostCard";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const Posts = () => {
  const { posts, loading, error, getPosts, currentPage, totalPages } =
    usePostStore();
  const { initialized } = useAuthStore();

  const observerRef = useRef(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load posts after auth state is initialized
    if (initialized) {
      getPosts(1);
    }
  }, [getPosts, initialized]);

  //load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && currentPage < totalPages) {
          getPosts(currentPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loading, currentPage, totalPages]);

  // Show loading while auth is initializing
  if (!initialized) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900 border-gray-700 shadow-xl overflow-hidden">
              <CardContent className="p-6">
                {/* Author Skeleton */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-800 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-3">
                  <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-800 rounded animate-pulse"></div>
                </div>

                {/* Image Skeleton */}
                <div className="mt-4 h-80 bg-gray-800 rounded-lg animate-pulse"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  // Loading skeleton
  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900 border-gray-700 shadow-xl overflow-hidden">
              <CardContent className="p-6">
                {/* Author Skeleton */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-800 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-3">
                  <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-800 rounded animate-pulse"></div>
                </div>

                {/* Image Skeleton */}
                <div className="mt-4 h-80 bg-gray-800 rounded-lg animate-pulse"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-gray-900 border-red-500/30 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Failed to Load Posts
            </h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl px-2 sm:px-4"
    >
      {/* Header
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Community Posts
          </h1>
          <p className="text-gray-400 mt-2">Discover what's happening in the community</p>
        </div>
        
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 px-3 py-1">
          {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
        </Badge>
      </motion.div> */}

      {/* Posts List */}
      <AnimatePresence mode="popLayout">
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                layout
              >
                <PostCard
                  postId={post._id}
                  title={post.title}
                  content={post.content}
                  images={post.images}
                  author={post.author}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="bg-gray-900 border-gray-700 max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Posts Yet
                </h3>
                <p className="text-gray-400 mb-4">
                  Be the first to share something with the community!
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Create Post
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div ref={loadMoreRef}>
          {loading && <p>Loading more posts...</p>}
          {error && <p>{error}</p>}
          {currentPage >= totalPages && <p>No more posts</p>}
        </div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Posts;
