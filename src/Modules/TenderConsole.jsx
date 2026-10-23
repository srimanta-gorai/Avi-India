import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Send,
  XCircle,
  Award,
  ChevronRight,
  Home,
  Building2,
  Package,
  Calendar,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Edit2,
  Send as SendIcon,
  UserPlus,
  Mail,
  MoreVertical,
  Crown,
  FolderOpen,
  ArrowLeft,
  Calculator,
  X,
  FileSpreadsheet,
  ClipboardList,
  RefreshCw,
  Save,
  User,
  Phone,
  Award as AwardIcon,
  Star,
  Shield,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  useBoqItems,
  useBoqTemplates,
  useCreateTender,
  useTenderDetails,
  useTenders,
  useUpdateBoqQuantity,
  useUpdateTender,
  useIssueTender,
  useCloseTender,
  useAwardTender,
  useGetContractors,
  useInviteContractors,
  useUpdateContractorStatus,
  useGetTeamMembers,
  useGetClarifications,
  useCreateClarification,
  useAnswerClarification,
  useGetSubmissions,
  useGetSubmissionDetails,
  useUpdateSubmissionItems,
  useSubmitSubmission,
  useGetAwardDetails,
  useGetEvaluations,
  useCreateEvaluation,
  CONTRACTOR_STATUS,
  CONTRACTOR_STATUS_LABELS,
  CONTRACTOR_STATUS_COLORS,
  CLARIFICATION_STATUS_LABELS,
  CLARIFICATION_STATUS_COLORS,
  SUBMISSION_STATUS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_COLORS,
} from "../app/api/tenderApi";

// Status Constants
const STATUS_LABELS = {
  100: "Draft",
  101: "Issued",
  102: "Closed",
  103: "Awarded",
  104: "Archived",
};

const STATUS_COLORS = {
  100: "bg-teal-50 text-teal-700 border-teal-200",
  101: "bg-cyan-50 text-cyan-700 border-cyan-200",
  102: "bg-amber-50 text-amber-700 border-amber-200",
  103: "bg-emerald-50 text-emerald-700 border-emerald-200",
  104: "bg-slate-50 text-slate-700 border-slate-200",
};

// Zod Schema
const tenderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tradePackageName: z.string().min(1, "Trade package is required"),
  boqTemplateId: z.string().min(1, "BOQ template is required"),
  tenderStartDate: z.string().min(1, "Start date is required"),
  tenderCloseDate: z.string().min(1, "Close date is required"),
  evaluationCriteria: z.string().optional(),
  awardThreshold: z.number().min(0, "Award threshold must be positive"),
});

const evaluationSchema = z.object({
  submissionId: z.string().min(1, "Submission is required"),
  overallComment: z.string().optional(),
  riskNotes: z.string().optional(),
  recommendation: z.number().min(0, "Recommendation is required"),
  evaluatedScore: z.number().min(0, "Score is required"),
});

// Main Component
const TenderConsole = () => {
  const { companyId } = useParams();
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditTenderDrawer, setShowEditTenderDrawer] = useState(false);
  const [showQuantityEditDrawer, setShowQuantityEditDrawer] = useState(false);
  const [showInviteContractorDrawer, setShowInviteContractorDrawer] =
    useState(false);
  const [showAskQuestionDrawer, setShowAskQuestionDrawer] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
  const [showEvaluationDrawer, setShowEvaluationDrawer] = useState(false);
  const [editingQuantityItem, setEditingQuantityItem] = useState(null);
  const [filters, setFilters] = useState({
    pageSize: 10,
    pageNo: 1,
    status: "",
    search: "",
    projectId: companyId,
  });
  const [createStep, setCreateStep] = useState(1);
  const [toast, setToast] = useState(null);
  const [quantityValue, setQuantityValue] = useState("");
  const [contractorSearch, setContractorSearch] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [teamMemberSearch, setTeamMemberSearch] = useState("");
  const [teamMemberPage, setTeamMemberPage] = useState(1);
  const [questionText, setQuestionText] = useState("");
  const [answerTexts, setAnswerTexts] = useState({});
  const [editAnswerTexts, setEditAnswerTexts] = useState({});
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [editingRates, setEditingRates] = useState({});
  const [rateNotes, setRateNotes] = useState({});
  const [selectedAwardSubmissionId, setSelectedAwardSubmissionId] =
    useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previousTab, setPreviousTab] = useState("details");

  const {
    data: tendersData,
    isLoading: tendersLoading,
    refetch: refetchTenders,
  } = useTenders(filters);
  const {
    data: tenderDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useTenderDetails(selectedTenderId);
  const { data: boqTemplatesData } = useBoqTemplates();
  const {
    data: boqItems,
    isLoading: boqLoading,
    refetch: refetchBoqItems,
  } = useBoqItems(selectedTenderId);

  // Contractor hooks
  const {
    data: contractorsData,
    isLoading: contractorsLoading,
    refetch: refetchContractors,
  } = useGetContractors(selectedTenderId);
  const {
    data: teamMembersData,
    isLoading: teamMembersLoading,
    refetch: refetchTeamMembers,
  } = useGetTeamMembers(teamMemberSearch, teamMemberPage, 10);

  // Clarification hooks
  const {
    data: clarificationsData,
    isLoading: clarificationsLoading,
    refetch: refetchClarifications,
  } = useGetClarifications(selectedTenderId);

  // Submission hooks
  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    refetch: refetchSubmissions,
  } = useGetSubmissions(selectedTenderId);

  const {
    data: submissionDetails,
    isLoading: submissionDetailsLoading,
    refetch: refetchSubmissionDetails,
  } = useGetSubmissionDetails({
    tenderId: selectedTenderId,
    submissionId: selectedSubmissionId,
  });

  // Award hooks
  const {
    data: awardDetails,
    isLoading: awardLoading,
    refetch: refetchAwardDetails,
  } = useGetAwardDetails(selectedTenderId);

  // Evaluation hooks
  const {
    data: evaluationsData,
    isLoading: evaluationsLoading,
    refetch: refetchEvaluations,
  } = useGetEvaluations(selectedTenderId);

  const createEvaluationMutation = useCreateEvaluation();

  // Refetch submissions when switching to pricing tab
  useEffect(() => {
    if (activeTab === "pricing" && selectedTenderId) {
      refetchSubmissions();
      if (selectedSubmissionId) {
        refetchSubmissionDetails();
      }
    }
  }, [
    activeTab,
    selectedTenderId,
    refetchSubmissions,
    refetchSubmissionDetails,
    selectedSubmissionId,
  ]);

  useEffect(() => {
    // Check if any drawer or modal is open
    const isAnyOpen =
      showCreateDrawer ||
      showEditTenderDrawer ||
      showQuantityEditDrawer ||
      showInviteContractorDrawer ||
      showAskQuestionDrawer ||
      showIssueModal ||
      showCloseModal ||
      showAwardModal ||
      showCreateConfirmation ||
      showEvaluationDrawer;

    if (isAnyOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling on body
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Cleanup function to restore scroll when drawers/modals close
      return () => {
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        // Restore scroll position
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      };
    }
  }, [
    showCreateDrawer,
    showEditTenderDrawer,
    showQuantityEditDrawer,
    showInviteContractorDrawer,
    showAskQuestionDrawer,
    showIssueModal,
    showCloseModal,
    showAwardModal,
    showCreateConfirmation,
    showEvaluationDrawer,
  ]);

  useEffect(() => {
    if (showInviteContractorDrawer) {
      refetchTeamMembers();
    }
  }, [showInviteContractorDrawer, refetchTeamMembers]);

  useEffect(() => {
    setSelectedSubmissionId(null);
  }, [selectedTenderId]);

  // Auto-refresh submissions when data changes
  useEffect(() => {
    if (selectedTenderId) {
      refetchSubmissions();
    }
  }, [selectedTenderId, refetchSubmissions]);

  // Auto-refresh submission details when selected submission changes
  useEffect(() => {
    if (selectedSubmissionId) {
      refetchSubmissionDetails();
    }
  }, [selectedSubmissionId, refetchSubmissionDetails]);

  const createTenderMutation = useCreateTender();
  const issueTenderMutation = useIssueTender();
  const closeTenderMutation = useCloseTender();
  const awardTenderMutation = useAwardTender();
  const updateQuantityMutation = useUpdateBoqQuantity();
  const updateTenderMutation = useUpdateTender();
  const inviteContractorsMutation = useInviteContractors();
  const updateContractorStatusMutation = useUpdateContractorStatus();
  const createClarificationMutation = useCreateClarification();
  const answerClarificationMutation = useAnswerClarification();
  const updateSubmissionItemsMutation = useUpdateSubmissionItems();
  const submitSubmissionMutation = useSubmitSubmission();

  const form = useForm({
    resolver: zodResolver(tenderSchema),
    defaultValues: {
      title: "",
      tradePackageName: "",
      boqTemplateId: "",
      tenderStartDate: "",
      tenderCloseDate: "",
      evaluationCriteria: "",
      awardThreshold: 0,
    },
  });

  const editTenderForm = useForm({
    resolver: zodResolver(tenderSchema),
    defaultValues: {
      title: "",
      tradePackageName: "",
      boqTemplateId: "",
      tenderStartDate: "",
      tenderCloseDate: "",
      evaluationCriteria: "",
      awardThreshold: 0,
    },
  });

  const evaluationForm = useForm({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      submissionId: "",
      overallComment: "",
      riskNotes: "",
      recommendation: "",
      evaluatedScore: "",
    },
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateTender = async (data) => {
    const payload = {
      ...data,
      projectId: companyId,
    };
    const result = await createTenderMutation.mutateAsync(payload);
    if (result.success) {
      setShowCreateDrawer(false);
      setShowCreateConfirmation(false);
      form.reset();
      setCreateStep(1);
      refetchTenders();
      showToast("Tender created successfully!");
    } else {
      showToast(result.error || "Failed to create tender", "error");
    }
  };

  // Add this validation function inside the TenderConsole component, before the form handling functions

  const validateStep1 = () => {
    const errors = {};
    const values = form.getValues();

    if (!values.title || values.title.trim() === "") {
      errors.title = "Title is required";
    }

    if (!values.tradePackageName || values.tradePackageName.trim() === "") {
      errors.tradePackageName = "Trade package is required";
    }

    if (!values.boqTemplateId) {
      errors.boqTemplateId = "BOQ template is required";
    }

    if (!values.tenderStartDate) {
      errors.tenderStartDate = "Start date is required";
    }

    if (!values.tenderCloseDate) {
      errors.tenderCloseDate = "Close date is required";
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    const values = form.getValues();

    if (!values.awardThreshold || values.awardThreshold < 0) {
      errors.awardThreshold = "Award threshold must be a positive number";
    }

    return errors;
  };

  const handleNextStep = async () => {
    let errors = {};

    if (createStep === 1) {
      errors = validateStep1();
    } else if (createStep === 2) {
      errors = validateStep2();
    }

    if (Object.keys(errors).length > 0) {
      // Set errors to form state
      Object.keys(errors).forEach((key) => {
        form.setError(key, { message: errors[key] });
      });
      // Scroll to first error
      const firstErrorField = document.querySelector(".border-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
      return;
    }

    setCreateStep(createStep + 1);
  };

  const handleCreateConfirmation = (data) => {
    setPendingData(data);
    setShowCreateConfirmation(true);
  };

  const confirmCreateTender = () => {
    if (pendingData) {
      handleCreateTender(pendingData);
    }
  };

  const handleUpdateTender = async (data) => {
    const result = await updateTenderMutation.mutateAsync({
      id: selectedTenderId,
      data: data,
    });
    if (result.success) {
      setShowEditTenderDrawer(false);
      editTenderForm.reset();
      refetchDetails();
      showToast("Tender updated successfully!");
    } else {
      showToast(result.error || "Failed to update tender", "error");
    }
  };

  const handleIssueTender = async () => {
    const result = await issueTenderMutation.mutateAsync(selectedTenderId);
    if (result.success) {
      setShowIssueModal(false);
      refetchDetails();
      refetchTenders();
      showToast("Tender issued successfully!");
    } else {
      showToast(result.error || "Failed to issue tender", "error");
    }
  };

  const handleCloseTender = async () => {
    const result = await closeTenderMutation.mutateAsync(selectedTenderId);
    if (result.success) {
      setShowCloseModal(false);
      refetchDetails();
      refetchTenders();
      showToast("Tender closed successfully!");
    } else {
      showToast(result.error || "Failed to close tender", "error");
    }
  };

  const handleAwardTender = async () => {
    const result = await awardTenderMutation.mutateAsync({
      id: selectedTenderId,
      submissionId: selectedAwardSubmissionId,
    });
    if (result.success) {
      setShowAwardModal(false);
      setSelectedAwardSubmissionId(null);
      refetchDetails();
      refetchTenders();
      refetchAwardDetails();
      showToast("Tender awarded successfully!");
    } else {
      showToast(result.error || "Failed to award tender", "error");
    }
  };

  const handleUpdateQuantity = async () => {
    const result = await updateQuantityMutation.mutateAsync({
      tenderId: selectedTenderId,
      tenderBoqItemId: editingQuantityItem?.id,
      quantity: quantityValue,
    });
    if (result.success) {
      setShowQuantityEditDrawer(false);
      setEditingQuantityItem(null);
      setQuantityValue("");
      refetchBoqItems();
      showToast("Quantity updated successfully!");
    } else {
      showToast(result.error || "Failed to update quantity", "error");
    }
  };

  const handleInviteContractors = async () => {
    if (selectedTeamMembers.length === 0) {
      showToast("Please select at least one team member", "error");
      return;
    }

    const result = await inviteContractorsMutation.mutateAsync({
      tenderId: selectedTenderId,
      contractorIds: selectedTeamMembers,
    });

    if (result.success) {
      setShowInviteContractorDrawer(false);
      setSelectedTeamMembers([]);
      refetchContractors();
      showToast("Contractors invited successfully!");
    } else {
      showToast(result.error || "Failed to invite contractors", "error");
    }
  };

  const handleUpdateContractorStatus = async (contractorId, status) => {
    const result = await updateContractorStatusMutation.mutateAsync({
      tenderId: selectedTenderId,
      contractorId: contractorId,
      status: status,
    });

    if (result.success) {
      refetchContractors();
      showToast(
        `Contractor ${status === CONTRACTOR_STATUS.ACCEPTED ? "accepted" : "rejected"} successfully!`,
      );
    } else {
      showToast(result.error || "Failed to update status", "error");
    }
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim()) {
      showToast("Please enter a question", "error");
      return;
    }

    const result = await createClarificationMutation.mutateAsync({
      tenderId: selectedTenderId,
      question: questionText,
    });

    if (result.success) {
      setShowAskQuestionDrawer(false);
      setQuestionText("");
      refetchClarifications();
      showToast("Question posted successfully!");
    } else {
      showToast(result.error || "Failed to post question", "error");
    }
  };

  const handleAnswerClarification = async (clarificationId) => {
    const answer = answerTexts[clarificationId];
    if (!answer?.trim()) {
      showToast("Please enter an answer", "error");
      return;
    }

    const result = await answerClarificationMutation.mutateAsync({
      tenderId: selectedTenderId,
      clarificationId: clarificationId,
      answer: answer,
    });

    if (result.success) {
      setAnswerTexts((prev) => ({
        ...prev,
        [clarificationId]: "",
      }));
      refetchClarifications();
      showToast("Answer posted successfully!");
    } else {
      showToast(result.error || "Failed to post answer", "error");
    }
  };

  const handleEditAnswer = async (clarificationId) => {
    const answer = editAnswerTexts[clarificationId];
    if (!answer?.trim()) {
      showToast("Please enter an answer", "error");
      return;
    }

    const result = await answerClarificationMutation.mutateAsync({
      tenderId: selectedTenderId,
      clarificationId: clarificationId,
      answer: answer,
    });

    if (result.success) {
      setEditAnswerTexts((prev) => ({
        ...prev,
        [clarificationId]: "",
      }));
      refetchClarifications();
      showToast("Answer updated successfully!");
    } else {
      showToast(result.error || "Failed to update answer", "error");
    }
  };

  // Batch update for rates and notes
  const handleBatchUpdate = async () => {
    const itemsToUpdate = [];

    Object.keys(editingRates).forEach((itemId) => {
      const rate = editingRates[itemId];
      const note = rateNotes[itemId] || "";
      const originalItem = submissionDetails?.data?.items?.find(
        (item) => item.tenderBoqItemId === itemId,
      );

      if (
        originalItem &&
        (rate !== originalItem.unitRate || note !== originalItem.notes)
      ) {
        itemsToUpdate.push({
          tenderBoqItemId: itemId,
          unitRate: parseFloat(rate) || 0,
          notes: note,
        });
      }
    });

    if (itemsToUpdate.length === 0) {
      showToast("No changes to save", "info");
      return;
    }

    setIsSaving(true);
    const result = await updateSubmissionItemsMutation.mutateAsync({
      tenderId: selectedTenderId,
      submissionId: selectedSubmissionId,
      items: itemsToUpdate,
    });

    setIsSaving(false);

    if (result.success) {
      refetchSubmissionDetails();
      setEditingRates({});
      setRateNotes({});
      showToast(`${itemsToUpdate.length} item(s) updated successfully!`);
    } else {
      showToast(result.error || "Failed to update items", "error");
    }
  };

  const handleUpdateItemRate = (itemId, unitRate) => {
    setEditingRates((prev) => ({
      ...prev,
      [itemId]: unitRate,
    }));
  };

  const handleUpdateItemNote = (itemId, note) => {
    setRateNotes((prev) => ({
      ...prev,
      [itemId]: note,
    }));
  };

  const handleSubmitSubmission = async () => {
    const result = await submitSubmissionMutation.mutateAsync({
      tenderId: selectedTenderId,
      submissionId: selectedSubmissionId,
    });

    if (result.success) {
      refetchSubmissions();
      refetchSubmissionDetails();
      setEditingRates({});
      setRateNotes({});
      showToast("Submission finalized successfully!");
    } else {
      showToast(result.error || "Failed to submit", "error");
    }
  };

  const handleCreateEvaluation = async (data) => {
    const result = await createEvaluationMutation.mutateAsync({
      tenderId: selectedTenderId,
      data: data,
    });

    if (result.success) {
      setShowEvaluationDrawer(false);
      evaluationForm.reset();
      refetchEvaluations();
      showToast("Evaluation created successfully!");
    } else {
      showToast(result.error || "Failed to create evaluation", "error");
    }
  };

  const calculateItemTotals = (items) => {
    if (!items) return { items: [], grandTotal: 0 };

    const itemsWithTotals = items.map((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.unitRate) || 0;
      const total = quantity * rate;
      return { ...item, calculatedTotal: total };
    });

    const grandTotal = itemsWithTotals.reduce(
      (sum, item) => sum + item.calculatedTotal,
      0,
    );
    return { items: itemsWithTotals, grandTotal };
  };

  const openEditTenderDrawer = () => {
    editTenderForm.reset({
      title: tenderDetails?.data?.title || "",
      tradePackageName: tenderDetails?.data?.tradePackage || "",
      boqTemplateId: tenderDetails?.data?.boqTemplateId || "",
      tenderStartDate: tenderDetails?.data?.tenderStartDate || "",
      tenderCloseDate: tenderDetails?.data?.tenderCloseDate || "",
      evaluationCriteria: tenderDetails?.data?.evaluationCriteria || "",
      awardThreshold: parseFloat(tenderDetails?.data?.awardThreshold || 0),
    });
    setShowEditTenderDrawer(true);
  };

  const openQuantityEditDrawer = (item) => {
    setEditingQuantityItem(item);
    const integerValue = Math.floor(parseFloat(item.quantity));
    setQuantityValue(integerValue.toString());
    setShowQuantityEditDrawer(true);
  };

  const openEvaluationDrawer = () => {
    evaluationForm.reset({
      submissionId: "",
      overallComment: "",
      riskNotes: "",
      recommendation: "",
      evaluatedScore: "",
    });
    setShowEvaluationDrawer(true);
  };

  const statistics = {
    total: tendersData?.data?.tenders?.length || 0,
    draft:
      tendersData?.data?.tenders?.filter((t) => t.status === 100).length || 0,
    issued:
      tendersData?.data?.tenders?.filter((t) => t.status === 101).length || 0,
    closed:
      tendersData?.data?.tenders?.filter((t) => t.status === 102).length || 0,
    awarded:
      tendersData?.data?.tenders?.filter((t) => t.status === 103).length || 0,
  };

  const filteredContractors =
    contractorsData?.data?.filter((contractor) => {
      const fullName =
        `${contractor.first_name} ${contractor.last_name}`.toLowerCase();
      const email = contractor.email.toLowerCase();
      const search = contractorSearch.toLowerCase();
      return fullName.includes(search) || email.includes(search);
    }) || [];

  const isAwarded = awardDetails?.data?.isAwarded;

  if (!selectedTenderId) {
    return (
      <>
        {/* Toast - Always on top */}
        {toast && (
          <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2">
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

        <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-white to-cyan-50/30">
          <div className="max-w-[1600px] mx-auto p-6 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Home className="w-4 h-4" />
                    <ChevronRight className="w-3 h-3" />
                    <span className="font-medium">Projects</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-teal-600 font-semibold">
                      Tender Management
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Tender Console
                  </h1>
                  <p className="text-sm text-slate-500">
                    Manage and monitor all tender activities for this project
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateDrawer(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create Tender
                </button>
              </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600 font-medium">
                      Total Tenders
                    </p>
                    <p className="text-2xl font-bold text-teal-900">
                      {statistics.total}
                    </p>
                  </div>
                  <ClipboardList className="w-10 h-10 text-teal-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Draft</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {statistics.draft}
                    </p>
                  </div>
                  <FileText className="w-10 h-10 text-slate-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-600 font-medium">Issued</p>
                    <p className="text-2xl font-bold text-cyan-900">
                      {statistics.issued}
                    </p>
                  </div>
                  <Send className="w-10 h-10 text-cyan-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Closed</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {statistics.closed}
                    </p>
                  </div>
                  <XCircle className="w-10 h-10 text-amber-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">
                      Awarded
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {statistics.awarded}
                    </p>
                  </div>
                  <Award className="w-10 h-10 text-emerald-400 opacity-50" />
                </div>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-teal-100 shadow-sm p-4"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title or tender code..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        search: e.target.value,
                        pageNo: 1,
                      })
                    }
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>

                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value,
                      pageNo: 1,
                    })
                  }
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Status</option>
                  <option value="100">Draft</option>
                  <option value="101">Issued</option>
                  <option value="102">Closed</option>
                  <option value="103">Awarded</option>
                </select>
              </div>
            </motion.div>

            {/* Tenders Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden"
            >
              {tendersLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <p className="mt-2 text-sm text-slate-500">
                    Loading tenders...
                  </p>
                </div>
              ) : tendersData?.data?.tenders?.length === 0 ? (
                <div className="p-12 text-center">
                  <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    No tenders found
                  </h3>
                  <p className="text-sm text-slate-500">
                    Create your first tender to get started
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Tender Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Trade Package
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Start Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Close Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Award Threshold
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Created
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tendersData?.data?.tenders?.map((tender, index) => (
                        <motion.tr
                          key={tender.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50 transition cursor-pointer"
                          onClick={() => setSelectedTenderId(tender.id)}
                        >
                          <td className="px-4 py-3 text-sm font-mono font-medium text-slate-900">
                            {tender.tenderCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {tender.title}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {tender.tradePackage}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {tender.tenderStartDate}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {tender.tenderCloseDate}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono font-medium text-slate-700">
                            S$
                            {parseFloat(tender.awardThreshold).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[tender.status]}`}
                            >
                              {STATUS_LABELS[tender.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {tender.createdAt}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTenderId(tender.id);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Create Tender Drawer */}
        <AnimatePresence>
          {showCreateDrawer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCreateDrawer(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30 }}
                className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">
                      Create New Tender
                    </h2>
                    <button
                      onClick={() => setShowCreateDrawer(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-8">
                      {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                step <= createStep
                                  ? "bg-teal-600 text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {step}
                            </div>
                            <span
                              className={`text-sm font-medium ${step <= createStep ? "text-slate-900" : "text-slate-400"}`}
                            >
                              {step === 1
                                ? "Information"
                                : step === 2
                                  ? "Evaluation"
                                  : "Review"}
                            </span>
                          </div>
                          {step < 3 && (
                            <div
                              className={`flex-1 h-0.5 rounded ${step < createStep ? "bg-teal-600" : "bg-slate-200"}`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <form
                      onSubmit={form.handleSubmit(handleCreateConfirmation)}
                    >
                      {/* Step 1: Information */}
                      {createStep === 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...form.register("title")}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                form.formState.errors.title
                                  ? "border-red-500 bg-red-50"
                                  : "border-slate-200"
                              }`}
                              placeholder="Enter tender title"
                            />
                            {form.formState.errors.title && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {form.formState.errors.title.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Trade Package{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...form.register("tradePackageName")}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                form.formState.errors.tradePackageName
                                  ? "border-red-500 bg-red-50"
                                  : "border-slate-200"
                              }`}
                              placeholder="Enter trade package"
                            />
                            {form.formState.errors.tradePackageName && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {form.formState.errors.tradePackageName.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              BOQ Template{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              {...form.register("boqTemplateId")}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                form.formState.errors.boqTemplateId
                                  ? "border-red-500 bg-red-50"
                                  : "border-slate-200"
                              }`}
                            >
                              <option value="">Select template</option>
                              {boqTemplatesData?.data?.map((template) => (
                                <option key={template.id} value={template.id}>
                                  {template.name}
                                </option>
                              ))}
                            </select>
                            {form.formState.errors.boqTemplateId && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {form.formState.errors.boqTemplateId.message}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Start Date{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                {...form.register("tenderStartDate")}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                  form.formState.errors.tenderStartDate
                                    ? "border-red-500 bg-red-50"
                                    : "border-slate-200"
                                }`}
                              />
                              {form.formState.errors.tenderStartDate && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {
                                    form.formState.errors.tenderStartDate
                                      .message
                                  }
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Close Date{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                {...form.register("tenderCloseDate")}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                  form.formState.errors.tenderCloseDate
                                    ? "border-red-500 bg-red-50"
                                    : "border-slate-200"
                                }`}
                              />
                              {form.formState.errors.tenderCloseDate && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {
                                    form.formState.errors.tenderCloseDate
                                      .message
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 2: Evaluation */}
                      {createStep === 2 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Evaluation Criteria
                            </label>
                            <textarea
                              {...form.register("evaluationCriteria")}
                              rows={4}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="Describe evaluation criteria..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Award Threshold (S$){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              {...form.register("awardThreshold", {
                                valueAsNumber: true,
                              })}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                form.formState.errors.awardThreshold
                                  ? "border-red-500 bg-red-50"
                                  : "border-slate-200"
                              }`}
                              placeholder="Enter award threshold"
                            />
                            {form.formState.errors.awardThreshold && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {form.formState.errors.awardThreshold.message}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3: Review */}
                      {createStep === 3 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                            <h3 className="font-semibold text-teal-900 mb-3">
                              Tender Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-teal-700">Title:</span>
                                <span className="font-medium text-teal-900">
                                  {form.watch("title")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-teal-700">
                                  Trade Package:
                                </span>
                                <span className="font-medium text-teal-900">
                                  {form.watch("tradePackageName")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-teal-700">
                                  BOQ Template:
                                </span>
                                <span className="font-medium text-teal-900">
                                  {boqTemplatesData?.data?.find(
                                    (t) => t.id === form.watch("boqTemplateId"),
                                  )?.name || "Not selected"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-teal-700">
                                  Start Date:
                                </span>
                                <span className="font-medium text-teal-900">
                                  {form.watch("tenderStartDate")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-teal-700">
                                  Close Date:
                                </span>
                                <span className="font-medium text-teal-900">
                                  {form.watch("tenderCloseDate")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-teal-700">
                                  Award Threshold:
                                </span>
                                <span className="font-medium text-teal-900">
                                  S$
                                  {form
                                    .watch("awardThreshold")
                                    ?.toLocaleString("en-IN")}
                                </span>
                              </div>
                              {form.watch("evaluationCriteria") && (
                                <div className="flex justify-between">
                                  <span className="text-teal-700">
                                    Evaluation Criteria:
                                  </span>
                                  <span className="font-medium text-teal-900 max-w-xs truncate">
                                    {form.watch("evaluationCriteria")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-slate-200">
                        {createStep > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              // Clear errors when going back
                              form.clearErrors();
                              setCreateStep(createStep - 1);
                            }}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                          >
                            Previous
                          </button>
                        )}
                        {createStep < 3 ? (
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition ml-auto"
                          >
                            Next
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={createTenderMutation.isPending}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition ml-auto disabled:opacity-50"
                          >
                            {createTenderMutation.isPending
                              ? "Creating..."
                              : "Create Tender"}
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Confirmation Modal */}
        <AnimatePresence>
          {showCreateConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateConfirmation(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Confirm Tender Creation
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Are you sure you want to create this tender? Please review
                    the details before confirming.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Title:</span>
                    <span className="font-medium text-slate-900">
                      {pendingData?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Trade Package:</span>
                    <span className="font-medium text-slate-900">
                      {pendingData?.tradePackageName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Award Threshold:</span>
                    <span className="font-medium text-slate-900">
                      S${pendingData?.awardThreshold?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateConfirmation(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCreateTender}
                    disabled={createTenderMutation.isPending}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {createTenderMutation.isPending
                      ? "Creating..."
                      : "Yes, Create Tender"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Tender Details Page
  const tender = tenderDetails?.data;
  const isDraft = tender?.status === 100;
  const isIssued = tender?.status === 101;
  const isClosed = tender?.status === 102;
  const isAwardedStatus = tender?.status === 103;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-white to-cyan-50/30">
      {/* Toast - Always on top with highest z-index */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2">
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

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <button
              onClick={() => setSelectedTenderId(null)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Console
            </button>

            {detailsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm bg-teal-50 px-2 py-1 rounded text-teal-700 border border-teal-200">
                        {tender?.tenderCode}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[tender?.status]}`}
                      >
                        {STATUS_LABELS[tender?.status]}
                      </span>
                      {isAwarded && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <AwardIcon className="w-3 h-3" />
                          Awarded
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                      {tender?.title}
                    </h1>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-500" />
                        <span className="text-slate-600">Trade Package:</span>
                        <span className="font-medium text-slate-900">
                          {tender?.tradePackage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-teal-500" />
                        <span className="text-slate-600">Award Threshold:</span>
                        <span className="font-medium text-slate-900">
                          S$
                          {parseFloat(
                            tender?.awardThreshold || 0,
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-500" />
                        <span className="text-slate-600">Start Date:</span>
                        <span className="font-medium text-slate-900">
                          {tender?.tenderStartDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-500" />
                        <span className="text-slate-600">Close Date:</span>
                        <span className="font-medium text-slate-900">
                          {tender?.tenderCloseDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={openEditTenderDrawer}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-teal-200 text-teal-700 rounded-xl font-semibold text-sm hover:bg-teal-50 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Tender
                    </button>

                    {isDraft && (
                      <button
                        onClick={() => setShowIssueModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-sm transition"
                      >
                        <Send className="w-4 h-4" />
                        Issue Tender
                      </button>
                    )}

                    {isIssued && (
                      <>
                        <button
                          onClick={() => setShowCloseModal(true)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition"
                        >
                          <XCircle className="w-4 h-4" />
                          Close Tender
                        </button>
                      </>
                    )}

                    {isClosed && (
                      <span className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 text-amber-700 rounded-xl font-semibold text-sm">
                        <XCircle className="w-4 h-4" />
                        Tender Closed
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="border-t border-teal-100 px-6">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: "details", label: "Details", icon: FileText },
                { id: "boq", label: "BOQ", icon: FileSpreadsheet },
                { id: "contractors", label: "Contractors", icon: Users },
                {
                  id: "clarifications",
                  label: "Clarifications",
                  icon: MessageSquare,
                },
                {
                  id: "pricing",
                  label: "Contractor Pricing",
                  icon: DollarSign,
                },
                ...(isAwarded
                  ? [
                      {
                        id: "awardDetails",
                        label: "Award Details",
                        icon: AwardIcon,
                      },
                    ]
                  : []),
                {
                  id: "evaluation",
                  label: "Evaluation Matrix",
                  icon: BarChart3,
                },
                { id: "award", label: "Award Screen", icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === "pricing" && selectedTenderId) {
                        refetchSubmissions();
                        if (selectedSubmissionId) {
                          refetchSubmissionDetails();
                        }
                      }
                      if (tab.id === "awardDetails") {
                        refetchAwardDetails();
                      }
                      if (tab.id === "evaluation") {
                        refetchEvaluations();
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                      activeTab === tab.id
                        ? "border-teal-600 text-teal-600"
                        : "border-transparent text-slate-600 hover:text-teal-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Details Tab */}
          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl border border-teal-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Tender Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-500">
                      Tender Code
                    </label>
                    <p className="font-mono text-slate-900">
                      {tender?.tenderCode}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Title</label>
                    <p className="text-slate-900">{tender?.title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">
                      Trade Package
                    </label>
                    <p className="text-slate-900">{tender?.tradePackage}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-500">Start Date</label>
                    <p className="text-slate-900">{tender?.tenderStartDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Close Date</label>
                    <p className="text-slate-900">{tender?.tenderCloseDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">
                      Award Threshold
                    </label>
                    <p className="text-slate-900">
                      S$
                      {parseFloat(tender?.awardThreshold || 0).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">
                      Evaluation Criteria
                    </label>
                    <p className="text-slate-900">
                      {tender?.evaluationCriteria || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* BOQ Tab */}
          {activeTab === "boq" && (
            <motion.div
              key="boq"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Total Items</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {boqItems?.data?.length || 0}
                      </p>
                    </div>
                    <Package className="w-10 h-10 text-teal-400 opacity-50" />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Total Quantity</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {boqItems?.data
                          ?.reduce(
                            (sum, item) =>
                              sum + Math.floor(parseFloat(item.quantity)),
                            0,
                          )
                          .toLocaleString()}
                      </p>
                    </div>
                    <Calculator className="w-10 h-10 text-emerald-400 opacity-50" />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Completion</p>
                      <p className="text-2xl font-bold text-slate-900">100%</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-emerald-400 opacity-50" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
                {boqLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {boqItems?.data?.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50 transition"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              {item.title}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {item.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {item.unit}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono font-medium text-slate-900">
                              {Math.floor(
                                parseFloat(item.quantity),
                              ).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openQuantityEditDrawer(item)}
                                className="p-1.5 hover:bg-teal-50 rounded-lg transition text-teal-600"
                                title="Edit Quantity"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Contractors Tab */}
          {activeTab === "contractors" && (
            <motion.div
              key="contractors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Contractors
                    </h3>
                    <p className="text-sm text-slate-500">
                      Manage contractors invited to this tender
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteContractorDrawer(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite Contractor
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search contractors..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={contractorSearch}
                    onChange={(e) => setContractorSearch(e.target.value)}
                  />
                </div>

                {contractorsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : contractorsData?.data?.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">
                      No contractors invited
                    </h4>
                    <p className="text-sm text-slate-500">
                      Click the "Invite Contractor" button to send invitations
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredContractors.map((contractor) => {
                      const statusLabel =
                        CONTRACTOR_STATUS_LABELS[contractor.status] ||
                        "Unknown";
                      const statusColor =
                        CONTRACTOR_STATUS_COLORS[contractor.status] ||
                        "bg-slate-50 text-slate-700 border-slate-200";

                      return (
                        <div
                          key={contractor.id}
                          className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-teal-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {contractor.first_name} {contractor.last_name}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {contractor.email}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                NDA Signed:
                              </span>
                              <span
                                className={`font-medium ${contractor.ndaSigned ? "text-emerald-600" : "text-amber-600"}`}
                              >
                                {contractor.ndaSigned ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Invited At:
                              </span>
                              <span className="font-medium text-slate-700">
                                {contractor.invitedAt
                                  ? new Date(
                                      contractor.invitedAt,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Status:</span>
                              <span className={`font-medium ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </div>
                          </div>

                          {contractor.status === CONTRACTOR_STATUS.PENDING && (
                            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateContractorStatus(
                                    contractor.contractorId,
                                    CONTRACTOR_STATUS.ACCEPTED,
                                  )
                                }
                                disabled={
                                  updateContractorStatusMutation.isPending
                                }
                                className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateContractorStatus(
                                    contractor.contractorId,
                                    CONTRACTOR_STATUS.REJECTED,
                                  )
                                }
                                disabled={
                                  updateContractorStatusMutation.isPending
                                }
                                className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Clarifications Tab */}
          {activeTab === "clarifications" && (
            <motion.div
              key="clarifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Clarifications
                    </h3>
                    <p className="text-sm text-slate-500">
                      Ask questions and get answers from contractors
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAskQuestionDrawer(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Ask Question
                  </button>
                </div>

                {clarificationsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : clarificationsData?.data?.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">
                      No clarifications
                    </h4>
                    <p className="text-sm text-slate-500">
                      Click the "Ask Question" button to start a clarification
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clarificationsData?.data?.map((clarification) => {
                      const statusLabel =
                        CLARIFICATION_STATUS_LABELS[clarification.status] ||
                        "Unknown";
                      const statusColor =
                        CLARIFICATION_STATUS_COLORS[clarification.status] ||
                        "bg-slate-50 text-slate-700 border-slate-200";
                      const isAnswered =
                        clarification.status === "101" ||
                        clarification.status === 101;
                      const isOpen =
                        clarification.status === "100" ||
                        clarification.status === 100;

                      return (
                        <div
                          key={clarification.id}
                          className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-teal-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-semibold text-slate-900">
                                    {clarification.clarificationCode ||
                                      "Clarification"}
                                  </h4>
                                  <span
                                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                  Asked on{" "}
                                  {new Date(
                                    clarification.createdAt,
                                  ).toLocaleDateString()}{" "}
                                  • Raised by{" "}
                                  {clarification.raisedBy || "Unknown"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="ml-14 space-y-4">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                              <p className="text-sm text-slate-700 font-medium">
                                {clarification.question}
                              </p>
                            </div>

                            {clarification.answers &&
                              clarification.answers.length > 0 && (
                                <div className="space-y-3">
                                  {clarification.answers.map(
                                    (answer, index) => (
                                      <div
                                        key={index}
                                        className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="text-sm font-medium text-teal-900">
                                            {answer.answeredBy?.name ||
                                              "Unknown"}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            {new Date(
                                              answer.timestamp,
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                        <p className="text-sm text-slate-700">
                                          {answer.answer}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                            {isOpen && (
                              <div className="flex gap-2 mt-2">
                                <textarea
                                  placeholder="Type your answer..."
                                  rows={2}
                                  value={answerTexts[clarification.id] || ""}
                                  onChange={(e) =>
                                    setAnswerTexts((prev) => ({
                                      ...prev,
                                      [clarification.id]: e.target.value,
                                    }))
                                  }
                                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                />
                                <button
                                  onClick={() =>
                                    handleAnswerClarification(clarification.id)
                                  }
                                  disabled={
                                    answerClarificationMutation.isPending ||
                                    !answerTexts[clarification.id]?.trim()
                                  }
                                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 whitespace-nowrap"
                                >
                                  <SendIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {isAnswered &&
                              clarification.answers &&
                              clarification.answers.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  <textarea
                                    placeholder="Type your answer..."
                                    rows={2}
                                    value={
                                      editAnswerTexts[clarification.id] || ""
                                    }
                                    onChange={(e) =>
                                      setEditAnswerTexts((prev) => ({
                                        ...prev,
                                        [clarification.id]: e.target.value,
                                      }))
                                    }
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                  />
                                  <button
                                    onClick={() =>
                                      handleEditAnswer(clarification.id)
                                    }
                                    disabled={
                                      answerClarificationMutation.isPending ||
                                      !editAnswerTexts[clarification.id]?.trim()
                                    }
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 whitespace-nowrap"
                                  >
                                    <SendIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Contractor Pricing Tab */}
          {activeTab === "pricing" && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Contractor Pricing
                    </h3>
                    <p className="text-sm text-slate-500">
                      View and manage contractor submissions
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      refetchSubmissions();
                      if (selectedSubmissionId) {
                        refetchSubmissionDetails();
                      }
                      showToast("Refreshing data...", "info");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {submissionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : submissionsData?.data?.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">
                      No submissions yet
                    </h4>
                    <p className="text-sm text-slate-500">
                      Contractors will submit their pricing here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Submissions List */}
                    <div className="lg:col-span-1 space-y-2">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-600" />
                        Contractors ({submissionsData?.data?.length})
                      </h4>
                      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                        {submissionsData?.data?.map((submission) => {
                          const statusLabel =
                            SUBMISSION_STATUS_LABELS[submission.status] ||
                            "Unknown";
                          const statusColor =
                            SUBMISSION_STATUS_COLORS[submission.status] ||
                            "bg-slate-50 text-slate-700 border-slate-200";

                          return (
                            <div
                              key={submission.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedSubmissionId === submission.id
                                  ? "border-teal-500 bg-teal-50 shadow-sm"
                                  : "border-slate-200 hover:border-teal-200 hover:bg-slate-50"
                              }`}
                              onClick={() => {
                                setSelectedSubmissionId(submission.id);
                                setEditingRates({});
                                setRateNotes({});
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">
                                    {submission.contractorName ||
                                      `Contractor ${submission.contractorId?.slice(0, 8) || "Unknown"}`}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {new Date(
                                      submission.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ml-2 flex-shrink-0 ${statusColor}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>
                              {submission.totalAmount && (
                                <p className="text-sm font-semibold text-teal-600 mt-1">
                                  S$
                                  {parseFloat(
                                    submission.totalAmount,
                                  ).toLocaleString("en-IN")}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div className="lg:col-span-3">
                      {!selectedSubmissionId ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                          <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">
                            Select a contractor to view their pricing
                          </p>
                        </div>
                      ) : submissionDetailsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap justify-between items-center gap-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                                BOQ Items -{" "}
                                {submissionDetails?.data?.items?.length || 0}{" "}
                                items
                              </h4>
                              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span
                                  className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    SUBMISSION_STATUS_COLORS[
                                      submissionDetails?.data?.status
                                    ] || "bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  {SUBMISSION_STATUS_LABELS[
                                    submissionDetails?.data?.status
                                  ] || "Unknown"}
                                </span>
                                <span>•</span>
                                <span>
                                  Last updated:{" "}
                                  {new Date(
                                    submissionDetails?.data?.updatedAt,
                                  ).toLocaleString()}
                                </span>
                              </p>
                            </div>
                            {submissionDetails?.data?.status ===
                              SUBMISSION_STATUS.DRAFT && (
                              <div className="flex gap-2">
                                <button
                                  onClick={handleBatchUpdate}
                                  disabled={
                                    isSaving ||
                                    Object.keys(editingRates).length === 0
                                  }
                                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                                >
                                  {isSaving ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-4 h-4" />
                                      Save Changes{" "}
                                      {Object.keys(editingRates).length > 0 &&
                                        `(${Object.keys(editingRates).length})`}
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={handleSubmitSubmission}
                                  disabled={submitSubmissionMutation.isPending}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                                >
                                  {submitSubmissionMutation.isPending ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Finalize Submission
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase sticky left-0 bg-slate-50 z-10">
                                    Item
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    Description
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase w-16">
                                    Unit
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase w-24">
                                    Qty
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase w-32">
                                    Unit Rate (S$)
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase w-32">
                                    Total (S$)
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase min-w-[200px]">
                                    Notes
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {(() => {
                                  const { items, grandTotal } =
                                    calculateItemTotals(
                                      submissionDetails?.data?.items,
                                    );
                                  const isEditable =
                                    submissionDetails?.data?.status ===
                                    SUBMISSION_STATUS.DRAFT;

                                  return items.map((item) => {
                                    const currentRate =
                                      editingRates[item.tenderBoqItemId] !==
                                      undefined
                                        ? editingRates[item.tenderBoqItemId]
                                        : item.unitRate || "";
                                    const currentNote =
                                      rateNotes[item.tenderBoqItemId] !==
                                      undefined
                                        ? rateNotes[item.tenderBoqItemId]
                                        : item.notes || "";
                                    const calculatedTotal =
                                      (parseFloat(item.quantity) || 0) *
                                      (parseFloat(currentRate) || 0);

                                    return (
                                      <tr
                                        key={item.id}
                                        className="hover:bg-slate-50 transition group"
                                      >
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 transition">
                                          {item.title}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                                          <div
                                            className="truncate"
                                            title={item.description}
                                          >
                                            {item.description}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 text-center">
                                          <span className="inline-flex px-2 py-0.5 bg-slate-100 rounded text-xs font-mono">
                                            {item.unit}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono text-slate-700 text-center">
                                          {parseFloat(
                                            item.quantity,
                                          ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          {isEditable ? (
                                            <div className="flex items-center justify-center gap-1">
                                              <span className="text-xs text-slate-400 font-medium">
                                                S$
                                              </span>
                                              <input
                                                type="number"
                                                value={currentRate}
                                                onChange={(e) =>
                                                  handleUpdateItemRate(
                                                    item.tenderBoqItemId,
                                                    e.target.value,
                                                  )
                                                }
                                                className="w-24 px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-center font-mono"
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                              />
                                            </div>
                                          ) : (
                                            <span className="font-mono font-medium text-slate-700">
                                              {item.unitRate
                                                ? `S$${parseFloat(item.unitRate).toLocaleString()}`
                                                : "-"}
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono font-bold text-slate-900 text-center">
                                          {calculatedTotal > 0
                                            ? `S$${calculatedTotal.toLocaleString("en-IN")}`
                                            : "-"}
                                        </td>
                                        <td className="px-4 py-3 min-w-[200px]">
                                          {isEditable ? (
                                            <textarea
                                              value={currentNote}
                                              onChange={(e) =>
                                                handleUpdateItemNote(
                                                  item.tenderBoqItemId,
                                                  e.target.value,
                                                )
                                              }
                                              className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-y min-h-[60px] max-h-[100px]"
                                              placeholder="Add notes..."
                                              rows={2}
                                            />
                                          ) : (
                                            <div className="text-sm text-slate-600 max-w-xs break-words">
                                              {item.notes || "-"}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                <tr>
                                  <td
                                    colSpan="4"
                                    className="px-4 py-3 text-right font-bold text-slate-700"
                                  >
                                    Grand Total
                                  </td>
                                  <td className="px-4 py-3 text-center font-bold text-slate-900">
                                    S$
                                    {(() => {
                                      const { grandTotal } =
                                        calculateItemTotals(
                                          submissionDetails?.data?.items,
                                        );
                                      return grandTotal.toLocaleString("en-IN");
                                    })()}
                                  </td>
                                  <td colSpan="2" className="px-4 py-3"></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          {submissionDetails?.data?.status ===
                            SUBMISSION_STATUS.SUBMITTED && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <p className="text-sm text-emerald-700 font-medium">
                                  This submission has been finalized and cannot
                                  be edited.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Award Details Tab */}
          {activeTab === "awardDetails" && isAwarded && (
            <motion.div
              key="awardDetails"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <AwardIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Award Details
                    </h3>
                    <p className="text-sm text-slate-500">
                      Information about the awarded tender
                    </p>
                  </div>
                </div>

                {awardLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : awardDetails?.data?.awardDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Award Summary Card */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                      <h4 className="text-sm font-semibold text-emerald-900 mb-4">
                        Award Summary
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-emerald-700">
                            Awarded Amount
                          </span>
                          <span className="text-xl font-bold text-emerald-900">
                            S$
                            {awardDetails?.data?.awardDetails?.awardedAmount?.toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-emerald-700">
                            Awarded At
                          </span>
                          <span className="text-sm font-medium text-emerald-900">
                            {new Date(
                              awardDetails?.data?.awardDetails?.awardedAt,
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contractor Details Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900 mb-4">
                        Contractor Details
                      </h4>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                          {awardDetails?.data?.awardDetails
                            ?.contractorProfileImage ? (
                            <img
                              src={
                                awardDetails?.data?.awardDetails
                                  ?.contractorProfileImage
                              }
                              alt={
                                awardDetails?.data?.awardDetails?.contractorName
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900">
                            {awardDetails?.data?.awardDetails?.contractorName}
                          </h5>
                          <p className="text-sm text-blue-700">
                            {awardDetails?.data?.awardDetails?.contractorEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Phone className="w-4 h-4" />
                        <span>
                          {awardDetails?.data?.awardDetails?.contractorPhone ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AwardIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">
                      No Award Details
                    </h4>
                    <p className="text-sm text-slate-500">
                      The tender has been awarded but details are not available.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Evaluation Matrix Tab */}
          {activeTab === "evaluation" && (
            <motion.div
              key="evaluation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Evaluation Matrix
                    </h3>
                    <p className="text-sm text-slate-500">
                      Evaluate contractor submissions
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        refetchEvaluations();
                        showToast("Refreshing data...", "info");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                    <button
                      onClick={openEvaluationDrawer}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Evaluation
                    </button>
                  </div>
                </div>

                {evaluationsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : evaluationsData?.data?.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">
                      No Evaluations Yet
                    </h4>
                    <p className="text-sm text-slate-500">
                      Click "Add Evaluation" to evaluate a contractor submission
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evaluationsData?.data?.map((evaluation) => {
                      const recommendationLabel =
                        {
                          100: "Recommended",
                          101: "Not Recommended",
                          102: "Conditional",
                        }[evaluation.recommendation] || "Unknown";

                      const recommendationColor =
                        {
                          100: "bg-emerald-100 text-emerald-700 border-emerald-200",
                          101: "bg-red-100 text-red-700 border-red-200",
                          102: "bg-amber-100 text-amber-700 border-amber-200",
                        }[evaluation.recommendation] ||
                        "bg-slate-100 text-slate-700";

                      return (
                        <div
                          key={evaluation.id}
                          className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-teal-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {evaluation.contractorName ||
                                    "Unknown Contractor"}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {evaluation.contractorEmail}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Evaluated by {evaluation.evaluatedByName} •{" "}
                                  {new Date(
                                    evaluation.evaluatedAt,
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${recommendationColor}`}
                            >
                              {recommendationLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-50 rounded-lg p-3">
                              <p className="text-xs text-slate-500 mb-1">
                                Score
                              </p>
                              <p className="text-xl font-bold text-slate-900">
                                {evaluation.evaluatedScore}
                              </p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                              <p className="text-xs text-slate-500 mb-1">
                                Submission Status
                              </p>
                              <span
                                className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  SUBMISSION_STATUS_COLORS[
                                    evaluation.submissionStatus
                                  ] || "bg-slate-50"
                                }`}
                              >
                                {SUBMISSION_STATUS_LABELS[
                                  evaluation.submissionStatus
                                ] || "Unknown"}
                              </span>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                              <p className="text-xs text-slate-500 mb-1">
                                Total Amount
                              </p>
                              <p className="font-semibold text-slate-900">
                                {evaluation.submissionTotalAmount
                                  ? `S$${parseFloat(evaluation.submissionTotalAmount).toLocaleString("en-IN")}`
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            {evaluation.overallComment && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <p className="text-xs text-blue-700 font-medium mb-1">
                                  <MessageSquare className="w-3 h-3 inline mr-1" />
                                  Overall Comment
                                </p>
                                <p className="text-sm text-slate-700">
                                  {evaluation.overallComment}
                                </p>
                              </div>
                            )}
                            {evaluation.riskNotes && (
                              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                <p className="text-xs text-amber-700 font-medium mb-1">
                                  <Shield className="w-3 h-3 inline mr-1" />
                                  Risk Notes
                                </p>
                                <p className="text-sm text-slate-700">
                                  {evaluation.riskNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Award Tab */}
          {activeTab === "award" && (
            <motion.div
              key="award"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl border border-teal-100 shadow-sm p-6"
            >
              {isAwarded ? (
                <div className="text-center max-w-2xl mx-auto py-8">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Tender Already Awarded
                  </h3>
                  <p className="text-slate-600 mb-4">
                    This tender has already been awarded to{" "}
                    <strong>
                      {awardDetails?.data?.awardDetails?.contractorName}
                    </strong>
                    .
                  </p>
                  <button
                    onClick={() => setActiveTab("awardDetails")}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition"
                  >
                    View Award Details
                  </button>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-10 h-10 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Ready to Award?
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Select the winning submission and confirm the award
                      decision.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 mb-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tender
                        </label>
                        <p className="text-sm font-medium text-slate-900">
                          {tender?.title}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Select Winning Submission *
                        </label>
                        <select
                          value={selectedAwardSubmissionId || ""}
                          onChange={(e) =>
                            setSelectedAwardSubmissionId(e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="">Select a submission</option>
                          {submissionsData?.data?.map((submission) => (
                            <option key={submission.id} value={submission.id}>
                              {submission.contractorName ||
                                `Contractor ${submission.contractorId?.slice(0, 8) || "Unknown"}`}{" "}
                              -
                              {submission.totalAmount
                                ? ` S$${parseFloat(submission.totalAmount).toLocaleString("en-IN")}`
                                : " No amount"}
                              {submission.status === SUBMISSION_STATUS.SUBMITTED
                                ? " ✓"
                                : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedAwardSubmissionId && (
                        <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                          <p className="text-sm text-teal-700">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Selected submission will be awarded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAwardModal(true)}
                    disabled={!selectedAwardSubmissionId}
                    className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!selectedAwardSubmissionId
                      ? "Please select a submission"
                      : "Proceed with Award"}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Tender Drawer */}
      <AnimatePresence>
        {showEditTenderDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowEditTenderDrawer(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">
                    Edit Tender
                  </h2>
                  <button
                    onClick={() => setShowEditTenderDrawer(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <form
                    onSubmit={editTenderForm.handleSubmit(handleUpdateTender)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Title *
                      </label>
                      <input
                        {...editTenderForm.register("title")}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Trade Package *
                      </label>
                      <input
                        {...editTenderForm.register("tradePackageName")}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        BOQ Template *
                      </label>
                      <select
                        {...editTenderForm.register("boqTemplateId")}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select template</option>
                        {boqTemplatesData?.data?.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          {...editTenderForm.register("tenderStartDate")}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Close Date *
                        </label>
                        <input
                          type="date"
                          {...editTenderForm.register("tenderCloseDate")}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Evaluation Criteria
                      </label>
                      <textarea
                        {...editTenderForm.register("evaluationCriteria")}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Describe evaluation criteria..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Award Threshold (S$) *
                      </label>
                      <input
                        type="number"
                        {...editTenderForm.register("awardThreshold", {
                          valueAsNumber: true,
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter award threshold"
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowEditTenderDrawer(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateTenderMutation.isPending}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                      >
                        {updateTenderMutation.isPending
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Quantity Drawer */}
      <AnimatePresence>
        {showQuantityEditDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuantityEditDrawer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Quantity
                </h2>
                <button
                  onClick={() => setShowQuantityEditDrawer(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    {editingQuantityItem?.title}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    {editingQuantityItem?.description}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Unit
                    </label>
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                      {editingQuantityItem?.unit}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={quantityValue}
                      onChange={(e) => setQuantityValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      step="1"
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === "." || e.key === "e" || e.key === "E")
                          e.preventDefault();
                      }}
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 pt-0">
                <button
                  onClick={() => setShowQuantityEditDrawer(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateQuantity}
                  disabled={updateQuantityMutation.isPending}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {updateQuantityMutation.isPending
                    ? "Updating..."
                    : "Update Quantity"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Contractor Drawer */}
      <AnimatePresence>
        {showInviteContractorDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowInviteContractorDrawer(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">
                    Invite Contractors
                  </h2>
                  <button
                    onClick={() => setShowInviteContractorDrawer(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Search Team Members
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={teamMemberSearch}
                        onChange={(e) => {
                          setTeamMemberSearch(e.target.value);
                          setTeamMemberPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {teamMembersLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      </div>
                    ) : !teamMembersData?.data?.items ||
                      teamMembersData?.data?.items?.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                          No team members found
                        </p>
                        {teamMemberSearch && (
                          <p className="text-xs text-slate-400 mt-1">
                            Try adjusting your search
                          </p>
                        )}
                      </div>
                    ) : (
                      teamMembersData?.data?.items?.map((member) => (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                            selectedTeamMembers.includes(member.id)
                              ? "border-teal-500 bg-teal-50"
                              : "border-slate-200 hover:border-teal-200"
                          }`}
                          onClick={() => {
                            setSelectedTeamMembers((prev) =>
                              prev.includes(member.id)
                                ? prev.filter((id) => id !== member.id)
                                : [...prev, member.id],
                            );
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                              {member.profileImage ? (
                                <img
                                  src={
                                    member.profileImageMetaData?.path ||
                                    member.profileImage
                                  }
                                  alt={`${member.firstName} ${member.lastName}`}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <Users className="w-5 h-5 text-slate-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">
                                {member.firstName} {member.lastName}
                              </h4>
                              <p className="text-xs text-slate-500">
                                {member.email}
                              </p>
                              {member.designation && (
                                <p className="text-xs text-slate-400">
                                  {member.designation}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedTeamMembers.includes(member.id) && (
                              <CheckCircle className="w-5 h-5 text-teal-600" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {teamMembersData?.data?.pagination &&
                    teamMembersData?.data?.items?.length > 0 && (
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                        <button
                          onClick={() =>
                            setTeamMemberPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={teamMemberPage === 1}
                          className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-slate-600">
                          Page {teamMemberPage} of{" "}
                          {teamMembersData?.data?.pagination?.totalPages || 1}
                        </span>
                        <button
                          onClick={() => setTeamMemberPage((prev) => prev + 1)}
                          disabled={
                            teamMemberPage >=
                            (teamMembersData?.data?.pagination?.totalPages || 1)
                          }
                          className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setShowInviteContractorDrawer(false);
                      setSelectedTeamMembers([]);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteContractors}
                    disabled={
                      inviteContractorsMutation.isPending ||
                      selectedTeamMembers.length === 0
                    }
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {inviteContractorsMutation.isPending
                      ? "Inviting..."
                      : `Invite ${selectedTeamMembers.length} Member${selectedTeamMembers.length > 1 ? "s" : ""}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ask Question Drawer */}
      <AnimatePresence>
        {showAskQuestionDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowAskQuestionDrawer(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">
                    Ask a Question
                  </h2>
                  <button
                    onClick={() => setShowAskQuestionDrawer(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Your Question *
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Type your question here..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        This question will be visible to all contractors
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setShowAskQuestionDrawer(false);
                      setQuestionText("");
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAskQuestion}
                    disabled={
                      createClarificationMutation.isPending ||
                      !questionText.trim()
                    }
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {createClarificationMutation.isPending
                      ? "Posting..."
                      : "Post Question"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluation Drawer */}
      <AnimatePresence>
        {showEvaluationDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowEvaluationDrawer(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">
                    Add Evaluation
                  </h2>
                  <button
                    onClick={() => setShowEvaluationDrawer(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <form
                    onSubmit={evaluationForm.handleSubmit(
                      handleCreateEvaluation,
                    )}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Select Submission *
                      </label>
                      <select
                        {...evaluationForm.register("submissionId")}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select a submission</option>
                        {submissionsData?.data?.map((submission) => (
                          <option key={submission.id} value={submission.id}>
                            {submission.contractorName ||
                              `Contractor ${submission.contractorId?.slice(0, 8) || "Unknown"}`}{" "}
                            -{" "}
                            {SUBMISSION_STATUS_LABELS[submission.status] ||
                              "Unknown"}
                          </option>
                        ))}
                      </select>
                      {evaluationForm.formState.errors.submissionId && (
                        <p className="mt-1 text-xs text-red-600">
                          {evaluationForm.formState.errors.submissionId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Overall Comment
                      </label>
                      <textarea
                        {...evaluationForm.register("overallComment")}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter overall comment..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Risk Notes
                      </label>
                      <textarea
                        {...evaluationForm.register("riskNotes")}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter risk notes..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Recommendation *
                      </label>
                      <select
                        {...evaluationForm.register("recommendation", {
                          valueAsNumber: true,
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select recommendation</option>
                        <option value="100">Recommended</option>
                        <option value="101">Not Recommended</option>
                        <option value="102">Conditional</option>
                      </select>
                      {evaluationForm.formState.errors.recommendation && (
                        <p className="mt-1 text-xs text-red-600">
                          {
                            evaluationForm.formState.errors.recommendation
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Evaluated Score *
                      </label>
                      <input
                        type="number"
                        {...evaluationForm.register("evaluatedScore", {
                          valueAsNumber: true,
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter score"
                        min="0"
                      />
                      {evaluationForm.formState.errors.evaluatedScore && (
                        <p className="mt-1 text-xs text-red-600">
                          {
                            evaluationForm.formState.errors.evaluatedScore
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowEvaluationDrawer(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createEvaluationMutation.isPending}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                      >
                        {createEvaluationMutation.isPending
                          ? "Submitting..."
                          : "Submit Evaluation"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Tender Modal */}
      <AnimatePresence>
        {showIssueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowIssueModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Issue Tender
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to issue this tender? This action will
                  make it visible to all contractors.
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tender:</span>
                  <span className="font-medium text-slate-900">
                    {tender?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">BOQ Items:</span>
                  <span className="font-medium text-slate-900">
                    {boqItems?.data?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Start Date:</span>
                  <span className="font-medium text-slate-900">
                    {tender?.tenderStartDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Close Date:</span>
                  <span className="font-medium text-slate-900">
                    {tender?.tenderCloseDate}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueTender}
                  disabled={issueTenderMutation.isPending}
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50"
                >
                  {issueTenderMutation.isPending
                    ? "Issuing..."
                    : "Yes, Issue Tender"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Tender Modal */}
      <AnimatePresence>
        {showCloseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCloseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Close Tender
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to close this tender? This action will
                  prevent any further changes or submissions.
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tender:</span>
                  <span className="font-medium text-slate-900">
                    {tender?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Status:</span>
                  <span className="font-medium text-amber-600">Issued</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseTender}
                  disabled={closeTenderMutation.isPending}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {closeTenderMutation.isPending
                    ? "Closing..."
                    : "Yes, Close Tender"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Award Tender Modal */}
      <AnimatePresence>
        {showAwardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAwardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Confirm Award
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  This will officially award the tender to the selected
                  contractor.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tender:</span>
                  <span className="font-medium text-slate-900">
                    {tender?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Selected Submission:</span>
                  <span className="font-medium text-emerald-600">
                    {submissionsData?.data?.find(
                      (s) => s.id === selectedAwardSubmissionId,
                    )?.contractorName || "Selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-medium text-slate-900">
                    S$
                    {submissionsData?.data?.find(
                      (s) => s.id === selectedAwardSubmissionId,
                    )?.totalAmount
                      ? parseFloat(
                          submissionsData?.data?.find(
                            (s) => s.id === selectedAwardSubmissionId,
                          )?.totalAmount,
                        ).toLocaleString("en-IN")
                      : "0"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAwardModal(false);
                    setSelectedAwardSubmissionId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAwardTender}
                  disabled={
                    awardTenderMutation.isPending || !selectedAwardSubmissionId
                  }
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {awardTenderMutation.isPending
                    ? "Awarding..."
                    : "Confirm Award"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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

// Wrapper component with QueryClientProvider
const TenderConsoleWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TenderConsole />
    </QueryClientProvider>
  );
};

export default TenderConsoleWrapper;
