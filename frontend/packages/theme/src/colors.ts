export const colors = {
  // Primary - BVI inspired blue
  primary: {
    50: '#e6f1ff',
    100: '#b3d4ff',
    200: '#80b8ff',
    300: '#4d9bff',
    400: '#1a7fff',
    500: '#0066e6',
    600: '#0052b3',
    700: '#003d80',
    800: '#00294d',
    900: '#00141a',
  },

  // Secondary - Teal accent
  secondary: {
    50: '#e6f7f7',
    100: '#b3e6e6',
    200: '#80d4d4',
    300: '#4dc3c3',
    400: '#1ab1b1',
    500: '#009999',
    600: '#007a7a',
    700: '#005c5c',
    800: '#003d3d',
    900: '#001f1f',
  },

  // Success
  success: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },

  // Warning
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },

  // Error
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },

  // Neutral / Gray
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Status-specific colors
  status: {
    draft: '#94a3b8',
    submitted: '#3b82f6',
    underReview: '#8b5cf6',
    pendingDocuments: '#f59e0b',
    pendingPayment: '#ec4899',
    approved: '#22c55e',
    rejected: '#ef4444',
    expired: '#6b7280',
    cancelled: '#374151',
  },
} as const;

export type Colors = typeof colors;
