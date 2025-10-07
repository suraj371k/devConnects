"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Github, Linkedin, Globe, Edit, MapPin, Calendar } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePostStore } from "@/store/postStore";
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { SimpleModal } from "@/components/EditModal";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { user, profileUser, getProfileById, loading, error } = useAuthStore();
  const { getUsersPost, posts, likedPosts, getLikedPosts } = usePostStore();
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = useParams();
  // router defines the route as /profile/:userId — support that name and
  // also accept :id if present in other places
  const profileId = (params as any).userId || (params as any).id || null;

  useEffect(() => {
    if (profileId) {
      getProfileById(profileId);
    }
  }, [profileId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Keep hooks (useEffect) and state-derived values above any early returns so
  // React's hook order stays stable across renders.
  const currentPosts = activeTab === "posts" ? posts : likedPosts;

  useEffect(() => {
    getUsersPost();
  }, [getUsersPost]);

  useEffect(() => {
    getLikedPosts();
  }, [getLikedPosts]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Section */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-zinc-800">
                  <AvatarFallback className="bg-zinc-800 text-white text-2xl font-bold">
                    {(profileId ? profileUser : user)?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={openModal}
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {
                <SimpleModal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                ></SimpleModal>
              }

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {(profileId ? profileUser : user)?.name}
                  </h1>
                  <p className="text-zinc-400 text-lg">
                    {(profileId ? profileUser : user)?.email}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-zinc-400 leading-relaxed max-w-2xl">
                  {(profileId ? profileUser : user)?.about ||
                    "No bio available"}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {(profileId ? profileUser : user)?.location && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {(profileId ? profileUser : user)?.location}
                      </span>
                    </div>
                  )}
                  {(profileId ? profileUser : user)?.createdAt && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Joined{" "}
                        {new Date(
                          (profileId ? profileUser : user)!.createdAt!
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-4 justify-center lg:justify-start">
                  {(profileId ? profileUser : user)?.github && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                      asChild
                    >
                      <a
                        href={(profileId ? profileUser : user)?.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    </Button>
                  )}
                  {(profileId ? profileUser : user)?.linkedin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                      asChild
                    >
                      <a
                        href={(profileId ? profileUser : user)?.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </Button>
                  )}
                  {(profileId ? profileUser : user)?.website && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                      asChild
                    >
                      <a
                        href={(profileId ? profileUser : user)?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {posts.length}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {(profileId ? profileUser : user)?.followers?.length || 0}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {(profileId ? profileUser : user)?.following?.length || 0}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Following</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Card */}
          <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-white text-black hover:bg-zinc-200 px-8 font-medium cursor-pointer">
                  Follow
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer px-8 font-medium"
                >
                  Message
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer px-8 font-medium"
                >
                  Share Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experience Section */}
        {(profileId ? profileUser : user)?.experience?.length &&
          ((profileId ? profileUser : user)?.experience?.length ?? 0) > 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  💼 Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.experience?.map((exp, index) => (
                  <motion.div
                    key={exp._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {exp.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-300 font-medium">
                            {exp.company}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-zinc-700 text-zinc-300"
                          >
                            Full-time
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                        {new Date(exp.from).toLocaleDateString()} –{" "}
                        {new Date(exp.to).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {exp.description}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

        {/* Empty State for No Experience */}
        {(!user?.experience || user.experience.length === 0) && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <div className="text-zinc-500 space-y-2">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-zinc-400">
                  No Experience Added
                </h3>
                <p className="text-sm">
                  Add your work experience to showcase your career journey.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-1 p-1 bg-zinc-800 rounded-lg w-fit mx-auto mb-8">
          <Button
            variant={activeTab === "posts" ? "default" : "ghost"}
            className={`px-6 font-medium transition-all duration-200 ${
              activeTab === "posts"
                ? "bg-white text-black shadow-sm hover:bg-zinc-100"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </Button>
          <Button
            variant={activeTab === "likes" ? "default" : "ghost"}
            className={`px-6 font-medium transition-all duration-200 ${
              activeTab === "likes"
                ? "bg-white text-black shadow-sm hover:bg-zinc-100"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
            onClick={() => setActiveTab("likes")}
          >
            Likes
          </Button>
        </div>

        {/* Posts Section */}
        <div className="">
          <AnimatePresence mode="popLayout">
            {currentPosts.length > 0 ? (
              <div className="space-y-6 ">
                {currentPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
