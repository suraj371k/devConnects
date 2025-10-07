import { BrowserRouter, Route, Routes} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useMessagesStore } from "./store/messageStore";
import ProtectedRoute from "./components/ProtectedRoute";

const Posts = lazy(() => import("./pages/PostPage"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Profile = lazy(() => import('./pages/Profile'))
const Notification = lazy(() => import('./pages/Notification'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const CreatePost = lazy(() => import('./pages/CreatePost'))
const Messages = lazy(() => import('./pages/Messages'))



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
