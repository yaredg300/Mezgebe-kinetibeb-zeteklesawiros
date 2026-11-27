import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Plus } from 'lucide-react';
import { SundayTimetableSlot } from '../types';
import {
  analyzeDailySlotTimes,
  AnalyzedSlot,
  formatMinutesToClock,
} from '../utils/timeOverlap';

interface SlotOverlapShowerProps {
  slots: SundayTimetableSlot[];
  programTimeRange?: string;
  onSlotClick?: (slot: SundayTimetableSlot) => void;
  onGapClick?: (gapRange: string) => void;
  compact?: boolean;
}

/**
 * Greedy lane assignment so overlapping slots stack visibly on separate tracks
 * inside the Overlap Shower bar instead of hiding behind one another.
 */
function assignDisplayLanes(
  items: Array<AnalyzedSlot & { startMin: number; endMin: number }>
): { lanes: number; laneBySlotId: Record<string, number> } {
  const sorted = [...items].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const laneEndTimes: number[] = [];
  const laneBySlotId: Record<string, number> = {};

  for (const item of sorted) {
    let assigned = -1;
    for (let i = 0; i < laneEndTimes.length; i++) {
      if (laneEndTimes[i] <= item.startMin) {
        assigned = i;
        laneEndTimes[i] = item.endMin;
        break;
      }
    }
    if (assigned === -1) {
      assigned = laneEndTimes.length;
      laneEndTimes.push(item.endMin);
    }
    laneBySlotId[item.slot.id] = assigned;
  }

  return { lanes: Math.max(1, laneEndTimes.length), laneBySlotId };
}

export const SlotOverlapShower: React.FC<SlotOverlapShowerProps> = ({
  slots,
  programTimeRange,
  onSlotClick,
  onGapClick,
  compact = false,
}) => {
  const analysis = useMemo(
    () => analyzeDailySlotTimes(slots, programTimeRange),
    [slots, programTimeRange]
  );

  const positioned = useMemo(
    () =>
      analysis.analyzedSlots.filter(
        (s): s is AnalyzedSlot & { startMin: number; endMin: number } =>
          s.startMin !== null && s.endMin !== null && s.endMin > s.startMin
      ),
    [analysis]
  );

  const { lanes, laneBySlotId } = useMemo(
    () => assignDisplayLanes(positioned),
    [positioned]
  );

  if (slots.length === 0 || positioned.length === 0) {
    return null;
  }

  const totalSpan = Math.max(15, analysis.windowEndMin - analysis.windowStartMin);
  const toPercent = (minVal: number) =>
    ((minVal - analysis.windowStartMin) / totalSpan) * 100;
  const widthPercent = (startMin: number, endMin: number) =>
    Math.max(1.5, ((endMin - startMin) / totalSpan) * 100);

  const totalGapMinutes = analysis.gapZones.reduce((sum, g) => sum + g.durationMin, 0);
  const significantGaps = analysis.gapZones.filter((g) => g.durationMin >= 5);

  const laneHeight = compact ? 18 : 22;
  const trackHeight = lanes * laneHeight + Math.max(0, lanes - 1) * 4 + 8;

  return (
    <div
      className={`px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5 ${
        analysis.hasAnyOverlap
          ? 'bg-rose-50/40 dark:bg-rose-950/15'
          : analysis.hasOverflow
          ? 'bg-amber-50/35 dark:bg-amber-950/10'
          : 'bg-slate-50/50 dark:bg-slate-900/25'
      }`}
    >
      {/* Top Status Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          {analysis.hasAnyOverlap ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-semibold text-rose-700 dark:text-rose-300">
                የሰዓት መደራረብ (Overlap)፦ {analysis.totalOverlapMin} ደቂቃ
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
                ({analysis.overlapZones.map((z) => z.label).join(' · ')})
              </span>
            </>
          ) : analysis.hasOverflow ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                ከፕሮግራሙ ሰዓት ({formatMinutesToClock(analysis.programEndMin)}) በ{analysis.overflowMinutes} ደቂቃ ያልፋል
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                ያለ መደራረብ
              </span>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                {analysis.coveredUniqueMin}/{analysis.programCapacityMin} ደቂቃ ተሸፍኗል
                {totalGapMinutes > 0 ? ` · ${totalGapMinutes} ደቂቃ ክፍት` : ''}
              </span>
            </>
          )}
        </div>

        <span className="font-mono tabular-nums text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
          {formatMinutesToClock(analysis.windowStartMin)} – {formatMinutesToClock(analysis.windowEndMin)}
        </span>
      </div>

      {/* Visual Proportional Overlap Shower Bar */}
      <div
        className="relative w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 overflow-hidden"
        style={{ height: `${trackHeight}px` }}
      >
        {/* Program Window Boundary Shading */}
        <div
          className="absolute inset-y-0 bg-white/85 dark:bg-slate-900/55 border-x border-dashed border-slate-300/90 dark:border-slate-600 pointer-events-none"
          style={{
            left: `${toPercent(analysis.programStartMin)}%`,
            width: `${widthPercent(analysis.programStartMin, analysis.programEndMin)}%`,
          }}
        />

        {/* Free Gap Zones (Clickable when onGapClick provided) */}
        {significantGaps.map((gap) =>
          onGapClick ? (
            <button
              key={`gap-${gap.startMin}`}
              type="button"
              onClick={() => onGapClick(gap.label)}
              title={`ክፍት ሰዓት ${gap.label} (${gap.durationMin} ደቂቃ) — ለመጨመር ይጫኑ`}
              className="absolute inset-y-1 rounded-md border border-dashed border-emerald-400/70 dark:border-emerald-700/70 bg-emerald-50/45 dark:bg-emerald-950/25 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 flex items-center justify-center text-[9px] font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-300 cursor-pointer transition-colors"
              style={{
                left: `${toPercent(gap.startMin)}%`,
                width: `${widthPercent(gap.startMin, gap.endMin)}%`,
              }}
            >
              {widthPercent(gap.startMin, gap.endMin) > 7 ? `+${gap.durationMin}m` : ''}
            </button>
          ) : (
            <div
              key={`gap-${gap.startMin}`}
              title={`ክፍት ሰዓት ${gap.label} (${gap.durationMin} ደቂቃ)`}
              className="absolute inset-y-1 rounded-md border border-dashed border-slate-300/80 dark:border-slate-700 pointer-events-none"
              style={{
                left: `${toPercent(gap.startMin)}%`,
                width: `${widthPercent(gap.startMin, gap.endMin)}%`,
              }}
            />
          )
        )}

        {/* Slot Blocks */}
        {positioned.map((item, idx) => {
          const laneIdx = laneBySlotId[item.slot.id] ?? 0;
          const left = toPercent(item.startMin);
          const width = widthPercent(item.startMin, item.endMin);
          const topPx = 4 + laneIdx * (laneHeight + 4);
          const isOverlap = item.hasOverlap;
          const isOut = item.outOfProgramBounds && !isOverlap;

          return (
            <button
              key={item.slot.id}
              type="button"
              onClick={() => onSlotClick?.(item.slot)}
              disabled={!onSlotClick}
              title={`${idx + 1}. ${item.slot.slotTitle} (${item.slot.timeRange})${
                isOverlap
                  ? ` — መደራረብ ከ: ${item.overlaps.map((o) => o.otherSlotTitle).join(', ')}`
                  : ''
              }`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${topPx}px`,
                height: `${laneHeight}px`,
              }}
              className={`absolute rounded-md px-1.5 flex items-center justify-center text-[10px] font-mono tabular-nums font-semibold truncate transition-all ${
                onSlotClick ? 'cursor-pointer hover:brightness-105' : 'cursor-default'
              } ${
                isOverlap
                  ? 'bg-rose-600 text-white ring-1 ring-white/80 z-10'
                  : isOut
                  ? 'bg-amber-500 text-white'
                  : idx % 2 === 0
                  ? 'bg-[#0C4A9E] text-white'
                  : 'bg-[#8B0000] text-white'
              }`}
            >
              {width > 8 ? (
                <span className="truncate">{item.slot.slotTitle}</span>
              ) : width > 4 ? (
                <span>{String(idx + 1).padStart(2, '0')}</span>
              ) : null}
            </button>
          );
        })}

        {/* Vertical Overlap Collision Overlay Strips */}
        {analysis.overlapZones.map((zone) => (
          <div
            key={`ov-${zone.startMin}-${zone.endMin}`}
            title={`የሰዓት ግጭት (${zone.label} · ${zone.overlapMinutes} ደቂቃ)፦ ${zone.slotTitles.join(' ⇄ ')}`}
            style={{
              left: `${toPercent(zone.startMin)}%`,
              width: `${widthPercent(zone.startMin, zone.endMin)}%`,
            }}
            className="absolute inset-y-0 bg-rose-500/20 border-x-2 border-rose-600 dark:border-rose-400 pointer-events-none z-20"
          />
        ))}
      </div>

      {/* Overlap Details & Open Gap Quick Buttons */}
      {!compact && (analysis.hasAnyOverlap || (onGapClick && significantGaps.length > 0)) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {analysis.hasAnyOverlap ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-rose-700 dark:text-rose-300">
              {analysis.overlapZones.map((zone) => (
                <span key={`desc-${zone.startMin}`} className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  <strong className="font-mono tabular-nums">{zone.label}</strong>
                  <span>({zone.overlapMinutes} ደቂቃ):</span>
                  <span className="truncate max-w-[240px]">{zone.slotTitles.join(' ⇄ ')}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              በፕሮግራሙ ውስጥ ክፍት የሰዓት ክፍተቶች
            </span>
          )}

          {onGapClick && significantGaps.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {significantGaps.slice(0, 3).map((gap) => (
                <button
                  key={`btn-gap-${gap.startMin}`}
                  type="button"
                  onClick={() => onGapClick(gap.label)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 font-mono tabular-nums text-[10px] font-semibold cursor-pointer transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{gap.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
