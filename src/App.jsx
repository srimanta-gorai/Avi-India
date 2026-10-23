
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./app/layouts/MainLayout";
import Projects from "./features/Projects/Projects";
import Settings from "./features/settings/Settings";
import Team from "./features/Team_management/Team";
import Approval from "./features/Approval/Approval";
import CompanyDetails from "./features/Projects/CompanyDetails";
import Login from "./features/auth/Login/Login";
import Signup from "./features/auth/Sign in/SignIn";
import Auth from "./features/auth/otp/Auth";
import DashboardPage from "./features/Dashboard/Dashboard";
import AcceptInvitePage from "./features/acceptInvite/AcceptInvitePage";
import Students from "./features/Student_management/Students";
import Employees from "./features/Employee_management/Employees";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./hooks/ScrollToTop";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <ScrollToTop />

      <Routes>
        {/* Auth Routes */}
        <Route path="/signup" element={<Login />} />
        <Route path="/login" element={<Signup />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/invite" element={<AcceptInvitePage />} />

        {/* Main App Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:companyId" element={<CompanyDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/team" element={<Team />} />
          <Route path="/approvals" element={<Approval />} />

          {/* New Management Features */}
          <Route path="/students" element={<Students />} />
          <Route path="/employees" element={<Employees />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
