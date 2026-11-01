import React from 'react';
import { ArrowLeft, Info, Moon, Sun, Search } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  onOpenChurchInfo?: () => void;
  onSearchClick?: () => void;
  actions?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'መዝገበ ኪነጥበብ',
  subtitle = 'ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት',
  showBack = false,
  onBackClick,
  onOpenChurchInfo,
  onSearchClick,
  actions,
}) => {
  const { themeMode, toggleThemeMode } = useArchive();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111D30]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Left Section: Back button or Logo + Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack && onBackClick ? (
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="ተመለስ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-0.5 rounded-full bg-white border border-[#B88500] shrink-0 shadow-xs">
              <img
                src="/assets/ic_church_logo.jpg"
                alt="ዓርማ"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Header Action Icons */}
        <div className="flex items-center gap-1 shrink-0">
          {actions}

          {onOpenChurchInfo && (
            <button
              onClick={onOpenChurchInfo}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="ስለ ሰንበት ት/ቤቱ መረጃ"
            >
              <Info className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={themeMode === 'DARK' ? 'ብሩህ ገጽታ' : 'የጨለማ ገጽታ'}
          >
            {themeMode === 'DARK' ? (
              <Sun className="w-5 h-5 text-[#FFD54F]" />
            ) : (
              <Moon className="w-5 h-5 text-[#0C4A9E]" />
            )}
          </button>

          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="ፈልግ"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
