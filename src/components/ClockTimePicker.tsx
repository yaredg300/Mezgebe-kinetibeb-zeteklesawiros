import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Check, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { SundayTimetableSlot } from '../types';
import {
  checkCandidateIntervalOverlap,
  formatIntervalToClockRange,
  formatMinutesToClock,
  parseProgramWindow,
  parseTimeRangeValue,
} from '../utils/timeOverlap';

export type ClockPickerMode = 'INTERVAL' | 'DURATION';

interface ParsedInterval {
  mode: ClockPickerMode;
  startHour: number; // 1..12
  startMinute: number; // 0..59
  endHour: number; // 1..12
  endMinute: number; // 0..59
  durationMinutes: number; // 5..120
}

function parseTimeValue(
  raw: string,
  fallbackMode: ClockPickerMode = 'INTERVAL',
  programTimeRange?: string,
  contextSlots?: SundayTimetableSlot[],
  currentSlotId?: string
): ParsedInterval {
  const clean = (raw || '').trim();
  const progWin = parseProgramWindow(programTimeRange);

  const rangeMatch = clean.match(/(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})/);
  if (rangeMatch) {
    const sh = Math.max(1, Math.min(12, Number(rangeMatch[1]) % 12 || 12));
    const sm = Math.max(0, Math.min(59, Number(rangeMatch[2])));
    const eh = Math.max(1, Math.min(12, Number(rangeMatch[3]) % 12 || 12));
    const em = Math.max(0, Math.min(59, Number(rangeMatch[4])));
    const startTotal = (sh % 12) * 60 + sm;
    const endTotal = (eh % 12) * 60 + em;
    const diff = endTotal >= startTotal ? endTotal - startTotal : endTotal + 12 * 60 - startTotal;
    return {
      mode: 'INTERVAL',
      startHour: sh,
      startMinute: sm,
      endHour: eh,
      endMinute: em,
      durationMinutes: diff > 0 && diff <= 240 ? diff : 15,
    };
  }

  const singleTimeMatch = clean.match(/(\d{1,2}):(\d{2})/);
  if (singleTimeMatch) {
    const sh = Math.max(1, Math.min(12, Number(singleTimeMatch[1]) % 12 || 12));
    const sm = Math.max(0, Math.min(59, Number(singleTimeMatch[2])));
    const endTotal = (sh % 12) * 60 + sm + 15;
    return {
      mode: 'INTERVAL',
      startHour: sh,
      startMinute: sm,
      endHour: Math.floor(endTotal / 60) % 12 || 12,
      endMinute: endTotal % 60,
      durationMinutes: 15,
    };
  }

  // Anchor default start hour/minute near program window or after previous slots
  let anchorStartMin = progWin.startMin;
  if (contextSlots && contextSlots.length > 0) {
    let cursor = progWin.startMin;
    for (const s of contextSlots) {
      if (s.id === currentSlotId) break;
      const p = parseTimeRangeValue(s.timeRange, progWin.startMin);
      if (p?.kind === 'INTERVAL' && p.endMin !== undefined) {
        cursor = Math.max(cursor, p.endMin);
      } else if (p?.kind === 'DURATION') {
        cursor += p.durationMin;
      }
    }
    anchorStartMin = cursor;
  }

  const defaultSh = Math.floor((anchorStartMin % (12 * 60)) / 60) || 12;
  const defaultSm = anchorStartMin % 60;

  const durMatch = clean.match(/(\d+)\s*(?:ደቂቃ|min)/i);
  if (durMatch) {
    const mins = Math.max(5, Math.min(120, Number(durMatch[1])));
    const endTotal = anchorStartMin + mins;
    return {
      mode: 'DURATION',
      startHour: defaultSh,
      startMinute: defaultSm,
      endHour: Math.floor((endTotal % (12 * 60)) / 60) || 12,
      endMinute: endTotal % 60,
      durationMinutes: mins,
    };
  }

  const fallbackEnd = anchorStartMin + 20;
  return {
    mode: fallbackMode,
    startHour: defaultSh,
    startMinute: defaultSm,
    endHour: Math.floor((fallbackEnd % (12 * 60)) / 60) || 12,
    endMinute: fallbackEnd % 60,
    durationMinutes: 20,
  };
}

function formatClockPair(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const m = String(minute).padStart(2, '0');
  return `${h}:${m}`;
}

function minutesToClockAngle(totalMin: number): number {
  const normalized = ((totalMin % (12 * 60)) + 12 * 60) % (12 * 60);
  return (normalized / (12 * 60)) * 360;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArcSector(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  let sweep = (endAngleDeg - startAngleDeg + 360) % 360;
  if (sweep === 0) sweep = 359.9;
  const start = polarToCartesian(cx, cy, r, startAngleDeg);
  const end = polarToCartesian(cx, cy, r, startAngleDeg + sweep);
  const largeArcFlag = sweep > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function describeArcStroke(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  let sweep = (endAngleDeg - startAngleDeg + 360) % 360;
  if (sweep === 0) sweep = 359.9;
  const start = polarToCartesian(cx, cy, r, startAngleDeg);
  const end = polarToCartesian(cx, cy, r, startAngleDeg + sweep);
  const largeArcFlag = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export interface ClockPopoverDialogProps {
  isOpen: boolean;
  initialValue: string;
  defaultMode?: ClockPickerMode;
  title?: string;
  contextSlots?: SundayTimetableSlot[];
  currentSlotId?: string;
  programTimeRange?: string;
  onClose: () => void;
  onSelect: (formattedValue: string) => void;
}

export const ClockPopoverDialog: React.FC<ClockPopoverDialogProps> = ({
  isOpen,
  initialValue,
  defaultMode = 'INTERVAL',
  title = 'በሰዓት መምረጫ (Clock Interval)',
  contextSlots,
  currentSlotId,
  programTimeRange,
  onClose,
  onSelect,
}) => {
  const parsed = useMemo(
    () =>
      parseTimeValue(
        initialValue,
        defaultMode,
        programTimeRange,
        contextSlots,
        currentSlotId
      ),
    [initialValue, defaultMode, programTimeRange, contextSlots, currentSlotId]
  );

  const [mode, setMode] = useState<ClockPickerMode>(parsed.mode);
  const [activeEndpoint, setActiveEndpoint] = useState<'START' | 'END'>('START');
  const [dialUnit, setDialUnit] = useState<'HOUR' | 'MINUTE'>('HOUR');

  const [startHour, setStartHour] = useState<number>(parsed.startHour);
  const [startMinute, setStartMinute] = useState<number>(parsed.startMinute);
  const [endHour, setEndHour] = useState<number>(parsed.endHour);
  const [endMinute, setEndMinute] = useState<number>(parsed.endMinute);
  const [durationMinutes, setDurationMinutes] = useState<number>(parsed.durationMinutes);

  useEffect(() => {
    if (!isOpen) return;
    const p = parseTimeValue(
      initialValue,
      defaultMode,
      programTimeRange,
      contextSlots,
      currentSlotId
    );
    setMode(p.mode);
    setStartHour(p.startHour);
    setStartMinute(p.startMinute);
    setEndHour(p.endHour);
    setEndMinute(p.endMinute);
    setDurationMinutes(p.durationMinutes);
    setActiveEndpoint('START');
    setDialUnit('HOUR');
  }, [isOpen, initialValue, defaultMode, programTimeRange, contextSlots, currentSlotId]);

  const progWin = useMemo(() => parseProgramWindow(programTimeRange), [programTimeRange]);

  const candidateBounds = useMemo(() => {
    const shBase = (startHour === 12 ? 12 : startHour % 12) * 60 + startMinute;
    let startMin = shBase;
    if (startMin < progWin.startMin - 60) {
      startMin += 12 * 60;
    }

    if (mode === 'DURATION') {
      return {
        startMin,
        endMin: startMin + durationMinutes,
      };
    }

    let endMin = (endHour === 12 ? 12 : endHour % 12) * 60 + endMinute;
    if (endMin <= startMin) {
      endMin += 12 * 60;
    }
    return { startMin, endMin };
  }, [mode, startHour, startMinute, endHour, endMinute, durationMinutes, progWin.startMin]);

  const overlapCheck = useMemo(() => {
    if (!contextSlots || contextSlots.length === 0) return null;
    return checkCandidateIntervalOverlap({
      startMin: candidateBounds.startMin,
      endMin: candidateBounds.endMin,
      contextSlots,
      currentSlotId,
      programTimeRange,
    });
  }, [candidateBounds, contextSlots, currentSlotId, programTimeRange]);

  if (!isOpen) return null;

  const currentHour = activeEndpoint === 'START' ? startHour : endHour;
  const currentMinute = activeEndpoint === 'START' ? startMinute : endMinute;

  const formattedOutput =
    mode === 'DURATION'
      ? `${durationMinutes} ደቂቃ`
      : `${formatClockPair(startHour, startMinute)}–${formatClockPair(endHour, endMinute)}`;

  const applyIntervalPreset = (minutesToAdd: number) => {
    const startTotal = (startHour % 12) * 60 + startMinute;
    const endTotal = startTotal + minutesToAdd;
    setEndHour(Math.floor(endTotal / 60) % 12 || 12);
    setEndMinute(endTotal % 60);
    setActiveEndpoint('END');
  };

  const applyClockIntervalString = (rangeStr: string) => {
    const p = parseTimeValue(rangeStr, 'INTERVAL', programTimeRange);
    setMode('INTERVAL');
    setStartHour(p.startHour);
    setStartMinute(p.startMinute);
    setEndHour(p.endHour);
    setEndMinute(p.endMinute);
    setDurationMinutes(p.durationMinutes);
  };

  const handleDialHourClick = (hr: number) => {
    if (activeEndpoint === 'START') {
      setStartHour(hr);
    } else {
      setEndHour(hr);
    }
    setDialUnit('MINUTE');
  };

  const handleDialMinuteClick = (min: number) => {
    if (activeEndpoint === 'START') {
      setStartMinute(min);
      setActiveEndpoint('END');
      setDialUnit('HOUR');
    } else {
      setEndMinute(min);
    }
  };

  // Compute angles for SVG clock face (center 110, 110; radius 82)
  const cx = 110;
  const cy = 110;
  const dialRadius = 82;

  const startAngle = ((startHour % 12) + startMinute / 60) * 30;
  const endAngle = ((endHour % 12) + endMinute / 60) * 30;
  const durationAngle = Math.min(359.9, (durationMinutes / 60) * 360);

  const activeHandAngle =
    mode === 'DURATION'
      ? durationAngle
      : dialUnit === 'HOUR'
      ? (currentHour % 12) * 30
      : currentMinute * 6;

  const activeHandTip = polarToCartesian(cx, cy, dialRadius - 14, activeHandAngle);

  const hourValues = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const durationDialValues = [60, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const hasOverlap = Boolean(overlapCheck?.hasOverlap);

  // Mini timeline calculations for visual Overlap Shower inside dialog
  const timelineMin = overlapCheck
    ? Math.min(
        overlapCheck.programStartMin,
        candidateBounds.startMin,
        ...overlapCheck.otherPositionedSlots.map((o) => o.startMin)
      )
    : progWin.startMin;
  const timelineMax = overlapCheck
    ? Math.max(
        overlapCheck.programEndMin,
        candidateBounds.endMin,
        ...overlapCheck.otherPositionedSlots.map((o) => o.endMin)
      )
    : progWin.endMin;
  const timelineSpan = Math.max(15, timelineMax - timelineMin);

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 text-[#8B0000] dark:text-[#FF8A80] shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            aria-label="ዝጋ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Mode Switcher: Interval vs Duration */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setMode('INTERVAL')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mode === 'INTERVAL'
                  ? 'bg-[#8B0000] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              የሰዓት ክፍተት (Start–End)
            </button>
            <button
              type="button"
              onClick={() => setMode('DURATION')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mode === 'DURATION'
                  ? 'bg-[#0C4A9E] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              የደቂቃ ቆይታ (Duration)
            </button>
          </div>

          {/* Digital Interval Readout / Endpoint Switcher */}
          {mode === 'INTERVAL' ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveEndpoint('START');
                  setDialUnit('HOUR');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl border text-center transition-colors cursor-pointer ${
                  activeEndpoint === 'START'
                    ? 'border-[#8B0000] bg-rose-50/70 dark:bg-rose-950/30 text-[#8B0000] dark:text-[#FF8A80]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="block text-[10px] font-semibold opacity-80">መጀመሪያ (Start)</span>
                <span className="text-base font-mono tabular-nums font-bold">
                  {formatClockPair(startHour, startMinute)}
                </span>
              </button>

              <span className="text-slate-400 font-bold text-sm">–</span>

              <button
                type="button"
                onClick={() => {
                  setActiveEndpoint('END');
                  setDialUnit('HOUR');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl border text-center transition-colors cursor-pointer ${
                  activeEndpoint === 'END'
                    ? 'border-[#0C4A9E] bg-blue-50/70 dark:bg-blue-950/30 text-[#0C4A9E] dark:text-[#7FAFFF]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="block text-[10px] font-semibold opacity-80">መጨረሻ (End)</span>
                <span className="text-base font-mono tabular-nums font-bold">
                  {formatClockPair(endHour, endMinute)}
                </span>
              </button>
            </div>
          ) : (
            <div className="py-1.5 px-3 rounded-xl border border-[#0C4A9E]/30 bg-blue-50/50 dark:bg-blue-950/25 text-center">
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                የተመረጠ ቆይታ ({formatIntervalToClockRange(candidateBounds.startMin, candidateBounds.endMin)})
              </span>
              <span className="text-lg font-mono tabular-nums font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                {durationMinutes} ደቂቃ
              </span>
            </div>
          )}

          {/* Hour / Minute Ring Switcher for Start-End Mode */}
          {mode === 'INTERVAL' && (
            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDialUnit('HOUR')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                  dialUnit === 'HOUR'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                ሰዓት (Hour)
              </button>
              <button
                type="button"
                onClick={() => setDialUnit('MINUTE')}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                  dialUnit === 'MINUTE'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                ደቂቃ (Minute)
              </button>
            </div>
          )}

          {/* Interactive SVG Analog Clock Face with Overlap Shower */}
          <div className="relative w-[220px] h-[220px] mx-auto select-none">
            <svg viewBox="0 0 220 220" className="w-full h-full">
              {/* Outer Dial Circle */}
              <circle
                cx={cx}
                cy={cy}
                r={104}
                className="fill-slate-50 dark:fill-slate-900/80 stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="1.5"
              />

              {/* Program Window Outer Guide Ring */}
              {programTimeRange && (
                <path
                  d={describeArcStroke(
                    cx,
                    cy,
                    100,
                    minutesToClockAngle(progWin.startMin),
                    minutesToClockAngle(progWin.endMin)
                  )}
                  fill="none"
                  className="stroke-emerald-500/50 dark:stroke-emerald-400/40"
                  strokeWidth="3"
                  strokeDasharray="4 3"
                />
              )}

              {/* Existing Slots Sectors on Clock Face (Interval mode or context aware) */}
              {mode === 'INTERVAL' &&
                overlapCheck?.otherPositionedSlots.map((other) => (
                  <path
                    key={`slot-arc-${other.slotId}`}
                    d={describeArcSector(
                      cx,
                      cy,
                      93,
                      minutesToClockAngle(other.startMin),
                      minutesToClockAngle(other.endMin)
                    )}
                    className="fill-slate-400/20 dark:fill-slate-500/25 stroke-slate-400/40"
                    strokeWidth="0.75"
                  />
                ))}

              {/* Active Candidate Time Interval / Duration Arc Sector */}
              {mode === 'INTERVAL' ? (
                <path
                  d={describeArcSector(cx, cy, 94, startAngle, endAngle)}
                  className={
                    hasOverlap
                      ? 'fill-amber-500/25 dark:fill-amber-400/30'
                      : 'fill-[#8B0000]/15 dark:fill-[#8B0000]/28'
                  }
                />
              ) : (
                <path
                  d={describeArcSector(cx, cy, 94, 0, durationAngle)}
                  className="fill-[#0C4A9E]/14 dark:fill-[#0C4A9E]/28"
                />
              )}

              {/* Highlighted Overlap Collision Wedges directly on the Clock Face! */}
              {mode === 'INTERVAL' &&
                overlapCheck?.conflicts.map((conflict) => (
                  <path
                    key={`ov-arc-${conflict.slotId}`}
                    d={describeArcSector(
                      cx,
                      cy,
                      95,
                      minutesToClockAngle(conflict.overlapStartMin),
                      minutesToClockAngle(conflict.overlapEndMin)
                    )}
                    className="fill-rose-600/45 stroke-rose-600 dark:stroke-rose-400"
                    strokeWidth="1.5"
                  />
                ))}

              {/* Active Hand Line */}
              <line
                x1={cx}
                y1={cy}
                x2={activeHandTip.x}
                y2={activeHandTip.y}
                className={
                  hasOverlap
                    ? 'stroke-rose-600 dark:stroke-rose-400'
                    : mode === 'DURATION' || activeEndpoint === 'END'
                    ? 'stroke-[#0C4A9E] dark:stroke-[#7FAFFF]'
                    : 'stroke-[#8B0000] dark:stroke-[#FF8A80]'
                }
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx={cx}
                cy={cy}
                r={4.5}
                className={
                  hasOverlap
                    ? 'fill-rose-600 dark:fill-rose-400'
                    : mode === 'DURATION' || activeEndpoint === 'END'
                    ? 'fill-[#0C4A9E] dark:fill-[#7FAFFF]'
                    : 'fill-[#8B0000] dark:fill-[#FF8A80]'
                }
              />
            </svg>

            {/* Clickable Clock Numbers Around the Dial */}
            {mode === 'DURATION'
              ? durationDialValues.map((mins, idx) => {
                  const pos = polarToCartesian(cx, cy, dialRadius, idx * 30);
                  const isSelected = durationMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-xs font-mono tabular-nums font-bold flex items-center justify-center cursor-pointer transition-transform ${
                        isSelected
                          ? 'bg-[#0C4A9E] text-white scale-110 shadow-sm'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      {mins}
                    </button>
                  );
                })
              : dialUnit === 'HOUR'
              ? hourValues.map((hr, idx) => {
                  const pos = polarToCartesian(cx, cy, dialRadius, idx * 30);
                  const isSelected = currentHour === hr;
                  return (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => handleDialHourClick(hr)}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-xs font-mono tabular-nums font-bold flex items-center justify-center cursor-pointer transition-transform ${
                        isSelected
                          ? activeEndpoint === 'START'
                            ? 'bg-[#8B0000] text-white scale-110 shadow-sm'
                            : 'bg-[#0C4A9E] text-white scale-110 shadow-sm'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      {hr}
                    </button>
                  );
                })
              : minuteValues.map((min, idx) => {
                  const pos = polarToCartesian(cx, cy, dialRadius, idx * 30);
                  const isSelected = currentMinute === min;
                  return (
                    <button
                      key={min}
                      type="button"
                      onClick={() => handleDialMinuteClick(min)}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-xs font-mono tabular-nums font-bold flex items-center justify-center cursor-pointer transition-transform ${
                        isSelected
                          ? activeEndpoint === 'START'
                            ? 'bg-[#8B0000] text-white scale-110 shadow-sm'
                            : 'bg-[#0C4A9E] text-white scale-110 shadow-sm'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      {String(min).padStart(2, '0')}
                    </button>
                  );
                })}
          </div>

          {/* Live Overlap Shower Strip + Free Gap Suggestions inside Clock Dialog */}
          {overlapCheck && (
            <div
              className={`rounded-xl border p-2.5 space-y-2 text-[11px] ${
                overlapCheck.hasOverlap
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/25'
                  : overlapCheck.outOfProgramBounds
                  ? 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20'
                  : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20'
              }`}
            >
              {/* Status Line */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5 min-w-0">
                  {overlapCheck.hasOverlap ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  ) : overlapCheck.outOfProgramBounds ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    {overlapCheck.hasOverlap ? (
                      <>
                        <p className="font-bold text-rose-700 dark:text-rose-300">
                          የሰዓት መደራረብ ተገኝቷል (Overlap)
                        </p>
                        {overlapCheck.conflicts.map((c) => (
                          <p key={c.slotId} className="text-[10px] text-rose-600 dark:text-rose-300 truncate">
                            ከ«{c.slotTitle}» ({c.timeRange}) ጋር {c.overlapMinutes} ደቂቃ ይደራረባል
                          </p>
                        ))}
                      </>
                    ) : overlapCheck.outOfProgramBounds ? (
                      <p className="font-semibold text-amber-800 dark:text-amber-200">
                        ከፕሮግራሙ ሰዓት ({formatMinutesToClock(overlapCheck.programStartMin)}–
                        {formatMinutesToClock(overlapCheck.programEndMin)}) ውጭ ነው
                      </p>
                    ) : (
                      <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                        ያለ መደራረብ — በፕሮግራሙ ውስጥ ይገባል
                      </p>
                    )}
                  </div>
                </div>

                {overlapCheck.hasOverlap && overlapCheck.recommendedInterval && (
                  <button
                    type="button"
                    onClick={() => applyClockIntervalString(overlapCheck.recommendedInterval!)}
                    className="px-2 py-1 rounded-lg bg-[#0C4A9E] text-white text-[10px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    title="ያለ መደራረብ ወደ ቀጣይ ክፍት ሰዓት ቀይር"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{overlapCheck.recommendedInterval}</span>
                  </button>
                )}
              </div>

              {/* Mini Proportional Overlap Bar */}
              <div className="relative h-5 rounded bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                {overlapCheck.otherPositionedSlots.map((o) => {
                  const left = ((o.startMin - timelineMin) / timelineSpan) * 100;
                  const width = Math.max(2, ((o.endMin - o.startMin) / timelineSpan) * 100);
                  return (
                    <div
                      key={`mini-${o.slotId}`}
                      title={`${o.slotTitle} (${o.timeRange})`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      className="absolute top-0.5 bottom-2.5 rounded-xs bg-slate-500/75 dark:bg-slate-400/60"
                    />
                  );
                })}
                {/* Live Candidate Position on Overlap Bar */}
                <div
                  style={{
                    left: `${((candidateBounds.startMin - timelineMin) / timelineSpan) * 100}%`,
                    width: `${Math.max(
                      2.5,
                      ((candidateBounds.endMin - candidateBounds.startMin) / timelineSpan) * 100
                    )}%`,
                  }}
                  className={`absolute bottom-0.5 top-2 rounded-xs ${
                    overlapCheck.hasOverlap ? 'bg-rose-600' : 'bg-[#0C4A9E]'
                  }`}
                />
                {/* Overlap Intersection Marker */}
                {overlapCheck.conflicts.map((c) => (
                  <div
                    key={`mini-ov-${c.slotId}`}
                    style={{
                      left: `${((c.overlapStartMin - timelineMin) / timelineSpan) * 100}%`,
                      width: `${Math.max(
                        1.5,
                        ((c.overlapEndMin - c.overlapStartMin) / timelineSpan) * 100
                      )}%`,
                    }}
                    className="absolute inset-y-0 bg-rose-600/40 border-x border-rose-600"
                  />
                ))}
              </div>

              {/* Clickable Free Open Gap Chips */}
              {overlapCheck.openGaps.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    ክፍት ሰዓት:
                  </span>
                  {overlapCheck.openGaps.slice(0, 4).map((gap) => (
                    <button
                      key={`clk-gap-${gap.startMin}`}
                      type="button"
                      onClick={() => applyClockIntervalString(gap.label)}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#0C4A9E] text-[10px] font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {gap.label} ({gap.durationMin}m)
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clickable Interval Jump Shortcuts */}
          {mode === 'INTERVAL' ? (
            <div className="space-y-1.5">
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                ከመጀመሪያ ሰዓት ({formatClockPair(startHour, startMinute)}) ቀጣይ ክፍተት ይምረጡ
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '+10 ደቂቃ', mins: 10 },
                  { label: '+15 ደቂቃ', mins: 15 },
                  { label: '+20 ደቂቃ', mins: 20 },
                  { label: '+30 ደቂቃ', mins: 30 },
                  { label: '+45 ደቂቃ', mins: 45 },
                  { label: '+1 ሰዓት', mins: 60 },
                  { label: '+1:30', mins: 90 },
                  { label: '+2 ሰዓት', mins: 120 },
                ].map((opt) => (
                  <button
                    key={opt.mins}
                    type="button"
                    onClick={() => applyIntervalPreset(opt.mins)}
                    className="py-1.5 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-[#8B0000] hover:text-[#8B0000] dark:hover:text-[#FF8A80] text-[11px] font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 15, 20, 25, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`py-1.5 px-1 rounded-lg border text-[11px] font-mono tabular-nums font-semibold cursor-pointer transition-colors ${
                    durationMinutes === m
                      ? 'bg-[#0C4A9E] text-white border-[#0C4A9E]'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#0C4A9E]'
                  }`}
                >
                  {m} ደቂቃ
                </button>
              ))}
            </div>
          )}

          {/* Confirm / Cancel Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
            >
              ተው
            </button>
            <button
              type="button"
              onClick={() => {
                onSelect(formattedOutput);
                onClose();
              }}
              className={`flex-1 py-2 px-4 rounded-xl text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                hasOverlap
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#8B0000] hover:bg-[#6e0000]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{formattedOutput} ምረጥ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ClockTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  defaultMode?: ClockPickerMode;
  title?: string;
  placeholder?: string;
  className?: string;
  contextSlots?: SundayTimetableSlot[];
  currentSlotId?: string;
  programTimeRange?: string;
}

export const ClockTimePicker: React.FC<ClockTimePickerProps> = ({
  value,
  onChange,
  defaultMode = 'INTERVAL',
  title = 'ሰዓት / ክፍተት ይምረጡ',
  placeholder = 'ሰዓት ይምረጡ',
  className = '',
  contextSlots,
  currentSlotId,
  programTimeRange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-between gap-2 text-left cursor-pointer transition-colors ${
          className ||
          'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#8B0000] text-xs font-mono tabular-nums text-slate-800 dark:text-slate-100'
        }`}
        title={title}
      >
        <span className="truncate font-mono tabular-nums">{value || placeholder}</span>
        <Clock className="w-3.5 h-3.5 text-[#8B0000] dark:text-[#FF8A80] shrink-0" />
      </button>

      <ClockPopoverDialog
        isOpen={open}
        initialValue={value}
        defaultMode={defaultMode}
        title={title}
        contextSlots={contextSlots}
        currentSlotId={currentSlotId}
        programTimeRange={programTimeRange}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </>
  );
};
