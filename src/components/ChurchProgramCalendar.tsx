import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  BookOpen,
} from 'lucide-react';
import { CulturalEvent, ProgramRecurrence, ProgramAssignment } from '../types';
import { ManuscriptBox, HaragDivider } from './Ornaments';

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
  const weekDays = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];

  const weeklyCount = events.filter((e) => e.recurrence === 'WEEKLY').length;
  const monthlyCount = events.filter((e) => e.recurrence === 'MONTHLY').length;
  const yearlyCount = events.filter((e) => e.recurrence === 'YEARLY').length;

  // Filter events by recurrence and day
  const displayedEvents = events.filter((event) => {
    const matchesRecurrence = selectedRecurrenceFilter === null || event.recurrence === selectedRecurrenceFilter;
    if (!matchesRecurrence) return false;

    if (selectedDay === null) return true;

    const dayNum = selectedDay;
    const dayOfWeek = (currentMonth.startDayOfWeek + dayNum - 1) % 7;

    if (event.recurrence === 'WEEKLY') {
      if (dayOfWeek === 0 && (event.dateAmharic.includes('እሁድ') || event.title.includes('ሰንበት'))) return true;
      if (dayOfWeek === 4 && (event.dateAmharic.includes('ሐሙስ') || event.title.includes('ልምምድ'))) return true;
      return event.dateAmharic.includes(weekDays[dayOfWeek]);
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

  return (
    <div className="space-y-4">
      {/* 1. Recurrence Filter Pills */}
      <ManuscriptBox className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0C4A9E] dark:text-[#7FAFFF]" />
            <h3 className="text-sm font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
              የመርሐ-ግብር ማጣሪያ (Recurrence Filter)
            </h3>
          </div>

          {onAddEventClick && (
            <button
              onClick={onAddEventClick}
              className="px-2.5 py-1 rounded-lg bg-[#0C4A9E]/10 hover:bg-[#0C4A9E]/20 text-[#0C4A9E] dark:text-[#7FAFFF] text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>አዲስ መርሐ-ግብር</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedRecurrenceFilter(null)}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
              selectedRecurrenceFilter === null
                ? 'bg-[#0C4A9E] text-white border-[#0C4A9E] shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B88500]/50'
            }`}
          >
            ሁሉንም ({events.length})
          </button>

          <button
            onClick={() => setSelectedRecurrenceFilter('WEEKLY')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
              selectedRecurrenceFilter === 'WEEKLY'
                ? 'bg-[#2E6930] text-white border-[#2E6930] shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#2E6930]/50'
            }`}
          >
            🌿 ሳምንታዊ ({weeklyCount})
          </button>

          <button
            onClick={() => setSelectedRecurrenceFilter('MONTHLY')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
              selectedRecurrenceFilter === 'MONTHLY'
                ? 'bg-[#B88500] text-white border-[#B88500] shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B88500]/50'
            }`}
          >
            🌕 ወርሃዊ ({monthlyCount})
          </button>

          <button
            onClick={() => setSelectedRecurrenceFilter('YEARLY')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
              selectedRecurrenceFilter === 'YEARLY'
                ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#8B0000]/50'
            }`}
          >
            🌟 ዓመታዊ ({yearlyCount})
          </button>
        </div>
      </ManuscriptBox>

      {/* 2. Interactive Calendar View Box */}
      <ManuscriptBox className="p-4 sm:p-5">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              if (currentMonthIndex > 0) setCurrentMonthIndex(currentMonthIndex - 1);
              else setCurrentMonthIndex(ETHIOPIAN_MONTHS.length - 1);
            }}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0C4A9E] dark:text-[#7FAFFF]"
            title="ያለፈው ወር"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h3 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
              {currentMonth.nameAmharic} ፳፻፲፮ ዓ.ም
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentMonth.gregorianApprox}
            </p>
          </div>

          <button
            onClick={() => {
              if (currentMonthIndex < ETHIOPIAN_MONTHS.length - 1) setCurrentMonthIndex(currentMonthIndex + 1);
              else setCurrentMonthIndex(0);
            }}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0C4A9E] dark:text-[#7FAFFF]"
            title="የሚቀጥለው ወር"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <HaragDivider height={12} className="my-1.5" />

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekDays.map((day, idx) => (
            <div
              key={day}
              className={`text-[11px] font-bold py-1 ${
                idx === 0 || idx === 6 ? 'text-[#B88500]' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month starts */}
          {Array.from({ length: currentMonth.startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {/* Days */}
          {Array.from({ length: currentMonth.daysCount }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedDay === dayNum;
            const dayOfWeek = (currentMonth.startDayOfWeek + i) % 7;

            const hasWeekly = dayOfWeek === 0 || dayOfWeek === 4;
            const hasMonthly = dayNum === 15 || dayNum === 21;
            const hasYearly = currentMonth.nameAmharic === 'መጋቢት' && (dayNum === 15 || dayNum === 27);

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all border ${
                  isSelected
                    ? 'bg-[#B88500]/25 border-[#B88500] font-bold shadow-sm'
                    : dayOfWeek === 0
                    ? 'bg-[#0C4A9E]/5 border-transparent text-[#0C4A9E] hover:border-[#B88500]/30'
                    : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`text-xs ${isSelected ? 'font-bold text-[#966C00] dark:text-[#FFD54F]' : ''}`}>
                  {dayNum}
                </span>

                {/* Event dots */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {hasWeekly && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E6930]" title="ሳምንታዊ" />
                  )}
                  {hasMonthly && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B88500]" title="ወርሃዊ" />
                  )}
                  {hasYearly && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" title="ዓመታዊ" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2E6930]" />
              ሳምንታዊ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B88500]" />
              ወርሃዊ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8B0000]" />
              ዓመታዊ
            </span>
          </div>

          {selectedDay !== null && (
            <button
              onClick={() => setSelectedDay(null)}
              className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
            >
              ቀን {selectedDay} ተመርጧል (አጽዳ ✕)
            </button>
          )}
        </div>
      </ManuscriptBox>

      {/* 3. Filtered Programs & Assigned Tasks */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
            {selectedDay !== null
              ? `የቀን ${selectedDay} መርሃ-ግብራት እና የተመደቡ ተግባራት`
              : selectedRecurrenceFilter === 'WEEKLY'
              ? 'ሳምንታዊ መርሃ-ግብራት እና የተመደቡ ተግባራት'
              : selectedRecurrenceFilter === 'MONTHLY'
              ? 'ወርሃዊ መርሃ-ግብራት እና የተመደቡ ተግባራት'
              : selectedRecurrenceFilter === 'YEARLY'
              ? 'ዓመታዊ መርሃ-ግብራት እና የተመደቡ ተግባራት'
              : 'ሁሉም መርሃ-ግብራት እና የተመደቡ ተግባራት'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {displayedEvents.length} መርሃ-ግብራት ተገኝተዋል
          </p>
        </div>
      </div>

      {displayedEvents.length === 0 ? (
        <ManuscriptBox className="p-8 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm font-medium">በዚህ ማጣሪያ የተገኘ መርሐ-ግብር የለም።</p>
          {(selectedDay !== null || selectedRecurrenceFilter !== null) && (
            <button
              onClick={() => {
                setSelectedDay(null);
                setSelectedRecurrenceFilter(null);
              }}
              className="mt-2 text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
            >
              ማጣሪያውን አጽዳ
            </button>
          )}
        </ManuscriptBox>
      ) : (
        <div className="space-y-4">
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
  );
};

export const ProgramWithTasksCard: React.FC<{
  event: CulturalEvent;
  onAssignClick?: () => void;
  onToggleCompletion?: (eventId: string, assignmentId: string) => void;
}> = ({ event, onAssignClick, onToggleCompletion }) => {
  const recurrenceColor =
    event.recurrence === 'WEEKLY'
      ? 'border-[#2E6930] text-[#2E6930] bg-[#2E6930]/10'
      : event.recurrence === 'MONTHLY'
      ? 'border-[#B88500] text-[#B88500] bg-[#B88500]/10'
      : 'border-[#8B0000] text-[#8B0000] bg-[#8B0000]/10';

  return (
    <ManuscriptBox className="p-4 sm:p-5 space-y-3">
      {/* Event Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${recurrenceColor} mb-1.5`}>
            ● {event.recurrence === 'WEEKLY' ? 'ሳምንታዊ' : event.recurrence === 'MONTHLY' ? 'ወርሃዊ' : 'ዓመታዊ'} መርሐ-ግብር
          </span>
          <h4 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
            {event.title}
          </h4>
        </div>

        <span className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] shrink-0">
          {event.category}
        </span>
      </div>

      {/* Date, Time, Venue */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#B88500]" />
          {event.dateAmharic}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#B88500]" />
          {event.timeAmharic}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#B88500]" />
          {event.location}
        </span>
      </div>

      {event.description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif-ethiopic">
          {event.description}
        </p>
      )}

      <HaragDivider height={12} className="my-2" />

      {/* Assigned Tasks Header */}
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
          የተመደቡ ተግባራትና የሥነፅሁፍ ሥራዎች ({event.assignments.length})
        </h5>

        {onAssignClick && (
          <button
            onClick={onAssignClick}
            className="px-2 py-1 rounded bg-[#B88500]/15 hover:bg-[#B88500]/25 text-[#966C00] dark:text-[#FFD54F] text-[11px] font-bold transition-colors"
          >
            + ሥራ መድብ
          </button>
        )}
      </div>

      {/* Assignments List */}
      {event.assignments.length === 0 ? (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-center text-xs text-slate-500">
          ለዚህ መርሐ-ግብር እስካሁን የተመደበ የኪነጥበብ ሥራ የለም።
        </div>
      ) : (
        <div className="space-y-2">
          {event.assignments.map((asgn) => (
            <div
              key={asgn.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#B88500]/25 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BookOpen className="w-4 h-4 text-[#0C4A9E] dark:text-[#7FAFFF] shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {asgn.workTitle}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#B88500]/20 text-[#966C00] dark:text-[#FFD54F] shrink-0 font-medium">
                    {asgn.workCategory}
                  </span>
                </div>

                {onToggleCompletion && (
                  <button
                    onClick={() => onToggleCompletion(event.id, asgn.id)}
                    className="flex items-center gap-1 text-[11px] font-bold shrink-0 cursor-pointer"
                  >
                    {asgn.isCompleted ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-400">ዝግጁ ሆኗል</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500 dark:text-slate-400">በዝግጅት ላይ</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Three Roles Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 text-left">
                  <span className="text-[9px] font-bold text-[#0C4A9E] dark:text-blue-300 block">
                    ✍️ ፀሃፊ
                  </span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate block">
                    {asgn.writerMemberName}
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/50 text-left">
                  <span className="text-[9px] font-bold text-[#B88500] dark:text-amber-300 block">
                    🎬 አዘጋጅ
                  </span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate block">
                    {asgn.organizerMemberName}
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 text-left">
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 block">
                    🎙️ አቅራቢ
                  </span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate block">
                    {asgn.presenterMemberName}
                  </span>
                </div>
              </div>

              {asgn.performanceNotes && (
                <p className="text-[11px] text-[#966C00] dark:text-[#FFD54F] font-serif-ethiopic bg-[#B88500]/10 p-1.5 rounded">
                  📋 መመሪያ፦ {asgn.performanceNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </ManuscriptBox>
  );
};
