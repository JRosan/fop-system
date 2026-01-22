export type UserRole =
  | 'APPLICANT'
  | 'REVIEWER'
  | 'APPROVER'
  | 'FINANCE_OFFICER'
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: UserRole[];
  operatorId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: UserRole[];
  operatorId?: string;
  operatorName?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  preferences?: Partial<UserPreferences>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function hasRole(user: UserProfile | null, role: UserRole): boolean {
  return user?.roles.includes(role) ?? false;
}

export function hasAnyRole(user: UserProfile | null, roles: UserRole[]): boolean {
  return roles.some((role) => hasRole(user, role));
}

export function isAdmin(user: UserProfile | null): boolean {
  return hasRole(user, 'ADMIN');
}

export function canReview(user: UserProfile | null): boolean {
  return hasAnyRole(user, ['REVIEWER', 'APPROVER', 'ADMIN']);
}

export function canApprove(user: UserProfile | null): boolean {
  return hasAnyRole(user, ['APPROVER', 'ADMIN']);
}

export function canManageFinance(user: UserProfile | null): boolean {
  return hasAnyRole(user, ['FINANCE_OFFICER', 'ADMIN']);
}
