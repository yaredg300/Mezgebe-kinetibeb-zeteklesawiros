import React from 'react';
import { SubmissionStatus, SUBMISSION_STATUS_CONFIG } from '../types';

/**
 * Traditional Ethiopian "Harag" (ሐረግ) stylized ornamental divider.
 * Geometric interlocking diamond rosette and braided hairline border lines.
 */
export const HaragDivider: React.FC<{
  className?: string;
  goldColor?: string;
  burgundyColor?: string;
  height?: number;
}> = ({
  className = '',
  goldColor = '#B88500',
  burgundyColor = '#8B0000',
  height = 20,
}) => {
  return (
    <div className={`w-full flex items-center justify-center my-2 select-none ${className}`} style={{ height: `${height}px` }}>
      <svg className="w-full h-full max-w-xl" viewBox="0 0 400 24" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Left hairline */}
        <line x1="20" y1="12" x2="160" y2="12" stroke={goldColor} strokeWidth="1" strokeOpacity="0.45" strokeDasharray="1 0" />
        {/* Left accents */}
        <circle cx="168" cy="12" r="2" fill={burgundyColor} />
        <circle cx="180" cy="12" r="2.5" fill={goldColor} />
        
        {/* Center Illuminated Ethiopian Diamond Rosette */}
        <path d="M 200 4 L 208 12 L 200 20 L 192 12 Z" fill={burgundyColor} />
        <path d="M 200 7 L 205 12 L 200 17 L 195 12 Z" fill={goldColor} fillOpacity="0.8" />
        <circle cx="200" cy="12" r="2" fill="#FFFFFF" />

        {/* Right accents */}
        <circle cx="220" cy="12" r="2.5" fill={goldColor} />
        <circle cx="232" cy="12" r="2" fill={burgundyColor} />
        {/* Right hairline */}
        <line x1="240" y1="12" x2="380" y2="12" stroke={goldColor} strokeWidth="1" strokeOpacity="0.45" strokeDasharray="1 0" />
      </svg>
    </div>
  );
};

/**
 * Ethiopian Manuscript Island Card Container.
 * Renders a detached floating card with rounded corners, subtle elevation, and optional traditional corner flourishes.
 */
export const ManuscriptBox: React.FC<{
  children: React.ReactNode;
  className?: string;
  showCornerFlourish?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, className = '', showCornerFlourish = false, onClick, style }) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 dark:border-[#B88500]/40 shadow-sm dark:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#B88500]/70 hover:shadow-md' : ''
      } ${className}`}
    >
      {showCornerFlourish && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {/* Top Left */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#B88500]/60" />
          {/* Top Right */}
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#B88500]/60" />
          {/* Bottom Left */}
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#B88500]/60" />
          {/* Bottom Right */}
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#B88500]/60" />
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * Illuminated Manuscript Seal Stamp (e.g. for official Sunday school archival verification)
 */
export const ManuscriptSeal: React.FC<{
  text: string;
  className?: string;
  color?: string;
}> = ({ text, className = '', color = '#0C4A9E' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold border ${className}`}
      style={{
        color: color,
        borderColor: color,
        backgroundColor: `${color}15`,
      }}
    >
      <span className="mr-1 text-[10px]">✤</span>
      <span>{text}</span>
    </div>
  );
};

/**
 * Archival Submission Status Badge
 */
export const StatusBadge: React.FC<{
  status: SubmissionStatus;
  className?: string;
}> = ({ status, className = '' }) => {
  const config = SUBMISSION_STATUS_CONFIG[status] || SUBMISSION_STATUS_CONFIG.APPROVED;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${config.bgClass} ${config.colorClass} ${config.borderClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {config.amharicLabel}
    </span>
  );
};

/**
 * Animated Real-time Audio Waveform Equalizer (5 pulsing bars)
 */
export const AudioWaveformVisualizer: React.FC<{
  isPlaying: boolean;
  barColor?: string;
  className?: string;
}> = ({ isPlaying, barColor = '#B88500', className = '' }) => {
  return (
    <div className={`flex items-center space-x-0.5 h-4 ${className}`}>
      {[0.4, 0.9, 0.6, 1.0, 0.5].map((defaultHeight, i) => (
        <span
          key={i}
          className={`w-0.5 rounded-full transition-all duration-300 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundColor: barColor,
            height: isPlaying ? `${Math.max(4, defaultHeight * 16)}px` : '4px',
            animationDelay: `${i * 120}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Candlelight breathing glow container
 */
export const CandlelightGlowBox: React.FC<{
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}> = ({ children, className = '', enabled = true }) => {
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <div
      className={`relative rounded-2xl ${className}`}
      style={{
        boxShadow: '0 0 24px -4px rgba(245, 184, 0, 0.22)',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Top reading progress hairline
 */
export const ReadingProgressHairline: React.FC<{
  progressFraction: number;
}> = ({ progressFraction }) => {
  return (
    <div className="w-full h-1 bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden sticky top-0 z-20">
      <div
        className="h-full bg-gradient-to-r from-[#FFD54F] via-[#B88500] to-[#8B0000] transition-all duration-150"
        style={{ width: `${Math.min(100, Math.max(0, progressFraction * 100))}%` }}
      />
    </div>
  );
};
