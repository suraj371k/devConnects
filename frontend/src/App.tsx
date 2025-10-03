import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Messages from "./pages/Messages";
import { useMessagesStore } from "./store/messageStore";

const Posts = lazy(() => import("./pages/PostPage"));
const Inbox = lazy(() => import("./pages/Inbox"));

const App = () => {
  const { initializeAuth, user, initialized } = useAuthStore();
  const { initializeSocket, disconnectSocket } = useMessagesStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user && initialized) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => disconnectSocket();
  }, [user, initialized]);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Posts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/chat" element={<Inbox />} />
            <Route path="/chat/:id" element={<Messages />} />
          </Route>
        </Routes>
        <Toaster />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
