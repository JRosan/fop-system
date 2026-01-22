import { apiClient } from '../client';

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  approvedThisMonth: number;
  expiringSoon: number;
  recentApplications: {
    id: string;
    applicationNumber: string;
    status: string;
    operatorName: string;
    createdAt: string;
  }[];
}

export interface ReviewerDashboard {
  pendingReview: number;
  underReview: number;
  pendingDocuments: number;
  completedToday: number;
  assignedApplications: {
    id: string;
    applicationNumber: string;
    status: string;
    operatorName: string;
    submittedAt: string;
  }[];
}

export interface FinanceDashboard {
  pendingPayments: number;
  pendingWaivers: number;
  collectedToday: { amount: number; currency: string };
  collectedThisMonth: { amount: number; currency: string };
}

export interface AdminDashboard {
  totalUsers: number;
  totalOperators: number;
  totalApplications: number;
  totalPermits: number;
  applicationsByStatus: Record<string, number>;
  revenueThisMonth: { amount: number; currency: string };
}

export const dashboardApi = {
  async getApplicantDashboard(operatorId?: string): Promise<DashboardStats> {
    const { data } = await apiClient.get('/dashboard/applicant', {
      params: operatorId ? { operatorId } : undefined,
    });
    return data;
  },

  async getReviewerDashboard(): Promise<ReviewerDashboard> {
    const { data } = await apiClient.get('/dashboard/reviewer');
    return data;
  },

  async getFinanceDashboard(): Promise<FinanceDashboard> {
    const { data } = await apiClient.get('/dashboard/finance');
    return data;
  },

  async getAdminDashboard(): Promise<AdminDashboard> {
    const { data } = await apiClient.get('/dashboard/admin');
    return data;
  },
};
