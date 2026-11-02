import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, BookOpen, FileText, Clapperboard, History, Camera, UserCheck, ShieldCheck } from 'lucide-react';
import { HaragDivider, ManuscriptBox } from '../components/Ornaments';

export const OnboardingScreen: React.FC<{
  onComplete: () => void;
  onBackToDepartmentChoice?: () => void;
}> = ({ onComplete, onBackToDepartmentChoice }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#F9FAFD] dark:bg-[#0B1320] flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBackToDepartmentChoice && (
            <button
              onClick={onBackToDepartmentChoice}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="ወደ ክፍሎች ምርጫ ተመለስ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <img
            src="/assets/ic_church_logo.jpg"
            alt="ዓርማ"
            className="w-9 h-9 rounded-full object-cover border-2 border-[#B88500]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <span className="text-base font-bold text-[#0C4A9E] dark:text-[#7FAFFF] block leading-tight">
              የኪነጥበብ ክፍል
            </span>
            <span className="text-[10px] text-[#B88500] font-semibold">
              የፈጠራና የቅርስ ማህደር መግቢያ
            </span>
          </div>
        </div>

        {currentStep < 2 ? (
          <button
            onClick={onComplete}
            className="text-xs font-bold text-[#B88500] hover:underline"
          >
            ዝለል
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Main Step Content */}
      <div className="my-auto py-6">
        {currentStep === 0 && (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="w-full h-48 rounded-2xl overflow-hidden border-2 border-[#B88500]/50 shadow-md mb-6 relative">
              <img
                src="/assets/img_manuscript_hero.jpg"
                alt="የፈጠራ ስራዎች"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold">የብራና እና የኪነጥበብ ቅርስ</span>
              </div>
            </div>

            <span className="text-xs font-bold text-[#B88500] uppercase tracking-wider">
              ደረጃ ፩ — መፍጠር
            </span>

            <h2 className="text-2xl font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mt-1">
              የፈጠራ ሥራዎችን እንፍጠር
            </h2>

            <HaragDivider className="my-3" height={14} />

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif-ethiopic px-2">
              የሰንበት ትምህርት ቤታችን የኪነጥበብ ክፍል አባላት ግጥም፣ ስነ ጽሁፍ፣ ቲያትር፣ መነባንብ እና ድርሳናትን በጥራት የሚጽፉበት እና ለቤተክርስቲያን አገልግሎት የሚያበረክቱበት ዲጂታል የስራ መድረክ።
            </p>

            <div className="grid grid-cols-3 gap-2 w-full mt-6">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 shadow-xs flex items-center justify-center gap-1.5 text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                <BookOpen className="w-4 h-4 text-[#B88500]" />
                <span>ግጥም</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 shadow-xs flex items-center justify-center gap-1.5 text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                <FileText className="w-4 h-4 text-[#B88500]" />
                <span>ስነ ጽሁፍ</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 shadow-xs flex items-center justify-center gap-1.5 text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                <Clapperboard className="w-4 h-4 text-[#B88500]" />
                <span>ቲያትር</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
            <ManuscriptBox className="p-6 w-full mb-6">
              <div className="flex justify-around items-center gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-full bg-[#B88500]/15 border-2 border-[#B88500] flex items-center justify-center text-[#0C4A9E] dark:text-[#7FAFFF]">
                    <History className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold">ብራና</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-full bg-[#B88500]/15 border-2 border-[#B88500] flex items-center justify-center text-[#0C4A9E] dark:text-[#7FAFFF]">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold">ፎቶግራፍ</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-full bg-[#B88500]/15 border-2 border-[#B88500] flex items-center justify-center text-[#0C4A9E] dark:text-[#7FAFFF]">
                    <FileText className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold">ሰነዶች</span>
                </div>
              </div>
              <p className="mt-4 text-xs font-serif-ethiopic italic text-[#B88500] dark:text-[#FFD54F]">
                «የቀደመውን ታሪክ ያልጠበቀ አዲስ ታሪክ መጻፍ አይችልም።»
              </p>
            </ManuscriptBox>

            <span className="text-xs font-bold text-[#B88500] uppercase tracking-wider">
              ደረጃ ፪ — መጠበቅ
            </span>

            <h2 className="text-2xl font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mt-1">
              ትውስታችንን እንጠብቅ
            </h2>

            <HaragDivider className="my-3" height={14} />

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif-ethiopic px-2">
              የዓመታት የኪነጥበብ ዝግጅቶች፣ የድራማ ስክሪፕቶች፣ ፎቶግራፎችና የመድረክ ትውስታዎች ሳይጠፉ ለቀጣዩ ትውልድ በክብር ተመዝግበው የሚቀመጡበት አስተማማኝ ቅርስ።
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
            <ManuscriptBox className="p-5 w-full mb-6">
              <span className="text-xs font-bold text-[#B88500] block mb-3">
                የስራ ፍሰት እና የስርዓት ቁጥጥር
              </span>

              {/* Workflow nodes */}
              <div className="flex items-center justify-between text-center gap-1">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-[#B88500] flex items-center justify-center text-[#0C4A9E]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold mt-1">ፀሐፊ</span>
                </div>
                <span className="text-xs text-[#B88500] font-bold">→</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-[#B88500] flex items-center justify-center text-[#0C4A9E]">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold mt-1">ግምገማ</span>
                </div>
                <span className="text-xs text-[#B88500] font-bold">→</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-[#B88500] flex items-center justify-center text-[#0C4A9E]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold mt-1">ኃላፊ</span>
                </div>
                <span className="text-xs text-[#B88500] font-bold">→</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 mt-1">ፀድቋል</span>
                </div>
              </div>

              <div className="mt-4 py-1.5 px-3 rounded-lg bg-[#B88500]/15 border border-[#B88500]/40 text-xs font-bold text-[#0C4A9E] dark:text-[#FFD54F]">
                ወደ ቋሚ መዝገብ (Archived)
              </div>
            </ManuscriptBox>

            <span className="text-xs font-bold text-[#B88500] uppercase tracking-wider">
              ደረጃ ፫ — ህጋዊና ስርዓታዊ ምዝገባ
            </span>

            <h2 className="text-2xl font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mt-1">
              በኃላፊነት እንዘግብ
            </h2>

            <HaragDivider className="my-3" height={14} />

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif-ethiopic px-2">
              ማንኛውም የፈጠራ ስራ በቤተክርስቲያን ኃላፊዎችና ገምጋሚዎች ተመርምሮና ጸድቆ ብቻ የሚታተምበት ጥብቅና አስተማማኝ ስርዓት።
            </p>
          </div>
        )}
      </div>

      {/* Footer Indicators and Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-7 bg-[#0C4A9E] dark:bg-[#7FAFFF]'
                  : 'w-2 bg-[#B88500]/30'
              }`}
            />
          ))}
        </div>

        {currentStep < 2 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="w-full py-3.5 rounded-full bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
          >
            <span>ቀጣይ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#F5B800] to-[#B88500] hover:brightness-105 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
          >
            <CheckCircle className="w-5 h-5 text-slate-900" />
            <span>ጀምር</span>
          </button>
        )}
      </div>
    </div>
  );
};
