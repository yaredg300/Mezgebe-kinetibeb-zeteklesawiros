import React from 'react';
import { Baby, School, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { SundaySchoolDivision, DIVISIONS } from '../types';
import { useArchive } from '../context/ArchiveContext';
import { HaragDivider } from '../components/Ornaments';

export const DivisionSelectionScreen: React.FC<{
  onContinueToLogin: (division: SundaySchoolDivision) => void;
  onExploreAsGuest: (division: SundaySchoolDivision) => void;
}> = ({ onContinueToLogin, onExploreAsGuest }) => {
  const { selectedDivision, selectDivision, works } = useArchive();

  const divisionCards: {
    id: SundaySchoolDivision;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    { id: 'children', icon: Baby, accentColor: '#F5B800' },
    { id: 'intermediates', icon: School, accentColor: '#0C4A9E' },
    { id: 'youth', icon: Users, accentColor: '#8B0000' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFD] dark:bg-[#0B1320] py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Emblem */}
        <div className="p-1 rounded-full bg-white border-2 border-[#B88500] shadow-md mb-3">
          <img
            src="/assets/ic_church_logo.jpg"
            alt="ተክለ ሳዊሮስ ሰንበት ት/ቤት"
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] text-center">
          ተክለ ሳዊሮስ ሰንበት ት/ቤት
        </h1>
        <p className="text-xs font-semibold text-[#966C00] dark:text-[#FFD54F] tracking-wide mt-0.5">
          መዝገበ ኪነጥበብ • የዕድሜ እርከን መምረጫ
        </p>

        <HaragDivider className="my-3 max-w-xs" height={14} />

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 text-center mt-1">
          የትኛውን የኪነጥበብ ቅርንጫፍ መጎብኘት ይፈልጋሉ?
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center max-w-md mt-1 mb-6">
          የተመረጠው ቅርንጫፍ ሙሉውን የኪነጥበብ፣ የመድረክ ዝግጅትና የትምህርት ይዘት ለይቶ ያቀርብልዎታል።
        </p>

        {/* Division Cards */}
        <div className="w-full space-y-3.5 mb-6">
          {divisionCards.map(({ id, icon: IconComponent, accentColor }) => {
            const info = DIVISIONS[id];
            const isSelected = selectedDivision === id;
            const count = works.filter((w) => w.division === id).length;

            return (
              <div
                key={id}
                onClick={() => selectDivision(id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-white dark:bg-[#111D30] border-[#B88500] shadow-md scale-[1.01]'
                    : 'bg-white/80 dark:bg-[#111D30]/80 border-slate-200 dark:border-slate-800 hover:border-[#B88500]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: `${accentColor}18`,
                        color: accentColor,
                        border: `1px solid ${accentColor}40`,
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {info.titleAmharic}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                          style={{ backgroundColor: accentColor }}
                        >
                          {info.ageRangeAmharic}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {info.subtitleAmharic}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isSelected
                        ? 'border-[#B88500] bg-[#B88500] text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-[#B88500]" />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                  {info.descriptionAmharic}
                </p>

                <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-[11px] font-serif-ethiopic text-[#966C00] dark:text-[#FFD54F]">
                  {info.mottoAmharic}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    በመዝገብ ላይ ያሉ ሥራዎች፦
                  </span>
                  <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                    {count} ሥራዎች ተመዝግበዋል
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={() => onContinueToLogin(selectedDivision)}
            className="w-full py-3.5 rounded-full bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
          >
            <span>በ«{DIVISIONS[selectedDivision].titleAmharic}» ቅርንጫፍ ወደ መግቢያ ቀጥል</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onExploreAsGuest(selectedDivision)}
            className="w-full py-3 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-[#B88500]/60 text-[#0C4A9E] dark:text-[#FFD54F] font-bold text-xs sm:text-sm transition-colors"
          >
            እንደ እንግዳ በ«{DIVISIONS[selectedDivision].titleAmharic}» በቀጥታ አስስ
          </button>
        </div>
      </div>
    </div>
  );
};
