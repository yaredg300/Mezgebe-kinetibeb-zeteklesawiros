import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  Circle,
  CheckCircle2,
  Clock,
  Users,
  AlertCircle,
  PlusCircle,
  Trash2,
  ListChecks,
  X,
  Sun,
  Calendar,
  Target,
  Search,
  Play,
  SkipForward,
  MessageSquare,
  Save,
  AlertTriangle,
  Star,
  ChevronRight,
  Minus,
  Plus,
  Timer,
  RotateCcw,
  Phone,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  BottomNavTab,
  EhudFollowUpStatus,
  EhudPlanScope,
  EhudPunctualityStatus,
  SCHEDULE_TASK_STATUS_CONFIG,
  SundayDailyPlanSheet,
  SundayProgramPlanEntry,
  SundaySlotExecutionStatus,
  SundayTimetableSlot,
} from '../types';
import { AppHeader } from '../components/AppHeader';
import {
  EHUD_SCOPE_META,
  ETHIOPIAN_MONTHS_LIST,
  SyncedEhudPlanTarget,
  getSyncedPlansForDivision,
  inferPlanScope,
  sortDailySheetsByComingSoon,
} from '../utils/ehudPlanSync';
import { SlotOverlapShower } from '../components/SlotOverlapShower';
import { ClockPopoverDialog } from '../components/ClockTimePicker';
import {
  analyzeDailySlotTimes,
  formatMinutesToClock,
  parseTimeRangeValue,
} from '../utils/timeOverlap';

const formatTelHref = (contact?: string): string | null => {
  if (!contact) return null;
  const cleaned = contact.replace(/[^\d+]/g, '');
  return cleaned.length >= 7 ? `tel:${cleaned}` : null;
};

const PUNCTUALITY_META: Record<
  EhudPunctualityStatus,
  { label: string; textClass: string }
> = {
  ON_TIME: {
    label: 'በሰዓቱ ተጀምሯል',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  SLIGHT_DELAY: {
    label: 'ትንሽ ዘግይቷል',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  DELAYED: {
    label: 'ዘግይቷል / ተስተጓጉሏል',
    textClass: 'text-rose-700 dark:text-rose-400',
  },
};

const FOLLOWUP_STATUS_META: Record<
  EhudFollowUpStatus,
  { label: string; buttonClass: string }
> = {
  OPEN: {
    label: 'ክፍት (Open)',
    buttonClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  },
  IN_PROGRESS: {
    label: 'በሂደት ላይ',
    buttonClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  RESOLVED: {
    label: 'ተፈትቷል',
    buttonClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
};

const SLOT_STATUS_OPTIONS: Array<{
  id: SundaySlotExecutionStatus;
  label: string;
  activeClass: string;
}> = [
  {
    id: 'PENDING',
    label: 'በመጠባበቅ',
    activeClass: 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white',
  },
  {
    id: 'IN_PROGRESS',
    label: 'አሁን (Live)',
    activeClass: 'bg-[#0C4A9E] text-white',
  },
  {
    id: 'COMPLETED',
    label: 'ተፈጽሟል',
    activeClass: 'bg-emerald-600 text-white',
  },
  {
    id: 'DELAYED',
    label: 'ዘግይቷል',
    activeClass: 'bg-amber-600 text-white',
  },
];

type FollowingViewMode = 'PROGRAM_DAY' | 'WEEKLY_YEARLY' | 'LOGS';

interface LocalSlotTrackingOverride {
  executionStatus?: SundaySlotExecutionStatus;
  actualTimeRange?: string;
  followUpNote?: string;
}

const LOCAL_TRACKING_STORAGE_KEY = 'mezgebe_day_slot_tracking_v1';
const LOCAL_LIVE_TIMERS_STORAGE_KEY = 'mezgebe_live_slot_timers_v1';

const DELAY_REASON_PRESETS = [
  'መምህር/አቅራቢ ዘግይተዋል',
  'የድምፅ ማስተካከያ',
  'መዝሙር ረዝሟል',
  'ውይይት ተራዝሟል',
];

const QUICK_OBSERVATION_PRESETS = [
  'ሁሉም ክፍለ-ጊዜዎች በሰዓቱና በስርዓት ተከናውነዋል።',
  'የጉባኤው ተሳትፎ እና መንፈሳዊ ትኩረት ከፍተኛ ነበር።',
  'በድምፅ መሳሪያ ማስተካከያ ምክንያት ትንሽ መዘግየት ታይቷል።',
];

function formatElapsedMmSs(elapsedSec: number): string {
  const safe = Math.max(0, Math.floor(elapsedSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface EhudFollowingScreenProps {
  focusedSheetId?: string | null;
  onFocusSheetChange?: (sheetId: string | null) => void;
  onNavigateToTab?: (tab: BottomNavTab) => void;
}

export const EhudFollowingScreen: React.FC<EhudFollowingScreenProps> = ({
  focusedSheetId,
  onFocusSheetChange,
  onNavigateToTab,
}) => {
  const {
    selectedDivision,
    selectDivision,
    dailyPlanSheets,
    updateDailyPlanSheet,
    toggleDailyPreProgramItem,
    ehudPlans,
    ehudFollowUps,
    createEhudFollowUp,
    updateEhudFollowUp,
    deleteEhudFollowUp,
    childrenAnnualPlan,
    maekelawiyanAnnualPlan,
    youthAnnualPlan,
    scheduleAssignments,
    isSuperAdmin,
    isDeptAdmin,
    canApproveDeptMembers,
    activeMembership,
    currentUser,
    firebaseUser,
  } = useArchive();

  const [viewMode, setViewMode] = useState<FollowingViewMode>('PROGRAM_DAY');
  const [localSelectedSheetId, setLocalSelectedSheetId] = useState<string>(focusedSheetId || '');
  const selectedSheetId =
    focusedSheetId !== undefined ? focusedSheetId || '' : localSelectedSheetId;
  const setSelectedSheetId = (id: string) => {
    setLocalSelectedSheetId(id);
    onFocusSheetChange?.(id || null);
  };

  const [showDaySummaryForm, setShowDaySummaryForm] = useState<boolean>(false);
  const [openNoteSlotId, setOpenNoteSlotId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [liveSlotTimers, setLiveSlotTimers] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_LIVE_TIMERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Local mirror for slot execution when non-admin approved member follows live on the day
  const [localSlotTracking, setLocalSlotTracking] = useState<
    Record<string, Record<string, LocalSlotTrackingOverride>>
  >(() => {
    try {
      const raw = localStorage.getItem(LOCAL_TRACKING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Actual clock time popover for live day-of-program slot timing
  const [activeActualClockSlot, setActiveActualClockSlot] = useState<{
    sheet: SundayDailyPlanSheet;
    slot: SundayTimetableSlot;
  } | null>(null);

  // Weekly / Yearly secondary view state
  const [secondaryScope, setSecondaryScope] = useState<'WEEKLY' | 'YEARLY'>('WEEKLY');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [logScopeFilter, setLogScopeFilter] = useState<'ALL' | EhudPlanScope>('ALL');

  // Inline Day Summary State
  const [dayAttendance, setDayAttendance] = useState<number>(220);
  const [dayPunctuality, setDayPunctuality] = useState<EhudPunctualityStatus>('ON_TIME');
  const [dayObservations, setDayObservations] = useState<string>('');
  const [dayActionItems, setDayActionItems] = useState<string>('');
  const [savingDaySummary, setSavingDaySummary] = useState<boolean>(false);

  // Generic Modal for Weekly/Yearly or custom Follow-up logging
  const [showModal, setShowModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [formScope, setFormScope] = useState<EhudPlanScope>('DAILY');
  const [formTargetId, setFormTargetId] = useState<string>('');
  const [attendanceCount, setAttendanceCount] = useState<number>(220);
  const [punctualityStatus, setPunctualityStatus] = useState<EhudPunctualityStatus>('ON_TIME');
  const [readinessScore, setReadinessScore] = useState<number>(90);
  const [followUpStatus, setFollowUpStatus] = useState<EhudFollowUpStatus>('OPEN');
  const [observations, setObservations] = useState<string>('');
  const [actionItems, setActionItems] = useState<string>('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const canFollowUp =
    isSuperAdmin ||
    isDeptAdmin ||
    canApproveDeptMembers ||
    (activeMembership?.departmentId === 'ehud_merha_gibir' &&
      activeMembership?.status === 'APPROVED') ||
    !firebaseUser;

  const canPersistSheetDirectly =
    isSuperAdmin || isDeptAdmin || canApproveDeptMembers || !firebaseUser;

  const currentAnnualPlan: SundayProgramPlanEntry[] = useMemo(() => {
    if (selectedDivision === 'children') return childrenAnnualPlan;
    if (selectedDivision === 'intermediates') return maekelawiyanAnnualPlan;
    return youthAnnualPlan;
  }, [selectedDivision, childrenAnnualPlan, maekelawiyanAnnualPlan, youthAnnualPlan]);

  const divisionSheets = useMemo(
    () => sortDailySheetsByComingSoon(dailyPlanSheets.filter((s) => s.division === selectedDivision)),
    [dailyPlanSheets, selectedDivision]
  );

  const activeSheet = useMemo(() => {
    if (selectedSheetId) {
      const found = divisionSheets.find((s) => s.id === selectedSheetId);
      if (found) return found;
    }
    return divisionSheets[0];
  }, [divisionSheets, selectedSheetId]);

  // Merge sheet slots with any local tracking overrides so every user sees live day progress
  const trackedSlots: SundayTimetableSlot[] = useMemo(() => {
    if (!activeSheet) return [];
    const sheetOverrides = localSlotTracking[activeSheet.id] || {};
    return activeSheet.slots.map((slot) => {
      const ov = sheetOverrides[slot.id];
      if (!ov) return slot;
      return {
        ...slot,
        executionStatus: ov.executionStatus ?? slot.executionStatus,
        actualTimeRange: ov.actualTimeRange ?? slot.actualTimeRange,
        followUpNote: ov.followUpNote ?? slot.followUpNote,
      };
    });
  }, [activeSheet, localSlotTracking]);

  // Sync Day Summary form defaults when switching sheets
  useEffect(() => {
    if (!activeSheet) return;
    setDayAttendance(activeSheet.postProgramStats?.participantsCount || 220);
    setDayObservations(activeSheet.postProgramStats?.evaluationNotes || '');
    setDayActionItems('');
    setOpenNoteSlotId(null);
  }, [activeSheet?.id]);

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

  const divisionFollowUps = useMemo(
    () => ehudFollowUps.filter((f) => f.division === selectedDivision),
    [ehudFollowUps, selectedDivision]
  );

  const activeDayFollowUps = useMemo(() => {
    if (!activeSheet) return [];
    return divisionFollowUps.filter((f) => f.programSheetId === activeSheet.id);
  }, [divisionFollowUps, activeSheet]);

  const ehudTasks = useMemo(
    () =>
      scheduleAssignments.filter(
        (a) =>
          a.departmentId === 'ehud_merha_gibir' &&
          (!a.division || a.division === selectedDivision)
      ),
    [scheduleAssignments, selectedDivision]
  );

  const activeDayTasks = useMemo(() => {
    if (!activeSheet) return ehudTasks;
    const matching = ehudTasks.filter((t) => t.scheduleProgramId === activeSheet.id);
    return matching.length > 0 ? matching : ehudTasks;
  }, [ehudTasks, activeSheet]);

  // Day-of-program live metrics
  const slotStats = useMemo(() => {
    const total = trackedSlots.length;
    const completed = trackedSlots.filter((s) => s.executionStatus === 'COMPLETED').length;
    const delayed = trackedSlots.filter((s) => s.executionStatus === 'DELAYED').length;
    const liveSlot = trackedSlots.find((s) => s.executionStatus === 'IN_PROGRESS') || null;
    const pct = total > 0 ? Math.round(((completed + delayed) / total) * 100) : 0;
    return { total, completed, delayed, liveSlot, pct };
  }, [trackedSlots]);

  const checklistTotal = activeSheet?.preProgramNeeds.length || 0;
  const checklistDone = activeSheet
    ? activeSheet.preProgramNeeds.filter((n) => activeSheet.preProgramChecklistState?.[n]).length
    : 0;
  const checklistPercent =
    checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  const daySlotAnalysis = useMemo(
    () =>
      activeSheet
        ? analyzeDailySlotTimes(trackedSlots, activeSheet.timeAmharic)
        : null,
    [activeSheet, trackedSlots]
  );

  const filteredSecondaryTargets = useMemo(() => {
    const base = secondaryScope === 'WEEKLY' ? weeklyTargets : yearlyTargets;
    const q = searchQuery.trim().toLowerCase();
    return base.filter((t) => {
      if (secondaryScope === 'WEEKLY' && monthFilter !== 'ALL') {
        if (!t.monthAmharic.includes(monthFilter)) return false;
      }
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.dateAmharic.toLowerCase().includes(q) ||
        (t.squadOrResponsible || '').toLowerCase().includes(q)
      );
    });
  }, [secondaryScope, weeklyTargets, yearlyTargets, searchQuery, monthFilter]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return divisionFollowUps.filter((rec) => {
      if (logScopeFilter !== 'ALL' && inferPlanScope(rec, ehudPlans) !== logScopeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        rec.programTitle.toLowerCase().includes(q) ||
        rec.programDateAmharic.toLowerCase().includes(q) ||
        rec.observations.toLowerCase().includes(q)
      );
    });
  }, [divisionFollowUps, logScopeFilter, ehudPlans, searchQuery]);

  const modalTargets = useMemo(() => {
    if (formScope === 'WEEKLY') return weeklyTargets;
    if (formScope === 'YEARLY') return yearlyTargets;
    return dailyTargets;
  }, [formScope, dailyTargets, weeklyTargets, yearlyTargets]);

  const persistLocalSlotOverride = (
    sheetId: string,
    slotId: string,
    patch: LocalSlotTrackingOverride
  ) => {
    setLocalSlotTracking((prev) => {
      const next = {
        ...prev,
        [sheetId]: {
          ...(prev[sheetId] || {}),
          [slotId]: {
            ...(prev[sheetId]?.[slotId] || {}),
            ...patch,
          },
        },
      };
      try {
        localStorage.setItem(LOCAL_TRACKING_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Tick live stopwatch only while a slot is currently IN_PROGRESS
  useEffect(() => {
    if (!slotStats.liveSlot || !activeSheet) return;
    const key = `${activeSheet.id}_${slotStats.liveSlot.id}`;
    if (!liveSlotTimers[key]) {
      const startedAt = Date.now();
      setLiveSlotTimers((prev) => {
        const next = { ...prev, [key]: startedAt };
        try {
          localStorage.setItem(LOCAL_LIVE_TIMERS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [slotStats.liveSlot?.id, activeSheet?.id]);

  const setSlotLiveStarted = (sheetId: string, slotId: string) => {
    const key = `${sheetId}_${slotId}`;
    const startedAt = Date.now();
    setNowMs(startedAt);
    setLiveSlotTimers((prev) => {
      const next = { ...prev, [key]: startedAt };
      try {
        localStorage.setItem(LOCAL_LIVE_TIMERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const formatCurrentClockNow = (): string => {
    const d = new Date();
    const h24 = d.getHours();
    const m = d.getMinutes();
    // Convert to Ethiopian daytime 12-hour clock heuristic if standard hours, or clean 12h clock
    const h12 = h24 % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')}`;
  };

  const handleUpdateSlotTracking = async (
    sheet: SundayDailyPlanSheet,
    slotId: string,
    patch: LocalSlotTrackingOverride
  ) => {
    if (!canFollowUp) {
      showToast('ክትትል ለመመዝገብ እባክዎ የክፍሉ የጸደቁ አባል ይሁኑ።');
      return;
    }

    if (patch.executionStatus === 'IN_PROGRESS') {
      setSlotLiveStarted(sheet.id, slotId);
    }

    persistLocalSlotOverride(sheet.id, slotId, patch);

    if (canPersistSheetDirectly) {
      const nextSlots = sheet.slots.map((s) =>
        s.id === slotId ? { ...s, ...patch } : s
      );
      try {
        await updateDailyPlanSheet(sheet.id, { slots: nextSlots });
      } catch {
        // already preserved locally
      }
    }
  };

  const handleCompleteLiveSlotWithNow = async (
    sheet: SundayDailyPlanSheet,
    slot: SundayTimetableSlot
  ) => {
    const key = `${sheet.id}_${slot.id}`;
    const startedAtMs = liveSlotTimers[key];
    const nowClock = formatCurrentClockNow();
    let actualStr = slot.actualTimeRange;
    if (startedAtMs) {
      const startD = new Date(startedAtMs);
      const sh = startD.getHours() % 12 || 12;
      const sm = String(startD.getMinutes()).padStart(2, '0');
      actualStr = `${sh}:${sm}–${nowClock}`;
    } else {
      const parsed = parseTimeRangeValue(slot.timeRange);
      if (parsed?.startMin !== undefined) {
        actualStr = `${formatMinutesToClock(parsed.startMin)}–${nowClock}`;
      } else {
        actualStr = nowClock;
      }
    }
    await handleUpdateSlotTracking(sheet, slot.id, {
      executionStatus: 'COMPLETED',
      actualTimeRange: actualStr,
    });
    showToast(`«${slot.slotTitle}» በ${actualStr} ተመዝግቦ ተጠናቋል።`);
  };

  const handleStartOrAdvanceProgram = async () => {
    if (!activeSheet || trackedSlots.length === 0) return;
    if (!canFollowUp) {
      showToast('ክትትል ለመመዝገብ እባክዎ የክፍሉ የጸደቁ አባል ይሁኑ።');
      return;
    }

    const liveIdx = trackedSlots.findIndex((s) => s.executionStatus === 'IN_PROGRESS');
    let nextSlots = [...trackedSlots];
    let message = '';

    if (liveIdx >= 0) {
      const current = nextSlots[liveIdx];
      nextSlots[liveIdx] = {
        ...current,
        executionStatus: 'COMPLETED',
        actualTimeRange: current.actualTimeRange || current.timeRange,
      };
      const nextPendingIdx = nextSlots.findIndex(
        (s, idx) => idx > liveIdx && (!s.executionStatus || s.executionStatus === 'PENDING')
      );
      if (nextPendingIdx >= 0) {
        nextSlots[nextPendingIdx] = {
          ...nextSlots[nextPendingIdx],
          executionStatus: 'IN_PROGRESS',
        };
        setSlotLiveStarted(activeSheet.id, nextSlots[nextPendingIdx].id);
        message = `«${current.slotTitle}» ተጠናቋል · አሁን «${nextSlots[nextPendingIdx].slotTitle}» ተጀምሯል።`;
      } else {
        message = `«${current.slotTitle}» ተጠናቋል!`;
      }
    } else {
      const firstPendingIdx = nextSlots.findIndex(
        (s) => !s.executionStatus || s.executionStatus === 'PENDING'
      );
      if (firstPendingIdx >= 0) {
        nextSlots[firstPendingIdx] = {
          ...nextSlots[firstPendingIdx],
          executionStatus: 'IN_PROGRESS',
        };
        setSlotLiveStarted(activeSheet.id, nextSlots[firstPendingIdx].id);
        message = `«${nextSlots[firstPendingIdx].slotTitle}» አሁን በቀጥታ ተጀምሯል።`;
      } else {
        return;
      }
    }

    for (const s of nextSlots) {
      persistLocalSlotOverride(activeSheet.id, s.id, {
        executionStatus: s.executionStatus,
        actualTimeRange: s.actualTimeRange,
      });
    }

    if (canPersistSheetDirectly) {
      try {
        await updateDailyPlanSheet(activeSheet.id, { slots: nextSlots });
      } catch {
        // preserved locally
      }
    }
    showToast(message);
  };

  const handleResetAllSlotsForSheet = async (sheet: SundayDailyPlanSheet) => {
    if (!canFollowUp) return;
    const resetSlots = sheet.slots.map((s) => ({
      ...s,
      executionStatus: 'PENDING' as SundaySlotExecutionStatus,
    }));
    for (const s of resetSlots) {
      persistLocalSlotOverride(sheet.id, s.id, { executionStatus: 'PENDING' });
    }
    if (canPersistSheetDirectly) {
      try {
        await updateDailyPlanSheet(sheet.id, { slots: resetSlots });
      } catch {
        // preserved locally
      }
    }
    showToast('የዕለቱ የቀጥታ ክትትል ወደ መጀመሪያው ተመልሷል።');
  };

  const handleToggleChecklistItem = async (needItem: string) => {
    if (!activeSheet) return;
    if (!canFollowUp) {
      showToast('ምልክት ለማድረግ እባክዎ የክፍሉ የጸደቁ አባል ይሁኑ።');
      return;
    }
    try {
      await toggleDailyPreProgramItem(activeSheet.id, needItem);
    } catch {
      showToast('ዝግጅቱ በአካባቢ ተመዝግቧል።');
    }
  };

  const handleSaveDaySummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSheet) return;
    setSavingDaySummary(true);

    const combinedReadiness =
      slotStats.total > 0 && checklistTotal > 0
        ? Math.round((slotStats.pct + checklistPercent) / 2)
        : slotStats.total > 0
        ? slotStats.pct
        : checklistPercent || 90;

    const slotNotesSummary = trackedSlots
      .filter((s) => s.followUpNote || s.executionStatus === 'DELAYED')
      .map(
        (s) =>
          `${s.slotTitle} (${s.actualTimeRange || s.timeRange}): ${
            s.followUpNote || (s.executionStatus === 'DELAYED' ? 'ዘግይቷል' : '')
          }`
      )
      .join(' | ');

    const finalObs =
      dayObservations.trim() ||
      slotNotesSummary ||
      `${slotStats.completed}/${slotStats.total} የዕለት ክፍለ-ጊዜዎች ተፈጽመዋል።`;

    const allDone =
      slotStats.total > 0 && slotStats.completed + slotStats.delayed >= slotStats.total;

    try {
      await createEhudFollowUp({
        division: selectedDivision,
        planScope: 'DAILY',
        programSheetId: activeSheet.id,
        programTitle: activeSheet.mainTopic,
        programDateAmharic: activeSheet.dateAmharic,
        attendanceCount: dayAttendance,
        punctualityStatus: dayPunctuality,
        readinessScore: combinedReadiness,
        followUpStatus: allDone ? 'RESOLVED' : 'IN_PROGRESS',
        observations: finalObs,
        actionItems: dayActionItems.trim() || 'በቀጣይ እሁድ የተሻለ ዝግጅት ማድረግ።',
      });

      if (canPersistSheetDirectly) {
        await updateDailyPlanSheet(activeSheet.id, {
          postProgramStats: {
            ...(activeSheet.postProgramStats || {}),
            participantsCount: dayAttendance,
            evaluationNotes: finalObs,
          },
        });
      }
      setShowDaySummaryForm(false);
      showToast('የዕለቱ የቀጥታ ክትትል ሪፖርት ተመዝግቧል!');
    } catch {
      setShowDaySummaryForm(false);
      showToast('የዕለቱ ክትትል በአካባቢ ተቀምጧል።');
    } finally {
      setSavingDaySummary(false);
    }
  };

  const openCreateFollowUpModal = (
    presetScope?: EhudPlanScope,
    presetTarget?: SyncedEhudPlanTarget
  ) => {
    const scope = presetScope || (viewMode === 'WEEKLY_YEARLY' ? secondaryScope : 'DAILY');
    const list =
      scope === 'WEEKLY' ? weeklyTargets : scope === 'YEARLY' ? yearlyTargets : dailyTargets;
    const target = presetTarget || list[0];
    setFormScope(scope);
    setFormTargetId(target?.id || '');
    setAttendanceCount(target?.dailySheet?.postProgramStats?.participantsCount || 220);
    setPunctualityStatus('ON_TIME');
    setReadinessScore(90);
    setFollowUpStatus('IN_PROGRESS');
    setObservations('');
    setActionItems('');
    setShowModal(true);
  };

  const handleModalScopeChange = (nextScope: EhudPlanScope) => {
    setFormScope(nextScope);
    const list =
      nextScope === 'WEEKLY' ? weeklyTargets : nextScope === 'YEARLY' ? yearlyTargets : dailyTargets;
    setFormTargetId(list[0]?.id || '');
  };

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTarget =
      modalTargets.find((t) => t.id === formTargetId) || modalTargets[0];
    setSaving(true);
    try {
      await createEhudFollowUp({
        division: selectedDivision,
        planScope: formScope,
        programSheetId: selectedTarget?.id || formTargetId || 'general_sunday',
        programTitle: selectedTarget?.title || 'የእሁድ መደበኛ መርሐ ግብር',
        programDateAmharic: selectedTarget?.dateAmharic || 'ኅዳር 2019 ዓ.ም.',
        attendanceCount,
        punctualityStatus,
        readinessScore,
        followUpStatus,
        observations: observations.trim() || 'መደበኛ ክትትል ተከናውኗል።',
        actionItems: actionItems.trim() || 'ቀጣይ እሁድ ክትትል ይደረጋል።',
      });
      setShowModal(false);
      showToast('የመርሐ ግብር ክትትል መዝገብ ተቀምጧል!');
    } catch {
      setShowModal(false);
      showToast('ክትትሉ በአካባቢ ተቀምጧል።');
    } finally {
      setSaving(false);
    }
  };

  const handleCycleFollowUpStatus = async (
    id: string,
    current: EhudFollowUpStatus
  ) => {
    const next: EhudFollowUpStatus =
      current === 'OPEN' ? 'IN_PROGRESS' : current === 'IN_PROGRESS' ? 'RESOLVED' : 'OPEN';
    try {
      await updateEhudFollowUp(id, { followUpStatus: next });
      showToast(`የክትትል ሁኔታ ወደ «${FOLLOWUP_STATUS_META[next].label}» ተቀይሯል።`);
    } catch {
      showToast('የሁኔታ ለውጥ በአካባቢ ተቀምጧል።');
    }
  };

  const hasMoreSlotsToRun = trackedSlots.some(
    (s) => !s.executionStatus || s.executionStatus === 'PENDING' || s.executionStatus === 'IN_PROGRESS'
  );

  return (
    <div className="min-h-screen pb-28 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      <AppHeader
        title="ክትትል • የዕለቱ መርሐ ግብር (Following)"
        subtitle="በመርሐ ግብሩ ዕለት የታቀዱ ሰዓታትን እና ዝግጅቶችን በቀጥታ መከታተያ"
        showDepartmentSwitcher={false}
      />

      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-3.5 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2.5 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{toast}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Ultra-Modern Workspace Control Header + Unboxed Live Metrics */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Segmented Division Switcher */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 gap-1 self-start overflow-x-auto max-w-full">
              {[
                { id: 'youth' as const, label: 'ወጣት', dot: 'bg-[#8B0000]' },
                { id: 'children' as const, label: 'ሕፃናት', dot: 'bg-[#D97706]' },
                { id: 'intermediates' as const, label: 'ማዕከላውያን', dot: 'bg-[#0C4A9E]' },
              ].map((div) => {
                const isActive = selectedDivision === div.id;
                return (
                  <button
                    key={div.id}
                    type="button"
                    onClick={() => {
                      selectDivision(div.id);
                      setSelectedSheetId('');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-white dark:bg-[#162338] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${div.dot} ${isActive ? 'opacity-100' : 'opacity-45'}`} />
                    <span>{div.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Unboxed Editorial Live Metrics + Primary CTA */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
              <div className="hidden sm:flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">ክፍለ-ጊዜዎች</span>
                  <span className="font-mono tabular-nums font-semibold text-sm text-slate-900 dark:text-white">
                    {slotStats.completed}/{slotStats.total} ({slotStats.pct}%)
                  </span>
                </div>
                <span className="w-px h-6 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-slate-400 block">ቅድመ-ዝግጅት</span>
                  <span className="font-mono tabular-nums font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                    {checklistDone}/{checklistTotal} ({checklistPercent}%)
                  </span>
                </div>
                <span className="w-px h-6 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                <div className="max-w-[160px]">
                  <span className="text-[11px] text-slate-400 block">አሁን (Live)</span>
                  <span className="font-semibold text-xs text-[#0C4A9E] dark:text-[#7FAFFF] truncate block">
                    {slotStats.liveSlot
                      ? slotStats.liveSlot.slotTitle
                      : slotStats.completed > 0 && slotStats.completed === slotStats.total
                      ? 'ተጠናቋል'
                      : 'ለመጀመር ዝግጁ'}
                  </span>
                </div>
                <span className="w-px h-6 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-slate-400 block">ተሳታፊ · ሪፖርት</span>
                  <span className="font-mono tabular-nums font-semibold text-sm text-slate-900 dark:text-white">
                    {activeSheet?.postProgramStats?.participantsCount || dayAttendance} · {activeDayFollowUps.length}
                  </span>
                </div>
              </div>

              {canFollowUp && (
                <button
                  type="button"
                  onClick={() =>
                    viewMode === 'PROGRAM_DAY' && activeSheet
                      ? setShowDaySummaryForm((prev) => !prev)
                      : openCreateFollowUpModal()
                  }
                  className="px-4 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>የዕለቱን ክትትል ሪፖርት መዝግብ</span>
                </button>
              )}
            </div>
          </div>

          {/* Hairline 3-Mode Workspace Switcher */}
          <nav
            aria-label="የክትትል ክፍሎች"
            className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setViewMode('PROGRAM_DAY')}
              className={`relative pb-3 pt-1 flex items-center gap-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors border-b-2 -mb-px ${
                viewMode === 'PROGRAM_DAY'
                  ? 'border-[#8B0000] text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sun className={`w-3.5 h-3.5 ${viewMode === 'PROGRAM_DAY' ? 'text-[#8B0000] dark:text-[#FF8A80]' : 'text-slate-400'}`} />
              <span>በዕለቱ የቀጥታ ክትትል (Program Day)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('WEEKLY_YEARLY')}
              className={`relative pb-3 pt-1 flex items-center gap-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors border-b-2 -mb-px ${
                viewMode === 'WEEKLY_YEARLY'
                  ? 'border-[#0C4A9E] text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${viewMode === 'WEEKLY_YEARLY' ? 'text-[#0C4A9E] dark:text-[#7FAFFF]' : 'text-slate-400'}`} />
              <span>ሳምንታዊ እና ዓመታዊ ዕቅድ ክትትል</span>
              <span className="font-mono tabular-nums text-[11px] text-slate-400">
                {weeklyTargets.length + yearlyTargets.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LOGS')}
              className={`relative pb-3 pt-1 flex items-center gap-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors border-b-2 -mb-px ${
                viewMode === 'LOGS'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ListChecks className={`w-3.5 h-3.5 ${viewMode === 'LOGS' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
              <span>የክትትል ሪፖርቶች መዝገብ</span>
              <span className="font-mono tabular-nums text-[11px] text-slate-400">
                {divisionFollowUps.length}
              </span>
            </button>
          </nav>
        </div>

        {/* ================================================================= */}
        {/* VIEW 1: PROGRAM DAY LIVE TRACKER (12-COL STUDIO + COMPANION RAIL) */}
        {/* ================================================================= */}
        {viewMode === 'PROGRAM_DAY' && (
          <div className="space-y-4">
            {onNavigateToTab && activeSheet && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      onFocusSheetChange?.(activeSheet.id);
                      onNavigateToTab('EHUD_PLANNING');
                    }}
                    className="font-medium hover:text-[#8B0000] dark:hover:text-[#FF8A80] cursor-pointer whitespace-nowrap"
                  >
                    1. ዕቅድ
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                  <span className="font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                    2. በዕለቱ ክትትል
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                  <button
                    type="button"
                    onClick={() => {
                      onFocusSheetChange?.(activeSheet.id);
                      onNavigateToTab('EHUD_RATING');
                    }}
                    className="font-medium hover:text-[#B88500] dark:hover:text-[#FFD54F] cursor-pointer whitespace-nowrap"
                  >
                    3. ደረጃ ስጥ
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onFocusSheetChange?.(activeSheet.id);
                    onNavigateToTab('EHUD_RATING');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#B88500] hover:bg-[#966C00] text-white text-[11px] font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  <Star className="w-3 h-3" />
                  <span>ወደ ደረጃ መስጫ ሂድ</span>
                </button>
              </div>
            )}

            {!activeSheet ? (
              <div className="rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 p-10 text-center text-xs text-slate-500">
                ለዚህ ክፍል በዕለቱ የሚከታተሉት የእሁድ መርሐ ግብር ሉህ ገና አልተፈጠረም።
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT 8 COLS: LIVE RUN-OF-SHOW EXECUTION CANVAS */}
                <section
                  aria-label="የዕለቱ መርሐ ግብር የቀጥታ ክትትል"
                  className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden"
                >
                  {/* Program Day Hero Header */}
                  <div className="px-5 sm:px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#8B0000] dark:text-[#FF8A80]">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              slotStats.liveSlot
                                ? 'bg-[#0C4A9E] animate-pulse'
                                : 'bg-[#8B0000] dark:bg-[#FF8A80]'
                            }`}
                          />
                          {activeSheet.id === divisionSheets[0]?.id
                            ? 'የዕለቱ / ቀጣይ መርሐ ግብር'
                            : 'የተመረጠ የመርሐ ግብር ዕለት'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeSheet.dateAmharic}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                          {activeSheet.timeAmharic}
                        </span>
                        {activeSheet.leader && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              መሪ፦ {activeSheet.leader}
                            </span>
                          </>
                        )}
                        {activeSheet.presenterOrTeacher && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">
                              አቅራቢ፦ {activeSheet.presenterOrTeacher}
                            </span>
                          </>
                        )}
                        {activeSheet.presenterContact && (() => {
                          const telHref = formatTelHref(activeSheet.presenterContact);
                          return (
                            <>
                              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                              {telHref ? (
                                <a
                                  href={telHref}
                                  className="inline-flex items-center gap-1 font-mono tabular-nums text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                                >
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span>{activeSheet.presenterContact}</span>
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span>{activeSheet.presenterContact}</span>
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={activeSheet.id}
                          onChange={(e) => setSelectedSheetId(e.target.value)}
                          aria-label="የመርሐ ግብር ዕለት ይምረጡ"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 max-w-[240px]"
                        >
                          {divisionSheets.map((sheet, idx) => (
                            <option key={sheet.id} value={sheet.id}>
                              {idx === 0 ? '★ ' : ''}{sheet.dateAmharic} — {sheet.mainTopic}
                            </option>
                          ))}
                        </select>

                        {canFollowUp && hasMoreSlotsToRun && (
                          <button
                            type="button"
                            onClick={handleStartOrAdvanceProgram}
                            className="px-3.5 py-1.5 rounded-lg bg-[#8B0000] hover:bg-[#6e0000] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                          >
                            {slotStats.liveSlot ? (
                              <>
                                <SkipForward className="w-3.5 h-3.5" />
                                <span>ጨርስና ቀጣዩን ጀምር</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                <span>መርሐ ግብሩን ጀምር</span>
                              </>
                            )}
                          </button>
                        )}

                        {canFollowUp && (slotStats.completed > 0 || slotStats.delayed > 0 || slotStats.liveSlot) && (
                          <button
                            type="button"
                            onClick={() => handleResetAllSlotsForSheet(activeSheet)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                            title="ክትትሉን ዳግም አስጀምር"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight text-balance">
                        {activeSheet.mainTopic}
                      </h2>

                      {/* Sleek Live Progress Bar */}
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                          የዕለቱ ሂደት
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-300"
                            style={{ width: `${slotStats.pct}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                          {slotStats.completed}/{slotStats.total} ({slotStats.pct}%)
                        </span>
                      </div>
                    </div>

                    {/* Active Live Session Pacer Spotlight */}
                    {slotStats.liveSlot && (() => {
                      const liveSlot = slotStats.liveSlot;
                      const timerKey = `${activeSheet.id}_${liveSlot.id}`;
                      const startedAt = liveSlotTimers[timerKey] || nowMs;
                      const elapsedSec = Math.max(0, Math.floor((nowMs - startedAt) / 1000));
                      const plannedDurMin =
                        daySlotAnalysis?.bySlotId[liveSlot.id]?.durationMin ||
                        parseTimeRangeValue(liveSlot.timeRange)?.durationMin ||
                        15;
                      const plannedSec = plannedDurMin * 60;
                      const pacePct = Math.min(100, Math.round((elapsedSec / Math.max(60, plannedSec)) * 100));
                      const overSec = elapsedSec - plannedSec;
                      const isOvertime = overSec > 0;
                      const isNearEnd = !isOvertime && plannedSec - elapsedSec <= 180;

                      return (
                        <div
                          className={`rounded-xl border p-3.5 space-y-2.5 transition-colors ${
                            isOvertime
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                              : isNearEnd
                              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="inline-flex items-center gap-1.5 font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                                  <Timer className="w-3.5 h-3.5" />
                                  <span>አሁን በመካሄድ ላይ</span>
                                </span>
                                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                                  የታቀደ {plannedDurMin} ደቂቃ ({liveSlot.timeRange})
                                </span>
                              </div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {liveSlot.slotTitle}
                                {liveSlot.inCharge ? ` · ${liveSlot.inCharge}` : ''}
                                {liveSlot.inChargeContact ? ` (${liveSlot.inChargeContact})` : ''}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span
                                  className={`text-lg font-mono tabular-nums font-bold block leading-none ${
                                    isOvertime
                                      ? 'text-rose-600 dark:text-rose-400'
                                      : isNearEnd
                                      ? 'text-amber-700 dark:text-amber-300'
                                      : 'text-[#0C4A9E] dark:text-[#7FAFFF]'
                                  }`}
                                >
                                  {formatElapsedMmSs(elapsedSec)}
                                </span>
                                <span className="text-[10px] font-mono tabular-nums text-slate-500">
                                  {isOvertime
                                    ? `+${Math.ceil(overSec / 60)}m አልፏል`
                                    : `${Math.max(0, Math.ceil((plannedSec - elapsedSec) / 60))}m ቀርቷል`}
                                </span>
                              </div>

                              {canFollowUp && (
                                <button
                                  type="button"
                                  onClick={() => handleCompleteLiveSlotWithNow(activeSheet, liveSlot)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                                >
                                  ✓ አሁን ጨርስ
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="h-1.5 rounded-full bg-white/80 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isOvertime
                                  ? 'bg-rose-600'
                                  : isNearEnd
                                  ? 'bg-amber-500'
                                  : 'bg-[#0C4A9E]'
                              }`}
                              style={{ width: `${pacePct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Slots Run-of-Show Subheader */}
                  <div className="px-5 sm:px-6 py-2.5 bg-slate-50/50 dark:bg-slate-900/25 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      በመርሐ ግብሩ ሰዓት የታቀዱ ክፍለ-ጊዜዎች የቀጥታ ክትትል
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      የታቀደ vs የተፈጸመ ሰዓት · {trackedSlots.length} ክፍሎች
                    </span>
                  </div>

                  {trackedSlots.length > 0 && (
                    <SlotOverlapShower
                      slots={trackedSlots}
                      programTimeRange={activeSheet.timeAmharic}
                      onSlotClick={
                        canFollowUp
                          ? (slot) => setActiveActualClockSlot({ sheet: activeSheet, slot })
                          : undefined
                      }
                    />
                  )}

                  {trackedSlots.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                      {trackedSlots.map((slot, sIdx) => {
                        const status: SundaySlotExecutionStatus = slot.executionStatus || 'PENDING';
                        const isLive = status === 'IN_PROGRESS';
                        const isDone = status === 'COMPLETED';
                        const isDelayed = status === 'DELAYED';
                        const analyzed = daySlotAnalysis?.bySlotId[slot.id];
                        const liveAsgn = scheduleAssignments.find(
                          (a) =>
                            a.departmentId === 'ehud_merha_gibir' &&
                            a.scheduleProgramId === activeSheet.id &&
                            a.agendaSlotId === slot.id
                        );
                        const isNoteOpen = openNoteSlotId === slot.id;

                        return (
                          <div
                            key={slot.id}
                            className={`px-5 sm:px-6 py-3.5 transition-colors ${
                              isLive
                                ? 'bg-blue-50/55 dark:bg-blue-950/25'
                                : analyzed?.hasOverlap
                                ? 'bg-rose-50/40 dark:bg-rose-950/15'
                                : isDone
                                ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                                : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                              {/* Left: Index + Title + Lead + Note */}
                              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                <span
                                  className={`text-xs font-mono tabular-nums font-semibold w-5 pt-0.5 shrink-0 ${
                                    isLive
                                      ? 'text-[#0C4A9E] dark:text-[#7FAFFF]'
                                      : isDone
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {String(sIdx + 1).padStart(2, '0')}
                                </span>

                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span
                                      className={`text-[13px] font-semibold ${
                                        isDone
                                          ? 'text-slate-500 dark:text-slate-400 line-through decoration-emerald-500/50'
                                          : 'text-slate-900 dark:text-white'
                                      }`}
                                    >
                                      {slot.slotTitle}
                                    </span>
                                    {isLive && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0C4A9E] animate-pulse" />
                                        <span>በመካሄድ ላይ</span>
                                      </span>
                                    )}
                                    {analyzed?.hasOverlap && (
                                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>የሰዓት መደራረብ</span>
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span>
                                      የታቀደ፦{' '}
                                      <strong className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-200">
                                        {slot.timeRange}
                                      </strong>
                                    </span>
                                    {(slot.inCharge || liveAsgn) && (
                                      <span>
                                        · {liveAsgn ? `ተመድቧል፦ ${liveAsgn.responsibleLeadName}` : slot.inCharge}
                                      </span>
                                    )}
                                    {slot.inChargeContact && (() => {
                                      const telHref = formatTelHref(slot.inChargeContact);
                                      return telHref ? (
                                        <a
                                          href={telHref}
                                          className="inline-flex items-center gap-1 font-mono tabular-nums text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                                        >
                                          <Phone className="w-3 h-3 shrink-0" />
                                          <span>{slot.inChargeContact}</span>
                                        </a>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                                          <Phone className="w-3 h-3 shrink-0" />
                                          <span>{slot.inChargeContact}</span>
                                        </span>
                                      );
                                    })()}
                                    {slot.followUpNote && (
                                      <span className="text-[#0C4A9E] dark:text-[#7FAFFF]">
                                        · {slot.followUpNote}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Actual Clock Button + Segmented Status Switch + Note */}
                              <div className="flex flex-wrap items-center gap-2 shrink-0 pl-8 xl:pl-0">
                                {canFollowUp ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveActualClockSlot({ sheet: activeSheet, slot })
                                    }
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono tabular-nums font-semibold cursor-pointer transition-colors ${
                                      slot.actualTimeRange
                                        ? 'border-[#0C4A9E]/35 bg-blue-50/70 dark:bg-blue-950/30 text-[#0C4A9E] dark:text-[#7FAFFF]'
                                        : 'border-slate-200/90 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-[#8B0000]'
                                    }`}
                                    title="የተፈጸመበትን ትክክለኛ ሰዓት በሰዓት (Clock) ይመዝግቡ"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-[#8B0000] dark:text-[#FF8A80]" />
                                    <span>{slot.actualTimeRange || 'ትክክለኛ ሰዓት'}</span>
                                  </button>
                                ) : (
                                  <span className="text-xs font-mono tabular-nums text-slate-500">
                                    {slot.actualTimeRange || slot.timeRange}
                                  </span>
                                )}

                                {canFollowUp && (
                                  <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 gap-0.5">
                                    {SLOT_STATUS_OPTIONS.map((opt) => {
                                      const active = status === opt.id;
                                      return (
                                        <button
                                          key={opt.id}
                                          type="button"
                                          onClick={() =>
                                            handleUpdateSlotTracking(activeSheet, slot.id, {
                                              executionStatus: opt.id,
                                              actualTimeRange:
                                                opt.id === 'COMPLETED' && !slot.actualTimeRange
                                                  ? slot.timeRange
                                                  : slot.actualTimeRange,
                                            })
                                          }
                                          className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                                            active
                                              ? opt.activeClass
                                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                          }`}
                                        >
                                          {opt.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {canFollowUp && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isNoteOpen) {
                                        setOpenNoteSlotId(null);
                                      } else {
                                        setOpenNoteSlotId(slot.id);
                                        setNoteDraft(slot.followUpNote || '');
                                      }
                                    }}
                                    className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                      slot.followUpNote || isNoteOpen
                                        ? 'border-[#0C4A9E]/35 text-[#0C4A9E] dark:text-[#7FAFFF] bg-blue-50/60 dark:bg-blue-950/30'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                                    title="ለዚህ ክፍለ-ጊዜ ማስታወሻ ጨምር"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {isNoteOpen && canFollowUp && (
                              <div className="mt-3 pl-8 space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {DELAY_REASON_PRESETS.map((reason) => (
                                    <button
                                      key={reason}
                                      type="button"
                                      onClick={() => setNoteDraft(reason)}
                                      className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#0C4A9E] text-[10px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                                    >
                                      {reason}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={noteDraft}
                                    onChange={(e) => setNoteDraft(e.target.value)}
                                    placeholder="በዚህ ክፍለ-ጊዜ የታየ ሁኔታ (ለምሳሌ፡ በሰዓቱ ተጀምሯል / 5 ደቂቃ ዘግይቷል)..."
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await handleUpdateSlotTracking(activeSheet, slot.id, {
                                        followUpNote: noteDraft.trim(),
                                      });
                                      setOpenNoteSlotId(null);
                                      showToast('የክፍለ-ጊዜ ማስታወሻ ተቀምጧል።');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                                  >
                                    አስቀምጥ
                                  </button>
                                </div>
                              </div>
                            )}

                            {isDelayed && !slot.followUpNote && !isNoteOpen && canFollowUp && (
                              <div className="mt-2 pl-8 flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span className="text-amber-700 dark:text-amber-400 font-medium">
                                  ፈጣን ምክንያት፦
                                </span>
                                {DELAY_REASON_PRESETS.map((reason) => (
                                  <button
                                    key={reason}
                                    type="button"
                                    onClick={() =>
                                      handleUpdateSlotTracking(activeSheet, slot.id, {
                                        followUpNote: reason,
                                      })
                                    }
                                    className="px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 cursor-pointer text-[10px] font-medium"
                                  >
                                    {reason}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-6 py-8 text-xs text-slate-500 text-center">
                      ለዚህ ዕለት የተዘረዘሩ የሰዓት ክፍለ-ጊዜዎች የሉም።
                    </p>
                  )}
                </section>

                {/* RIGHT 4 COLS: PRE-PROGRAM READINESS & DAY SUMMARY COMPANION RAIL */}
                <aside className="lg:col-span-4 space-y-5">
                  {/* Panel 1: Pre-Program Checklist & Organizer Tasks */}
                  <div className="rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        1. ከመርሐ ግብሩ በፊት ዝግጅት
                      </span>
                      <span className="font-mono tabular-nums text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {checklistDone}/{checklistTotal} ({checklistPercent}%)
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300"
                          style={{ width: `${checklistPercent}%` }}
                        />
                      </div>

                      {activeSheet.preProgramNeeds.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                          {activeSheet.preProgramNeeds.map((need, idx) => {
                            const checked = Boolean(activeSheet.preProgramChecklistState?.[need]);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleToggleChecklistItem(need)}
                                className="w-full py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/30 cursor-pointer"
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  {checked ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                                  )}
                                  <span
                                    className={`text-xs truncate ${
                                      checked
                                        ? 'line-through text-slate-400'
                                        : 'font-medium text-slate-700 dark:text-slate-200'
                                    }`}
                                  >
                                    {need}
                                  </span>
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 shrink-0">
                                  {checked ? 'ተዘጋጅቷል' : 'ይጠበቃል'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">የቅድመ-ዝግጅት ዝርዝር የለም።</p>
                      )}

                      {/* Assigned Organizer Tasks */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            የአዘጋጆች ሥራዎች
                          </span>
                          <span className="font-mono tabular-nums text-slate-400">
                            {activeDayTasks.filter((t) => t.status === 'COMPLETED').length}/{activeDayTasks.length}
                          </span>
                        </div>
                        {activeDayTasks.length > 0 ? (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                            {activeDayTasks.slice(0, 5).map((task) => {
                              const cfg = SCHEDULE_TASK_STATUS_CONFIG[task.status];
                              return (
                                <div key={task.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                      {task.title}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">
                                      {task.responsibleLeadName}
                                    </p>
                                  </div>
                                  <span className={`text-[10px] font-semibold shrink-0 ${cfg.colorClass}`}>
                                    {cfg.amharicLabel}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400">ለዚህ ዕለት የተመደቡ ሥራዎች የሉም።</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Panel 2: Day Summary & Live Reports */}
                  <div className="rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          3. የዕለቱ ማጠቃለያ ሪፖርት
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {activeDayFollowUps.length > 0
                            ? `${activeDayFollowUps.length} ሪፖርት ተመዝግቧል`
                            : 'ገና ሪፖርት አልተመዘገበም'}
                        </span>
                      </div>

                      {canFollowUp && (
                        <button
                          type="button"
                          onClick={() => setShowDaySummaryForm((prev) => !prev)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-xs font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                        >
                          {showDaySummaryForm ? 'ቅጹን ዝጋ' : 'ማጠቃለያ መዝግብ'}
                        </button>
                      )}
                    </div>

                    {/* LIVE ATTENDANCE QUICK TALLY CARD */}
                    <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-slate-50/40 dark:bg-slate-900/20">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                          የዕለቱ ተሳታፊ ብዛት (Attendance)
                        </span>
                        <span className="text-lg font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                          {dayAttendance}
                        </span>
                      </div>
                      {canFollowUp && (
                        <div className="flex items-center gap-1">
                          {[-5, -1, 1, 5, 10].map((delta) => (
                            <button
                              key={delta}
                              type="button"
                              onClick={() => setDayAttendance((prev) => Math.max(0, prev + delta))}
                              className={`px-2 py-1 rounded-md border text-[11px] font-mono tabular-nums font-semibold cursor-pointer transition-colors ${
                                delta > 0
                                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {delta > 0 ? `+${delta}` : delta}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {showDaySummaryForm && canFollowUp && (
                      <form
                        onSubmit={handleSaveDaySummary}
                        className="p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/40 dark:bg-slate-900/20"
                      >
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              የተሳታፊ ብዛት
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={10000}
                              value={dayAttendance}
                              onChange={(e) => setDayAttendance(Number(e.target.value) || 0)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              የሰዓት አከባበር
                            </label>
                            <select
                              value={dayPunctuality}
                              onChange={(e) =>
                                setDayPunctuality(e.target.value as EhudPunctualityStatus)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <option value="ON_TIME">በሰዓቱ ተጀምሯል</option>
                              <option value="SLIGHT_DELAY">ትንሽ ዘግይቷል</option>
                              <option value="DELAYED">ዘግይቷል / ተስተጓጉሏል</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            በዕለቱ የታዩ ምልከታዎች
                          </label>
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {QUICK_OBSERVATION_PRESETS.map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() =>
                                  setDayObservations((prev) =>
                                    prev.includes(preset)
                                      ? prev
                                      : prev.trim()
                                      ? `${prev.trim()} ${preset}`
                                      : preset
                                  )
                                }
                                className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#0C4A9E] text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer text-left"
                              >
                                + {preset.slice(0, 24)}...
                              </button>
                            ))}
                          </div>
                          <textarea
                            rows={2}
                            value={dayObservations}
                            onChange={(e) => setDayObservations(e.target.value)}
                            placeholder="መርሐ ግብሩ እንዴት እንደተካሄደ..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            ለቀጣይ እሁድ የሚወሰድ እርምጃ
                          </label>
                          <textarea
                            rows={2}
                            value={dayActionItems}
                            onChange={(e) => setDayActionItems(e.target.value)}
                            placeholder="መስተካከል ያለባቸው ነጥቦች..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDaySummaryForm(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                          >
                            ሰርዝ
                          </button>
                          <button
                            type="submit"
                            disabled={savingDaySummary}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingDaySummary ? 'በማስቀመጥ ላይ...' : 'ሪፖርት አስቀምጥ'}</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {activeDayFollowUps.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                        {activeDayFollowUps.map((rec) => {
                          const pMeta = PUNCTUALITY_META[rec.punctualityStatus];
                          const fMeta = FOLLOWUP_STATUS_META[rec.followUpStatus];
                          return (
                            <div key={rec.id} className="p-4 space-y-1.5">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className={`font-semibold ${pMeta.textClass}`}>
                                  {pMeta.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCycleFollowUpStatus(rec.id, rec.followUpStatus)}
                                  className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold cursor-pointer ${fMeta.buttonClass}`}
                                  title="ሁኔታውን ለመቀየር ይጫኑ"
                                >
                                  {fMeta.label}
                                </button>
                              </div>
                              <p className="text-[11px] font-mono tabular-nums text-slate-500">
                                ተሳታፊ {rec.attendanceCount} · ዝግጁነት {rec.readinessScore}% · {rec.recordedByName}
                              </p>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                {rec.observations}
                              </p>
                              {rec.actionItems && (
                                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                                  ቀጣይ እርምጃ፦ {rec.actionItems}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      !showDaySummaryForm && (
                        <div className="p-5 text-xs text-slate-400 text-center">
                          መርሐ ግብሩ ሲጠናቀቅ የዕለቱን ተሳታፊ እና ምልከታ እዚህ ይመዝግቡ።
                        </div>
                      )
                    )}
                  </div>
                </aside>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: WEEKLY & YEARLY SYNCED PLANS FOLLOW-UP                    */}
        {/* ================================================================= */}
        {viewMode === 'WEEKLY_YEARLY' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 gap-1 self-start">
                <button
                  type="button"
                  onClick={() => setSecondaryScope('WEEKLY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    secondaryScope === 'WEEKLY'
                      ? 'bg-[#0C4A9E] text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ሳምንታዊ ዕቅዶች ({weeklyTargets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSecondaryScope('YEARLY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    secondaryScope === 'YEARLY'
                      ? 'bg-[#B88500] text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ዓመታዊ ዕቅዶች ({yearlyTargets.length})
                </button>
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ሳምንታዊ ወይም ዓመታዊ ዕቅድ ይፈልጉ..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {secondaryScope === 'WEEKLY' && (
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => setMonthFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
                    monthFilter === 'ALL'
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
                    onClick={() => setMonthFilter(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
                      monthFilter === m
                        ? 'bg-[#0C4A9E] text-white border-[#0C4A9E]'
                        : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSecondaryTargets.map((item) => {
                const relatedLogs = divisionFollowUps.filter(
                  (f) => f.programSheetId === item.id
                );
                const latestLog = relatedLogs[0];

                return (
                  <div
                    key={item.id}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                          {item.dateAmharic}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.squadOrResponsible || 'ተረኛ ምድብ'}</span>
                        {latestLog && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                              {FOLLOWUP_STATUS_META[latestLog.followUpStatus].label} ({latestLog.readinessScore}%)
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.linkedDailySheet && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSheetId(item.linkedDailySheet!.id);
                            setViewMode('PROGRAM_DAY');
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                        >
                          ወደ ዕለቱ ክትትል →
                        </button>
                      )}
                      {canFollowUp && (
                        <button
                          type="button"
                          onClick={() => openCreateFollowUpModal(secondaryScope, item)}
                          className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>ክትትል መዝግብ</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: FOLLOW-UP LOGS ARCHIVE                                    */}
        {/* ================================================================= */}
        {viewMode === 'LOGS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 gap-1 self-start">
                {(
                  [
                    { id: 'ALL', label: 'ሁሉም' },
                    { id: 'DAILY', label: 'ዕለታዊ' },
                    { id: 'WEEKLY', label: 'ሳምንታዊ' },
                    { id: 'YEARLY', label: 'ዓመታዊ' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLogScopeFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      logScopeFilter === f.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="በርዕስ፣ በቀን ወይም በምልከታ ይፈልጉ..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-8 text-center">
                <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  የክትትል ሪፖርት አልተገኘም
                </h4>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((rec) => {
                  const punctuality = PUNCTUALITY_META[rec.punctualityStatus];
                  const fStatus = FOLLOWUP_STATUS_META[rec.followUpStatus];
                  const scopeMeta = EHUD_SCOPE_META[inferPlanScope(rec, ehudPlans)];
                  const canDelete =
                    isSuperAdmin ||
                    isDeptAdmin ||
                    canApproveDeptMembers ||
                    rec.recordedBy === currentUser.id ||
                    rec.recordedBy === 'system_seed';

                  return (
                    <div
                      key={rec.id}
                      className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                            <span className="font-bold text-[#8B0000] dark:text-[#FF8A80]">
                              {scopeMeta.shortLabel}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                            <span className="font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                              {rec.programDateAmharic}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                            <span className={`font-semibold ${punctuality.textClass}`}>
                              {punctuality.label}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {rec.programTitle}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">ተሳታፊ</span>
                            <span className="text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                              {rec.attendanceCount}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">ዝግጁነት</span>
                            <span className="text-xs font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                              {rec.readinessScore}%
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCycleFollowUpStatus(rec.id, rec.followUpStatus)}
                            title="ሁኔታውን ለመቀየር ይጫኑ"
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${fStatus.buttonClass}`}
                          >
                            {fStatus.label}
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => deleteEhudFollowUp(rec.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              title="ሰርዝ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            የታዩ ምልከታዎች
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {rec.observations}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                            ቀጣይ እርምጃዎች
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {rec.actionItems}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>መዝጋቢ፦ {rec.recordedByName}</span>
                        <span className="font-mono tabular-nums">
                          {new Date(rec.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LOG FOLLOW-UP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                የዕለታዊ / ሳምንታዊ / ዓመታዊ ዕቅድ ክትትል መመዝገቢያ
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="p-4 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
                {(['DAILY', 'WEEKLY', 'YEARLY'] as EhudPlanScope[]).map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => handleModalScopeChange(sc)}
                    className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      formScope === sc
                        ? EHUD_SCOPE_META[sc].activeTabClass
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {EHUD_SCOPE_META[sc].shortLabel}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተከታተሉት {EHUD_SCOPE_META[formScope].shortLabel} ዕቅድ
                </label>
                <select
                  value={formTargetId}
                  onChange={(e) => setFormTargetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  {modalTargets.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.dateAmharic} — {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የተሳታፊ ብዛት
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={attendanceCount}
                    onChange={(e) => setAttendanceCount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የዝግጅት / አፈጻጸም ነጥብ (0–100%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={readinessScore}
                    onChange={(e) => setReadinessScore(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የሰዓት አከባበር (Punctuality)
                  </label>
                  <select
                    value={punctualityStatus}
                    onChange={(e) =>
                      setPunctualityStatus(e.target.value as EhudPunctualityStatus)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="ON_TIME">በሰዓቱ ተጀምሯል</option>
                    <option value="SLIGHT_DELAY">ትንሽ ዘግይቷል</option>
                    <option value="DELAYED">ዘግይቷል</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የክትትል ሁኔታ
                  </label>
                  <select
                    value={followUpStatus}
                    onChange={(e) =>
                      setFollowUpStatus(e.target.value as EhudFollowUpStatus)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="OPEN">ክፍት (Open)</option>
                    <option value="IN_PROGRESS">በሂደት ላይ</option>
                    <option value="RESOLVED">ተፈትቷል</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ምልከታና አስተያየት (Observations)
                </label>
                <textarea
                  rows={2}
                  required
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="በመርሐ ግብሩ ወቅት የታዩ ጥንካሬዎችና ክፍተቶች..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ቀጣይ እርምጃዎች (Action Items)
                </label>
                <textarea
                  rows={2}
                  required
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                  placeholder="መስተካከል ያለባቸው ነጥቦች..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0C4A9E] text-white hover:bg-[#072958] disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'በመመዝገብ ላይ...' : 'ክትትል መዝግብ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Clock Popover for Recording Actual Slot Time on the Program Day */}
      <ClockPopoverDialog
        isOpen={Boolean(activeActualClockSlot)}
        initialValue={
          activeActualClockSlot?.slot.actualTimeRange ||
          activeActualClockSlot?.slot.timeRange ||
          '15 ደቂቃ'
        }
        defaultMode="INTERVAL"
        title={
          activeActualClockSlot
            ? `${activeActualClockSlot.slot.slotTitle} — የተፈጸመበት ሰዓት`
            : 'የተፈጸመበት ሰዓት'
        }
        contextSlots={activeActualClockSlot ? trackedSlots : undefined}
        currentSlotId={activeActualClockSlot?.slot.id}
        programTimeRange={activeActualClockSlot?.sheet.timeAmharic}
        onClose={() => setActiveActualClockSlot(null)}
        onSelect={async (val) => {
          if (!activeActualClockSlot) return;
          const { sheet, slot } = activeActualClockSlot;
          await handleUpdateSlotTracking(sheet, slot.id, {
            actualTimeRange: val,
            executionStatus:
              slot.executionStatus && slot.executionStatus !== 'PENDING'
                ? slot.executionStatus
                : 'COMPLETED',
          });
          showToast(`የ«${slot.slotTitle}» የተፈጸመበት ሰዓት (${val}) ተመዝግቧል።`);
          setActiveActualClockSlot(null);
        }}
      />
    </div>
  );
};
