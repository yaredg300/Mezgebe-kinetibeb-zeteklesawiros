import { SundayTimetableSlot } from '../types';

export interface ParsedClockInterval {
  kind: 'INTERVAL' | 'DURATION';
  startMin?: number;
  endMin?: number;
  durationMin: number;
}

export interface SlotOverlapConflict {
  otherSlotId: string;
  otherSlotTitle: string;
  otherTimeRange: string;
  overlapStartMin: number;
  overlapEndMin: number;
  overlapMinutes: number;
}

export interface AnalyzedSlot {
  slot: SundayTimetableSlot;
  index: number;
  kind: 'INTERVAL' | 'DURATION' | 'UNPARSED';
  startMin: number | null;
  endMin: number | null;
  durationMin: number;
  overlaps: SlotOverlapConflict[];
  hasOverlap: boolean;
  outOfProgramBounds: boolean;
}

export interface OverlapZone {
  startMin: number;
  endMin: number;
  overlapMinutes: number;
  slotIds: string[];
  slotTitles: string[];
  label: string;
}

export interface GapZone {
  startMin: number;
  endMin: number;
  durationMin: number;
  label: string;
}

export interface DailyTimeOverlapAnalysis {
  programStartMin: number;
  programEndMin: number;
  windowStartMin: number;
  windowEndMin: number;
  programCapacityMin: number;
  totalScheduledMin: number;
  coveredUniqueMin: number;
  totalOverlapMin: number;
  overflowMinutes: number;
  overlapZones: OverlapZone[];
  gapZones: GapZone[];
  analyzedSlots: AnalyzedSlot[];
  bySlotId: Record<string, AnalyzedSlot>;
  hasAnyOverlap: boolean;
  hasOverflow: boolean;
}

export function formatMinutesToClock(totalMin: number): string {
  const normalized = ((Math.round(totalMin) % (12 * 60)) + 12 * 60) % (12 * 60);
  const h = Math.floor(normalized / 60) || 12;
  const m = normalized % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function formatIntervalToClockRange(startMin: number, endMin: number): string {
  return `${formatMinutesToClock(startMin)}–${formatMinutesToClock(endMin)}`;
}

/**
 * Resolves a 12-hour clock time (e.g. 1:30 after 11:30) onto a monotonic timeline anchored near anchorStartMin.
 */
export function resolveClockHourMin(
  hour12: number,
  minute: number,
  anchorStartMin?: number
): number {
  const h = ((hour12 % 12) + 12) % 12; // 0..11 where 12 -> 0
  const base = h * 60 + minute;
  if (anchorStartMin === undefined) {
    return (hour12 === 12 ? 12 * 60 : base);
  }
  // Pick the 12-hour cycle closest to [anchorStartMin - 60, anchorStartMin + 600]
  const candidates = [base, base + 12 * 60, base + 24 * 60];
  let best = candidates[0];
  for (const c of candidates) {
    if (c >= anchorStartMin - 60) {
      best = c;
      break;
    }
  }
  return best;
}

export function parseTimeRangeValue(
  raw: string,
  anchorStartMin?: number
): ParsedClockInterval | null {
  const clean = (raw || '').trim();
  if (!clean) return null;

  const rangeMatch = clean.match(/(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})/);
  if (rangeMatch) {
    const sh = Number(rangeMatch[1]);
    const sm = Number(rangeMatch[2]);
    const eh = Number(rangeMatch[3]);
    const em = Number(rangeMatch[4]);

    const startMin = resolveClockHourMin(sh, sm, anchorStartMin);
    let endMin = resolveClockHourMin(eh, em, startMin);
    if (endMin <= startMin) {
      endMin += 12 * 60;
    }
    const diff = endMin - startMin;
    return {
      kind: 'INTERVAL',
      startMin,
      endMin,
      durationMin: diff > 0 && diff <= 720 ? diff : 15,
    };
  }

  const singleTimeMatch = clean.match(/(\d{1,2}):(\d{2})/);
  if (singleTimeMatch) {
    const sh = Number(singleTimeMatch[1]);
    const sm = Number(singleTimeMatch[2]);
    const startMin = resolveClockHourMin(sh, sm, anchorStartMin);
    return {
      kind: 'INTERVAL',
      startMin,
      endMin: startMin + 15,
      durationMin: 15,
    };
  }

  const durMatch = clean.match(/(\d+)\s*(?:ደቂቃ|min)/i);
  if (durMatch) {
    const mins = Math.max(1, Number(durMatch[1]));
    return {
      kind: 'DURATION',
      durationMin: mins,
    };
  }

  return null;
}

export function parseProgramWindow(programTimeRange?: string): {
  startMin: number;
  endMin: number;
} {
  const clean = (programTimeRange || '').trim();
  const rangeMatch = clean.match(/(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})/);
  if (rangeMatch) {
    const sh = Number(rangeMatch[1]);
    const sm = Number(rangeMatch[2]);
    const eh = Number(rangeMatch[3]);
    const em = Number(rangeMatch[4]);
    const startMin = (sh === 12 ? 12 : sh % 12) * 60 + sm;
    let endMin = (eh === 12 ? 12 : eh % 12) * 60 + em;
    if (endMin <= startMin) endMin += 12 * 60;
    return { startMin, endMin };
  }
  // Default morning program window: 7:30 - 9:30
  return { startMin: 7 * 60 + 30, endMin: 9 * 60 + 30 };
}

export function analyzeDailySlotTimes(
  slots: SundayTimetableSlot[],
  programTimeRange?: string
): DailyTimeOverlapAnalysis {
  const { startMin: programStartMin, endMin: programEndMin } =
    parseProgramWindow(programTimeRange);

  let sequentialCursor = programStartMin;

  const analyzedSlots: AnalyzedSlot[] = slots.map((slot, index) => {
    const parsed = parseTimeRangeValue(slot.timeRange, programStartMin);
    if (!parsed) {
      return {
        slot,
        index,
        kind: 'UNPARSED',
        startMin: null,
        endMin: null,
        durationMin: 0,
        overlaps: [],
        hasOverlap: false,
        outOfProgramBounds: false,
      };
    }

    if (parsed.kind === 'INTERVAL' && parsed.startMin !== undefined && parsed.endMin !== undefined) {
      sequentialCursor = Math.max(sequentialCursor, parsed.endMin);
      const outOfBounds =
        parsed.startMin < programStartMin || parsed.endMin > programEndMin;
      return {
        slot,
        index,
        kind: 'INTERVAL',
        startMin: parsed.startMin,
        endMin: parsed.endMin,
        durationMin: parsed.durationMin,
        overlaps: [],
        hasOverlap: false,
        outOfProgramBounds: outOfBounds,
      };
    }

    // Duration-only slot: place sequentially after previous cursor
    const startMin = sequentialCursor;
    const endMin = startMin + parsed.durationMin;
    sequentialCursor = endMin;
    const outOfBounds = endMin > programEndMin;
    return {
      slot,
      index,
      kind: 'DURATION',
      startMin,
      endMin,
      durationMin: parsed.durationMin,
      overlaps: [],
      hasOverlap: false,
      outOfProgramBounds: outOfBounds,
    };
  });

  // Pairwise overlap detection among all positioned slots
  for (let i = 0; i < analyzedSlots.length; i++) {
    const a = analyzedSlots[i];
    if (a.startMin === null || a.endMin === null) continue;
    for (let j = i + 1; j < analyzedSlots.length; j++) {
      const b = analyzedSlots[j];
      if (b.startMin === null || b.endMin === null) continue;

      const overlapStart = Math.max(a.startMin, b.startMin);
      const overlapEnd = Math.min(a.endMin, b.endMin);
      if (overlapEnd > overlapStart) {
        const overlapMinutes = overlapEnd - overlapStart;
        a.overlaps.push({
          otherSlotId: b.slot.id,
          otherSlotTitle: b.slot.slotTitle,
          otherTimeRange: b.slot.timeRange,
          overlapStartMin: overlapStart,
          overlapEndMin: overlapEnd,
          overlapMinutes,
        });
        a.hasOverlap = true;

        b.overlaps.push({
          otherSlotId: a.slot.id,
          otherSlotTitle: a.slot.slotTitle,
          otherTimeRange: a.slot.timeRange,
          overlapStartMin: overlapStart,
          overlapEndMin: overlapEnd,
          overlapMinutes,
        });
        b.hasOverlap = true;
      }
    }
  }

  // Sweep-line to compute exact overlap zones, unique covered minutes, and free gap zones
  const positioned = analyzedSlots.filter(
    (s): s is AnalyzedSlot & { startMin: number; endMin: number } =>
      s.startMin !== null && s.endMin !== null && s.endMin > s.startMin
  );

  let windowStartMin = programStartMin;
  let windowEndMin = programEndMin;
  for (const p of positioned) {
    if (p.startMin < windowStartMin) windowStartMin = p.startMin;
    if (p.endMin > windowEndMin) windowEndMin = p.endMin;
  }

  const pointsSet = new Set<number>([programStartMin, programEndMin]);
  for (const p of positioned) {
    pointsSet.add(p.startMin);
    pointsSet.add(p.endMin);
  }
  const sortedPoints = Array.from(pointsSet).sort((x, y) => x - y);

  const rawOverlapSegments: OverlapZone[] = [];
  const rawGapSegments: GapZone[] = [];
  let coveredUniqueMin = 0;
  let totalOverlapMin = 0;

  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const segStart = sortedPoints[i];
    const segEnd = sortedPoints[i + 1];
    const segLen = segEnd - segStart;
    if (segLen <= 0) continue;

    const active = positioned.filter(
      (p) => p.startMin <= segStart && p.endMin >= segEnd
    );

    if (active.length >= 1) {
      coveredUniqueMin += segLen;
    }

    if (active.length >= 2) {
      totalOverlapMin += segLen * (active.length - 1);
      const slotIds = active.map((a) => a.slot.id);
      const slotTitles = active.map((a) => a.slot.slotTitle || a.slot.timeRange);
      const prev = rawOverlapSegments[rawOverlapSegments.length - 1];
      if (
        prev &&
        prev.endMin === segStart &&
        prev.slotIds.join(',') === slotIds.join(',')
      ) {
        prev.endMin = segEnd;
        prev.overlapMinutes += segLen;
        prev.label = formatIntervalToClockRange(prev.startMin, prev.endMin);
      } else {
        rawOverlapSegments.push({
          startMin: segStart,
          endMin: segEnd,
          overlapMinutes: segLen,
          slotIds,
          slotTitles,
          label: formatIntervalToClockRange(segStart, segEnd),
        });
      }
    } else if (
      active.length === 0 &&
      segStart >= programStartMin &&
      segEnd <= programEndMin
    ) {
      const prevGap = rawGapSegments[rawGapSegments.length - 1];
      if (prevGap && prevGap.endMin === segStart) {
        prevGap.endMin = segEnd;
        prevGap.durationMin += segLen;
        prevGap.label = formatIntervalToClockRange(prevGap.startMin, prevGap.endMin);
      } else {
        rawGapSegments.push({
          startMin: segStart,
          endMin: segEnd,
          durationMin: segLen,
          label: formatIntervalToClockRange(segStart, segEnd),
        });
      }
    }
  }

  const totalScheduledMin = analyzedSlots.reduce((sum, s) => sum + s.durationMin, 0);
  const programCapacityMin = Math.max(15, programEndMin - programStartMin);
  const maxSlotEnd = positioned.reduce((max, p) => Math.max(max, p.endMin), programStartMin);
  const overflowMinutes = Math.max(0, maxSlotEnd - programEndMin);

  const bySlotId: Record<string, AnalyzedSlot> = {};
  for (const s of analyzedSlots) {
    bySlotId[s.slot.id] = s;
  }

  return {
    programStartMin,
    programEndMin,
    windowStartMin,
    windowEndMin,
    programCapacityMin,
    totalScheduledMin,
    coveredUniqueMin,
    totalOverlapMin,
    overflowMinutes,
    overlapZones: rawOverlapSegments,
    gapZones: rawGapSegments,
    analyzedSlots,
    bySlotId,
    hasAnyOverlap: rawOverlapSegments.length > 0,
    hasOverflow: overflowMinutes > 0,
  };
}

export interface CandidateOverlapCheck {
  candidateStartMin: number;
  candidateEndMin: number;
  candidateDurationMin: number;
  programStartMin: number;
  programEndMin: number;
  otherPositionedSlots: Array<{
    slotId: string;
    slotTitle: string;
    timeRange: string;
    startMin: number;
    endMin: number;
  }>;
  conflicts: Array<{
    slotId: string;
    slotTitle: string;
    timeRange: string;
    overlapStartMin: number;
    overlapEndMin: number;
    overlapMinutes: number;
  }>;
  hasOverlap: boolean;
  outOfProgramBounds: boolean;
  openGaps: GapZone[];
  recommendedInterval: string | null;
}

export function checkCandidateIntervalOverlap(params: {
  startMin: number;
  endMin: number;
  contextSlots?: SundayTimetableSlot[];
  currentSlotId?: string;
  programTimeRange?: string;
}): CandidateOverlapCheck {
  const { startMin, endMin, contextSlots = [], currentSlotId, programTimeRange } = params;
  const otherSlots = contextSlots.filter((s) => s.id !== currentSlotId);
  const baseAnalysis = analyzeDailySlotTimes(otherSlots, programTimeRange);

  const candidateDurationMin = Math.max(5, endMin - startMin);
  const otherPositionedSlots = baseAnalysis.analyzedSlots
    .filter(
      (a): a is AnalyzedSlot & { startMin: number; endMin: number } =>
        a.startMin !== null && a.endMin !== null && a.endMin > a.startMin
    )
    .map((a) => ({
      slotId: a.slot.id,
      slotTitle: a.slot.slotTitle || a.slot.timeRange,
      timeRange: a.slot.timeRange,
      startMin: a.startMin,
      endMin: a.endMin,
    }));

  const conflicts: CandidateOverlapCheck['conflicts'] = [];
  for (const other of otherPositionedSlots) {
    const oStart = Math.max(startMin, other.startMin);
    const oEnd = Math.min(endMin, other.endMin);
    if (oEnd > oStart) {
      conflicts.push({
        slotId: other.slotId,
        slotTitle: other.slotTitle,
        timeRange: other.timeRange,
        overlapStartMin: oStart,
        overlapEndMin: oEnd,
        overlapMinutes: oEnd - oStart,
      });
    }
  }

  // Find a best-fit gap for the candidate's duration (or largest gap)
  const fittingGap =
    baseAnalysis.gapZones.find((g) => g.durationMin >= candidateDurationMin) ||
    baseAnalysis.gapZones[0] ||
    null;

  let recommendedInterval: string | null = null;
  if (fittingGap) {
    const recEnd = Math.min(fittingGap.endMin, fittingGap.startMin + candidateDurationMin);
    recommendedInterval = formatIntervalToClockRange(fittingGap.startMin, recEnd);
  } else if (otherPositionedSlots.length > 0) {
    const lastEnd = Math.max(...otherPositionedSlots.map((o) => o.endMin));
    recommendedInterval = formatIntervalToClockRange(lastEnd, lastEnd + candidateDurationMin);
  }

  return {
    candidateStartMin: startMin,
    candidateEndMin: endMin,
    candidateDurationMin,
    programStartMin: baseAnalysis.programStartMin,
    programEndMin: baseAnalysis.programEndMin,
    otherPositionedSlots,
    conflicts,
    hasOverlap: conflicts.length > 0,
    outOfProgramBounds:
      startMin < baseAnalysis.programStartMin || endMin > baseAnalysis.programEndMin,
    openGaps: baseAnalysis.gapZones,
    recommendedInterval,
  };
}

/**
 * Aligns all slots sequentially starting from the program start window without gaps or overlaps,
 * preserving each slot's duration (falling back to 15 min when unparsed).
 */
export function autoChainDailySlots(
  slots: SundayTimetableSlot[],
  programTimeRange?: string
): SundayTimetableSlot[] {
  if (slots.length === 0) return [];
  const { startMin } = parseProgramWindow(programTimeRange);
  let cursor = startMin;

  return slots.map((slot) => {
    const parsed = parseTimeRangeValue(slot.timeRange, cursor);
    const dur = parsed && parsed.durationMin > 0 ? parsed.durationMin : 15;
    const slotStart = cursor;
    const slotEnd = slotStart + dur;
    cursor = slotEnd;
    return {
      ...slot,
      timeRange: formatIntervalToClockRange(slotStart, slotEnd),
    };
  });
}

/**
 * Adjusts a single slot's duration by deltaMin (e.g. +5 or -5) clamped to [5, 180].
 * When cascadeSequential is true (default), subsequent interval slots shift cleanly to avoid overlaps.
 */
export function adjustSlotDuration(
  slots: SundayTimetableSlot[],
  slotId: string,
  deltaMin: number,
  programTimeRange?: string,
  cascadeSequential: boolean = true
): SundayTimetableSlot[] {
  const { startMin: progStart } = parseProgramWindow(programTimeRange);
  const idx = slots.findIndex((s) => s.id === slotId);
  if (idx === -1) return slots;

  const target = slots[idx];
  const parsed = parseTimeRangeValue(target.timeRange, progStart);
  const baseDur = parsed && parsed.durationMin > 0 ? parsed.durationMin : 15;
  const nextDur = Math.max(5, Math.min(180, baseDur + deltaMin));

  if (parsed?.kind === 'DURATION' && !cascadeSequential) {
    return slots.map((s) =>
      s.id === slotId ? { ...s, timeRange: `${nextDur} ደቂቃ` } : s
    );
  }

  let anchor = parsed?.startMin;
  if (anchor === undefined) {
    anchor = progStart;
    for (let i = 0; i < idx; i++) {
      const p = parseTimeRangeValue(slots[i].timeRange, anchor);
      if (p?.kind === 'INTERVAL' && p.endMin !== undefined) {
        anchor = p.endMin;
      } else if (p) {
        anchor += p.durationMin;
      }
    }
  }

  const nextSlots = [...slots];
  const newTargetEnd = anchor + nextDur;
  nextSlots[idx] = {
    ...target,
    timeRange:
      parsed?.kind === 'DURATION'
        ? `${nextDur} ደቂቃ`
        : formatIntervalToClockRange(anchor, newTargetEnd),
  };

  if (!cascadeSequential) return nextSlots;

  // Ripple subsequent slots sequentially from target's new end if target uses explicit interval
  if (parsed?.kind !== 'DURATION') {
    let cursor = newTargetEnd;
    for (let i = idx + 1; i < nextSlots.length; i++) {
      const p = parseTimeRangeValue(nextSlots[i].timeRange, cursor);
      if (p?.kind === 'DURATION') {
        cursor += p.durationMin;
        continue;
      }
      const dur = p && p.durationMin > 0 ? p.durationMin : 15;
      nextSlots[i] = {
        ...nextSlots[i],
        timeRange: formatIntervalToClockRange(cursor, cursor + dur),
      };
      cursor += dur;
    }
  }

  return nextSlots;
}

/**
 * Proportionally scales slot durations (in 5-min increments, minimum 5 min each)
 * to fit the exact division program window and chains them seamlessly.
 */
export function rebalanceSlotsToFitWindow(
  slots: SundayTimetableSlot[],
  programTimeRange?: string
): SundayTimetableSlot[] {
  if (slots.length === 0) return [];
  const { startMin, endMin } = parseProgramWindow(programTimeRange);
  const capacity = Math.max(slots.length * 5, endMin - startMin);

  const rawDurations = slots.map((s) => {
    const p = parseTimeRangeValue(s.timeRange, startMin);
    return p && p.durationMin > 0 ? p.durationMin : 15;
  });
  const totalRaw = rawDurations.reduce((a, b) => a + b, 0) || slots.length * 15;

  // Scale rounded to 5 minutes, minimum 5 min per slot
  const scaled = rawDurations.map((d) =>
    Math.max(5, Math.round(((d / totalRaw) * capacity) / 5) * 5)
  );

  // Distribute remainder onto the longest slot(s)
  let diff = capacity - scaled.reduce((a, b) => a + b, 0);
  if (diff !== 0 && scaled.length > 0) {
    let guard = 0;
    while (diff !== 0 && guard < 100) {
      guard++;
      // Pick longest slot when shrinking, or longest slot when expanding
      let bestIdx = 0;
      for (let i = 1; i < scaled.length; i++) {
        if (scaled[i] > scaled[bestIdx]) bestIdx = i;
      }
      const step = diff > 0 ? Math.min(5, diff) : -Math.min(5, Math.abs(diff));
      if (scaled[bestIdx] + step >= 5) {
        scaled[bestIdx] += step;
        diff -= step;
      } else {
        break;
      }
    }
  }

  let cursor = startMin;
  return slots.map((slot, i) => {
    const dur = scaled[i];
    const nextRange = formatIntervalToClockRange(cursor, cursor + dur);
    cursor += dur;
    return { ...slot, timeRange: nextRange };
  });
}

/**
 * Suggests the cleanest clock interval for a newly added slot of `durationMin` minutes.
 */
export function getNextRecommendedSlotRange(
  slots: SundayTimetableSlot[],
  durationMin: number = 15,
  programTimeRange?: string
): string {
  const cleanDur = Math.max(5, Math.min(180, durationMin));
  const analysis = analyzeDailySlotTimes(slots, programTimeRange);
  const fittingGap = analysis.gapZones.find((g) => g.durationMin >= cleanDur);
  if (fittingGap) {
    return formatIntervalToClockRange(fittingGap.startMin, fittingGap.startMin + cleanDur);
  }
  const positioned = analysis.analyzedSlots.filter(
    (s): s is AnalyzedSlot & { startMin: number; endMin: number } =>
      s.startMin !== null && s.endMin !== null
  );
  if (positioned.length === 0) {
    return formatIntervalToClockRange(
      analysis.programStartMin,
      analysis.programStartMin + cleanDur
    );
  }
  const maxEnd = Math.max(...positioned.map((p) => p.endMin));
  return formatIntervalToClockRange(maxEnd, maxEnd + cleanDur);
}

