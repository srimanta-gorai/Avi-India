import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  MessageSquare,
  Users,
  Settings,
  Bell,
  User,
  Search,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  FileText,
  ChevronRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import CreateProjectWizard from "./CreateProjectWizard";
import { getProjects } from "../../app/api/project";

const ProjectsListPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isNewProjectFormOpen, setIsNewProjectFormOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Loading and data states
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjects({
        pageSize: itemsPerPage,
        pageNo: currentPage,
        name: searchQuery || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });

      if (response.success) {
        setProjects(response.data.projectList);
        setTotalItems(response.data.totalItems);
        setTotalPages(Math.ceil(response.data.totalItems / itemsPerPage));
      } else {
        setError(response.message || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError("An error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchQuery, filterStatus]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page on search
      } else {
        fetchProjects();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus]);

  // Status mapping and helper functions
  const getStatusConfig = (statusCode) => {
    const statusMap = {
      100: { label: "Active", color: "teal", icon: TrendingUp },
      101: { label: "Delayed", color: "orange", icon: Clock },
      102: { label: "Completed", color: "cyan", icon: FileText },
      103: { label: "Planning", color: "slate", icon: Calendar },
    };
    return (
      statusMap[statusCode] || {
        label: "Unknown",
        color: "slate",
        icon: FileText,
      }
    );
  };

  const StatusBadge = ({ statusCode }) => {
    const config = getStatusConfig(statusCode);
    const Icon = config.icon;

    const styles = {
      teal: "bg-teal-50 text-teal-700 border-teal-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
      slate: "bg-slate-50 text-slate-700 border-slate-200",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[config.color]}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const itemDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (itemDate.getTime() === today.getTime()) {
      return `Today, ${time}`;
    }

    if (itemDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${time}`;
    }

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (location.state?.openCreateProject) {
      setIsNewProjectFormOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Projects
            </h1>
            <p className="text-slate-500 font-medium">
              {totalItems > 0
                ? `Showing ${projects.length} of ${totalItems} projects`
                : "Manage and monitor all your construction projects"}
            </p>
          </div>
          <button
            onClick={() => setIsNewProjectFormOpen(true)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-bold shadow-lg shadow-teal-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects by name or address..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={handleStatusFilterChange}
                  className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                >
                  <option value="all">Filter: All Status</option>
                  <option value="100">Active</option>
                  <option value="101">Delayed</option>
                  <option value="102">Completed</option>
                  <option value="103">Planning</option>
                </select>
                <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "table" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <List className="w-4 h-4" /> Table
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "card" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <LayoutGrid className="w-4 h-4" /> Cards
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-6">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No projects found
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first project"}
            </p>
            {searchQuery || filterStatus !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setIsNewProjectFormOpen(true)}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
              >
                Create New Project
              </button>
            )}
          </div>
        )}

        {/* Table View */}
        {!loading && !error && projects.length > 0 && viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Project Details
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">
                      Location
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Created
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-teal-50/30 transition-colors cursor-pointer group"
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                            <Building2 className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {project.projectName}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              Code: {project.projectCode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden sm:table-cell">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm truncate max-w-[200px]">
                            {project.siteAddress || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge statusCode={project.status} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600">
                          {formatDate(project.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Card View */}
        {!loading && !error && projects.length > 0 && viewMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <StatusBadge statusCode={project.status} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                      {project.projectName}
                    </h3>
                    <p className="text-teal-50 text-sm font-medium opacity-80">
                      {project.projectCode}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-slate-500">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <p className="text-xs font-medium truncate">
                        {project.siteAddress || "No address provided"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Region: {project.region || "—"}</span>
                      <span>Created: {formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              projects
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === index + 1
                      ? "bg-teal-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Project Slider */}

      <CreateProjectWizard
        isOpen={isNewProjectFormOpen}
        onClose={() => {
          setIsNewProjectFormOpen(false);
          // Refresh projects list after creating a new project
          fetchProjects();
        }}
      />
    </div>
  );
};

export default ProjectsListPage;
