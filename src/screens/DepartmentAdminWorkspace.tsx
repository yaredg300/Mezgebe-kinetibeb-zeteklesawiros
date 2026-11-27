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
  Shield,
  Building2,
  CalendarDays,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  Check,
  RotateCcw,
  Mail,
  UserPlus,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  DepartmentMembership,
  ScheduleTaskAssignment,
  ScheduleTaskStatus,
  UserRole,
  UserProfile,
  SundaySchoolDivision,
  EhudDepartmentPosition,
  DIVISIONS,
  MEMBERSHIP_STATUS_CONFIG,
  SCHEDULE_TASK_STATUS_CONFIG,
  USER_ROLES,
  EHUD_DEPARTMENT_POSITIONS,
} from '../types';
import {
  YOUTH_ORGANIZER_SQUADS_2019,
  CHILDREN_TEACHER_SQUADS_2019,
  MAEKELAWIYAN_TEACHER_SQUADS_2019,
} from '../data/youthCombinedPlanData';

type AdminWorkspaceTab = 'PROGRAMS' | 'MEMBERS';
type ProgramsSubView = 'OVERVIEW' | 'AGENDA' | 'TASKS';
type MembersSubView = 'DIRECTORY' | 'REQUESTS';

export const DepartmentAdminWorkspace: React.FC<{
  memberAuthOnly?: boolean;
  onOpenWorkClick?: (workId: string) => void;
  onOpenScheduleDetails?: (programId: string) => void;
}> = ({ memberAuthOnly = false, onOpenWorkClick, onOpenScheduleDetails }) => {
  const {
    activeDepartment,
    setActiveDepartment,
    departmentsList,
    departmentMemberships,
    departmentInvites,
    registeredUsers,
    registeredUsersError,
    scheduleAssignments,
    dailyPlanSheets,
    currentUser,
    isSuperAdmin,
    isDepartmentPortalLocked,
    approveMembershipRequest,
    appointUserToDepartment,
    toggleMemberApprovalAuthority,
    createDepartmentInvite,
    cancelDepartmentInvite,
    rejectMembershipRequest,
    suspendMembership,
    createScheduleAssignment,
    updateScheduleAssignment,
    reviewAssignment,
    deleteScheduleAssignment,
    checkMemberWorkload,
  } = useArchive();

  const [activeTab, setActiveTab] = useState<AdminWorkspaceTab>(
    memberAuthOnly ? 'MEMBERS' : 'PROGRAMS'
  );
  const [programsSubView, setProgramsSubView] = useState<ProgramsSubView>('OVERVIEW');
  const [membersSubView, setMembersSubView] = useState<MembersSubView>(
    memberAuthOnly ? 'REQUESTS' : 'DIRECTORY'
  );
  const [overviewSheetId, setOverviewSheetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userDirectoryQuery, setUserDirectoryQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scheduleDivFilter, setScheduleDivFilter] = useState<'ALL' | SundaySchoolDivision>('ALL');
  const [scheduleMonthFilter, setScheduleMonthFilter] = useState<string>('ALL');

  // Pre-approval by Email State
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteFullName, setInviteFullName] = useState<string>('');
  const [inviteSundaySchoolId, setInviteSundaySchoolId] = useState<string>('');
  const [inviteEhudPosition, setInviteEhudPosition] = useState<EhudDepartmentPosition>('MEMBER');
  const [inviteRole, setInviteRole] = useState<UserRole>('MEMBER');
  const [inviteCanApproveMembers, setInviteCanApproveMembers] = useState<boolean>(false);
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [approvingMembership, setApprovingMembership] = useState<DepartmentMembership | null>(null);
  const [appointingUser, setAppointingUser] = useState<UserProfile | null>(null);
  const [assignedRoleForApproval, setAssignedRoleForApproval] = useState<UserRole>('CONTRIBUTOR');
  const [assignedEhudPositionForApproval, setAssignedEhudPositionForApproval] =
    useState<EhudDepartmentPosition>('MEMBER');
  const [assignedCanApproveForApproval, setAssignedCanApproveForApproval] = useState<boolean>(false);
  const [togglingAuthId, setTogglingAuthId] = useState<string | null>(null);

  const mapEhudPositionToUserRole = (pos: EhudDepartmentPosition): UserRole => {
    if (pos === 'DEPARTMENT_HEAD') return 'ADMIN';
    if (pos === 'MIKITIL_HEAD') return 'REVIEWER';
    return 'MEMBER';
  };

  const getEhudPositionFromMembership = (
    requestedPosition?: EhudDepartmentPosition,
    role?: UserRole
  ): EhudDepartmentPosition => {
    if (requestedPosition) return requestedPosition;
    if (role === 'ADMIN') return 'DEPARTMENT_HEAD';
    if (role === 'REVIEWER' || role === 'EDITOR') return 'MIKITIL_HEAD';
    return 'MEMBER';
  };

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
  const rejectedOrSuspendedMemberships = deptMemberships.filter(
    (m) => m.status === 'REJECTED' || m.status === 'SUSPENDED'
  );
  const otherDeptPendingRequests =
    !isDepartmentPortalLocked && isSuperAdmin
      ? departmentMemberships.filter((m) => m.status === 'PENDING' && m.departmentId !== activeDepartment)
      : [];
  const activeInvitesForDept = departmentInvites.filter(
    (inv) => inv.departmentId === activeDepartment && inv.status === 'ACTIVE'
  );
  const approvedMembers = deptMemberships.filter((m) => m.status === 'APPROVED');
  const unassignedRegisteredUsers = isSuperAdmin
    ? registeredUsers.filter((u) => {
        const alreadyApprovedInDept = approvedMembers.some((m) => m.userId === u.id);
        if (alreadyApprovedInDept) return false;
        if (!userDirectoryQuery.trim()) return true;
        const q = userDirectoryQuery.toLowerCase();
        return (
          (u.fullName || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.sundaySchoolId || '').toLowerCase().includes(q)
        );
      })
    : [];

  const handleCreateInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteFeedback(null);
    setIsSendingInvite(true);
    const isEhudDept = activeDepartment === 'ehud_merha_gibir';
    const resolvedRole: UserRole = isEhudDept
      ? mapEhudPositionToUserRole(inviteEhudPosition)
      : inviteRole;
    try {
      const { immediatelyApproved } = await createDepartmentInvite({
        email: inviteEmail,
        fullName: inviteFullName,
        departmentId: activeDepartment,
        role: resolvedRole,
        division: 'youth',
        sundaySchoolId: inviteSundaySchoolId || undefined,
        requestedPosition: isEhudDept ? inviteEhudPosition : undefined,
        canApproveMembers: isSuperAdmin ? inviteCanApproveMembers : undefined,
      });

      setInviteFeedback({
        type: 'success',
        text: immediatelyApproved
          ? `${inviteFullName} (${inviteEmail}) ወዲያውኑ ጸድቀው ወደ «${currentDeptInfo?.shortTitleAmharic || activeDepartment}» ተጨምረዋል!`
          : `${inviteFullName} (${inviteEmail}) ቀድመው ጸድቀዋል! በዚህ ኢሜይል Login ሲያደርጉ ወይም ሲመዘገቡ ወዲያውኑ ወደ ክፍሉ ይገባሉ።`,
      });
      setInviteEmail('');
      setInviteFullName('');
      setInviteSundaySchoolId('');
      setInviteCanApproveMembers(false);
    } catch (err: any) {
      setInviteFeedback({
        type: 'error',
        text: err?.message || 'ግብዣውን ማስቀመጥ አልተቻለም።',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };
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

  const filteredScheduleSheets = relevantDailySheets.filter((sheet) => {
    const matchesDiv = scheduleDivFilter === 'ALL' || sheet.division === scheduleDivFilter;
    const matchesMonth = scheduleMonthFilter === 'ALL' || sheet.monthAmharic === scheduleMonthFilter;
    return matchesDiv && matchesMonth;
  });

  const availableScheduleMonths = Array.from(
    new Set(relevantDailySheets.map((s) => s.monthAmharic).filter(Boolean))
  );

  const allEhudSquads = [
    ...YOUTH_ORGANIZER_SQUADS_2019,
    ...CHILDREN_TEACHER_SQUADS_2019,
    ...MAEKELAWIYAN_TEACHER_SQUADS_2019,
  ];

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

  const selectedLeadWorkload = assignForm.responsibleLeadId
    ? checkMemberWorkload(assignForm.responsibleLeadId, assignForm.programDate)
    : { activeTaskCount: 0, hasOverlap: false, overlappingAssignments: [] };

  const activeOverviewSheet =
    relevantDailySheets.find((s) => s.id === overviewSheetId) || relevantDailySheets[0];

  const handleOpenAssignModal = () => {
    const defaultSheet = activeOverviewSheet || relevantDailySheets[0];
    const defaultSlot = defaultSheet?.slots?.[0];
    setAssignForm({
      scheduleProgramId: defaultSheet?.id || 'general_program',
      agendaSlotId: defaultSlot?.id || 'general_slot',
      agendaSlotTitle: defaultSlot?.slotTitle || 'የእሁድ ክፍለ-ጊዜ',
      division: defaultSheet?.division || 'youth',
      title: '',
      instructions: '',
      assignedMemberIds: approvedMembers.length > 0 ? [approvedMembers[0].userId] : [],
      groupName: '',
      responsibleLeadId: approvedMembers.length > 0 ? approvedMembers[0].userId : '',
      programDate: defaultSheet?.dateAmharic || 'የእሁድ መርሐ ግብር',
      programTime: defaultSlot?.timeRange || defaultSheet?.timeAmharic || '7:30–9:30',
      deadlineDate: defaultSheet?.dateAmharic || 'ከመርሐ ግብሩ 2 ቀን በፊት',
      requiredDeliverable: '',
      overrideOverlap: false,
    });
    setShowAssignModal(true);
  };

  return (
    <div className="space-y-4 pb-10">
      {/* 1. Compact Workspace Header & Sub-tabs */}
      <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[#8B0000] dark:text-[#FFD54F]">
                {memberAuthOnly ? 'የአባላት ማረጋገጫ ኃላፊ' : 'የአስተዳዳሪ ዴስክ'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {isSuperAdmin && !isDepartmentPortalLocked
                  ? 'የበላይ አስተዳዳሪ'
                  : memberAuthOnly
                  ? `የ«${currentDeptInfo?.shortTitleAmharic || activeDepartment}» ብቻ`
                  : 'የክፍል ኃላፊ'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-serif-ethiopic text-slate-900 dark:text-white truncate mt-0.5">
              {currentDeptInfo?.titleAmharic || 'የክፍሉ የሥራ ገበታ'}
            </h1>
          </div>

          {!memberAuthOnly && (
            <div className="flex items-center gap-2 shrink-0">
              {onOpenScheduleDetails && (
                <button
                  type="button"
                  onClick={() => onOpenScheduleDetails('ehud_portal')}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                  <span>ሙሉ ዕቅድ</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenAssignModal}
                className="px-3.5 py-2 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>አዲስ ሥራ መድብ</span>
              </button>
            </div>
          )}
        </div>

        {/* 2 Primary Branches Navigation */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2.5">
          {!memberAuthOnly && (
            <button
              type="button"
              onClick={() => setActiveTab('PROGRAMS')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'PROGRAMS'
                  ? 'bg-[#0C4A9E] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>መርሐ ግብር እና ምደባ</span>
              <span
                className={`font-mono tabular-nums text-[11px] ${
                  activeTab === 'PROGRAMS'
                    ? 'text-white/90'
                    : submittedTasks.length > 0
                    ? 'text-indigo-600 dark:text-indigo-400 font-black'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {deptAssignments.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('MEMBERS')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'MEMBERS'
                ? 'bg-[#0C4A9E] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>አባላት እና ጥያቄዎች</span>
            <span
              className={`font-mono tabular-nums text-[11px] ${
                activeTab === 'MEMBERS'
                  ? 'text-white/90'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {approvedMembers.length}
            </span>
            {pendingRequests.length + otherDeptPendingRequests.length > 0 && (
              <span
                className={`font-mono tabular-nums text-[11px] font-black ${
                  activeTab === 'MEMBERS'
                    ? 'text-amber-200'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                · +{pendingRequests.length + otherDeptPendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          BRANCH 1: PROGRAMS, SCHEDULES & ASSIGNMENTS
         ========================================================================= */}
      {!memberAuthOnly && activeTab === 'PROGRAMS' && (
        <div className="space-y-4">
          {/* Unified 4-Column KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 divide-y lg:divide-y-0 divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
            {[
              {
                label: 'የዕለት ሉሆች',
                value: relevantDailySheets.length,
                accent: 'text-[#0C4A9E] dark:text-[#7FAFFF]',
                onClick: () => setProgramsSubView('AGENDA'),
              },
              {
                label: 'ንቁ ምደባዎች',
                value: inProgressTasks.length + submittedTasks.length,
                accent: 'text-slate-900 dark:text-white',
                onClick: () => {
                  setStatusFilter('ALL');
                  setProgramsSubView('TASKS');
                },
              },
              {
                label: 'ግምገማ የሚጠብቁ',
                value: submittedTasks.length,
                accent:
                  submittedTasks.length > 0
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-900 dark:text-white',
                onClick: () => {
                  setStatusFilter('SUBMITTED');
                  setProgramsSubView('TASKS');
                },
              },
              {
                label: 'የተጠናቀቁ ሥራዎች',
                value: completedTasks.length,
                accent: 'text-emerald-600 dark:text-emerald-400',
                onClick: () => {
                  setStatusFilter('COMPLETED');
                  setProgramsSubView('TASKS');
                },
              },
            ].map((stat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={stat.onClick}
                className="p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {stat.label}
                </span>
                <span className={`block text-xl font-bold font-mono tabular-nums mt-0.5 ${stat.accent}`}>
                  {stat.value}
                </span>
              </button>
            ))}
          </div>

          {/* Sub-view Switcher inside Branch 1 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 gap-0.5">
              <button
                type="button"
                onClick={() => setProgramsSubView('OVERVIEW')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  programsSubView === 'OVERVIEW'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                አጠቃላይ ሰሌዳ
              </button>
              <button
                type="button"
                onClick={() => setProgramsSubView('AGENDA')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  programsSubView === 'AGENDA'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                የዕለት ሉሆች <span className="font-mono tabular-nums opacity-80">({relevantDailySheets.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setProgramsSubView('TASKS')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  programsSubView === 'TASKS'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                ምደባዎች እና ግምገማ <span className="font-mono tabular-nums opacity-80">({deptAssignments.length})</span>
              </button>
            </div>

            {pendingRequests.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('MEMBERS');
                  setMembersSubView('REQUESTS');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/60"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingRequests.length} አዲስ የአባልነት ጥያቄ</span>
              </button>
            )}
          </div>

          {/* 1A. OVERVIEW SUB-VIEW */}
          {programsSubView === 'OVERVIEW' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left 7 Cols: Active Upcoming Sunday Timetable */}
              <div className="lg:col-span-7 rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                      የቀጣይ እሁድ መርሐ ግብር ክፍለ-ጊዜዎች
                    </h2>
                    {activeOverviewSheet && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{activeOverviewSheet.dateAmharic}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">{activeOverviewSheet.timeAmharic}</span>
                        <span aria-hidden="true"> · </span>
                        <span>መሪ፦ {activeOverviewSheet.leader}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {relevantDailySheets.length > 1 && (
                      <select
                        value={activeOverviewSheet?.id || ''}
                        onChange={(e) => setOverviewSheetId(e.target.value)}
                        aria-label="የእሁድ መርሐ ግብር ምረጥ"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 max-w-[190px]"
                      >
                        {relevantDailySheets.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.monthAmharic} {s.dayNumber} — {s.mainTopic.slice(0, 22)}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => setProgramsSubView('AGENDA')}
                      className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline whitespace-nowrap flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>ሁሉም</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {activeOverviewSheet ? (
                  <div>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        ርዕስ፦ {activeOverviewSheet.mainTopic}
                      </span>
                      <span className="text-[11px] text-slate-500 shrink-0">
                        {DIVISIONS[activeOverviewSheet.division]?.titleAmharic}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeOverviewSheet.slots.map((slot) => {
                        const existingAssignment = deptAssignments.find(
                          (a) =>
                            a.scheduleProgramId === activeOverviewSheet.id &&
                            a.agendaSlotId === slot.id
                        );
                        return (
                          <div
                            key={slot.id}
                            className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <div className="min-w-0 flex items-center gap-3">
                              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 w-20 shrink-0">
                                {slot.timeRange}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {slot.slotTitle}
                                </p>
                                {slot.inCharge && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {slot.inCharge}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0">
                              {existingAssignment ? (
                                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                  {existingAssignment.responsibleLeadName} ·{' '}
                                  {SCHEDULE_TASK_STATUS_CONFIG[existingAssignment.status]?.amharicLabel}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenSlotAssignment(
                                      activeOverviewSheet.id,
                                      slot.id,
                                      slot.slotTitle,
                                      activeOverviewSheet.dateAmharic,
                                      slot.timeRange,
                                      activeOverviewSheet.division
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-[11px] whitespace-nowrap cursor-pointer"
                                >
                                  መድብ
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    ምንም የተመዘገበ የዕለት ሉህ የለም።
                  </div>
                )}
              </div>

              {/* Right 5 Cols: Submitted Work Queue & Pending Membership Requests */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                      ግምገማ የሚጠብቁ ሥራዎች ({submittedTasks.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('SUBMITTED');
                        setProgramsSubView('TASKS');
                      }}
                      className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      ሁሉም
                    </button>
                  </div>

                  {submittedTasks.length === 0 ? (
                    <div className="px-4 py-4 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>
                        {inProgressTasks.length} በሂደት ላይ · {completedTasks.length} የተጠናቀቁ
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('ALL');
                          setProgramsSubView('TASKS');
                        }}
                        className="text-[#0C4A9E] dark:text-[#7FAFFF] font-bold hover:underline cursor-pointer"
                      >
                        ምደባዎችን እይ
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {submittedTasks.slice(0, 4).map((task) => (
                        <div key={task.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {task.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {task.deliverableSubmission?.submittedByName || task.responsibleLeadName}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewingAssignment(task);
                              setReviewFeedbackText('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer"
                          >
                            ገምግም
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Pending Requests Summary */}
                <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                      የአባልነት ጥያቄዎች ({pendingRequests.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('MEMBERS');
                        setMembersSubView('REQUESTS');
                      }}
                      className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      አስተዳድር
                    </button>
                  </div>

                  {pendingRequests.length === 0 && otherDeptPendingRequests.length === 0 ? (
                    <div className="px-4 py-4 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{approvedMembers.length} የጸደቁ አባላት</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('MEMBERS');
                          setMembersSubView('DIRECTORY');
                        }}
                        className="text-[#0C4A9E] dark:text-[#7FAFFF] font-bold hover:underline cursor-pointer"
                      >
                        አባላትን እይ
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pendingRequests.slice(0, 3).map((req) => (
                        <div key={req.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {req.userName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {req.sundaySchoolId || req.userEmail}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('MEMBERS');
                              setMembersSubView('REQUESTS');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer"
                          >
                            ገምግም
                          </button>
                        </div>
                      ))}
                      {pendingRequests.length === 0 && otherDeptPendingRequests.length > 0 && (
                        <div className="px-4 py-3 flex items-center justify-between gap-2 text-xs">
                          <span className="text-amber-700 dark:text-amber-300 font-semibold">
                            በሌሎች ክፍሎች {otherDeptPendingRequests.length} ጥያቄዎች አሉ
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('MEMBERS');
                              setMembersSubView('REQUESTS');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            እይ
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 1B. SCHEDULE AGENDA SUB-VIEW */}
          {programsSubView === 'AGENDA' && (
            <div className="bg-white dark:bg-[#111D30] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#B88500]" />
                    <span>የክፍሉ ዕለታዊ መርሐ ግብር አጀንዳዎች (<span className="font-mono tabular-nums">{filteredScheduleSheets.length}</span>)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ያልተመደቡትን የእሁድ ክፍለ-ጊዜዎች በቀጥታ ለአባላት ይመድቡ።
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['ALL', 'youth', 'children', 'intermediates'] as const).map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setScheduleDivFilter(div)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        scheduleDivFilter === div
                          ? 'bg-[#0C4A9E] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {div === 'ALL' ? 'ሁሉም እርከኖች' : DIVISIONS[div].titleAmharic}
                    </button>
                  ))}

                  <select
                    value={scheduleMonthFilter}
                    onChange={(e) => setScheduleMonthFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <option value="ALL">ሁሉም ወራት</option>
                    {availableScheduleMonths.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredScheduleSheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#8B0000] dark:text-[#FF8A80] font-mono tabular-nums">
                            {sheet.dateAmharic}
                          </span>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif-ethiopic truncate">
                            {sheet.mainTopic}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          መሪ፦ {sheet.leader} · አቅራቢ፦ {sheet.presenterOrTeacher} · <span className="font-mono tabular-nums">{sheet.timeAmharic}</span>
                        </p>
                      </div>

                      <span className="text-[11px] font-semibold text-[#0C4A9E] dark:text-[#7FAFFF] shrink-0">
                        {DIVISIONS[sheet.division]?.titleAmharic || sheet.division}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111D30]">
                      {sheet.slots.map((slot) => {
                        const existingAsgn = deptAssignments.find(
                          (a) => a.scheduleProgramId === sheet.id && a.agendaSlotId === slot.id
                        );

                        return (
                          <div
                            key={slot.id}
                            className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 w-20 shrink-0">
                                {slot.timeRange}
                              </span>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {slot.slotTitle}
                                </span>
                                {slot.inCharge && (
                                  <span className="text-[11px] text-slate-500 ml-2">· {slot.inCharge}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              {existingAsgn ? (
                                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                  {existingAsgn.responsibleLeadName} ·{' '}
                                  {SCHEDULE_TASK_STATUS_CONFIG[existingAsgn.status]?.amharicLabel}
                                </span>
                              ) : (
                                <button
                                  type="button"
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
                                  className="px-2.5 py-1 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-[11px] flex items-center gap-1 whitespace-nowrap cursor-pointer"
                                >
                                  <PlusCircle className="w-3 h-3" />
                                  <span>መድብ</span>
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

          {/* 1C. UNIFIED ASSIGNMENTS & SUBMISSIONS REVIEW SUB-VIEW */}
          {programsSubView === 'TASKS' && (
            <div className="bg-white dark:bg-[#111D30] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-[#0C4A9E]" />
                    <span>የሥራ ምደባዎች እና ግምገማ (<span className="font-mono tabular-nums">{deptAssignments.length}</span>)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    የተመደበ → የተቀበለ → በዝግጅት ላይ → የቀረበ → የተጠናቀቀ
                  </p>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {['ALL', 'SUBMITTED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REVISION_REQUESTED'].map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-[#0C4A9E] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {st === 'ALL'
                          ? 'ሁሉም'
                          : st === 'SUBMITTED'
                          ? `ግምገማ (${submittedTasks.length})`
                          : SCHEDULE_TASK_STATUS_CONFIG[st as ScheduleTaskStatus]?.amharicLabel}
                      </button>
                    )
                  )}
                </div>
              </div>

              {deptAssignments.filter((a) => statusFilter === 'ALL' || a.status === statusFilter).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-9 h-9 mx-auto text-emerald-500/60 mb-1.5" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    በዚህ ማጣሪያ የተገኘ የሥራ ምደባ የለም
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {deptAssignments
                    .filter((a) => statusFilter === 'ALL' || a.status === statusFilter)
                    .map((asgn) => {
                      const statusCfg = SCHEDULE_TASK_STATUS_CONFIG[asgn.status];

                      return (
                        <div
                          key={asgn.id}
                          className={`p-3.5 space-y-2 ${
                            asgn.status === 'SUBMITTED'
                              ? 'bg-indigo-50/25 dark:bg-indigo-950/15'
                              : 'bg-slate-50/30 dark:bg-slate-900/20'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg?.bgClass} ${statusCfg?.colorClass} ${statusCfg?.borderClass}`}
                                >
                                  {statusCfg?.amharicLabel}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {asgn.title}
                                </h4>
                              </div>

                              {asgn.instructions && (
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                  {asgn.instructions}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                                <span>{asgn.agendaSlotTitle}</span>
                                <span>
                                  ·{' '}
                                  <span className="font-mono tabular-nums">
                                    {asgn.programDate} ({asgn.programTime})
                                  </span>
                                </span>
                                <span>
                                  · ኃላፊ፦{' '}
                                  <strong className="text-[#0C4A9E] dark:text-[#7FAFFF]">
                                    {asgn.responsibleLeadName}
                                  </strong>
                                </span>
                                {asgn.groupName && <span>· {asgn.groupName}</span>}
                                {asgn.requiredDeliverable && (
                                  <span className="text-[#8B0000] dark:text-[#FFB4AB] font-semibold">
                                    · የሚጠበቅ፦ {asgn.requiredDeliverable}
                                  </span>
                                )}
                              </div>

                              {asgn.adminFeedback && (
                                <p className="text-[11px] text-amber-800 dark:text-amber-200 pt-0.5">
                                  <span className="font-bold">አስተያየት፦</span> {asgn.adminFeedback}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {asgn.status === 'SUBMITTED' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setIsSubmitting(true);
                                      try {
                                        await reviewAssignment(
                                          asgn.id,
                                          'COMPLETED',
                                          'በክፍሉ ኃላፊ ተረጋግጦ ጸድቋል።'
                                        );
                                      } finally {
                                        setIsSubmitting(false);
                                      }
                                    }}
                                    disabled={isSubmitting}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>አጽድቅ</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewingAssignment(asgn);
                                      setReviewFeedbackText('');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                                  >
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span>ገምግም</span>
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => deleteScheduleAssignment(asgn.id)}
                                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 text-xs font-semibold cursor-pointer"
                              >
                                ሰርዝ
                              </button>
                            </div>
                          </div>

                          {asgn.status === 'SUBMITTED' && asgn.deliverableSubmission?.content && (
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                              <p>{asgn.deliverableSubmission.content}</p>
                              {asgn.deliverableSubmission.fileName && (
                                <div className="flex items-center gap-1.5 text-[11px] text-[#0C4A9E] dark:text-[#7FAFFF]">
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{asgn.deliverableSubmission.fileName}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          BRANCH 2: MEMBERS, APPROVALS & INVITES
         ========================================================================= */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          {/* Sub-view Switcher inside Branch 2 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 gap-0.5">
              <button
                type="button"
                onClick={() => setMembersSubView('DIRECTORY')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  membersSubView === 'DIRECTORY'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                የጸደቁ አባላት <span className="font-mono tabular-nums opacity-80">({approvedMembers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMembersSubView('REQUESTS')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  membersSubView === 'REQUESTS'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                ጥያቄዎች እና ግብዣ{' '}
                <span className="font-mono tabular-nums opacity-80">
                  ({pendingRequests.length + otherDeptPendingRequests.length})
                </span>
              </button>
            </div>

            {membersSubView === 'DIRECTORY' && pendingRequests.length > 0 && (
              <button
                type="button"
                onClick={() => setMembersSubView('REQUESTS')}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingRequests.length} ጥያቄዎች ውሳኔ ይጠብቃሉ</span>
              </button>
            )}
          </div>

          {/* 2A. MEMBERS DIRECTORY SUB-VIEW */}
          {membersSubView === 'DIRECTORY' && (
            <div className="bg-white dark:bg-[#111D30] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0C4A9E]" />
                    <span>የክፍሉ አባላትና የሥራ ጫና (<span className="font-mono tabular-nums">{approvedMembers.length}</span>)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ሥራዎችን ከመመደብዎ በፊት የአባላትን ንቁ የሥራ ጫና ይመልከቱ
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="በስም ወይም በክህሎት ፈልግ..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
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
                    const roleLabel =
                      activeDepartment === 'ehud_merha_gibir'
                        ? (() => {
                            const pos = getEhudPositionFromMembership(member.requestedPosition, member.role);
                            return `${EHUD_DEPARTMENT_POSITIONS[pos].rank}ኛ. ${EHUD_DEPARTMENT_POSITIONS[pos].amharicTitle}`;
                          })()
                        : roleConfig?.amharicTitle || member.role;

                    return (
                      <div
                        key={member.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col justify-between gap-2.5"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {member.userName}
                              </h4>
                              <span className="text-[11px] text-slate-500 font-mono block truncate">
                                {member.userEmail}
                              </span>
                            </div>
                            {!memberAuthOnly && (
                              <span
                                className={`text-[11px] font-mono tabular-nums font-bold shrink-0 ${
                                  workload.activeTaskCount === 0
                                    ? 'text-slate-500'
                                    : workload.activeTaskCount <= 2
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : workload.activeTaskCount === 3
                                    ? 'text-amber-700 dark:text-amber-400'
                                    : 'text-rose-700 dark:text-rose-400'
                                }`}
                              >
                                {workload.activeTaskCount} ንቁ
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">{roleLabel}</span>
                            {member.division && <span> · {DIVISIONS[member.division]?.titleAmharic || member.division}</span>}
                            {member.sundaySchoolId && <span className="font-mono"> · {member.sundaySchoolId}</span>}
                          </p>

                          {(member.canApproveMembers || member.role === 'ADMIN') && (
                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <Shield className="w-3 h-3 shrink-0" />
                              <span>አባላትን ማጽደቅ ይችላል</span>
                            </p>
                          )}

                          {member.serviceSkills && member.serviceSkills.length > 0 && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              ክህሎት፦ {member.serviceSkills.join(' · ')}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="text-slate-400 font-mono tabular-nums">{member.approvedAt || member.createdAt}</span>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {isSuperAdmin && member.role !== 'ADMIN' && (
                              <button
                                type="button"
                                disabled={togglingAuthId === member.id}
                                onClick={async () => {
                                  setTogglingAuthId(member.id);
                                  try {
                                    await toggleMemberApprovalAuthority(
                                      member.id,
                                      !member.canApproveMembers
                                    );
                                  } finally {
                                    setTogglingAuthId(null);
                                  }
                                }}
                                className={`font-bold hover:underline disabled:opacity-50 cursor-pointer ${
                                  member.canApproveMembers
                                    ? 'text-rose-700 dark:text-rose-400'
                                    : 'text-emerald-700 dark:text-emerald-400'
                                }`}
                              >
                                {togglingAuthId === member.id
                                  ? 'በማስቀመጥ ላይ...'
                                  : member.canApproveMembers
                                  ? 'ፈቃድ አንሳ'
                                  : 'አባል አጽዳቂ አድርግ'}
                              </button>
                            )}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAppointingUser(null);
                                  setApprovingMembership(member);
                                  setAssignedCanApproveForApproval(Boolean(member.canApproveMembers));
                                  const ehudPos = getEhudPositionFromMembership(
                                    member.requestedPosition,
                                    member.role
                                  );
                                  setAssignedEhudPositionForApproval(ehudPos);
                                  setAssignedRoleForApproval(
                                    member.departmentId === 'ehud_merha_gibir'
                                      ? mapEhudPositionToUserRole(ehudPos)
                                      : member.role || 'MEMBER'
                                  );
                                }}
                                className="text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline font-bold cursor-pointer"
                              >
                                ሚና ቀይር
                              </button>
                            )}
                            {member.role !== 'ADMIN' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSuspendingMembership(member);
                                  setSuspensionReasonText('');
                                }}
                                className="text-amber-700 dark:text-amber-400 hover:underline font-bold cursor-pointer"
                              >
                                አግድ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 2B. REQUESTS, PRE-APPROVALS & RESTORE SUB-VIEW */}
          {membersSubView === 'REQUESTS' && (
            <div className="bg-white dark:bg-[#111D30] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>የአባልነት ማረጋገጫ ጥያቄዎች (<span className="font-mono tabular-nums">{pendingRequests.length}</span>)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ወደ «{currentDeptInfo?.titleAmharic}» ለመቀላቀል የቀረቡ ማመልከቻዎችን ይገምግሙና ያጽድቁ።
                  </p>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <UserCheck className="w-8 h-8 mx-auto text-emerald-500/60 mb-1.5" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    በዚህ ክፍል ምንም አዲስ የአባልነት ጥያቄ የለም
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {req.userName}
                          </h4>
                          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                            · {MEMBERSHIP_STATUS_CONFIG[req.status].amharicLabel}
                          </span>
                          {req.division && (
                            <span className="text-[11px] font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                              · {DIVISIONS[req.division]?.titleAmharic || req.division}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2">
                          <span className="font-mono text-slate-700 dark:text-slate-300">{req.userEmail}</span>
                          <span>· {req.createdAt}</span>
                          {req.sundaySchoolId && (
                            <span className="font-mono font-bold text-[#8B0000] dark:text-[#FFD54F]">
                              · ID: {req.sundaySchoolId}
                            </span>
                          )}
                          {req.requestedPosition && (
                            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                              · {EHUD_DEPARTMENT_POSITIONS[req.requestedPosition]?.rank}ኛ. {EHUD_DEPARTMENT_POSITIONS[req.requestedPosition]?.amharicTitle}
                            </span>
                          )}
                        </p>

                        {req.serviceSkills && req.serviceSkills.length > 0 && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            ክህሎት፦ {req.serviceSkills.join(' · ')}
                          </p>
                        )}

                        {req.preferredResponsibilities && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                            የሚመርጡት ኃላፊነት፦ «{req.preferredResponsibilities}»
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setAppointingUser(null);
                            setApprovingMembership(req);
                            setAssignedCanApproveForApproval(Boolean(req.canApproveMembers));
                            const ehudPos = getEhudPositionFromMembership(
                              req.requestedPosition,
                              req.role
                            );
                            setAssignedEhudPositionForApproval(
                              ehudPos === 'DEPARTMENT_HEAD' && !isSuperAdmin ? 'MIKITIL_HEAD' : ehudPos
                            );
                            setAssignedRoleForApproval(
                              req.departmentId === 'ehud_merha_gibir'
                                ? mapEhudPositionToUserRole(
                                    ehudPos === 'DEPARTMENT_HEAD' && !isSuperAdmin
                                      ? 'MIKITIL_HEAD'
                                      : ehudPos
                                  )
                                : req.requestedPosition === 'DEPARTMENT_HEAD' && isSuperAdmin
                                ? 'ADMIN'
                                : req.role || 'CONTRIBUTOR'
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>አጽድቅ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectingMembership(req);
                            setRejectionReasonText('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>አትቀበል</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cross-department pending requests visible to Super Admin */}
              {!isDepartmentPortalLocked && isSuperAdmin && otherDeptPendingRequests.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-[#B88500] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>በሌሎች ክፍሎች የቀረቡ ጥያቄዎች ({otherDeptPendingRequests.length})</span>
                  </h4>
                  <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 divide-y divide-amber-100 dark:divide-amber-900/40 overflow-hidden">
                    {otherDeptPendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {req.userName}
                            </span>
                            <span className="font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                              · {req.departmentName}
                            </span>
                            {req.sundaySchoolId && (
                              <span className="text-[11px] font-mono font-bold text-[#8B0000] dark:text-[#FFD54F]">
                                · ID: {req.sundaySchoolId}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{req.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveDepartment(req.departmentId)}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer"
                          >
                            ወደ ክፍሉ ቀይር
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAppointingUser(null);
                              setApprovingMembership(req);
                              setAssignedCanApproveForApproval(Boolean(req.canApproveMembers));
                              const ehudPos = getEhudPositionFromMembership(
                                req.requestedPosition,
                                req.role
                              );
                              setAssignedEhudPositionForApproval(ehudPos);
                              setAssignedRoleForApproval(
                                req.departmentId === 'ehud_merha_gibir'
                                  ? mapEhudPositionToUserRole(ehudPos)
                                  : req.requestedPosition === 'DEPARTMENT_HEAD'
                                  ? 'ADMIN'
                                  : req.role || 'MEMBER'
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer"
                          >
                            አጽድቅ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Approve / Add Member Directly by Email */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[#8B0000] dark:text-[#FFD54F] flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>በኢሜይል ቀድሞ አጽድቅ / አባል ጨምር</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    አባሉ አንዴ Login ሲያደርግ ወዲያውኑ ጸድቆ ወደ «{currentDeptInfo?.shortTitleAmharic}» ይገባል።
                  </p>
                </div>

                <form
                  onSubmit={handleCreateInviteSubmit}
                  className="p-4 rounded-xl border border-[#B88500]/30 bg-amber-50/40 dark:bg-slate-900/50 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        የአባሉ ኢሜይል *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="elsabet@example.com"
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#B88500]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ሙሉ ስም *
                      </label>
                      <input
                        type="text"
                        required
                        value={inviteFullName}
                        onChange={(e) => setInviteFullName(e.target.value)}
                        placeholder="ኤልሳቤጥ ..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#B88500]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        የሰንበት ት/ቤት መታወቂያ (ID)
                      </label>
                      <input
                        type="text"
                        value={inviteSundaySchoolId}
                        onChange={(e) => setInviteSundaySchoolId(e.target.value)}
                        placeholder="ለምሳሌ፡ TS-2019-042"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#B88500]"
                      />
                    </div>

                    {activeDepartment === 'ehud_merha_gibir' ? (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          የክፍል ሚና *
                        </label>
                        <select
                          value={inviteEhudPosition}
                          onChange={(e) =>
                            setInviteEhudPosition(e.target.value as EhudDepartmentPosition)
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#B88500]"
                        >
                          {isSuperAdmin && (
                            <option value="DEPARTMENT_HEAD">1ኛ. የክፍል ኃላፊ (Department Head)</option>
                          )}
                          <option value="MIKITIL_HEAD">2ኛ. ምክትል ኃላፊ (Mikitil Head)</option>
                          <option value="MEMBER">3ኛ. አባል (Member)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          የክፍል ሚና *
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as UserRole)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#B88500]"
                        >
                          <option value="MEMBER">አባል (Member)</option>
                          <option value="CONTRIBUTOR">ደራሲ / አቅራቢ (Contributor)</option>
                          <option value="REVIEWER">ገምጋሚ (Reviewer)</option>
                          {isSuperAdmin && (
                            <option value="ADMIN">የክፍሉ አስተዳዳሪ (Department Admin)</option>
                          )}
                        </select>
                      </div>
                    )}

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isSendingInvite}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isSendingInvite ? 'በማስቀመጥ ላይ...' : 'ቀድሞ አጽድቅ'}</span>
                      </button>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-emerald-300/70 dark:border-emerald-800/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteCanApproveMembers}
                        onChange={(e) => setInviteCanApproveMembers(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-[#B88500]"
                      />
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                        የ«{currentDeptInfo?.shortTitleAmharic || activeDepartment}» አባላትን ብቻ ማረጋገጥና ማጽደቅ ይችላል
                      </span>
                    </label>
                  )}

                  {inviteFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-medium ${
                        inviteFeedback.type === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      {inviteFeedback.text}
                    </div>
                  )}
                </form>

                {activeInvitesForDept.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      በመጠባበቅ ላይ ያሉ ቀድመው የጸደቁ ግብዣዎች ({activeInvitesForDept.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {activeInvitesForDept.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {inv.fullName}
                              </span>
                              {inv.canApproveMembers && (
                                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                  · አባል አጽዳቂ
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">
                              {inv.emailLower} •{' '}
                              {inv.departmentId === 'ehud_merha_gibir'
                                ? (() => {
                                    const pos = getEhudPositionFromMembership(inv.requestedPosition, inv.role);
                                    return `${EHUD_DEPARTMENT_POSITIONS[pos].rank}ኛ. ${EHUD_DEPARTMENT_POSITIONS[pos].amharicTitle}`;
                                  })()
                                : inv.role}
                              {inv.sundaySchoolId ? ` • ID: ${inv.sundaySchoolId}` : ''}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => cancelDepartmentInvite(inv.id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 shrink-0 cursor-pointer"
                          >
                            ሰርዝ
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rejected or Suspended Memberships */}
              {rejectedOrSuspendedMemberships.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>ውድቅ የተደረጉ ወይም የታገዱ አባላት ({rejectedOrSuspendedMemberships.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {rejectedOrSuspendedMemberships.map((mem) => (
                      <div
                        key={mem.id}
                        className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {mem.userName}
                            </span>
                            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                              · {MEMBERSHIP_STATUS_CONFIG[mem.status].amharicLabel}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500">{mem.userEmail}</p>
                          {mem.rejectionReason && (
                            <p className="text-[11px] text-rose-700 dark:text-rose-300">
                              ምክንያት፦ {mem.rejectionReason}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAppointingUser(null);
                            setApprovingMembership(mem);
                            setAssignedCanApproveForApproval(Boolean(mem.canApproveMembers));
                            const ehudPos = getEhudPositionFromMembership(
                              mem.requestedPosition,
                              mem.role
                            );
                            setAssignedEhudPositionForApproval(
                              ehudPos === 'DEPARTMENT_HEAD' && !isSuperAdmin ? 'MIKITIL_HEAD' : ehudPos
                            );
                            setAssignedRoleForApproval(
                              mem.departmentId === 'ehud_merha_gibir'
                                ? mapEhudPositionToUserRole(
                                    ehudPos === 'DEPARTMENT_HEAD' && !isSuperAdmin
                                      ? 'MIKITIL_HEAD'
                                      : ehudPos
                                  )
                                : mem.role || 'MEMBER'
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                        >
                          እንደገና አጽድቅ
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Super Admin Registered Accounts Directory */}
              {isSuperAdmin && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>የተመዘገቡ አካውንቶች ዝርዝር ({registeredUsers.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ገና በዚህ ክፍል ያልጸደቁ ተጠቃሚዎችን በቀጥታ መፈለግና ማጽደቅ ይችላሉ።
                      </p>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={userDirectoryQuery}
                        onChange={(e) => setUserDirectoryQuery(e.target.value)}
                        placeholder="በስም፣ በኢሜይል ወይም በID ፈልግ..."
                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                      />
                    </div>
                  </div>

                  {registeredUsersError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                      የተጠቃሚዎችን ዝርዝር መጫን አልተቻለም፦ {registeredUsersError}
                    </div>
                  )}

                  {unassignedRegisteredUsers.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic py-2">
                      በ«{currentDeptInfo?.shortTitleAmharic}» ውስጥ ገና ያልጸደቀ ተመዝጋቢ አልተገኘም።
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {unassignedRegisteredUsers.map((u) => (
                        <div
                          key={u.id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {u.fullName}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">{u.email}</div>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {u.sundaySchoolId && (
                                <span className="text-[10px] font-mono font-bold text-[#8B0000] dark:text-[#FFD54F]">
                                  ID: {u.sundaySchoolId}
                                </span>
                              )}
                              {u.requestedPosition && (
                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                  {EHUD_DEPARTMENT_POSITIONS[u.requestedPosition]?.amharicTitle}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setApprovingMembership(null);
                              setAppointingUser(u);
                              setAssignedCanApproveForApproval(false);
                              const ehudPos = getEhudPositionFromMembership(
                                u.requestedPosition,
                                u.role
                              );
                              setAssignedEhudPositionForApproval(ehudPos);
                              setAssignedRoleForApproval(
                                activeDepartment === 'ehud_merha_gibir'
                                  ? mapEhudPositionToUserRole(ehudPos)
                                  : u.requestedPosition === 'DEPARTMENT_HEAD'
                                  ? 'ADMIN'
                                  : 'MEMBER'
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-[11px] font-bold shrink-0 cursor-pointer"
                          >
                            ወደ ክፍሉ አጽድቅ
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: APPROVE MEMBERSHIP OR APPOINT REGISTERED USER ================= */}
      {(approvingMembership || appointingUser) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white mb-1">
              {approvingMembership?.status === 'APPROVED'
                ? 'የአባል የክፍል ሚና ማስተካከያ'
                : 'የአባልነት ማመልከቻ ማጽደቅ'}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              ለአመልካቹ{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {approvingMembership?.userName || appointingUser?.fullName}
              </strong>{' '}
              በ«
              {approvingMembership
                ? approvingMembership.departmentName
                : currentDeptInfo?.titleAmharic}
              » ውስጥ ተገቢውን ሚና ይመድቡ።
            </p>

            {((approvingMembership?.sundaySchoolId || appointingUser?.sundaySchoolId) ||
              (approvingMembership?.requestedPosition || appointingUser?.requestedPosition)) && (
              <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                {(approvingMembership?.sundaySchoolId || appointingUser?.sundaySchoolId) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">መታወቂያ ቁጥር፦</span>
                    <span className="font-mono font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                      {approvingMembership?.sundaySchoolId || appointingUser?.sundaySchoolId}
                    </span>
                  </div>
                )}
                {(approvingMembership?.requestedPosition || appointingUser?.requestedPosition) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">የተጠየቀ የክፍል ሚና፦</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {
                        EHUD_DEPARTMENT_POSITIONS[
                          (approvingMembership?.requestedPosition ||
                            appointingUser?.requestedPosition)!
                        ]?.rank
                      }
                      ኛ.{' '}
                      {
                        EHUD_DEPARTMENT_POSITIONS[
                          (approvingMembership?.requestedPosition ||
                            appointingUser?.requestedPosition)!
                        ]?.amharicTitle
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {(approvingMembership?.departmentId || activeDepartment) === 'ehud_merha_gibir' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    የክፍሉ ሚና (Department Role) *
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['DEPARTMENT_HEAD', 'MIKITIL_HEAD', 'MEMBER'] as EhudDepartmentPosition[]).map(
                      (posKey) => {
                        if (posKey === 'DEPARTMENT_HEAD' && !isSuperAdmin) return null;
                        const pos = EHUD_DEPARTMENT_POSITIONS[posKey];
                        const isSelected = assignedEhudPositionForApproval === posKey;
                        return (
                          <button
                            key={posKey}
                            type="button"
                            onClick={() => {
                              setAssignedEhudPositionForApproval(posKey);
                              setAssignedRoleForApproval(mapEhudPositionToUserRole(posKey));
                            }}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'border-[#0C4A9E] dark:border-[#7FAFFF] bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-[#0C4A9E]'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {pos.rank}ኛ. {pos.amharicTitle} ({pos.englishTitle})
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {pos.description}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#0C4A9E] dark:text-[#7FAFFF] shrink-0" />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
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
              )}

              {isSuperAdmin && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      assignedRoleForApproval === 'ADMIN' ||
                      ((approvingMembership?.departmentId || activeDepartment) === 'ehud_merha_gibir' &&
                        assignedEhudPositionForApproval === 'DEPARTMENT_HEAD') ||
                      assignedCanApproveForApproval
                    }
                    disabled={
                      assignedRoleForApproval === 'ADMIN' ||
                      ((approvingMembership?.departmentId || activeDepartment) === 'ehud_merha_gibir' &&
                        assignedEhudPositionForApproval === 'DEPARTMENT_HEAD')
                    }
                    onChange={(e) => setAssignedCanApproveForApproval(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-[#B88500]"
                  />
                  <div className="text-[11px] leading-snug">
                    <div className="font-bold text-emerald-900 dark:text-emerald-200">
                      የክፍሉን አባላት ማረጋገጥና ማጽደቅ ይችላል (Member Authorizer)
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-300/80">
                      በ«{approvingMembership ? approvingMembership.departmentName : currentDeptInfo?.shortTitleAmharic}» ውስጥ ብቻ አባላትን እንዲያጸድቅ ሥልጣን ይሰጣል (ለሌሎች ክፍሎች አይሰራም)።
                    </div>
                  </div>
                </label>
              )}

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
                    setAppointingUser(null);
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
                    const isApprovalEhud =
                      (approvingMembership?.departmentId || activeDepartment) === 'ehud_merha_gibir';
                    const roleToSave = isApprovalEhud
                      ? mapEhudPositionToUserRole(assignedEhudPositionForApproval)
                      : assignedRoleForApproval;
                    const ehudPosToSave = isApprovalEhud
                      ? assignedEhudPositionForApproval
                      : undefined;
                    const canApproveToSave = isSuperAdmin
                      ? roleToSave === 'ADMIN' || assignedCanApproveForApproval
                      : undefined;
                    try {
                      if (approvingMembership) {
                        await approveMembershipRequest(
                          approvingMembership.id,
                          roleToSave,
                          ehudPosToSave,
                          canApproveToSave
                        );
                        setApprovingMembership(null);
                      } else if (appointingUser) {
                        await appointUserToDepartment(
                          appointingUser,
                          activeDepartment,
                          roleToSave,
                          ehudPosToSave,
                          canApproveToSave
                        );
                        setAppointingUser(null);
                      }
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
              {/* Sunday Sheet & Slot Selector */}
              {relevantDailySheets.length > 0 && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0C4A9E] dark:text-[#7FAFFF] mb-1">
                        የእሁድ መርሐ ግብር ሉህ ምረጥ
                      </label>
                      <select
                        value={assignForm.scheduleProgramId}
                        onChange={(e) => {
                          const picked = relevantDailySheets.find((s) => s.id === e.target.value);
                          if (!picked) return;
                          const firstSlot = picked.slots[0];
                          setAssignForm({
                            ...assignForm,
                            scheduleProgramId: picked.id,
                            division: picked.division,
                            programDate: picked.dateAmharic,
                            deadlineDate: picked.dateAmharic,
                            programTime: firstSlot?.timeRange || picked.timeAmharic,
                            agendaSlotId: firstSlot?.id || 'general_slot',
                            agendaSlotTitle: firstSlot?.slotTitle || picked.mainTopic,
                            groupName: assignForm.groupName || picked.leader,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700"
                      >
                        {relevantDailySheets.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.dateAmharic} — {s.mainTopic}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0C4A9E] dark:text-[#7FAFFF] mb-1">
                        ክፍለ-ጊዜ (Agenda Slot)
                      </label>
                      <select
                        value={assignForm.agendaSlotId}
                        onChange={(e) => {
                          const activeSheet = relevantDailySheets.find(
                            (s) => s.id === assignForm.scheduleProgramId
                          );
                          const pickedSlot = activeSheet?.slots.find((sl) => sl.id === e.target.value);
                          if (pickedSlot) {
                            setAssignForm({
                              ...assignForm,
                              agendaSlotId: pickedSlot.id,
                              agendaSlotTitle: pickedSlot.slotTitle,
                              programTime: pickedSlot.timeRange,
                              title: assignForm.title || `${pickedSlot.slotTitle} አፈጻጸም`,
                            });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700"
                      >
                        {(
                          relevantDailySheets.find((s) => s.id === assignForm.scheduleProgramId)
                            ?.slots || []
                        ).map((sl) => (
                          <option key={sl.id} value={sl.id}>
                            {sl.timeRange} — {sl.slotTitle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

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

              {activeDepartment === 'ehud_merha_gibir' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የአዘጋጅ ምድብ ፈጣን ምርጫ (Squad Quick-Select)
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const sq = allEhudSquads.find((s) => s.id === e.target.value);
                      if (!sq) return;
                      const matchedIds = approvedMembers
                        .filter((m) =>
                          sq.members.some((name) => name.includes(m.userName)) ||
                          sq.coordinatorName.includes(m.userName)
                        )
                        .map((m) => m.userId);
                      setAssignForm({
                        ...assignForm,
                        groupName: sq.nameAmharic,
                        assignedMemberIds:
                          matchedIds.length > 0 ? matchedIds : assignForm.assignedMemberIds,
                        responsibleLeadId: matchedIds[0] || assignForm.responsibleLeadId,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/70 dark:border-amber-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- ከ2019 ምድቦች አንዱን ይምረጡ (10 የወጣት / ሕፃናት / ማዕከላውያን) --</option>
                    {allEhudSquads.map((sq) => (
                      <option key={sq.id} value={sq.id}>
                        {sq.nameAmharic} — አስተባባሪ፦ {sq.coordinatorName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
