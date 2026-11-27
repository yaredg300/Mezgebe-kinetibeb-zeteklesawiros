import {
  EhudPlanScope,
  EhudProgramPlan,
  SundayDailyPlanSheet,
  SundayProgramPlanEntry,
  SundaySchoolDivision,
} from '../types';
import {
  CHILDREN_TARGETS_2019,
  MAEKELAWIYAN_TARGETS_2019,
  YOUTH_ANNUAL_TARGETS_2019,
  YOUTH_MONTHLY_WEEKLY_HIGHLIGHTS_2019,
  YouthAnnualTarget,
} from '../data/youthCombinedPlanData';

export const ETHIOPIAN_MONTHS_LIST = [
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

export const EHUD_SCOPE_META: Record<
  EhudPlanScope,
  {
    labelAmharic: string;
    shortLabel: string;
    englishLabel: string;
    badgeClass: string;
    activeTabClass: string;
    description: string;
  }
> = {
  DAILY: {
    labelAmharic: 'ዕለታዊ ዕቅድ (Daily)',
    shortLabel: 'ዕለታዊ',
    englishLabel: 'Daily Plan',
    badgeClass:
      'bg-rose-50 text-[#8B0000] border-rose-200 dark:bg-rose-950/40 dark:text-[#FF8A80] dark:border-rose-800',
    activeTabClass: 'bg-[#8B0000] text-white shadow-xs',
    description: 'የእሁድ ጉባኤ ዝርዝር ሰዓታት፣ መሪዎች፣ ቅድመ-ዝግጅትና የዕለት ሉሆች (ከዋና ገጽ ጋር የተሳሰረ)',
  },
  WEEKLY: {
    labelAmharic: 'ሳምንታዊ ዕቅድ (Weekly)',
    shortLabel: 'ሳምንታዊ',
    englishLabel: 'Weekly Plan',
    badgeClass:
      'bg-blue-50 text-[#0C4A9E] border-blue-200 dark:bg-blue-950/40 dark:text-[#7FAFFF] dark:border-blue-800',
    activeTabClass: 'bg-[#0C4A9E] text-white shadow-xs',
    description: 'ከዋና ገጽ የመጡ ሳምንታዊ የእሁድ መርሐ ግብር ሰሌዳዎችና ቀጣይ ዕለታዊ ዕቅድ ማመንጫ',
  },
  YEARLY: {
    labelAmharic: 'ዓመታዊ ዕቅድ (Yearly)',
    shortLabel: 'ዓመታዊ',
    englishLabel: 'Yearly Plan',
    badgeClass:
      'bg-amber-50 text-[#B88500] border-amber-200 dark:bg-amber-950/40 dark:text-[#FFD54F] dark:border-amber-800',
    activeTabClass: 'bg-[#B88500] text-white shadow-xs',
    description: 'ከዋና ገጽ የመጡ የ2019 ዓ.ም. ዓመታዊ ስትራቴጂክ ዒላማዎችና ሙሉ 51 የእሁድ መርሐ ግብር ዕቅድ',
  },
};

export interface SyncedEhudPlanTarget {
  id: string;
  planScope: EhudPlanScope;
  division: SundaySchoolDivision;
  title: string;
  dateAmharic: string;
  monthAmharic: string;
  subtitle?: string;
  squadOrResponsible?: string;
  presenterOrLeader?: string;
  timeAmharic?: string;
  scriptureRef?: string;
  goal?: string;
  isComingSoon?: boolean;
  source:
    | 'wana_gets_sheet'
    | 'wana_gets_weekly'
    | 'wana_gets_annual_target'
    | 'wana_gets_annual_overview'
    | 'custom_plan';
  dailySheet?: SundayDailyPlanSheet;
  customPlan?: EhudProgramPlan;
  annualEntry?: SundayProgramPlanEntry;
  annualTarget?: YouthAnnualTarget;
  linkedDailySheet?: SundayDailyPlanSheet;
}

export const normalizeMonthPrefix = (month: string): string =>
  month
    .trim()
    .replace('ህዳር', 'ኅዳር')
    .replace('ታህሳስ', 'ታኅሣሥ')
    .replace('ጳጉሜን', 'ጳጉሜ')
    .slice(0, 3);

export const getEthiopianMonthIndex = (monthAmharic: string): number => {
  const norm = normalizeMonthPrefix(monthAmharic);
  if (norm.startsWith('ጳጉ')) return 12;
  const idx = ETHIOPIAN_MONTHS_LIST.findIndex((m) => normalizeMonthPrefix(m) === norm);
  return idx >= 0 ? idx : 0;
};

export const getEthiopianDateRank = (monthAmharic: string, dayNumber?: number): number => {
  const mIdx = getEthiopianMonthIndex(monthAmharic);
  const day = typeof dayNumber === 'number' && dayNumber > 0 ? dayNumber : 1;
  return mIdx * 31 + day;
};

export const getCurrentEthiopianRank = (now: Date = new Date()): number => {
  const gYear = now.getFullYear();
  const nyDayThisYear = (gYear + 1) % 4 === 0 ? 12 : 11;
  const todayUtc = Date.UTC(gYear, now.getMonth(), now.getDate());
  let nyUtc = Date.UTC(gYear, 8, nyDayThisYear); // Sept = month 8
  if (todayUtc < nyUtc) {
    const prevNyDay = gYear % 4 === 0 ? 12 : 11;
    nyUtc = Date.UTC(gYear - 1, 8, prevNyDay);
  }
  const daysSinceNewYear = Math.max(0, Math.floor((todayUtc - nyUtc) / 86400000));
  const ethMonthIdx = Math.min(12, Math.floor(daysSinceNewYear / 30));
  const ethDay = (daysSinceNewYear % 30) + 1;
  return ethMonthIdx * 31 + ethDay;
};

export const sortDailySheetsByComingSoon = (
  sheets: SundayDailyPlanSheet[],
  now: Date = new Date()
): SundayDailyPlanSheet[] => {
  const currentRank = getCurrentEthiopianRank(now);
  return [...sheets].sort((a, b) => {
    const aRank = getEthiopianDateRank(a.monthAmharic, a.dayNumber);
    const bRank = getEthiopianDateRank(b.monthAmharic, b.dayNumber);
    const aUpcoming = aRank >= currentRank;
    const bUpcoming = bRank >= currentRank;

    // Upcoming dates always come before past dates
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;

    if (aUpcoming && bUpcoming) {
      // Nearest upcoming Sunday first (ascending rank)
      if (aRank !== bRank) return aRank - bRank;
    } else {
      // Past dates: most recent first (descending rank)
      if (aRank !== bRank) return bRank - aRank;
    }

    const aCustom = a.id.startsWith('sheet_') || a.id.startsWith('daily_') || a.id.startsWith('custom_') ? 1 : 0;
    const bCustom = b.id.startsWith('sheet_') || b.id.startsWith('daily_') || b.id.startsWith('custom_') ? 1 : 0;
    if (aCustom !== bCustom) return bCustom - aCustom;
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });
};

export const findMatchingDailySheet = (
  sheets: SundayDailyPlanSheet[],
  division: SundaySchoolDivision,
  monthAmharic: string,
  dayNumber?: number,
  topic?: string
): SundayDailyPlanSheet | undefined => {
  const divSheets = sheets.filter((s) => s.division === division);
  if (dayNumber !== undefined) {
    const mPref = normalizeMonthPrefix(monthAmharic);
    const byDate = divSheets.find(
      (s) => s.dayNumber === dayNumber && normalizeMonthPrefix(s.monthAmharic) === mPref
    );
    if (byDate) return byDate;
  }
  if (topic) {
    const cleanTopic = topic.trim().toLowerCase();
    return divSheets.find((s) => s.mainTopic.trim().toLowerCase() === cleanTopic);
  }
  return undefined;
};

export const getDivisionAnnualTargets = (division: SundaySchoolDivision): YouthAnnualTarget[] => {
  if (division === 'children') return CHILDREN_TARGETS_2019;
  if (division === 'intermediates') return MAEKELAWIYAN_TARGETS_2019;
  return YOUTH_ANNUAL_TARGETS_2019;
};

export const inferPlanScope = (
  record: { planScope?: EhudPlanScope; programSheetId?: string },
  ehudPlans: EhudProgramPlan[] = []
): EhudPlanScope => {
  if (record.planScope === 'DAILY' || record.planScope === 'WEEKLY' || record.planScope === 'YEARLY') {
    return record.planScope;
  }
  const refId = record.programSheetId || '';
  if (!refId) return 'DAILY';
  if (
    refId.startsWith('yt_') ||
    refId.startsWith('ch_tgt_') ||
    refId.startsWith('mk_tgt_') ||
    refId.startsWith('annual_')
  ) {
    return 'YEARLY';
  }
  const matchedPlan = ehudPlans.find((p) => p.id === refId);
  if (matchedPlan?.planScope) return matchedPlan.planScope;
  if (refId.startsWith('wk_') || refId.startsWith('weekly_')) return 'WEEKLY';
  return 'DAILY';
};

export function getSyncedPlansForDivision(params: {
  division: SundaySchoolDivision;
  scope: EhudPlanScope;
  dailyPlanSheets: SundayDailyPlanSheet[];
  annualPlan: SundayProgramPlanEntry[];
  ehudPlans: EhudProgramPlan[];
}): SyncedEhudPlanTarget[] {
  const { division, scope, dailyPlanSheets, annualPlan, ehudPlans } = params;
  const divSheets = dailyPlanSheets.filter((s) => s.division === division);
  const divCustomPlans = ehudPlans.filter((p) => p.division === division);

  if (scope === 'DAILY') {
    const currentRank = getCurrentEthiopianRank();
    const customDaily = divCustomPlans
      .filter((p) => (p.planScope || 'DAILY') === 'DAILY')
      .map<SyncedEhudPlanTarget>((plan) => ({
        id: plan.id,
        planScope: 'DAILY',
        division,
        title: plan.title,
        dateAmharic: plan.targetDateAmharic,
        monthAmharic: plan.monthAmharic,
        squadOrResponsible: plan.squadName,
        presenterOrLeader: plan.presenterName,
        scriptureRef: plan.scriptureRef,
        goal: plan.goal,
        source: 'custom_plan',
        customPlan: plan,
      }));

    // Coming Soon Daily sheet first, followed by upcoming dates in chronological order
    const sortedSheets = sortDailySheetsByComingSoon(divSheets);

    const sheetTargets = sortedSheets.map<SyncedEhudPlanTarget>((sheet, index) => {
      const rank = getEthiopianDateRank(sheet.monthAmharic, sheet.dayNumber);
      return {
        id: sheet.id,
        planScope: 'DAILY',
        division,
        title: sheet.mainTopic,
        dateAmharic: sheet.dateAmharic,
        monthAmharic: sheet.monthAmharic,
        subtitle: `${sheet.slots.length} ክፍለ-ጊዜዎች • ${sheet.preProgramNeeds.length} ቅድመ-ዝግጅቶች`,
        squadOrResponsible: sheet.squadName || sheet.leader,
        presenterOrLeader: sheet.presenterOrTeacher || sheet.leader,
        timeAmharic: sheet.timeAmharic,
        goal: sheet.purpose,
        isComingSoon: index === 0 && (rank >= currentRank || sortedSheets.length > 0),
        source: 'wana_gets_sheet',
        dailySheet: sheet,
      };
    });

    return [...sheetTargets, ...customDaily];
  }

  if (scope === 'WEEKLY') {
    const customWeekly = divCustomPlans
      .filter((p) => p.planScope === 'WEEKLY')
      .map<SyncedEhudPlanTarget>((plan) => ({
        id: plan.id,
        planScope: 'WEEKLY',
        division,
        title: plan.title,
        dateAmharic: plan.targetDateAmharic,
        monthAmharic: plan.monthAmharic,
        squadOrResponsible: plan.squadName,
        presenterOrLeader: plan.presenterName,
        scriptureRef: plan.scriptureRef,
        goal: plan.goal,
        source: 'custom_plan',
        customPlan: plan,
        linkedDailySheet: findMatchingDailySheet(
          dailyPlanSheets,
          division,
          plan.monthAmharic,
          undefined,
          plan.title
        ),
      }));

    // Build lookup for Youth weekly highlights from Wana Gets
    const highlightMap = new Map<
      string,
      { topic: string; scripture: string; squad: string; motto: string }
    >();
    if (division === 'youth') {
      for (const group of YOUTH_MONTHLY_WEEKLY_HIGHLIGHTS_2019) {
        const mPref = normalizeMonthPrefix(group.monthShort);
        for (const s of group.sundays) {
          highlightMap.set(`${mPref}_${s.day}`, {
            topic: s.topic,
            scripture: s.scripture,
            squad: s.squad,
            motto: group.motto,
          });
        }
      }
    }

    const weeklyFromWanaGets = annualPlan
      .filter((entry) => entry.hasProgram)
      .map<SyncedEhudPlanTarget>((entry) => {
        const mPref = normalizeMonthPrefix(entry.monthAmharic);
        const hl = highlightMap.get(`${mPref}_${entry.dayNumber}`);
        const linked = findMatchingDailySheet(
          dailyPlanSheets,
          division,
          entry.monthAmharic,
          entry.dayNumber,
          entry.mainTopic
        );
        return {
          id: entry.id,
          planScope: 'WEEKLY',
          division,
          title: hl?.topic || entry.mainTopic,
          dateAmharic: `${entry.dateFullAmharic} ዓ.ም.`,
          monthAmharic: entry.monthAmharic,
          subtitle: entry.category,
          squadOrResponsible: hl?.squad || entry.leader || linked?.squadName || 'ተረኛ ምድብ',
          presenterOrLeader: entry.presenterOrTeacher || linked?.presenterOrTeacher || entry.leader,
          timeAmharic: entry.timeAmharic,
          scriptureRef: hl?.scripture,
          goal: entry.goalAmharic || hl?.motto || `${entry.monthAmharic} ሳምንታዊ የእሁድ መርሐ ግብር`,
          source: 'wana_gets_weekly',
          annualEntry: entry,
          linkedDailySheet: linked,
        };
      });

    return [...customWeekly, ...weeklyFromWanaGets];
  }

  // scope === 'YEARLY'
  const customYearly = divCustomPlans
    .filter((p) => p.planScope === 'YEARLY')
    .map<SyncedEhudPlanTarget>((plan) => ({
      id: plan.id,
      planScope: 'YEARLY',
      division,
      title: plan.title,
      dateAmharic: plan.targetDateAmharic,
      monthAmharic: plan.monthAmharic,
      squadOrResponsible: plan.squadName,
      presenterOrLeader: plan.presenterName,
      scriptureRef: plan.scriptureRef,
      goal: plan.goal,
      source: 'custom_plan',
      customPlan: plan,
    }));

  const targets = getDivisionAnnualTargets(division).map<SyncedEhudPlanTarget>((tgt) => ({
    id: tgt.id,
    planScope: 'YEARLY',
    division,
    title: `${tgt.code} — ${tgt.titleAmharic}`,
    dateAmharic: tgt.timelineMonths,
    monthAmharic: '2019 ዓ.ም.',
    subtitle: `${tgt.category} • ${tgt.targetMetric}`,
    squadOrResponsible: tgt.responsibleBody,
    presenterOrLeader: tgt.responsibleBody,
    goal: tgt.descriptionAmharic,
    source: 'wana_gets_annual_target',
    annualTarget: tgt,
  }));

  const divAm =
    division === 'children' ? 'ሕፃናት' : division === 'intermediates' ? 'ማዕከላውያን' : 'ወጣቶች';
  const masterYearlyOverview: SyncedEhudPlanTarget = {
    id: `annual_${division}_2019_master`,
    planScope: 'YEARLY',
    division,
    title: `የ2019 ዓ.ም. ሙሉ ዓመታዊ የ${divAm} የእሁድ መርሐ ግብር ዕቅድ (${annualPlan.length} እሁዶች)`,
    dateAmharic: 'መስከረም – ነሐሴ 2019 ዓ.ም.',
    monthAmharic: 'ዓመታዊ',
    subtitle: `${annualPlan.filter((e) => e.hasProgram).length} መደበኛና ልዩ የእሁድ መርሐ ግብሮች`,
    squadOrResponsible: `የ${divAm} ክፍል አስተባባሪ ኮሚቴ`,
    presenterOrLeader: 'ሁሉም አዘጋጅ ምድቦችና መምህራን',
    goal: `ከመስከረም እስከ ነሐሴ 2019 ዓ.ም. በዋና ገጽ ላይ የተቀመጠውን ሙሉ የ${divAm} ዓመታዊ የእሁድ መርሐ ግብር ሰሌዳ በጥራት ማስፈጸም።`,
    source: 'wana_gets_annual_overview',
  };

  return [...customYearly, masterYearlyOverview, ...targets];
}
