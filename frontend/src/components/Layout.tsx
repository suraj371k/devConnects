import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import ProtectedRoute from "./ProtectedRoute";

const Layout = () => {
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

      <Footer />
    </div>
  );
};

export default Layout;
