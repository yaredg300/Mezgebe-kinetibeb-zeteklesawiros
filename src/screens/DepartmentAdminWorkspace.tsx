import React, { useState } from 'react';
import {
  Users,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  UserCheck,
  UserX,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Shield,
  Building2,
  CalendarDays,
  Send,
  Eye,
  ChevronRight,
  X,
  FileText,
  BadgeAlert,
  AlertCircle,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  DepartmentMembership,
  ScheduleTaskAssignment,
  ScheduleTaskStatus,
  UserRole,
  SundaySchoolDivision,
  DIVISIONS,
  MEMBERSHIP_STATUS_CONFIG,
  SCHEDULE_TASK_STATUS_CONFIG,
  USER_ROLES,
} from '../types';
import { HaragDivider, CrossOrnament, ManuscriptBox } from '../components/Ornaments';

type AdminWorkspaceTab =
  | 'OVERVIEW'
  | 'REQUESTS'
  | 'MEMBERS'
  | 'SCHEDULE_AGENDA'
  | 'ASSIGNMENTS'
  | 'SUBMISSIONS';

export const DepartmentAdminWorkspace: React.FC<{
  onOpenWorkClick?: (workId: string) => void;
  onOpenScheduleDetails?: (programId: string) => void;
}> = ({ onOpenWorkClick, onOpenScheduleDetails }) => {
  const {
    activeDepartment,
    departmentsList,
    departmentMemberships,
    scheduleAssignments,
    dailyPlanSheets,
    currentUser,
    isSuperAdmin,
    approveMembershipRequest,
    rejectMembershipRequest,
    suspendMembership,
    createScheduleAssignment,
    updateScheduleAssignment,
    reviewAssignment,
    deleteScheduleAssignment,
    checkMemberWorkload,
  } = useArchive();

  const [activeTab, setActiveTab] = useState<AdminWorkspaceTab>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal States
  const [approvingMembership, setApprovingMembership] = useState<DepartmentMembership | null>(null);
  const [assignedRoleForApproval, setAssignedRoleForApproval] = useState<UserRole>('CONTRIBUTOR');

  const [rejectingMembership, setRejectingMembership] = useState<DepartmentMembership | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  const [suspendingMembership, setSuspendingMembership] = useState<DepartmentMembership | null>(null);
  const [suspensionReasonText, setSuspensionReasonText] = useState<string>('');

  const [reviewingAssignment, setReviewingAssignment] = useState<ScheduleTaskAssignment | null>(null);
  const [reviewFeedbackText, setReviewFeedbackText] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignForm, setAssignForm] = useState<{
    scheduleProgramId: string;
    agendaSlotId: string;
    agendaSlotTitle: string;
    division: SundaySchoolDivision;
    title: string;
    instructions: string;
    assignedMemberIds: string[];
    groupName: string;
    responsibleLeadId: string;
    programDate: string;
    programTime: string;
    deadlineDate: string;
    requiredDeliverable: string;
    overrideOverlap: boolean;
  }>({
    scheduleProgramId: 'yth_hidar_6',
    agendaSlotId: '',
    agendaSlotTitle: 'የመክፈቻ ጸሎትና ምስጋና',
    division: 'youth',
    title: '',
    instructions: '',
    assignedMemberIds: [],
    groupName: '',
    responsibleLeadId: '',
    programDate: 'ኅዳር 6 2019 ዓ.ም.',
    programTime: '7:30–9:30',
    deadlineDate: 'ኅዳር 4 2019 ዓ.ም.',
    requiredDeliverable: '',
    overrideOverlap: false,
  });

  const currentDeptInfo = departmentsList.find((d) => d.id === activeDepartment);

  // Scoped Department Data
  const deptMemberships = departmentMemberships.filter((m) => m.departmentId === activeDepartment);
  const pendingRequests = deptMemberships.filter((m) => m.status === 'PENDING');
  const approvedMembers = deptMemberships.filter((m) => m.status === 'APPROVED');
  const deptAssignments = scheduleAssignments.filter((a) => a.departmentId === activeDepartment);
  const submittedTasks = deptAssignments.filter((a) => a.status === 'SUBMITTED');
  const completedTasks = deptAssignments.filter((a) => a.status === 'COMPLETED');
  const inProgressTasks = deptAssignments.filter((a) =>
    ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(a.status)
  );

  // Schedule sheets for this department
  const relevantDailySheets = dailyPlanSheets.filter((sheet) => {
    if (activeDepartment === 'ehud_merha_gibir') return true;
    if (activeDepartment === 'kinetibeb') return sheet.division === 'youth';
    return true;
  });

  // Handle open direct assignment from agenda slot
  const handleOpenSlotAssignment = (
    sheetId: string,
    slotId: string,
    slotTitle: string,
    dateAmharic: string,
    timeRange: string,
    division: SundaySchoolDivision
  ) => {
    setAssignForm({
      scheduleProgramId: sheetId,
      agendaSlotId: slotId,
      agendaSlotTitle: slotTitle,
      division,
      title: `${slotTitle} አፈጻጸም`,
      instructions: `በ${dateAmharic} ክፍለ-ጊዜ በሰዓቱ ተገኝቶ ${slotTitle} ማከናወን።`,
      assignedMemberIds: approvedMembers.length > 0 ? [approvedMembers[0].userId] : [],
      groupName: '',
      responsibleLeadId: approvedMembers.length > 0 ? approvedMembers[0].userId : '',
      programDate: dateAmharic,
      programTime: timeRange,
      deadlineDate: dateAmharic,
      requiredDeliverable: '',
      overrideOverlap: false,
    });
    setShowAssignModal(true);
  };

  // Submit new assignment
  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.title.trim() || assignForm.assignedMemberIds.length === 0) return;

    const leadId = assignForm.responsibleLeadId || assignForm.assignedMemberIds[0];
    const finalAssignedIds = Array.from(new Set([...assignForm.assignedMemberIds, leadId]));
    const leadMember = approvedMembers.find((m) => m.userId === leadId);
    const assignedNames = finalAssignedIds.map((id) => {
      const found = approvedMembers.find((m) => m.userId === id);
      return found ? found.userName : id;
    });

    setIsSubmitting(true);
    setActionError(null);
    try {
      await createScheduleAssignment({
        departmentId: activeDepartment,
        departmentTitle: currentDeptInfo?.titleAmharic || activeDepartment,
        scheduleProgramId: assignForm.scheduleProgramId,
        agendaSlotId: assignForm.agendaSlotId,
        agendaSlotTitle: assignForm.agendaSlotTitle,
        division: assignForm.division,
        title: assignForm.title,
        instructions: assignForm.instructions,
        assignedMemberIds: finalAssignedIds,
        assignedMemberNames: assignedNames,
        groupName: assignForm.groupName || undefined,
        responsibleLeadId: leadId,
        responsibleLeadName: leadMember?.userName || assignedNames[0],
        programDate: assignForm.programDate,
        programTime: assignForm.programTime,
        deadlineDate: assignForm.deadlineDate,
        requiredDeliverable: assignForm.requiredDeliverable || undefined,
        status: 'ASSIGNED',
      });
      setShowAssignModal(false);
    } catch (err: any) {
      setActionError(err?.message || 'ሥራውን መመደብ አልተቻለም።');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Workload check for selected lead
  const selectedLeadWorkload = assignForm.responsibleLeadId
    ? checkMemberWorkload(assignForm.responsibleLeadId, assignForm.programDate)
    : { activeTaskCount: 0, hasOverlap: false, overlappingAssignments: [] };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#0C4A9E] via-[#072958] to-[#141926] text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B88500]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B88500] text-slate-900 text-[10px] font-black tracking-wider uppercase">
                የክፍሉ አስተዳዳሪ ዴስክ
              </span>
              <span className="text-xs text-blue-200">
                {isSuperAdmin ? 'የበላይ አስተዳዳሪ (Super Admin)' : 'የክፍል ኃላፊ (Dept Admin)'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-[#FFD54F]">
              {currentDeptInfo?.titleAmharic || 'የክፍሉ የሥራ ገበታ'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-serif-ethiopic mt-0.5">
              የአባላት ማረጋገጫ፣ የሥራ ምደባዎች፣ ዕለታዊ አጀንዳዎችና የቀረቡ ሰነዶች ግምገማ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAssignForm({
                  scheduleProgramId: 'yth_hidar_6',
                  agendaSlotId: '',
                  agendaSlotTitle: 'የእሁድ ክፍለ-ጊዜ',
                  division: 'youth',
                  title: '',
                  instructions: '',
                  assignedMemberIds: approvedMembers.length > 0 ? [approvedMembers[0].userId] : [],
                  groupName: '',
                  responsibleLeadId: approvedMembers.length > 0 ? approvedMembers[0].userId : '',
                  programDate: 'ኅዳር 6 2019 ዓ.ም.',
                  programTime: '7:30–9:30',
                  deadlineDate: 'ኅዳር 4 2019 ዓ.ም.',
                  requiredDeliverable: '',
                  overrideOverlap: false,
                });
                setShowAssignModal(true);
              }}
              className="px-4 py-2 rounded-full bg-[#B88500] hover:bg-[#9E7200] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>አዲስ ሥራ መድብ (Assign)</span>
            </button>
          </div>
        </div>

        {/* Workspace Sub-tabs Navigation */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 scrollbar-none border-t border-white/10 pt-3">
          {[
            { id: 'OVERVIEW', label: 'አጠቃላይ (Overview)', count: undefined },
            { id: 'REQUESTS', label: 'የአባልነት ጥያቄዎች', count: pendingRequests.length },
            { id: 'MEMBERS', label: 'የክፍሉ አባላትና ጫና', count: approvedMembers.length },
            { id: 'SCHEDULE_AGENDA', label: 'የመርሐ ግብር ክፍለ-ጊዜዎች', count: relevantDailySheets.length },
            { id: 'ASSIGNMENTS', label: 'የሥራ ምደባዎች', count: deptAssignments.length },
            { id: 'SUBMISSIONS', label: 'የቀረቡ ሥራዎችና ግምገማ', count: submittedTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminWorkspaceTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-[#0C4A9E] shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === tab.id
                      ? tab.count > 0 && tab.id === 'REQUESTS'
                        ? 'bg-rose-600 text-white'
                        : 'bg-blue-100 text-blue-900'
                      : tab.count > 0 && tab.id === 'REQUESTS'
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div
              onClick={() => setActiveTab('MEMBERS')}
              className="p-4 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-[#0C4A9E] transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold">አባላት</span>
                <Users className="w-4 h-4 text-[#0C4A9E]" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {approvedMembers.length}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">የጸደቁ አባላት</span>
            </div>

            <div
              onClick={() => setActiveTab('REQUESTS')}
              className="p-4 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold">አዳዲስ ጥያቄዎች</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {pendingRequests.length}
              </p>
              <span className="text-[10px] text-slate-500">ማረጋገጫ የሚጠብቁ</span>
            </div>

            <div
              onClick={() => setActiveTab('SCHEDULE_AGENDA')}
              className="p-4 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-[#B88500] transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold">መርሐ ግብሮች</span>
                <CalendarDays className="w-4 h-4 text-[#B88500]" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {relevantDailySheets.length}
              </p>
              <span className="text-[10px] text-slate-500">የ2019 ዕለታዊ እቅዶች</span>
            </div>

            <div
              onClick={() => setActiveTab('ASSIGNMENTS')}
              className="p-4 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-500 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold">የሥራ ምደባዎች</span>
                <CalendarCheck2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {deptAssignments.length}
              </p>
              <span className="text-[10px] text-blue-600 font-bold">{inProgressTasks.length} በሂደት ላይ</span>
            </div>

            <div
              onClick={() => setActiveTab('SUBMISSIONS')}
              className="p-4 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-indigo-500 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold">የቀረቡ ሰነዶች</span>
                <FileCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {submittedTasks.length}
              </p>
              <span className="text-[10px] text-slate-500">ግምገማ የሚጠብቁ</span>
            </div>

            <div
              onClick={() => setActiveTab('ASSIGNMENTS')}
              className="p-4 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-emerald-500 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold">የተጠናቀቁ</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {completedTasks.length}
              </p>
              <span className="text-[10px] text-slate-500">የጸደቁ ሥራዎች</span>
            </div>
          </div>

          {/* Pending Alerts Banner */}
          {pendingRequests.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 flex items-center justify-center shrink-0">
                  <BadgeAlert className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {pendingRequests.length} አዳዲስ የአባልነት ማመልከቻዎች ውሳኔ ይጠብቃሉ
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    አባላቱ የክፍሉን መረጃዎች ማየትና በሥራዎች ላይ መሳተፍ የሚችሉት ሲያጸድቁላቸው ብቻ ነው።
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('REQUESTS')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap shadow-xs"
              >
                ጥያቄዎቹን ገምግም
              </button>
            </div>
          )}

          {/* Quick Schedule Preview & Agenda Assignment */}
          <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#B88500]" />
                  <span>የሚቀጥሉ ዕለታዊ መርሐ ግብሮችና ክፍለ-ጊዜዎች (Upcoming Programs)</span>
                </h3>
                <p className="text-xs text-slate-500">ከመርሐ ግብሩ በቀጥታ ክፍለ-ጊዜዎችን ለአባላት መድብ</p>
              </div>
              <button
                onClick={() => setActiveTab('SCHEDULE_AGENDA')}
                className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline flex items-center gap-1"
              >
                <span>ሁሉንም አጀንዳዎች ተመልከት</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {relevantDailySheets.slice(0, 2).map((sheet) => (
                <div
                  key={sheet.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#8B0000] text-white text-[10px] font-black">
                          {sheet.dateAmharic}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {sheet.mainTopic}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        የዕለቱ መሪ፦ {sheet.leader} | ሰዓት፦ {sheet.timeAmharic}
                      </p>
                    </div>
                  </div>

                  {/* Agenda timetable slots */}
                  <div className="mt-3 space-y-2">
                    {sheet.slots.slice(0, 4).map((slot) => {
                      const existingAssignment = deptAssignments.find(
                        (a) => a.scheduleProgramId === sheet.id && a.agendaSlotId === slot.id
                      );

                      return (
                        <div
                          key={slot.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300 shrink-0">
                              {slot.timeRange}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {slot.slotTitle}
                            </span>
                            {slot.inCharge && (
                              <span className="text-[11px] text-slate-500">({slot.inCharge})</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {existingAssignment ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-[10px] font-bold text-blue-900 dark:text-blue-200">
                                  የተመደበ፦ {existingAssignment.responsibleLeadName}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    SCHEDULE_TASK_STATUS_CONFIG[existingAssignment.status]?.bgClass
                                  } ${SCHEDULE_TASK_STATUS_CONFIG[existingAssignment.status]?.colorClass}`}
                                >
                                  {SCHEDULE_TASK_STATUS_CONFIG[existingAssignment.status]?.amharicLabel}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleOpenSlotAssignment(
                                    sheet.id,
                                    slot.id,
                                    slot.slotTitle,
                                    sheet.dateAmharic,
                                    slot.timeRange,
                                    sheet.division
                                  )
                                }
                                className="px-2.5 py-1 rounded-md bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>መድብ (Assign)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MEMBERSHIP REQUESTS TAB */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>የአባልነት ማረጋገጫ ጥያቄዎች ({pendingRequests.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                ወደ «{currentDeptInfo?.titleAmharic}» ለመቀላቀል የቀረቡ ማመልከቻዎችን ይገምግሙና ያጽድቁ።
              </p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <UserCheck className="w-12 h-12 mx-auto text-emerald-500/60 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                ምንም አዲስ የአባልነት ጥያቄ የለም
              </p>
              <p className="text-xs text-slate-500">
                ሁሉም የቀረቡ ማመልከቻዎች ተገምግመው ተጠናቀዋል።
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {req.userName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[10px] font-bold text-amber-900 dark:text-amber-200">
                        {MEMBERSHIP_STATUS_CONFIG[req.status].amharicLabel}
                      </span>
                      {req.division && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-blue-800 dark:text-blue-200">
                          {DIVISIONS[req.division]?.titleAmharic || req.division}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      ኢሜይል፦ <span className="font-mono text-slate-700 dark:text-slate-300">{req.userEmail}</span> | የቀረበበት ቀን፦ {req.createdAt}
                    </p>

                    {req.serviceSkills && req.serviceSkills.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                        <span className="text-[11px] text-slate-400">የአገልግሎት ክህሎት፦</span>
                        {req.serviceSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {req.preferredResponsibilities && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        የሚመርጡት ኃላፊነት፦ «{req.preferredResponsibilities}»
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setApprovingMembership(req);
                        setAssignedRoleForApproval(req.role || 'CONTRIBUTOR');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>አጽድቅ (Approve)</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectingMembership(req);
                        setRejectionReasonText('');
                      }}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>አትቀበል (Reject)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MEMBERS & WORKLOAD TAB */}
      {activeTab === 'MEMBERS' && (
        <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0C4A9E]" />
                <span>የክፍሉ አባላትና የሥራ ጫና (Members & Workload)</span>
              </h3>
              <p className="text-xs text-slate-500">
                የተመደቡ አባላት ብዛት፦ {approvedMembers.length} | ሥራዎችን ከመመደብዎ በፊት የአባላትን የስራ ጫና ይመልከቱ
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="በስም ወይም በክህሎት ፈልግ..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {approvedMembers
              .filter(
                (m) =>
                  m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (m.serviceSkills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((member) => {
                const workload = checkMemberWorkload(member.userId);
                const roleConfig = USER_ROLES[member.role];

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {member.userName}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {member.userEmail}
                          </span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100"
                        >
                          {roleConfig?.amharicTitle || member.role}
                        </span>
                      </div>

                      {member.division && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                          የዕድሜ እርከን፦ <strong className="text-slate-800 dark:text-slate-200">{DIVISIONS[member.division]?.titleAmharic || member.division}</strong>
                        </p>
                      )}

                      {/* Workload Badge */}
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-500">የአሁን የሥራ ጫና፦</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              workload.activeTaskCount === 0
                                ? 'bg-slate-100 text-slate-600'
                                : workload.activeTaskCount <= 2
                                ? 'bg-emerald-100 text-emerald-800'
                                : workload.activeTaskCount === 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {workload.activeTaskCount} ንቁ ሥራዎች
                          </span>
                        </div>
                      </div>

                      {member.serviceSkills && member.serviceSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.serviceSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">የጸደቀበት፦ {member.approvedAt || member.createdAt}</span>

                      {/* Super admin or dept admin can suspend */}
                      {member.role !== 'ADMIN' && (
                        <button
                          onClick={() => {
                            setSuspendingMembership(member);
                            setSuspensionReasonText('');
                          }}
                          className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-bold"
                        >
                          አግድ (Suspend)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. SCHEDULE AGENDA & DIRECT ASSIGNMENT TAB */}
      {activeTab === 'SCHEDULE_AGENDA' && (
        <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#B88500]" />
                <span>የክፍሉ ዓመታዊና ዕለታዊ መርሐ ግብሮች አጀንዳዎች</span>
              </h3>
              <p className="text-xs text-slate-500">
                የዕለቱ ክፍለ-ጊዜዎችን ይመልከቱ፤ ያልተመደቡትን ክፍለ-ጊዜዎች በቀጥታ ለአባላት ይመድቡ።
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {relevantDailySheets.map((sheet) => (
              <div
                key={sheet.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#8B0000] text-white text-xs font-black">
                        {sheet.dateAmharic}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif-ethiopic">
                        {sheet.mainTopic}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      መሪ፦ <strong className="text-slate-700 dark:text-slate-300">{sheet.leader}</strong> | አቅራቢ/መምህር፦ {sheet.presenterOrTeacher} | ሰዓት፦ {sheet.timeAmharic}
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[10px] font-bold text-blue-800 dark:text-blue-200 self-start sm:self-auto">
                    {DIVISIONS[sheet.division]?.titleAmharic || sheet.division}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {sheet.slots.map((slot) => {
                    const existingAsgn = deptAssignments.find(
                      (a) => a.scheduleProgramId === sheet.id && a.agendaSlotId === slot.id
                    );

                    return (
                      <div
                        key={slot.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 font-bold shrink-0">
                            {slot.timeRange}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {slot.slotTitle}
                            </span>
                            {slot.inCharge && (
                              <p className="text-[11px] text-slate-500">ተረኛ/መሪ፦ {slot.inCharge}</p>
                            )}
                            {slot.notes && (
                              <p className="text-[10px] text-slate-400 italic">{slot.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          {existingAsgn ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                                ተመድቧል፦ <strong className="text-[#0C4A9E] dark:text-[#7FAFFF]">{existingAsgn.responsibleLeadName}</strong>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  SCHEDULE_TASK_STATUS_CONFIG[existingAsgn.status]?.bgClass
                                } ${SCHEDULE_TASK_STATUS_CONFIG[existingAsgn.status]?.colorClass}`}
                              >
                                {SCHEDULE_TASK_STATUS_CONFIG[existingAsgn.status]?.amharicLabel}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handleOpenSlotAssignment(
                                  sheet.id,
                                  slot.id,
                                  slot.slotTitle,
                                  sheet.dateAmharic,
                                  slot.timeRange,
                                  sheet.division
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>ቀጥታ መድብ (Assign)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ASSIGNMENTS TAB */}
      {activeTab === 'ASSIGNMENTS' && (
        <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-blue-600" />
                <span>የክፍሉ የሥራ ምደባዎች ዝርዝር ({deptAssignments.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                የተሰጡ ተግባራት ሁኔታ፦ የተመደበ → የተቀበለ → በዝግጅት ላይ → የቀረበ → የተጠናቀቀ
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['ALL', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REVISION_REQUESTED'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                      statusFilter === st
                        ? 'bg-[#0C4A9E] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {st === 'ALL' ? 'ሁሉም' : SCHEDULE_TASK_STATUS_CONFIG[st as ScheduleTaskStatus]?.amharicLabel}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-3">
            {deptAssignments
              .filter((a) => statusFilter === 'ALL' || a.status === statusFilter)
              .map((asgn) => {
                const statusCfg = SCHEDULE_TASK_STATUS_CONFIG[asgn.status];

                return (
                  <div
                    key={asgn.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg?.bgClass} ${statusCfg?.colorClass} ${statusCfg?.borderClass}`}>
                          {statusCfg?.amharicLabel}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {asgn.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {asgn.instructions}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span>ክፍለ-ጊዜ፦ <strong className="text-slate-700 dark:text-slate-300">{asgn.agendaSlotTitle}</strong></span>
                        <span>ዕለት፦ {asgn.programDate} ({asgn.programTime})</span>
                        <span>ተረኛ ኃላፊ፦ <strong className="text-[#0C4A9E] dark:text-[#7FAFFF]">{asgn.responsibleLeadName}</strong></span>
                        {asgn.groupName && <span>ምድብ፦ {asgn.groupName}</span>}
                        {asgn.requiredDeliverable && (
                          <span className="text-[#8B0000] dark:text-[#FFB4AB] font-bold">
                            የሚጠበቅ ሰነድ፦ {asgn.requiredDeliverable}
                          </span>
                        )}
                      </div>

                      {asgn.adminFeedback && (
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                          <span className="font-bold">የአስተዳዳሪ አስተያየት፦</span> {asgn.adminFeedback}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {asgn.status === 'SUBMITTED' && (
                        <button
                          onClick={() => {
                            setReviewingAssignment(asgn);
                            setReviewFeedbackText('');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>ግምገማ ስጥ (Review)</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteScheduleAssignment(asgn.id)}
                        className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 text-xs transition-colors"
                      >
                        ሰርዝ
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 7. SUBMISSIONS & REVIEW TAB */}
      {activeTab === 'SUBMISSIONS' && (
        <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>የቀረቡ የሥራ ሰነዶችና ግምገማ ({submittedTasks.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                አባላት ያቀረቧቸውን ሰነዶች፣ ስክሪፕቶችና ሪፖርቶች መርምረው ያጽድቁ ወይም ማሻሻያ ይጠይቁ።
              </p>
            </div>
          </div>

          {submittedTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/60 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                ምንም ግምገማ የሚጠብቅ ሰነድ የለም
              </p>
              <p className="text-xs text-slate-500">
                ሁሉም የቀረቡ የሥራ ውጤቶች ተገምግመው ተጠናቀዋል።
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 text-[10px] font-bold">
                          የቀረበ ሰነድ
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ያቀረበው አባል፦ <strong className="text-slate-700 dark:text-slate-300">{task.deliverableSubmission?.submittedByName || task.responsibleLeadName}</strong> | ቀን፦ {task.deliverableSubmission?.submittedAt || 'ያልተገለጸ'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setReviewingAssignment(task);
                        setReviewFeedbackText('');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>ገምግም (Review Submission)</span>
                    </button>
                  </div>

                  {/* Submitted Content Preview */}
                  {task.deliverableSubmission?.content && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-slate-500 block mb-1">የቀረበ ጽሑፍ / ማጠቃለያ፦</span>
                      <p className="leading-relaxed">{task.deliverableSubmission.content}</p>
                    </div>
                  )}

                  {task.deliverableSubmission?.fileName && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <FileText className="w-4 h-4 text-[#0C4A9E]" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        የተያያዘ ሰነድ፦ {task.deliverableSubmission.fileName}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: APPROVE MEMBERSHIP ================= */}
      {approvingMembership && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white mb-1">
              የአባልነት ማመልከቻ ማጽደቅ
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ለአመልካቹ <strong className="text-slate-800 dark:text-slate-200">{approvingMembership.userName}</strong> በ«{currentDeptInfo?.titleAmharic}» ውስጥ ተገቢውን ሚና ይመድቡ።
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የክፍሉ ሚና (Departmental Role) *
                </label>
                <select
                  value={assignedRoleForApproval}
                  onChange={(e) => setAssignedRoleForApproval(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                >
                  <option value="MEMBER">አባል / ተጠቃሚ (Member)</option>
                  <option value="CONTRIBUTOR">ደራሲ / አቅራቢ (Contributor)</option>
                  <option value="REVIEWER">ገምጋሚ / ኤዲተር (Reviewer)</option>
                  {isSuperAdmin && (
                    <option value="ADMIN">የክፍሉ አስተዳዳሪ (Department Admin)</option>
                  )}
                </select>
              </div>

              {actionError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {actionError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                <p className="font-bold mb-0.5">ማረጋገጫና ኦዲት</p>
                <p className="text-[11px]">
                  ይህ ውሳኔ በስምዎ ({currentUser.fullName}) ይመዘገባል፤ ለአባሉም የማረጋገጫ ማሳወቂያ በቀጥታ ይደርሳል።
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setActionError(null);
                    setApprovingMembership(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  ተመለስ
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    setActionError(null);
                    try {
                      await approveMembershipRequest(
                        approvingMembership.id,
                        assignedRoleForApproval
                      );
                      setApprovingMembership(null);
                    } catch (err: any) {
                      setActionError(err?.message || 'ማጽደቅ አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'በማስቀመጥ ላይ...' : 'አጽድቅ (Confirm Approval)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REJECT MEMBERSHIP ================= */}
      {rejectingMembership && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold font-serif-ethiopic text-rose-700 dark:text-rose-400 mb-1">
              የአባልነት ማመልከቻን ውድቅ ማድረግ
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ለአመልካቹ <strong className="text-slate-800 dark:text-slate-200">{rejectingMembership.userName}</strong> የውድቅ ማድረጊያ ምክንያት ያስገቡ።
            </p>

            <div className="space-y-4">
              {actionError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {actionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የውድቅ ማድረጊያ ምክንያት *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="ለምሳሌ፡ የአባልነት መስፈርት ባለማሟላታቸው ወይም ወደ ሌላ ክፍል እንዲያመለክቱ በማሳወቅ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setActionError(null);
                    setRejectingMembership(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  ተመለስ
                </button>
                <button
                  type="button"
                  disabled={!rejectionReasonText.trim() || isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    setActionError(null);
                    try {
                      await rejectMembershipRequest(
                        rejectingMembership.id,
                        rejectionReasonText
                      );
                      setRejectingMembership(null);
                    } catch (err: any) {
                      setActionError(err?.message || 'ውድቅ ማድረግ አልተቻለም።');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'በማስቀመጥ ላይ...' : 'ውድቅ አድርግ (Confirm Reject)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUSPEND MEMBERSHIP ================= */}
      {suspendingMembership && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold font-serif-ethiopic text-amber-700 dark:text-amber-400 mb-1">
              የአባልነት አገልግሎትን ለጊዜው ማገድ
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              አባል <strong className="text-slate-800 dark:text-slate-200">{suspendingMembership.userName}</strong> ለጊዜው ከክፍሉ አገልግሎት ይታገዳሉ።
            </p>

            <div className="space-y-4">
              {actionError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {actionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የእገዳ ምክንያት
                </label>
                <textarea
                  rows={3}
                  value={suspensionReasonText}
                  onChange={(e) => setSuspensionReasonText(e.target.value)}
                  placeholder="የእገዳ ምክንያት ያስገቡ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setActionError(null);
                    setSuspendingMembership(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  ተመለስ
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    setActionError(null);
                    try {
                      await suspendMembership(
                        suspendingMembership.id,
                        suspensionReasonText
                      );
                      setSuspendingMembership(null);
                    } catch (err: any) {
                      setActionError(err?.message || 'ማገድ አልተቻለም።');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'በማስቀመጥ ላይ...' : 'አግድ (Confirm Suspend)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REVIEW ASSIGNMENT SUBMISSION ================= */}
      {reviewingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white mb-1">
              የቀረበ የሥራ ሰነድ ግምገማና ውሳኔ
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ሥራ፦ <strong className="text-slate-800 dark:text-slate-200">{reviewingAssignment.title}</strong>
            </p>

            <div className="space-y-4">
              {reviewingAssignment.deliverableSubmission?.content && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    በአባሉ የቀረበው ይዘት፦
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {reviewingAssignment.deliverableSubmission.content}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የአስተዳዳሪ ግብረ-መልስና አስተያየት
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedbackText}
                  onChange={(e) => setReviewFeedbackText(e.target.value)}
                  placeholder="ለአባሉ የሚደርስ ገንቢ አስተያየት ወይም የማሻሻያ ነጥቦችን ያስገቡ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              {actionError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {actionError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setActionError(null);
                    setReviewingAssignment(null);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  ተመለስ
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    setActionError(null);
                    try {
                      await reviewAssignment(
                        reviewingAssignment.id,
                        'REVISION_REQUESTED',
                        reviewFeedbackText || 'እባክዎ እንደገና ይገምግሙና ማሻሻያ አድርገው ያስረክቡ።'
                      );
                      setReviewingAssignment(null);
                    } catch (err: any) {
                      setActionError(err?.message || 'ማሻሻያ መጠየቅ አልተቻለም።');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'በማስቀመጥ ላይ...' : 'ማሻሻያ ጠይቅ (Request Revision)'}</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    setActionError(null);
                    try {
                      await reviewAssignment(
                        reviewingAssignment.id,
                        'COMPLETED',
                        reviewFeedbackText || 'ሥራው በታላቅ ምስጋና ጸድቋል።'
                      );
                      setReviewingAssignment(null);
                    } catch (err: any) {
                      setActionError(err?.message || 'ሥራውን ማጽደቅ አልተቻለም።');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'በማስቀመጥ ላይ...' : 'አጽድቅና አጠናቅ (Approve Completed)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NEW SCHEDULE ASSIGNMENT ================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                  አዲስ የሥራ ምደባ መፍጠር (Schedule-Based Assignment)
                </h3>
                <p className="text-xs text-slate-500">
                  ከመርሐ ግብሩ አጀንዳ ጋር የተሳሰረ የሥራ ምደባ
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተያያዘው ክፍለ-ጊዜ (Agenda Slot Title) *
                </label>
                <input
                  type="text"
                  required
                  value={assignForm.agendaSlotTitle}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, agendaSlotTitle: e.target.value })
                  }
                  placeholder="ለምሳሌ፡ የመክፈቻ ጸሎትና ምስጋና ወይም ትምህርተ ወንጌል"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የሥራው ርዕስ (Assignment Title) *
                </label>
                <input
                  type="text"
                  required
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                  placeholder="ለምሳሌ፡ የኅዳር 6 ስንክሳር ንባብና ትርጓሜ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ዝርዝር መመሪያ (Instructions)
                </label>
                <textarea
                  rows={2}
                  value={assignForm.instructions}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, instructions: e.target.value })
                  }
                  placeholder="ለአባሉ የተሰጠ ግልጽ መመሪያ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ተረኛ ኃላፊ (Responsible Lead) *
                  </label>
                  <select
                    value={assignForm.responsibleLeadId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const currentIds = assignForm.assignedMemberIds.includes(id)
                        ? assignForm.assignedMemberIds
                        : [id, ...assignForm.assignedMemberIds];
                      setAssignForm({
                        ...assignForm,
                        responsibleLeadId: id,
                        assignedMemberIds: currentIds,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  >
                    {approvedMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.userName} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የምድብ ስም (አስፈላጊ ከሆነ)
                  </label>
                  <input
                    type="text"
                    value={assignForm.groupName}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, groupName: e.target.value })
                    }
                    placeholder="ለምሳሌ፡ ምድብ 01 (ፍቅር)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>

              {/* Workload Alert & Overlap Warning Banner */}
              {selectedLeadWorkload.hasOverlap && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>የተደራራቢ የሥራ ማስጠንቀቂያ (Assignment Overlap)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    ይህ አባል በዚሁ ቀን ({assignForm.programDate}) አስቀድሞ ሌላ የተመደበበት ሥራ አለው።
                  </p>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignForm.overrideOverlap}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          overrideOverlap: e.target.checked,
                        })
                      }
                      className="rounded text-[#0C4A9E] focus:ring-[#B88500]"
                    />
                    <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                      በአስተዳዳሪ ይሁንታ እደራረብ (Admin Override)
                    </span>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የመርሐ ግብሩ ቀን *
                  </label>
                  <input
                    type="text"
                    required
                    value={assignForm.programDate}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, programDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የዝግጅት / የማስረከቢያ ቀነ-ገደብ *
                  </label>
                  <input
                    type="text"
                    required
                    value={assignForm.deadlineDate}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, deadlineDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የሚጠበቅ የሰነድ አይነት (Required Deliverable)
                </label>
                <input
                  type="text"
                  value={assignForm.requiredDeliverable}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      requiredDeliverable: e.target.value,
                    })
                  }
                  placeholder="ለምሳሌ፡ የጽሑፍ ረቂቅ፣ የዝማሬ ዝርዝር፣ ስክሪፕት..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              {actionError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {actionError}
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setActionError(null);
                    setShowAssignModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (selectedLeadWorkload.hasOverlap && !assignForm.overrideOverlap)
                  }
                  className="flex-1 py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'በማስቀመጥ ላይ...' : 'ሥራውን መድብ (Confirm Assignment)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
