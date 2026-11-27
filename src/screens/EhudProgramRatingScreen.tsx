import React, { useState, useMemo, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquare,
  Award,
  Trash2,
  Send,
  Sparkles,
  Sun,
  Calendar,
  Target,
  ChevronRight,
  Clock,
  Users,
  AlertTriangle,
  RotateCcw,
  Phone,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  BottomNavTab,
  EhudPlanScope,
  EhudPunctualityStatus,
  SundayProgramPlanEntry,
} from '../types';
import { AppHeader } from '../components/AppHeader';
import {
  EHUD_SCOPE_META,
  getSyncedPlansForDivision,
  inferPlanScope,
} from '../utils/ehudPlanSync';

const RATING_LABELS: Record<number, string> = {
  1: 'ማሻሻያ ይፈልጋል',
  2: 'መጠነኛ',
  3: 'መልካም',
  4: 'በጣም ጥሩ',
  5: 'ምሳሌያዊ',
};

const PUNCTUALITY_SHORT: Record<EhudPunctualityStatus, string> = {
  ON_TIME: 'በሰዓቱ ተጀምሯል',
  SLIGHT_DELAY: 'ትንሽ ዘግይቷል',
  DELAYED: 'ዘግይቷል',
};

const formatTelHref = (contact?: string): string | null => {
  if (!contact) return null;
  const cleaned = contact.replace(/[^\d+]/g, '');
  return cleaned.length >= 7 ? `tel:${cleaned}` : null;
};

const STRENGTH_TAG_PRESETS = [
  'መንፈሳዊ ትምህርቱ ጥልቅና አስተማሪ ነበር',
  'በተያዘለት ሰዓት በስርዓት ተከናውኗል',
  'የጉባኤው ተሳትፎና ትኩረት ከፍተኛ ነበር',
  'ዝግጅቱና አቀራረቡ የተደራጀ ነበር',
];

const IMPROVEMENT_TAG_PRESETS = [
  'መርሐ ግብሩ በሰዓቱ ቢጀመር',
  'የድምፅና የመሳሪያ ዝግጅት ቀድሞ ቢጠናቀቅ',
  'የተሳታፊዎች ጥያቄና ውይይት ጊዜ ቢጨመር',
  'አስተባባሪዎች ቀድመው ቢገኙ',
];

interface StarPickerProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (val: number) => void;
}

const StarPicker: React.FC<StarPickerProps> = ({ label, sublabel, value, onChange }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5">
      <div className="min-w-0">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
          {label}
        </span>
        {sublabel && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {sublabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 min-w-[92px] sm:text-right">
          {RATING_LABELS[displayValue] || ''}
        </span>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverValue(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              onFocus={() => setHoverValue(star)}
              onBlur={() => setHoverValue(null)}
              aria-label={`${label} ${star} ኮከብ`}
              className="p-1 rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C4A9E] cursor-pointer"
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  star <= displayValue
                    ? 'fill-[#F5B800] text-[#F5B800]'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300 w-7 text-right">
          {displayValue}/5
        </span>
      </div>
    </div>
  );
};

export interface EhudProgramRatingScreenProps {
  focusedSheetId?: string | null;
  onFocusSheetChange?: (sheetId: string | null) => void;
  onNavigateToTab?: (tab: BottomNavTab) => void;
}

export const EhudProgramRatingScreen: React.FC<EhudProgramRatingScreenProps> = ({
  focusedSheetId,
  onFocusSheetChange,
  onNavigateToTab,
}) => {
  const {
    selectedDivision,
    selectDivision,
    dailyPlanSheets,
    ehudPlans,
    ehudFollowUps,
    ehudRatings,
    childrenAnnualPlan,
    maekelawiyanAnnualPlan,
    youthAnnualPlan,
    submitEhudProgramRating,
    deleteEhudProgramRating,
    currentUser,
    firebaseUser,
    isSuperAdmin,
    isDeptAdmin,
    canApproveDeptMembers,
  } = useArchive();

  const [selectedScope, setSelectedScope] = useState<EhudPlanScope>('DAILY');
  const [localTargetId, setLocalTargetId] = useState<string>(focusedSheetId || '');
  const [overallRating, setOverallRating] = useState<number>(5);
  const [spiritualDepthRating, setSpiritualDepthRating] = useState<number>(5);
  const [timeManagementRating, setTimeManagementRating] = useState<number>(5);
  const [organizationRating, setOrganizationRating] = useState<number>(5);
  const [engagementRating, setEngagementRating] = useState<number>(5);
  const [strengths, setStrengths] = useState<string>('');
  const [improvements, setImprovements] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const selectedTargetId =
    selectedScope === 'DAILY' && focusedSheetId !== undefined
      ? focusedSheetId || ''
      : localTargetId;

  const setSelectedTargetId = (id: string) => {
    setLocalTargetId(id);
    if (selectedScope === 'DAILY') {
      onFocusSheetChange?.(id || null);
    }
  };

  const currentAnnualPlan: SundayProgramPlanEntry[] = useMemo(() => {
    if (selectedDivision === 'children') return childrenAnnualPlan;
    if (selectedDivision === 'intermediates') return maekelawiyanAnnualPlan;
    return youthAnnualPlan;
  }, [selectedDivision, childrenAnnualPlan, maekelawiyanAnnualPlan, youthAnnualPlan]);

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

  const scopeTargets = useMemo(() => {
    if (selectedScope === 'WEEKLY') return weeklyTargets;
    if (selectedScope === 'YEARLY') return yearlyTargets;
    return dailyTargets;
  }, [selectedScope, dailyTargets, weeklyTargets, yearlyTargets]);

  const activeTarget = useMemo(() => {
    const found = scopeTargets.find((t) => t.id === selectedTargetId);
    return found || scopeTargets[0];
  }, [scopeTargets, selectedTargetId]);

  const activeDailySheet = useMemo(() => {
    if (selectedScope !== 'DAILY' || !activeTarget) return undefined;
    return dailyPlanSheets.find(
      (s) => s.id === activeTarget.id && s.division === selectedDivision
    );
  }, [selectedScope, activeTarget, dailyPlanSheets, selectedDivision]);

  const activeDailyContext = useMemo(() => {
    if (!activeTarget) return null;
    const latestFollowUp = ehudFollowUps
      .filter(
        (f) =>
          f.division === selectedDivision &&
          f.programSheetId === activeTarget.id
      )
      .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt))[0];

    const presenterOrTeacher =
      activeDailySheet?.presenterOrTeacher || activeTarget.presenterOrLeader;
    const presenterContact =
      activeDailySheet?.presenterContact || activeTarget.presenterContact;

    if (!activeDailySheet && !latestFollowUp && !presenterOrTeacher && !presenterContact) {
      return null;
    }

    const totalSlots = activeDailySheet?.slots.length || 0;
    const completedSlots =
      activeDailySheet?.slots.filter((s) => s.executionStatus === 'COMPLETED').length || 0;
    const readyCount =
      activeDailySheet?.preProgramNeeds.filter(
        (need) => Boolean(activeDailySheet.preProgramChecklistState?.[need])
      ).length || 0;
    const checklistTotal = activeDailySheet?.preProgramNeeds.length || 0;

    return {
      leader: activeDailySheet?.leader,
      presenterOrTeacher,
      presenterContact,
      totalSlots,
      completedSlots,
      readyCount,
      checklistTotal,
      latestFollowUp,
    };
  }, [activeTarget, activeDailySheet, ehudFollowUps, selectedDivision]);

  const currentUid = firebaseUser?.uid || currentUser.id || 'u_default';

  const existingMyRating = useMemo(() => {
    if (!activeTarget) return undefined;
    return ehudRatings.find(
      (r) =>
        r.programSheetId === activeTarget.id &&
        r.raterId === currentUid &&
        inferPlanScope(r, ehudPlans) === selectedScope
    );
  }, [ehudRatings, activeTarget, currentUid, selectedScope, ehudPlans]);

  useEffect(() => {
    if (existingMyRating) {
      setOverallRating(existingMyRating.overallRating);
      setSpiritualDepthRating(existingMyRating.spiritualDepthRating);
      setTimeManagementRating(existingMyRating.timeManagementRating);
      setOrganizationRating(existingMyRating.organizationRating);
      setEngagementRating(existingMyRating.engagementRating);
      setStrengths(existingMyRating.strengths || '');
      setImprovements(existingMyRating.improvements || '');
    } else {
      setOverallRating(5);
      setSpiritualDepthRating(5);
      setTimeManagementRating(5);
      setOrganizationRating(5);
      setEngagementRating(5);
      setStrengths('');
      setImprovements('');
    }
  }, [existingMyRating?.id, activeTarget?.id, selectedScope]);

  const divisionRatings = useMemo(
    () => ehudRatings.filter((r) => r.division === selectedDivision),
    [ehudRatings, selectedDivision]
  );

  const scopedRatings = useMemo(
    () => divisionRatings.filter((r) => inferPlanScope(r, ehudPlans) === selectedScope),
    [divisionRatings, selectedScope, ehudPlans]
  );

  const targetRatingsCount = useMemo(() => {
    if (!activeTarget) return 0;
    return scopedRatings.filter((r) => r.programSheetId === activeTarget.id).length;
  }, [scopedRatings, activeTarget]);

  const scopeAverageMap = useMemo(() => {
    const calc = (sc: EhudPlanScope) => {
      const list = divisionRatings.filter((r) => inferPlanScope(r, ehudPlans) === sc);
      if (list.length === 0) return { count: 0, avg: 0 };
      const avg =
        Math.round((list.reduce((a, r) => a + r.overallRating, 0) / list.length) * 10) / 10;
      return { count: list.length, avg };
    };
    return {
      DAILY: calc('DAILY'),
      WEEKLY: calc('WEEKLY'),
      YEARLY: calc('YEARLY'),
    };
  }, [divisionRatings, ehudPlans]);

  const stats = useMemo(() => {
    const count = scopedRatings.length;
    if (count === 0) {
      return {
        count: 0,
        overallAvg: 0,
        spiritualAvg: 0,
        timeAvg: 0,
        orgAvg: 0,
        engagementAvg: 0,
        distribution: [5, 4, 3, 2, 1].map((s) => ({ star: s, count: 0, pct: 0 })),
      };
    }
    const avg = (fn: (r: (typeof scopedRatings)[number]) => number) =>
      Math.round((scopedRatings.reduce((acc, r) => acc + fn(r), 0) / count) * 10) / 10;

    return {
      count,
      overallAvg: avg((r) => r.overallRating),
      spiritualAvg: avg((r) => r.spiritualDepthRating),
      timeAvg: avg((r) => r.timeManagementRating),
      orgAvg: avg((r) => r.organizationRating),
      engagementAvg: avg((r) => r.engagementRating),
      distribution: [5, 4, 3, 2, 1].map((star) => {
        const c = scopedRatings.filter((r) => r.overallRating === star).length;
        return { star, count: c, pct: Math.round((c / count) * 100) };
      }),
    };
  }, [scopedRatings]);

  const computedCriteriaAvg = useMemo(() => {
    const raw =
      (spiritualDepthRating + timeManagementRating + organizationRating + engagementRating) / 4;
    return Math.max(1, Math.min(5, Math.round(raw)));
  }, [spiritualDepthRating, timeManagementRating, organizationRating, engagementRating]);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApplyAllScore = (score: number) => {
    setOverallRating(score);
    setSpiritualDepthRating(score);
    setTimeManagementRating(score);
    setOrganizationRating(score);
    setEngagementRating(score);
  };

  const toggleFeedbackPhrase = (
    current: string,
    setter: (next: string) => void,
    phrase: string
  ) => {
    const trimmed = current.trim();
    if (trimmed.includes(phrase)) {
      const cleaned = trimmed
        .split(/\s*•\s*|\n/)
        .map((p) => p.trim())
        .filter((p) => p && p !== phrase)
        .join(' • ');
      setter(cleaned);
      return;
    }
    const appended = trimmed ? `${trimmed} • ${phrase}` : phrase;
    setter(appended.slice(0, 1000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = activeTarget;
    setSubmitting(true);
    try {
      await submitEhudProgramRating({
        division: selectedDivision,
        planScope: selectedScope,
        programSheetId: target?.id || 'general_sunday',
        programTitle: target?.title || 'የእሁድ መደበኛ መርሐ ግብር',
        programDateAmharic: target?.dateAmharic || 'ኅዳር 2019 ዓ.ም.',
        overallRating,
        spiritualDepthRating,
        timeManagementRating,
        organizationRating,
        engagementRating,
        strengths,
        improvements,
      });

      if (!firebaseUser) {
        showToast('በእንግዳ ሁኔታ ደረጃዎ በአካባቢ ተቀምጧል።');
      } else {
        showToast(
          existingMyRating
            ? `የ${EHUD_SCOPE_META[selectedScope].shortLabel} ደረጃዎ ተሻሽሏል!`
            : `ለ${EHUD_SCOPE_META[selectedScope].shortLabel} መርሐ ግብሩ የሰጡት ደረጃ ተመዝግቧል!`
        );
      }
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('permission') || msg.includes('Missing or insufficient')) {
        showToast('በአካባቢ ተቀምጧል፤ ወደ ደመና ለመላክ የጸደቀ የክፍል አባልነት ያስፈልጋል።', true);
      } else {
        showToast('ደረጃውን ወደ ደመና መላክ አልተሳካም። እባክዎ ደግመው ይሞክሩ።', true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 md:pb-12 bg-[#F6F8FC] dark:bg-[#0B1320]">
      <AppHeader
        title="መርሐ ግብር ደረጃ • (Rate the Program)"
        subtitle="የዕለታዊ፣ ሳምንታዊ እና ዓመታዊ ዕቅዶችና መርሐ ግብሮች የጥራት ደረጃ መስጫ"
        showDepartmentSwitcher={false}
      />

      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-sm p-3.5 rounded-xl text-white shadow-xl flex items-center gap-2.5 border ${
            toast.isError
              ? 'bg-rose-600 border-rose-400'
              : 'bg-emerald-600 border-emerald-400'
          }`}
        >
          {toast.isError ? (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
        </div>
      )}

      <div className="max-w-[1380px] mx-auto px-3 sm:px-5 py-4 space-y-4">
        {/* Sunday Workflow Strip (1. ዕቅድ → 2. ክትትል → 3. ደረጃ ስጥ) */}
        {onNavigateToTab && (
          <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200/90 dark:border-slate-800 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (activeDailySheet) onFocusSheetChange?.(activeDailySheet.id);
                  onNavigateToTab('EHUD_PLANNING');
                }}
                className="font-medium text-slate-600 dark:text-slate-300 hover:text-[#0C4A9E] dark:hover:text-[#7FAFFF] cursor-pointer whitespace-nowrap"
              >
                1. ዕቅድ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
              <button
                type="button"
                onClick={() => {
                  if (activeDailySheet) onFocusSheetChange?.(activeDailySheet.id);
                  onNavigateToTab('EHUD_FOLLOWING');
                }}
                className="font-medium text-slate-600 dark:text-slate-300 hover:text-[#8B0000] dark:hover:text-[#FF8A80] cursor-pointer whitespace-nowrap"
              >
                2. በዕለቱ ክትትል
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
              <span className="font-bold text-[#B88500] dark:text-[#FFD54F] whitespace-nowrap">
                3. ደረጃ ስጥ
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (activeDailySheet) onFocusSheetChange?.(activeDailySheet.id);
                  onNavigateToTab('EHUD_FOLLOWING');
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
              >
                ወደ ክትትል ተመለስ
              </button>
            </div>
          </div>
        )}

        {/* Top Bar: Division + Scope Tabs + Target Selector */}
        <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 gap-0.5 self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  selectDivision('youth');
                  setSelectedTargetId('');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDivision === 'youth'
                    ? 'bg-[#8B0000] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                ወጣት
              </button>
              <button
                type="button"
                onClick={() => {
                  selectDivision('children');
                  setSelectedTargetId('');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDivision === 'children'
                    ? 'bg-[#F5B800] text-slate-900'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                ሕፃናት
              </button>
              <button
                type="button"
                onClick={() => {
                  selectDivision('intermediates');
                  setSelectedTargetId('');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDivision === 'intermediates'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                ማዕከላውያን
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 md:max-w-lg">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                የ{EHUD_SCOPE_META[selectedScope].shortLabel} ዕቅድ፦
              </span>
              <select
                value={activeTarget?.id || ''}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                aria-label="የሚገመገም ዕቅድ ይምረጡ"
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              >
                {scopeTargets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.dateAmharic} — {item.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3-Scope Rating Selector Tabs: Daily | Weekly | Yearly */}
          <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/30">
            {[
              { id: 'DAILY' as EhudPlanScope, label: 'ዕለታዊ ደረጃ (Daily)', icon: Sun },
              { id: 'WEEKLY' as EhudPlanScope, label: 'ሳምንታዊ ደረጃ (Weekly)', icon: Calendar },
              { id: 'YEARLY' as EhudPlanScope, label: 'ዓመታዊ ደረጃ (Yearly)', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedScope === tab.id;
              const info = scopeAverageMap[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedScope(tab.id);
                    if (tab.id !== 'DAILY') {
                      setLocalTargetId('');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    isActive
                      ? EHUD_SCOPE_META[tab.id].activeTabClass
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      isActive ? 'text-white/90' : 'text-slate-400'
                    }`}
                  >
                    {info.count > 0 ? `${info.avg}★ (${info.count})` : '0'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aggregate Scorecard + Rating Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-5 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  አጠቃላይ የ{EHUD_SCOPE_META[selectedScope].shortLabel} ውጤት
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {stats.overallAvg > 0 ? stats.overallAvg.toFixed(1) : '—'}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    / 5.0 ({stats.count} ግምገማዎች)
                  </span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#B88500]" />
              </div>
            </div>

            {/* 5 -> 1 Distribution Bars */}
            <div className="space-y-1.5">
              {stats.distribution.map((row) => (
                <div key={row.star} className="flex items-center gap-2 text-xs">
                  <span className="w-7 font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300">
                    {row.star}★
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-[#F5B800] rounded-full transition-all duration-300"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono tabular-nums text-[11px] text-slate-500">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Criterion Averages */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] text-slate-500 block">መንፈሳዊ ጥልቀት</span>
                <span className="font-mono tabular-nums font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                  {stats.spiritualAvg > 0 ? `${stats.spiritualAvg} / 5` : '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] text-slate-500 block">የሰዓት አጠቃቀም</span>
                <span className="font-mono tabular-nums font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                  {stats.timeAvg > 0 ? `${stats.timeAvg} / 5` : '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] text-slate-500 block">ቅድመ-ዝግጅትና አደረጃጀት</span>
                <span className="font-mono tabular-nums font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                  {stats.orgAvg > 0 ? `${stats.orgAvg} / 5` : '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] text-slate-500 block">የተሳታፊዎች ተሳትፎ</span>
                <span className="font-mono tabular-nums font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                  {stats.engagementAvg > 0 ? `${stats.engagementAvg} / 5` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Rating Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B88500] shrink-0" />
                  <span>ለ{EHUD_SCOPE_META[selectedScope].shortLabel} ዕቅዱ ደረጃ ይስጡ</span>
                </h2>
                {activeTarget && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {activeTarget.dateAmharic} · {activeTarget.title}
                    {targetRatingsCount > 0 && ` · ${targetRatingsCount} ግምገማ`}
                  </p>
                )}
              </div>

              {existingMyRating && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                  ✓ ቀደም ብለው ደረጃ ሰጥተዋል
                </span>
              )}
            </div>

            {/* Live Execution Context Strip (for Daily sheets, presenters & Follow-ups) */}
            {activeDailyContext && (
              <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                {activeDailyContext.leader && (
                  <span>መሪ፦ {activeDailyContext.leader}</span>
                )}
                {activeDailyContext.presenterOrTeacher && (
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    አቅራቢ፦ {activeDailyContext.presenterOrTeacher}
                  </span>
                )}
                {activeDailyContext.presenterContact && (() => {
                  const telHref = formatTelHref(activeDailyContext.presenterContact);
                  return telHref ? (
                    <a
                      href={telHref}
                      className="inline-flex items-center gap-1 font-mono tabular-nums text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                    >
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{activeDailyContext.presenterContact}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{activeDailyContext.presenterContact}</span>
                    </span>
                  );
                })()}
                {activeDailyContext.totalSlots > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <Clock className="w-3 h-3 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                    ክፍለ-ጊዜ፦ {activeDailyContext.completedSlots}/{activeDailyContext.totalSlots}
                  </span>
                )}
                {activeDailyContext.latestFollowUp && (
                  <>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Users className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ተሳታፊ፦ {activeDailyContext.latestFollowUp.attendanceCount}
                    </span>
                    <span className="font-medium">
                      {PUNCTUALITY_SHORT[activeDailyContext.latestFollowUp.punctualityStatus]}
                    </span>
                  </>
                )}
              </div>
            )}

            {!firebaseUser && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                በእንግዳ ሁኔታ (Guest) ላይ ነዎት — ደረጃዎ በአካባቢ ይቀመጣል። ወደ ደመና ለመላክ በመገለጫ ገጽ ይግቡ።
              </div>
            )}

            {/* 1-Tap Quick-Fill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                ፈጣን መሙያ፦
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyAllScore(5)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
                >
                  ሁሉንም 5★
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAllScore(4)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
                >
                  ሁሉንም 4★
                </button>
                <button
                  type="button"
                  onClick={() => setOverallRating(computedCriteriaAvg)}
                  className="px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 text-[11px] font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:bg-blue-100/70 dark:hover:bg-blue-900/40 cursor-pointer whitespace-nowrap shrink-0 font-mono tabular-nums"
                  title="ከ4ቱ መስፈርቶች አማካይ አጠቃላይ ውጤትን ያስላል"
                >
                  አማካይ → አጠቃላይ ({computedCriteriaAvg}★)
                </button>
                {existingMyRating && (
                  <button
                    type="button"
                    onClick={() => {
                      setOverallRating(existingMyRating.overallRating);
                      setSpiritualDepthRating(existingMyRating.spiritualDepthRating);
                      setTimeManagementRating(existingMyRating.timeManagementRating);
                      setOrganizationRating(existingMyRating.organizationRating);
                      setEngagementRating(existingMyRating.engagementRating);
                      setStrengths(existingMyRating.strengths || '');
                      setImprovements(existingMyRating.improvements || '');
                    }}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    title="የቀድሞውን ደረጃ መልስ"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <StarPicker
                label="አጠቃላይ ውጤት (Overall)"
                sublabel="ጠቅላላ የዕለቱ ወይም የዕቅዱ ስኬት"
                value={overallRating}
                onChange={setOverallRating}
              />
              <StarPicker
                label="መንፈሳዊ ጥልቀትና ትምህርት"
                sublabel="የትምህርቱና የመዝሙሩ መንፈሳዊ ይዘት"
                value={spiritualDepthRating}
                onChange={setSpiritualDepthRating}
              />
              <StarPicker
                label="የሰዓት አጠቃቀም"
                sublabel="በተያዘው ሰዓት መጀመርና መጨረስ"
                value={timeManagementRating}
                onChange={setTimeManagementRating}
              />
              <StarPicker
                label="አደረጃጀትና ዝግጅት"
                sublabel="የአገልጋዮችና የመሳሪያዎች ዝግጅት"
                value={organizationRating}
                onChange={setOrganizationRating}
              />
              <StarPicker
                label="የጉባኤው ተሳትፎ"
                sublabel="የተማሪዎችና የተሳታፊዎች ንቁ ተሳትፎ"
                value={engagementRating}
                onChange={setEngagementRating}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ጠንካራ ጎኖች (Strengths)
                </label>
                <div className="flex flex-wrap gap-1">
                  {STRENGTH_TAG_PRESETS.map((phrase) => {
                    const active = strengths.includes(phrase);
                    return (
                      <button
                        key={phrase}
                        type="button"
                        onClick={() => toggleFeedbackPhrase(strengths, setStrengths, phrase)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium border cursor-pointer transition-colors ${
                          active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{phrase}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="በመርሐ ግብሩ ላይ የወደዱት ነገር..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  መሻሻል ያለባቸው (Improvements)
                </label>
                <div className="flex flex-wrap gap-1">
                  {IMPROVEMENT_TAG_PRESETS.map((phrase) => {
                    const active = improvements.includes(phrase);
                    return (
                      <button
                        key={phrase}
                        type="button"
                        onClick={() => toggleFeedbackPhrase(improvements, setImprovements, phrase)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium border cursor-pointer transition-colors ${
                          active
                            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{phrase}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="ለቀጣዩ እንዲሻሻል የሚመክሩት..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {submitting
                    ? 'በመላክ ላይ...'
                    : existingMyRating
                    ? 'ደረጃውን አሻሽል (Update Rating)'
                    : 'ደረጃ ላክ (Submit Rating)'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Recent Ratings Feed for Selected Scope */}
        <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#0C4A9E]" />
            <span>
              የ{EHUD_SCOPE_META[selectedScope].shortLabel} ዕቅድ ግምገማዎችና አስተያየቶች ({scopedRatings.length})
            </span>
          </h3>

          {scopedRatings.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              ለ{EHUD_SCOPE_META[selectedScope].shortLabel} ዕቅዶች ገና የተሰጠ ደረጃ የለም። የመጀመሪያውን ደረጃ ከላይ ይስጡ!
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {scopedRatings.map((rating) => {
                const scopeMeta = EHUD_SCOPE_META[inferPlanScope(rating, ehudPlans)];
                const canDelete =
                  isSuperAdmin ||
                  isDeptAdmin ||
                  canApproveDeptMembers ||
                  rating.raterId === currentUid ||
                  rating.raterId === 'system_seed';
                return (
                  <div key={rating.id} className="py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {rating.raterName}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {scopeMeta.shortLabel}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                          <span className="font-medium text-[#0C4A9E] dark:text-[#7FAFFF]">
                            {rating.programDateAmharic}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-0.5 font-mono tabular-nums font-bold text-[#B88500]">
                            <Star className="w-3.5 h-3.5 fill-[#F5B800] text-[#F5B800]" />
                            {rating.overallRating}.0
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {rating.programTitle}
                        </p>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => deleteEhudProgramRating(rating.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                          title="ሰርዝ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      <span>መንፈሳዊ: {rating.spiritualDepthRating}/5</span>
                      <span>· ሰዓት: {rating.timeManagementRating}/5</span>
                      <span>· ዝግጅት: {rating.organizationRating}/5</span>
                      <span>· ተሳትፎ: {rating.engagementRating}/5</span>
                    </div>

                    {(rating.strengths || rating.improvements) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {rating.strengths && (
                          <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                              ጥንካሬ፦{' '}
                            </span>
                            {rating.strengths}
                          </div>
                        )}
                        {rating.improvements && (
                          <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-amber-700 dark:text-amber-300">
                              መሻሻል ያለበት፦{' '}
                            </span>
                            {rating.improvements}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

