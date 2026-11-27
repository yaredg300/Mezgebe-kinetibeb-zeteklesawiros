import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Plus,
  Calendar,
  Target,
  Users,
  Clock,
  BookOpen,
  CheckCircle2,
  CheckCircle,
  Circle,
  Edit3,
  Trash2,
  X,
  Search,
  Sparkles,
  FileText,
  Star,
  Activity,
  Save,
  Sun,
  ArrowUp,
  ArrowDown,
  Copy,
  Printer,
  Download,
  Check,
  Wand2,
  Play,
  Minus,
  Scale,
  RotateCcw,
  GripVertical,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  BottomNavTab,
  EhudPlanScope,
  EhudPlanStatus,
  EhudProgramPlan,
  SundayDailyPlanSheet,
  SundayProgramPlanEntry,
  SundayTimetableSlot,
} from '../types';
import { AppHeader } from '../components/AppHeader';
import {
  YOUTH_ORGANIZER_SQUADS_2019,
  CHILDREN_TEACHER_SQUADS_2019,
  MAEKELAWIYAN_TEACHER_SQUADS_2019,
  YouthOrganizerSquad,
} from '../data/youthCombinedPlanData';
import {
  ETHIOPIAN_MONTHS_LIST,
  EHUD_SCOPE_META,
  SyncedEhudPlanTarget,
  getSyncedPlansForDivision,
  inferPlanScope,
} from '../utils/ehudPlanSync';
import { downloadDailyPlanPdf, printDailyPlanSheet } from '../utils/pdfExport';
import { ClockPopoverDialog, ClockTimePicker } from '../components/ClockTimePicker';
import { SlotOverlapShower } from '../components/SlotOverlapShower';
import {
  adjustSlotDuration,
  analyzeDailySlotTimes,
  autoChainDailySlots,
  getNextRecommendedSlotRange,
  rebalanceSlotsToFitWindow,
} from '../utils/timeOverlap';

type PlanningTab = EhudPlanScope | 'SQUADS';

const PLAN_STATUS_META: Record<
  EhudPlanStatus,
  { label: string; badgeClass: string }
> = {
  DRAFT: {
    label: 'ረቂቅ (Draft)',
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  READY: {
    label: 'ዝግጁ (Ready)',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  SCHEDULED: {
    label: 'የተመደበ (Scheduled)',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
};

interface PlanFormState {
  planScope: EhudPlanScope;
  title: string;
  monthAmharic: string;
  targetDateAmharic: string;
  squadName: string;
  presenterName: string;
  presenterContact: string;
  scriptureRef: string;
  goal: string;
  resourcesText: string;
  status: EhudPlanStatus;
}

interface DailySheetFormState {
  monthAmharic: string;
  dayNumber: number;
  dateAmharic: string;
  mainTopic: string;
  leader: string;
  presenterOrTeacher: string;
  presenterContact: string;
  timeAmharic: string;
  purpose: string;
  squadName: string;
  slots: SundayTimetableSlot[];
  preProgramNeedsText: string;
}

const DEFAULT_DAILY_SLOTS = (presenter = '', presenterContact = ''): SundayTimetableSlot[] => [
  { id: 'slot_1', timeRange: '15 ደቂቃ', slotTitle: 'የመክፈቻ ጸሎትና ስንክሳር', inCharge: 'ተረኛ ምድብ' },
  {
    id: 'slot_2',
    timeRange: '30 ደቂቃ',
    slotTitle: 'ቃለ እግዚአብሔር (ትምህርት)',
    inCharge: presenter || 'መምህር',
    inChargeContact: presenterContact || undefined,
  },
  { id: 'slot_3', timeRange: '25 ደቂቃ', slotTitle: 'መዝሙርና መንፈሳዊ ኪነጥበብ', inCharge: 'መዘምራን / አዘጋጅ' },
  { id: 'slot_4', timeRange: '15 ደቂቃ', slotTitle: 'ውይይት፣ ማስታወቂያና የመዝጊያ ጸሎት', inCharge: 'አስተባባሪ' },
];

const DAILY_SLOT_TEMPLATES: {
  id: string;
  label: string;
  slots: (presenter?: string, presenterContact?: string) => SundayTimetableSlot[];
}[] = [
  {
    id: 'standard',
    label: 'መደበኛ የእሁድ ጉባኤ',
    slots: DEFAULT_DAILY_SLOTS,
  },
  {
    id: 'hymn_study',
    label: 'የመዝሙርና መጽሐፍ ቅዱስ ጥናት',
    slots: (presenter = '', presenterContact = '') => [
      { id: 'slot_1', timeRange: '15 ደቂቃ', slotTitle: 'የመክፈቻ ጸሎትና ምስጋና', inCharge: 'ተረኛ ምድብ' },
      { id: 'slot_2', timeRange: '35 ደቂቃ', slotTitle: 'የመዝሙር ዝማሬና ልምምድ', inCharge: 'መዘምራን' },
      {
        id: 'slot_3',
        timeRange: '40 ደቂቃ',
        slotTitle: 'የቡድን መጽሐፍ ቅዱስ ጥናት',
        inCharge: presenter || 'መምህር',
        inChargeContact: presenterContact || undefined,
      },
      { id: 'slot_4', timeRange: '15 ደቂቃ', slotTitle: 'ማጠቃለያና ጸሎት', inCharge: 'አስተባባሪ' },
    ],
  },
  {
    id: 'special_feast',
    label: 'ልዩ ጉባኤ / በዓል',
    slots: (presenter = '', presenterContact = '') => [
      { id: 'slot_1', timeRange: '20 ደቂቃ', slotTitle: 'የበዓል መክፈቻ ጸሎትና ወረብ', inCharge: 'መዘምራን' },
      {
        id: 'slot_2',
        timeRange: '45 ደቂቃ',
        slotTitle: 'ልዩ የበዓል ስብከተ ወንጌል',
        inCharge: presenter || 'መምህር',
        inChargeContact: presenterContact || undefined,
      },
      { id: 'slot_3', timeRange: '30 ደቂቃ', slotTitle: 'መንፈሳዊ ኪነጥበብና ግጥም', inCharge: 'ኪነ-ጥበብ ክፍል' },
      { id: 'slot_4', timeRange: '25 ደቂቃ', slotTitle: 'ሽልማት፣ ማስታወቂያና መዝጊያ ጸሎት', inCharge: 'አስተባባሪ' },
    ],
  },
];

const computeSlotsTotalMinutes = (slots: SundayTimetableSlot[]): number | null => {
  let total = 0;
  let parsedAny = false;
  for (const s of slots) {
    const raw = (s.timeRange || '').trim();
    const minMatch = raw.match(/(\d+)\s*(?:ደቂቃ|min)/i);
    if (minMatch) {
      total += Number(minMatch[1]);
      parsedAny = true;
      continue;
    }
    const rangeMatch = raw.match(/(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]) * 60 + Number(rangeMatch[2]);
      const end = Number(rangeMatch[3]) * 60 + Number(rangeMatch[4]);
      const diff = end >= start ? end - start : end + 12 * 60 - start;
      if (diff > 0 && diff <= 360) {
        total += diff;
        parsedAny = true;
      }
    }
  }
  return parsedAny && total > 0 ? total : null;
};

const formatTelHref = (contact?: string): string | null => {
  if (!contact) return null;
  const cleaned = contact.replace(/[^\d+]/g, '');
  return cleaned.length >= 7 ? `tel:${cleaned}` : null;
};

const QUICK_CHECKLIST_PRESETS = [
  'ማይክሮፎንና ድምፅ ማጉያ',
  'የመዝሙር ወረቀት',
  'የመገኘት መዝገብ',
  'መምህር/አቅራቢ ማረጋገጥ',
  'የአዳራሽ መቀመጫ ዝግጅት',
];

const QUICK_SLOT_PRESETS: Array<{ title: string; mins: number; inCharge: string }> = [
  { title: 'የመክፈቻ ጸሎትና ስንክሳር', mins: 15, inCharge: 'ተረኛ ምድብ' },
  { title: 'ቃለ እግዚአብሔር (ትምህርት)', mins: 35, inCharge: 'መምህር' },
  { title: 'መዝሙርና መንፈሳዊ ኪነጥበብ', mins: 25, inCharge: 'መዘምራን' },
  { title: 'ውይይትና የመዝጊያ ጸሎት', mins: 15, inCharge: 'አስተባባሪ' },
];

export interface EhudPlanningScreenProps {
  focusedSheetId?: string | null;
  onFocusSheetChange?: (sheetId: string | null) => void;
  onNavigateToTab?: (tab: BottomNavTab) => void;
}

export const EhudPlanningScreen: React.FC<EhudPlanningScreenProps> = ({
  focusedSheetId,
  onFocusSheetChange,
  onNavigateToTab,
}) => {
  const {
    selectedDivision,
    selectDivision,
    ehudPlans,
    ehudFollowUps,
    ehudRatings,
    createEhudPlan,
    updateEhudPlan,
    deleteEhudPlan,
    dailyPlanSheets,
    createDailyPlanSheet,
    updateDailyPlanSheet,
    deleteDailyPlanSheet,
    toggleDailyPreProgramItem,
    childrenAnnualPlan,
    maekelawiyanAnnualPlan,
    youthAnnualPlan,
    currentUser,
    isSuperAdmin,
    isDeptAdmin,
    canApproveDeptMembers,
    activeMembership,
    firebaseUser,
  } = useArchive();

  const [activeTab, setActiveTab] = useState<PlanningTab>('DAILY');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);
  const [localFocusedDailyId, setLocalFocusedDailyId] = useState<string | null>(
    focusedSheetId || null
  );

  const focusedDailyId = focusedSheetId !== undefined ? focusedSheetId : localFocusedDailyId;
  const setFocusedDailyId = (id: string | null) => {
    setLocalFocusedDailyId(id);
    onFocusSheetChange?.(id);
  };

  // Inline modernization states for Coming Soon Daily Slots, Briefing & Checklist
  const [showQuickAddSlot, setShowQuickAddSlot] = useState<boolean>(false);
  const [quickSlotTime, setQuickSlotTime] = useState<string>('20 ደቂቃ');
  const [quickSlotTitle, setQuickSlotTitle] = useState<string>('');
  const [quickSlotInCharge, setQuickSlotInCharge] = useState<string>('');
  const [quickSlotInChargeContact, setQuickSlotInChargeContact] = useState<string>('');
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editSlotTime, setEditSlotTime] = useState<string>('');
  const [editSlotTitle, setEditSlotTitle] = useState<string>('');
  const [editSlotInCharge, setEditSlotInCharge] = useState<string>('');
  const [editSlotInChargeContact, setEditSlotInChargeContact] = useState<string>('');
  const [newChecklistNeed, setNewChecklistNeed] = useState<string>('');
  const [isEditingBriefing, setIsEditingBriefing] = useState<boolean>(false);
  const [briefingDraft, setBriefingDraft] = useState<{
    mainTopic: string;
    squadName: string;
    presenterOrTeacher: string;
    presenterContact: string;
    purpose: string;
  }>({ mainTopic: '', squadName: '', presenterOrTeacher: '', presenterContact: '', purpose: '' });
  const [showTemplatesBar, setShowTemplatesBar] = useState<boolean>(false);
  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [autoChainOnReorder, setAutoChainOnReorder] = useState<boolean>(true);
  const [inlineCellEdit, setInlineCellEdit] = useState<{
    slotId: string;
    field: 'title' | 'inCharge' | 'inChargeContact';
    value: string;
  } | null>(null);
  const [activeClockSlot, setActiveClockSlot] = useState<{
    sheet: SundayDailyPlanSheet;
    slot: SundayTimetableSlot;
  } | null>(null);
  const [activeClockProgramSheet, setActiveClockProgramSheet] = useState<SundayDailyPlanSheet | null>(null);

  // Weekly / Yearly Plan Modal
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState<boolean>(false);
  const [planForm, setPlanForm] = useState<PlanFormState>({
    planScope: 'WEEKLY',
    title: '',
    monthAmharic: 'ኅዳር',
    targetDateAmharic: '',
    squadName: '',
    presenterName: '',
    presenterContact: '',
    scriptureRef: '',
    goal: '',
    resourcesText: 'ማይክሮፎንና ድምፅ ማጉያ\nየመጽሐፍ ቅዱስ ጥቅስ ወረቀት\nየመገኘት መዝገብ',
    status: 'READY',
  });

  // Daily Plan Sheet Builder Modal (syncs directly with ዋና ገጽ, Following & Rate Program)
  const [showDailyModal, setShowDailyModal] = useState<boolean>(false);
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [savingDaily, setSavingDaily] = useState<boolean>(false);
  const [dailyForm, setDailyForm] = useState<DailySheetFormState>({
    monthAmharic: 'ኅዳር',
    dayNumber: 6,
    dateAmharic: 'ኅዳር 6 2019 ዓ.ም.',
    mainTopic: '',
    leader: '',
    presenterOrTeacher: '',
    presenterContact: '',
    timeAmharic: '7:30–9:30',
    purpose: '',
    squadName: '',
    slots: DEFAULT_DAILY_SLOTS(),
    preProgramNeedsText: 'ማይክሮፎንና ድምፅ ማጉያ\nየመዝሙር ወረቀት\nየመገኘት መዝገብ\nመምህር/አቅራቢ ማረጋገጥ',
  });

  const canManagePlans =
    isSuperAdmin ||
    isDeptAdmin ||
    canApproveDeptMembers ||
    (activeMembership?.departmentId === 'ehud_merha_gibir' &&
      activeMembership?.status === 'APPROVED') ||
    !firebaseUser;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  };

  const divisionLabel =
    selectedDivision === 'children'
      ? 'ሕፃናት'
      : selectedDivision === 'intermediates'
      ? 'ማዕከላውያን'
      : 'ወጣቶች';

  const defaultDivisionTime =
    selectedDivision === 'children'
      ? '6:00–8:00'
      : selectedDivision === 'intermediates'
      ? '4:00–6:00'
      : '7:30–9:30';

  const currentAnnualPlan: SundayProgramPlanEntry[] = useMemo(() => {
    if (selectedDivision === 'children') return childrenAnnualPlan;
    if (selectedDivision === 'intermediates') return maekelawiyanAnnualPlan;
    return youthAnnualPlan;
  }, [selectedDivision, childrenAnnualPlan, maekelawiyanAnnualPlan, youthAnnualPlan]);

  const currentSquads: YouthOrganizerSquad[] = useMemo(() => {
    if (selectedDivision === 'children') return CHILDREN_TEACHER_SQUADS_2019;
    if (selectedDivision === 'intermediates') return MAEKELAWIYAN_TEACHER_SQUADS_2019;
    return YOUTH_ORGANIZER_SQUADS_2019;
  }, [selectedDivision]);

  const dailyTargets = useMemo(
    () =>
      getSyncedPlansForDivision({
        division: selectedDivision,
        scope: 'DAILY',
        dailyPlanSheets,
        annualPlan: currentAnnualPlan,
        ehudPlans,
      }),
    [selectedDivision, dailyPlanSheets, currentAnnualPlan, ehudPlans]
  );

  const weeklyTargets = useMemo(
    () =>
      getSyncedPlansForDivision({
        division: selectedDivision,
        scope: 'WEEKLY',
        dailyPlanSheets,
        annualPlan: currentAnnualPlan,
        ehudPlans,
      }),
    [selectedDivision, dailyPlanSheets, currentAnnualPlan, ehudPlans]
  );

  const yearlyTargets = useMemo(
    () =>
      getSyncedPlansForDivision({
        division: selectedDivision,
        scope: 'YEARLY',
        dailyPlanSheets,
        annualPlan: currentAnnualPlan,
        ehudPlans,
      }),
    [selectedDivision, dailyPlanSheets, currentAnnualPlan, ehudPlans]
  );

  const activeTargets: SyncedEhudPlanTarget[] = useMemo(() => {
    const base =
      activeTab === 'DAILY'
        ? dailyTargets
        : activeTab === 'WEEKLY'
        ? weeklyTargets
        : activeTab === 'YEARLY'
        ? yearlyTargets
        : [];
    const q = searchQuery.trim().toLowerCase();
    return base.filter((item) => {
      if (activeTab === 'WEEKLY' && selectedMonthFilter !== 'ALL') {
        if (!item.monthAmharic.includes(selectedMonthFilter)) return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.dateAmharic.toLowerCase().includes(q) ||
        (item.goal || '').toLowerCase().includes(q) ||
        (item.squadOrResponsible || '').toLowerCase().includes(q) ||
        (item.presenterOrLeader || '').toLowerCase().includes(q) ||
        (item.presenterContact || '').toLowerCase().includes(q)
      );
    });
  }, [activeTab, dailyTargets, weeklyTargets, yearlyTargets, selectedMonthFilter, searchQuery]);

  // Quick sync helpers for Follow-ups & Ratings per plan ID
  const getFollowUpSummary = (targetId: string, scope: EhudPlanScope) => {
    const matches = ehudFollowUps.filter(
      (f) =>
        f.division === selectedDivision &&
        f.programSheetId === targetId &&
        inferPlanScope(f, ehudPlans) === scope
    );
    if (matches.length === 0) return null;
    const latest = matches[0];
    return { count: matches.length, latest };
  };

  const getRatingSummary = (targetId: string, scope: EhudPlanScope) => {
    const matches = ehudRatings.filter(
      (r) =>
        r.division === selectedDivision &&
        r.programSheetId === targetId &&
        inferPlanScope(r, ehudPlans) === scope
    );
    if (matches.length === 0) return null;
    const avg =
      Math.round(
        (matches.reduce((sum, r) => sum + r.overallRating, 0) / matches.length) * 10
      ) / 10;
    return { count: matches.length, avg };
  };

  // Open Daily Plan Sheet modal (either new, from existing sheet, or generated from a Weekly plan!)
  const openCreateDailyModal = (prefill?: SyncedEhudPlanTarget) => {
    if (prefill?.linkedDailySheet) {
      openEditDailySheetModal(prefill.linkedDailySheet);
      return;
    }
    const month = prefill?.monthAmharic || (selectedMonthFilter !== 'ALL' ? selectedMonthFilter : 'ኅዳር');
    const dayNum = prefill?.annualEntry?.dayNumber || 13;
    const dateFull = prefill?.dateAmharic || `${month} ${dayNum} 2019 ዓ.ም.`;
    const presenter = prefill?.presenterOrLeader || '';
    const presenterContact = prefill?.presenterContact || '';
    const squad = prefill?.squadOrResponsible || currentSquads[0]?.nameAmharic || '';

    setEditingSheetId(null);
    setDailyForm({
      monthAmharic: month,
      dayNumber: dayNum,
      dateAmharic: dateFull,
      mainTopic: prefill?.title || '',
      leader: squad,
      presenterOrTeacher: presenter,
      presenterContact,
      timeAmharic: prefill?.timeAmharic && prefill.timeAmharic !== '—' ? prefill.timeAmharic : defaultDivisionTime,
      purpose: prefill?.goal || '',
      squadName: squad,
      slots: DEFAULT_DAILY_SLOTS(presenter, presenterContact),
      preProgramNeedsText: 'ማይክሮፎንና ድምፅ ማጉያ\nየመዝሙር ወረቀት\nየመገኘት መዝገብ\nመምህር/አቅራቢ ማረጋገጥ',
    });
    setShowDailyModal(true);
  };

  const openEditDailySheetModal = (sheet: SundayDailyPlanSheet) => {
    setEditingSheetId(sheet.id);
    setDailyForm({
      monthAmharic: sheet.monthAmharic,
      dayNumber: sheet.dayNumber,
      dateAmharic: sheet.dateAmharic,
      mainTopic: sheet.mainTopic,
      leader: sheet.leader,
      presenterOrTeacher: sheet.presenterOrTeacher,
      presenterContact: sheet.presenterContact || '',
      timeAmharic: sheet.timeAmharic,
      purpose: sheet.purpose,
      squadName: sheet.squadName || sheet.leader,
      slots: sheet.slots.length > 0 ? sheet.slots : DEFAULT_DAILY_SLOTS(sheet.presenterOrTeacher),
      preProgramNeedsText: sheet.preProgramNeeds.join('\n'),
    });
    setShowDailyModal(true);
  };

  const handleSaveDailySheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyForm.mainTopic.trim() || !dailyForm.dateAmharic.trim()) return;
    setSavingDaily(true);

    const preProgramNeeds = dailyForm.preProgramNeedsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanSlots = dailyForm.slots
      .filter((s) => s.slotTitle.trim() || s.timeRange.trim())
      .map((s, idx) => ({
        id: s.id || `slot_${idx + 1}`,
        timeRange: s.timeRange.trim() || '15 ደቂቃ',
        slotTitle: s.slotTitle.trim() || 'ክፍለ-ጊዜ',
        inCharge: s.inCharge?.trim() || undefined,
        inChargeContact: s.inChargeContact?.trim() || undefined,
      }));

    try {
      if (editingSheetId) {
        await updateDailyPlanSheet(editingSheetId, {
          division: selectedDivision,
          monthAmharic: dailyForm.monthAmharic,
          dayNumber: Number(dailyForm.dayNumber) || 1,
          dateAmharic: dailyForm.dateAmharic.trim(),
          mainTopic: dailyForm.mainTopic.trim(),
          leader: dailyForm.leader.trim() || dailyForm.squadName.trim() || 'አስተባባሪ',
          presenterOrTeacher: dailyForm.presenterOrTeacher.trim() || 'መምህር',
          presenterContact: dailyForm.presenterContact.trim(),
          timeAmharic: dailyForm.timeAmharic.trim() || defaultDivisionTime,
          purpose: dailyForm.purpose.trim() || 'መደበኛ የእሁድ መንፈሳዊ ጉባኤ',
          squadName: dailyForm.squadName.trim() || undefined,
          slots: cleanSlots,
          preProgramNeeds: preProgramNeeds.length > 0 ? preProgramNeeds : ['የድምፅ ዝግጅት'],
        });
        showToast('የዕለት ዕቅዱ ተሻሽሏል — በዋና ገጽ፣ በክትትልና በደረጃ መስጫ ላይ ተዘምኗል!');
      } else {
        const newId = `daily_${selectedDivision}_${Date.now()}`;
        const newSheet: SundayDailyPlanSheet = {
          id: newId,
          division: selectedDivision,
          monthAmharic: dailyForm.monthAmharic,
          dayNumber: Number(dailyForm.dayNumber) || 1,
          dateAmharic: dailyForm.dateAmharic.trim(),
          mainTopic: dailyForm.mainTopic.trim(),
          leader: dailyForm.leader.trim() || dailyForm.squadName.trim() || 'አስተባባሪ',
          presenterOrTeacher: dailyForm.presenterOrTeacher.trim() || 'መምህር',
          presenterContact: dailyForm.presenterContact.trim() || undefined,
          timeAmharic: dailyForm.timeAmharic.trim() || defaultDivisionTime,
          purpose: dailyForm.purpose.trim() || 'መደበኛ የእሁድ መንፈሳዊ ጉባኤ',
          squadName: dailyForm.squadName.trim() || undefined,
          slots: cleanSlots,
          preProgramNeeds: preProgramNeeds.length > 0 ? preProgramNeeds : ['የድምፅ ዝግጅት'],
          preProgramChecklistState: {},
        };
        await createDailyPlanSheet(newSheet);
        showToast('አዲስ የዕለት ዕቅድ ተፈጥሯል — ከዋና ገጽ፣ ከክትትልና ከደረጃ መስጫ ጋር ተሳስሯል!');
        setActiveTab('DAILY');
      }
      setShowDailyModal(false);
    } catch {
      setShowDailyModal(false);
      showToast('የዕለት ዕቅዱ በአካባቢ ተቀምጦ ተመሳስሏል።');
    } finally {
      setSavingDaily(false);
    }
  };

  const handleDeleteDailySheet = async (sheet: SundayDailyPlanSheet) => {
    try {
      await deleteDailyPlanSheet(sheet.id);
      showToast(`የዕለት ዕቅድ «${sheet.mainTopic}» ተሰርዟል።`);
    } catch {
      showToast('የዕለት ዕቅድ በአካባቢ ተሰርዟል።');
    }
  };

  // Inline slot CRUD & reordering for Coming Soon Daily Planning
  const handleQuickAddSlot = async (sheet: SundayDailyPlanSheet, e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSlotTitle.trim()) return;
    const newSlot: SundayTimetableSlot = {
      id: `slot_${Date.now()}`,
      timeRange: quickSlotTime.trim() || '15 ደቂቃ',
      slotTitle: quickSlotTitle.trim(),
      inCharge: quickSlotInCharge.trim() || undefined,
      inChargeContact: quickSlotInChargeContact.trim() || undefined,
    };
    const nextSlots = [...sheet.slots, newSlot];
    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
      showToast('አዲስ የሰዓት ክፍለ-ጊዜ ተጨምሯል።');
    } catch {
      showToast('ክፍለ-ጊዜው በአካባቢ ተቀምጧል።');
    }
    setQuickSlotTitle('');
    setQuickSlotInCharge('');
    setQuickSlotInChargeContact('');
    setShowQuickAddSlot(false);
  };

  const handleStartInlineSlotEdit = (slot: SundayTimetableSlot) => {
    setEditingSlotId(slot.id);
    setEditSlotTime(slot.timeRange);
    setEditSlotTitle(slot.slotTitle);
    setEditSlotInCharge(slot.inCharge || '');
    setEditSlotInChargeContact(slot.inChargeContact || '');
  };

  const handleSaveInlineSlotEdit = async (sheet: SundayDailyPlanSheet) => {
    if (!editingSlotId || !editSlotTitle.trim()) return;
    const nextSlots = sheet.slots.map((s) =>
      s.id === editingSlotId
        ? {
            ...s,
            timeRange: editSlotTime.trim() || s.timeRange,
            slotTitle: editSlotTitle.trim(),
            inCharge: editSlotInCharge.trim() || undefined,
            inChargeContact: editSlotInChargeContact.trim() || undefined,
          }
        : s
    );
    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
      showToast('ክፍለ-ጊዜው ተዘምኗል።');
    } catch {
      showToast('ለውጡ በአካባቢ ተቀምጧል።');
    }
    setEditingSlotId(null);
  };

  const handleMoveSlot = async (
    sheet: SundayDailyPlanSheet,
    index: number,
    direction: -1 | 1
  ) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sheet.slots.length) return;
    const nextSlots = [...sheet.slots];
    const [moved] = nextSlots.splice(index, 1);
    nextSlots.splice(targetIdx, 0, moved);
    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
    } catch {
      showToast('ቅደም ተከተሉ በአካባቢ ተቀምጧል።');
    }
  };

  const handleDeleteInlineSlot = async (sheet: SundayDailyPlanSheet, slotId: string) => {
    const nextSlots = sheet.slots.filter((s) => s.id !== slotId);
    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
      showToast('ክፍለ-ጊዜው ተወግዷል።');
    } catch {
      showToast('ለውጡ በአካባቢ ተቀምጧል።');
    }
  };

  const handleDuplicateToNextSunday = (sheet: SundayDailyPlanSheet) => {
    const monthIdx = ETHIOPIAN_MONTHS_LIST.indexOf(sheet.monthAmharic);
    let nextDay = (sheet.dayNumber || 1) + 7;
    let nextMonth = sheet.monthAmharic;
    if (nextDay > 30) {
      nextDay -= 30;
      if (monthIdx >= 0 && monthIdx < ETHIOPIAN_MONTHS_LIST.length - 1) {
        nextMonth = ETHIOPIAN_MONTHS_LIST[monthIdx + 1];
      }
    }
    setEditingSheetId(null);
    setDailyForm({
      monthAmharic: nextMonth,
      dayNumber: nextDay,
      dateAmharic: `${nextMonth} ${nextDay} 2019 ዓ.ም.`,
      mainTopic: `${sheet.mainTopic} (ቀጣይ እሁድ)`,
      leader: sheet.leader,
      presenterOrTeacher: sheet.presenterOrTeacher,
      presenterContact: sheet.presenterContact || '',
      timeAmharic: sheet.timeAmharic,
      purpose: sheet.purpose,
      squadName: sheet.squadName || sheet.leader,
      slots: sheet.slots.map((s, idx) => ({ ...s, id: `slot_${Date.now()}_${idx}` })),
      preProgramNeedsText: sheet.preProgramNeeds.join('\n'),
    });
    setShowDailyModal(true);
  };

  const handleQuickAddChecklistItem = async (
    sheet: SundayDailyPlanSheet,
    e: React.FormEvent
  ) => {
    e.preventDefault();
    const cleaned = newChecklistNeed.trim();
    if (!cleaned) return;
    if (sheet.preProgramNeeds.includes(cleaned)) {
      setNewChecklistNeed('');
      return;
    }
    const nextNeeds = [...sheet.preProgramNeeds, cleaned];
    try {
      await updateDailyPlanSheet(sheet.id, { preProgramNeeds: nextNeeds });
    } catch {
      showToast('ዝግጅቱ በአካባቢ ተጨምሯል።');
    }
    setNewChecklistNeed('');
  };

  const handleToggleChecklistPreset = async (
    sheet: SundayDailyPlanSheet,
    preset: string
  ) => {
    if (sheet.preProgramNeeds.includes(preset)) {
      const nextNeeds = sheet.preProgramNeeds.filter((n) => n !== preset);
      try {
        await updateDailyPlanSheet(sheet.id, { preProgramNeeds: nextNeeds });
      } catch {
        // local updated
      }
      return;
    }
    try {
      await updateDailyPlanSheet(sheet.id, {
        preProgramNeeds: [...sheet.preProgramNeeds, preset],
      });
    } catch {
      // local updated
    }
  };

  const handleAutoChainSlots = async (sheet: SundayDailyPlanSheet) => {
    const nextSlots = autoChainDailySlots(sheet.slots, sheet.timeAmharic);
    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
      showToast('ሁሉም ክፍለ-ጊዜዎች ያለ ግጭት በቅደም ተከተል ተሰልፈዋል።');
    } catch {
      showToast('ለውጡ በአካባቢ ተቀምጧል።');
    }
  };

  const handleRebalanceWindowSlots = async (sheet: SundayDailyPlanSheet) => {
    const nextSlots = rebalanceSlotsToFitWindow(sheet.slots, sheet.timeAmharic);
    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
      showToast(`ክፍለ-ጊዜዎች ከ${sheet.timeAmharic} ሙሉ ጊዜ ጋር ተመጣጥነዋል።`);
    } catch {
      showToast('ለውጡ በአካባቢ ተቀምጧል።');
    }
  };

  const handleAdjustSlotDuration = async (
    sheet: SundayDailyPlanSheet,
    slotId: string,
    deltaMin: number
  ) => {
    const nextSlots = adjustSlotDuration(sheet.slots, slotId, deltaMin, sheet.timeAmharic, true);
    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
    } catch {
      showToast('ሰዓቱ በአካባቢ ተቀምጧል።');
    }
  };

  const handleApplyTemplateToSheet = async (
    sheet: SundayDailyPlanSheet,
    templateId: string
  ) => {
    const tpl = DAILY_SLOT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const rawSlots = tpl.slots(sheet.presenterOrTeacher, sheet.presenterContact).map((s, idx) => ({
      ...s,
      id: `slot_${Date.now()}_${idx}`,
    }));
    const chained = autoChainDailySlots(rawSlots, sheet.timeAmharic);
    try {
      await updateDailyPlanSheet(sheet.id, { slots: chained });
      showToast(`የ«${tpl.label}» አብነት ተጭኗል።`);
      setShowTemplatesBar(false);
    } catch {
      showToast('አብነቱ በአካባቢ ተጭኗል።');
    }
  };

  const handleOpenInlineBriefing = (sheet: SundayDailyPlanSheet) => {
    setBriefingDraft({
      mainTopic: sheet.mainTopic,
      squadName: sheet.squadName || sheet.leader,
      presenterOrTeacher: sheet.presenterOrTeacher,
      presenterContact: sheet.presenterContact || '',
      purpose: sheet.purpose,
    });
    setIsEditingBriefing(true);
  };

  const handleSaveInlineBriefing = async (sheet: SundayDailyPlanSheet, e: React.FormEvent) => {
    e.preventDefault();
    if (!briefingDraft.mainTopic.trim()) return;
    try {
      await updateDailyPlanSheet(sheet.id, {
        mainTopic: briefingDraft.mainTopic.trim(),
        squadName: briefingDraft.squadName.trim() || undefined,
        leader: briefingDraft.squadName.trim() || sheet.leader,
        presenterOrTeacher: briefingDraft.presenterOrTeacher.trim() || sheet.presenterOrTeacher,
        presenterContact: briefingDraft.presenterContact.trim(),
        purpose: briefingDraft.purpose.trim() || sheet.purpose,
      });
      showToast('የዕለቱ ዋና መረጃ ተዘምኗል።');
    } catch {
      showToast('ለውጡ በአካባቢ ተቀምጧል።');
    }
    setIsEditingBriefing(false);
  };

  const handleOpenQuickAddSlot = (sheet: SundayDailyPlanSheet, defaultMinutes = 20) => {
    setShowQuickAddSlot(true);
    setEditingSlotId(null);
    setInlineCellEdit(null);
    setQuickSlotTime(getNextRecommendedSlotRange(sheet.slots, defaultMinutes, sheet.timeAmharic));
  };

  const handleDropReorderSlot = async (
    sheet: SundayDailyPlanSheet,
    sourceSlotId: string,
    targetSlotId: string
  ) => {
    setDraggedSlotId(null);
    setDragOverSlotId(null);
    if (!sourceSlotId || !targetSlotId || sourceSlotId === targetSlotId) return;
    const fromIdx = sheet.slots.findIndex((s) => s.id === sourceSlotId);
    const toIdx = sheet.slots.findIndex((s) => s.id === targetSlotId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...sheet.slots];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const hasIntervals = reordered.some((s) => /\d{1,2}:\d{2}/.test(s.timeRange || ''));
    const nextSlots =
      autoChainOnReorder && hasIntervals
        ? autoChainDailySlots(reordered, sheet.timeAmharic)
        : reordered;

    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
      showToast(
        autoChainOnReorder && hasIntervals
          ? 'ቅደም ተከተሉ ተቀይሮ ሰዓቶች በራሳቸው ተሰልፈዋል።'
          : 'የክፍለ-ጊዜ ቅደም ተከተል ተዘምኗል።'
      );
    } catch {
      showToast('ቅደም ተከተሉ በአካባቢ ተቀምጧል።');
    }
  };

  const handleCommitInlineCell = async (sheet: SundayDailyPlanSheet) => {
    if (!inlineCellEdit) return;
    const { slotId, field, value } = inlineCellEdit;
    const trimmed = value.trim();
    setInlineCellEdit(null);

    const target = sheet.slots.find((s) => s.id === slotId);
    if (!target) return;
    if (field === 'title' && (!trimmed || trimmed === target.slotTitle)) return;
    if (field === 'inCharge' && trimmed === (target.inCharge || '')) return;
    if (field === 'inChargeContact' && trimmed === (target.inChargeContact || '')) return;

    const nextSlots = sheet.slots.map((s) =>
      s.id === slotId
        ? field === 'title'
          ? { ...s, slotTitle: trimmed }
          : field === 'inCharge'
          ? { ...s, inCharge: trimmed || undefined }
          : { ...s, inChargeContact: trimmed || undefined }
        : s
    );

    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
    } catch {
      showToast('ለውጡ በአካባቢ ተቀምጧል።');
    }
  };

  const handleInstantPresetAddSlot = async (
    sheet: SundayDailyPlanSheet,
    preset: { title: string; mins: number; inCharge: string }
  ) => {
    const recommended = getNextRecommendedSlotRange(sheet.slots, preset.mins, sheet.timeAmharic);
    const newSlot: SundayTimetableSlot = {
      id: `slot_${Date.now()}`,
      timeRange: recommended,
      slotTitle: preset.title,
      inCharge: preset.inCharge,
    };
    const nextSlots = [...sheet.slots, newSlot];
    try {
      await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
      showToast(`«${preset.title}» (${recommended}) ተጨምሯል።`);
    } catch {
      showToast('ክፍለ-ጊዜው በአካባቢ ተጨምሯል።');
    }
  };

  // Open Weekly/Yearly Custom Plan Modal
  const openCreatePlanModal = (scope: EhudPlanScope, prefill?: SyncedEhudPlanTarget) => {
    setEditingPlanId(null);
    const defaultMonth =
      prefill?.monthAmharic ||
      (scope === 'YEARLY' ? '2019 ዓ.ም.' : selectedMonthFilter !== 'ALL' ? selectedMonthFilter : 'ኅዳር');
    setPlanForm({
      planScope: scope,
      title: prefill?.title || '',
      monthAmharic: defaultMonth,
      targetDateAmharic:
        prefill?.dateAmharic ||
        (scope === 'YEARLY'
          ? 'መስከረም – ነሐሴ 2019 ዓ.ም.'
          : `${selectedMonthFilter !== 'ALL' ? selectedMonthFilter : 'ኅዳር'} 13 2019 ዓ.ም.`),
      squadName: prefill?.squadOrResponsible || currentSquads[0]?.nameAmharic || '',
      presenterName: prefill?.presenterOrLeader || '',
      presenterContact: prefill?.presenterContact || '',
      scriptureRef: prefill?.scriptureRef || '',
      goal: prefill?.goal || '',
      resourcesText: 'ማይክሮፎንና ድምፅ ማጉያ\nየመጽሐፍ ቅዱስ ጥቅስ ወረቀት\nየመገኘት መዝገብ',
      status: 'READY',
    });
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan: EhudProgramPlan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      planScope: plan.planScope || 'WEEKLY',
      title: plan.title,
      monthAmharic: plan.monthAmharic,
      targetDateAmharic: plan.targetDateAmharic,
      squadName: plan.squadName || '',
      presenterName: plan.presenterName || '',
      presenterContact: plan.presenterContact || '',
      scriptureRef: plan.scriptureRef || '',
      goal: plan.goal,
      resourcesText: plan.resourcesNeeded.join('\n'),
      status: plan.status,
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.title.trim() || !planForm.targetDateAmharic.trim()) return;
    setSavingPlan(true);
    const resources = planForm.resourcesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingPlanId) {
        await updateEhudPlan(editingPlanId, {
          division: selectedDivision,
          planScope: planForm.planScope,
          title: planForm.title.trim(),
          monthAmharic: planForm.monthAmharic.trim() || 'ኅዳር',
          targetDateAmharic: planForm.targetDateAmharic.trim(),
          squadName: planForm.squadName,
          presenterName: planForm.presenterName,
          presenterContact: planForm.presenterContact,
          scriptureRef: planForm.scriptureRef,
          goal: planForm.goal.trim(),
          resourcesNeeded: resources,
          status: planForm.status,
        });
        showToast('ዕቅዱ ተሻሽሏል — በክትትልና በደረጃ መስጫ ላይ ተዘምኗል!');
      } else {
        await createEhudPlan({
          division: selectedDivision,
          planScope: planForm.planScope,
          title: planForm.title.trim(),
          monthAmharic: planForm.monthAmharic.trim() || 'ኅዳር',
          targetDateAmharic: planForm.targetDateAmharic.trim(),
          squadName: planForm.squadName,
          presenterName: planForm.presenterName,
          presenterContact: planForm.presenterContact,
          scriptureRef: planForm.scriptureRef,
          goal: planForm.goal.trim(),
          resourcesNeeded: resources,
          status: planForm.status,
        });
        showToast('አዲስ ዕቅድ ተመዝግቧል — ከክትትልና ከደረጃ መስጫ ጋር ተሳስሯል!');
      }
      setShowPlanModal(false);
    } catch {
      setShowPlanModal(false);
      showToast('ዕቅዱ በአካባቢ ተቀምጦ ተመሳስሏል።');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleCycleStatus = async (plan: EhudProgramPlan) => {
    const nextStatus: EhudPlanStatus =
      plan.status === 'DRAFT' ? 'READY' : plan.status === 'READY' ? 'SCHEDULED' : 'DRAFT';
    try {
      await updateEhudPlan(plan.id, { status: nextStatus });
      showToast(`የዕቅዱ ሁኔታ ወደ «${PLAN_STATUS_META[nextStatus].label}» ተቀይሯል።`);
    } catch {
      showToast('የሁኔታ ለውጥ በአካባቢ ተቀምጧል።');
    }
  };

  const handleDeletePlan = async (plan: EhudProgramPlan) => {
    try {
      await deleteEhudPlan(plan.id);
      showToast(`«${plan.title}» ተሰርዟል።`);
    } catch {
      showToast('ዕቅዱ በአካባቢ ተሰርዟል።');
    }
  };

  const handlePrimaryNewAction = () => {
    if (activeTab === 'DAILY') {
      openCreateDailyModal();
    } else if (activeTab === 'YEARLY') {
      openCreatePlanModal('YEARLY');
    } else {
      openCreatePlanModal('WEEKLY');
    }
  };

  return (
    <div className="min-h-screen pb-28 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      <AppHeader
        title="ዕቅድ • የእሁድ መርሐ ግብር (Planning)"
        subtitle="ዕለታዊ፣ ሳምንታዊ እና ዓመታዊ ዕቅድ — ከዋና ገጽ፣ ከክትትልና ከደረጃ መስጫ ጋር የተሳሰረ"
        showDepartmentSwitcher={false}
      />

      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-3.5 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2.5 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{toast}</p>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-4 space-y-4">
        {/* Ultra-Modern Workspace Control Header + Unboxed Metrics */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Segmented Division Switcher */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 gap-1 self-start overflow-x-auto max-w-full">
              {[
                { id: 'youth' as const, label: 'ወጣት', time: '7:30–9:30', dot: 'bg-[#8B0000]' },
                { id: 'children' as const, label: 'ሕፃናት', time: '6:00–8:00', dot: 'bg-[#D97706]' },
                { id: 'intermediates' as const, label: 'ማዕከላውያን', time: '4:00–6:00', dot: 'bg-[#0C4A9E]' },
              ].map((div) => {
                const isActive = selectedDivision === div.id;
                return (
                  <button
                    key={div.id}
                    type="button"
                    onClick={() => selectDivision(div.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-white dark:bg-[#162338] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${div.dot} ${isActive ? 'opacity-100' : 'opacity-45'}`} />
                    <span>{div.label}</span>
                    <span className="font-mono tabular-nums text-[10px] text-slate-400">
                      {div.time}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Unboxed Editorial Metrics + Single Primary CTA */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
              <div className="hidden sm:flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">ዕለታዊ</span>
                  <span className="font-mono tabular-nums font-semibold text-sm text-slate-900 dark:text-white">
                    {dailyTargets.length}
                  </span>
                </div>
                <span className="w-px h-6 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-slate-400 block">ሳምንታዊ</span>
                  <span className="font-mono tabular-nums font-semibold text-sm text-slate-900 dark:text-white">
                    {weeklyTargets.length}
                  </span>
                </div>
                <span className="w-px h-6 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-slate-400 block">ዓመታዊ</span>
                  <span className="font-mono tabular-nums font-semibold text-sm text-slate-900 dark:text-white">
                    {yearlyTargets.length}
                  </span>
                </div>
                <span className="w-px h-6 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-slate-400 block">ምድቦች</span>
                  <span className="font-mono tabular-nums font-semibold text-sm text-slate-900 dark:text-white">
                    {currentSquads.length}
                  </span>
                </div>
              </div>

              {canManagePlans && (
                <button
                  type="button"
                  onClick={
                    activeTab === 'WEEKLY' || activeTab === 'YEARLY'
                      ? handlePrimaryNewAction
                      : () => openCreateDailyModal()
                  }
                  className="px-4 py-2 rounded-xl bg-[#8B0000] hover:bg-[#6e0000] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {activeTab === 'YEARLY'
                      ? 'አዲስ ዓመታዊ ዕቅድ'
                      : activeTab === 'WEEKLY'
                      ? 'አዲስ ሳምንታዊ ዕቅድ'
                      : 'አዲስ ዕለታዊ ዕቅድ'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Hairline Primary Scope Navigation */}
          <nav
            aria-label="የዕቅድ ክፍሎች"
            className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 overflow-x-auto"
          >
            <div className="flex items-center gap-6">
              {[
                { id: 'DAILY' as PlanningTab, label: 'ዕለታዊ ዕቅድ (Daily)', count: dailyTargets.length, icon: Sun },
                { id: 'WEEKLY' as PlanningTab, label: 'ሳምንታዊ ዕቅድ (Weekly)', count: weeklyTargets.length, icon: Calendar },
                { id: 'YEARLY' as PlanningTab, label: 'ዓመታዊ ዕቅድ (Yearly)', count: yearlyTargets.length, icon: Target },
                { id: 'SQUADS' as PlanningTab, label: 'አዘጋጅ ምድቦች', count: currentSquads.length, icon: Users },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`relative pb-3 pt-1 flex items-center gap-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors border-b-2 -mb-px ${
                      isActive
                        ? 'border-[#8B0000] text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8B0000] dark:text-[#FF8A80]' : 'text-slate-400'}`} />
                    <span>{t.label}</span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-400">
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {canManagePlans && activeTab !== 'DAILY' && activeTab !== 'SQUADS' && (
              <button
                type="button"
                onClick={() => openCreateDailyModal()}
                className="hidden md:inline-flex items-center gap-1 pb-2 text-xs font-semibold text-[#8B0000] dark:text-[#FF8A80] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>አዲስ ዕለታዊ ዕቅድ</span>
              </button>
            )}
          </nav>
        </div>

        {/* Search / Month Filter for Weekly & Yearly Tabs */}
        {(activeTab === 'WEEKLY' || activeTab === 'YEARLY') && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ርዕስ፣ ቀን፣ አቅራቢ ወይም ምድብ ይፈልጉ..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100"
              />
            </div>

            {activeTab === 'WEEKLY' && (
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedMonthFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
                    selectedMonthFilter === 'ALL'
                      ? 'bg-[#0C4A9E] text-white border-[#0C4A9E]'
                      : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  ሁሉም ወራት
                </button>
                {ETHIOPIAN_MONTHS_LIST.slice(0, 6).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMonthFilter(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
                      selectedMonthFilter === m
                        ? 'bg-[#0C4A9E] text-white border-[#0C4A9E]'
                        : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: DAILY PLANS — Ultra-Modern 12-Col Studio + Context Rail */}
        {activeTab === 'DAILY' && (
          <div>
            {dailyTargets.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 p-10 text-center">
                <Sun className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  ለ{divisionLabel} ክፍል የተመዘገበ የዕለት ዕቅድ አልተገኘም
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-5">
                  «አዲስ ዕለታዊ ዕቅድ» የሚለውን በመጫን ይፍጠሩ ወይም ከሳምንታዊ ዕቅድ በቀጥታ ያመንጩ።
                </p>
                {canManagePlans && (
                  <button
                    type="button"
                    onClick={() => openCreateDailyModal()}
                    className="px-4 py-2 rounded-xl bg-[#8B0000] hover:bg-[#6e0000] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>አዲስ ዕለታዊ ዕቅድ ፍጠር</span>
                  </button>
                )}
              </div>
            ) : (
              (() => {
                const primaryDaily =
                  (focusedDailyId ? dailyTargets.find((t) => t.id === focusedDailyId) : null) ||
                  dailyTargets[0];
                const q = searchQuery.trim().toLowerCase();
                const directoryTargets = dailyTargets.filter((item) => {
                  if (!q) return true;
                  return (
                    item.title.toLowerCase().includes(q) ||
                    item.dateAmharic.toLowerCase().includes(q) ||
                    (item.squadOrResponsible || '').toLowerCase().includes(q) ||
                    (item.presenterOrLeader || '').toLowerCase().includes(q) ||
                    (item.presenterContact || '').toLowerCase().includes(q)
                  );
                });

                const pSheet = primaryDaily.dailySheet;
                const pCustom = primaryDaily.customPlan;
                const pFollow = getFollowUpSummary(primaryDaily.id, 'DAILY');
                const pRating = getRatingSummary(primaryDaily.id, 'DAILY');
                const pCheckTotal = pSheet?.preProgramNeeds.length || 0;
                const pCheckDone = pSheet
                  ? pSheet.preProgramNeeds.filter((n) => pSheet.preProgramChecklistState?.[n]).length
                  : 0;
                const pCheckPct =
                  pCheckTotal > 0 ? Math.round((pCheckDone / pCheckTotal) * 100) : 0;
                const totalMinutes = pSheet ? computeSlotsTotalMinutes(pSheet.slots) : null;
                const slotAnalysis = pSheet
                  ? analyzeDailySlotTimes(pSheet.slots, pSheet.timeAmharic)
                  : null;
                const isUpcomingSunday = primaryDaily.id === dailyTargets[0].id;
                const capacityMin = slotAnalysis?.programCapacityMin || 120;
                const coveredMin = slotAnalysis?.coveredUniqueMin || 0;
                const fillPct = Math.min(100, Math.round((coveredMin / capacityMin) * 100));
                const remainingMin = Math.max(0, capacityMin - coveredMin);

                return (
                  <div className="space-y-4">
                    {/* Mobile Compact Sunday Switcher */}
                    {dailyTargets.length > 1 && (
                      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1">
                        {dailyTargets.slice(0, 8).map((item, idx) => {
                          const active = item.id === primaryDaily.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setFocusedDailyId(item.id);
                                setEditingSlotId(null);
                                setInlineCellEdit(null);
                                setShowQuickAddSlot(false);
                                setIsEditingBriefing(false);
                              }}
                              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border cursor-pointer transition-colors ${
                                active
                                  ? 'bg-[#8B0000] text-white border-[#8B0000]'
                                  : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              {idx === 0 ? 'ቀጣይ · ' : ''}{item.dateAmharic}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 3-ZONE MODERN PRODUCTIVITY WORKSPACE */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      {/* ZONE 1 (3 COLS): STICKY SUNDAY QUEUE NAVIGATOR */}
                      <aside
                        aria-label="የእሁድ መርሐ ግብር ዝርዝር"
                        className="hidden lg:flex lg:col-span-3 lg:sticky lg:top-16 flex-col rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden"
                      >
                        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                የእሁድ መርሐ ግብሮች
                              </span>
                              <span className="font-mono tabular-nums text-[11px] text-slate-400">
                                {dailyTargets.length}
                              </span>
                            </div>
                            {canManagePlans && (
                              <button
                                type="button"
                                onClick={() => openCreateDailyModal()}
                                className="px-2.5 py-1 rounded-lg bg-[#8B0000] hover:bg-[#6e0000] text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>አዲስ</span>
                              </button>
                            )}
                          </div>

                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="ዕለት፣ ርዕስ ወይም መምህር ፈልግ..."
                              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0C4A9E]"
                            />
                          </div>
                        </div>

                        <div className="max-h-[calc(100vh-240px)] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                          {directoryTargets.length === 0 ? (
                            <p className="p-5 text-xs text-slate-400 text-center">
                              የተመሳሰለ ዕለታዊ ዕቅድ አልተገኘም
                            </p>
                          ) : (
                            directoryTargets.map((item) => {
                              const isSelected = item.id === primaryDaily.id;
                              const isComingSoonItem = item.id === dailyTargets[0].id;
                              const sheet = item.dailySheet;
                              const customPlan = item.customPlan;
                              const doneCnt = sheet
                                ? sheet.preProgramNeeds.filter((n) => sheet.preProgramChecklistState?.[n]).length
                                : 0;
                              const totCnt = sheet ? sheet.preProgramNeeds.length : 0;

                              return (
                                <div
                                  key={item.id}
                                  className={`group px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                                    isSelected
                                      ? 'bg-[#8B0000]/[0.05] dark:bg-[#8B0000]/15'
                                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/35'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFocusedDailyId(item.id);
                                      setEditingSlotId(null);
                                      setInlineCellEdit(null);
                                      setShowQuickAddSlot(false);
                                      setIsEditingBriefing(false);
                                    }}
                                    className="min-w-0 flex-1 text-left cursor-pointer space-y-0.5 py-0.5"
                                  >
                                    <div className="flex items-center justify-between gap-1.5 text-[11px]">
                                      <span
                                        className={`font-semibold truncate ${
                                          isSelected
                                            ? 'text-[#8B0000] dark:text-[#FF8A80]'
                                            : isComingSoonItem
                                            ? 'text-[#0C4A9E] dark:text-[#7FAFFF]'
                                            : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                      >
                                        {isComingSoonItem ? 'ቀጣይ · ' : ''}{item.dateAmharic}
                                      </span>
                                      {sheet && (
                                        <span className="font-mono tabular-nums text-[10px] text-slate-400 shrink-0">
                                          {sheet.slots.length}{totCnt > 0 ? ` · ${doneCnt}/${totCnt}` : ''}
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className={`text-xs truncate ${
                                        isSelected
                                          ? 'font-bold text-slate-900 dark:text-white'
                                          : 'font-medium text-slate-700 dark:text-slate-200'
                                      }`}
                                    >
                                      {item.title}
                                    </p>
                                    {(item.presenterOrLeader || item.presenterContact) && (
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                        {item.presenterOrLeader || 'አቅራቢ'}
                                        {item.presenterContact ? (
                                          <span className="font-mono tabular-nums text-[#0C4A9E] dark:text-[#7FAFFF]">
                                            {' '}· {item.presenterContact}
                                          </span>
                                        ) : null}
                                      </p>
                                    )}
                                  </button>

                                  {canManagePlans && (
                                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                      {sheet && (
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateToNextSunday(sheet)}
                                          className="p-1 rounded text-slate-400 hover:text-[#0C4A9E] cursor-pointer"
                                          title="ወደ ቀጣይ እሁድ ቅዳ"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          sheet
                                            ? openEditDailySheetModal(sheet)
                                            : customPlan && openEditPlanModal(customPlan)
                                        }
                                        className="p-1 rounded text-slate-400 hover:text-[#0C4A9E] cursor-pointer"
                                        title="አስተካክል"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          sheet
                                            ? handleDeleteDailySheet(sheet)
                                            : customPlan && handleDeletePlan(customPlan)
                                        }
                                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                        title="ሰርዝ"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </aside>

                      {/* ZONE 2 (6 COLS): INTERACTIVE RUN-OF-SHOW STUDIO */}
                      <section
                        aria-label="ቀጣይ ዕለታዊ መርሐ ግብር ዕቅድ"
                        className="lg:col-span-6 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden"
                      >
                        {/* Clean Unboxed Studio Briefing Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                              <span className="font-semibold text-[#8B0000] dark:text-[#FF8A80]">
                                {isUpcomingSunday ? 'ቀጣይ እሁድ' : 'የተመረጠ ዕለታዊ ዕቅድ'}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {primaryDaily.dateAmharic}
                              </span>
                              {primaryDaily.timeAmharic && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                                  {pSheet && canManagePlans ? (
                                    <button
                                      type="button"
                                      onClick={() => setActiveClockProgramSheet(pSheet)}
                                      className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300 hover:text-[#8B0000] dark:hover:text-[#FF8A80] cursor-pointer transition-colors"
                                      title="በሰዓት መምረጫ አስተካክል"
                                    >
                                      <Clock className="w-3.5 h-3.5 text-[#8B0000] dark:text-[#FF8A80]" />
                                      <span>{primaryDaily.timeAmharic}</span>
                                    </button>
                                  ) : (
                                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                                      {primaryDaily.timeAmharic}
                                    </span>
                                  )}
                                </>
                              )}
                              {!isUpcomingSunday && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFocusedDailyId(null);
                                      setEditingSlotId(null);
                                      setInlineCellEdit(null);
                                      setShowQuickAddSlot(false);
                                      setIsEditingBriefing(false);
                                    }}
                                    className="font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline cursor-pointer whitespace-nowrap"
                                  >
                                    ወደ ቀጣዩ ተመለስ
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Quiet Utility Icon Strip */}
                            <div className="flex items-center gap-1 shrink-0">
                              {pSheet && canManagePlans && (
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateToNextSunday(pSheet)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                  title="ወደ ቀጣይ እሁድ ቅዳ"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {pSheet && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => printDailyPlanSheet(pSheet)}
                                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                    title="አትም"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      downloadDailyPlanPdf(pSheet);
                                      showToast(`የ${pSheet.dateAmharic} ሉህ PDF ወርዷል።`);
                                    }}
                                    className="p-2 rounded-lg text-[#0C4A9E] dark:text-[#7FAFFF] hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                                    title="PDF አውርድ"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {canManagePlans && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      pSheet
                                        ? openEditDailySheetModal(pSheet)
                                        : pCustom && openEditPlanModal(pCustom)
                                    }
                                    className="p-2 rounded-lg text-slate-500 hover:text-[#0C4A9E] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                    title="ሙሉ ሉሁን አስተካክል"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      pSheet
                                        ? handleDeleteDailySheet(pSheet)
                                        : pCustom && handleDeletePlan(pCustom)
                                    }
                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                                    title="ሰርዝ"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Direct Click-to-Edit Topic Title or Inline Briefing Form */}
                          {isEditingBriefing && pSheet ? (
                            <form
                              onSubmit={(e) => handleSaveInlineBriefing(pSheet, e)}
                              className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="sm:col-span-2">
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    የዕለቱ ዋና ርዕስ
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={briefingDraft.mainTopic}
                                    onChange={(e) =>
                                      setBriefingDraft({ ...briefingDraft, mainTopic: e.target.value })
                                    }
                                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    ተረኛ ምድብ / መሪ
                                  </label>
                                  <input
                                    type="text"
                                    list="ehud-squad-options"
                                    value={briefingDraft.squadName}
                                    onChange={(e) =>
                                      setBriefingDraft({ ...briefingDraft, squadName: e.target.value })
                                    }
                                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                                  />
                                  <datalist id="ehud-squad-options">
                                    {currentSquads.map((sq) => (
                                      <option key={sq.id} value={sq.nameAmharic} />
                                    ))}
                                  </datalist>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    የፕሮግራሙ አቅራቢ ስም (Presenter)
                                  </label>
                                  <input
                                    type="text"
                                    value={briefingDraft.presenterOrTeacher}
                                    onChange={(e) =>
                                      setBriefingDraft({
                                        ...briefingDraft,
                                        presenterOrTeacher: e.target.value,
                                      })
                                    }
                                    placeholder="የአቅራቢው / የመምህሩ ሙሉ ስም"
                                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    የአቅራቢው ስልክ ቁጥር (Phone)
                                  </label>
                                  <input
                                    type="text"
                                    inputMode="tel"
                                    value={briefingDraft.presenterContact}
                                    onChange={(e) =>
                                      setBriefingDraft({
                                        ...briefingDraft,
                                        presenterContact: e.target.value,
                                      })
                                    }
                                    placeholder="0911 00 00 00"
                                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono tabular-nums"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    የዕለቱ መንፈሳዊ ዓላማ
                                  </label>
                                  <input
                                    type="text"
                                    value={briefingDraft.purpose}
                                    onChange={(e) =>
                                      setBriefingDraft({ ...briefingDraft, purpose: e.target.value })
                                    }
                                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsEditingBriefing(false)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                                >
                                  ተው
                                </button>
                                <button
                                  type="submit"
                                  className="px-3.5 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>አስቀምጥ</span>
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="group/title flex items-start justify-between gap-2">
                                {pSheet && canManagePlans ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInlineBriefing(pSheet)}
                                    className="text-left group cursor-pointer flex items-baseline gap-2"
                                    title="ርዕስ፣ አቅራቢ ወይም መገኛ ቀጥታ አስተካክል"
                                  >
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight text-balance group-hover:text-[#0C4A9E] dark:group-hover:text-[#7FAFFF] transition-colors">
                                      {primaryDaily.title}
                                    </h2>
                                    <Edit3 className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#0C4A9E] shrink-0 transition-colors" />
                                  </button>
                                ) : (
                                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight text-balance">
                                    {primaryDaily.title}
                                  </h2>
                                )}
                              </div>

                              {/* Clean Presenter + Contact Context Line */}
                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                <span>
                                  አቅራቢ፦{' '}
                                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                                    {primaryDaily.presenterOrLeader || 'አልተመደበም'}
                                  </strong>
                                </span>
                                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                                {primaryDaily.presenterContact ? (
                                  (() => {
                                    const telHref = formatTelHref(primaryDaily.presenterContact);
                                    return telHref ? (
                                      <a
                                        href={telHref}
                                        className="inline-flex items-center gap-1 font-mono tabular-nums font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                                        title="ለአቅራቢው ይደውሉ"
                                      >
                                        <Phone className="w-3 h-3 shrink-0" />
                                        <span>{primaryDaily.presenterContact}</span>
                                      </a>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 font-mono text-slate-700 dark:text-slate-200">
                                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{primaryDaily.presenterContact}</span>
                                      </span>
                                    );
                                  })()
                                ) : (pSheet || pCustom) && canManagePlans ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      pSheet
                                        ? handleOpenInlineBriefing(pSheet)
                                        : pCustom && openEditPlanModal(pCustom)
                                    }
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                                  >
                                    <Phone className="w-3 h-3 shrink-0" />
                                    <span>+ የአቅራቢ ስልክ ቁጥር አስገባ</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">ስልክ አልተመዘገበም</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Slim Time-Budget Header + 1-Click Automation Bar */}
                        <div className="px-5 py-2.5 bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/80 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                የሰዓት ሰሌዳ
                              </span>
                              <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                                {pSheet ? `${pSheet.slots.length} ክፍሎች` : '0 ክፍሎች'}
                                {totalMinutes !== null ? ` · ${totalMinutes}/${capacityMin}m` : ''}
                                {slotAnalysis && !slotAnalysis.hasOverflow && remainingMin > 0
                                  ? ` · ${remainingMin}m ክፍት`
                                  : ''}
                              </span>
                            </div>

                            {pSheet && canManagePlans && pSheet.slots.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAutoChainSlots(pSheet)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#0C4A9E] text-[11px] font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  title="ሁሉንም ክፍለ-ጊዜዎች ያለ ግጭት በቅደም ተከተል አስተካክል"
                                >
                                  <Wand2 className="w-3 h-3 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                                  <span>ሰዓት አሰልፍ</span>
                                </button>
                                {(slotAnalysis?.hasOverflow || remainingMin >= 10) && (
                                  <button
                                    type="button"
                                    onClick={() => handleRebalanceWindowSlots(pSheet)}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#8B0000] text-[11px] font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                    title="ሁሉንም ክፍለ-ጊዜዎች ከመርሐ ግብሩ ሰዓት ጋር አመጣጥን"
                                  >
                                    <Scale className="w-3 h-3 text-[#8B0000] dark:text-[#FF8A80]" />
                                    <span>አመጣጥን ({capacityMin}m)</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowTemplatesBar((prev) => !prev)}
                                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                                    showTemplatesBar
                                      ? 'border-[#8B0000] bg-[#8B0000]/5 text-[#8B0000] dark:text-[#FF8A80]'
                                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>አብነት</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {pSheet && pSheet.slots.length > 0 && (
                            <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  slotAnalysis?.hasAnyOverlap
                                    ? 'bg-rose-600'
                                    : slotAnalysis?.hasOverflow
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-600'
                                }`}
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>
                          )}

                          {showTemplatesBar && pSheet && canManagePlans && (
                            <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-slate-500 dark:text-slate-400">አብነት ጫን፦</span>
                                {DAILY_SLOT_TEMPLATES.map((tpl) => (
                                  <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => handleApplyTemplateToSheet(pSheet, tpl.id)}
                                    className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#8B0000] text-slate-700 dark:text-slate-200 font-medium cursor-pointer whitespace-nowrap"
                                  >
                                    {tpl.label}
                                  </button>
                                ))}
                              </div>

                              <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={autoChainOnReorder}
                                  onChange={(e) => setAutoChainOnReorder(e.target.checked)}
                                  className="rounded border-slate-300 text-[#0C4A9E] focus:ring-[#0C4A9E]"
                                />
                                <span>ሲጎተቱ ሰዓት አስተካክል</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Interactive Proportional Visual Timeline (SlotOverlapShower) */}
                        {pSheet && pSheet.slots.length > 0 && (
                          <SlotOverlapShower
                            slots={pSheet.slots}
                            programTimeRange={pSheet.timeAmharic}
                            onSlotClick={
                              canManagePlans
                                ? (slot) => setActiveClockSlot({ sheet: pSheet, slot })
                                : undefined
                            }
                            onGapClick={
                              canManagePlans
                                ? (gapRange) => {
                                    setQuickSlotTime(gapRange);
                                    setShowQuickAddSlot(true);
                                    setEditingSlotId(null);
                                    setInlineCellEdit(null);
                                  }
                                : undefined
                            }
                          />
                        )}

                        {/* Draggable + Direct Click-to-Edit Run-of-Show Slot Rows */}
                        {pSheet && pSheet.slots.length > 0 ? (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                            {pSheet.slots.map((slot, sIdx) => {
                              const isEditingRow = editingSlotId === slot.id;
                              const analyzedSlot = slotAnalysis?.bySlotId[slot.id];
                              const isDraggingThis = draggedSlotId === slot.id;
                              const isDropTarget =
                                dragOverSlotId === slot.id && draggedSlotId !== slot.id;
                              const isEditingTitleCell =
                                inlineCellEdit?.slotId === slot.id &&
                                inlineCellEdit.field === 'title';
                              const isEditingInChargeCell =
                                inlineCellEdit?.slotId === slot.id &&
                                inlineCellEdit.field === 'inCharge';
                              const isEditingInChargeContactCell =
                                inlineCellEdit?.slotId === slot.id &&
                                inlineCellEdit.field === 'inChargeContact';

                              if (isEditingRow) {
                                return (
                                  <div
                                    key={slot.id}
                                    className="px-4 sm:px-5 py-3 bg-blue-50/40 dark:bg-blue-950/20 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                                  >
                                    <div className="sm:col-span-3">
                                      <ClockTimePicker
                                        value={editSlotTime}
                                        onChange={setEditSlotTime}
                                        defaultMode="DURATION"
                                        title="የክፍለ-ጊዜ ሰዓት / ክፍተት ይምረጡ"
                                        contextSlots={pSheet.slots}
                                        currentSlotId={slot.id}
                                        programTimeRange={pSheet.timeAmharic}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono tabular-nums flex items-center justify-between gap-1.5"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      value={editSlotTitle}
                                      onChange={(e) => setEditSlotTitle(e.target.value)}
                                      placeholder="የክፍለ-ጊዜ ርዕስ"
                                      className="sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={editSlotInCharge}
                                      onChange={(e) => setEditSlotInCharge(e.target.value)}
                                      placeholder="የአቅራቢ ስም"
                                      className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                                    />
                                    <input
                                      type="text"
                                      inputMode="tel"
                                      value={editSlotInChargeContact}
                                      onChange={(e) => setEditSlotInChargeContact(e.target.value)}
                                      placeholder="ስልክ ቁጥር (09...)"
                                      className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono tabular-nums"
                                    />
                                    <div className="sm:col-span-2 flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveInlineSlotEdit(pSheet)}
                                        className="px-2.5 py-1.5 rounded-lg bg-[#0C4A9E] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>አስቀምጥ</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingSlotId(null)}
                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
                                        title="ተው"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={slot.id}
                                  draggable={canManagePlans && !inlineCellEdit}
                                  onDragStart={(e) => {
                                    if (!canManagePlans) return;
                                    setDraggedSlotId(slot.id);
                                    e.dataTransfer.effectAllowed = 'move';
                                  }}
                                  onDragOver={(e) => {
                                    if (!canManagePlans || !draggedSlotId) return;
                                    e.preventDefault();
                                    if (dragOverSlotId !== slot.id) {
                                      setDragOverSlotId(slot.id);
                                    }
                                  }}
                                  onDragLeave={() => {
                                    if (dragOverSlotId === slot.id) {
                                      setDragOverSlotId(null);
                                    }
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    if (draggedSlotId) {
                                      handleDropReorderSlot(pSheet, draggedSlotId, slot.id);
                                    }
                                  }}
                                  onDragEnd={() => {
                                    setDraggedSlotId(null);
                                    setDragOverSlotId(null);
                                  }}
                                  className={`group px-4 sm:px-5 py-2.5 min-h-[52px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                                    isDraggingThis
                                      ? 'opacity-45 bg-slate-100 dark:bg-slate-800/60'
                                      : isDropTarget
                                      ? 'bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-inset ring-[#0C4A9E]/40'
                                      : analyzedSlot?.hasOverlap
                                      ? 'bg-rose-50/40 dark:bg-rose-950/15 hover:bg-rose-50/70 dark:hover:bg-rose-950/25'
                                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {canManagePlans && (
                                      <span
                                        className="hidden sm:inline-flex text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0"
                                        title="ጎትተው ቦታ ይቀይሩ"
                                      >
                                        <GripVertical className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                    <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-400 dark:text-slate-500 w-5 shrink-0">
                                      {String(sIdx + 1).padStart(2, '0')}
                                    </span>

                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      {isEditingTitleCell ? (
                                        <input
                                          type="text"
                                          autoFocus
                                          value={inlineCellEdit.value}
                                          onChange={(e) =>
                                            setInlineCellEdit({
                                              ...inlineCellEdit,
                                              value: e.target.value,
                                            })
                                          }
                                          onBlur={() => handleCommitInlineCell(pSheet)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              handleCommitInlineCell(pSheet);
                                            } else if (e.key === 'Escape') {
                                              setInlineCellEdit(null);
                                            }
                                          }}
                                          className="w-full px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-[#0C4A9E] text-[13px] font-semibold text-slate-900 dark:text-white focus:outline-none"
                                        />
                                      ) : canManagePlans ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setInlineCellEdit({
                                              slotId: slot.id,
                                              field: 'title',
                                              value: slot.slotTitle,
                                            })
                                          }
                                          className="text-left max-w-full block truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] cursor-text"
                                          title="ርዕሱን ቀጥታ ለመቀየር ይጫኑ"
                                        >
                                          {slot.slotTitle}
                                        </button>
                                      ) : (
                                        <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                                          {slot.slotTitle}
                                        </span>
                                      )}

                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                        {isEditingInChargeCell ? (
                                          <input
                                            type="text"
                                            autoFocus
                                            value={inlineCellEdit.value}
                                            onChange={(e) =>
                                              setInlineCellEdit({
                                                ...inlineCellEdit,
                                                value: e.target.value,
                                              })
                                            }
                                            onBlur={() => handleCommitInlineCell(pSheet)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleCommitInlineCell(pSheet);
                                              } else if (e.key === 'Escape') {
                                                setInlineCellEdit(null);
                                              }
                                            }}
                                            placeholder="የአቅራቢ ስም..."
                                            className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-[#0C4A9E] text-[11px] text-slate-800 dark:text-slate-100 focus:outline-none"
                                          />
                                        ) : canManagePlans ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setInlineCellEdit({
                                                slotId: slot.id,
                                                field: 'inCharge',
                                                value: slot.inCharge || '',
                                              })
                                            }
                                            className="hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] cursor-text truncate max-w-[190px]"
                                            title="የአቅራቢ ስም ቀጥታ ለመቀየር ይጫኑ"
                                          >
                                            {slot.inCharge ? (
                                              <span>
                                                አቅራቢ፦{' '}
                                                <strong className="font-semibold text-slate-700 dark:text-slate-200">
                                                  {slot.inCharge}
                                                </strong>
                                              </span>
                                            ) : (
                                              <span className="text-amber-700 dark:text-amber-400">
                                                + አቅራቢ ስም
                                              </span>
                                            )}
                                          </button>
                                        ) : (
                                          slot.inCharge && (
                                            <span className="truncate">
                                              አቅራቢ፦{' '}
                                              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                                                {slot.inCharge}
                                              </strong>
                                            </span>
                                          )
                                        )}

                                        {isEditingInChargeContactCell ? (
                                          <input
                                            type="text"
                                            inputMode="tel"
                                            autoFocus
                                            value={inlineCellEdit.value}
                                            onChange={(e) =>
                                              setInlineCellEdit({
                                                ...inlineCellEdit,
                                                value: e.target.value,
                                              })
                                            }
                                            onBlur={() => handleCommitInlineCell(pSheet)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleCommitInlineCell(pSheet);
                                              } else if (e.key === 'Escape') {
                                                setInlineCellEdit(null);
                                              }
                                            }}
                                            placeholder="0911 00 00 00"
                                            className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-[#0C4A9E] text-[11px] font-mono tabular-nums text-slate-800 dark:text-slate-100 focus:outline-none"
                                          />
                                        ) : slot.inChargeContact ? (
                                          (() => {
                                            const telHref = formatTelHref(slot.inChargeContact);
                                            return (
                                              <span className="inline-flex items-center gap-1">
                                                {telHref ? (
                                                  <a
                                                    href={telHref}
                                                    className="inline-flex items-center gap-1 font-mono tabular-nums font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                                                    title="ለክፍለ-ጊዜው አቅራቢ ይደውሉ"
                                                  >
                                                    <Phone className="w-2.5 h-2.5 shrink-0" />
                                                    <span>{slot.inChargeContact}</span>
                                                  </a>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                                                    <Phone className="w-2.5 h-2.5 shrink-0" />
                                                    <span>{slot.inChargeContact}</span>
                                                  </span>
                                                )}
                                                {canManagePlans && (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setInlineCellEdit({
                                                        slotId: slot.id,
                                                        field: 'inChargeContact',
                                                        value: slot.inChargeContact || '',
                                                      })
                                                    }
                                                    className="p-0.5 rounded text-slate-400 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] cursor-pointer"
                                                    title="ስልክ ቁጥር አስተካክል"
                                                  >
                                                    <Edit3 className="w-2.5 h-2.5" />
                                                  </button>
                                                )}
                                              </span>
                                            );
                                          })()
                                        ) : (
                                          canManagePlans && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setInlineCellEdit({
                                                  slotId: slot.id,
                                                  field: 'inChargeContact',
                                                  value: '',
                                                })
                                              }
                                              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] hover:underline cursor-pointer"
                                              title="የዚህ ክፍለ-ጊዜ አቅራቢ ስልክ ቁጥር አስገባ"
                                            >
                                              <Phone className="w-2.5 h-2.5 shrink-0" />
                                              <span>+ ስልክ ቁጥር</span>
                                            </button>
                                          )
                                        )}

                                        {analyzedSlot && analyzedSlot.durationMin > 0 && (
                                          <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                                            · {analyzedSlot.durationMin}m
                                          </span>
                                        )}

                                        {analyzedSlot?.hasOverlap && (
                                          <span className="font-semibold text-rose-600 dark:text-rose-400 truncate">
                                            · ተደራራቢ ({analyzedSlot.overlaps.map((o) => o.otherSlotTitle).join(', ')})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pl-7 sm:pl-0">
                                    <div className="flex items-center gap-1">
                                      {canManagePlans && (
                                        <button
                                          type="button"
                                          onClick={() => handleAdjustSlotDuration(pSheet, slot.id, -5)}
                                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-opacity cursor-pointer"
                                          title="5 ደቂቃ ቀንስ"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                      )}

                                      {canManagePlans ? (
                                        <button
                                          type="button"
                                          onClick={() => setActiveClockSlot({ sheet: pSheet, slot })}
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono tabular-nums font-semibold cursor-pointer transition-colors ${
                                            analyzedSlot?.hasOverlap
                                              ? 'bg-rose-100/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                                              : 'border-slate-200/90 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:border-[#8B0000] hover:text-[#8B0000] dark:hover:text-[#FF8A80]'
                                          }`}
                                          title="ሰዓት በሰዓት መምረጫ ቀይር"
                                        >
                                          <Clock
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                              analyzedSlot?.hasOverlap
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-[#8B0000] dark:text-[#FF8A80]'
                                            }`}
                                          />
                                          <span>{slot.timeRange}</span>
                                        </button>
                                      ) : (
                                        <span
                                          className={`text-xs font-mono tabular-nums font-semibold ${
                                            analyzedSlot?.hasOverlap
                                              ? 'text-rose-600 dark:text-rose-400'
                                              : 'text-slate-700 dark:text-slate-200'
                                          }`}
                                        >
                                          {slot.timeRange}
                                        </span>
                                      )}

                                      {canManagePlans && (
                                        <button
                                          type="button"
                                          onClick={() => handleAdjustSlotDuration(pSheet, slot.id, 5)}
                                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-opacity cursor-pointer"
                                          title="5 ደቂቃ ጨምር"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>

                                    {canManagePlans && (
                                      <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                                        <button
                                          type="button"
                                          disabled={sIdx === 0}
                                          onClick={() => handleMoveSlot(pSheet, sIdx, -1)}
                                          className="sm:hidden p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-25 cursor-pointer"
                                          title="ወደ ላይ አውጣ"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={sIdx === pSheet.slots.length - 1}
                                          onClick={() => handleMoveSlot(pSheet, sIdx, 1)}
                                          className="sm:hidden p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-25 cursor-pointer"
                                          title="ወደ ታች አውርድ"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleStartInlineSlotEdit(slot)}
                                          className="p-1.5 rounded text-slate-400 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] cursor-pointer"
                                          title="ሙሉ ክፍለ-ጊዜ አስተካክል"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteInlineSlot(pSheet, slot.id)}
                                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                          title="አስወግድ"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="px-6 py-8 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span>ለዚህ ዕቅድ የሰዓት ክፍለ-ጊዜዎች ገና አልተጨመሩም።</span>
                            {canManagePlans && pSheet && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {DAILY_SLOT_TEMPLATES.map((tpl) => (
                                  <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => handleApplyTemplateToSheet(pSheet, tpl.id)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#8B0000] text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                  >
                                    + {tpl.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Always-Ready Bottom Composer & Instant Preset Strip */}
                        {pSheet && canManagePlans && !showQuickAddSlot && (
                          <div className="px-4 sm:px-5 py-3 bg-slate-50/50 dark:bg-slate-900/25 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenQuickAddSlot(pSheet)}
                              className="px-3 py-1.5 rounded-lg bg-[#8B0000] hover:bg-[#6e0000] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>ክፍለ-ጊዜ ጨምር</span>
                            </button>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {QUICK_SLOT_PRESETS.map((preset) => (
                                <button
                                  key={preset.title}
                                  type="button"
                                  onClick={() => handleInstantPresetAddSlot(pSheet, preset)}
                                  className="px-2.5 py-1 rounded-md border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#0C4A9E] hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap transition-colors"
                                  title={`በቀጥታ «${preset.title}» (${preset.mins}m) ጨምር`}
                                >
                                  + {preset.title} ({preset.mins}m)
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expanded Smart Quick-Add Slot Bar */}
                        {pSheet && canManagePlans && showQuickAddSlot && (
                          <form
                            onSubmit={(e) => handleQuickAddSlot(pSheet, e)}
                            className="px-4 sm:px-5 py-4 bg-slate-50/90 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                አዲስ ክፍለ-ጊዜ በፍጥነት ጨምር
                              </span>
                              <div className="flex flex-wrap items-center gap-1">
                                {[10, 15, 25, 35].map((mins) => {
                                  const suggested = getNextRecommendedSlotRange(
                                    pSheet.slots,
                                    mins,
                                    pSheet.timeAmharic
                                  );
                                  return (
                                    <button
                                      key={mins}
                                      type="button"
                                      onClick={() => setQuickSlotTime(suggested)}
                                      className={`px-2 py-1 rounded-md text-[11px] font-mono tabular-nums cursor-pointer transition-colors ${
                                        quickSlotTime === suggested
                                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                      }`}
                                      title={suggested}
                                    >
                                      +{mins}m
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {QUICK_SLOT_PRESETS.map((preset) => (
                                <button
                                  key={preset.title}
                                  type="button"
                                  onClick={() => {
                                    setQuickSlotTitle(preset.title);
                                    setQuickSlotInCharge(preset.inCharge);
                                    setQuickSlotTime(
                                      getNextRecommendedSlotRange(
                                        pSheet.slots,
                                        preset.mins,
                                        pSheet.timeAmharic
                                      )
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0C4A9E] text-[11px] font-medium text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                                >
                                  {preset.title} ({preset.mins}m)
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <div className="sm:col-span-3">
                                <ClockTimePicker
                                  value={quickSlotTime}
                                  onChange={setQuickSlotTime}
                                  defaultMode="INTERVAL"
                                  title="የክፍለ-ጊዜ ሰዓት / ክፍተት ይምረጡ"
                                  contextSlots={pSheet.slots}
                                  programTimeRange={pSheet.timeAmharic}
                                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#8B0000] text-xs font-mono tabular-nums flex items-center justify-between gap-1.5"
                                />
                              </div>
                              <input
                                type="text"
                                required
                                autoFocus
                                value={quickSlotTitle}
                                onChange={(e) => setQuickSlotTitle(e.target.value)}
                                placeholder="የክፍለ-ጊዜው ርዕስ (ለምሳሌ የመጽሐፍ ቅዱስ ጥናት)..."
                                className="sm:col-span-3 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                              />
                              <input
                                type="text"
                                value={quickSlotInCharge}
                                onChange={(e) => setQuickSlotInCharge(e.target.value)}
                                placeholder="የአቅራቢ ስም"
                                className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                              />
                              <input
                                type="text"
                                inputMode="tel"
                                value={quickSlotInChargeContact}
                                onChange={(e) => setQuickSlotInChargeContact(e.target.value)}
                                placeholder="ስልክ ቁጥር (09...)"
                                className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums"
                              />
                              <div className="sm:col-span-2 flex items-center gap-1">
                                <button
                                  type="submit"
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#8B0000] hover:bg-[#6e0000] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                                >
                                  ጨምር
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowQuickAddSlot(false)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
                                  title="ዝጋ"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                      </section>

                      {/* ZONE 3 (3 COLS): STICKY LIVE READINESS & WORKFLOW HANDOFF INSPECTOR */}
                      <aside
                        aria-label="ዝግጅት፣ መሪ እና ክትትል"
                        className="lg:col-span-3 lg:sticky lg:top-16 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden"
                      >
                        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            ዝግጅት እና ክትትል
                          </span>
                          <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              {pCheckPct}%
                            </span>
                            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                            <span className="text-[#B88500] dark:text-[#FFD54F]">
                              {pRating ? `★ ${pRating.avg}/5` : '★ —'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-4 text-xs">
                          {/* Clickable Leadership, Presenter & Contact Summary */}
                          <div
                            onClick={() => {
                              if (!canManagePlans) return;
                              if (pSheet) handleOpenInlineBriefing(pSheet);
                              else if (pCustom) openEditPlanModal(pCustom);
                            }}
                            className={`space-y-3 ${
                              (pSheet || pCustom) && canManagePlans ? 'cursor-pointer group' : ''
                            }`}
                            title={
                              (pSheet || pCustom) && canManagePlans
                                ? 'አቅራቢ፣ ስልክ ቁጥር፣ መሪ እና ዓላማ ቀጥታ አስተካክል'
                                : undefined
                            }
                          >
                            <div className="space-y-2.5">
                              <div>
                                <span className="text-[11px] text-slate-400 block">የፕሮግራሙ አቅራቢ ስም</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#0C4A9E] dark:group-hover:text-[#7FAFFF] mt-0.5 block truncate transition-colors">
                                  {primaryDaily.presenterOrLeader || 'አልተመደበም'}
                                </span>
                                {primaryDaily.presenterContact ? (
                                  (() => {
                                    const telHref = formatTelHref(primaryDaily.presenterContact);
                                    return telHref ? (
                                      <a
                                        href={telHref}
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono tabular-nums font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                                        title="ለአቅራቢው ይደውሉ"
                                      >
                                        <Phone className="w-3 h-3 shrink-0" />
                                        <span>{primaryDaily.presenterContact}</span>
                                      </a>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{primaryDaily.presenterContact}</span>
                                      </span>
                                    );
                                  })()
                                ) : (
                                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    <span>
                                      {(pSheet || pCustom) && canManagePlans
                                        ? '+ ስልክ ቁጥር አስገባ'
                                        : 'ስልክ አልተመዘገበም'}
                                    </span>
                                  </span>
                                )}
                              </div>

                              <div>
                                <span className="text-[11px] text-slate-400 block">መሪ / አዘጋጅ ምድብ</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#0C4A9E] dark:group-hover:text-[#7FAFFF] mt-0.5 block truncate transition-colors">
                                  {primaryDaily.squadOrResponsible || 'ተረኛ ምድብ'}
                                </span>
                              </div>
                            </div>

                            {primaryDaily.goal && (
                              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                                <span className="text-[11px] text-slate-400 block mb-1">የዕለቱ መንፈሳዊ ዓላማ</span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                                  {primaryDaily.goal}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Pre-Program Readiness Checklist */}
                          {pSheet && (
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                  ቅድመ-ዝግጅት Checklist
                                </span>
                                <span className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                                  {pCheckDone}/{pCheckTotal}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 transition-all duration-300"
                                  style={{ width: `${pCheckPct}%` }}
                                />
                              </div>

                              <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                {pSheet.preProgramNeeds.map((need, nIdx) => {
                                  const checked = Boolean(pSheet.preProgramChecklistState?.[need]);
                                  return (
                                    <button
                                      key={nIdx}
                                      type="button"
                                      onClick={() => toggleDailyPreProgramItem(pSheet.id, need)}
                                      className="w-full py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/30 cursor-pointer"
                                    >
                                      <span className="flex items-center gap-2 min-w-0">
                                        {checked ? (
                                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                                        )}
                                        <span
                                          className={`truncate ${
                                            checked
                                              ? 'line-through text-slate-400'
                                              : 'text-slate-700 dark:text-slate-200'
                                          }`}
                                        >
                                          {need}
                                        </span>
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {canManagePlans && (
                                <div className="space-y-2 pt-1">
                                  <div className="flex flex-wrap gap-1">
                                    {QUICK_CHECKLIST_PRESETS.filter(
                                      (preset) => !pSheet.preProgramNeeds.includes(preset)
                                    )
                                      .slice(0, 3)
                                      .map((preset) => (
                                        <button
                                          key={preset}
                                          type="button"
                                          onClick={() => handleToggleChecklistPreset(pSheet, preset)}
                                          className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-emerald-600 text-[10px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                                        >
                                          + {preset}
                                        </button>
                                      ))}
                                  </div>

                                  <form
                                    onSubmit={(e) => handleQuickAddChecklistItem(pSheet, e)}
                                    className="flex items-center gap-1.5"
                                  >
                                    <input
                                      type="text"
                                      value={newChecklistNeed}
                                      onChange={(e) => setNewChecklistNeed(e.target.value)}
                                      placeholder="ተጨማሪ ዝግጅት ጨምር..."
                                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                                    />
                                    <button
                                      type="submit"
                                      className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                                    >
                                      ጨምር
                                    </button>
                                  </form>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Seamless Live Following & Program Rating Handoff */}
                          {onNavigateToTab && pSheet && (
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                <span>የዕለቱ ክትትል ሁኔታ</span>
                                <span className="font-mono tabular-nums font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                                  {pFollow ? `${pFollow.count} ጊዜ (${pFollow.latest.readinessScore}%)` : 'ገና አልተጀመረም'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  onFocusSheetChange?.(pSheet.id);
                                  onNavigateToTab('EHUD_FOLLOWING');
                                }}
                                className="w-full py-2.5 px-3 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-semibold inline-flex items-center justify-between gap-2 cursor-pointer transition-colors"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <Play className="w-3.5 h-3.5" />
                                  <span>ወደ ቀጥታ ክትትል ጀምር</span>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onFocusSheetChange?.(pSheet.id);
                                  onNavigateToTab('EHUD_RATING');
                                }}
                                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#B88500] text-slate-700 dark:text-slate-200 hover:text-[#B88500] dark:hover:text-[#FFD54F] text-xs font-semibold inline-flex items-center justify-between gap-2 cursor-pointer transition-colors"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5 text-[#B88500] dark:text-[#FFD54F]" />
                                  <span>መርሐ ግብሩን ደረጃ ስጥ</span>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                              </button>
                            </div>
                          )}
                        </div>
                      </aside>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* TAB 2: WEEKLY PLANS (imported from ዋና ገጽ + custom weekly plans, with 1-click Daily Plan generator) */}
        {activeTab === 'WEEKLY' && (
          <div className="space-y-3">
            <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#0C4A9E] dark:text-[#7FAFFF] font-semibold">
                {EHUD_SCOPE_META.WEEKLY.description}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                {activeTargets.length} ሳምንታዊ ዕቅዶች
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeTargets.map((item) => {
                const customPlan = item.customPlan;
                const followSummary = getFollowUpSummary(item.id, 'WEEKLY');
                const ratingSummary = getRatingSummary(item.id, 'WEEKLY');
                const hasDailySheet = Boolean(item.linkedDailySheet);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-[#0C4A9E] dark:text-[#7FAFFF]">
                              {item.dateAmharic}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                item.source === 'wana_gets_weekly'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {item.source === 'wana_gets_weekly' ? 'ከዋና ገጽ (Wana Gets)' : 'ተጨማሪ ሳምንታዊ ዕቅድ'}
                            </span>
                            {customPlan && (
                              <button
                                type="button"
                                onClick={() => handleCycleStatus(customPlan)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${PLAN_STATUS_META[customPlan.status].badgeClass}`}
                              >
                                {PLAN_STATUS_META[customPlan.status].label}
                              </button>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {item.title}
                          </h3>
                        </div>

                        {(customPlan || item.linkedDailySheet) && canManagePlans && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                customPlan
                                  ? openEditPlanModal(customPlan)
                                  : item.linkedDailySheet && openEditDailySheetModal(item.linkedDailySheet)
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0C4A9E] cursor-pointer"
                              title="አቅራቢ እና ስልክ ቁጥር አስተካክል"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {customPlan && (
                              <button
                                type="button"
                                onClick={() => handleDeletePlan(customPlan)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {item.goal && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.goal}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                          <span>አቅራቢ፦ {item.presenterOrLeader || 'አልተመደበም'}</span>
                        </span>
                        {item.presenterContact ? (
                          (() => {
                            const telHref = formatTelHref(item.presenterContact);
                            return telHref ? (
                              <a
                                href={telHref}
                                className="inline-flex items-center gap-1 font-mono tabular-nums font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                                title="ለአቅራቢው ይደውሉ"
                              >
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{item.presenterContact}</span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{item.presenterContact}</span>
                              </span>
                            );
                          })()
                        ) : canManagePlans ? (
                          <button
                            type="button"
                            onClick={() =>
                              customPlan
                                ? openEditPlanModal(customPlan)
                                : openCreateDailyModal(item)
                            }
                            className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] hover:underline cursor-pointer"
                          >
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>+ ስልክ ቁጥር አስገባ</span>
                          </button>
                        ) : null}
                        {item.squadOrResponsible && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3 text-[#8B0000]" />
                            {item.squadOrResponsible}
                          </span>
                        )}
                        {item.scriptureRef && (
                          <span className="inline-flex items-center gap-1 text-[#B88500] dark:text-[#FFD54F]">
                            <BookOpen className="w-3 h-3" />
                            {item.scriptureRef}
                          </span>
                        )}
                        {item.timeAmharic && item.timeAmharic !== '—' && (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {item.timeAmharic}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {followSummary ? `ክትትል: ${followSummary.count}` : 'ክትትል: 0'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-[#B88500] dark:text-[#FFD54F] inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#F5B800] text-[#F5B800]" />
                          {ratingSummary ? `${ratingSummary.avg}/5` : '—'}
                        </span>
                      </div>

                      {canManagePlans && (
                        <button
                          type="button"
                          onClick={() => openCreateDailyModal(item)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                            hasDailySheet
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-[#8B0000] text-white hover:bg-[#6e0000]'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{hasDailySheet ? 'የዕለት ዕቅድ አስተካክል' : 'ዕለታዊ ዕቅድ ፍጠር'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: YEARLY PLANS (imported from ዋና ገጽ Annual Targets + 51-Sunday Roadmap + Custom Yearly Plans) */}
        {activeTab === 'YEARLY' && (
          <div className="space-y-3">
            <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#8A6300] dark:text-[#FFD54F] font-semibold">
                {EHUD_SCOPE_META.YEARLY.description}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                {activeTargets.length} ዓመታዊ ዕቅዶች
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeTargets.map((item) => {
                const customPlan = item.customPlan;
                const tgt = item.annualTarget;
                const followSummary = getFollowUpSummary(item.id, 'YEARLY');
                const ratingSummary = getRatingSummary(item.id, 'YEARLY');

                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-[#B88500] dark:text-[#FFD54F]">
                              {item.dateAmharic}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              {item.source === 'custom_plan' ? 'ተጨማሪ ዓመታዊ ዕቅድ' : 'ከዋና ገጽ (Wana Gets)'}
                            </span>
                            {customPlan && (
                              <button
                                type="button"
                                onClick={() => handleCycleStatus(customPlan)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${PLAN_STATUS_META[customPlan.status].badgeClass}`}
                              >
                                {PLAN_STATUS_META[customPlan.status].label}
                              </button>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {item.title}
                          </h3>
                        </div>

                        {customPlan && canManagePlans && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditPlanModal(customPlan)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0C4A9E] cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePlan(customPlan)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-[11px] font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                          {item.subtitle}
                        </p>
                      )}
                      {item.goal && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.goal}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-1">
                        <span>
                          ፈጻሚ አካል፦ <strong className="text-slate-700 dark:text-slate-200">{item.squadOrResponsible}</strong>
                          {tgt && <span className="ml-1.5 font-mono text-[10px]">({tgt.status})</span>}
                        </span>
                        <span>
                          አቅራቢ፦ <strong className="text-slate-700 dark:text-slate-200">{item.presenterOrLeader || 'አልተመደበም'}</strong>
                        </span>
                        {item.presenterContact ? (
                          (() => {
                            const telHref = formatTelHref(item.presenterContact);
                            return telHref ? (
                              <a
                                href={telHref}
                                className="inline-flex items-center gap-1 font-mono tabular-nums font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                                title="ለአቅራቢው ይደውሉ"
                              >
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{item.presenterContact}</span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{item.presenterContact}</span>
                              </span>
                            );
                          })()
                        ) : canManagePlans ? (
                          <button
                            type="button"
                            onClick={() =>
                              customPlan
                                ? openEditPlanModal(customPlan)
                                : openCreatePlanModal('YEARLY', item)
                            }
                            className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] hover:underline cursor-pointer"
                          >
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>+ ስልክ ቁጥር አስገባ</span>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#0C4A9E] dark:text-[#7FAFFF] inline-flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {followSummary ? `ክትትል: ${followSummary.count} (${followSummary.latest.readinessScore}%)` : 'ክትትል: 0'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-[#B88500] dark:text-[#FFD54F] inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#F5B800] text-[#F5B800]" />
                        {ratingSummary ? `${ratingSummary.avg}/5 (${ratingSummary.count})` : 'ገና ደረጃ የለውም'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ORGANIZER SQUADS */}
        {activeTab === 'SQUADS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentSquads.map((sq) => (
              <div
                key={sq.id}
                className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#8B0000] dark:text-[#FF8A80]">
                    {sq.nameAmharic}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    አስተባባሪ፦ {sq.coordinatorName}
                  </span>
                </div>
                <p className="text-xs italic text-slate-600 dark:text-slate-300">{sq.spiritualMeaning}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sq.members.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#0C4A9E] dark:text-[#7FAFFF]">
                  የተመደቡ እሁዶች፦ {sq.assignedSundays.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DAILY PLAN SHEET MODAL (Creates/Edits synced SundayDailyPlanSheet) */}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingSheetId ? 'የዕለት መርሐ ግብር ዕቅድ ማስተካከያ' : `አዲስ የዕለት መርሐ ግብር ዕቅድ (${divisionLabel})`}
                </h3>
                <p className="text-[11px] text-slate-500">
                  እዚህ የተመዘገበ የዕለት ዕቅድ ወዲያውኑ በዋና ገጽ፣ በክትትልና በደረጃ መስጫ ላይ ይገለጻል
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDailyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDailySheet} className="p-5 space-y-3.5 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ወር *
                  </label>
                  <select
                    value={dailyForm.monthAmharic}
                    onChange={(e) => setDailyForm({ ...dailyForm, monthAmharic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    {ETHIOPIAN_MONTHS_LIST.map((m) => (
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
                    value={dailyForm.dayNumber}
                    onChange={(e) => setDailyForm({ ...dailyForm, dayNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ሙሉ ቀን (አማርኛ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={dailyForm.dateAmharic}
                    onChange={(e) => setDailyForm({ ...dailyForm, dateAmharic: e.target.value })}
                    placeholder="ኅዳር 13 2019 ዓ.ም."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
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
                    value={dailyForm.mainTopic}
                    onChange={(e) => setDailyForm({ ...dailyForm, mainTopic: e.target.value })}
                    placeholder="የእሁድ መርሐ ግብር ርዕስ..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ሰዓት *
                  </label>
                  <ClockTimePicker
                    value={dailyForm.timeAmharic}
                    onChange={(val) => setDailyForm({ ...dailyForm, timeAmharic: val })}
                    defaultMode="INTERVAL"
                    title="የመርሐ ግብሩን የሰዓት ክፍተት ይምረጡ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ተረኛ ምድብ / መሪ
                  </label>
                  <input
                    type="text"
                    value={dailyForm.squadName}
                    onChange={(e) =>
                      setDailyForm({
                        ...dailyForm,
                        squadName: e.target.value,
                        leader: e.target.value,
                      })
                    }
                    placeholder="ምድብ 01 (ፍቅር)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የፕሮግራሙ አቅራቢ ስም (Presenter) *
                  </label>
                  <input
                    type="text"
                    required
                    value={dailyForm.presenterOrTeacher}
                    onChange={(e) =>
                      setDailyForm({ ...dailyForm, presenterOrTeacher: e.target.value })
                    }
                    placeholder="የአቅራቢው / መምህር ሙሉ ስም"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የአቅራቢው ስልክ ቁጥር (Phone)
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    value={dailyForm.presenterContact}
                    onChange={(e) =>
                      setDailyForm({ ...dailyForm, presenterContact: e.target.value })
                    }
                    placeholder="0911 00 00 00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የዕለቱ መንፈሳዊ ዓላማ
                </label>
                <textarea
                  rows={2}
                  value={dailyForm.purpose}
                  onChange={(e) => setDailyForm({ ...dailyForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    የዕለት ሰዓት ክፍለ-ጊዜዎች (Slots)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {DAILY_SLOT_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() =>
                          setDailyForm({
                            ...dailyForm,
                            slots: tpl.slots(dailyForm.presenterOrTeacher, dailyForm.presenterContact),
                          })
                        }
                        className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap"
                      >
                        {tpl.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setDailyForm({
                          ...dailyForm,
                          slots: [
                            ...dailyForm.slots,
                            { id: `slot_${Date.now()}`, timeRange: '15 ደቂቃ', slotTitle: '', inCharge: '' },
                          ],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#0C4A9E] text-white font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ክፍለ-ጊዜ ጨምር</span>
                    </button>
                  </div>
                </div>

                {dailyForm.slots.length > 0 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <SlotOverlapShower
                      slots={dailyForm.slots}
                      programTimeRange={dailyForm.timeAmharic}
                      compact
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {dailyForm.slots.length > 0 && (
                    <div className="hidden sm:grid grid-cols-12 gap-1.5 px-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      <span className="col-span-3">ሰዓት</span>
                      <span className="col-span-3">የፕሮግራሙ ርዕስ</span>
                      <span className="col-span-2">አቅራቢ ስም</span>
                      <span className="col-span-2">ስልክ ቁጥር</span>
                      <span className="col-span-2 text-right">እርምጃ</span>
                    </div>
                  )}
                  {dailyForm.slots.map((slot, idx) => (
                    <div key={slot.id} className="grid grid-cols-12 gap-1.5 items-center">
                      <div className="col-span-3">
                        <ClockTimePicker
                          value={slot.timeRange}
                          onChange={(val) => {
                            const next = [...dailyForm.slots];
                            next[idx] = { ...slot, timeRange: val };
                            setDailyForm({ ...dailyForm, slots: next });
                          }}
                          defaultMode="DURATION"
                          title="የክፍለ-ጊዜውን ሰዓት ይምረጡ"
                          contextSlots={dailyForm.slots}
                          currentSlotId={slot.id}
                          programTimeRange={dailyForm.timeAmharic}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#8B0000] text-xs font-mono tabular-nums flex items-center justify-between gap-1"
                        />
                      </div>
                      <input
                        type="text"
                        value={slot.slotTitle}
                        onChange={(e) => {
                          const next = [...dailyForm.slots];
                          next[idx] = { ...slot, slotTitle: e.target.value };
                          setDailyForm({ ...dailyForm, slots: next });
                        }}
                        placeholder="የክፍለ-ጊዜ ርዕስ"
                        className="col-span-3 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      />
                      <input
                        type="text"
                        value={slot.inCharge || ''}
                        onChange={(e) => {
                          const next = [...dailyForm.slots];
                          next[idx] = { ...slot, inCharge: e.target.value };
                          setDailyForm({ ...dailyForm, slots: next });
                        }}
                        placeholder="የአቅራቢ ስም"
                        className="col-span-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      />
                      <input
                        type="text"
                        inputMode="tel"
                        value={slot.inChargeContact || ''}
                        onChange={(e) => {
                          const next = [...dailyForm.slots];
                          next[idx] = { ...slot, inChargeContact: e.target.value };
                          setDailyForm({ ...dailyForm, slots: next });
                        }}
                        placeholder="0911..."
                        className="col-span-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono tabular-nums"
                      />
                      <div className="col-span-2 flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const next = [...dailyForm.slots];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            setDailyForm({ ...dailyForm, slots: next });
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 cursor-pointer"
                          title="ወደ ላይ"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === dailyForm.slots.length - 1}
                          onClick={() => {
                            const next = [...dailyForm.slots];
                            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                            setDailyForm({ ...dailyForm, slots: next });
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 cursor-pointer"
                          title="ወደ ታች"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDailyForm({
                              ...dailyForm,
                              slots: dailyForm.slots.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                          title="አስወግድ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የቅድመ-ዝግጅት Checklist ፍላጎቶች (በእያንዳንዱ መስመር አንድ)
                </label>
                <textarea
                  rows={3}
                  value={dailyForm.preProgramNeedsText}
                  onChange={(e) =>
                    setDailyForm({ ...dailyForm, preProgramNeedsText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDailyModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={savingDaily}
                  className="flex-1 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#6e0000] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingDaily ? 'በማስቀመጥ ላይ...' : editingSheetId ? 'ለውጡን አስቀምጥ' : 'የዕለት ዕቅድ ፍጠር'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WEEKLY OR YEARLY PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingPlanId
                  ? 'የመርሐ ግብር ዕቅድ ማስተካከያ'
                  : `አዲስ ${planForm.planScope === 'YEARLY' ? 'ዓመታዊ' : 'ሳምንታዊ'} ዕቅድ (${divisionLabel})`}
              </h3>
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-4 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የዕቅድ ደረጃ (Scope)
                  </label>
                  <select
                    value={planForm.planScope}
                    onChange={(e) => setPlanForm({ ...planForm, planScope: e.target.value as EhudPlanScope })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="WEEKLY">ሳምንታዊ (Weekly)</option>
                    <option value="YEARLY">ዓመታዊ (Yearly)</option>
                    <option value="DAILY">ዕለታዊ (Daily)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ሁኔታ (Status)
                  </label>
                  <select
                    value={planForm.status}
                    onChange={(e) => setPlanForm({ ...planForm, status: e.target.value as EhudPlanStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="DRAFT">ረቂቅ (Draft)</option>
                    <option value="READY">ዝግጁ (Ready)</option>
                    <option value="SCHEDULED">የተመደበ (Scheduled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የዕቅዱ ርዕስ *
                </label>
                <input
                  type="text"
                  required
                  value={planForm.title}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  placeholder="ለምሳሌ፦ የኅዳር ወር መንፈሳዊ ጉባኤ"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ወር / ዘመን
                  </label>
                  <input
                    type="text"
                    value={planForm.monthAmharic}
                    onChange={(e) => setPlanForm({ ...planForm, monthAmharic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ቀን / የጊዜ ገደብ *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.targetDateAmharic}
                    onChange={(e) => setPlanForm({ ...planForm, targetDateAmharic: e.target.value })}
                    placeholder="ኅዳር 13 2019 ዓ.ም."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ተረኛ ምድብ / ፈጻሚ አካል
                  </label>
                  <input
                    type="text"
                    value={planForm.squadName}
                    onChange={(e) => setPlanForm({ ...planForm, squadName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የፕሮግራሙ አቅራቢ ስም (Presenter)
                  </label>
                  <input
                    type="text"
                    value={planForm.presenterName}
                    onChange={(e) => setPlanForm({ ...planForm, presenterName: e.target.value })}
                    placeholder="የአቅራቢው ሙሉ ስም"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የአቅራቢው ስልክ ቁጥር (Phone)
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    value={planForm.presenterContact}
                    onChange={(e) => setPlanForm({ ...planForm, presenterContact: e.target.value })}
                    placeholder="0911 00 00 00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  መንፈሳዊ ዓላማ
                </label>
                <textarea
                  rows={2}
                  value={planForm.goal}
                  onChange={(e) => setPlanForm({ ...planForm, goal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የሚያስፈልጉ ግብዓቶች (በእያንዳንዱ መስመር አንድ)
                </label>
                <textarea
                  rows={3}
                  value={planForm.resourcesText}
                  onChange={(e) => setPlanForm({ ...planForm, resourcesText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0C4A9E] text-white hover:bg-[#072958] disabled:opacity-60 cursor-pointer"
                >
                  {savingPlan ? 'በመመዝገብ ላይ...' : editingPlanId ? 'ለውጦችን አስቀምጥ' : 'ዕቅድ መዝግብ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Direct Interactive Clock Popover for Slot Rows & Header Time */}
      <ClockPopoverDialog
        isOpen={Boolean(activeClockSlot)}
        initialValue={activeClockSlot?.slot.timeRange || '15 ደቂቃ'}
        defaultMode="DURATION"
        title={activeClockSlot ? `${activeClockSlot.slot.slotTitle} — ሰዓት ምረጥ` : 'ሰዓት ምረጥ'}
        contextSlots={activeClockSlot?.sheet.slots}
        currentSlotId={activeClockSlot?.slot.id}
        programTimeRange={activeClockSlot?.sheet.timeAmharic}
        onClose={() => setActiveClockSlot(null)}
        onSelect={async (val) => {
          if (!activeClockSlot) return;
          const { sheet, slot } = activeClockSlot;
          const nextSlots = sheet.slots.map((s) =>
            s.id === slot.id ? { ...s, timeRange: val } : s
          );
          try {
            await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
            showToast(`የ«${slot.slotTitle}» ሰዓት ወደ ${val} ተቀይሯል።`);
          } catch {
            showToast('ሰዓቱ በአካባቢ ተቀምጧል።');
          }
          setActiveClockSlot(null);
        }}
      />

      <ClockPopoverDialog
        isOpen={Boolean(activeClockProgramSheet)}
        initialValue={activeClockProgramSheet?.timeAmharic || defaultDivisionTime}
        defaultMode="INTERVAL"
        title="የዕለቱ መርሐ ግብር ሰዓት ክፍተት (Start–End)"
        onClose={() => setActiveClockProgramSheet(null)}
        onSelect={async (val) => {
          if (!activeClockProgramSheet) return;
          try {
            await updateDailyPlanSheet(activeClockProgramSheet.id, { timeAmharic: val });
            showToast(`የመርሐ ግብሩ ሰዓት ወደ ${val} ተቀይሯል።`);
          } catch {
            showToast('ሰዓቱ በአካባቢ ተቀምጧል።');
          }
          setActiveClockProgramSheet(null);
        }}
      />
    </div>
  );
};
