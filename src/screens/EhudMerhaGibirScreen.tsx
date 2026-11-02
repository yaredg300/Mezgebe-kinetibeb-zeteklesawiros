import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  User,
  Users,
  CheckCircle,
  Circle,
  FileText,
  Download,
  Eye,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Edit3,
  Save,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  SundaySchoolDivision,
  SundayProgramPlanEntry,
  SundayDailyPlanSheet,
  SundayPlanPdfPackage,
  DIVISIONS,
} from '../types';
import { AppHeader } from '../components/AppHeader';
import { ManuscriptBox, HaragDivider } from '../components/Ornaments';
import { SundayPlanPdfViewerModal } from '../components/SundayPlanPdfViewerModal';
import { DepartmentSwitcher } from '../components/DepartmentSwitcher';

const ETHIOPIAN_MONTH_NAMES = [
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
];

export const EhudMerhaGibirScreen: React.FC<{
  onSwitchToKinetibeb?: () => void;
  onOpenWorkClick?: (workId: string) => void;
  onOpenDepartmentsHub?: () => void;
}> = ({ onSwitchToKinetibeb, onOpenWorkClick, onOpenDepartmentsHub }) => {
  const {
    selectedDivision,
    selectDivision,
    childrenAnnualPlan,
    maekelawiyanAnnualPlan,
    dailyPlanSheets,
    updateDailyPlanSheet,
    pdfPackages,
    currentUser,
    works,
  } = useArchive();

  // Active sub-tab inside Ehud Merha Gibir
  const [activePlanTab, setActivePlanTab] = useState<'daily' | 'monthly' | 'annual' | 'pdfs'>('daily');

  // Month filter for annual plan
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ጥቅምት');

  // Selected date for daily timetable
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // PDF modal preview state
  const [selectedPdfPackage, setSelectedPdfPackage] = useState<SundayPlanPdfPackage | null>(null);

  // Edit attendance/evaluation state
  const [isEditingStats, setIsEditingStats] = useState<boolean>(false);
  const [editParticipants, setEditParticipants] = useState<number>(48);
  const [editNotes, setEditNotes] = useState<string>('');

  const isAdminOrReviewer =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'REVIEWER' ||
    currentUser.role === 'EDITOR';

  // Current annual plan based on division
  const currentAnnualPlan: SundayProgramPlanEntry[] =
    selectedDivision === 'children'
      ? childrenAnnualPlan
      : selectedDivision === 'intermediates'
      ? maekelawiyanAnnualPlan
      : maekelawiyanAnnualPlan; // fallback for youth

  // Filtered annual entries for selected month
  const monthlyAnnualEntries = currentAnnualPlan.filter(
    (entry) => entry.monthAmharic === selectedMonthFilter
  );

  // Current division daily plan sheets
  const divisionDailySheets = dailyPlanSheets.filter(
    (sheet) => sheet.division === selectedDivision
  );

  // Selected daily plan sheet
  const activeDailySheet =
    divisionDailySheets.find((sheet) => sheet.dayNumber === selectedDayNumber) ||
    divisionDailySheets[0];

  const activeDivisionConfig = DIVISIONS[selectedDivision];

  // Save updated daily sheet stats
  const handleSaveStats = () => {
    if (activeDailySheet) {
      updateDailyPlanSheet(activeDailySheet.id, {
        postProgramStats: {
          ...activeDailySheet.postProgramStats,
          participantsCount: editParticipants,
          evaluationNotes: editNotes,
        },
      });
      setIsEditingStats(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      {/* App Header */}
      <AppHeader
        title="የእሁድ መርሃ ግብር ክፍል"
        subtitle="የ2019 ዓ.ም. ዓመታዊ፣ ወርሃዊና የዕለት ዕቅድ ጥቅል"
        onOpenDepartmentsHub={onOpenDepartmentsHub}
      />

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-5">
        {/* Department Switcher Banner (Top Prominent Pill) */}
        <DepartmentSwitcher variant="hero" />

        {/* Hero Header Card */}
        <ManuscriptBox className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#072958] via-[#0C4A9E] to-[#072958] text-white p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div className="flex items-center sm:items-start gap-3.5 text-center sm:text-left">
                <div className="p-2.5 rounded-2xl bg-white/10 border-2 border-[#FFD54F]/60 text-[#FFD54F] shrink-0 shadow-md">
                  <CalendarDays className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD54F]/20 text-[#FFD54F] text-xs font-bold mb-1 border border-[#FFD54F]/40">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>፪፲፲፱ (2019 ዓ.ም.) ኦፊሴላዊ የዕቅድ ጥቅል</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-white">
                    የልደታ ተክለሣዊሮስ ሰንበት ት/ቤት የእሁድ መርሃ ግብር
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-1 leading-relaxed">
                    ዓመታዊ የመርሃ ግብር ሰሌዳ (51 የእሁድ ቀናት) • ወርሃዊ ዝርዝር ዕቅድ • የዕለት የሰዓት ሰሌዳና የአገልጋዮች ምደባ
                  </p>
                </div>
              </div>

              {/* Quick Jump to PDF packages */}
              <button
                onClick={() => {
                  const targetPkg =
                    pdfPackages.find((p) => p.division === selectedDivision) || pdfPackages[0];
                  setSelectedPdfPackage(targetPkg);
                }}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#F5B800] hover:bg-[#FFD54F] text-[#072958] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>ኦፊሴላዊ PDF አንብብ</span>
              </button>
            </div>
          </div>

          {/* Division Selector (ሕፃናት 6:00–8:00 vs ማዕከላውያን 4:00–6:00 vs ወጣት) */}
          <div className="p-3 bg-white dark:bg-[#111D30] border-t border-[#B88500]/20 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-serif-ethiopic">
              የዕድሜ እርከን (Division):
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => selectDivision('children')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDivision === 'children'
                    ? 'bg-[#F5B800] text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>🟡 ሕፃናት ክፍል</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/40 dark:bg-black/20">
                  6:00–8:00
                </span>
              </button>

              <button
                onClick={() => selectDivision('intermediates')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDivision === 'intermediates'
                    ? 'bg-[#0C4A9E] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>🔵 ማዕከላውያን ክፍል</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">
                  4:00–6:00
                </span>
              </button>

              <button
                onClick={() => selectDivision('youth')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDivision === 'youth'
                    ? 'bg-[#8B0000] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>🔴 ወጣት ክፍል</span>
              </button>
            </div>
          </div>
        </ManuscriptBox>

        {/* Plan Mode Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActivePlanTab('daily')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePlanTab === 'daily'
                  ? 'bg-[#0C4A9E] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>የዕለት ዕቅድ (Daily Timetable)</span>
            </button>

            <button
              onClick={() => setActivePlanTab('monthly')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePlanTab === 'monthly'
                  ? 'bg-[#0C4A9E] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>ወርሃዊ ዕቅድ (Monthly)</span>
            </button>

            <button
              onClick={() => setActivePlanTab('annual')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePlanTab === 'annual'
                  ? 'bg-[#0C4A9E] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>ዓመታዊ ሰሌዳ (Annual 2019)</span>
            </button>

            <button
              onClick={() => setActivePlanTab('pdfs')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activePlanTab === 'pdfs'
                  ? 'bg-[#0C4A9E] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>የዕቅድ ጥቅል ሰነዶች (PDFs)</span>
            </button>
          </div>
        </div>

        {/* 1. DAILY TIMETABLE TAB */}
        {activePlanTab === 'daily' && (
          <div className="space-y-4">
            {/* Sunday Date Selector Buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-serif-ethiopic">
                የጥቅምት ወር የእሁድ ቀናት፦
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 8, 15, 22, 29].map((day) => {
                  const isSelected = selectedDayNumber === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDayNumber(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0C4A9E] text-white shadow-md'
                          : 'bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      ጥቅምት {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeDailySheet ? (
              <ManuscriptBox className="p-4 sm:p-6 space-y-5">
                {/* Daily Sheet Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0C4A9E]/10 text-[#0C4A9E] dark:text-[#7FAFFF]">
                        የዕለት ዕቅድ • {activeDailySheet.dateAmharic}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        የሰዓት ክፍለ-ጊዜ፦ {activeDailySheet.timeAmharic}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                      ዋና ይዘት፦ {activeDailySheet.mainTopic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <div>
                      <span className="block text-slate-500 text-[10px]">መሪ (Leader)</span>
                      <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                        {activeDailySheet.leader}
                      </span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <div>
                      <span className="block text-slate-500 text-[10px]">
                        አቅራቢ / መምህር
                      </span>
                      <span className="font-bold text-[#B88500] dark:text-[#FFD54F]">
                        {activeDailySheet.presenterOrTeacher}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purpose banner */}
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs">
                  <strong className="text-[#0C4A9E] dark:text-[#7FAFFF] font-serif-ethiopic">
                    የዕለቱ ዓላማ፦
                  </strong>{' '}
                  <span className="text-slate-700 dark:text-slate-300">
                    {activeDailySheet.purpose}
                  </span>
                </div>

                {/* Minute-by-Minute Timetable */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    የመርሃ ግብር ክፍል እና የሰዓት ክፍፍል (Order of Service)
                  </h4>

                  <div className="space-y-1.5">
                    {activeDailySheet.slots.map((slot, idx) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          slot.slotTitle.includes('ዋና ይዘት') || slot.slotTitle.includes('የኔታ') || slot.slotTitle.includes('12ቱ')
                            ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                            : 'bg-white dark:bg-[#1A2638] border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#0C4A9E]/10 dark:bg-blue-950/50 text-[#0C4A9E] dark:text-[#7FAFFF] text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {slot.slotTitle}
                            </span>
                            {slot.inCharge && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                ኃላፊ / አቅራቢ፦ {slot.inCharge}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold shrink-0">
                          {slot.timeRange}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre-program Needs */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ከመርሃ ግብሩ በፊት የሚያስፈልጉ ዝግጅቶችና ቁሳቁሶች
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeDailySheet.preProgramNeeds.map((need, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{need}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Post-program Form / Evaluation */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-serif-ethiopic flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                      ከመርሃ ግብሩ በኋላ የሚሞላ (የክትትልና የተሳትፎ ምዝገባ)
                    </h4>

                    {isAdminOrReviewer && !isEditingStats && (
                      <button
                        onClick={() => {
                          setEditParticipants(activeDailySheet.postProgramStats?.participantsCount || 48);
                          setEditNotes(activeDailySheet.postProgramStats?.evaluationNotes || '');
                          setIsEditingStats(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>አስተካክል / መዝግብ</span>
                      </button>
                    )}
                  </div>

                  {isEditingStats ? (
                    <div className="space-y-3 bg-white dark:bg-[#1A2638] p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                          የተሳታፊዎች ብዛት፦
                        </label>
                        <input
                          type="number"
                          value={editParticipants}
                          onChange={(e) => setEditParticipants(Number(e.target.value))}
                          className="w-full sm:w-40 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                          የተሳካው / ማሻሻያ አስተያየት፦
                        </label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-xs"
                          placeholder="የመርሃ ግብሩ አፈጻጸም፣ የጊዜ አጠባበቅ እና ማሻሻያዎች..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveStats}
                          className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>መዝግብና አስቀምጥ</span>
                        </button>
                        <button
                          onClick={() => setIsEditingStats(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-medium"
                        >
                          ተመለስ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 text-[10px]">የተሳታፊዎች ብዛት</span>
                        <span className="text-sm font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                          {activeDailySheet.postProgramStats?.participantsCount || '—'} ተሳታፊዎች
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 text-[10px]">ትክክለኛ መጀመሪያ / መጨረሻ</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {activeDailySheet.postProgramStats?.actualStartTime || activeDailySheet.timeAmharic}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 sm:col-span-1">
                        <span className="block text-slate-500 text-[10px]">የአፈጻጸም ሁኔታ</span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>ጊዜውን የጠበቀ</span>
                        </span>
                      </div>
                      {activeDailySheet.postProgramStats?.evaluationNotes && (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 sm:col-span-3 text-xs text-slate-600 dark:text-slate-300">
                          <strong>ማጠቃለያ፦</strong> {activeDailySheet.postProgramStats.evaluationNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ManuscriptBox>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                ለዚህ ቀን ዝርዝር የዕለት ዕቅድ ገና አልተመዘገበም።
              </div>
            )}
          </div>
        )}

        {/* 2. MONTHLY PLAN TAB */}
        {activePlanTab === 'monthly' && (
          <div className="space-y-4">
            <ManuscriptBox className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                    የጥቅምት 2019 ዓ.ም. ወርሃዊ ዕቅድ
                  </span>
                  <h3 className="text-lg font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                    {selectedDivision === 'children'
                      ? 'የሕፃናት ክፍል 5 የእሁድ መርሃ ግብሮች'
                      : 'የማዕከላውያን ክፍል 5 የእሁድ መርሃ ግብሮች'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    5/5 የተዘጋጁ መርሃ ግብሮች
                  </span>
                </div>
              </div>

              {/* Monthly Objective */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                <strong className="text-amber-900 dark:text-amber-200 font-serif-ethiopic">
                  የወሩ ዓላማ፦
                </strong>{' '}
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedDivision === 'children'
                    ? 'መሠረታዊ የቤተ ክርስቲያን ትምህርትና ሥነ ምግባርን ማጠናከር፤ በተጋባዥ ልምድ የመያና የቀናነት አገልግሎት ግንዛቤን ማዳበር።'
                    : '«12ቱ እንደ ጌታ» ዋና ሐሳብን በትምህርትና በጥያቄ ማጠናከር፤ ከአብነት ክፍሎች ጋር በቃለ መጠይቅ የአብነትና የልሳነ ግዕዝ ግንዛቤን ማዳበር።'}
                </span>
              </div>

              {/* 5 Sundays breakdown */}
              <div className="space-y-2.5">
                {[
                  {
                    day: 1,
                    time: selectedDivision === 'children' ? '6:00–8:00' : '4:00–6:00',
                    topic: selectedDivision === 'children' ? 'የኔታ' : '12ቱ እንደ ጌታ',
                    leader: selectedDivision === 'children' ? 'ረብራ' : 'ዴሪክ',
                    presenter: selectedDivision === 'children' ? 'ድልናኦድ' : 'መምህር ጎይቶም',
                    aim: selectedDivision === 'children'
                      ? 'መሠረታዊ የቤተ ክርስቲያን ትምህርትና ሥነ ምግባርን ማጠናከር።'
                      : 'ዋና ሐሳቡን በትምህርትና በጥያቄ ማጠናከር።',
                  },
                  {
                    day: 8,
                    time: selectedDivision === 'children' ? '6:00–8:00' : '4:00–6:00',
                    topic: selectedDivision === 'children' ? 'እኔ መሆን የምፈልገው' : 'የአብነትና ልሳነ ግዕዝ መርሃ ግብር',
                    leader: selectedDivision === 'children' ? 'ከፈለኝ' : 'ዲ/ን ሳሚ ደጀኔ',
                    presenter: selectedDivision === 'children' ? 'ዶ/ር ልዩ' : 'ዲ/ን ሚክያስ',
                    aim: selectedDivision === 'children'
                      ? 'የቀናነትና የአገልግሎት ግንዛቤን ማዳበር።'
                      : 'በቃለ መጠይቅ የአብነትና የልሳነ ግዕዝ ግንዛቤን ማጠናከር።',
                  },
                  {
                    day: 15,
                    time: selectedDivision === 'children' ? '6:00–8:00' : '4:00–6:00',
                    topic: selectedDivision === 'children' ? 'መንፈሳዊ ጨዋታ' : 'ጥያቄና መልስ (ትምህርት ክፍል)',
                    leader: 'አስተባባሪ',
                    presenter: 'ተረኛ አገልጋዮች',
                    aim: 'የቡድን ተሳትፎና መንፈሳዊ እውቀት መፈተሽ።',
                  },
                  {
                    day: 22,
                    time: selectedDivision === 'children' ? '6:00–8:00' : '4:00–6:00',
                    topic: 'ልዩ የጽጌ መርሃ ግብር',
                    leader: 'የጽጌ አስተባባሪ',
                    presenter: 'የማኅሌት አባላት',
                    aim: 'የማኅሌተ ጽጌ ምስጢርና በረከት ማስተማር።',
                  },
                  {
                    day: 29,
                    time: selectedDivision === 'children' ? '6:00–8:00' : '4:00–6:00',
                    topic: selectedDivision === 'children' ? 'መንፈሳዊ ፊልም' : 'መጽሐፍ ዳሰሳ',
                    leader: 'ኃላፊ',
                    presenter: 'አቅራቢዎች',
                    aim: 'የንባብና የዕይታ ትምህርት ማዳበር።',
                  },
                ].map((item) => (
                  <div
                    key={item.day}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#0C4A9E] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#0C4A9E]/10 dark:bg-blue-950/60 text-[#0C4A9E] dark:text-[#7FAFFF] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-bold">ጥቅምት</span>
                        <span className="text-base font-bold leading-tight">{item.day}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                            {item.topic}
                          </h4>
                          <span className="text-[11px] px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          መሪ፦ {item.leader} | አቅራቢ፦ {item.presenter}
                        </p>
                        <p className="text-[11px] text-[#B88500] dark:text-[#FFD54F] mt-0.5">
                          {item.aim}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDayNumber(item.day);
                        setActivePlanTab('daily');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0C4A9E]/10 hover:bg-[#0C4A9E]/20 text-[#0C4A9E] dark:text-[#7FAFFF] text-xs font-bold transition-colors self-end sm:self-center shrink-0"
                    >
                      <span>ዝርዝር ዕቅድ ክፈት</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </ManuscriptBox>
          </div>
        )}

        {/* 3. ANNUAL 2019 SCHEDULE TAB (51 SUNDAYS) */}
        {activePlanTab === 'annual' && (
          <div className="space-y-4">
            {/* Month Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {ETHIOPIAN_MONTH_NAMES.map((month) => {
                const isSelected = selectedMonthFilter === month;
                const count = currentAnnualPlan.filter((p) => p.monthAmharic === month).length;
                return (
                  <button
                    key={month}
                    onClick={() => setSelectedMonthFilter(month)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#0C4A9E] text-white shadow-md'
                        : 'bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{month}</span>
                    <span className="ml-1 opacity-75 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Monthly Header summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                የ{selectedMonthFilter} 2019 ዓ.ም. የመርሃ ግብር ሰሌዳ ({monthlyAnnualEntries.length} ሳምንታት)
              </span>
              <span>
                ጠቅላላ የዓመቱ ቀናት፦ <strong>51 የእሁድ ቀናት</strong>
              </span>
            </div>

            {/* List of Sundays in Selected Month */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {monthlyAnnualEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    entry.hasProgram
                      ? 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 hover:border-[#0C4A9E]'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-[#0C4A9E]/10 dark:bg-blue-950/60 text-[#0C4A9E] dark:text-[#7FAFFF] text-xs font-bold">
                        {entry.monthAmharic} {entry.dayNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {entry.timeAmharic}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        entry.hasProgram
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {entry.hasProgram ? 'መርሃ ግብር አለ' : 'መርሃ ግብር የለም'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 leading-snug mb-1">
                    {entry.mainTopic}
                  </h4>

                  {entry.subTheme && (
                    <p className="text-xs text-[#B88500] dark:text-[#FFD54F] font-medium">
                      ንዑስ ርዕስ፦ {entry.subTheme}
                    </p>
                  )}

                  {entry.leader && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      መሪ፦ {entry.leader} | አቅራቢ፦ {entry.presenterOrTeacher}
                    </p>
                  )}

                  {entry.hasProgram && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        ምድብ፦ {entry.category}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDayNumber(entry.dayNumber);
                          setActivePlanTab('daily');
                        }}
                        className="text-[#0C4A9E] dark:text-[#7FAFFF] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>የዕለት ሰሌዳ</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. OFFICIAL PDF BUNDLES TAB */}
        {activePlanTab === 'pdfs' && (
          <div className="space-y-4">
            <ManuscriptBox className="p-4 sm:p-5">
              <h3 className="text-sm font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                የተክለ ሣዊሮስ ሰንበት ት/ቤት ኦፊሴላዊ የ2019 ዓ.ም. የዕቅድ ጥቅል ሰነዶች
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                እነዚህ ሰነዶች በሰንበት ትምህርት ቤቱ የተዘጋጁ ኦፊሴላዊ የዕቅድ ማጠቃለያዎች ሲሆኑ፣ ዓመታዊ የመርሃ ግብር ሰሌዳ፣ የጥቅምት ወርሃዊ ዕቅድ፣ እንዲሁም የዕለት ዕቅዶችን (1፣ 8፣ 15፣ 22፣ 29) ያካተቱ ናቸው። በቀጥታ ማንበብ ወይም ማውረድ ይችላሉ።
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pdfPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1A2638] border-2 border-[#B88500]/40 shadow-xs flex flex-col justify-between gap-3 hover:border-[#0C4A9E] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD54F] text-[#072958]">
                          {pkg.yearAmharic}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {pkg.totalPages} ገጾች • PDF
                        </span>
                      </div>

                      <h4 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 mb-1">
                        {pkg.title}
                      </h4>
                      <p className="text-xs text-[#0C4A9E] dark:text-[#7FAFFF] font-medium mb-2">
                        {pkg.subtitle}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedPdfPackage(pkg)}
                        className="flex-1 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>በመተግበሪያው አንብብ</span>
                      </button>

                      <a
                        href={pkg.filePath}
                        download={pkg.fileName}
                        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                        title="ፋይሉን አውርድ"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </ManuscriptBox>
          </div>
        )}

        {/* Quick Link Banner to Kinetibeb Archive */}
        {onSwitchToKinetibeb && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-[#B88500]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#B88500]/15 text-[#B88500] shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                  የኪነጥበብ መዝገብን ማሰስ ይፈልጋሉ?
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  ለእነዚህ የእሁድ መርሃ ግብሮች የሚሆኑ ተውኔቶች፣ ግጥሞች፣ መነባንቦችና ዝማሬዎችን በኪነጥበብ ክፍል ያግኙ።
                </p>
              </div>
            </div>

            <button
              onClick={onSwitchToKinetibeb}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-[#B88500] hover:bg-[#966C00] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>ወደ ኪነጥበብ ክፍል ተመለስ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdfPackage && (
        <SundayPlanPdfViewerModal
          packageData={selectedPdfPackage}
          onClose={() => setSelectedPdfPackage(null)}
        />
      )}
    </div>
  );
};
