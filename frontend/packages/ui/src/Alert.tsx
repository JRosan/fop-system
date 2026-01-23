import { type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
}

const variantConfig: Record<AlertVariant, { icon: typeof Info; className: string }> = {
  success: {
    icon: CheckCircle,
    className: 'bg-success-50 border-success-200 text-success-800',
  },
  error: {
    icon: XCircle,
    className: 'bg-error-50 border-error-200 text-error-800',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning-50 border-warning-200 text-warning-800',
  },
  info: {
    icon: Info,
    className: 'bg-bvi-atlantic-50 border-bvi-atlantic-200 text-bvi-atlantic-800',
  },
};

export function Alert({ variant, title, children, onDismiss }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${config.className}`} role="alert">
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? 'text-sm opacity-90 mt-1' : ''}>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
