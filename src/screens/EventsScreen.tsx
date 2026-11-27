import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  List,
  PlusCircle,
  Phone,
  Trash2,
  X,
  BookOpen,
  Users,
  Shield,
  Clock,
  MapPin,
  Star,
  PenLine,
  Clapperboard,
  Mic,
  CheckCircle,
  Circle,
  Plus,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  CulturalEvent,
  MemberDuty,
  ProgramRecurrence,
  SundaySchoolDepartment,
  SundaySchoolDivision,
  DIVISIONS,
} from '../types';
import { AppHeader } from '../components/AppHeader';
import {
  ChurchProgramCalendar,
  ProgramWithTasksCard,
  getWeekdayIndexFromAmharic,
} from '../components/ChurchProgramCalendar';

const ETHIOPIAN_WEEKDAYS = [
  { idx: 0, name: 'እሁድ', short: 'እሁ' },
  { idx: 1, name: 'ሰኞ', short: 'ሰኞ' },
  { idx: 2, name: 'ማክሰኞ', short: 'ማክ' },
  { idx: 3, name: 'ረቡዕ', short: 'ረቡ' },
  { idx: 4, name: 'ሐሙስ', short: 'ሐሙ' },
  { idx: 5, name: 'ዓርብ', short: 'ዓር' },
  { idx: 6, name: 'ቅዳሜ', short: 'ቅዳ' },
];

export const EventsScreen: React.FC = () => {
  const {
    events,
    members,
    works,
    currentUser,
    departmentsList,
    approvedDepartmentsList,
    canSwitchDepartments,
    isSuperAdmin,
    isDepartmentPortalLocked,
    isDeptAdmin,
    canApproveDeptMembers,
    firebaseUser,
    activeDepartment,
    setActiveDepartment,
    childrenAnnualPlan,
    maekelawiyanAnnualPlan,
    youthAnnualPlan,
    dailyPlanSheets,
    addEvent,
    addMember,
    deleteMember,
    addAssignmentToProgram,
    toggleAssignmentCompletion,
  } = useArchive();

  const isSingleDeptIsolated = Boolean(
    isDepartmentPortalLocked ||
      (!isSuperAdmin && !canSwitchDepartments && firebaseUser && approvedDepartmentsList.length <= 1)
  );

  const visibleDepartments = useMemo(() => {
    if (isDepartmentPortalLocked) {
      return departmentsList.filter((d) => d.id === activeDepartment);
    }
    if (isSuperAdmin) return departmentsList;
    if (firebaseUser && approvedDepartmentsList.length > 0 && !canSwitchDepartments) {
      return approvedDepartmentsList;
    }
    return departmentsList;
  }, [
    isDepartmentPortalLocked,
    activeDepartment,
    isSuperAdmin,
    firebaseUser,
    approvedDepartmentsList,
    canSwitchDepartments,
    departmentsList,
  ]);

  const [activeMainTab, setActiveMainTab] = useState<'programs' | 'members'>('programs');
  const [programViewMode, setProgramViewMode] = useState<'weekly' | 'calendar' | 'list'>('weekly');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(activeDepartment || 'ALL');
  const [selectedDutyFilter, setSelectedDutyFilter] = useState<MemberDuty | 'all'>('all');

  // Ehud 51-Sunday synced calendar controls
  const [ehudDiv, setEhudDiv] = useState<SundaySchoolDivision>('youth');
  const [ehudMonthFilter, setEhudMonthFilter] = useState<string>('ALL');

  // Modals state
  const [showAddProgramModal, setShowAddProgramModal] = useState<boolean>(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [assignTargetEvent, setAssignTargetEvent] = useState<CulturalEvent | null>(null);

  // New program form state
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgRecurrence, setNewProgRecurrence] = useState<ProgramRecurrence>('WEEKLY');
  const [newProgDeptId, setNewProgDeptId] = useState<SundaySchoolDepartment>(
    ((selectedDeptFilter !== 'ALL' ? selectedDeptFilter : activeDepartment) ||
      'kinetibeb') as SundaySchoolDepartment
  );
  const [newProgDate, setNewProgDate] = useState('በየሳምንቱ እሁድ');
  const [newProgTime, setNewProgTime] = useState('ከቀኑ ፯:፴ እስከ ፱:፴');
  const [newProgLocation, setNewProgLocation] = useState('ተክለ ሣዊሮስ ታላቁ አዳራሽ');
  const [newProgCategory, setNewProgCategory] = useState('ሳምንታዊ ጉባኤ');
  const [newProgDesc, setNewProgDesc] = useState('');

  // New member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDuty, setNewMemberDuty] = useState<MemberDuty>('WRITER');
  const [newMemberDeptId, setNewMemberDeptId] = useState<SundaySchoolDepartment>(
    ((selectedDeptFilter !== 'ALL' ? selectedDeptFilter : activeDepartment) ||
      'kinetibeb') as SundaySchoolDepartment
  );
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberTitle, setNewMemberTitle] = useState('አባል');
  const [newMemberBio, setNewMemberBio] = useState('');

  // Assignment form state
  const [assignWorkId, setAssignWorkId] = useState(works[0]?.id || '');
  const [assignWriterId, setAssignWriterId] = useState(
    members.find((m) => m.duty === 'WRITER')?.id || ''
  );
  const [assignOrganizerId, setAssignOrganizerId] = useState(
    members.find((m) => m.duty === 'ORGANIZER')?.id || ''
  );
  const [assignPresenterId, setAssignPresenterId] = useState(
    members.find((m) => m.duty === 'PRESENTER')?.id || ''
  );
  const [assignNotes, setAssignNotes] = useState('');

  useEffect(() => {
    if (isSingleDeptIsolated && activeDepartment) {
      setSelectedDeptFilter(activeDepartment);
      setNewProgDeptId(activeDepartment);
      setNewMemberDeptId(activeDepartment);
    } else if (
      selectedDeptFilter !== 'ALL' &&
      !visibleDepartments.some((d) => d.id === selectedDeptFilter)
    ) {
      setSelectedDeptFilter(visibleDepartments[0]?.id || activeDepartment || 'kinetibeb');
    }
  }, [isSingleDeptIsolated, activeDepartment, visibleDepartments, selectedDeptFilter]);

  const isAdmin =
    isSuperAdmin ||
    isDeptAdmin ||
    canApproveDeptMembers ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'EDITOR';

  const isEhudContext = selectedDeptFilter === 'ehud_merha_gibir';

  const getDutyLabel = (duty: MemberDuty, forEhud: boolean) => {
    if (forEhud) {
      if (duty === 'WRITER') return 'መርሐ ግብር ጸሐፊ';
      if (duty === 'ORGANIZER') return 'ተረኛ አስተባባሪ/መሪ';
      return 'መምህር/አቅራቢ';
    }
    if (duty === 'WRITER') return 'ፀሐፊ';
    if (duty === 'ORGANIZER') return 'አዘጋጅ';
    return 'አቅራቢ';
  };

  // Filter events by department
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedDeptFilter === 'ALL') return true;
      if (ev.departmentId === selectedDeptFilter) return true;
      const deptInfo = visibleDepartments.find((d) => d.id === selectedDeptFilter);
      if (
        deptInfo &&
        ev.organizer &&
        (ev.organizer.includes(deptInfo.shortTitleAmharic) ||
          ev.organizer.includes(deptInfo.titleAmharic))
      ) {
        return true;
      }
      if (!ev.departmentId && selectedDeptFilter === 'kinetibeb') return true;
      return false;
    });
  }, [events, selectedDeptFilter, visibleDepartments]);

  // Grouped schedule buckets for the modern Weekly Schedule view
  const weeklyProgramsByDay = useMemo(() => {
    const weeklyOnly = filteredEvents.filter((ev) => ev.recurrence === 'WEEKLY');
    return ETHIOPIAN_WEEKDAYS.map((day) => ({
      ...day,
      programs: weeklyOnly.filter((ev) => {
        const matched = getWeekdayIndexFromAmharic(ev.dateAmharic);
        if (matched !== null) return matched === day.idx;
        return day.idx === 0;
      }),
    }));
  }, [filteredEvents]);

  const activeWeeklyDays = useMemo(
    () => weeklyProgramsByDay.filter((d) => d.programs.length > 0),
    [weeklyProgramsByDay]
  );

  const quietWeeklyDays = useMemo(
    () => weeklyProgramsByDay.filter((d) => d.programs.length === 0),
    [weeklyProgramsByDay]
  );

  const nonWeeklyEvents = useMemo(
    () => filteredEvents.filter((ev) => ev.recurrence !== 'WEEKLY'),
    [filteredEvents]
  );

  // Filter members by department and duty
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (selectedDeptFilter !== 'ALL') {
        const deptInfo = visibleDepartments.find((d) => d.id === selectedDeptFilter);
        const isDirectMatch = m.departmentId === selectedDeptFilter;
        const isTextMatch =
          deptInfo &&
          m.department &&
          (m.department.includes(deptInfo.shortTitleAmharic) ||
            m.department.includes(deptInfo.badgeLabel));
        const isDefaultKinetibeb = !m.departmentId && selectedDeptFilter === 'kinetibeb';
        if (!isDirectMatch && !isTextMatch && !isDefaultKinetibeb) return false;
      }
      if (selectedDutyFilter === 'all') return true;
      return m.duty === selectedDutyFilter;
    });
  }, [members, selectedDeptFilter, selectedDutyFilter, visibleDepartments]);

  const selectedDepartmentInfo =
    visibleDepartments.find((d) => d.id === selectedDeptFilter) ||
    departmentsList.find((d) => d.id === selectedDeptFilter);

  const ehudPlanEntries = useMemo(() => {
    return ehudDiv === 'children'
      ? childrenAnnualPlan
      : ehudDiv === 'intermediates'
        ? maekelawiyanAnnualPlan
        : youthAnnualPlan;
  }, [ehudDiv, childrenAnnualPlan, maekelawiyanAnnualPlan, youthAnnualPlan]);

  const ehudMonths = useMemo(() => {
    return Array.from(new Set(ehudPlanEntries.map((e) => e.monthAmharic)));
  }, [ehudPlanEntries]);

  const filteredEhudEntries = useMemo(() => {
    if (ehudMonthFilter === 'ALL') return ehudPlanEntries;
    return ehudPlanEntries.filter((e) => e.monthAmharic === ehudMonthFilter);
  }, [ehudPlanEntries, ehudMonthFilter]);

  const openAssignModal = (event: CulturalEvent) => {
    const ehudEv =
      event.departmentId === 'ehud_merha_gibir' || selectedDeptFilter === 'ehud_merha_gibir';
    if (ehudEv && dailyPlanSheets[0]) {
      setAssignWorkId(`sheet:${dailyPlanSheets[0].id}`);
    } else if (works[0]) {
      setAssignWorkId(works[0].id);
    }
    setAssignTargetEvent(event);
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle.trim()) return;

    const deptObj = departmentsList.find((d) => d.id === newProgDeptId);
    const organizerName = deptObj?.titleAmharic || 'የኪነጥበብ ክፍል';

    addEvent({
      title: newProgTitle,
      recurrence: newProgRecurrence,
      dateAmharic: newProgDate,
      timeAmharic: newProgTime,
      location: newProgLocation,
      category: newProgCategory,
      description: newProgDesc,
      organizer: organizerName,
      departmentId: newProgDeptId,
    });
    setShowAddProgramModal(false);
    setNewProgTitle('');
    setNewProgDesc('');
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const deptObj = departmentsList.find((d) => d.id === newMemberDeptId);
    const departmentName = deptObj?.titleAmharic || 'የኪነጥበብ ክፍል';

    addMember({
      fullName: newMemberName,
      duty: newMemberDuty,
      phone: newMemberPhone,
      spiritualTitle: newMemberTitle,
      department: departmentName,
      departmentId: newMemberDeptId,
      bio: newMemberBio,
    });
    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberBio('');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetEvent) return;

    let itemId = assignWorkId;
    let itemTitle = 'የእሁድ መርሐ ግብር';
    let itemCategory = 'መርሐ ግብር';

    if (assignWorkId.startsWith('sheet:')) {
      const sheetId = assignWorkId.replace('sheet:', '');
      const matchedSheet = dailyPlanSheets.find((s) => s.id === sheetId);
      if (matchedSheet) {
        itemId = matchedSheet.id;
        itemTitle = `${matchedSheet.dateAmharic} — ${matchedSheet.mainTopic}`;
        itemCategory = `${DIVISIONS[matchedSheet.division]?.titleAmharic || ''} የዕለት ሉህ`;
      }
    } else {
      const selectedWork = works.find((w) => w.id === assignWorkId) || works[0];
      if (selectedWork) {
        itemId = selectedWork.id;
        itemTitle = selectedWork.title;
        itemCategory = selectedWork.categoryName;
      }
    }

    const writer = members.find((m) => m.id === assignWriterId);
    const organizer = members.find((m) => m.id === assignOrganizerId);
    const presenter = members.find((m) => m.id === assignPresenterId);

    addAssignmentToProgram(assignTargetEvent.id, {
      id: `asgn_${Date.now()}`,
      workId: itemId || `asgn_item_${Date.now()}`,
      workTitle: itemTitle,
      workCategory: itemCategory,
      writerMemberId: writer?.id,
      writerMemberName: writer?.fullName || 'ያልተመደበ',
      organizerMemberId: organizer?.id,
      organizerMemberName: organizer?.fullName || 'ያልተመደበ',
      presenterMemberId: presenter?.id,
      presenterMemberName: presenter?.fullName || 'ያልተመደበ',
      performanceNotes: assignNotes,
      isCompleted: false,
    });

    setAssignTargetEvent(null);
    setAssignNotes('');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      <AppHeader
        title="ሳምንታዊ መርሐ-ግብር እና አገልጋዮች"
        subtitle="ሳምንታዊ፣ ወርሃዊና ዓመታዊ መድረኮች በየክፍሉ"
        actions={
          isAdmin && (
            <button
              type="button"
              onClick={() => {
                if (selectedDeptFilter !== 'ALL') {
                  setNewProgDeptId(selectedDeptFilter as SundaySchoolDepartment);
                  setNewMemberDeptId(selectedDeptFilter as SundaySchoolDepartment);
                }
                if (activeMainTab === 'programs') setShowAddProgramModal(true);
                else setShowAddMemberModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#072958] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {activeMainTab === 'programs' ? 'አዲስ መርሐ-ግብር' : 'አዲስ አገልጋይ'}
              </span>
            </button>
          )
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-3 space-y-3.5">
        {/* Unified Compact Workspace Toolbar */}
        <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
          {/* Department Filter Strip (hidden when isolated to a single department) */}
          {!isSingleDeptIsolated && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedDeptFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDeptFilter === 'ALL'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ሁሉም ክፍላት{' '}
                <span className="font-mono tabular-nums opacity-80">({events.length})</span>
              </button>

              {visibleDepartments.map((dept) => {
                const isSelected = selectedDeptFilter === dept.id;
                const deptEventCount = events.filter(
                  (ev) =>
                    ev.departmentId === dept.id ||
                    (ev.organizer &&
                      (ev.organizer.includes(dept.shortTitleAmharic) ||
                        ev.organizer.includes(dept.titleAmharic))) ||
                    (!ev.departmentId && dept.id === 'kinetibeb')
                ).length;

                return (
                  <button
                    type="button"
                    key={dept.id}
                    onClick={() => {
                      if (isSingleDeptIsolated && dept.id !== activeDepartment) return;
                      setSelectedDeptFilter(dept.id);
                      setActiveDepartment(dept.id);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#B88500] text-white'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {dept.shortTitleAmharic}{' '}
                    <span className="font-mono tabular-nums opacity-80">({deptEventCount})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Department Quiet Context Line */}
          {selectedDepartmentInfo && selectedDeptFilter !== 'ALL' && (
            <div
              className={`flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 ${
                !isSingleDeptIsolated ? 'pt-2 border-t border-slate-100 dark:border-slate-800' : ''
              }`}
            >
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedDepartmentInfo.titleAmharic}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span>{selectedDepartmentInfo.badgeLabel}</span>
                {selectedDepartmentInfo.descriptionAmharic && (
                  <>
                    <span aria-hidden="true" className="hidden md:inline text-slate-300 dark:text-slate-700">·</span>
                    <span className="hidden md:inline truncate max-w-md">
                      {selectedDepartmentInfo.descriptionAmharic}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px]">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#B88500]" />
                  {selectedDepartmentInfo.coordinatorName || 'አስተባባሪ ኮሚቴ'}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <Users className="w-3.5 h-3.5 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                  {filteredMembers.length} አገልጋዮች
                </span>
              </div>
            </div>
          )}

          {/* Main Tab Switcher + Schedule View Mode Segmented Control */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Programs / Members Tabs */}
            <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setActiveMainTab('programs')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeMainTab === 'programs'
                    ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>
                  መርሐ-ግብራት{' '}
                  <span className="font-mono tabular-nums opacity-75">({filteredEvents.length})</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('members')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeMainTab === 'members'
                    ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  አገልጋዮች{' '}
                  <span className="font-mono tabular-nums opacity-75">({filteredMembers.length})</span>
                </span>
              </button>
            </div>

            {/* 3-Mode Schedule View Switcher */}
            {activeMainTab === 'programs' && (
              <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setProgramViewMode('weekly')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    programViewMode === 'weekly'
                      ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>ሳምንታዊ ሰሌዳ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProgramViewMode('calendar')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    programViewMode === 'calendar'
                      ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>የቀን መቁጠሪያ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProgramViewMode('list')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    programViewMode === 'list'
                      ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>ዝርዝር</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 1. PROGRAMS TAB */}
        {activeMainTab === 'programs' && (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-white dark:bg-[#111D30] border border-dashed border-slate-300 dark:border-slate-700">
                <CalendarIcon className="w-9 h-9 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  በዚህ ክፍል እስካሁን የተመዘገበ መርሐ-ግብር የለም
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  አዲስ መርሐ-ግብር ለመመዝገብ «አዲስ መርሐ-ግብር» የሚለውን ይጫኑ
                </p>
              </div>
            ) : programViewMode === 'weekly' ? (
              <div className="space-y-4">
                {/* 7-Day Modern Weekly Schedule Timetable */}
                <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h2 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                        ሳምንታዊ መደበኛ የአገልግሎት ሰሌዳ
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ከእሁድ እስከ ቅዳሜ በየሳምንቱ የሚካሄዱ መደበኛ ጉባኤያትና ልምምዶች
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {activeWeeklyDays.reduce((sum, d) => sum + d.programs.length, 0)} ሳምንታዊ
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewProgRecurrence('WEEKLY');
                            if (selectedDeptFilter !== 'ALL') {
                              setNewProgDeptId(selectedDeptFilter as SundaySchoolDepartment);
                            }
                            setShowAddProgramModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0C4A9E] dark:text-[#7FAFFF] text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>ሳምንታዊ ጨምር</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {activeWeeklyDays.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      በዚህ ክፍል የተመዘገበ ሳምንታዊ መደበኛ መርሐ-ግብር የለም። ወርሃዊና ዓመታዊ መርሐ-ግብራትን ከታች ይመልከቱ።
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeWeeklyDays.map((dayGroup) => (
                        <div
                          key={dayGroup.idx}
                          className="flex flex-col sm:flex-row sm:items-stretch"
                        >
                          {/* Left Day Column */}
                          <div className="sm:w-32 shrink-0 px-4 py-3 bg-slate-50/70 dark:bg-slate-900/40 sm:border-r border-b sm:border-b-0 border-slate-100 dark:border-slate-800 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-1">
                            <span
                              className={`text-sm font-bold font-serif-ethiopic ${
                                dayGroup.idx === 0
                                  ? 'text-[#0C4A9E] dark:text-[#7FAFFF]'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {dayGroup.name}
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                              {dayGroup.programs.length} መርሐ-ግብር
                            </span>
                          </div>

                          {/* Right Day Programs List */}
                          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                            {dayGroup.programs.map((prog) => {
                              const completedCount = prog.assignments.filter((a) => a.isCompleted).length;
                              return (
                                <div key={prog.id} className="p-3.5 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                          {prog.category}
                                        </span>
                                        {(prog.departmentTitle || prog.organizer) && (
                                          <>
                                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                                            <span className="text-[#0C4A9E] dark:text-[#7FAFFF] font-medium">
                                              {prog.departmentTitle || prog.organizer}
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                                        {prog.title}
                                      </h3>

                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                                        <span className="flex items-center gap-1 font-mono tabular-nums">
                                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                                          {prog.timeAmharic}
                                        </span>
                                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                          {prog.location}
                                        </span>
                                        {prog.assignments.length > 0 && (
                                          <>
                                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                                            <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                                              {completedCount}/{prog.assignments.length} ዝግጁ
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => openAssignModal(prog)}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0C4A9E] dark:text-[#7FAFFF] text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                    >
                                      + ሥራ መድብ
                                    </button>
                                  </div>

                                  {/* Compact Inline Assignments */}
                                  {prog.assignments.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                                      {prog.assignments.map((asgn) => (
                                        <div
                                          key={asgn.id}
                                          className="flex flex-wrap items-center justify-between gap-2 text-[11px]"
                                        >
                                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                                            <BookOpen className="w-3.5 h-3.5 text-[#0C4A9E] dark:text-[#7FAFFF] shrink-0" />
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                              {asgn.workTitle}
                                            </span>
                                            <span className="text-slate-400">·</span>
                                            <span className="text-slate-500 dark:text-slate-400">
                                              ፀሐፊ: {asgn.writerMemberName}
                                            </span>
                                            <span className="text-slate-400">·</span>
                                            <span className="text-slate-500 dark:text-slate-400">
                                              አቅራቢ: {asgn.presenterMemberName}
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => toggleAssignmentCompletion(prog.id, asgn.id)}
                                            className="flex items-center gap-1 font-semibold shrink-0 cursor-pointer hover:opacity-80"
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
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {quietWeeklyDays.length > 0 && activeWeeklyDays.length > 0 && (
                    <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      መደበኛ ሳምንታዊ ጉባኤ የሌለባቸው ቀናት፦{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {quietWeeklyDays.map((d) => d.name).join(' · ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Monthly & Yearly Compact Schedule Grid */}
                {nonWeeklyEvents.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        ወርሃዊ እና ዓመታዊ መርሐ-ግብራት
                      </h3>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        {nonWeeklyEvents.length} መርሐ-ግብራት
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {nonWeeklyEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col justify-between gap-2.5"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                                <span
                                  className={
                                    ev.recurrence === 'MONTHLY'
                                      ? 'text-[#B88500] dark:text-[#FFD54F]'
                                      : 'text-rose-700 dark:text-rose-400'
                                  }
                                >
                                  {ev.recurrence === 'MONTHLY' ? 'ወርሃዊ' : 'ዓመታዊ'}
                                </span>
                                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                                <span className="text-slate-500 dark:text-slate-400">{ev.category}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => openAssignModal(ev)}
                                className="text-[11px] font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                + ሥራ መድብ
                              </button>
                            </div>

                            <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                              {ev.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{ev.dateAmharic}</span>
                              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                              <span className="font-mono tabular-nums">{ev.timeAmharic}</span>
                              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                              <span>{ev.location}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="truncate">{ev.departmentTitle || ev.organizer}</span>
                            <span className="font-mono tabular-nums shrink-0">
                              {ev.assignments.length} የተመደቡ ሥራዎች
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : programViewMode === 'calendar' ? (
              <ChurchProgramCalendar
                events={filteredEvents}
                onAssignArtWorkClick={openAssignModal}
                onToggleTaskCompletion={toggleAssignmentCompletion}
                onAddEventClick={isAdmin ? () => setShowAddProgramModal(true) : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredEvents.map((event) => (
                  <ProgramWithTasksCard
                    key={event.id}
                    event={event}
                    onAssignClick={() => openAssignModal(event)}
                    onToggleCompletion={toggleAssignmentCompletion}
                  />
                ))}
              </div>
            )}

            {/* Synced 2019 51-Sunday & Feast Calendar when Ehud Merha Gibir is selected */}
            {isEhudContext && (
              <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-[#B88500]" />
                      <span>የ2019 ዓ.ም. የተመሳሰለ የ51-እሁድ እና በዓላት ሰሌዳ</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      ከየእርከኑ (ሕፃናት፣ ማዕከላውያን፣ ወጣቶች) ዓመታዊ ሰሌዳ ጋር የተገናኘ
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 shrink-0">
                    {(['youth', 'intermediates', 'children'] as SundaySchoolDivision[]).map((div) => (
                      <button
                        key={div}
                        type="button"
                        onClick={() => {
                          setEhudDiv(div);
                          setEhudMonthFilter('ALL');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          ehudDiv === div
                            ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {DIVISIONS[div].titleAmharic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Month Filter Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setEhudMonthFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      ehudMonthFilter === 'ALL'
                        ? 'bg-[#B88500] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    ሁሉም <span className="font-mono tabular-nums opacity-80">({ehudPlanEntries.length})</span>
                  </button>
                  {ehudMonths.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEhudMonthFilter(m)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        ehudMonthFilter === m
                          ? 'bg-[#B88500] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* 51-Sunday Compact Entries Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {filteredEhudEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        entry.isSpecialEvent
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-[#B88500]/40'
                          : !entry.hasProgram
                            ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                            : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                          {entry.dateFullAmharic}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                          {entry.isSpecialEvent && (
                            <span className="text-[#966C00] dark:text-[#FFD54F] font-semibold flex items-center gap-0.5">
                              <Star className="w-3 h-3" />
                              በዓል
                            </span>
                          )}
                          <span className="font-mono tabular-nums flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {entry.timeAmharic}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {entry.mainTopic}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {entry.category && <span>{entry.category}</span>}
                        {entry.leader && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>መሪ፦ {entry.leader}</span>
                          </>
                        )}
                        {entry.presenterOrTeacher && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>መምህር፦ {entry.presenterOrTeacher}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MEMBERS TAB */}
        {activeMainTab === 'members' && (
          <div className="space-y-3.5">
            {/* Duty Filter Segmented Bar */}
            <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDutyFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDutyFilter === 'all'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                ሁሉም <span className="font-mono tabular-nums opacity-80">({filteredMembers.length})</span>
              </button>

              {(['WRITER', 'ORGANIZER', 'PRESENTER'] as MemberDuty[]).map((duty) => {
                const isSelected = selectedDutyFilter === duty;
                const count = filteredMembers.filter((m) => m.duty === duty).length;
                const DutyIcon =
                  duty === 'WRITER' ? PenLine : duty === 'ORGANIZER' ? Clapperboard : Mic;
                return (
                  <button
                    type="button"
                    key={duty}
                    onClick={() => setSelectedDutyFilter(duty)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#B88500] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <DutyIcon className="w-3.5 h-3.5" />
                    <span>
                      {getDutyLabel(duty, isEhudContext)}{' '}
                      <span className="font-mono tabular-nums opacity-80">({count})</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Member Cards Grid */}
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-white dark:bg-[#111D30] border border-dashed border-slate-300 dark:border-slate-700">
                <Users className="w-9 h-9 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  በዚህ ክፍል የተመዘገበ አገልጋይ የለም
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  አዲስ አገልጋይ ለመመዝገብ «አዲስ አገልጋይ» የሚለውን ይጫኑ
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMembers.map((member) => {
                  const DutyIcon =
                    member.duty === 'WRITER'
                      ? PenLine
                      : member.duty === 'ORGANIZER'
                        ? Clapperboard
                        : Mic;
                  return (
                    <div
                      key={member.id}
                      className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-serif-ethiopic font-bold text-sm text-[#0C4A9E] dark:text-[#7FAFFF] shrink-0">
                              {member.fullName.charAt(0)}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {member.fullName}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {member.spiritualTitle} ·{' '}
                                {getDutyLabel(
                                  member.duty,
                                  member.departmentId === 'ehud_merha_gibir' || isEhudContext
                                )}
                              </p>
                            </div>
                          </div>

                          <DutyIcon className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {member.department} · ከ{member.joinedYear}
                        </p>

                        {member.bio && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {member.bio}
                          </p>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-mono tabular-nums truncate">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          {member.phone || '—'}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold font-mono tabular-nums text-[#0C4A9E] dark:text-[#7FAFFF]">
                            {member.assignedWorksCount || 0} ሥራ
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => deleteMember(member.id)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="አባል ሰርዝ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add Program */}
      {showAddProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowAddProgramModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mb-4">
              አዲስ መርሐ-ግብር ማዘጋጃ
            </h3>

            <form onSubmit={handleCreateProgram} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1">መርሐ-ግብሩ የሚካሄድበት ክፍል</label>
                <select
                  value={newProgDeptId}
                  disabled={isSingleDeptIsolated}
                  onChange={(e) => setNewProgDeptId(e.target.value as SundaySchoolDepartment)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-75"
                >
                  {visibleDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.titleAmharic} ({dept.badgeLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">የርዕስ ስም</label>
                <input
                  type="text"
                  required
                  value={newProgTitle}
                  onChange={(e) => setNewProgTitle(e.target.value)}
                  placeholder="የመርሐ-ግብር ርዕስ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">ድግግሞሽ (Recurrence)</label>
                  <select
                    value={newProgRecurrence}
                    onChange={(e) => setNewProgRecurrence(e.target.value as ProgramRecurrence)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="WEEKLY">ሳምንታዊ (Weekly)</option>
                    <option value="MONTHLY">ወርሃዊ (Monthly)</option>
                    <option value="YEARLY">ዓመታዊ (Yearly)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">ምድብ</label>
                  <input
                    type="text"
                    required
                    value={newProgCategory}
                    onChange={(e) => setNewProgCategory(e.target.value)}
                    placeholder="ለምሳሌ፡ ሳምንታዊ ጉባኤ"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">ቀን (Amharic)</label>
                  <input
                    type="text"
                    required
                    value={newProgDate}
                    onChange={(e) => setNewProgDate(e.target.value)}
                    placeholder="በየሳምንቱ እሁድ"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">ሰዓት</label>
                  <input
                    type="text"
                    required
                    value={newProgTime}
                    onChange={(e) => setNewProgTime(e.target.value)}
                    placeholder="ከቀኑ ፯:፴ እስከ ፱:፴"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ቦታ</label>
                <input
                  type="text"
                  required
                  value={newProgLocation}
                  onChange={(e) => setNewProgLocation(e.target.value)}
                  placeholder="ተክለ ሣዊሮስ ታላቁ አዳራሽ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ማብራሪያ</label>
                <textarea
                  rows={3}
                  value={newProgDesc}
                  onChange={(e) => setNewProgDesc(e.target.value)}
                  placeholder="ስለ መርሐ-ግብሩ ማብራሪያ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs shadow-md mt-2 cursor-pointer"
              >
                መርሐ-ግብሩን መዝግብ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Church Member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mb-4">
              አዲስ አገልጋይ / አባል መዝግብ
            </h3>

            <form onSubmit={handleCreateMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1">የሚያገለግልበት ክፍል</label>
                <select
                  value={newMemberDeptId}
                  disabled={isSingleDeptIsolated}
                  onChange={(e) => setNewMemberDeptId(e.target.value as SundaySchoolDepartment)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-75"
                >
                  {visibleDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.titleAmharic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ሙሉ ስም</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="የአባሉ ሙሉ ስም"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">ዋና ተግባር (Duty)</label>
                  <select
                    value={newMemberDuty}
                    onChange={(e) => setNewMemberDuty(e.target.value as MemberDuty)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="WRITER">
                      {getDutyLabel('WRITER', newMemberDeptId === 'ehud_merha_gibir')}
                    </option>
                    <option value="ORGANIZER">
                      {getDutyLabel('ORGANIZER', newMemberDeptId === 'ehud_merha_gibir')}
                    </option>
                    <option value="PRESENTER">
                      {getDutyLabel('PRESENTER', newMemberDeptId === 'ehud_merha_gibir')}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">መንፈሳዊ ማዕረግ / ሃላፊነት</label>
                  <input
                    type="text"
                    value={newMemberTitle}
                    onChange={(e) => setNewMemberTitle(e.target.value)}
                    placeholder="ለምሳሌ፡ አስተባባሪ"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ስልክ ቁጥር</label>
                <input
                  type="text"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="0911-00-00-00"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">አጭር መግለጫ (Bio)</label>
                <textarea
                  rows={2}
                  value={newMemberBio}
                  onChange={(e) => setNewMemberBio(e.target.value)}
                  placeholder="የአባሉ ተሞክሮ ወይም አገልግሎት"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs shadow-md mt-2 cursor-pointer"
              >
                አባሉን መዝግብ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Work or Ehud Schedule to Program */}
      {assignTargetEvent && (() => {
        const isEhudAssignment =
          assignTargetEvent.departmentId === 'ehud_merha_gibir' || isEhudContext;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setAssignTargetEvent(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
                {isEhudAssignment
                  ? `ለ«${assignTargetEvent.title}» የእሁድ መርሐ ግብርና ተረኛ መድብ`
                  : `የኪነጥበብ ሥራ ለ${assignTargetEvent.title} መድብ`}
              </h3>

              <p className="text-xs text-slate-500 mb-4">
                {isEhudAssignment
                  ? 'የዕለቱን መርሐ ግብር ሉህ፣ መርሐ ግብር ጸሐፊ፣ ተረኛ አስተባባሪና መምህር ይመድቡ'
                  : 'ፀሐፊ፣ አዘጋጅና አቅራቢ በመመደብ ዝግጅቱን ያጠናክሩ'}
              </p>

              <form onSubmit={handleCreateAssignment} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isEhudAssignment ? 'የእሁድ መርሐ ግብር ሉህ / ሰነድ ይምረጡ' : 'የኪነጥበብ ሥራ ይምረጡ'}
                  </label>
                  <select
                    value={assignWorkId}
                    onChange={(e) => setAssignWorkId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {isEhudAssignment && dailyPlanSheets.length > 0 && (
                      <optgroup label="የእሁድ መርሐ ግብር የዕለት ሉሆች (Daily Sheets)">
                        {dailyPlanSheets.map((s) => (
                          <option key={s.id} value={`sheet:${s.id}`}>
                            [{DIVISIONS[s.division]?.titleAmharic}] {s.dateAmharic} — {s.mainTopic}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label={isEhudAssignment ? 'የክፍሉ ሰነዶችና ቃለ-ጉባኤዎች' : 'የተመዘገቡ ሥራዎች'}>
                      {works
                        .filter((w) =>
                          isEhudAssignment
                            ? w.departmentId === 'ehud_merha_gibir'
                            : isSingleDeptIsolated
                              ? w.departmentId === activeDepartment
                              : true
                        )
                        .map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.title} ({w.categoryName} - {w.writerName})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] mb-1">
                      {getDutyLabel('WRITER', isEhudAssignment)}
                    </label>
                    <select
                      value={assignWriterId}
                      onChange={(e) => setAssignWriterId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      {members
                        .filter(
                          (m) =>
                            m.duty === 'WRITER' &&
                            (isEhudAssignment
                              ? m.departmentId === 'ehud_merha_gibir'
                              : isSingleDeptIsolated
                                ? m.departmentId === activeDepartment ||
                                  (!m.departmentId && activeDepartment === 'kinetibeb')
                                : true)
                        )
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fullName}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#B88500] dark:text-[#FFD54F] mb-1">
                      {getDutyLabel('ORGANIZER', isEhudAssignment)}
                    </label>
                    <select
                      value={assignOrganizerId}
                      onChange={(e) => setAssignOrganizerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      {members
                        .filter(
                          (m) =>
                            m.duty === 'ORGANIZER' &&
                            (isEhudAssignment
                              ? m.departmentId === 'ehud_merha_gibir'
                              : isSingleDeptIsolated
                                ? m.departmentId === activeDepartment ||
                                  (!m.departmentId && activeDepartment === 'kinetibeb')
                                : true)
                        )
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fullName}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      {getDutyLabel('PRESENTER', isEhudAssignment)}
                    </label>
                    <select
                      value={assignPresenterId}
                      onChange={(e) => setAssignPresenterId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      {members
                        .filter(
                          (m) =>
                            m.duty === 'PRESENTER' &&
                            (isEhudAssignment
                              ? m.departmentId === 'ehud_merha_gibir'
                              : isSingleDeptIsolated
                                ? m.departmentId === activeDepartment ||
                                  (!m.departmentId && activeDepartment === 'kinetibeb')
                                : true)
                        )
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fullName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isEhudAssignment ? 'የዕለቱ መርሐ ግብር መመሪያና ማስታወሻ' : 'የመድረክ መመሪያና ማስታወሻ'}
                  </label>
                  <textarea
                    rows={2}
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder={
                      isEhudAssignment
                        ? 'የአዳራሽ ዝግጅት፣ የሰዓት አከባበርና የመምህሩ ትኩረት ነጥቦች...'
                        : 'የአቀራረብ መመሪያዎች፣ የዜማና የመድረክ አልባሳት ማስታወሻ'
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs shadow-md mt-2 cursor-pointer"
                >
                  {isEhudAssignment ? 'ለእሁድ መርሐ-ግብሩ መድብ' : 'ሥራውን ለመርሐ-ግብሩ መድብ'}
                </button>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
