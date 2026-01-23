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

  // BVI Sovereign palette - Marketing landing page
  // Reflects the Territory's unique geography: deep Atlantic to turquoise Caribbean
  bviSovereign: {
    // Deep Atlantic - BVI Flag & Deep Sea - Authority & Law
    atlantic: {
      50: '#e6ecf2',
      100: '#b3c4d6',
      200: '#809cba',
      300: '#4d749e',
      400: '#264d82',
      500: '#003366',
      600: '#002D56', // Primary brand color
      700: '#002647',
      800: '#001e38',
      900: '#001729',
      950: '#000f1a',
    },
    // Virgin Turquoise - North Sound & Shallow Reefs - Action & Success
    turquoise: {
      50: '#e0f4f6',
      100: '#b3e4e9',
      200: '#80d3db',
      300: '#4dc2cd',
      400: '#26b5c2',
      500: '#00A3B1', // Primary action color
      600: '#00828e',
      700: '#00626a',
      800: '#004147',
      900: '#002123',
      950: '#001012',
    },
    // Coral White - Anegada Sand - Light & Airy backgrounds
    sand: {
      50: '#F9FBFB', // Main background
      100: '#f3f7f7',
      200: '#e8efef',
      300: '#dce7e7',
      400: '#c4d4d4',
      500: '#a8bfbf',
      600: '#8aa8a8',
      700: '#6b8f8f',
      800: '#4d7676',
      900: '#2f5c5c',
      950: '#1a4242',
    },
    // Gorda Granite - The Baths & Boulder Formations - Secondary text
    granite: {
      50: '#f7f8f8',
      100: '#ebedef',
      200: '#d1d5db',
      300: '#9ca3af',
      400: '#6b7280',
      500: '#4A5568', // Secondary text
      600: '#3d4654',
      700: '#303740',
      800: '#23282e',
      900: '#16191c',
      950: '#0a0b0d',
    },
    // Prestige Gold - Tropical Sunlight & Revenue - Premium accent
    gold: {
      50: '#fdf9f0',
      100: '#f9f0d9',
      200: '#f2e0b3',
      300: '#e8cc80',
      400: '#ddb94d',
      500: '#C5A059', // Premium accent
      600: '#a68647',
      700: '#876c38',
      800: '#685229',
      900: '#49391a',
      950: '#2a200e',
    },
  },
} as const;

export type Colors = typeof colors;

// Multi-Tenant Theme Tokens for SaaS White-Labeling
// Each territory can customize primary brand while maintaining UX consistency
export const tenantThemes = {
  // British Virgin Islands - Default theme
  bvi: {
    id: 'bvi',
    name: 'British Virgin Islands',
    primary: '#002D56',      // Deep Atlantic
    primaryLight: '#003366',
    accent: '#00A3B1',       // Virgin Turquoise
    accentLight: '#26b5c2',
    surface: '#F9FBFB',      // Coral White
    surfaceDark: '#e8efef',
    text: '#4A5568',         // Gorda Granite
    textMuted: '#6b7280',
    gold: '#C5A059',         // Prestige Gold
    goldLight: '#ddb94d',
    success: '#00A3B1',      // Use turquoise for success
    warning: '#C5A059',      // Use gold for warnings
    error: '#ef4444',
  },
  // Cayman Islands - Racing Green variant
  cayman: {
    id: 'cayman',
    name: 'Cayman Islands',
    primary: '#006847',      // Racing Green
    primaryLight: '#008055',
    accent: '#00A3B1',       // Keep turquoise
    accentLight: '#26b5c2',
    surface: '#F9FBFB',
    surfaceDark: '#e8efef',
    text: '#4A5568',
    textMuted: '#6b7280',
    gold: '#C5A059',
    goldLight: '#ddb94d',
    success: '#00A3B1',
    warning: '#C5A059',
    error: '#ef4444',
  },
  // Turks and Caicos - Coral variant
  turksAndCaicos: {
    id: 'turksAndCaicos',
    name: 'Turks and Caicos',
    primary: '#1E3A5F',      // Deep Teal Blue
    primaryLight: '#2a4d7a',
    accent: '#FF6B6B',       // Coral Pink
    accentLight: '#ff8585',
    surface: '#F9FBFB',
    surfaceDark: '#e8efef',
    text: '#4A5568',
    textMuted: '#6b7280',
    gold: '#C5A059',
    goldLight: '#ddb94d',
    success: '#22c55e',
    warning: '#C5A059',
    error: '#ef4444',
  },
  // Bermuda - Pink variant
  bermuda: {
    id: 'bermuda',
    name: 'Bermuda',
    primary: '#1E4D6B',      // Hamilton Blue
    primaryLight: '#2a6080',
    accent: '#FF9EAA',       // Pink Sand
    accentLight: '#ffb8c0',
    surface: '#FFF9FA',      // Soft pink tint
    surfaceDark: '#f0e8ea',
    text: '#4A5568',
    textMuted: '#6b7280',
    gold: '#C5A059',
    goldLight: '#ddb94d',
    success: '#22c55e',
    warning: '#C5A059',
    error: '#ef4444',
  },
} as const;

export type TenantTheme = typeof tenantThemes[keyof typeof tenantThemes];
export type TenantId = keyof typeof tenantThemes;
