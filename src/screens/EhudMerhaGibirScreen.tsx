import React, { useState, useMemo } from 'react';
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
  Search,
  Award,
  Layers,
  Heart,
  Smile,
  Shield,
  Compass,
  Star,
  Check,
  Target,
  FileCheck,
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
import {
  YOUTH_ANNUAL_TARGETS_2019,
  YOUTH_ORGANIZER_SQUADS_2019,
  YOUTH_PLAN_PDF_PACKAGE,
  YouthAnnualTarget,
  YouthOrganizerSquad,
} from '../data/youthCombinedPlanData';

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

type PlanTab = 'daily' | 'monthly' | 'annual' | 'squads' | 'pdfs';

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
    youthAnnualPlan,
    dailyPlanSheets,
    updateDailyPlanSheet,
    pdfPackages,
    currentUser,
  } = useArchive();

  // Active sub-tab inside Ehud Merha Gibir
  const [activePlanTab, setActivePlanTab] = useState<PlanTab>('daily');

  // Month filter for annual plan
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ኅዳር');

  // Month filter for youth daily schedules (ኅዳር, ታኅሣሥ, ጥር, or all)
  const [youthDailyMonthFilter, setYouthDailyMonthFilter] = useState<string>('ኅዳር');

  // Selected date for daily timetable
  const [selectedDayId, setSelectedDayId] = useState<string>('yth_hidar_6');

  // Search query for organizer squads
  const [squadSearchQuery, setSquadSearchQuery] = useState<string>('');

  // Target category filter for annual strategic plan
  const [selectedTargetCategory, setSelectedTargetCategory] = useState<string>('all');

  // PDF modal preview state
  const [selectedPdfPackage, setSelectedPdfPackage] = useState<SundayPlanPdfPackage | null>(null);

  // Edit attendance/evaluation state
  const [isEditingStats, setIsEditingStats] = useState<boolean>(false);
  const [editParticipants, setEditParticipants] = useState<number>(260);
  const [editNotes, setEditNotes] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const isAdminOrReviewer =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'REVIEWER' ||
    currentUser.role === 'EDITOR';

  // Current annual plan based on division
  const currentAnnualPlan: SundayProgramPlanEntry[] = useMemo(() => {
    if (selectedDivision === 'youth') {
      return youthAnnualPlan;
    }
    if (selectedDivision === 'children') {
      return childrenAnnualPlan;
    }
    return maekelawiyanAnnualPlan;
  }, [selectedDivision, youthAnnualPlan, childrenAnnualPlan, maekelawiyanAnnualPlan]);

  // Filtered annual entries for selected month
  const monthlyAnnualEntries = currentAnnualPlan.filter(
    (entry) => entry.monthAmharic === selectedMonthFilter
  );

  // Current division daily plan sheets
  const divisionDailySheets = useMemo(() => {
    return dailyPlanSheets.filter((sheet) => sheet.division === selectedDivision);
  }, [dailyPlanSheets, selectedDivision]);

  // Filtered youth daily sheets by month
  const filteredYouthDailySheets = useMemo(() => {
    if (selectedDivision !== 'youth') return divisionDailySheets;
    if (youthDailyMonthFilter === 'all') return divisionDailySheets;
    return divisionDailySheets.filter((sheet) => sheet.monthAmharic === youthDailyMonthFilter);
  }, [divisionDailySheets, selectedDivision, youthDailyMonthFilter]);

  // Selected daily plan sheet
  const activeDailySheet = useMemo(() => {
    const foundById = divisionDailySheets.find((s) => s.id === selectedDayId);
    if (foundById) return foundById;
    return filteredYouthDailySheets[0] || divisionDailySheets[0];
  }, [divisionDailySheets, filteredYouthDailySheets, selectedDayId]);

  // Filtered organizer squads
  const filteredSquads = useMemo(() => {
    if (!squadSearchQuery.trim()) return YOUTH_ORGANIZER_SQUADS_2019;
    const q = squadSearchQuery.toLowerCase();
    return YOUTH_ORGANIZER_SQUADS_2019.filter(
      (sq) =>
        sq.nameAmharic.toLowerCase().includes(q) ||
        sq.coordinatorName.toLowerCase().includes(q) ||
        sq.members.some((m) => m.toLowerCase().includes(q)) ||
        sq.spiritualMeaning.toLowerCase().includes(q) ||
        sq.assignedSundays.some((s) => s.toLowerCase().includes(q))
    );
  }, [squadSearchQuery]);

  // Filtered annual operational targets
  const filteredTargets = useMemo(() => {
    if (selectedTargetCategory === 'all') return YOUTH_ANNUAL_TARGETS_2019;
    return YOUTH_ANNUAL_TARGETS_2019.filter((t) => t.category === selectedTargetCategory);
  }, [selectedTargetCategory]);

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
      setSaveToast(`የ${activeDailySheet.dateAmharic} አፈጻጸምና ክትትል በተሳካ ሁኔታ ተመዝግቧል!`);
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      {/* App Header */}
      <AppHeader
        title="የእሁድ መርሐ ግብር ክፍል"
        subtitle="የ2019 ዓ.ም. የተቀናጀ የዕቅድ ጥቅል (የወጣት፣ ማዕከላውያንና ሕፃናት)"
        onOpenDepartmentsHub={onOpenDepartmentsHub}
      />

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{saveToast}</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-5">
        {/* Department Switcher Banner */}
        <DepartmentSwitcher variant="hero" />

        {/* Hero Header Card */}
        <ManuscriptBox className="p-0 overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-[#072958] via-[#0C4A9E] to-[#8B0000] text-white p-5 sm:p-6 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div className="flex items-center sm:items-start gap-3.5 text-center sm:text-left">
                <div className="p-2.5 rounded-2xl bg-white/10 border-2 border-[#FFD54F]/70 text-[#FFD54F] shrink-0 shadow-lg backdrop-blur-xs">
                  <CalendarDays className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD54F]/20 text-[#FFD54F] text-xs font-bold mb-1 border border-[#FFD54F]/40">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>፪፲፲፱ (2019 ዓ.ም.) ኦፊሴላዊ የተቀናጀ የዕቅድ ጥቅል</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-white tracking-wide">
                    {selectedDivision === 'youth'
                      ? 'የወጣቶች ክፍል የእሁድ መርሐ ግብር (2019 ዓ.ም.)'
                      : selectedDivision === 'children'
                      ? 'የሕፃናት ክፍል የእሁድ መርሐ ግብር (2019 ዓ.ም.)'
                      : 'የማዕከላውያን ክፍል የእሁድ መርሐ ግብር (2019 ዓ.ም.)'}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-1 leading-relaxed max-w-2xl">
                    {selectedDivision === 'youth'
                      ? '11ቱ ዓመታዊ ተግባራዊ ዒላማዎች • የህዳር፣ ታህሳስ እና ጥር ወርሃዊ ዕቅዶች • 18ቱ ዝርዝር የደቂቃ የዕለት ሰሌዳዎች • 10ሩ የአዘጋጆች ምድቦች'
                      : 'ዓመታዊ የመርሃ ግብር ሰሌዳ (51 የእሁድ ቀናት) • ወርሃዊ ዝርዝር ዕቅድ • የዕለት የሰዓት ሰሌዳና የአገልጋዮች ምደባ'}
                  </p>
                </div>
              </div>

              {/* Quick Jump to PDF packages */}
              <button
                onClick={() => {
                  const targetPkg =
                    pdfPackages.find((p) => p.division === selectedDivision) ||
                    YOUTH_PLAN_PDF_PACKAGE;
                  setSelectedPdfPackage(targetPkg);
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#F5B800] hover:bg-[#FFD54F] text-[#072958] text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {selectedDivision === 'youth'
                    ? 'የወጣት 38 ገጽ PDF አንብብ'
                    : 'ኦፊሴላዊ PDF አንብብ'}
                </span>
              </button>
            </div>
          </div>

          {/* Division Selector (ወጣት 7:30–9:30 vs ሕፃናት 6:00–8:00 vs ማዕከላውያን 4:00–6:00) */}
          <div className="p-3 bg-white dark:bg-[#111D30] border-t border-[#B88500]/20 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-serif-ethiopic flex items-center gap-1.5">
              <span>የዕድሜ እርከን ምረጥ (Division):</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  selectDivision('youth');
                  setSelectedDayId('yth_hidar_6');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDivision === 'youth'
                    ? 'bg-[#8B0000] text-white shadow-sm ring-2 ring-[#8B0000]/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>🔴 ወጣት ክፍል</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">
                  7:30–9:30
                </span>
              </button>

              <button
                onClick={() => {
                  selectDivision('children');
                  setSelectedDayId('ch_tikimt_1');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDivision === 'children'
                    ? 'bg-[#F5B800] text-slate-900 shadow-sm ring-2 ring-[#F5B800]/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>🟡 ሕፃናት ክፍል</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/40 dark:bg-black/20">
                  6:00–8:00
                </span>
              </button>

              <button
                onClick={() => {
                  selectDivision('intermediates');
                  setSelectedDayId('mk_tikimt_1');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDivision === 'intermediates'
                    ? 'bg-[#0C4A9E] text-white shadow-sm ring-2 ring-[#0C4A9E]/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>🔵 ማዕከላውያን ክፍል</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">
                  4:00–6:00
                </span>
              </button>
            </div>
          </div>
        </ManuscriptBox>

        {/* Plan Mode Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActivePlanTab('daily')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activePlanTab === 'daily'
                  ? 'bg-[#0C4A9E] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>የዕለት ዕቅድ (Daily Timetable)</span>
              {selectedDivision === 'youth' && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/25">
                  18 ቀናት
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePlanTab('monthly')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activePlanTab === 'annual'
                  ? 'bg-[#0C4A9E] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>
                {selectedDivision === 'youth'
                  ? 'ተግባራዊ ዕቅድ (11 ዒላማዎች)'
                  : 'ዓመታዊ ሰሌዳ (51 ቀናት)'}
              </span>
            </button>

            {selectedDivision === 'youth' && (
              <button
                onClick={() => setActivePlanTab('squads')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activePlanTab === 'squads'
                    ? 'bg-[#8B0000] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>10ሩ የአዘጋጅ ምድቦች</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  ፍሬዎች
                </span>
              </button>
            )}

            <button
              onClick={() => setActivePlanTab('pdfs')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activePlanTab === 'pdfs'
                  ? 'bg-[#0C4A9E] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ኦፊሴላዊ ሰነዶች (PDFs)</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            1. DAILY TIMETABLE TAB
           ========================================================================= */}
        {activePlanTab === 'daily' && (
          <div className="space-y-4">
            {/* Youth Month Filter & Date Selector */}
            {selectedDivision === 'youth' ? (
              <div className="p-3.5 bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
                {/* Month Filter Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-serif-ethiopic">
                      የመርሐ ግብር ወር ምረጥ፦
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                      {[
                        { label: 'ኅዳር', count: 6 },
                        { label: 'ታኅሣሥ', count: 6 },
                        { label: 'ጥር', count: 6 },
                        { label: 'all', labelAm: 'ሁሉንም (18ቱ ቀናት)', count: 18 },
                      ].map((m) => {
                        const isSelected = youthDailyMonthFilter === m.label;
                        return (
                          <button
                            key={m.label}
                            onClick={() => setYouthDailyMonthFilter(m.label)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#8B0000] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                          >
                            <span>{m.labelAm || m.label}</span>
                            <span className="ml-1 text-[10px] opacity-75">({m.count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <span className="text-[11px] text-[#8B0000] dark:text-[#FF8A80] font-bold font-serif-ethiopic">
                    ተረኛ ሰዓት፦ ከቀኑ 7:30 እስከ 9:30
                  </span>
                </div>

                {/* Specific Sunday Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {filteredYouthDailySheets.map((sheet) => {
                    const isSelected = activeDailySheet?.id === sheet.id;
                    const isSpecial =
                      sheet.mainTopic.includes('አውደ ምሕረት') ||
                      sheet.mainTopic.includes('ልዩ') ||
                      sheet.mainTopic.includes('ሕይወተ ወራዙት');

                    return (
                      <button
                        key={sheet.id}
                        onClick={() => setSelectedDayId(sheet.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center gap-0.5 shrink-0 border cursor-pointer ${
                          isSelected
                            ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-md ring-2 ring-[#8B0000]/20'
                            : 'bg-slate-50 dark:bg-[#1A2638] border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {isSpecial && <Sparkles className="w-3 h-3 text-[#FFD54F]" />}
                          <span>
                            {sheet.monthAmharic} {sheet.dayNumber}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-normal truncate max-w-[120px] ${
                            isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {sheet.mainTopic.split('—')[0].replace('«', '').replace('»', '')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Children / Intermediates October Day Picker */
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-serif-ethiopic">
                  የጥቅምት ወር የእሁድ ቀናት፦
                </span>
                <div className="flex items-center gap-1.5">
                  {divisionDailySheets.map((sheet) => {
                    const isSelected = activeDailySheet?.id === sheet.id;
                    return (
                      <button
                        key={sheet.id}
                        onClick={() => setSelectedDayId(sheet.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0C4A9E] text-white shadow-md'
                            : 'bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        ጥቅምት {sheet.dayNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Daily Sheet Card */}
            {activeDailySheet ? (
              <ManuscriptBox className="p-4 sm:p-6 space-y-5">
                {/* Daily Sheet Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8B0000]/10 text-[#8B0000] dark:bg-[#8B0000]/30 dark:text-[#FF8A80] border border-[#8B0000]/20">
                        የዕለት ዕቅድ • {activeDailySheet.dateAmharic}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ሰዓት፦ {activeDailySheet.timeAmharic}</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                      {activeDailySheet.mainTopic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs shrink-0">
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                        ተረኛ መሪ / ምድብ
                      </span>
                      <span className="font-bold text-[#8B0000] dark:text-[#FF8A80]">
                        {activeDailySheet.leader}
                      </span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                        አቅራቢ / መምህር
                      </span>
                      <span className="font-bold text-[#B88500] dark:text-[#FFD54F]">
                        {activeDailySheet.presenterOrTeacher}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purpose Banner */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#B88500] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900 dark:text-amber-200 font-serif-ethiopic">
                        የዕለቱ መንፈሳዊ ዓላማ፦
                      </strong>{' '}
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeDailySheet.purpose}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Minute-by-Minute Order of Service */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-serif-ethiopic flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                      <span>የመርሐ ግብር ክፍለ-ጊዜና የደቂቃ ክፍፍል (Order of Service)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      ጠቅላላ፦ {activeDailySheet.slots.length} ክፍሎች
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeDailySheet.slots.map((slot, idx) => {
                      const isHighlighted =
                        slot.slotTitle.includes('ቃለ እግዚአብሔር') ||
                        slot.slotTitle.includes('ኪነጥበብ') ||
                        slot.slotTitle.includes('ውይይት') ||
                        slot.slotTitle.includes('ቲያትር');

                      return (
                        <div
                          key={slot.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isHighlighted
                              ? 'bg-gradient-to-r from-amber-50/90 to-amber-50/40 dark:from-amber-950/30 dark:to-transparent border-amber-300 dark:border-amber-800/80 shadow-2xs'
                              : 'bg-white dark:bg-[#1A2638] border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-[#0C4A9E]/10 dark:bg-blue-950/60 text-[#0C4A9E] dark:text-[#7FAFFF] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {slot.slotTitle}
                                </span>
                                {slot.notes && (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-serif-ethiopic">
                                    {slot.notes}
                                  </span>
                                )}
                              </div>
                              {slot.inCharge && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  ኃላፊ / አቅራቢ፦{' '}
                                  <strong className="text-[#0C4A9E] dark:text-[#7FAFFF]">
                                    {slot.inCharge}
                                  </strong>
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold shrink-0 self-start sm:self-center">
                            {slot.timeRange}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pre-program Checklist */}
                <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-serif-ethiopic flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ከመርሐ ግብሩ በፊት የሚያስፈልጉ ዝግጅቶችና ቁሳቁሶች</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeDailySheet.preProgramNeeds.map((need, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{need}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Post-program Form / Evaluation Stats */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-serif-ethiopic flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#8B0000] dark:text-[#FF8A80]" />
                      <span>ከመርሐ ግብሩ በኋላ የሚሞላ (የክትትልና የተሳትፎ ምዝገባ)</span>
                    </h4>

                    {isAdminOrReviewer && !isEditingStats && (
                      <button
                        onClick={() => {
                          setEditParticipants(
                            activeDailySheet.postProgramStats?.participantsCount || 260
                          );
                          setEditNotes(
                            activeDailySheet.postProgramStats?.evaluationNotes || ''
                          );
                          setIsEditingStats(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>አስተካክል / መዝግብ</span>
                      </button>
                    )}
                  </div>

                  {isEditingStats ? (
                    <div className="space-y-3 bg-white dark:bg-[#1A2638] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                            የተሳታፊ ወጣቶች ብዛት፦
                          </label>
                          <input
                            type="number"
                            value={editParticipants}
                            onChange={(e) => setEditParticipants(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                            ትክክለኛ የሰዓት አፈጻጸም፦
                          </label>
                          <input
                            type="text"
                            defaultValue={activeDailySheet.timeAmharic}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                          የአፈጻጸም ግምገማና ማሻሻያ ማስታወሻ፦
                        </label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-xs"
                          placeholder="የመርሐ ግብሩ ድባብ፣ የተነሱ ጥያቄዎች፣ የጊዜ አጠባበቅና ለቀጣይ የሚጠቅሙ ምክሮች..."
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleSaveStats}
                          className="px-4 py-2 rounded-xl bg-[#8B0000] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#6d0000]"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>መዝግብና አስቀምጥ</span>
                        </button>
                        <button
                          onClick={() => setIsEditingStats(false)}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-medium cursor-pointer"
                        >
                          ተመለስ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 text-[10px]">የተሳታፊዎች ብዛት</span>
                        <span className="text-base font-bold text-[#8B0000] dark:text-[#FF8A80]">
                          {activeDailySheet.postProgramStats?.participantsCount || '—'} ወጣቶች
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 text-[10px]">
                          የሰዓት ክፍለ-ጊዜ
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {activeDailySheet.postProgramStats?.actualStartTime ||
                            activeDailySheet.timeAmharic}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 text-[10px]">የአፈጻጸም ሁኔታ</span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>በተሳካ ሁኔታ ተፈጽሟል</span>
                        </span>
                      </div>
                      {activeDailySheet.postProgramStats?.evaluationNotes && (
                        <div className="p-3 rounded-xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 sm:col-span-3 text-xs text-slate-700 dark:text-slate-300">
                          <strong>የክትትል ማጠቃለያ፦</strong>{' '}
                          {activeDailySheet.postProgramStats.evaluationNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ManuscriptBox>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                ለዚህ ቀን ዝርዝር የዕለት ዕቅድ አልተገኘም።
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            2. MONTHLY PLAN TAB
           ========================================================================= */}
        {activePlanTab === 'monthly' && (
          <div className="space-y-4">
            {selectedDivision === 'youth' ? (
              /* Youth Monthly Programs: ኅዳር፣ ታኅሣሥ፣ ጥር */
              <div className="space-y-5">
                {[
                  {
                    month: 'ኅዳር 2019 ዓ.ም.',
                    motto: '«ተመየጢ» — የንስሐ፣ የጸሎትና የሐዋርያዊ ተልዕኮ ወር',
                    themeColor: 'border-[#8B0000] text-[#8B0000]',
                    sundays: [
                      { day: 6, topic: 'ተመየጢ', scripture: 'መኃልይ 6:13', squad: 'ምድብ 01 (ፍቅር)', type: 'ትምህርትና ኪነጥበብ' },
                      { day: 13, topic: 'አእላፋት መላእክት', scripture: 'ዕብራውያን 1:14', squad: 'ምድብ 02 (ደስታ)', type: 'ትምህርትና መነባንብ' },
                      { day: 20, topic: 'መልካም በግነት', scripture: 'ዮሐንስ 10:11-16', squad: 'ምድብ 03 (ሰላም)', type: 'ትምህርትና በገና' },
                      { day: 21, topic: 'አውደ ምሕረት — እመቤታችን ጽዮን ማርያም', scripture: 'መዝሙር 131', squad: 'ምድብ 04 (ትዕግሥት)', type: 'ልዩ አውደ ምሕረት' },
                      { day: 27, topic: 'ላካቸው', scripture: 'ሉቃስ 10:1-12', squad: 'ምድብ 05 (ቸርነት)', type: 'ተልዕኮና ድራማ' },
                      { day: 30, topic: 'የኅዳር ወር የጸሎትና የምልጃ መርሐ ግብር', scripture: 'ያዕቆብ 5:16', squad: 'ምድብ 06 (በጎነት)', type: 'ህብረት ጸሎት' },
                    ],
                  },
                  {
                    month: 'ታኅሣሥ 2019 ዓ.ም.',
                    motto: '«ሕይወተ ወራዙት» — የወጣቶች ሕይወት ምክክር፣ ልደትና የጥምቀት ዝግጅት',
                    themeColor: 'border-[#B88500] text-[#B88500]',
                    sundays: [
                      { day: 4, topic: 'ነገረ ቅዱሳን አበው ወአማታት — ቅድስት ሐና', scripture: 'ሉቃስ 1:46-55', squad: 'ምድብ 07 (እምነት)', type: 'ነገረ ቅዱሳን' },
                      { day: 11, topic: '«ሕይወተ ወራዙት ፩» (ለየብቻ አዳራሽ)', scripture: 'መክብብ 12:1', squad: 'ምድብ 08 (የውሃት)', type: 'ልዩ ሴሚናር' },
                      { day: 18, topic: '«ሕይወተ ወራዙት ፩» ማጠቃለያ (በጋራ አዳራሽ)', scripture: '1 ቆሮ. 9:25', squad: 'ምድብ 09 (ራስን መግዛት)', type: 'ውይይትና ቃል ኪዳን' },
                      { day: 21, topic: 'አውደ ምሕረት — «ምክረ አበው»', scripture: 'ምሳሌ 1:8', squad: 'ምድብ 10 (ሃይማኖት)', type: 'ልዩ አውደ ምሕረት' },
                      { day: 25, topic: 'ጥንተ ልደቱ ለክርስቶስ (ልዩ የገና ኪነጥበብ 30 ደቂቃ)', scripture: 'ዮሐንስ 1:14', squad: 'ምድብ 01 (ፍቅር)', type: 'ገና ኪነጥበብ' },
                      { day: 30, topic: 'የጥምቀት በዓል ገቢ ማሰባሰቢያና አውደ ርዕይ', scripture: 'ዮሐንስ 1:29', squad: 'ምድብ 02 (ደስታ)', type: 'ልማትና ገቢ' },
                    ],
                  },
                  {
                    month: 'ጥር 2019 ዓ.ም.',
                    motto: '«ሰ/ት/ቤት በወጣቶች እይታ» — አንድነት፣ ታቦተ ጽዮንና ሰማዕትነት',
                    themeColor: 'border-[#0C4A9E] text-[#0C4A9E]',
                    sundays: [
                      { day: 2, topic: 'የአንድነት መ/ግ — «ሰ/ት/ቤት በወጣቶች እይታ» ውይይት', scripture: 'ኤፌሶን 4:3', squad: 'ምድብ 03 (ሰላም)', type: 'ፓነል ውይይት' },
                      { day: 9, topic: 'ዝክረ አበው — አቡነ እስትንፋሰ ክርስቶስ', scripture: 'ምሳሌ 10:7', squad: 'ምድብ 04 (ትዕግሥት)', type: 'ገድለ ቅዱሳን' },
                      { day: 16, topic: 'ታቦተ ጽዮን በኢትዮጵያ', scripture: 'ክብረ ነገሥት', squad: 'ምድብ 05 (ቸርነት)', type: 'ታሪክና ቅርስ' },
                      { day: 21, topic: 'አውደ ምሕረት — ታቦተ ጽዮን', scripture: 'ማኅሌተ ጽጌ', squad: 'ምድብ 06 (በጎነት)', type: 'ልዩ አውደ ምሕረት' },
                      { day: 23, topic: 'ሰማዕትነት አያምልጣችሁ — ቅዱስ ጊዮርጊስ', scripture: '2 ጢሞ. 4:7', squad: 'ምድብ 07 (እምነት)', type: 'ሰማዕታት' },
                      { day: 30, topic: 'የሩብ ዓመት ማጠቃለያ የጸሎትና የምስጋና መርሐ ግብር', scripture: 'ቆላስይስ 3:15', squad: 'ምድብ 08 (የውሃት)', type: 'ምስጋናና ግምገማ' },
                    ],
                  },
                ].map((monthData, idx) => (
                  <ManuscriptBox key={idx} className="p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${monthData.themeColor}`}>
                            {monthData.month}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            6 የተሟሉ የእሁድ መርሐ ግብሮች
                          </span>
                        </div>
                        <h4 className="text-sm font-bold font-serif-ethiopic text-slate-800 dark:text-slate-200 mt-1">
                          {monthData.motto}
                        </h4>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full self-start sm:self-auto">
                        100% የታቀደ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {monthData.sundays.map((sun) => (
                        <div
                          key={sun.day}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 hover:border-[#8B0000] transition-all flex items-start justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[#8B0000]/10 text-[#8B0000] dark:bg-[#8B0000]/30 dark:text-[#FF8A80] flex flex-col items-center justify-center shrink-0 font-bold">
                              <span className="text-[10px] uppercase">እሁድ</span>
                              <span className="text-base leading-none">{sun.day}</span>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                                {sun.topic}
                              </h5>
                              <p className="text-[11px] text-[#B88500] dark:text-[#FFD54F]">
                                ምንባብ፦ {sun.scripture}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                ተረኛ፦ <strong>{sun.squad}</strong>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const targetSheet = divisionDailySheets.find(
                                (s) =>
                                  s.dayNumber === sun.day &&
                                  s.monthAmharic.includes(monthData.month.slice(0, 3))
                              );
                              if (targetSheet) {
                                setSelectedDayId(targetSheet.id);
                              }
                              setActivePlanTab('daily');
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#8B0000] hover:text-white transition-colors text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer"
                            title="የዕለት ሰሌዳ ክፈት"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </ManuscriptBox>
                ))}
              </div>
            ) : (
              /* Children & Intermediates October Monthly Plan */
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
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    5/5 የተዘጋጁ መርሃ ግብሮች
                  </span>
                </div>

                <div className="space-y-2.5">
                  {divisionDailySheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          ጥቅምት {sheet.dayNumber} — {sheet.mainTopic}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          መሪ፦ {sheet.leader} | አቅራቢ፦ {sheet.presenterOrTeacher}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedDayId(sheet.id);
                          setActivePlanTab('daily');
                        }}
                        className="px-3 py-1 rounded-lg bg-[#0C4A9E]/10 text-[#0C4A9E] text-xs font-bold"
                      >
                        ክፈት
                      </button>
                    </div>
                  ))}
                </div>
              </ManuscriptBox>
            )}
          </div>
        )}

        {/* =========================================================================
            3. ANNUAL STRATEGIC TARGETS & 51-SUNDAY CALENDAR
           ========================================================================= */}
        {activePlanTab === 'annual' && (
          <div className="space-y-5">
            {selectedDivision === 'youth' ? (
              /* Youth Division: 11 Strategic Operational Targets from Section 01 */
              <div className="space-y-4">
                <ManuscriptBox className="p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B0000]/10 text-[#8B0000] dark:bg-[#8B0000]/30 dark:text-[#FF8A80]">
                          ክፍል 01 • የዓመት ተግባራዊ ዕቅድ (Youth Strategic Goals)
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 mt-1">
                        የወጣቶች ክፍል 11 ቁልፍ ተግባራዊ ዒላማዎችና ፈጻሚዎች (2019 ዓ.ም.)
                      </h3>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {['all', 'መደበኛ', 'ልዩ', 'ስልጠና', 'ሚዲያና ቴክኖሎጂ', 'ማህበራዊ'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedTargetCategory(cat)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedTargetCategory === cat
                              ? 'bg-[#8B0000] text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'all' ? 'ሁሉም ዒላማዎች (11)' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Operational Targets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredTargets.map((target) => (
                      <div
                        key={target.id}
                        className="p-4 rounded-2xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 hover:border-[#8B0000] transition-all flex flex-col justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#8B0000] dark:text-[#FF8A80] text-xs font-mono font-bold">
                              ዒላማ {target.code}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              {target.category}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                            {target.titleAmharic}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {target.descriptionAmharic}
                          </p>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[10px]">የመለኪያ ዒላማ፦</span>
                              <strong className="text-[#B88500] dark:text-[#FFD54F]">
                                {target.targetMetric}
                              </strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[10px]">ተግባራዊ ወራት፦</span>
                              <span className="font-mono">{target.timelineMonths}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[10px]">ዋና ፈጻሚ አካል፦</span>
                              <span className="text-slate-700 dark:text-slate-300">
                                {target.responsibleBody}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>በዕቅዱ የተካተተ</span>
                          </span>
                          <span className="text-slate-400 font-serif-ethiopic">
                            2019 ዓ.ም. በጀት ዓመት
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ManuscriptBox>
              </div>
            ) : null}

            {/* 51-Sunday Calendar for the Whole Year */}
            <ManuscriptBox className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#0C4A9E]" />
                  <span>የ2019 ዓ.ም. ሙሉ ዓመታዊ የመርሃ ግብር ሰሌዳ (51 የእሁድ ቀናት)</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {currentAnnualPlan.length} የተመዘገቡ ቀናት
                </span>
              </div>

              {/* Month Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {ETHIOPIAN_MONTH_NAMES.map((month) => {
                  const isSelected = selectedMonthFilter === month;
                  const count = currentAnnualPlan.filter((p) => p.monthAmharic === month).length;
                  return (
                    <button
                      key={month}
                      onClick={() => setSelectedMonthFilter(month)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
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

              {/* Grid of Sundays in selected month */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {monthlyAnnualEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      entry.hasProgram
                        ? 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 hover:border-[#0C4A9E]'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#0C4A9E]/10 text-[#0C4A9E] dark:text-[#7FAFFF] text-xs font-bold">
                        {entry.monthAmharic} {entry.dayNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {entry.timeAmharic}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                      {entry.mainTopic}
                    </h4>

                    {entry.leader && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        መሪ፦ {entry.leader} | አቅራቢ፦ {entry.presenterOrTeacher}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ManuscriptBox>
          </div>
        )}

        {/* =========================================================================
            4. 10 ORGANIZER SQUADS (የአዘጋጆች 10 ምድቦች)
           ========================================================================= */}
        {activePlanTab === 'squads' && selectedDivision === 'youth' && (
          <div className="space-y-4">
            <ManuscriptBox className="p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B0000]/10 text-[#8B0000] dark:bg-[#8B0000]/30 dark:text-[#FF8A80]">
                      ክፍል 04 • የአዘጋጆች 10 ምድቦች
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 mt-1">
                    የመንፈስ ፍሬዎች የተሰየሙባቸው 10ሩ የአዘጋጅ ምድቦችና አባላት
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    «የመንፈስ ፍሬ ግን ፍቅር፣ ደስታ፣ ሰላም፣ ትዕግሥት፣ ቸርነት፣ በጎነት፣ እምነት፣ የውሃት፣ ራስን መግዛት ነው» (ገላትያ 5:22)
                  </p>
                </div>

                {/* Squad Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={squadSearchQuery}
                    onChange={(e) => setSquadSearchQuery(e.target.value)}
                    placeholder="አባል ወይም ምድብ ፈልግ..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A2638] text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]/30"
                  />
                </div>
              </div>

              {/* Squads Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSquads.map((squad) => (
                  <div
                    key={squad.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1A2638] border-2 border-slate-200/80 dark:border-slate-800 hover:border-[#8B0000] transition-all flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-xl bg-[#8B0000]/10 text-[#8B0000] dark:bg-[#8B0000]/30 dark:text-[#FF8A80] text-xs font-bold">
                          {squad.nameAmharic}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {squad.members.length} አባላት
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs">
                        <p className="italic text-amber-900 dark:text-amber-200 font-serif-ethiopic">
                          {squad.spiritualMeaning}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          መሪ ቃል፦ «{squad.motto}»
                        </p>
                      </div>

                      {/* Coordinator & Assigned Days */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px]">ዋና አስተባባሪ፦</span>
                          <strong className="text-slate-800 dark:text-slate-200">
                            {squad.coordinatorName}
                          </strong>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-slate-500 text-[10px] shrink-0">ተረኛ ቀናት፦</span>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {squad.assignedSundays.map((sun, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium"
                              >
                                {sun}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Member Chips */}
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          የምድቡ አባላት ዝርዝር፦
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {squad.members.map((member, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 border border-slate-200/50 dark:border-slate-700/50"
                            >
                              <User className="w-3 h-3 text-[#0C4A9E] shrink-0" />
                              <span>{member}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>የልደታ ተክለሣዊሮስ ሰንበት ት/ቤት</span>
                      <span className="text-[#8B0000] font-bold">ወጣቶች ክፍል 2019 ዓ.ም.</span>
                    </div>
                  </div>
                ))}
              </div>
            </ManuscriptBox>
          </div>
        )}

        {/* =========================================================================
            5. OFFICIAL PDF BUNDLES TAB
           ========================================================================= */}
        {activePlanTab === 'pdfs' && (
          <div className="space-y-4">
            <ManuscriptBox className="p-4 sm:p-5">
              <h3 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>የተክለ ሣዊሮስ ሰንበት ት/ቤት ኦፊሴላዊ የ2019 ዓ.ም. የዕቅድ ጥቅል ሰነዶች</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                እነዚህ ሰነዶች በሰንበት ትምህርት ቤቱ የተዘጋጁ ኦፊሴላዊ የዕቅድ ማጠቃለያዎች ሲሆኑ፣ ዓመታዊ ተግባራዊ ዕቅድ፣ ወርሃዊ ዝርዝሮች፣ እንዲሁም የዕለት ሰሌዳዎችን ያካተቱ ናቸው። በቀጥታ በመተግበሪያው ውስጥ ማንበብ ወይም ማውረድ ይችላሉ።
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pdfPackages.map((pkg) => {
                  const isCurrentDivision = pkg.division === selectedDivision;

                  return (
                    <div
                      key={pkg.id}
                      className={`p-4 rounded-2xl bg-white dark:bg-[#1A2638] border-2 shadow-xs flex flex-col justify-between gap-3 transition-all ${
                        isCurrentDivision
                          ? 'border-[#8B0000] dark:border-[#FF8A80] ring-1 ring-[#8B0000]/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-[#0C4A9E]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              pkg.division === 'youth'
                                ? 'bg-[#8B0000] text-white'
                                : 'bg-[#FFD54F] text-[#072958]'
                            }`}
                          >
                            {pkg.yearAmharic} •{' '}
                            {pkg.division === 'youth'
                              ? 'ወጣቶች'
                              : pkg.division === 'children'
                              ? 'ሕፃናት'
                              : 'ማዕከላውያን'}
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

                        {/* Sections List */}
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase">
                            ዋና ዋና ክፍሎች፦
                          </span>
                          {pkg.sections.slice(0, 3).map((sec, idx) => (
                            <p key={idx} className="text-[11px] text-slate-600 dark:text-slate-400">
                              • {sec.title}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedPdfPackage(pkg)}
                          className="flex-1 py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>በመተግበሪያው አንብብ</span>
                        </button>

                        <a
                          href={pkg.filePath}
                          download={pkg.fileName}
                          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          title="ፋይሉን አውርድ"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ManuscriptBox>
          </div>
        )}

        {/* Quick Link Banner to Kinetibeb Archive */}
        {onSwitchToKinetibeb && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-[#B88500]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#B88500]/15 text-[#B88500] shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                  የኪነጥበብ መዝገብን ማሰስ ይፈልጋሉ?
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  ለእነዚህ የወጣቶችና ማዕከላውያን የእሁድ መርሐ ግብሮች የሚሆኑ ተውኔቶች፣ ግጥሞች፣ መነባንቦችና በገና ዝማሬዎችን በኪነጥበብ ክፍል ያግኙ።
                </p>
              </div>
            </div>

            <button
              onClick={onSwitchToKinetibeb}
              className="shrink-0 px-4 py-2 rounded-xl bg-[#B88500] hover:bg-[#966C00] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
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
