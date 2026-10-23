import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Projects from "../../features/Projects/Projects";
import Settings from "../../features/settings/Settings";
import Team from "../../features/Team_management/Team";
import Approval from "../../features/Approval/Approval";
import CompanyDetails from "../../features/Projects/CompanyDetails";
import Login from "../../features/auth/Login/Login";
import Signup from "../../features/auth/Sign in/SignIn";
import Auth from "../../features/auth/otp/Auth";
import DashboardPage from "../../features/Dashboard/Dashboard";
import AcceptInvitePage from "../../features/acceptInvite/AcceptInvitePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:companyId" element={<CompanyDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/team" element={<Team />} />
        <Route path="/approvals" element={<Approval />} />
      </Route>
      <Route path="/signup" element={<Login />} />
      <Route path="/login" element={<Signup />} />
      <Route path="/Auth" element={<Auth />} />
      <Route path="/invite/*" element={<AcceptInvitePage />} />
    </Routes>
  );
}
