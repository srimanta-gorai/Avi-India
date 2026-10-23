// features/Projects/modules/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = ({ projectId }) => {
  const [data, setData] = useState({
    summary: {
      totalContractValue: 0,
      approvedVOValue: 0,
      pendingVOValue: 0,
      delayDays: 0,
    },
    voTrend: [],
    budgetVsActual: [],
    delaysBreakdown: [],
    pendingApprovals: [],
    overdueRFIs: [],
    criticalAlerts: [],
    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [projectId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Replace with actual API calls
      const response = await fetch(`/api/projects/${projectId}/dashboard`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Mock data for demonstration
      setData({
        summary: {
          totalContractValue: 25000000,
          approvedVOValue: 1250000,
          pendingVOValue: 450000,
          delayDays: 15,
        },
        voTrend: [
          { month: "Jan", value: 50000 },
          { month: "Feb", value: 75000 },
          { month: "Mar", value: 120000 },
          { month: "Apr", value: 95000 },
          { month: "May", value: 150000 },
          { month: "Jun", value: 180000 },
        ],
        budgetVsActual: [
          { category: "Materials", budget: 8000000, actual: 8500000 },
          { category: "Labor", budget: 6000000, actual: 5800000 },
          { category: "Equipment", budget: 3000000, actual: 3200000 },
          { category: "Subcontractors", budget: 4000000, actual: 4200000 },
          { category: "Overhead", budget: 2000000, actual: 1900000 },
        ],
        delaysBreakdown: [
          { name: "Weather", value: 8 },
          { name: "Material", value: 5 },
          { name: "Labor", value: 3 },
          { name: "Design", value: 4 },
          { name: "Other", value: 2 },
        ],
        pendingApprovals: [
          {
            id: "VO-001",
            title: "Additional Foundation Work",
            amount: 75000,
            requestedBy: "John Doe",
            date: "2024-01-15",
          },
          {
            id: "VO-002",
            title: "Electrical Upgrade",
            amount: 120000,
            requestedBy: "Jane Smith",
            date: "2024-01-14",
          },
          {
            id: "RFI-023",
            title: "Structural Clarification",
            type: "RFI",
            date: "2024-01-13",
          },
        ],
        overdueRFIs: [
          {
            id: "RFI-018",
            question: "Floor finish specifications",
            assignedTo: "Architect",
            dueDate: "2024-01-10",
          },
          {
            id: "RFI-019",
            question: "Window installation details",
            assignedTo: "Engineer",
            dueDate: "2024-01-12",
          },
        ],
        criticalAlerts: [
          {
            type: "Delay",
            message: "Concrete delivery delayed by 3 days",
            severity: "high",
            date: "2024-01-16",
          },
          {
            type: "Budget",
            message: "Material costs exceeded by 8%",
            severity: "medium",
            date: "2024-01-15",
          },
        ],
        recentActivity: [
          {
            user: "John Doe",
            action: "Created new VO",
            module: "VO Governor",
            timestamp: "2024-01-16T10:30:00",
          },
          {
            user: "Jane Smith",
            action: "Answered RFI #021",
            module: "RFI",
            timestamp: "2024-01-16T09:15:00",
          },
          {
            user: "Mike Johnson",
            action: "Uploaded document",
            module: "Document Vault",
            timestamp: "2024-01-15T16:45:00",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const SummaryCard = ({
    title,
    value,
    icon: Icon,
    color,
    prefix = "",
    suffix = "",
  }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">
            {prefix}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Contract Value"
          value={data.summary.totalContractValue}
          icon={DollarSign}
          color="teal"
          prefix="S$"
        />
        <SummaryCard
          title="Approved VO Value"
          value={data.summary.approvedVOValue}
          icon={TrendingUp}
          color="green"
          prefix="S$"
        />
        <SummaryCard
          title="Pending VO Value"
          value={data.summary.pendingVOValue}
          icon={Clock}
          color="orange"
          prefix="S$"
        />
        <SummaryCard
          title="Total Delay Days"
          value={data.summary.delayDays}
          icon={AlertTriangle}
          color="red"
          suffix=" days"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VO Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">VO Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.voTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#14b8a6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget vs Actual Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Budget vs Actual
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.budgetVsActual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#94a3b8" />
              <Bar dataKey="actual" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delays Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Delays Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.delaysBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.delaysBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Pending Approvals
          </h3>
          <div className="space-y-3">
            {data.pendingApprovals.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.id} • {item.requestedBy || item.type}
                  </p>
                </div>
                <button className="px-3 py-1 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue RFIs */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Overdue RFIs
          </h3>
          <div className="space-y-3">
            {data.overdueRFIs.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {item.question}
                  </p>
                  <p className="text-xs text-red-600">Due: {item.dueDate}</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {data.recentActivity.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-3 border-b border-slate-100 last:border-0"
            >
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-900">
                  <span className="font-semibold">{activity.user}</span>{" "}
                  {activity.action}
                </p>
                <p className="text-xs text-slate-500">{activity.module}</p>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
