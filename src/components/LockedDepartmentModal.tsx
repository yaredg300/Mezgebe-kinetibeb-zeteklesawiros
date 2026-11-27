import React from 'react';
import { Lock, X, ArrowRight, Crown } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { DepartmentInfo, SundaySchoolDepartment } from '../types';

interface LockedDepartmentModalProps {
  department: DepartmentInfo | null;
  onClose: () => void;
  onRedirectToMyDepartment?: (myDeptId: SundaySchoolDepartment) => void;
}

export const LockedDepartmentModal: React.FC<LockedDepartmentModalProps> = ({
  department,
  onClose,
  onRedirectToMyDepartment,
}) => {
  const {
    assignedDepartmentId,
    departmentsList,
    loginAsMasterOperator,
    setActiveDepartment,
  } = useArchive();

  if (!department) return null;

  const assignedDept = departmentsList.find((d) => d.id === assignedDepartmentId);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-rose-300 dark:border-rose-900/60 text-center relative animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-700 dark:text-rose-400 shadow-md mb-3">
          <Lock className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          የአገልግሎት ወሰን ቁጥጥር (Department Locked)
        </span>

        <h3 className="text-lg sm:text-xl font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 mt-2">
          «{department.titleAmharic}» ለእርስዎ ተቆልፏል
        </h3>

        <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-left text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-serif-ethiopic space-y-2">
          <p>
            <strong>የሰንበት ት/ቤቱ የአገልግሎት ደንብ፦</strong> እያንዳንዱ አገልጋይ በተመደበበት <strong>በአንድ ክፍል ብቻ</strong> እንዲያገለግልና እንዲሰራ ይደረጋል።
          </p>
          {assignedDept && (
            <p className="text-blue-900 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/50 p-2 rounded-lg border border-blue-200 dark:border-blue-800 font-semibold">
              እርስዎ የተመደቡት በ«{assignedDept.titleAmharic}» ክፍል ውስጥ ነው።
            </p>
          )}
          <p className="text-slate-600 dark:text-slate-400">
            ሁሉንም ክፍሎች የመክፈትና የማስተዳደር ሙሉ ፈቃድ ያለው <strong>ዋና አስተባባሪ (Master Operator: goferconstruction@gmail.com)</strong> ብቻ ነው።
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {assignedDepartmentId && (
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveDepartment(assignedDepartmentId);
                if (onRedirectToMyDepartment) {
                  onRedirectToMyDepartment(assignedDepartmentId);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>ወደ ተመደብኩበት ክፍል ተመለስ ({assignedDept?.shortTitleAmharic || 'የእኔ ክፍል'})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              loginAsMasterOperator();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-[#B88500]" />
            <span>እንደ ዋና አስተባባሪ ሁሉንም ክፈት (Master Operator)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
