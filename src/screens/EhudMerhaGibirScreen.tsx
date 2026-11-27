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
  CheckCircle2,
  Calendar,
  Edit3,
  Save,
  Search,
  Target,
  Printer,
  Plus,
  PlusCircle,
  Trash2,
  BarChart3,
  X,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  SundayProgramPlanEntry,
  SundayDailyPlanSheet,
  SundayPlanPdfPackage,
  SundayTimetableSlot,
} from '../types';
import { AppHeader } from '../components/AppHeader';
import { SundayPlanPdfViewerModal } from '../components/SundayPlanPdfViewerModal';
import {
  YOUTH_ANNUAL_TARGETS_2019,
  YOUTH_ORGANIZER_SQUADS_2019,
  CHILDREN_TARGETS_2019,
  MAEKELAWIYAN_TARGETS_2019,
  CHILDREN_TEACHER_SQUADS_2019,
  MAEKELAWIYAN_TEACHER_SQUADS_2019,
  YOUTH_PLAN_PDF_PACKAGE,
  YouthAnnualTarget,
  YouthOrganizerSquad,
} from '../data/youthCombinedPlanData';
import { downloadDailyPlanPdf, printDailyPlanSheet } from '../utils/pdfExport';

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

interface DailySheetFormState {
  dateAmharic: string;
  monthAmharic: string;
  dayNumber: number;
  timeAmharic: string;
  mainTopic: string;
  leader: string;
  presenterOrTeacher: string;
  purpose: string;
  preProgramNeedsText: string;
  slots: SundayTimetableSlot[];
}

export const EhudMerhaGibirScreen: React.FC<{
  onSwitchToKinetibeb?: () => void;
  onOpenWorkClick?: (workId: string) => void;
  onOpenDepartmentsHub?: () => void;
}> = ({ onOpenWorkClick }) => {
  const {
    selectedDivision,
    selectDivision,
    childrenAnnualPlan,
    maekelawiyanAnnualPlan,
    youthAnnualPlan,
    dailyPlanSheets,
    updateDailyPlanSheet,
    createDailyPlanSheet,
    toggleDailyPreProgramItem,
    deleteDailyPlanSheet,
    pdfPackages,
    currentUser,
    scheduleAssignments,
    isDeptAdmin,
    canApproveDeptMembers,
    isSuperAdmin,
    activeMembership,
  } = useArchive();

  // Active sub-tab inside Ehud Merha Gibir
  const [activePlanTab, setActivePlanTab] = useState<PlanTab>('daily');

  // Month filter for annual plan
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ኅዳር');

  // Month filter for daily schedules
  const [dailyMonthFilter, setDailyMonthFilter] = useState<string>('all');

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
  const [editActualTime, setEditActualTime] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Create / Edit Daily Sheet Modal
  const [showSheetModal, setShowSheetModal] = useState<boolean>(false);
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [sheetSaving, setSheetSaving] = useState<boolean>(false);
  const [sheetForm, setSheetForm] = useState<DailySheetFormState>({
    dateAmharic: '',
    monthAmharic: 'ኅዳር',
    dayNumber: 1,
    timeAmharic: '7:30–9:30',
    mainTopic: '',
    leader: '',
    presenterOrTeacher: '',
    purpose: '',
    preProgramNeedsText: 'ማይክሮፎንና ድምፅ ማጉያ\nየመጽሐፍ ቅዱስና ስንክሳር ቅጂ\nየመገኘት መዝገብ',
    slots: [
      { id: 'slot_1', timeRange: '7:30–7:45', slotTitle: 'የመክፈቻ ጸሎትና ምስጋና', inCharge: 'ተረኛ መሪ' },
      { id: 'slot_2', timeRange: '7:45–8:30', slotTitle: 'ቃለ እግዚአብሔር ትምህርት', inCharge: 'መምህር' },
      { id: 'slot_3', timeRange: '8:30–9:15', slotTitle: 'ውይይትና መንፈሳዊ ዝግጅት', inCharge: 'አስተባባሪ' },
      { id: 'slot_4', timeRange: '9:15–9:30', slotTitle: 'ማጠቃለያና የመዝጊያ ጸሎት', inCharge: 'ተረኛ መሪ' },
    ],
  });

  const isAdminOrReviewer =
    isDeptAdmin ||
    canApproveDeptMembers ||
    isSuperAdmin ||
    ['ADMIN', 'SUPER_ADMIN', 'REVIEWER', 'EDITOR'].includes(currentUser.role);

  const canToggleChecklist =
    isAdminOrReviewer ||
    (activeMembership?.departmentId === 'ehud_merha_gibir' && activeMembership?.status === 'APPROVED');

  const divisionLabelAm =
    selectedDivision === 'children'
      ? 'ሕፃናት'
      : selectedDivision === 'intermediates'
      ? 'ማዕከላውያን'
      : 'ወጣቶች';

  const divisionDefaultTime =
    selectedDivision === 'children'
      ? '6:00–8:00'
      : selectedDivision === 'intermediates'
      ? '4:00–6:00'
      : '7:30–9:30';

  const showToastMessage = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3800);
  };

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

  // Dynamic months present in current division daily sheets
  const availableDailyMonths = useMemo(() => {
    const counts = new Map<string, number>();
    divisionDailySheets.forEach((s) => {
      const m = s.monthAmharic || 'ሌላ';
      counts.set(m, (counts.get(m) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([month, count]) => ({ month, count }));
  }, [divisionDailySheets]);

  // Filtered daily sheets by month
  const filteredDailySheets = useMemo(() => {
    if (dailyMonthFilter === 'all') return divisionDailySheets;
    const matched = divisionDailySheets.filter((sheet) => sheet.monthAmharic === dailyMonthFilter);
    return matched.length > 0 ? matched : divisionDailySheets;
  }, [divisionDailySheets, dailyMonthFilter]);

  // Selected daily plan sheet
  const activeDailySheet = useMemo(() => {
    const foundById = divisionDailySheets.find((s) => s.id === selectedDayId);
    if (foundById) return foundById;
    return filteredDailySheets[0] || divisionDailySheets[0];
  }, [divisionDailySheets, filteredDailySheets, selectedDayId]);

  // Division-aware strategic targets
  const currentTargets: YouthAnnualTarget[] = useMemo(() => {
    if (selectedDivision === 'children') return CHILDREN_TARGETS_2019;
    if (selectedDivision === 'intermediates') return MAEKELAWIYAN_TARGETS_2019;
    return YOUTH_ANNUAL_TARGETS_2019;
  }, [selectedDivision]);

  const targetCategories = useMemo(() => {
    return Array.from(new Set(currentTargets.map((t) => t.category)));
  }, [currentTargets]);

  // Filtered annual operational targets
  const filteredTargets = useMemo(() => {
    if (selectedTargetCategory === 'all') return currentTargets;
    return currentTargets.filter((t) => t.category === selectedTargetCategory);
  }, [currentTargets, selectedTargetCategory]);

  // Division-aware squads (10 youth fruit squads or children/intermediates teacher squads)
  const currentSquads: YouthOrganizerSquad[] = useMemo(() => {
    if (selectedDivision === 'children') return CHILDREN_TEACHER_SQUADS_2019;
    if (selectedDivision === 'intermediates') return MAEKELAWIYAN_TEACHER_SQUADS_2019;
    return YOUTH_ORGANIZER_SQUADS_2019;
  }, [selectedDivision]);

  // Filtered organizer squads
  const filteredSquads = useMemo(() => {
    if (!squadSearchQuery.trim()) return currentSquads;
    const q = squadSearchQuery.toLowerCase();
    return currentSquads.filter(
      (sq) =>
        sq.nameAmharic.toLowerCase().includes(q) ||
        sq.coordinatorName.toLowerCase().includes(q) ||
        sq.members.some((m) => m.toLowerCase().includes(q)) ||
        sq.spiritualMeaning.toLowerCase().includes(q) ||
        sq.assignedSundays.some((s) => s.toLowerCase().includes(q))
    );
  }, [currentSquads, squadSearchQuery]);

  // Attendance & Execution Analytics
  const divisionAnalytics = useMemo(() => {
    const plannedSundays = currentAnnualPlan.filter((p) => p.hasProgram).length;
    const evaluatedSheets = divisionDailySheets.filter(
      (s) => typeof s.postProgramStats?.participantsCount === 'number' && s.postProgramStats.participantsCount > 0
    );
    const totalParticipants = evaluatedSheets.reduce(
      (sum, s) => sum + (s.postProgramStats?.participantsCount || 0),
      0
    );
    const avgParticipants =
      evaluatedSheets.length > 0 ? Math.round(totalParticipants / evaluatedSheets.length) : 0;
    return {
      plannedSundays,
      dailySheetsCount: divisionDailySheets.length,
      evaluatedCount: evaluatedSheets.length,
      avgParticipants,
    };
  }, [currentAnnualPlan, divisionDailySheets]);

  // Save updated daily sheet stats
  const handleSaveStats = async () => {
    if (!activeDailySheet) return;
    try {
      await updateDailyPlanSheet(activeDailySheet.id, {
        postProgramStats: {
          ...activeDailySheet.postProgramStats,
          participantsCount: editParticipants,
          actualStartTime: editActualTime.trim() || activeDailySheet.timeAmharic,
          evaluationNotes: editNotes,
        },
      });
      setIsEditingStats(false);
      showToastMessage(`የ${activeDailySheet.dateAmharic} አፈጻጸምና ክትትል በተሳካ ሁኔታ ተመዝግቧል!`);
    } catch {
      setIsEditingStats(false);
      showToastMessage('ውሂቡ በአካባቢ ተቀምጧል (ወደ ደመና ለመላክ የአስተዳዳሪ ፈቃድ ያስፈልጋል)።');
    }
  };

  // Toggle checklist readiness item
  const handleTogglePreProgramItem = async (needItem: string) => {
    if (!activeDailySheet) return;
    if (!canToggleChecklist) {
      showToastMessage('የዝግጅት ምልክት ለማድረግ እባክዎ የክፍሉ የጸደቁ አባል ወይም አስተዳዳሪ ይሁኑ።');
      return;
    }
    try {
      await toggleDailyPreProgramItem(activeDailySheet.id, needItem);
    } catch {
      showToastMessage('ዝግጅቱ በአካባቢ ተመዝግቧል (ወደ ደመና ለማመሳሰል ሉሁ በአስተዳዳሪ መቀመጥ አለበት)።');
    }
  };

  // Open Modal for New or Edit Daily Plan Sheet
  const openCreateSheetModal = () => {
    setEditingSheetId(null);
    setSheetForm({
      dateAmharic: `${selectedMonthFilter} 1 2019 ዓ.ም.`,
      monthAmharic: selectedMonthFilter || 'ኅዳር',
      dayNumber: 1,
      timeAmharic: divisionDefaultTime,
      mainTopic: '',
      leader: '',
      presenterOrTeacher: '',
      purpose: '',
      preProgramNeedsText: 'ማይክሮፎንና ድምፅ ማጉያ\nየመጽሐፍ ቅዱስና ስንክሳር ቅጂ\nየመገኘት መዝገብ',
      slots: [
        { id: `slot_${Date.now()}_1`, timeRange: divisionDefaultTime.split('–')[0] || '7:30', slotTitle: 'የመክፈቻ ጸሎትና ምስጋና', inCharge: 'ተረኛ መሪ' },
        { id: `slot_${Date.now()}_2`, timeRange: '30 ደቂቃ', slotTitle: 'ቃለ እግዚአብሔር ትምህርት', inCharge: 'መምህር' },
        { id: `slot_${Date.now()}_3`, timeRange: '20 ደቂቃ', slotTitle: 'ውይይትና መዝጊያ ጸሎት', inCharge: 'አስተባባሪ' },
      ],
    });
    setShowSheetModal(true);
  };

  const openEditSheetModal = (sheet: SundayDailyPlanSheet) => {
    setEditingSheetId(sheet.id);
    setSheetForm({
      dateAmharic: sheet.dateAmharic,
      monthAmharic: sheet.monthAmharic,
      dayNumber: sheet.dayNumber,
      timeAmharic: sheet.timeAmharic,
      mainTopic: sheet.mainTopic,
      leader: sheet.leader,
      presenterOrTeacher: sheet.presenterOrTeacher,
      purpose: sheet.purpose,
      preProgramNeedsText: sheet.preProgramNeeds.join('\n'),
      slots: sheet.slots.map((s) => ({ ...s })),
    });
    setShowSheetModal(true);
  };

  const handleSaveSheetModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetForm.mainTopic.trim() || !sheetForm.dateAmharic.trim()) return;
    setSheetSaving(true);
    const cleanedNeeds = sheetForm.preProgramNeedsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const cleanedSlots = sheetForm.slots.filter((s) => s.slotTitle.trim());

    try {
      if (editingSheetId) {
        await updateDailyPlanSheet(editingSheetId, {
          dateAmharic: sheetForm.dateAmharic.trim(),
          monthAmharic: sheetForm.monthAmharic.trim(),
          dayNumber: Number(sheetForm.dayNumber) || 1,
          timeAmharic: sheetForm.timeAmharic.trim(),
          mainTopic: sheetForm.mainTopic.trim(),
          leader: sheetForm.leader.trim() || 'ተረኛ መሪ',
          presenterOrTeacher: sheetForm.presenterOrTeacher.trim() || 'ተረኛ መምህር',
          purpose: sheetForm.purpose.trim(),
          preProgramNeeds: cleanedNeeds,
          slots: cleanedSlots,
        });
        showToastMessage('የዕለቱ መርሐ ግብር ሉህ ተሻሽሏል!');
      } else {
        const newId = `custom_${selectedDivision}_${Date.now()}`;
        const created = await createDailyPlanSheet({
          id: newId,
          division: selectedDivision,
          dateAmharic: sheetForm.dateAmharic.trim(),
          monthAmharic: sheetForm.monthAmharic.trim(),
          dayNumber: Number(sheetForm.dayNumber) || 1,
          timeAmharic: sheetForm.timeAmharic.trim(),
          mainTopic: sheetForm.mainTopic.trim(),
          leader: sheetForm.leader.trim() || 'ተረኛ መሪ',
          presenterOrTeacher: sheetForm.presenterOrTeacher.trim() || 'ተረኛ መምህር',
          purpose: sheetForm.purpose.trim(),
          preProgramNeeds: cleanedNeeds,
          slots: cleanedSlots,
        });
        setSelectedDayId(created.id);
        setDailyMonthFilter('all');
        showToastMessage('አዲስ የዕለት መርሐ ግብር ሉህ ተፈጥሯል!');
      }
      setShowSheetModal(false);
    } catch {
      setShowSheetModal(false);
      showToastMessage('ሉሁ በአካባቢ ተቀምጧል (የደመና ማመሳሰል በአስተዳዳሪ ፈቃድ ይጠናቀቃል)።');
    } finally {
      setSheetSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      {/* App Header */}
      <AppHeader
        title="የእሁድ መርሐ ግብር ክፍል"
        subtitle="የ2019 ዓ.ም. የተቀናጀ የዕቅድ ጥቅል (የወጣት፣ ማዕከላውያንና ሕፃናት)"
        showDepartmentSwitcher={false}
      />

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{saveToast}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 space-y-4">
        {/* Top Control, Division Switcher, KPI Strip & Tabs */}
        <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Division Segmented Control & Quick Actions */}
          <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 gap-0.5 self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  selectDivision('youth');
                  setSelectedDayId('yth_hidar_6');
                  setDailyMonthFilter('all');
                  setSelectedTargetCategory('all');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedDivision === 'youth'
                    ? 'bg-[#8B0000] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>ወጣት</span>
                <span className="font-mono tabular-nums text-[10px] opacity-85">7:30–9:30</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  selectDivision('children');
                  setSelectedDayId('ch_tikimt_1');
                  setDailyMonthFilter('all');
                  setSelectedTargetCategory('all');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedDivision === 'children'
                    ? 'bg-[#F5B800] text-slate-900'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>ሕፃናት</span>
                <span className="font-mono tabular-nums text-[10px] opacity-85">6:00–8:00</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  selectDivision('intermediates');
                  setSelectedDayId('mk_tikimt_1');
                  setDailyMonthFilter('all');
                  setSelectedTargetCategory('all');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedDivision === 'intermediates'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>ማዕከላውያን</span>
                <span className="font-mono tabular-nums text-[10px] opacity-85">4:00–6:00</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAdminOrReviewer && (
                <button
                  type="button"
                  onClick={openCreateSheetModal}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                  <span>አዲስ ሉህ</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const targetPkg =
                    pdfPackages.find((p) => p.division === selectedDivision) ||
                    YOUTH_PLAN_PDF_PACKAGE;
                  setSelectedPdfPackage(targetPkg);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ኦፊሴላዊ PDF</span>
              </button>
            </div>
          </div>

          {/* Unified 4-Column Hairline KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x divide-slate-200 dark:divide-slate-800">
            <div className="px-4 py-2.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#0C4A9E]" />
                <span>ዓመታዊ የእሁድ ቀናት</span>
              </span>
              <p className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                {divisionAnalytics.plannedSundays} ቀናት
              </p>
            </div>
            <div className="px-4 py-2.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#8B0000]" />
                <span>ዝርዝር የዕለት ሉሆች</span>
              </span>
              <p className="text-base font-bold font-mono tabular-nums text-[#8B0000] dark:text-[#FF8A80] mt-0.5">
                {divisionAnalytics.dailySheetsCount} ሉሆች
              </p>
            </div>
            <div className="px-4 py-2.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>የተመዘገበ ግምገማ</span>
              </span>
              <p className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                {divisionAnalytics.evaluatedCount} / {divisionAnalytics.dailySheetsCount}
              </p>
            </div>
            <div className="px-4 py-2.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-[#B88500]" />
                <span>አማካይ ተሳታፊ ({divisionLabelAm})</span>
              </span>
              <p className="text-base font-bold font-mono tabular-nums text-[#B88500] dark:text-[#FFD54F] mt-0.5">
                {divisionAnalytics.avgParticipants > 0 ? `${divisionAnalytics.avgParticipants} አባላት` : 'ገና አልተሞላም'}
              </p>
            </div>
          </div>

          {/* Plan Mode Sub-Tabs */}
          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-900/30">
            {[
              { id: 'daily', label: 'የዕለት ዕቅድ', count: divisionDailySheets.length, icon: Clock },
              { id: 'monthly', label: 'ወርሃዊ ዕቅድ', count: undefined, icon: Calendar },
              { id: 'annual', label: 'ዓመታዊ ዒላማ', count: currentTargets.length, icon: Target },
              { id: 'squads', label: 'ምድቦች', count: currentSquads.length, icon: Users },
              { id: 'pdfs', label: 'PDF ሰነዶች', count: pdfPackages.length, icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePlanTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePlanTab(tab.id as PlanTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? tab.id === 'squads'
                        ? 'bg-[#8B0000] text-white'
                        : 'bg-[#0C4A9E] text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`font-mono tabular-nums text-[11px] ${
                        isActive ? 'text-white/90' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            1. DAILY TIMETABLE TAB — 2-COLUMN SPLIT (LEFT LIST / RIGHT DETAIL)
           ========================================================================= */}
        {activePlanTab === 'daily' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left 4 Cols: Month Filter & Vertical Sunday Sheet List */}
            <div className="lg:col-span-4 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/40">
                <select
                  value={dailyMonthFilter}
                  onChange={(e) => setDailyMonthFilter(e.target.value)}
                  aria-label="የመርሐ ግብር ወር ምረጥ"
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">ሁሉም ወራት ({divisionDailySheets.length})</option>
                  {availableDailyMonths.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.month} ({m.count})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] font-mono tabular-nums font-bold text-[#8B0000] dark:text-[#FF8A80]">
                  {divisionDefaultTime}
                </span>
              </div>

              <div className="max-h-[260px] lg:max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDailySheets.map((sheet) => {
                  const isSelected = activeDailySheet?.id === sheet.id;
                  const cleanTopic = sheet.mainTopic
                    .split('—')[0]
                    .replace(/«|»/g, '')
                    .trim();

                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      onClick={() => {
                        setSelectedDayId(sheet.id);
                        setIsEditingStats(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#8B0000]/10 dark:bg-[#8B0000]/25 text-[#8B0000] dark:text-[#FF8A80]'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono tabular-nums font-bold shrink-0">
                            {sheet.monthAmharic} {sheet.dayNumber}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                          <span className="font-semibold truncate">{cleanTopic}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {sheet.leader}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-[#8B0000] dark:text-[#FF8A80]' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 8 Cols: Active Daily Sheet Detail */}
            <div className="lg:col-span-8">
              {activeDailySheet ? (
                <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {/* Daily Sheet Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="font-bold text-[#8B0000] dark:text-[#FF8A80]">
                            {activeDailySheet.dateAmharic}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{activeDailySheet.timeAmharic}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-serif-ethiopic text-slate-900 dark:text-white mt-0.5">
                          {activeDailySheet.mainTopic}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          መሪ፦ <strong className="text-[#8B0000] dark:text-[#FF8A80]">{activeDailySheet.leader}</strong>
                          <span aria-hidden="true"> · </span>
                          አቅራቢ / መምህር፦ <strong className="text-[#B88500] dark:text-[#FFD54F]">{activeDailySheet.presenterOrTeacher}</strong>
                        </p>
                      </div>

                      {/* Export & Admin Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => printDailyPlanSheet(activeDailySheet)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="የዕለቱን መርሐ ግብር አትም"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">አትም</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            downloadDailyPlanPdf(activeDailySheet);
                            showToastMessage(`የ${activeDailySheet.dateAmharic} ሉህ PDF ወርዷል!`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="የዕለቱን ሉህ PDF አውርድ"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        {isAdminOrReviewer && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditSheetModal(activeDailySheet)}
                              className="p-1.5 rounded-lg border border-amber-300/70 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 hover:bg-amber-100 cursor-pointer"
                              title="የዕለቱን ሉህ አስተካክል"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {activeDailySheet.id.startsWith('custom_') && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteDailyPlanSheet(activeDailySheet.id);
                                  showToastMessage('ብጁ የዕለት ሉህ ተሰርዟል።');
                                }}
                                className="p-1.5 rounded-lg border border-rose-300/70 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer"
                                title="ሉሁን ሰርዝ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {activeDailySheet.purpose && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-lg px-3 py-2">
                        <strong className="text-amber-900 dark:text-amber-200 font-serif-ethiopic">ዓላማ፦</strong>{' '}
                        {activeDailySheet.purpose}
                      </p>
                    )}
                  </div>

                  {/* High-Density Minute-by-Minute Timetable */}
                  <div>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200 font-serif-ethiopic">
                        የመርሐ ግብር ክፍለ-ጊዜዎች
                      </span>
                      <span className="font-mono tabular-nums text-[11px] text-slate-500">
                        {activeDailySheet.slots.length} ክፍሎች
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeDailySheet.slots.map((slot, idx) => {
                        const liveAsgn = scheduleAssignments.find(
                          (a) =>
                            a.departmentId === 'ehud_merha_gibir' &&
                            a.scheduleProgramId === activeDailySheet.id &&
                            a.agendaSlotId === slot.id
                        );

                        return (
                          <div
                            key={slot.id}
                            className="px-4 py-2.5 flex items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                          >
                            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                              <span className="text-[11px] font-mono tabular-nums text-slate-400 w-4 shrink-0">
                                {idx + 1}.
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                  {slot.slotTitle}
                                </p>
                                {(slot.inCharge || slot.notes || liveAsgn) && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
                                    {slot.inCharge && <span>{slot.inCharge}</span>}
                                    {liveAsgn && (
                                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                        · ተመድቧል፦ {liveAsgn.responsibleLeadName}
                                      </span>
                                    )}
                                    {slot.notes && <span>· {slot.notes}</span>}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className="text-[11px] font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300 shrink-0">
                              {slot.timeRange}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Side-by-Side Bottom Grid: Pre-Program Checklist (Left) + Post-Program Evaluation (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
                    {/* Left Half: Interactive Pre-program Checklist */}
                    {(() => {
                      const checklistMap = activeDailySheet.preProgramChecklistState || {};
                      const checkedCount = activeDailySheet.preProgramNeeds.filter(
                        (need) => Boolean(checklistMap[need])
                      ).length;

                      return (
                        <div className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 font-serif-ethiopic flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ቅድመ-ዝግጅት ቁሳቁሶች</span>
                            </h4>
                            <span className="text-[11px] font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                              {checkedCount} / {activeDailySheet.preProgramNeeds.length}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {activeDailySheet.preProgramNeeds.map((need, idx) => {
                              const isChecked = Boolean(checklistMap[need]);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleTogglePreProgramItem(need)}
                                  className={`w-full flex items-center gap-2 text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    isChecked
                                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold'
                                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0C4A9E]'
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span className={isChecked ? 'line-through decoration-emerald-500/60' : ''}>
                                    {need}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Right Half: Post-program Attendance & Evaluation */}
                    <div className="p-4 space-y-2.5 bg-slate-50/40 dark:bg-slate-900/20">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 font-serif-ethiopic flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#8B0000] dark:text-[#FF8A80]" />
                          <span>የድኅረ-መርሐ ግብር ክትትል</span>
                        </h4>
                        {isAdminOrReviewer && !isEditingStats && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditParticipants(
                                activeDailySheet.postProgramStats?.participantsCount || 0
                              );
                              setEditActualTime(
                                activeDailySheet.postProgramStats?.actualStartTime ||
                                  activeDailySheet.timeAmharic
                              );
                              setEditNotes(
                                activeDailySheet.postProgramStats?.evaluationNotes || ''
                              );
                              setIsEditingStats(true);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>መዝግብ</span>
                          </button>
                        )}
                      </div>

                      {isEditingStats ? (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                ተሳታፊ ({divisionLabelAm})
                              </label>
                              <input
                                type="number"
                                value={editParticipants}
                                onChange={(e) => setEditParticipants(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                የሰዓት አፈጻጸም
                              </label>
                              <input
                                type="text"
                                value={editActualTime}
                                onChange={(e) => setEditActualTime(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                              ማስታወሻ
                            </label>
                            <textarea
                              rows={2}
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                              placeholder="የመርሐ ግብሩ አፈጻጸም ማስታወሻ..."
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSaveStats}
                              className="px-3 py-1.5 rounded-lg bg-[#8B0000] text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#6d0000]"
                            >
                              <Save className="w-3 h-3" />
                              <span>አስቀምጥ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingStats(false)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-medium cursor-pointer"
                            >
                              ተመለስ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800">
                              <span className="block text-[10px] text-slate-500">ተሳታፊዎች</span>
                              <span className="text-sm font-bold font-mono tabular-nums text-[#8B0000] dark:text-[#FF8A80]">
                                {activeDailySheet.postProgramStats?.participantsCount
                                  ? `${activeDailySheet.postProgramStats.participantsCount} ${divisionLabelAm}`
                                  : '—'}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800">
                              <span className="block text-[10px] text-slate-500">ሰዓት</span>
                              <span className="text-sm font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200">
                                {activeDailySheet.postProgramStats?.actualStartTime ||
                                  activeDailySheet.timeAmharic}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500">ሁኔታ</span>
                            <span
                              className={`text-[11px] font-bold flex items-center gap-1 ${
                                activeDailySheet.postProgramStats?.participantsCount
                                  ? 'text-emerald-600'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>
                                {activeDailySheet.postProgramStats?.participantsCount
                                  ? 'ተፈጽሟል'
                                  : 'የተዘጋጀ'}
                              </span>
                            </span>
                          </div>

                          {activeDailySheet.postProgramStats?.evaluationNotes && (
                            <p className="p-2.5 rounded-lg bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                              <strong>ማጠቃለያ፦</strong> {activeDailySheet.postProgramStats.evaluationNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-[#111D30] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  ለዚህ ቀን ዝርዝር የዕለት ዕቅድ አልተገኘም።
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            2. MONTHLY PLAN TAB
           ========================================================================= */}
        {activePlanTab === 'monthly' && (
          <div className="space-y-4">
            {selectedDivision === 'youth' ? (
              <div className="space-y-4">
                {[
                  {
                    month: 'ኅዳር 2019 ዓ.ም.',
                    motto: '«ተመየጢ» — የንስሐ፣ የጸሎትና የሐዋርያዊ ተልዕኮ ወር',
                    sundays: [
                      { day: 6, topic: 'ተመየጢ', scripture: 'መኃልይ 6:13', squad: 'ምድብ 01 (ፍቅር)' },
                      { day: 13, topic: 'አእላፋት መላእክት', scripture: 'ዕብራውያን 1:14', squad: 'ምድብ 02 (ደስታ)' },
                      { day: 20, topic: 'መልካም በግነት', scripture: 'ዮሐንስ 10:11-16', squad: 'ምድብ 03 (ሰላም)' },
                      { day: 21, topic: 'አውደ ምሕረት — እመቤታችን ጽዮን ማርያም', scripture: 'መዝሙር 131', squad: 'ምድብ 04 (ትዕግሥት)' },
                      { day: 27, topic: 'ላካቸው', scripture: 'ሉቃስ 10:1-12', squad: 'ምድብ 05 (ቸርነት)' },
                      { day: 30, topic: 'የኅዳር ወር የጸሎትና የምልጃ መርሐ ግብር', scripture: 'ያዕቆብ 5:16', squad: 'ምድብ 06 (በጎነት)' },
                    ],
                  },
                  {
                    month: 'ታኅሣሥ 2019 ዓ.ም.',
                    motto: '«ሕይወተ ወራዙት» — የወጣቶች ሕይወት ምክክር፣ ልደትና የጥምቀት ዝግጅት',
                    sundays: [
                      { day: 4, topic: 'ነገረ ቅዱሳን አበው ወአማታት — ቅድስት ሐና', scripture: 'ሉቃስ 1:46-55', squad: 'ምድብ 07 (እምነት)' },
                      { day: 11, topic: '«ሕይወተ ወራዙት ፩» (ለየብቻ አዳራሽ)', scripture: 'መክብብ 12:1', squad: 'ምድብ 08 (የውሃት)' },
                      { day: 18, topic: '«ሕይወተ ወራዙት ፩» ማጠቃለያ (በጋራ አዳራሽ)', scripture: '1 ቆሮ. 9:25', squad: 'ምድብ 09 (ራስን መግዛት)' },
                      { day: 21, topic: 'አውደ ምሕረት — «ምክረ አበው»', scripture: 'ምሳሌ 1:8', squad: 'ምድብ 10 (ሃይማኖት)' },
                      { day: 25, topic: 'ጥንተ ልደቱ ለክርስቶስ (ልዩ የገና ኪነጥበብ 30 ደቂቃ)', scripture: 'ዮሐንስ 1:14', squad: 'ምድብ 01 (ፍቅር)' },
                      { day: 30, topic: 'የጥምቀት በዓል ገቢ ማሰባሰቢያና አውደ ርዕይ', scripture: 'ዮሐንስ 1:29', squad: 'ምድብ 02 (ደስታ)' },
                    ],
                  },
                  {
                    month: 'ጥር 2019 ዓ.ም.',
                    motto: '«ሰ/ት/ቤት በወጣቶች እይታ» — አንድነት፣ ታቦተ ጽዮንና ሰማዕትነት',
                    sundays: [
                      { day: 2, topic: 'የአንድነት መ/ግ — «ሰ/ት/ቤት በወጣቶች እይታ» ውይይት', scripture: 'ኤፌሶን 4:3', squad: 'ምድብ 03 (ሰላም)' },
                      { day: 9, topic: 'ዝክረ አበው — አቡነ እስትንፋሰ ክርስቶስ', scripture: 'ምሳሌ 10:7', squad: 'ምድብ 04 (ትዕግሥት)' },
                      { day: 16, topic: 'ታቦተ ጽዮን በኢትዮጵያ', scripture: 'ክብረ ነገሥት', squad: 'ምድብ 05 (ቸርነት)' },
                      { day: 21, topic: 'አውደ ምሕረት — ታቦተ ጽዮን', scripture: 'ማኅሌተ ጽጌ', squad: 'ምድብ 06 (በጎነት)' },
                      { day: 23, topic: 'ሰማዕትነት አያምልጣችሁ — ቅዱስ ጊዮርጊስ', scripture: '2 ጢሞ. 4:7', squad: 'ምድብ 07 (እምነት)' },
                      { day: 30, topic: 'የሩብ ዓመት ማጠቃለያ የጸሎትና የምስጋና መርሐ ግብር', scripture: 'ቆላስይስ 3:15', squad: 'ምድብ 08 (የውሃት)' },
                    ],
                  },
                ].map((monthData, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-xs font-bold text-[#8B0000] dark:text-[#FF8A80]">
                          {monthData.month} · 6 የእሁድ መርሐ ግብሮች
                        </span>
                        <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white mt-0.5">
                          {monthData.motto}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                        100% የታቀደ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-px bg-slate-100 dark:bg-slate-800">
                      {monthData.sundays.map((sun) => (
                        <div
                          key={sun.day}
                          className="p-3.5 bg-white dark:bg-[#111D30] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#8B0000]/10 text-[#8B0000] dark:bg-[#8B0000]/30 dark:text-[#FF8A80] flex flex-col items-center justify-center shrink-0 font-bold">
                              <span className="text-[9px]">እሁድ</span>
                              <span className="text-sm font-mono tabular-nums leading-none">{sun.day}</span>
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 truncate">
                                {sun.topic}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                <span className="text-[#B88500] dark:text-[#FFD54F]">{sun.scripture}</span>
                                <span> · {sun.squad}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                      የጥቅምት 2019 ዓ.ም. ወርሃዊ ዕቅድ
                    </span>
                    <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                      {selectedDivision === 'children'
                        ? 'የሕፃናት ክፍል የእሁድ መርሃ ግብሮች'
                        : 'የማዕከላውያን ክፍል የእሁድ መርሃ ግብሮች'}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {divisionDailySheets.length} ሉሆች
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {divisionDailySheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          <span className="font-mono tabular-nums">{sheet.monthAmharic} {sheet.dayNumber}</span> — {sheet.mainTopic}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          መሪ፦ {sheet.leader} · አቅራቢ፦ {sheet.presenterOrTeacher}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDayId(sheet.id);
                          setActivePlanTab('daily');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0C4A9E]/10 text-[#0C4A9E] dark:text-[#7FAFFF] text-xs font-bold shrink-0 cursor-pointer"
                      >
                        ክፈት
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            3. ANNUAL STRATEGIC TARGETS & 51-SUNDAY CALENDAR
           ========================================================================= */}
        {activePlanTab === 'annual' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-[#8B0000] dark:text-[#FF8A80]">
                    የ2019 ዓ.ም. ዓመታዊ ተግባራዊ ዕቅድ ({divisionLabelAm})
                  </span>
                  <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white mt-0.5">
                    {currentTargets.length} ቁልፍ ተግባራዊ ዒላማዎችና ፈጻሚዎች
                  </h3>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {['all', ...targetCategories].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedTargetCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        selectedTargetCategory === cat
                          ? 'bg-[#8B0000] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat === 'all' ? `ሁሉም (${currentTargets.length})` : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTargets.map((target) => (
                  <div
                    key={target.id}
                    className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-mono font-bold text-[#8B0000] dark:text-[#FF8A80]">
                          ዒላማ {target.code}
                        </span>
                        <span className="font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                          {target.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                        {target.titleAmharic}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {target.descriptionAmharic}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">የመለኪያ ዒላማ</span>
                        <strong className="text-[#B88500] dark:text-[#FFD54F] text-right">{target.targetMetric}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">ወራት</span>
                        <span className="font-mono tabular-nums text-right">{target.timelineMonths}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">ዋና ፈጻሚ</span>
                        <span className="text-right">{target.responsibleBody}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 51-Sunday Calendar */}
            <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#0C4A9E]" />
                  <span>ሙሉ ዓመታዊ የመርሃ ግብር ሰሌዳ</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {currentAnnualPlan.length} ቀናት
                </span>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {ETHIOPIAN_MONTH_NAMES.map((month) => {
                  const isSelected = selectedMonthFilter === month;
                  const count = currentAnnualPlan.filter((p) => p.monthAmharic === month).length;
                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => setSelectedMonthFilter(month)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#0C4A9E] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{month}</span>
                      <span className="ml-1 opacity-75 font-mono tabular-nums text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {monthlyAnnualEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-xl border ${
                      entry.hasProgram
                        ? 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <span className="font-mono tabular-nums font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                        {entry.monthAmharic} {entry.dayNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {entry.timeAmharic}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                      {entry.mainTopic}
                    </h4>
                    {entry.leader && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        መሪ፦ {entry.leader} · አቅራቢ፦ {entry.presenterOrTeacher}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. ORGANIZER SQUADS
           ========================================================================= */}
        {activePlanTab === 'squads' && (
          <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                  {selectedDivision === 'youth'
                    ? 'የመንፈስ ፍሬዎች 10ሩ የአዘጋጅ ምድቦች'
                    : `የ${divisionLabelAm} ክፍል ተረኛ መምህራንና አስተባባሪ ቡድኖች (${currentSquads.length})`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedDivision === 'youth'
                    ? '«የመንፈስ ፍሬ ግን ፍቅር፣ ደስታ፣ ሰላም፣ ትዕግሥት፣ ቸርነት፣ በጎነት፣ እምነት፣ የውሃት፣ ራስን መግዛት ነው» (ገላትያ 5:22)'
                    : 'የእሁድ መርሐ ግብርን የሚመሩ የመምህራንና አስተባባሪዎች ቡድኖች'}
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={squadSearchQuery}
                  onChange={(e) => setSquadSearchQuery(e.target.value)}
                  placeholder="አባል ወይም ምድብ ፈልግ..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8B0000]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSquads.map((squad) => (
                <div
                  key={squad.id}
                  className="p-3.5 rounded-xl bg-slate-50/40 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2.5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#8B0000] dark:text-[#FF8A80]">
                        {squad.nameAmharic}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {squad.members.length} አባላት
                      </span>
                    </div>

                    <p className="text-xs italic text-amber-900 dark:text-amber-200 font-serif-ethiopic bg-amber-50/60 dark:bg-amber-950/20 px-2.5 py-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                      {squad.spiritualMeaning} — «{squad.motto}»
                    </p>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      <div>
                        አስተባባሪ፦ <strong className="text-slate-900 dark:text-white">{squad.coordinatorName}</strong>
                      </div>
                      <div>
                        ተረኛ ቀናት፦ <span className="font-mono">{squad.assignedSundays.join(' · ')}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {squad.members.map((member, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 inline-flex items-center gap-1"
                        >
                          <User className="w-2.5 h-2.5 text-[#0C4A9E] shrink-0" />
                          <span>{member}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            5. OFFICIAL PDF BUNDLES TAB
           ========================================================================= */}
        {activePlanTab === 'pdfs' && (
          <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>የተክለ ሣዊሮስ ሰንበት ት/ቤት ኦፊሴላዊ የ2019 ዓ.ም. የዕቅድ ሰነዶች</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ዓመታዊ ተግባራዊ ዕቅድ፣ ወርሃዊ ዝርዝሮችና የዕለት ሰሌዳዎችን በመተግበሪያው ውስጥ ማንበብ ወይም ማውረድ ይችላሉ።
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {pdfPackages.map((pkg) => {
                const isCurrentDivision = pkg.division === selectedDivision;
                const divName =
                  pkg.division === 'youth'
                    ? 'ወጣቶች'
                    : pkg.division === 'children'
                    ? 'ሕፃናት'
                    : 'ማዕከላውያን';

                return (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border flex flex-col justify-between gap-3 ${
                      isCurrentDivision
                        ? 'border-[#8B0000] dark:border-[#FF8A80]'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] mb-1.5">
                        <span className="font-bold text-[#8B0000] dark:text-[#FF8A80]">
                          {pkg.yearAmharic} · {divName}
                        </span>
                        <span className="text-slate-500 font-mono tabular-nums">
                          {pkg.totalPages} ገጽ
                        </span>
                      </div>

                      <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white mb-1">
                        {pkg.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">
                        {pkg.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-0.5">
                        {pkg.sections.slice(0, 3).map((sec, idx) => (
                          <p key={idx} className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                            • {sec.title}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPdfPackage(pkg)}
                        className="flex-1 py-2 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>አንብብ</span>
                      </button>

                      <a
                        href={pkg.filePath}
                        download={pkg.fileName}
                        className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        title="ፋይሉን አውርድ"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Create / Edit Daily Plan Sheet Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                  {editingSheetId ? 'የዕለት መርሐ ግብር ሉህ ማስተካከያ' : `አዲስ የዕለት መርሐ ግብር ሉህ (${divisionLabelAm})`}
                </h3>
                <p className="text-xs text-slate-500">
                  የእሁድ ጉባኤ ዝርዝር ሰዓታት፣ አቅራቢዎችና የቅድመ-ዝግጅት ፍላጎቶች
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSheetModal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ወር *
                  </label>
                  <select
                    value={sheetForm.monthAmharic}
                    onChange={(e) => setSheetForm({ ...sheetForm, monthAmharic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {ETHIOPIAN_MONTH_NAMES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ቀን (ቁጥር) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={sheetForm.dayNumber}
                    onChange={(e) => setSheetForm({ ...sheetForm, dayNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ሙሉ ቀን (አማርኛ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sheetForm.dateAmharic}
                    onChange={(e) => setSheetForm({ ...sheetForm, dateAmharic: e.target.value })}
                    placeholder="ምሳሌ፡ የካቲት 7 2019 ዓ.ም."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የዕለቱ ዋና ርዕስ *
                  </label>
                  <input
                    type="text"
                    required
                    value={sheetForm.mainTopic}
                    onChange={(e) => setSheetForm({ ...sheetForm, mainTopic: e.target.value })}
                    placeholder="የመርሐ ግብሩ ርዕስ..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ሰዓት *
                  </label>
                  <input
                    type="text"
                    required
                    value={sheetForm.timeAmharic}
                    onChange={(e) => setSheetForm({ ...sheetForm, timeAmharic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ተረኛ መሪ / ምድብ
                  </label>
                  <input
                    type="text"
                    value={sheetForm.leader}
                    onChange={(e) => setSheetForm({ ...sheetForm, leader: e.target.value })}
                    placeholder="ምሳሌ፡ ምድብ 01 (ፍቅር)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    አቅራቢ / መምህር
                  </label>
                  <input
                    type="text"
                    value={sheetForm.presenterOrTeacher}
                    onChange={(e) =>
                      setSheetForm({ ...sheetForm, presenterOrTeacher: e.target.value })
                    }
                    placeholder="የመምህር ወይም አቅራቢ ስም"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የዕለቱ መንፈሳዊ ዓላማ
                </label>
                <textarea
                  rows={2}
                  value={sheetForm.purpose}
                  onChange={(e) => setSheetForm({ ...sheetForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    የሰዓት ክፍለ-ጊዜዎች (Slots)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSheetForm({
                        ...sheetForm,
                        slots: [
                          ...sheetForm.slots,
                          {
                            id: `slot_${Date.now()}`,
                            timeRange: '15 ደቂቃ',
                            slotTitle: '',
                            inCharge: '',
                          },
                        ],
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#0C4A9E] dark:text-[#7FAFFF] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ክፍለ-ጊዜ ጨምር</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {sheetForm.slots.map((slot, idx) => (
                    <div key={slot.id} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={slot.timeRange}
                        onChange={(e) => {
                          const next = [...sheetForm.slots];
                          next[idx] = { ...slot, timeRange: e.target.value };
                          setSheetForm({ ...sheetForm, slots: next });
                        }}
                        placeholder="ሰዓት"
                        className="col-span-3 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono"
                      />
                      <input
                        type="text"
                        value={slot.slotTitle}
                        onChange={(e) => {
                          const next = [...sheetForm.slots];
                          next[idx] = { ...slot, slotTitle: e.target.value };
                          setSheetForm({ ...sheetForm, slots: next });
                        }}
                        placeholder="የክፍለ-ጊዜ ርዕስ"
                        className="col-span-5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      />
                      <input
                        type="text"
                        value={slot.inCharge || ''}
                        onChange={(e) => {
                          const next = [...sheetForm.slots];
                          next[idx] = { ...slot, inCharge: e.target.value };
                          setSheetForm({ ...sheetForm, slots: next });
                        }}
                        placeholder="ኃላፊ"
                        className="col-span-3 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSheetForm({
                            ...sheetForm,
                            slots: sheetForm.slots.filter((_, i) => i !== idx),
                          })
                        }
                        className="col-span-1 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የቅድመ-ዝግጅት ፍላጎቶች (በእያንዳንዱ መስመር አንድ አንድ)
                </label>
                <textarea
                  rows={3}
                  value={sheetForm.preProgramNeedsText}
                  onChange={(e) =>
                    setSheetForm({ ...sheetForm, preProgramNeedsText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSheetModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  disabled={sheetSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#6d0000] text-white font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{sheetSaving ? 'በማስቀመጥ ላይ...' : editingSheetId ? 'ለውጡን አስቀምጥ' : 'ሉሁን ፍጠር'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
