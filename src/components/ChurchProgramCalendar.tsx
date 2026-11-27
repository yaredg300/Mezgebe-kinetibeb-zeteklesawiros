import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  BookOpen,
  PenLine,
  Clapperboard,
  Mic,
  X,
} from 'lucide-react';
import { CulturalEvent, ProgramRecurrence } from '../types';

interface EthiopianMonth {
  nameAmharic: string;
  gregorianApprox: string;
  startDayOfWeek: number; // 0 = Sunday
  daysCount: number;
}

export const ETHIOPIAN_MONTHS: EthiopianMonth[] = [
  { nameAmharic: 'መስከረም', gregorianApprox: 'ሴፕቴምበር / ኦክቶበር', startDayOfWeek: 2, daysCount: 30 },
  { nameAmharic: 'ጥቅምት', gregorianApprox: 'ኦክቶበር / ኖቬምበር', startDayOfWeek: 5, daysCount: 30 },
  { nameAmharic: 'ኅዳር', gregorianApprox: 'ኖቬምበር / ዲሴምበር', startDayOfWeek: 0, daysCount: 30 },
  { nameAmharic: 'ታኅሣሥ', gregorianApprox: 'ዲሴምበር / ጃንዋሪ', startDayOfWeek: 2, daysCount: 30 },
  { nameAmharic: 'ጥር', gregorianApprox: 'ጃንዋሪ / ፌብሩዋሪ', startDayOfWeek: 4, daysCount: 30 },
  { nameAmharic: 'የካቲት', gregorianApprox: 'ፌብሩዋሪ / ማርች', startDayOfWeek: 6, daysCount: 30 },
  { nameAmharic: 'መጋቢት', gregorianApprox: 'ማርች / ኤፕሪል', startDayOfWeek: 1, daysCount: 30 },
  { nameAmharic: 'ሚያዝያ', gregorianApprox: 'ኤፕሪል / ሜይ', startDayOfWeek: 3, daysCount: 30 },
  { nameAmharic: 'ግንቦት', gregorianApprox: 'ሜይ / ጁን', startDayOfWeek: 5, daysCount: 30 },
  { nameAmharic: 'ሰኔ', gregorianApprox: 'ጁን / ጁላይ', startDayOfWeek: 0, daysCount: 30 },
  { nameAmharic: 'ሐምሌ', gregorianApprox: 'ጁላይ / ኦገስት', startDayOfWeek: 2, daysCount: 30 },
  { nameAmharic: 'ነሐሴ', gregorianApprox: 'ኦገስት / ሴፕቴምበር', startDayOfWeek: 4, daysCount: 30 },
  { nameAmharic: 'ጳጉሜን', gregorianApprox: 'ሴፕቴምበር (፭/፮ ቀናት)', startDayOfWeek: 6, daysCount: 5 },
];

const WEEK_DAYS = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];

export const getWeekdayIndexFromAmharic = (dateStr: string): number | null => {
  if (!dateStr) return null;
  if (dateStr.includes('እሁድ') || dateStr.includes('ሰንበት')) return 0;
  if (dateStr.includes('ሰኞ')) return 1;
  if (dateStr.includes('ማክሰኞ')) return 2;
  if (dateStr.includes('ረቡዕ')) return 3;
  if (dateStr.includes('ሐሙስ')) return 4;
  if (dateStr.includes('ዓርብ') || dateStr.includes('አርብ')) return 5;
  if (dateStr.includes('ቅዳሜ')) return 6;
  return null;
};

const eventMatchesWeekday = (event: CulturalEvent, dayOfWeek: number): boolean => {
  const matchedIdx = getWeekdayIndexFromAmharic(event.dateAmharic);
  if (matchedIdx !== null) return matchedIdx === dayOfWeek;
  if (dayOfWeek === 0 && event.title.includes('ሰንበት')) return true;
  if (dayOfWeek === 4 && event.title.includes('ልምምድ')) return true;
  return false;
};

export const ChurchProgramCalendar: React.FC<{
  events: CulturalEvent[];
  onAssignArtWorkClick?: (event: CulturalEvent) => void;
  onToggleTaskCompletion?: (eventId: string, assignmentId: string) => void;
  onAddEventClick?: () => void;
}> = ({ events, onAssignArtWorkClick, onToggleTaskCompletion, onAddEventClick }) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(6); // Default: መጋቢት
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedRecurrenceFilter, setSelectedRecurrenceFilter] = useState<ProgramRecurrence | null>(null);

  const currentMonth = ETHIOPIAN_MONTHS[currentMonthIndex];

  const weeklyEvents = useMemo(() => events.filter((e) => e.recurrence === 'WEEKLY'), [events]);
  const monthlyCount = useMemo(() => events.filter((e) => e.recurrence === 'MONTHLY').length, [events]);
  const yearlyCount = useMemo(() => events.filter((e) => e.recurrence === 'YEARLY').length, [events]);

  const activeWeeklyDayIndices = useMemo(() => {
    const set = new Set<number>();
    weeklyEvents.forEach((ev) => {
      const idx = getWeekdayIndexFromAmharic(ev.dateAmharic);
      if (idx !== null) set.add(idx);
    });
    return set;
  }, [weeklyEvents]);

  const displayedEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesRecurrence =
        selectedRecurrenceFilter === null || event.recurrence === selectedRecurrenceFilter;
      if (!matchesRecurrence) return false;

      if (selectedDay === null) return true;

      const dayNum = selectedDay;
      const dayOfWeek = (currentMonth.startDayOfWeek + dayNum - 1) % 7;

      if (event.recurrence === 'WEEKLY') {
        return eventMatchesWeekday(event, dayOfWeek);
      }
      if (event.recurrence === 'MONTHLY') {
        if (dayNum === 15 && (event.dateAmharic.includes('፲፭') || event.dateAmharic.includes('15'))) return true;
        if (dayNum === 21 && (event.dateAmharic.includes('፳፩') || event.dateAmharic.includes('21'))) return true;
        return event.dateAmharic.includes(`${dayNum}`);
      }
      if (event.recurrence === 'YEARLY') {
        if (dayNum === 15 && currentMonth.nameAmharic === 'መጋቢት') return true;
        return event.dateAmharic.includes(currentMonth.nameAmharic);
      }
      return true;
    });
  }, [events, selectedRecurrenceFilter, selectedDay, currentMonth]);

  return (
    <div className="space-y-3.5">
      {/* Compact Toolbar: Recurrence Filter + Quick Add */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 px-3 py-2">
        <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedRecurrenceFilter(null)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedRecurrenceFilter === null
                ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ሁሉም <span className="font-mono tabular-nums opacity-75">({events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRecurrenceFilter('WEEKLY')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedRecurrenceFilter === 'WEEKLY'
                ? 'bg-white dark:bg-[#111D30] text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ሳምንታዊ <span className="font-mono tabular-nums opacity-75">({weeklyEvents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRecurrenceFilter('MONTHLY')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedRecurrenceFilter === 'MONTHLY'
                ? 'bg-white dark:bg-[#111D30] text-[#B88500] dark:text-[#FFD54F] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ወርሃዊ <span className="font-mono tabular-nums opacity-75">({monthlyCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRecurrenceFilter('YEARLY')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedRecurrenceFilter === 'YEARLY'
                ? 'bg-white dark:bg-[#111D30] text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ዓመታዊ <span className="font-mono tabular-nums opacity-75">({yearlyCount})</span>
          </button>
        </div>

        {onAddEventClick && (
          <button
            type="button"
            onClick={onAddEventClick}
            className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>አዲስ መርሐ-ግብር</span>
          </button>
        )}
      </div>

      {/* 2-Column Split: Compact Calendar (Left) + Programs Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Interactive Calendar Card */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4">
          {/* Month Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSelectedDay(null);
                setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : ETHIOPIAN_MONTHS.length - 1));
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="ያለፈው ወር"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                {currentMonth.nameAmharic} ፳፻፲፱ ዓ.ም
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentMonth.gregorianApprox}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedDay(null);
                setCurrentMonthIndex((prev) => (prev < ETHIOPIAN_MONTHS.length - 1 ? prev + 1 : 0));
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="የሚቀጥለው ወር"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center pt-3 pb-1">
            {WEEK_DAYS.map((day, idx) => (
              <div
                key={day}
                className={`text-[11px] font-semibold py-1 ${
                  idx === 0
                    ? 'text-[#0C4A9E] dark:text-[#7FAFFF]'
                    : activeWeeklyDayIndices.has(idx)
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: currentMonth.startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {Array.from({ length: currentMonth.daysCount }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = selectedDay === dayNum;
              const dayOfWeek = (currentMonth.startDayOfWeek + i) % 7;

              const hasWeekly = activeWeeklyDayIndices.has(dayOfWeek);
              const hasMonthly = monthlyCount > 0 && (dayNum === 15 || dayNum === 21);
              const hasYearly = yearlyCount > 0 && currentMonth.nameAmharic === 'መጋቢት' && (dayNum === 15 || dayNum === 27);

              return (
                <button
                  type="button"
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
                  className={`h-9 rounded-lg flex flex-col items-center justify-center transition-colors border cursor-pointer ${
                    isSelected
                      ? 'bg-[#0C4A9E] text-white border-[#0C4A9E] font-bold'
                      : dayOfWeek === 0
                        ? 'bg-slate-50 dark:bg-slate-900/60 border-transparent text-[#0C4A9E] dark:text-[#7FAFFF] hover:border-slate-300 dark:hover:border-slate-700'
                        : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-mono tabular-nums leading-none">{dayNum}</span>
                  <div className="flex items-center gap-0.5 mt-1 h-1">
                    {hasWeekly && (
                      <span
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-600'}`}
                        title="ሳምንታዊ"
                      />
                    )}
                    {hasMonthly && (
                      <span
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-[#B88500]'}`}
                        title="ወርሃዊ"
                      />
                    )}
                    {hasYearly && (
                      <span
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-rose-200' : 'bg-rose-600'}`}
                        title="ዓመታዊ"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend & Selected Day Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                ሳምንታዊ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B88500]" />
                ወርሃዊ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                ዓመታዊ
              </span>
            </div>

            {selectedDay !== null && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>ቀን {selectedDay} አጽዳ</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Weekly Rhythm Quick Summary */}
          {weeklyEvents.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                ሳምንታዊ መደበኛ ቀናት
              </p>
              <div className="flex flex-wrap gap-1.5">
                {WEEK_DAYS.map((dayName, idx) => {
                  if (!activeWeeklyDayIndices.has(idx)) return null;
                  const countForDay = weeklyEvents.filter((ev) => eventMatchesWeekday(ev, idx)).length;
                  return (
                    <button
                      type="button"
                      key={dayName}
                      onClick={() => {
                        setSelectedRecurrenceFilter('WEEKLY');
                        // Pick the first occurrence of this weekday in the displayed month
                        const offset = (idx - currentMonth.startDayOfWeek + 7) % 7;
                        setSelectedDay(offset + 1);
                      }}
                      className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {dayName} <span className="font-mono tabular-nums text-slate-500">· {countForDay}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Active Day / Filtered Programs Feed */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
              {selectedDay !== null
                ? `የ${currentMonth.nameAmharic} ${selectedDay} መርሐ-ግብራት`
                : selectedRecurrenceFilter === 'WEEKLY'
                  ? 'ሳምንታዊ መርሐ-ግብራት'
                  : selectedRecurrenceFilter === 'MONTHLY'
                    ? 'ወርሃዊ መርሐ-ግብራት'
                    : selectedRecurrenceFilter === 'YEARLY'
                      ? 'ዓመታዊ መርሐ-ግብራት'
                      : 'መርሐ-ግብራት እና የተመደቡ ተግባራት'}
            </h3>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {displayedEvents.length} መርሐ-ግብራት
            </span>
          </div>

          {displayedEvents.length === 0 ? (
            <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-xs font-medium">በዚህ ማጣሪያ የተገኘ መርሐ-ግብር የለም።</p>
              {(selectedDay !== null || selectedRecurrenceFilter !== null) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedRecurrenceFilter(null);
                  }}
                  className="mt-2 text-xs font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline cursor-pointer"
                >
                  ማጣሪያውን አጽዳ
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedEvents.map((event) => (
                <ProgramWithTasksCard
                  key={event.id}
                  event={event}
                  onAssignClick={onAssignArtWorkClick ? () => onAssignArtWorkClick(event) : undefined}
                  onToggleCompletion={onToggleTaskCompletion}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProgramWithTasksCard: React.FC<{
  event: CulturalEvent;
  onAssignClick?: () => void;
  onToggleCompletion?: (eventId: string, assignmentId: string) => void;
}> = ({ event, onAssignClick, onToggleCompletion }) => {
  const recurrenceLabel =
    event.recurrence === 'WEEKLY'
      ? 'ሳምንታዊ'
      : event.recurrence === 'MONTHLY'
        ? 'ወርሃዊ'
        : 'ዓመታዊ';

  const recurrenceTextClass =
    event.recurrence === 'WEEKLY'
      ? 'text-emerald-700 dark:text-emerald-400'
      : event.recurrence === 'MONTHLY'
        ? 'text-[#B88500] dark:text-[#FFD54F]'
        : 'text-rose-700 dark:text-rose-400';

  return (
    <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      {/* Header: Quiet metadata kicker + Title + Assign button */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
            <span className={recurrenceTextClass}>{recurrenceLabel}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-500 dark:text-slate-400">{event.category}</span>
            {event.departmentTitle && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-[#0C4A9E] dark:text-[#7FAFFF]">{event.departmentTitle}</span>
              </>
            )}
          </div>
          <h4 className="text-sm sm:text-base font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 mt-0.5">
            {event.title}
          </h4>
        </div>

        {onAssignClick && (
          <button
            type="button"
            onClick={onAssignClick}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0C4A9E] dark:text-[#7FAFFF] text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            + ሥራ መድብ
          </button>
        )}
      </div>

      {/* Compact Date / Time / Venue Line */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {event.dateAmharic}
        </span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        <span className="flex items-center gap-1 font-mono tabular-nums">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {event.timeAmharic}
        </span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {event.location}
        </span>
      </div>

      {event.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Assignments Section (Clean Hairline Divider, No Nested Cards) */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            የተመደቡ ተግባራት ({event.assignments.length})
          </span>
        </div>

        {event.assignments.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-1">
            እስካሁን የተመደበ የኪነጥበብ ሥራ ወይም ተግባር የለም።
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {event.assignments.map((asgn) => (
              <div key={asgn.id} className="py-2.5 first:pt-1 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-[#0C4A9E] dark:text-[#7FAFFF] shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {asgn.workTitle}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                      {asgn.workCategory}
                    </span>
                  </div>

                  {onToggleCompletion && (
                    <button
                      type="button"
                      onClick={() => onToggleCompletion(event.id, asgn.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {asgn.isCompleted ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-400">ዝግጁ</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-500 dark:text-slate-400">በዝግጅት</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Inline Three-Role Metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <PenLine className="w-3 h-3 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                    <span className="text-slate-400">ፀሐፊ:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{asgn.writerMemberName}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clapperboard className="w-3 h-3 text-[#B88500] dark:text-[#FFD54F]" />
                    <span className="text-slate-400">አዘጋጅ:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{asgn.organizerMemberName}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-slate-400">አቅራቢ:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{asgn.presenterMemberName}</span>
                  </span>
                </div>

                {asgn.performanceNotes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    መመሪያ፦ {asgn.performanceNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
