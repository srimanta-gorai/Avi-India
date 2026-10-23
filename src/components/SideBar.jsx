
import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  CheckSquare,
  Settings,
  ChevronRight,
  Briefcase,
  GraduationCap,
  UserRound,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Project", path: "/projects", icon: Briefcase },
    {
      name: "Student Management",
      path: "/students",
      icon: GraduationCap,
    },
    {
      name: "Employee Management",
      path: "/employees",
      icon: UserRound,
    },
    { name: "Approvals", path: "/approvals", icon: CheckSquare },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-16 left-0 w-72
          h-[calc(100vh-4rem)]
          bg-white border-r border-slate-100
          z-30 transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full px-4 py-8">
          {/* Close button (mobile only) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Menu items */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-teal-600"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive
                          ? "text-white opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-slate-300"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
