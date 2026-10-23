//  import React, { useEffect, useRef, useState } from 'react';
// import { Bell, User, LogOut, Settings, Menu } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const TopNavBar = ({ onMenuClick }) => {
//   const navigate = useNavigate();

//   const [profileImage, setProfileImage] = useState(null);
//   const [initials, setInitials] = useState('U');
//   const [showProfileMenu, setShowProfileMenu] = useState(false);

//   const profileRef = useRef(null);

//   /* ================= LOAD PROFILE ================= */
//   const loadProfile = () => {
//     const img = localStorage.getItem('profileImage');
//     const user = JSON.parse(localStorage.getItem('userName'));

//     setProfileImage(img);

//     if (user) {
//       setInitials(
//         `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
//       );
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//     window.addEventListener('profile-updated', loadProfile);

//     return () => {
//       window.removeEventListener('profile-updated', loadProfile);
//     };
//   }, []);

//   /* ================= CLOSE ON OUTSIDE CLICK ================= */
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (profileRef.current && !profileRef.current.contains(e.target)) {
//         setShowProfileMenu(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   /* ================= LOGOUT ================= */
//   const handleLogout = () => {
//     localStorage.clear();
//     navigate('/login');
//   };

//   return (
//     <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
//       <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
//         <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">

//           {/* LEFT */}
//           <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 min-w-0">
//             <button
//               onClick={onMenuClick}
//               className="md:hidden p-1 sm:p-1.5 lg:p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
//             >
//               <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
//             </button>

//             <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 min-w-0">
//               <div className="bg-teal-400 text-white font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-3 lg:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm lg:text-base shrink-0">
//                 TT
//               </div>
//               <span className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate max-w-30 sm:max-w-none">
//                 Avi India
//               </span>
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div
//             className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 relative shrink-0"
//             ref={profileRef}
//           >
//             <button className="relative p-1 sm:p-1.5 lg:p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
//               <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
//             </button>

//             {/* AVATAR BUTTON */}
//             <button
//               onClick={() => setShowProfileMenu(prev => !prev)}
//               className="focus:outline-none"
//             >
//               {profileImage ? (
//                 <img
//                   src={profileImage}
//                   alt="Profile"
//                   className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full object-cover shadow-md"
//                 />
//               ) : (
//                 <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-md">
//                   {initials}
//                 </div>
//               )}
//             </button>

//             {/* PROFILE DROPDOWN */}
//             {showProfileMenu && (
//               <div className="absolute right-0 top-10 sm:top-12 lg:top-14 w-44 sm:w-48 lg:w-56 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-w-[90vw]">

//                 {/* USER INFO */}
//                 <div className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 border-b">
//                   <p className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">
//                     {initials}
//                   </p>
//                   <p className="text-xs text-gray-500 hidden sm:block">
//                     View and manage profile
//                   </p>
//                 </div>

//                 {/* ACTIONS */}
//                 <button
//                   onClick={() => {
//                     navigate('/settings');
//                     setShowProfileMenu(false);
//                   }}
//                   className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 hover:bg-gray-50 text-xs sm:text-sm"
//                 >
//                   <User size={14} /> My Profile
//                 </button>

//                 <button
//                   onClick={() => {
//                     navigate('/settings');
//                     setShowProfileMenu(false);
//                   }}
//                   className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 hover:bg-gray-50 text-xs sm:text-sm"
//                 >
//                   <Settings size={14} /> Settings
//                 </button>

//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 hover:bg-red-50 text-red-600 text-xs sm:text-sm"
//                 >
//                   <LogOut size={14} /> Logout
//                 </button>
//               </div>
//             )}
//           </div>

//         </div>
//       </div>
//     </nav>
//   );
// };

// export default TopNavBar;

import React, { useEffect, useRef, useState } from "react";
import { Bell, User, LogOut, Settings, Menu, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopNavBar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [initials, setInitials] = useState("U");
  const [userName, setUserName] = useState("User");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  const loadProfile = () => {
    const img = localStorage.getItem("profileImage");
    const user = JSON.parse(localStorage.getItem("userName"));
    setProfileImage(img);
    if (user) {
      setUserName(`${user.firstName || "User"}`);
      setInitials(
        `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase(),
      );
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT: Logo & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-teal-500/20 transform group-hover:scale-105 transition-transform">
                TT
              </div>
              <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                Avi India
              </span>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-4" ref={profileRef}>
            {/* Notification Bell */}
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 hover:text-teal-600 rounded-xl transition-all group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            {/* AVATAR & DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pr-2 sm:p-1.5 sm:pr-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-slate-50"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {initials}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Admin
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* DROPDOWN MENU */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="px-4 py-4 bg-slate-50/50 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {userName}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors text-sm font-semibold"
                    >
                      <User
                        size={18}
                        className="text-slate-400 group-hover:text-teal-600"
                      />{" "}
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate("/settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors text-sm font-semibold"
                    >
                      <Settings size={18} className="text-slate-400" /> Settings
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/30">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
