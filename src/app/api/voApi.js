// voApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './configs';

// Query Keys
export const queryKeys = {
  vos: 'vos',
  voDetails: 'voDetails',
  budgetImpact: 'budgetImpact',
};

// Status Constants
export const VO_STATUS = {
  DRAFT: 100,
  PENDING: 101,
  APPROVED: 102,
  REJECTED: 103,
  CANCELLED: 104,
};

export const VO_STATUS_LABELS = {
  [VO_STATUS.DRAFT]: 'Draft',
  [VO_STATUS.PENDING]: 'Pending Review',
  [VO_STATUS.APPROVED]: 'Approved',
  [VO_STATUS.REJECTED]: 'Rejected',
  [VO_STATUS.CANCELLED]: 'Cancelled',
};

export const VO_STATUS_COLORS = {
  [VO_STATUS.DRAFT]: 'bg-slate-100 text-slate-700 border-slate-200',
  [VO_STATUS.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
  [VO_STATUS.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [VO_STATUS.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
  [VO_STATUS.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const VO_RISK = {
  LOW: 100,
  MEDIUM: 101,
  HIGH: 102,
};

export const VO_RISK_LABELS = {
  [VO_RISK.LOW]: 'Low',
  [VO_RISK.MEDIUM]: 'Medium',
  [VO_RISK.HIGH]: 'High',
};

export const VO_RISK_COLORS = {
  [VO_RISK.LOW]: 'text-emerald-600',
  [VO_RISK.MEDIUM]: 'text-amber-600',
  [VO_RISK.HIGH]: 'text-red-600',
};

export const VO_RISK_BG_COLORS = {
  [VO_RISK.LOW]: 'bg-emerald-50',
  [VO_RISK.MEDIUM]: 'bg-amber-50',
  [VO_RISK.HIGH]: 'bg-red-50',
};

// API Functions
export const getVOs = async ({ projectId, status = '' }) => {
  try {
    let url = `/variation-orders?projectId=${encodeURIComponent(projectId)}`;
    if (status) url += `&status=${status}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Get VOs error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch variation orders'
    };
  }
};

export const getVODetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/variation-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get VO details error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch VO details'
    };
  }
};

export const createVO = async (data) => {
  try {
    const response = await axiosInstance.post('/variation-orders', data);
    return response.data;
  } catch (error) {
    console.error('Create VO error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to create variation order'
    };
  }
};

export const reviewVO = async ({ id, action, comments }) => {
  try {
    const response = await axiosInstance.patch(`/variation-orders/${id}/review`, {
      action,
      comments,
    });
    return response.data;
  } catch (error) {
    console.error('Review VO error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to review variation order'
    };
  }
};

export const approveVO = async ({ id, approvedAmount, eSignature }) => {
  try {
    const response = await axiosInstance.patch(`/variation-orders/${id}/approve`, {
      action: 'approve',
      approvedAmount,
      eSignature,
    });
    return response.data;
  } catch (error) {
    console.error('Approve VO error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to approve variation order'
    };
  }
};

export const getBudgetImpact = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/variation-orders/projects/${projectId}/budget-impact`);
    return response.data;
  } catch (error) {
    console.error('Get budget impact error:', error);
    return error?.response?.data || {
      success: false,
      message: 'Failed to fetch budget impact'
    };
  }
};

// React Query Hooks
export const useGetVOs = (params) => {
  return useQuery({
    queryKey: [queryKeys.vos, params],
    queryFn: () => getVOs(params),
    enabled: !!params?.projectId,
    staleTime: 30000,
  });
};

export const useGetVODetails = (id) => {
  return useQuery({
    queryKey: [queryKeys.voDetails, id],
    queryFn: () => getVODetails(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateVO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVO,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.vos] });
      queryClient.invalidateQueries({ 
        queryKey: [queryKeys.budgetImpact, variables.projectId] 
      });
    },
  });
};

export const useReviewVO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reviewVO,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.vos] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.voDetails, variables.id] });
    },
  });
};

export const useApproveVO = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: approveVO,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.vos] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.voDetails, variables.id] });
    },
  });
};

export const useGetBudgetImpact = (projectId) => {
  return useQuery({
    queryKey: [queryKeys.budgetImpact, projectId],
    queryFn: () => getBudgetImpact(projectId),
    enabled: !!projectId,
    staleTime: 30000,
  });
};