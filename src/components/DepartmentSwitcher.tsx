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
  const { activeDepartment, setActiveDepartment, departmentsList } = useArchive();

  const currentDeptInfo = departmentsList.find((d) => d.id === activeDepartment) || {
    id: activeDepartment,
    titleAmharic: activeDepartment === 'ehud_merha_gibir' ? 'የእሁድ መርሃ ግብር' : 'የኪነጥበብ ክፍል',
    shortTitleAmharic: activeDepartment === 'ehud_merha_gibir' ? 'እሁድ መርሃ ግብር' : 'ኪነጥበብ',
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

  if (variant === 'hero') {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white/90 dark:bg-[#111D30]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#B88500]/30 shadow-xs flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveDepartment('kinetibeb')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeDepartment === 'kinetibeb'
                ? 'bg-gradient-to-r from-[#B88500] to-[#8B0000] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span className="font-serif-ethiopic">የኪነጥበብ ክፍል</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDepartment('ehud_merha_gibir')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeDepartment === 'ehud_merha_gibir'
                ? 'bg-gradient-to-r from-[#0C4A9E] to-[#072958] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-4 h-4 shrink-0 text-[#FFD54F]" />
            <span className="font-serif-ethiopic">የእሁድ መርሃ ግብር</span>
          </button>

          {/* If another department is active */}
          {activeDepartment !== 'kinetibeb' && activeDepartment !== 'ehud_merha_gibir' && (
            <div
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md"
              style={{
                backgroundColor: currentDeptInfo.accentColor || '#0C4A9E',
              }}
            >
              {renderIcon(currentDeptInfo.iconName, 'w-4 h-4')}
              <span className="font-serif-ethiopic truncate">
                {currentDeptInfo.shortTitleAmharic || currentDeptInfo.titleAmharic}
              </span>
            </div>
          )}

          {/* All Departments Modal Button */}
          {onOpenAllDepartments && (
            <button
              type="button"
              onClick={onOpenAllDepartments}
              className="px-2.5 py-2 rounded-xl text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-1 shrink-0"
              title="ሁሉንም የክፍል በሮች እይ"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="text-[11px]">ሌሎች በሮች...</span>
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
      aria-label="የሰንበት ት/ቤት ዋና ክፍል መራጭ"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeDepartment === 'kinetibeb'}
        onClick={() => setActiveDepartment('kinetibeb')}
        className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs font-bold transition-all ${
          activeDepartment === 'kinetibeb'
            ? 'bg-white dark:bg-[#1A2638] text-[#8B0000] dark:text-[#FFD54F] shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        title="ወደ ኪነጥበብ ክፍል መዝገብ"
      >
        <Palette className="w-3 h-3" />
        <span className="font-serif-ethiopic text-[11px]">ኪነጥበብ</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeDepartment === 'ehud_merha_gibir'}
        onClick={() => setActiveDepartment('ehud_merha_gibir')}
        className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs font-bold transition-all ${
          activeDepartment === 'ehud_merha_gibir'
            ? 'bg-[#0C4A9E] text-white shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        title="ወደ እሁድ መርሃ ግብር ክፍል"
      >
        <CalendarDays className="w-3 h-3 text-[#FFD54F]" />
        <span className="font-serif-ethiopic text-[11px]">እሁድ መርሃ ግብር</span>
      </button>

      {/* If another department is active */}
      {activeDepartment !== 'kinetibeb' && activeDepartment !== 'ehud_merha_gibir' && (
        <span
          className="flex items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-bold text-white shadow-xs"
          style={{ backgroundColor: currentDeptInfo.accentColor || '#0C4A9E' }}
        >
          {renderIcon(currentDeptInfo.iconName, 'w-3 h-3')}
          <span className="font-serif-ethiopic truncate max-w-[80px]">
            {currentDeptInfo.shortTitleAmharic || currentDeptInfo.titleAmharic}
          </span>
        </span>
      )}

      {/* Gate Switcher trigger */}
      {onOpenAllDepartments && (
        <button
          type="button"
          onClick={onOpenAllDepartments}
          className="p-1 rounded-lg text-slate-500 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF]"
          title="ሌሎች የክፍል በሮች"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
