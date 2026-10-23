// features/Projects/modules/EOTDelayTracking.jsx
import React, { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingUp,
  FileText,
  User,
  Plus,
  Search,
  Eye,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const EOTDelayTracking = ({ projectId }) => {
  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDelay, setSelectedDelay] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [summary, setSummary] = useState({
    totalDelays: 0,
    pendingApprovals: 0,
    approvedDelayDays: 0,
    impactByCategory: [],
    timelineData: [],
  });

  useEffect(() => {
    fetchDelays();
  }, [projectId]);

  const fetchDelays = async () => {
    setLoading(true);
    try {
      // Replace with actual API calls
      const response = await fetch(`/api/projects/${projectId}/delays`);
      const result = await response.json();
      setDelays(result);

      // Mock summary data
      setSummary({
        totalDelays: 8,
        pendingApprovals: 3,
        approvedDelayDays: 45,
        impactByCategory: [
          { name: "Weather", days: 12 },
          { name: "Material Delay", days: 18 },
          { name: "Labor Shortage", days: 8 },
          { name: "Design Changes", days: 7 },
        ],
        timelineData: [
          { week: "Week 1", delays: 2 },
          { week: "Week 2", delays: 3 },
          { week: "Week 3", delays: 1 },
          { week: "Week 4", delays: 2 },
        ],
      });
    } catch (error) {
      console.error("Failed to fetch delays:", error);
      // Mock data
      setDelays([
        {
          id: "EOT-001",
          reason: "Severe weather conditions",
          daysImpact: 5,
          status: "Approved",
          submittedBy: "John Doe",
          submittedDate: "2024-01-10",
          description: "Heavy rainfall prevented foundation work",
          supportingDocs: ["weather_report.pdf"],
        },
        {
          id: "EOT-002",
          reason: "Material delivery delay",
          daysImpact: 8,
          status: "Pending",
          submittedBy: "Mike Johnson",
          submittedDate: "2024-01-12",
          description: "Steel reinforcement delayed by supplier",
          supportingDocs: ["supplier_letter.pdf"],
        },
        {
          id: "EOT-003",
          reason: "Design change request",
          daysImpact: 3,
          status: "Review",
          submittedBy: "Sarah Williams",
          submittedDate: "2024-01-14",
          description: "Architectural changes required additional time",
          supportingDocs: ["change_order.pdf"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Review: "bg-blue-100 text-blue-700",
      Approved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {status}
    </span>
  );

  const SummaryCard = ({ title, value, icon: Icon, color, suffix = "" }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">
            {value}
            {suffix}
          </p>
        </div>
        <div className={`p-3 bg-${color}-50 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const DelayDetailView = ({ delay, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{delay.id}</h2>
              <p className="text-sm text-slate-500">
                Extension of Time Request
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Days Impact</p>
                <p className="text-2xl font-bold text-teal-600">
                  {delay.daysImpact} days
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Status</p>
                <StatusBadge status={delay.status} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Reason for Delay
              </h3>
              <p className="text-slate-700">{delay.reason}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Detailed Description
              </h3>
              <p className="text-slate-700">{delay.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Submitted By
              </h3>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700">{delay.submittedBy}</span>
                <span className="text-sm text-slate-500 ml-2">
                  {delay.submittedDate}
                </span>
              </div>
            </div>

            {delay.supportingDocs && delay.supportingDocs.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Supporting Documents
                </h3>
                <div className="space-y-2">
                  {delay.supportingDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 flex-1">
                        {doc}
                      </span>
                      <button className="text-teal-600 text-sm">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {delay.status === "Pending" && (
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Approve
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreateDelayForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
      reason: "",
      description: "",
      daysImpact: "",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("Creating delay request:", formData);
      onClose();
      fetchDelays();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              Submit EOT Request
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Delay
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Days Impacted
              </label>
              <input
                type="number"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData.daysImpact}
                onChange={(e) =>
                  setFormData({ ...formData, daysImpact: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Supporting Documents
              </label>
              <input
                type="file"
                multiple
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Delays"
          value={summary.totalDelays}
          icon={AlertTriangle}
          color="orange"
        />
        <SummaryCard
          title="Pending Approvals"
          value={summary.pendingApprovals}
          icon={Clock}
          color="yellow"
        />
        <SummaryCard
          title="Approved Delay Days"
          value={summary.approvedDelayDays}
          icon={Calendar}
          color="teal"
          suffix=" days"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Delays by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.impactByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="days" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Delay Timeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="delays"
                stroke="#14b8a6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delays Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Delay Register</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" />
            Submit EOT
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  Delay ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  Reason
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                  Days Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {delays.map((delay) => (
                <tr key={delay.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sm text-teal-600">
                    {delay.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{delay.reason}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    {delay.daysImpact}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={delay.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {delay.submittedDate}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedDelay(delay);
                        setShowDetailView(true);
                      }}
                      className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateForm && (
        <CreateDelayForm onClose={() => setShowCreateForm(false)} />
      )}
      {showDetailView && selectedDelay && (
        <DelayDetailView
          delay={selectedDelay}
          onClose={() => {
            setShowDetailView(false);
            setSelectedDelay(null);
          }}
        />
      )}
    </div>
  );
};

export default EOTDelayTracking;
