// features/Projects/CompanyDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Scale,
  MessageSquare,
  Clock,
  FolderOpen,
  Activity,
  LayoutDashboard,
  ChevronLeft,
  Download,
  Eye,
  Plus,
  Filter,
  Search,
  Upload,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Paperclip,
  Send,
  MoreVertical,
  File,
  Image,
  Archive,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  PieChart,
  BarChart2,
  Settings as SettingsIcon,
} from "lucide-react";
import Dashboard from "../../Modules/Dashboard";
import TenderConsole from "../../Modules/TenderConsole";
import VOGovernor from "../../Modules/VOGovernor";
import RFIClarifications from "../../Modules/RFIClarifications";
import EOTDelayTracking from "../../Modules/EOTDelayTracking";
import DocumentVault from "../../Modules/DocumentVault";
import AuditTrail from "../../Modules/AuditTrail";

const CompanyDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("dashboard");
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const modules = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      color: "teal",
    },
    { id: "tender", name: "Tender Console", icon: FileText, color: "blue" },
    { id: "vo", name: "VO Governor", icon: Scale, color: "orange" },
    {
      id: "rfi",
      name: "RFI / Clarifications",
      icon: MessageSquare,
      color: "purple",
    },
    { id: "eot", name: "EOT / Delay Tracking", icon: Clock, color: "red" },
    {
      id: "documents",
      name: "Document Vault",
      icon: FolderOpen,
      color: "green",
    },
    { id: "audit", name: "Audit Trail", icon: Activity, color: "gray" },
  ];

  useEffect(() => {
    // Fetch company/project details
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const response = await fetch(`/api/projects/${companyId}`);
      const data = await response.json();
      setCompanyData(data);
    } catch (error) {
      console.error("Failed to fetch company details:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard projectId={companyId} />;
      case "tender":
        return <TenderConsole projectId={companyId} />;
      case "vo":
        return <VOGovernor projectId={companyId} />;
      case "rfi":
        return <RFIClarifications projectId={companyId} />;
      case "eot":
        return <EOTDelayTracking projectId={companyId} />;
      case "documents":
        return <DocumentVault projectId={companyId} />;
      case "audit":
        return <AuditTrail projectId={companyId} />;
      default:
        return <Dashboard projectId={companyId} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="py-4 flex items-center gap-4">
            <button
              onClick={() => navigate("/projects")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {companyData?.projectName || "Project Details"}
              </h1>
              <p className="text-sm text-slate-500">
                {companyData?.projectCode || "TTX-2026-1932"} •{" "}
                {companyData?.siteAddress || "22B,Russel Street, London"}
              </p>
            </div>
          </div>

          {/* Module Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-200">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeModule === module.id
                      ? `text-${module.color}-600 border-b-2 border-${module.color}-600`
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${activeModule === module.id ? `text-${module.color}-600` : ""}`}
                  />
                  {module.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Module Content */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        {renderModule()}
      </div>
    </div>
  );
};

export default CompanyDetails;
