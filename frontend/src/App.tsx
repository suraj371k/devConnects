import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Messages from "./pages/Messages";
import { useMessagesStore } from "./store/messageStore";
import Notification from "./pages/Notification";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";

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
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route index element={<Posts />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/chat" element={<Inbox />} />
            <Route path="/chat/:id" element={<Messages />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notification />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        <Toaster />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
