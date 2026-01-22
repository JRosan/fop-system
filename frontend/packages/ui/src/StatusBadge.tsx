import { type HTMLAttributes } from 'react';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_DOCUMENTS'
  | 'PENDING_PAYMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: ApplicationStatus;
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-neutral-100 text-neutral-700',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-primary-100 text-primary-700',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-purple-100 text-purple-700',
  },
  PENDING_DOCUMENTS: {
    label: 'Pending Documents',
    className: 'bg-warning-100 text-warning-700',
  },
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    className: 'bg-pink-100 text-pink-700',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-success-100 text-success-700',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-error-100 text-error-700',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-neutral-100 text-neutral-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-neutral-100 text-neutral-500',
  },
};

export function StatusBadge({ status, className = '', ...props }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`badge ${config.className} ${className}`} {...props}>
      {config.label}
    </span>
  );
}
