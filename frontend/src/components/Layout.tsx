import Sidebar from "./Sidebar";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const Layout = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  // Handle redirect via JSX instead of early return
  if (!isAuthPage && !user) {
    return <Navigate to="/login" replace />;
  }

  // Auth pages (Login, Signup)
  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Outlet />
      </div>
    );
  }

  // Protected layout
  return (
    <div className="container mx-auto px-3">
      <div className="flex gap-4">
        <aside className="w-72 shrink-0 hidden md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
