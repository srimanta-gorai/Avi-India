// features/Projects/modules/VOGovernor.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MessageSquare,
  User,
  Calendar,
  FileText,
  X,
  Send,
  Edit2,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useGetVOs,
  useGetVODetails,
  useCreateVO,
  useReviewVO,
  useApproveVO,
  useGetBudgetImpact,
  VO_STATUS,
  VO_STATUS_LABELS,
  VO_STATUS_COLORS,
  VO_RISK,
  VO_RISK_LABELS,
  VO_RISK_COLORS,
  VO_RISK_BG_COLORS,
} from "../app/api/voApi";
import { useTenders } from "../app/api/tenderApi";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

// Main Component Content
const VOGovernorContent = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedVOId, setSelectedVOId] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [reviewAction, setReviewAction] = useState("approve");
  const [reviewComment, setReviewComment] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [approveSignature, setApproveSignature] = useState("");
  const [selectedTenderId, setSelectedTenderId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lineItems: [
      {
        contractBoqItemId: "",
        description: "",
        unit: "",
        quantity: "",
        unitRate: "",
        isNewScope: true,
      },
    ],
  });
  const [toast, setToast] = useState(null);

  // Fetch tenders for the project
  const {
    data: tendersData,
    isLoading: tendersLoading,
    refetch: refetchTenders,
  } = useTenders({ projectId, pageSize: 100, pageNo: 1 });

  const {
    data: vosData,
    isLoading: vosLoading,
    refetch: refetchVOs,
  } = useGetVOs({ projectId, status: filterStatus });

  const {
    data: voDetails,
    isLoading: voDetailsLoading,
    refetch: refetchVODetails,
  } = useGetVODetails(selectedVOId);

  const {
    data: budgetImpact,
    isLoading: budgetLoading,
    refetch: refetchBudget,
  } = useGetBudgetImpact(projectId);

  const createVOMutation = useCreateVO();
  const reviewVOMutation = useReviewVO();
  const approveVOMutation = useApproveVO();

  // Reset selected tender when project changes
  useEffect(() => {
    setSelectedTenderId("");
  }, [projectId]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateVO = async (e) => {
    e.preventDefault();

    if (!selectedTenderId) {
      showToast("Please select a tender", "error");
      return;
    }

    const payload = {
      projectId: projectId,
      tenderId: selectedTenderId,
      title: formData.title,
      description: formData.description,
      lineItems: formData.lineItems.map((item) => ({
        contractBoqItemId: item.contractBoqItemId || null,
        description: item.description,
        unit: item.unit,
        quantity: parseFloat(item.quantity) || 0,
        unitRate: parseFloat(item.unitRate) || 0,
        isNewScope: item.isNewScope,
      })),
    };

    const result = await createVOMutation.mutateAsync(payload);
    if (result.success) {
      setShowCreateForm(false);
      setSelectedTenderId("");
      setFormData({
        title: "",
        description: "",
        lineItems: [
          {
            contractBoqItemId: "",
            description: "",
            unit: "",
            quantity: "",
            unitRate: "",
            isNewScope: true,
          },
        ],
      });
      refetchVOs();
      refetchBudget();
      showToast("Variation Order created successfully!");
    } else {
      showToast(result.message || "Failed to create VO", "error");
    }
  };

  const handleReviewVO = async () => {
    if (!selectedVOId) return;

    const result = await reviewVOMutation.mutateAsync({
      id: selectedVOId,
      action: reviewAction,
      comments: reviewComment,
    });

    if (result.success) {
      setShowReviewModal(false);
      setReviewComment("");
      setReviewAction("approve");
      refetchVODetails();
      refetchVOs();
      refetchBudget();
      showToast(
        `VO ${reviewAction === "approve" ? "approved" : "rejected"} successfully!`,
      );
    } else {
      showToast(result.message || "Failed to review VO", "error");
    }
  };

  const handleApproveVO = async () => {
    if (!selectedVOId) return;

    const result = await approveVOMutation.mutateAsync({
      id: selectedVOId,
      approvedAmount: parseFloat(approveAmount) || 0,
      eSignature: approveSignature,
    });

    if (result.success) {
      setShowApproveModal(false);
      setApproveAmount("");
      setApproveSignature("");
      refetchVODetails();
      refetchVOs();
      refetchBudget();
      showToast("VO approved successfully!");
    } else {
      showToast(result.message || "Failed to approve VO", "error");
    }
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          contractBoqItemId: "",
          description: "",
          unit: "",
          quantity: "",
          unitRate: "",
          isNewScope: true,
        },
      ],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const getVORisk = (vo) => {
    if (!vo.variancePct) return VO_RISK.LOW;
    const variance = parseFloat(vo.variancePct);
    if (variance > 15) return VO_RISK.HIGH;
    if (variance > 5) return VO_RISK.MEDIUM;
    return VO_RISK.LOW;
  };

  const filteredVOs =
    vosData?.data?.filter((vo) => {
      const search = searchQuery.toLowerCase();
      return (
        vo.title?.toLowerCase().includes(search) ||
        vo.voCode?.toLowerCase().includes(search) ||
        vo.description?.toLowerCase().includes(search)
      );
    }) || [];

  // Get total counts for KPIs
  const totalVOs = vosData?.data?.length || 0;
  const pendingVOs =
    vosData?.data?.filter((vo) => vo.status === VO_STATUS.PENDING).length || 0;
  const approvedVOs =
    vosData?.data?.filter((vo) => vo.status === VO_STATUS.APPROVED).length || 0;
  const rejectedVOs =
    vosData?.data?.filter((vo) => vo.status === VO_STATUS.REJECTED).length || 0;

  if (vosLoading || budgetLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-teal-500 text-white"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-600 font-medium">Total VOs</p>
              <p className="text-2xl font-bold text-teal-900">{totalVOs}</p>
            </div>
            <FileText className="w-10 h-10 text-teal-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">
                Pending Review
              </p>
              <p className="text-2xl font-bold text-amber-900">{pendingVOs}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Approved</p>
              <p className="text-2xl font-bold text-emerald-900">
                {approvedVOs}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{rejectedVOs}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Budget Impact</p>
              <p className="text-2xl font-bold text-blue-900">
                S${budgetImpact?.data?.pendingVoSum?.toLocaleString() || 0}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search VOs by title, code or description..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value={VO_STATUS.DRAFT}>Draft</option>
            <option value={VO_STATUS.PENDING}>Pending Review</option>
            <option value={VO_STATUS.APPROVED}>Approved</option>
            <option value={VO_STATUS.REJECTED}>Rejected</option>
            <option value={VO_STATUS.CANCELLED}>Cancelled</option>
          </select>

          <button
            onClick={() => {
              setShowCreateForm(true);
              refetchTenders();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Create VO
          </button>
        </div>
      </div>

      {/* VO Table */}

      <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
        {filteredVOs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No Variation Orders
            </h3>
            <p className="text-sm text-slate-500">
              {searchQuery || filterStatus
                ? "No VOs match your filters"
                : "Create your first variation order to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    VO Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Tender Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Tender Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Risk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Raised At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVOs.map((vo) => {
                  const risk = getVORisk(vo);
                  const statusColor =
                    VO_STATUS_COLORS[vo.status] || "bg-slate-50 text-slate-700";
                  const riskColor = VO_RISK_COLORS[risk];
                  const riskBgColor = VO_RISK_BG_COLORS[risk];
                  const riskLabel = VO_RISK_LABELS[risk];

                  return (
                    <motion.tr
                      key={vo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => {
                        setSelectedVOId(vo.id);
                        setShowDetailView(true);
                      }}
                    >
                      <td className="px-4 py-3 text-sm font-mono font-medium text-slate-900">
                        {vo.voCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {vo.title}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-600">
                        {vo.tender?.tenderCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {vo.tender?.title || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-bold text-slate-900">
                        S${parseFloat(vo.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                        >
                          {VO_STATUS_LABELS[vo.status] || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${riskBgColor}`}
                          />
                          <span className={`text-sm font-medium ${riskColor}`}>
                            {riskLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {vo.raisedAt
                          ? new Date(vo.raisedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVOId(vo.id);
                            setShowDetailView(true);
                          }}
                          className="p-1.5 hover:bg-teal-50 rounded-lg transition text-teal-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create VO Drawer */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">
                    Create Variation Order
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleCreateVO} className="space-y-6">
                    {/* Tender Selection - Added at the top */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Select Tender *
                      </label>
                      <div className="relative">
                        <select
                          required
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                          value={selectedTenderId}
                          onChange={(e) => setSelectedTenderId(e.target.value)}
                          disabled={tendersLoading}
                        >
                          <option value="">Select a tender</option>
                          {tendersData?.data?.tenders?.map((tender) => (
                            <option key={tender.id} value={tender.id}>
                              {tender.tenderCode} - {tender.title}
                            </option>
                          ))}
                        </select>
                        {tendersLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                          </div>
                        )}
                      </div>
                      {tendersData?.data?.tenders?.length === 0 &&
                        !tendersLoading && (
                          <p className="mt-1 text-xs text-amber-600">
                            No tenders available for this project. Please create
                            a tender first.
                          </p>
                        )}
                      <button
                        type="button"
                        onClick={() => refetchTenders()}
                        className="mt-1 flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Refresh tenders
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Enter VO title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe the variation order..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-slate-700">
                          Line Items
                        </label>
                        <button
                          type="button"
                          onClick={addLineItem}
                          className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add Item
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formData.lineItems.map((item, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-slate-700">
                                Item #{index + 1}
                              </span>
                              {formData.lineItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeLineItem(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Description *
                                </label>
                                <input
                                  type="text"
                                  required
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateLineItem(
                                      index,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Item description"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Unit
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                  value={item.unit}
                                  onChange={(e) =>
                                    updateLineItem(
                                      index,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g., m³, kg, lot"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateLineItem(
                                      index,
                                      "quantity",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Unit Rate (S$)
                                </label>
                                <input
                                  type="number"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                  value={item.unitRate}
                                  onChange={(e) =>
                                    updateLineItem(
                                      index,
                                      "unitRate",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                  step="0.01"
                                />
                              </div>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={item.isNewScope}
                                onChange={(e) =>
                                  updateLineItem(
                                    index,
                                    "isNewScope",
                                    e.target.checked,
                                  )
                                }
                                className="rounded text-teal-600 focus:ring-teal-500"
                              />
                              <label className="text-sm text-slate-600">
                                This is a new scope item
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          createVOMutation.isPending || !selectedTenderId
                        }
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                      >
                        {createVOMutation.isPending
                          ? "Creating..."
                          : "Create VO"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VO Detail View Modal - Keep the same */}
      <AnimatePresence>
        {showDetailView && selectedVOId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowDetailView(false);
              setSelectedVOId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {voDetailsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <>
                  <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {voDetails?.data?.vo?.title}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {voDetails?.data?.vo?.voCode}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDetailView(false);
                        setSelectedVOId(null);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4">
                        <p className="text-sm text-teal-700 mb-1">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-teal-900">
                          S$
                          {parseFloat(
                            voDetails?.data?.vo?.totalAmount || 0,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <p className="text-sm text-blue-700 mb-1">Status</p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${VO_STATUS_COLORS[voDetails?.data?.vo?.status]}`}
                        >
                          {VO_STATUS_LABELS[voDetails?.data?.vo?.status] ||
                            "Unknown"}
                        </span>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <p className="text-sm text-purple-700 mb-1">
                          Risk Level
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${VO_RISK_BG_COLORS[getVORisk(voDetails?.data?.vo)]}`}
                          />
                          <span
                            className={`font-semibold ${VO_RISK_COLORS[getVORisk(voDetails?.data?.vo)]}`}
                          >
                            {VO_RISK_LABELS[getVORisk(voDetails?.data?.vo)]}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                        <p className="text-sm text-amber-700 mb-1">Variance</p>
                        <p className="text-2xl font-bold text-amber-900">
                          {parseFloat(
                            voDetails?.data?.vo?.variancePct || 0,
                          ).toFixed(2)}
                          %
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-slate-600">
                        {voDetails?.data?.vo?.description}
                      </p>
                    </div>

                    {/* Line Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        Line Items
                      </h4>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">
                                Description
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
                                Unit
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
                                Quantity
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
                                Unit Rate
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
                                Total
                              </th>
                              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
                                New Scope
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {voDetails?.data?.lineItems?.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2 text-sm text-slate-700">
                                  {item.description}
                                </td>
                                <td className="px-4 py-2 text-sm text-slate-600 text-center">
                                  {item.unit}
                                </td>
                                <td className="px-4 py-2 text-sm text-slate-600 text-center">
                                  {parseFloat(item.quantity).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-sm text-slate-600 text-center">
                                  S${parseFloat(item.unitRate).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-sm font-semibold text-slate-900 text-center">
                                  S$
                                  {parseFloat(
                                    item.totalAmount,
                                  ).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-sm text-slate-600 text-center">
                                  {item.isNewScope ? (
                                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">
                                      New
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                      Existing
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Approval Steps */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        Approval Workflow
                      </h4>
                      <div className="space-y-3">
                        {voDetails?.data?.approvalSteps?.map((step) => {
                          const stepTypeLabels = {
                            100: "Site Engineer",
                            101: "Project Manager",
                            102: "Cost Control",
                            103: "Client",
                          };
                          const stepStatusColors = {
                            100: "bg-amber-50 text-amber-700 border-amber-200",
                            101: "bg-emerald-50 text-emerald-700 border-emerald-200",
                            102: "bg-red-50 text-red-700 border-red-200",
                          };
                          const stepStatusLabels = {
                            100: "Pending",
                            101: "Approved",
                            102: "Rejected",
                          };

                          return (
                            <div
                              key={step.id}
                              className="flex items-start gap-4"
                            >
                              <div className="relative">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    step.status === 101
                                      ? "bg-emerald-100"
                                      : step.status === 102
                                        ? "bg-red-100"
                                        : "bg-amber-100"
                                  }`}
                                >
                                  {step.status === 101 ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                  ) : step.status === 102 ? (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-amber-600" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-slate-900">
                                    {stepTypeLabels[step.stepType] ||
                                      `Step ${step.stepOrder}`}
                                  </p>
                                  <span
                                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${stepStatusColors[step.status] || "bg-slate-50 text-slate-700"}`}
                                  >
                                    {stepStatusLabels[step.status] || "Pending"}
                                  </span>
                                </div>
                                {step.comments && (
                                  <p className="text-sm text-slate-600 mt-1">
                                    {step.comments}
                                  </p>
                                )}
                                {step.actedAt && (
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {new Date(step.actedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                      {voDetails?.data?.vo?.status === VO_STATUS.PENDING && (
                        <>
                          <button
                            onClick={() => setShowReviewModal(true)}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition"
                          >
                            Review & Approve
                          </button>
                          <button
                            onClick={() => setShowApproveModal(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                          >
                            Final Approve
                          </button>
                        </>
                      )}
                      {voDetails?.data?.vo?.status === VO_STATUS.DRAFT && (
                        <button
                          onClick={() => {
                            setReviewAction("pending");
                            setShowReviewModal(true);
                          }}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition"
                        >
                          Submit for Review
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowReviewModal(false);
              setReviewAction("approve");
              setReviewComment("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {reviewAction === "pending" ? "Submit for Review" : "Review VO"}
              </h3>
              <div className="space-y-4">
                {reviewAction !== "pending" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Action
                    </label>
                    <select
                      value={reviewAction}
                      onChange={(e) => setReviewAction(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Comments {reviewAction === "pending" && "(Optional)"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      reviewAction === "pending"
                        ? "Add submission notes..."
                        : "Add review comments..."
                    }
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewAction("approve");
                    setReviewComment("");
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewVO}
                  disabled={reviewVOMutation.isPending}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {reviewVOMutation.isPending
                    ? reviewAction === "pending"
                      ? "Submitting..."
                      : "Processing..."
                    : reviewAction === "pending"
                      ? "Submit for Review"
                      : "Submit Review"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Final Approval
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Approved Amount (S$)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={approveAmount}
                    onChange={(e) => setApproveAmount(e.target.value)}
                    placeholder="Enter approved amount"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-Signature
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={approveSignature}
                    onChange={(e) => setApproveSignature(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveVO}
                  disabled={approveVOMutation.isPending || !approveSignature}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {approveVOMutation.isPending ? "Approving..." : "Approve VO"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Wrap the component with QueryClientProvider
const VOGovernor = ({ projectId }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <VOGovernorContent projectId={projectId} />
    </QueryClientProvider>
  );
};

export default VOGovernor;
