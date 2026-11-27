import React from 'react';
import { AlertCircle, ExternalLink, X } from 'lucide-react';

interface AuthErrorAlertProps {
  message: string | null;
  onDismiss?: () => void;
  className?: string;
}

export const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({
  message,
  onDismiss,
  className = '',
}) => {
  if (!message) return null;

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  return (
    <div
      className={`p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs text-left space-y-2 ${className}`}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <p className="font-semibold leading-relaxed break-words">{message}</p>
          {currentHost && (
            <p className="text-[10px] font-mono text-rose-700/90 dark:text-rose-300/90 break-all">
              Domain: {currentHost}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 shrink-0"
            aria-label="ዝጋ"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isInIframe && currentUrl && (
        <div className="pl-6 flex flex-wrap items-center gap-2">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-[11px] font-bold shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>በአዲስ ትር ክፈት (Open in New Tab to Sign In)</span>
          </a>
        </div>
      )}
    </div>
  );
};
