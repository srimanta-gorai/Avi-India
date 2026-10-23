// features/Projects/modules/AuditTrail.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Activity,
  Clock,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AuditTrail = ({ projectId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    user: "",
    module: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchAuditLogs();
  }, [projectId, filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const response = await fetch(`/api/projects/${projectId}/audit-logs`);
      const result = await response.json();
      setLogs(result);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      // Mock data
      setLogs([
        {
          id: 1,
          timestamp: "2024-01-16T10:30:00",
          user: "John Doe",
          action: "Created Variation Order",
          module: "VO Governor",
          description: "VO-001 was created with amount S$125,000",
          ipAddress: "192.168.1.1",
        },
        {
          id: 2,
          timestamp: "2024-01-16T09:15:00",
          user: "Jane Smith",
          action: "Answered RFI",
          module: "RFI",
          description: "RFI-002 was answered with detailed specifications",
          ipAddress: "192.168.1.2",
        },
        {
          id: 3,
          timestamp: "2024-01-15T16:45:00",
          user: "Mike Johnson",
          action: "Uploaded Document",
          module: "Document Vault",
          description: "Contract_Agreement.pdf (v2.0) was uploaded",
          ipAddress: "192.168.1.3",
        },
        {
          id: 4,
          timestamp: "2024-01-15T14:20:00",
          user: "Sarah Williams",
          action: "Approved EOT",
          module: "EOT Delay Tracking",
          description: "EOT-001 was approved for 5 days",
          ipAddress: "192.168.1.4",
        },
        {
          id: 5,
          timestamp: "2024-01-15T11:00:00",
          user: "David Chen",
          action: "Submitted Tender",
          module: "Tender Console",
          description: "TEN-002 was submitted by ABC Construction",
          ipAddress: "192.168.1.5",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getModuleColor = (module) => {
    const colors = {
      "VO Governor": "bg-orange-100 text-orange-700",
      RFI: "bg-purple-100 text-purple-700",
      "Document Vault": "bg-green-100 text-green-700",
      "EOT Delay Tracking": "bg-red-100 text-red-700",
      "Tender Console": "bg-blue-100 text-blue-700",
      Dashboard: "bg-teal-100 text-teal-700",
    };
    return colors[module] || "bg-gray-100 text-gray-700";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateObj = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (dateObj.getTime() === today.getTime()) {
      return `Today, ${time}`;
    }
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paginatedLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(logs.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={filters.dateRange.start}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value },
                  })
                }
              />
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User
            </label>
            <input
              type="text"
              placeholder="Filter by user..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Module
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={filters.module}
              onChange={(e) =>
                setFilters({ ...filters, module: e.target.value })
              }
            >
              <option value="">All Modules</option>
              <option value="VO Governor">VO Governor</option>
              <option value="RFI">RFI</option>
              <option value="Document Vault">Document Vault</option>
              <option value="EOT Delay Tracking">EOT Delay Tracking</option>
              <option value="Tender Console">Tender Console</option>
              <option value="Dashboard">Dashboard</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() =>
              setFilters({
                dateRange: { start: "", end: "" },
                user: "",
                module: "",
              })
            }
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Clear Filters
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Activity Timeline
            </h3>
            <p className="text-sm text-slate-500">
              Showing {logs.length} activities
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-semibold text-slate-900">
                          {log.user}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getModuleColor(log.module)}`}
                        >
                          {log.module}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-1">
                        <span className="font-medium">{log.action}</span> -{" "}
                        {log.description}
                      </p>
                      <p className="text-xs text-slate-400">
                        IP: {log.ipAddress}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, logs.length)} of{" "}
                  {logs.length} entries
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === idx + 1
                          ? "bg-teal-600 text-white"
                          : "border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
