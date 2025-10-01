import { backendUrl } from "@/lib/backendUrl";
import axios from "axios";
import { create } from "zustand";

const axiosClient = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

interface Comment {
  postId: string;
  _id: string;
   user: {
    name: string,
    email: string
   }
  text: string;
  createdAt: Date
}

interface Post {
  _id: string;
  title: string;
  content: string;
  images: string[];
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  likes?: string[];
  comments?: Comment[];
}

interface PostState {
  posts: Post[];
  loading: boolean;
  error: null;
  currentPage: number;
  totalPages: number;
  count: number;
  comments: Comment[];

  getPosts: (page?: number, limit?: number) => Promise<void>;
  createPost: (postData: FormData) => Promise<void>;
  updatePost: (id: string, postData: FormData) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  createComment: (postId: string, text: string) => Promise<void>;
  getComments: (postId: string) => Promise<void>;
  updateComment: (postId: string, text: string) => Promise<void>;
  deleteComment: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  count: 0,
  comments: [],

  toggleLike: async (id: string) => {
    try {
      console.log("Toggle like request for post:", id);
      const res = await axiosClient.put(`/api/user/${id}/like`);
      console.log("Toggle like response:", res.data);
      const { likes } = res.data as { likes: string[] };

      set((state) => ({
        posts: state.posts.map((p) => (p._id === id ? { ...p, likes } : p)),
      }));
    } catch (error: any) {
      console.error("Toggle like error:", error);
      set({ error: error?.response?.data?.message || "Error toggling like" });
    }
  },
  //delete post
  deletePost: async (id: string) => {
    try {
      set({ loading: true, error: null });

      await axiosClient.delete(`${backendUrl}/api/post/${id}`);

      set((state) => ({
        posts: state.posts.filter((p) => p._id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error deleting post",
        loading: false,
      });
    }
  },

  updatePost: async (id: string, postData: FormData) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.put(
        `${backendUrl}/api/post/${id}`,
        postData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      set((state) => ({
        posts: state.posts.map((p) => (p._id === id ? res.data.post : p)),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error updating post",
        loading: false,
      });
    }
  },

  //create a new post
  createPost: async (postData: FormData) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosClient.post(
        `${backendUrl}/api/post/create`,
        postData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      set((state) => ({
        posts: [...state.posts, res.data.populatedPost],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error in creating post",
        loading: false,
      });
    }
  },

  //get posts
  getPosts: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get(`${backendUrl}/api/post`, {
        params: { page, limit },
      });

      console.log("Posts response:", res.data);
      console.log("First post likes:", res.data.posts[0]?.likes);

      set({
        posts: res.data.posts,
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        count: res.data.count,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error fetching posts",
        loading: false,
      });
    }
  },

  createComment: async (postId: string, text: string) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.post(`/api/comment/${postId}`, { text });

      set((state) => ({
        comments: [...state.comments, res.data.comment],
        posts: state.posts.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), res.data.comment] }
            : p
        ),
        loading: false,
      }));
    } catch (error: any) {
      console.log("Error in create comment", error);
      set({
        error: error.response?.data?.message || "Error creating comment",
        loading: false,
      });
    }
  },

  getComments: async (postId: string) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.get(`/api/comment/${postId}`);
      set({ comments: res.data.comments, loading: false });
    } catch (error: any) {
      console.log("Error in create comment", error);
      set({ error: error.response?.data?.message, loading: false });
    }
  },

  updateComment: async (postId: string, text: string) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosClient.put(`/api/comment/${postId}`, { text });
      set((state) => ({
        comments: state.comments.map((comment) =>
          comment._id === postId ? res.data.comment : comment
        ),
        loading: false,
      }));
    } catch (error: any) {
      console.log("Error in update comment", error);
      set({ error: error.response?.data?.message, loading: false });
    }
  },

  deleteComment: async (postId: string) => {
    try {
      set({ loading: true, error: null });
      await axiosClient.delete(`/api/comment/${postId}`);
      set((state) => ({
        comments: state.comments.filter((comment) => comment._id !== postId),
        loading: true,
      }));
    } catch (error: any) {
      console.log("Error in delete comment", error);
      set({ error: error.response?.data?.message, loading: false });
    }
  },
}));
