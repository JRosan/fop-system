import { create } from 'zustand';
import { apiClient } from '../services/api';

export type InvoiceStatus = 'Draft' | 'Pending' | 'PartiallyPaid' | 'Paid' | 'Overdue' | 'Cancelled';

export type BviAirport = 'TUPJ' | 'TUPW' | 'TUPY';

export interface MoneyDto {
  amount: number;
  currency: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  operatorId: string;
  status: InvoiceStatus;
  arrivalAirport: BviAirport;
  flightDate: string;
  aircraftRegistration?: string;
  totalAmount: MoneyDto;
  balanceDue: MoneyDto;
  dueDate: string;
  isPastDue: boolean;
  daysOverdue: number;
}

export interface InvoiceLineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  quantityUnit?: string;
  unitRate: MoneyDto;
  amount: MoneyDto;
  displayOrder: number;
  isInterestCharge: boolean;
}

export interface Payment {
  id: string;
  amount: MoneyDto;
  method: string;
  status: string;
  transactionReference?: string;
  paymentDate?: string;
  receiptNumber?: string;
  notes?: string;
  recordedBy?: string;
  recordedAt?: string;
}

export interface Invoice extends InvoiceSummary {
  fopApplicationId?: string;
  departureAirport?: BviAirport;
  operationType: string;
  mtow: { value: number; unit: string };
  seatCount: number;
  passengerCount?: number;
  subtotal: MoneyDto;
  totalInterest: MoneyDto;
  amountPaid: MoneyDto;
  invoiceDate: string;
  finalizedAt?: string;
  finalizedBy?: string;
  notes?: string;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountStatus {
  operatorId: string;
  totalInvoiced: MoneyDto;
  totalPaid: MoneyDto;
  totalInterest: MoneyDto;
  currentBalance: MoneyDto;
  totalOverdue: MoneyDto;
  invoiceCount: number;
  paidInvoiceCount: number;
  overdueInvoiceCount: number;
  lastInvoiceDate?: string;
  lastPaymentDate?: string;
  hasOutstandingDebt: boolean;
  hasOverdueDebt: boolean;
  isEligibleForPermitIssuance: boolean;
}

export interface InvoiceState {
  invoices: InvoiceSummary[];
  currentInvoice: Invoice | null;
  accountStatus: AccountStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInvoices: (operatorId?: string, statuses?: InvoiceStatus[]) => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  fetchAccountStatus: (operatorId: string) => Promise<void>;
  clearCurrentInvoice: () => void;
  clearError: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  currentInvoice: null,
  accountStatus: null,
  isLoading: false,
  error: null,

  fetchInvoices: async (operatorId?: string, statuses?: InvoiceStatus[]) => {
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, unknown> = {};
      if (operatorId) {
        params.operatorId = operatorId;
      }
      if (statuses && statuses.length > 0) {
        params.statuses = statuses;
      }
      const response = await apiClient.get<{ items: InvoiceSummary[]; totalCount: number }>('/bvia/invoices', { params });
      const items = Array.isArray(response.data) ? response.data : response.data.items || [];
      set({ invoices: items, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch invoices';
      set({ error: message, isLoading: false });
    }
  },

  fetchInvoice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Invoice>(`/bvia/invoices/${id}`);
      set({ currentInvoice: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch invoice';
      set({ error: message, isLoading: false });
    }
  },

  fetchAccountStatus: async (operatorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<AccountStatus>(`/bvia/operators/${operatorId}/account`);
      set({ accountStatus: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch account status';
      set({ error: message, isLoading: false });
    }
  },

  clearCurrentInvoice: () => set({ currentInvoice: null }),
  clearError: () => set({ error: null }),
}));
