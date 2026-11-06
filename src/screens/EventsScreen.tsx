import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  PlusCircle,
  Phone,
  Trash2,
  X,
  BookOpen,
  Layers,
  Users,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  CulturalEvent,
  ChurchMember,
  MemberDuty,
  ProgramRecurrence,
  SundaySchoolDepartment,
  MEMBER_DUTY_LABELS,
} from '../types';
import { AppHeader } from '../components/AppHeader';
import { ChurchProgramCalendar, ProgramWithTasksCard } from '../components/ChurchProgramCalendar';
import { ManuscriptBox, HaragDivider } from '../components/Ornaments';

export const EventsScreen: React.FC = () => {
  const {
    events,
    members,
    works,
    currentUser,
    departmentsList,
    activeDepartment,
    setActiveDepartment,
    addEvent,
    deleteEvent,
    addMember,
    deleteMember,
    addAssignmentToProgram,
    toggleAssignmentCompletion,
  } = useArchive();

  const [activeMainTab, setActiveMainTab] = useState<'programs' | 'members'>('programs');
  const [programViewMode, setProgramViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedDutyFilter, setSelectedDutyFilter] = useState<MemberDuty | 'all'>('all');

  // Modals state
  const [showAddProgramModal, setShowAddProgramModal] = useState<boolean>(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [assignTargetEvent, setAssignTargetEvent] = useState<CulturalEvent | null>(null);

  // New program form state
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgRecurrence, setNewProgRecurrence] = useState<ProgramRecurrence>('WEEKLY');
  const [newProgDeptId, setNewProgDeptId] = useState<SundaySchoolDepartment>(
    (selectedDeptFilter !== 'ALL' ? selectedDeptFilter : activeDepartment) || 'kinetibeb'
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
    (selectedDeptFilter !== 'ALL' ? selectedDeptFilter : activeDepartment) || 'kinetibeb'
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

  const isAdmin =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'EDITOR';

  // Filter events by department
  const filteredEvents = events.filter((ev) => {
    if (selectedDeptFilter === 'ALL') return true;
    if (ev.departmentId === selectedDeptFilter) return true;
    const deptInfo = departmentsList.find((d) => d.id === selectedDeptFilter);
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

  // Filter members by department and duty
  const filteredMembers = members.filter((m) => {
    if (selectedDeptFilter !== 'ALL') {
      const deptInfo = departmentsList.find((d) => d.id === selectedDeptFilter);
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

  const selectedDepartmentInfo = departmentsList.find((d) => d.id === selectedDeptFilter);

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

    const selectedWork = works.find((w) => w.id === assignWorkId) || works[0];
    const writer = members.find((m) => m.id === assignWriterId);
    const organizer = members.find((m) => m.id === assignOrganizerId);
    const presenter = members.find((m) => m.id === assignPresenterId);

    addAssignmentToProgram(assignTargetEvent.id, {
      id: `asgn_${Date.now()}`,
      workId: selectedWork.id,
      workTitle: selectedWork.title,
      workCategory: selectedWork.categoryName,
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
        title="የቤተክርስቲያን መርሃ-ግብራት እና አገልጋዮች"
        subtitle="በየክፍሉ የተመደቡ ሳምንታዊ፣ ወርሃዊና ዓመታዊ መድረኮች"
        actions={
          isAdmin && (
            <button
              onClick={() => {
                if (selectedDeptFilter !== 'ALL') {
                  setNewProgDeptId(selectedDeptFilter);
                  setNewMemberDeptId(selectedDeptFilter);
                }
                if (activeMainTab === 'programs') setShowAddProgramModal(true);
                else setShowAddMemberModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0C4A9E] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#072958] shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">አዲስ ጨምር</span>
            </button>
          )
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Department Filter Ribbon */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#B88500]" />
              የክፍል ማጣሪያ፦
            </span>
            <span className="text-[11px] text-slate-500">
              {selectedDeptFilter === 'ALL'
                ? 'ሁሉም ክፍሎች ተመርጠዋል'
                : selectedDepartmentInfo?.titleAmharic}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => setSelectedDeptFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                selectedDeptFilter === 'ALL'
                  ? 'bg-[#0C4A9E] text-white border-[#0C4A9E] shadow-sm'
                  : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              ሁሉም ክፍላት ({events.length})
            </button>

            {departmentsList.map((dept) => {
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
                  key={dept.id}
                  onClick={() => {
                    setSelectedDeptFilter(dept.id);
                    setActiveDepartment(dept.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#B88500] text-white border-[#B88500] shadow-sm'
                      : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#B88500]/50'
                  }`}
                >
                  <span>{dept.shortTitleAmharic}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {deptEventCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Department Summary Banner (when not ALL) */}
        {selectedDepartmentInfo && selectedDeptFilter !== 'ALL' && (
          <div className="p-3.5 rounded-2xl bg-linear-to-r from-[#0C4A9E]/10 via-[#B88500]/10 to-transparent border border-[#B88500]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#0C4A9E] dark:text-[#7FAFFF]">
                  {selectedDepartmentInfo.titleAmharic}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#B88500]/20 text-[#966C00] dark:text-[#FFD54F]">
                  {selectedDepartmentInfo.badgeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                {selectedDepartmentInfo.descriptionAmharic}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs shrink-0 text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 bg-white/70 dark:bg-[#111D30] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                <Shield className="w-3.5 h-3.5 text-[#B88500]" />
                {selectedDepartmentInfo.coordinatorName || 'አስተባባሪ ኮሚቴ'}
              </span>
              <span className="flex items-center gap-1 bg-white/70 dark:bg-[#111D30] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                <Users className="w-3.5 h-3.5 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                {filteredMembers.length} አገልጋዮች
              </span>
            </div>
          </div>
        )}

        {/* Main Tab Switcher: Programs vs Members */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveMainTab('programs')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMainTab === 'programs'
                ? 'border-[#0C4A9E] text-[#0C4A9E] dark:border-[#7FAFFF] dark:text-[#7FAFFF]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>
              {selectedDeptFilter === 'ALL'
                ? `የቤተክርስቲያን መርሃ-ግብራት (${filteredEvents.length})`
                : `የክፍሉ መርሃ-ግብራት (${filteredEvents.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('members')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMainTab === 'members'
                ? 'border-[#0C4A9E] text-[#0C4A9E] dark:border-[#7FAFFF] dark:text-[#7FAFFF]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {selectedDeptFilter === 'ALL'
                ? `የሰንበት ት/ቤት አገልጋዮች (${filteredMembers.length})`
                : `የክፍሉ አባላትና አገልጋዮች (${filteredMembers.length})`}
            </span>
          </button>
        </div>

        {/* 1. PROGRAMS TAB */}
        {activeMainTab === 'programs' && (
          <div className="space-y-4">
            {/* View Mode Toggle: Calendar vs List */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                የእይታ አማራጭ፦
              </span>

              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setProgramViewMode('calendar')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    programViewMode === 'calendar'
                      ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>የቀን መቁጠሪያ እይታ</span>
                </button>

                <button
                  onClick={() => setProgramViewMode('list')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    programViewMode === 'list'
                      ? 'bg-white dark:bg-[#111D30] text-[#0C4A9E] dark:text-[#7FAFFF] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>የዝርዝር እይታ</span>
                </button>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-white/50 dark:bg-[#111D30]/50 border border-dashed border-[#B88500]/30">
                <CalendarIcon className="w-10 h-10 mx-auto text-[#B88500]/50 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  በዚህ ክፍል እስካሁን የተመዘገበ መርሃ-ግብር የለም
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  አዲስ መርሃ-ግብር ለመመዝገብ «አዲስ ጨምር» የሚለውን ይጫኑ
                </p>
              </div>
            ) : programViewMode === 'calendar' ? (
              <ChurchProgramCalendar
                events={filteredEvents}
                onAssignArtWorkClick={(event) => setAssignTargetEvent(event)}
                onToggleTaskCompletion={toggleAssignmentCompletion}
                onAddEventClick={isAdmin ? () => setShowAddProgramModal(true) : undefined}
              />
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <ProgramWithTasksCard
                    key={event.id}
                    event={event}
                    onAssignClick={() => setAssignTargetEvent(event)}
                    onToggleCompletion={toggleAssignmentCompletion}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. MEMBERS TAB */}
        {activeMainTab === 'members' && (
          <div className="space-y-4">
            {/* Duty Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedDutyFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 cursor-pointer ${
                  selectedDutyFilter === 'all'
                    ? 'bg-[#0C4A9E] text-white border-[#0C4A9E]'
                    : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                ሁሉም አገልጋዮች ({filteredMembers.length})
              </button>

              {(['WRITER', 'ORGANIZER', 'PRESENTER'] as MemberDuty[]).map((duty) => {
                const isSelected = selectedDutyFilter === duty;
                const config = MEMBER_DUTY_LABELS[duty];
                const count = filteredMembers.filter((m) => m.duty === duty).length;
                return (
                  <button
                    key={duty}
                    onClick={() => setSelectedDutyFilter(duty)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#B88500] text-white border-[#B88500]'
                        : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {config.icon} {config.amharic} ({count})
                  </button>
                );
              })}
            </div>

            {/* Member Cards Grid */}
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-white/50 dark:bg-[#111D30]/50 border border-dashed border-[#B88500]/30">
                <Users className="w-10 h-10 mx-auto text-[#B88500]/50 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  በዚህ ክፍል የተመዘገበ አገልጋይ የለም
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  አዲስ አገልጋይ ለመመዝገብ «አዲስ ጨምር» የሚለውን ይጫኑ
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredMembers.map((member) => (
                  <ManuscriptBox
                    key={member.id}
                    className="p-4 sm:p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#0C4A9E]/10 border-2 border-[#B88500] flex items-center justify-center font-serif-ethiopic font-bold text-lg text-[#0C4A9E] dark:text-[#7FAFFF]">
                            {member.fullName.charAt(0)}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {member.fullName}
                              </h4>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#B88500]/15 text-[#966C00] dark:text-[#FFD54F]">
                                {member.spiritualTitle}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {member.department} • ከ{member.joinedYear} ጀምሮ
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {MEMBER_DUTY_LABELS[member.duty]?.icon}{' '}
                          {MEMBER_DUTY_LABELS[member.duty]?.amharic}
                        </span>
                      </div>

                      {member.bio && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 font-serif-ethiopic line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-[#B88500]" />
                        {member.phone || 'ስልክ አልተመዘገበም'}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                          {member.assignedWorksCount || 0} የተመደቡ ሥራዎች
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => deleteMember(member.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="አባል ሰርዝ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </ManuscriptBox>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add Program */}
      {showAddProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111D30] border-2 border-[#B88500] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
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
                  onChange={(e) => setNewProgDeptId(e.target.value as SundaySchoolDepartment)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {departmentsList.map((dept) => (
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
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#111D30] border-2 border-[#B88500] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
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
                  onChange={(e) => setNewMemberDeptId(e.target.value as SundaySchoolDepartment)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {departmentsList.map((dept) => (
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
                    <option value="WRITER">✍️ ፀሃፊ / አዘጋጅ</option>
                    <option value="ORGANIZER">🎬 አስተባባሪ / መሪ</option>
                    <option value="PRESENTER">🎙️ አቅራቢ / ተናጋሪ</option>
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

      {/* Modal: Assign Art Work to Program */}
      {assignTargetEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111D30] border-2 border-[#B88500] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAssignTargetEvent(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
              የኪነጥበብ ሥራ ለ{assignTargetEvent.title} መድብ
            </h3>

            <p className="text-xs text-slate-500 mb-4">
              ፀሃፊ፣ አዘጋጅና አቅራቢ በመመደብ ዝግጅቱን ያጠናክሩ
            </p>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1">የኪነጥበብ ሥራ ይምረጡ</label>
                <select
                  value={assignWorkId}
                  onChange={(e) => setAssignWorkId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  {works.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({w.categoryName} - {w.writerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#0C4A9E] mb-1">✍️ ፀሃፊ</label>
                  <select
                    value={assignWriterId}
                    onChange={(e) => setAssignWriterId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {members
                      .filter((m) => m.duty === 'WRITER')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#B88500] mb-1">🎬 አዘጋጅ</label>
                  <select
                    value={assignOrganizerId}
                    onChange={(e) => setAssignOrganizerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {members
                      .filter((m) => m.duty === 'ORGANIZER')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-700 mb-1">🎙️ አቅራቢ</label>
                  <select
                    value={assignPresenterId}
                    onChange={(e) => setAssignPresenterId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {members
                      .filter((m) => m.duty === 'PRESENTER')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">የመድረክ መመሪያና ማስታወሻ</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="የአቀራረብ መመሪያዎች፣ የዜማና የመድረክ አልባሳት ማስታወሻ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs shadow-md mt-2 cursor-pointer"
              >
                ሥራውን ለመርሐ-ግብሩ መድብ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
