import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  PlusCircle,
  Phone,
  Trash2,
  CheckCircle2,
  X,
  BookOpen,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { CulturalEvent, ChurchMember, MemberDuty, ProgramRecurrence, SundaySchoolDivision, MEMBER_DUTY_LABELS } from '../types';
import { AppHeader } from '../components/AppHeader';
import { ChurchProgramCalendar, ProgramWithTasksCard } from '../components/ChurchProgramCalendar';
import { ManuscriptBox, HaragDivider } from '../components/Ornaments';

export const EventsScreen: React.FC = () => {
  const {
    events,
    members,
    works,
    currentUser,
    addEvent,
    deleteEvent,
    addMember,
    deleteMember,
    addAssignmentToProgram,
    toggleAssignmentCompletion,
  } = useArchive();

  const [activeMainTab, setActiveMainTab] = useState<'programs' | 'members'>('programs');
  const [programViewMode, setProgramViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDutyFilter, setSelectedDutyFilter] = useState<MemberDuty | 'all'>('all');

  // Modals state
  const [showAddProgramModal, setShowAddProgramModal] = useState<boolean>(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [assignTargetEvent, setAssignTargetEvent] = useState<CulturalEvent | null>(null);

  // New program form state
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgRecurrence, setNewProgRecurrence] = useState<ProgramRecurrence>('WEEKLY');
  const [newProgDate, setNewProgDate] = useState('በየሳምንቱ እሁድ');
  const [newProgTime, setNewProgTime] = useState('ከቀኑ ፯:፴ እስከ ፱:፴');
  const [newProgLocation, setNewProgLocation] = useState('ተክለ ሣዊሮስ ታላቁ አዳራሽ');
  const [newProgCategory, setNewProgCategory] = useState('ሳምንታዊ ጉባኤ');
  const [newProgDesc, setNewProgDesc] = useState('');

  // New member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDuty, setNewMemberDuty] = useState<MemberDuty>('WRITER');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberTitle, setNewMemberTitle] = useState('አባል');
  const [newMemberDept, setNewMemberDept] = useState('የኪነጥበብ ክፍል');
  const [newMemberBio, setNewMemberBio] = useState('');

  // Assignment form state
  const [assignWorkId, setAssignWorkId] = useState(works[0]?.id || '');
  const [assignWriterId, setAssignWriterId] = useState(members.find((m) => m.duty === 'WRITER')?.id || '');
  const [assignOrganizerId, setAssignOrganizerId] = useState(members.find((m) => m.duty === 'ORGANIZER')?.id || '');
  const [assignPresenterId, setAssignPresenterId] = useState(members.find((m) => m.duty === 'PRESENTER')?.id || '');
  const [assignNotes, setAssignNotes] = useState('');

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'EDITOR';

  const filteredMembers = members.filter((m) => {
    if (selectedDutyFilter === 'all') return true;
    return m.duty === selectedDutyFilter;
  });

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle.trim()) return;
    addEvent({
      title: newProgTitle,
      recurrence: newProgRecurrence,
      dateAmharic: newProgDate,
      timeAmharic: newProgTime,
      location: newProgLocation,
      category: newProgCategory,
      description: newProgDesc,
      organizer: 'የኪነጥበብ ክፍል',
    });
    setShowAddProgramModal(false);
    setNewProgTitle('');
    setNewProgDesc('');
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addMember({
      fullName: newMemberName,
      duty: newMemberDuty,
      phone: newMemberPhone,
      spiritualTitle: newMemberTitle,
      department: newMemberDept,
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
        title="የቤተክርስቲያን መርሃ-ግብራት እና አባላት"
        subtitle="ሳምንታዊ፣ ወርሃዊና ዓመታዊ መድረኮች ከሥነፅሁፍ ምደባ ጋር"
        actions={
          isAdmin && (
            <button
              onClick={() => {
                if (activeMainTab === 'programs') setShowAddProgramModal(true);
                else setShowAddMemberModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0C4A9E] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#072958] shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">አዲስ ጨምር</span>
            </button>
          )
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Main Tab Switcher: Programs vs Members */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveMainTab('programs')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeMainTab === 'programs'
                ? 'border-[#0C4A9E] text-[#0C4A9E] dark:border-[#7FAFFF] dark:text-[#7FAFFF]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>የቤተክርስቲያን መርሃ-ግብራት ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('members')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeMainTab === 'members'
                ? 'border-[#0C4A9E] text-[#0C4A9E] dark:border-[#7FAFFF] dark:text-[#7FAFFF]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>የኪነጥበብ አባላት ({members.length})</span>
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
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

            {programViewMode === 'calendar' ? (
              <ChurchProgramCalendar
                events={events}
                onAssignArtWorkClick={(event) => setAssignTargetEvent(event)}
                onToggleTaskCompletion={toggleAssignmentCompletion}
                onAddEventClick={isAdmin ? () => setShowAddProgramModal(true) : undefined}
              />
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                  selectedDutyFilter === 'all'
                    ? 'bg-[#0C4A9E] text-white border-[#0C4A9E]'
                    : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                ሁሉም አባላት ({members.length})
              </button>

              {(['WRITER', 'ORGANIZER', 'PRESENTER'] as MemberDuty[]).map((duty) => {
                const isSelected = selectedDutyFilter === duty;
                const config = MEMBER_DUTY_LABELS[duty];
                const count = members.filter((m) => m.duty === duty).length;
                return (
                  <button
                    key={duty}
                    onClick={() => setSelectedDutyFilter(duty)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredMembers.map((member) => (
                <ManuscriptBox key={member.id} className="p-4 sm:p-5 flex flex-col justify-between">
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
                        {MEMBER_DUTY_LABELS[member.duty].icon} {MEMBER_DUTY_LABELS[member.duty].amharic}
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
                        {member.assignedWorksCount} የተመደቡ ሥራዎች
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => deleteMember(member.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
          </div>
        )}
      </div>

      {/* Modal: Add Program */}
      {showAddProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111D30] border-2 border-[#B88500] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddProgramModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mb-4">
              አዲስ መርሐ-ግብር ማዘጋጃ
            </h3>

            <form onSubmit={handleCreateProgram} className="space-y-3.5">
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
                className="w-full py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs shadow-md mt-2"
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
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mb-4">
              አዲስ የኪነጥበብ አባል መዝግብ
            </h3>

            <form onSubmit={handleCreateMember} className="space-y-3.5">
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
                    <option value="WRITER">✍️ ፀሃፊ (Writer)</option>
                    <option value="ORGANIZER">🎬 አዘጋጅ (Organizer)</option>
                    <option value="PRESENTER">🎙️ አቅራቢ (Presenter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">መንፈሳዊ ማዕረግ</label>
                  <input
                    type="text"
                    value={newMemberTitle}
                    onChange={(e) => setNewMemberTitle(e.target.value)}
                    placeholder="ለምሳሌ፡ ዋና ፀሃፊ"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs font-bold mb-1">ክፍል (Department)</label>
                  <input
                    type="text"
                    value={newMemberDept}
                    onChange={(e) => setNewMemberDept(e.target.value)}
                    placeholder="የስነ ጽሁፍ ክፍል"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
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
                className="w-full py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs shadow-md mt-2"
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
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700"
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
                    {members.filter((m) => m.duty === 'WRITER').map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
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
                    {members.filter((m) => m.duty === 'ORGANIZER').map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
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
                    {members.filter((m) => m.duty === 'PRESENTER').map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
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
                className="w-full py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs shadow-md mt-2"
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
