import { Outlet } from "react-router-dom";
import { useState } from "react";
import TopBar from "../../components/TopBar";
import SideBar from "../../components/SideBar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />

      {/* Body */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <SideBar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Page Content */}
        <div
          className={`
            min-w-0 flex-1 p-4 sm:p-5 overflow-auto
            transition-all duration-300
            md:ml-64
          `}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
