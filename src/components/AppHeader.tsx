import React from 'react';
import { ArrowLeft, Info, Moon, Sun, Search, Layers } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { DepartmentSwitcher } from './DepartmentSwitcher';
import { DEPARTMENTS } from '../types';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  onOpenChurchInfo?: () => void;
  onOpenDepartmentsHub?: () => void;
  onSearchClick?: () => void;
  actions?: React.ReactNode;
  showDepartmentSwitcher?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackClick,
  onOpenChurchInfo,
  onOpenDepartmentsHub,
  onSearchClick,
  actions,
  showDepartmentSwitcher = true,
}) => {
  const { themeMode, toggleThemeMode, activeDepartment } = useArchive();

  const currentDeptInfo = DEPARTMENTS[activeDepartment] || {
    titleAmharic: activeDepartment === 'ehud_merha_gibir' ? 'የእሁድ መርሃ ግብር ክፍል' : 'የኪነጥበብ ክፍል',
    subtitleAmharic: activeDepartment === 'ehud_merha_gibir' ? 'የ2019 ዓ.ም. ዕቅድ ጥቅል' : 'የኪነጥበብና ባህል መዝገብ',
  };
  const displayTitle = title || currentDeptInfo.titleAmharic;
  const displaySubtitle = subtitle || currentDeptInfo.subtitleAmharic;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111D30]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs px-2.5 sm:px-4 py-2 sm:py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left Section: Back button or Logo + Title */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack && onBackClick ? (
            <button
              onClick={onBackClick}
              className="p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="ተመለስ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-0.5 rounded-full bg-white border border-[#B88500] shrink-0 shadow-xs">
              <img
                src="/assets/ic_church_logo.jpg"
                alt="ዓርማ"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] truncate leading-tight">
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center / Right Section: Department Switcher + Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {showDepartmentSwitcher && (
            <div className="flex items-center">
              <DepartmentSwitcher
                variant="compact"
                onOpenAllDepartments={onOpenDepartmentsHub}
              />
            </div>
          )}

          {/* All Departments Hub Button */}
          {onOpenDepartmentsHub && (
            <button
              type="button"
              onClick={onOpenDepartmentsHub}
              className="p-1.5 sm:p-2 rounded-xl text-amber-700 dark:text-[#FFD54F] hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-[#B88500]/30 transition-colors flex items-center gap-1"
              title="ሁሉንም የሰንበት ትምህርት ቤት ክፍሎች እይ"
            >
              <Layers className="w-4 h-4 text-[#B88500]" />
              <span className="hidden md:inline text-[11px] font-bold">ክፍሎች</span>
            </button>
          )}

          {actions}

          {onOpenChurchInfo && (
            <button
              onClick={onOpenChurchInfo}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="ስለ ሰንበት ት/ቤቱ መረጃ"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <button
            onClick={toggleThemeMode}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={themeMode === 'DARK' ? 'ብሩህ ገጽታ (Light Mode)' : 'የጨለማ ገጽታ (Dark Mode)'}
          >
            {themeMode === 'DARK' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD54F]" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0C4A9E]" />
            )}
          </button>

          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="ፈልግ"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
