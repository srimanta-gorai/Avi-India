import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './configs';
import { getTeamMembers } from './teamGlobal';

// Query Keys
export const queryKeys = {
  tenders: 'tenders',
  tenderDetails: 'tenderDetails',
  boqTemplates: 'boqTemplates',
  boqItems: 'boqItems',
  contractors: 'contractors',
  teamMembers: 'teamMembers',
  clarifications: 'clarifications',
  submissions: 'submissions',
  submissionDetails: 'submissionDetails',
  awardDetails: 'awardDetails',
  evaluations: 'evaluations',
};

// Status Constants
export const TENDER_STATUS = {
  DRAFT: 100,
  ISSUED: 101,
  CLOSED: 102,
  AWARDED: 103,
  ARCHIVED: 104,
};

export const CONTRACTOR_STATUS = {
  PENDING: 100,
  ACCEPTED: 101,
  REJECTED: 102,
};

export const CLARIFICATION_STATUS = {
  OPEN: '100',
  ANSWERED: '101',
  CLOSED: '102',
};

export const SUBMISSION_STATUS = {
  DRAFT: 100,
  SUBMITTED: 101,
  REVIEWED: 102,
};

export const STATUS_LABELS = {
  [TENDER_STATUS.DRAFT]: 'Draft',
  [TENDER_STATUS.ISSUED]: 'Issued',
  [TENDER_STATUS.CLOSED]: 'Closed',
  [TENDER_STATUS.AWARDED]: 'Awarded',
  [TENDER_STATUS.ARCHIVED]: 'Archived',
};

export const CONTRACTOR_STATUS_LABELS = {
  [CONTRACTOR_STATUS.PENDING]: 'Pending',
  [CONTRACTOR_STATUS.ACCEPTED]: 'Accepted',
  [CONTRACTOR_STATUS.REJECTED]: 'Rejected',
};

export const CONTRACTOR_STATUS_COLORS = {
  [CONTRACTOR_STATUS.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
  [CONTRACTOR_STATUS.ACCEPTED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [CONTRACTOR_STATUS.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
};

export const SUBMISSION_STATUS_LABELS = {
  [SUBMISSION_STATUS.DRAFT]: 'Draft',
  [SUBMISSION_STATUS.SUBMITTED]: 'Submitted',
  [SUBMISSION_STATUS.REVIEWED]: 'Reviewed',
};

export const SUBMISSION_STATUS_COLORS = {
  [SUBMISSION_STATUS.DRAFT]: 'bg-amber-50 text-amber-700 border-amber-200',
  [SUBMISSION_STATUS.SUBMITTED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [SUBMISSION_STATUS.REVIEWED]: 'bg-blue-50 text-blue-700 border-blue-200',
};

export const CLARIFICATION_STATUS_LABELS = {
  [CLARIFICATION_STATUS.OPEN]: 'Open',
  [CLARIFICATION_STATUS.ANSWERED]: 'Answered',
  [CLARIFICATION_STATUS.CLOSED]: 'Closed',
};

export const CLARIFICATION_STATUS_COLORS = {
  [CLARIFICATION_STATUS.OPEN]: 'bg-amber-50 text-amber-700 border-amber-200',
  [CLARIFICATION_STATUS.ANSWERED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [CLARIFICATION_STATUS.CLOSED]: 'bg-slate-50 text-slate-700 border-slate-200',
};

export const STATUS_COLORS = {
  [TENDER_STATUS.DRAFT]: 'bg-teal-50 text-teal-700 border-teal-200',
  [TENDER_STATUS.ISSUED]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  [TENDER_STATUS.CLOSED]: 'bg-amber-50 text-amber-700 border-amber-200',
  [TENDER_STATUS.AWARDED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [TENDER_STATUS.ARCHIVED]: 'bg-slate-50 text-slate-700 border-slate-200',
};

// API Functions
export const getTenders = async ({ pageSize = 10, pageNo = 1, projectId = '', status = '', tenderCode = '', title = '' }) => {
  try {
    let url = `/tenders?pageSize=${pageSize}&pageNo=${pageNo}`;
    if (projectId) url += `&projectId=${encodeURIComponent(projectId)}`;
    if (status) url += `&status=${status}`;
    if (tenderCode) url += `&tenderCode=${encodeURIComponent(tenderCode)}`;
    if (title) url += `&title=${encodeURIComponent(title)}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Get tenders error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch tenders'
    };
  }
};

export const getTenderDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/tenders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get tender details error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch tender details'
    };
  }
};

export const getBoqTemplates = async () => {
  try {
    const response = await axiosInstance.get('/boq-templates');
    return response.data;
  } catch (error) {
    console.error('Get BOQ templates error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch BOQ templates'
    };
  }
};

export const getBoqItems = async (tenderId) => {
  try {
    const response = await axiosInstance.get(`/tenders/${tenderId}/boq-items`);
    return response.data;
  } catch (error) {
    console.error('Get BOQ items error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch BOQ items'
    };
  }
};

export const createTender = async (data) => {
  try {
    const response = await axiosInstance.post('/tenders', data);
    return response.data;
  } catch (error) {
    console.error('Create tender error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to create tender'
    };
  }
};

export const updateTender = async ({ id, data }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update tender error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to update tender'
    };
  }
};

export const updateBoqQuantity = async ({ tenderId, tenderBoqItemId, quantity }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${tenderId}/boq-items/${tenderBoqItemId}/quantity`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Update BOQ quantity error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to update quantity'
    };
  }
};

export const updateBoqItem = async ({ tenderId, itemId, data }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${tenderId}/boq-items/${itemId}/quantity`, data);
    return response.data;
  } catch (error) {
    console.error('Update BOQ item error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to update BOQ item'
    };
  }
};

// Contractor APIs
export const getContractors = async (tenderId) => {
  try {
    const response = await axiosInstance.get(`/tenders/${tenderId}/contractors`);
    return response.data;
  } catch (error) {
    console.error('Get contractors error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch contractors'
    };
  }
};

export const inviteContractors = async ({ tenderId, contractorIds }) => {
  try {
    const response = await axiosInstance.post(`/tenders/${tenderId}/contractors`, { contractorIds });
    return response.data;
  } catch (error) {
    console.error('Invite contractors error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to invite contractors'
    };
  }
};

export const updateContractorStatus = async ({ tenderId, contractorId, status }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${tenderId}/contractors/${contractorId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Update contractor status error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to update contractor status'
    };
  }
};

// Clarification APIs
export const getClarifications = async (tenderId) => {
  try {
    const response = await axiosInstance.get(`/tenders/${tenderId}/clarifications`);
    return response.data;
  } catch (error) {
    console.error('Get clarifications error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch clarifications'
    };
  }
};

export const createClarification = async ({ tenderId, question }) => {
  try {
    const response = await axiosInstance.post(`/tenders/${tenderId}/clarifications/question`, { question });
    return response.data;
  } catch (error) {
    console.error('Create clarification error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to create clarification'
    };
  }
};

export const answerClarification = async ({ tenderId, clarificationId, answer }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${tenderId}/clarifications/${clarificationId}/answer`, { answer });
    return response.data;
  } catch (error) {
    console.error('Answer clarification error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to answer clarification'
    };
  }
};

// Submission APIs
export const getSubmissions = async (tenderId) => {
  try {
    const response = await axiosInstance.get(`/tenders/${tenderId}/submissions`);
    return response.data;
  } catch (error) {
    console.error('Get submissions error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch submissions'
    };
  }
};

export const getSubmissionDetails = async ({ tenderId, submissionId }) => {
  try {
    const response = await axiosInstance.get(`/tenders/${tenderId}/submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error('Get submission details error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch submission details'
    };
  }
};

export const updateSubmissionItems = async ({ tenderId, submissionId, items }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${tenderId}/submissions/${submissionId}/items`, { items });
    return response.data;
  } catch (error) {
    console.error('Update submission items error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to update submission items'
    };
  }
};

export const submitSubmission = async ({ tenderId, submissionId }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${tenderId}/submissions/${submissionId}/submit`);
    return response.data;
  } catch (error) {
    console.error('Submit submission error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to submit submission'
    };
  }
};

// Award APIs
export const getAwardDetails = async (tenderId) => {
  try {
    const response = await axiosInstance.get(`/tenders/${tenderId}/award`);
    return response.data;
  } catch (error) {
    console.error('Get award details error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch award details'
    };
  }
};

// Evaluation APIs
export const getEvaluations = async (tenderId) => {
  try {
    const response = await axiosInstance.get(`/tenders/${tenderId}/evaluations`);
    return response.data;
  } catch (error) {
    console.error('Get evaluations error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch evaluations'
    };
  }
};

export const createEvaluation = async ({ tenderId, data }) => {
  try {
    const response = await axiosInstance.post(`/tenders/${tenderId}/evaluations`, data);
    return response.data;
  } catch (error) {
    console.error('Create evaluation error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to create evaluation'
    };
  }
};

// New separate status update APIs
export const issueTender = async (id) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${id}/issue`);
    return response.data;
  } catch (error) {
    console.error('Issue tender error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to issue tender'
    };
  }
};

export const closeTender = async (id) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${id}/close`);
    return response.data;
  } catch (error) {
    console.error('Close tender error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to close tender'
    };
  }
};

export const awardTender = async ({ id, submissionId }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${id}/award`, { submissionId });
    return response.data;
  } catch (error) {
    console.error('Award tender error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to award tender'
    };
  }
};

export const updateTenderStatus = async ({ id, status }) => {
  try {
    const response = await axiosInstance.patch(`/tenders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Update tender status error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to update status'
    };
  }
};

export const deleteTender = async (id) => {
  try {
    const response = await axiosInstance.delete(`/tenders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete tender error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to delete tender'
    };
  }
};

export const deleteBoqItem = async ({ tenderId, itemId }) => {
  try {
    const response = await axiosInstance.delete(`/tenders/${tenderId}/boq-items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Delete BOQ item error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to delete BOQ item'
    };
  }
};

export const addBoqItem = async ({ tenderId, data }) => {
  try {
    const response = await axiosInstance.post(`/tenders/${tenderId}/boq-items`, data);
    return response.data;
  } catch (error) {
    console.error('Add BOQ item error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to add BOQ item'
    };
  }
};

// React Query Hooks
export const useTenders = (params) => {
  return useQuery({
    queryKey: [queryKeys.tenders, params],
    queryFn: () => getTenders(params),
    staleTime: 30000,
    keepPreviousData: true,
  });
};

export const useTenderDetails = (id) => {
  return useQuery({
    queryKey: [queryKeys.tenderDetails, id],
    queryFn: () => getTenderDetails(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useBoqTemplates = () => {
  return useQuery({
    queryKey: [queryKeys.boqTemplates],
    queryFn: () => getBoqTemplates(),
    staleTime: 300000,
  });
};

export const useBoqItems = (tenderId) => {
  return useQuery({
    queryKey: [queryKeys.boqItems, tenderId],
    queryFn: () => getBoqItems(tenderId),
    enabled: !!tenderId,
    staleTime: 30000,
  });
};

export const useCreateTender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenders] });
    },
  });
};

export const useUpdateTender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTender,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenders] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenderDetails, variables.id] });
    },
  });
};

export const useUpdateBoqQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateBoqQuantity,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.boqItems, variables.tenderId] });
    },
  });
};

export const useUpdateBoqItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateBoqItem,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.boqItems, variables.tenderId] });
    },
  });
};

export const useGetContractors = (tenderId) => {
  return useQuery({
    queryKey: [queryKeys.contractors, tenderId],
    queryFn: () => getContractors(tenderId),
    enabled: !!tenderId,
    staleTime: 30000,
  });
};

export const useInviteContractors = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inviteContractors,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.contractors, variables.tenderId] });
    },
  });
};

export const useUpdateContractorStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateContractorStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.contractors, variables.tenderId] });
    },
  });
};

export const useGetTeamMembers = (search = '', page = 1, limit = 10) => {
  return useQuery({
    queryKey: [queryKeys.teamMembers, search, page, limit],
    queryFn: () => getTeamMembers(search, page, limit),
    staleTime: 30000,
    select: (data) => {
      if (data?.success && data?.data) {
        return {
          ...data,
          data: {
            items: data.data.memberList || [],
            total: data.data.total || 0,
            pagination: data.data.pagination || {
              currentPage: page,
              totalPages: 1,
              totalItems: 0,
            }
          }
        };
      }
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
          }
        }
      };
    }
  });
};

// Clarification Hooks
export const useGetClarifications = (tenderId) => {
  return useQuery({
    queryKey: [queryKeys.clarifications, tenderId],
    queryFn: () => getClarifications(tenderId),
    enabled: !!tenderId,
    staleTime: 30000,
  });
};

export const useCreateClarification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClarification,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.clarifications, variables.tenderId] });
    },
  });
};

export const useAnswerClarification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: answerClarification,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.clarifications, variables.tenderId] });
    },
  });
};

// Submission Hooks
export const useGetSubmissions = (tenderId) => {
  return useQuery({
    queryKey: [queryKeys.submissions, tenderId],
    queryFn: () => getSubmissions(tenderId),
    enabled: !!tenderId,
    staleTime: 30000,
  });
};

export const useGetSubmissionDetails = ({ tenderId, submissionId }) => {
  return useQuery({
    queryKey: [queryKeys.submissionDetails, tenderId, submissionId],
    queryFn: () => getSubmissionDetails({ tenderId, submissionId }),
    enabled: !!tenderId && !!submissionId,
    staleTime: 30000,
  });
};

export const useUpdateSubmissionItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSubmissionItems,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [queryKeys.submissionDetails, variables.tenderId, variables.submissionId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [queryKeys.submissions, variables.tenderId] 
      });
    },
  });
};

export const useSubmitSubmission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitSubmission,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [queryKeys.submissionDetails, variables.tenderId, variables.submissionId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [queryKeys.submissions, variables.tenderId] 
      });
    },
  });
};

// Award Hooks
export const useGetAwardDetails = (tenderId) => {
  return useQuery({
    queryKey: [queryKeys.awardDetails, tenderId],
    queryFn: () => getAwardDetails(tenderId),
    enabled: !!tenderId,
    staleTime: 60000,
  });
};

// Evaluation Hooks
export const useGetEvaluations = (tenderId) => {
  return useQuery({
    queryKey: [queryKeys.evaluations, tenderId],
    queryFn: () => getEvaluations(tenderId),
    enabled: !!tenderId,
    staleTime: 30000,
  });
};

export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEvaluation,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.evaluations, variables.tenderId] });
    },
  });
};

// New separate hooks for issue, close, and award
export const useIssueTender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: issueTender,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenders] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenderDetails, variables] });
    },
  });
};

export const useCloseTender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: closeTender,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenders] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenderDetails, variables] });
    },
  });
};

export const useAwardTender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: awardTender,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenders] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenderDetails, variables.id] });
    },
  });
};

export const useUpdateTenderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTenderStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenders] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenderDetails, variables.id] });
    },
  });
};

export const useDeleteTender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tenders] });
    },
  });
};

export const useDeleteBoqItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBoqItem,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.boqItems, variables.tenderId] });
    },
  });
};

export const useAddBoqItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addBoqItem,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.boqItems, variables.tenderId] });
    },
  });
};