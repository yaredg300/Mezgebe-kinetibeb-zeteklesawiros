import React from 'react';
import {
  Palette,
  CalendarDays,
  Sparkles,
  Layers,
  ChevronDown,
  BookOpen,
  Music,
  Users,
  Megaphone,
  HandCoins,
  Shield,
  ArrowLeftRight,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { SundaySchoolDepartment, DEPARTMENTS } from '../types';

interface DepartmentSwitcherProps {
  className?: string;
  variant?: 'header' | 'compact' | 'hero';
  onOpenAllDepartments?: () => void;
}

export const DepartmentSwitcher: React.FC<DepartmentSwitcherProps> = ({
  className = '',
  variant = 'header',
  onOpenAllDepartments,
}) => {
  const {
    activeDepartment,
    setActiveDepartment,
    departmentsList,
    approvedDepartmentsList,
    canSwitchDepartments,
    isSuperAdmin,
  } = useArchive();

  const currentDeptInfo = departmentsList.find((d) => d.id === activeDepartment) || {
    id: activeDepartment,
    titleAmharic: activeDepartment === 'ehud_merha_gibir' ? 'የእሁድ መርሐ ግብር' : 'የኪነጥበብ ክፍል',
    shortTitleAmharic: activeDepartment === 'ehud_merha_gibir' ? 'እሁድ መርሐ ግብር' : 'ኪነጥበብ',
    accentColor: '#0C4A9E',
    iconName: 'Layers',
  };

  const renderIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Palette':
        return <Palette className={className} />;
      case 'CalendarDays':
        return <CalendarDays className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Music':
        return <Music className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Megaphone':
        return <Megaphone className={className} />;
      case 'HandCoins':
        return <HandCoins className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  // If the user has only 1 approved department and is not super admin, show ONLY their single assigned department badge
  if (!canSwitchDepartments) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 ${className}`}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-serif-ethiopic">
          {currentDeptInfo.titleAmharic || currentDeptInfo.shortTitleAmharic}
        </span>
      </div>
    );
  }

  // If approved for multiple departments or super admin
  if (variant === 'hero') {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white/90 dark:bg-[#111D30]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#B88500]/30 shadow-xs flex flex-wrap items-center gap-1.5">
          {approvedDepartmentsList.slice(0, 3).map((dept) => {
            const isSelected = activeDepartment === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setActiveDepartment(dept.id as SundaySchoolDepartment)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0C4A9E] to-[#072958] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {renderIcon(dept.iconName, 'w-3.5 h-3.5 shrink-0')}
                <span className="font-serif-ethiopic truncate">
                  {dept.shortTitleAmharic || dept.titleAmharic}
                </span>
              </button>
            );
          })}

          {/* If active department is outside the first 3 */}
          {!approvedDepartmentsList.slice(0, 3).some((d) => d.id === activeDepartment) && (
            <div
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-white shadow-md bg-[#0C4A9E]"
            >
              {renderIcon(currentDeptInfo.iconName, 'w-3.5 h-3.5')}
              <span className="font-serif-ethiopic truncate">
                {currentDeptInfo.shortTitleAmharic || currentDeptInfo.titleAmharic}
              </span>
            </div>
          )}

          {/* All Departments Directory Button for Super Admin or Multi-Department */}
          {(isSuperAdmin || approvedDepartmentsList.length > 3) && onOpenAllDepartments && (
            <button
              type="button"
              onClick={onOpenAllDepartments}
              className="px-2.5 py-2 rounded-xl text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-1 shrink-0"
              title="የተፈቀዱ የክፍል በሮች"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="text-[11px]">ሌሎች...</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Header / compact variant
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs ${className}`}
      role="tablist"
      aria-label="የተፈቀዱ የክፍል በሮች መራጭ"
    >
      {approvedDepartmentsList.slice(0, 2).map((dept) => {
        const isSelected = activeDepartment === dept.id;
        return (
          <button
            key={dept.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => setActiveDepartment(dept.id as SundaySchoolDepartment)}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
              isSelected
                ? 'bg-white dark:bg-[#1A2638] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {renderIcon(dept.iconName, 'w-3 h-3')}
            <span className="font-serif-ethiopic text-[11px]">
              {dept.shortTitleAmharic || dept.titleAmharic}
            </span>
          </button>
        );
      })}

      {(isSuperAdmin || approvedDepartmentsList.length > 2) && onOpenAllDepartments && (
        <button
          type="button"
          onClick={onOpenAllDepartments}
          className="p-1 rounded-lg text-slate-500 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF]"
          title="የተፈቀዱ የክፍል በሮች"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
