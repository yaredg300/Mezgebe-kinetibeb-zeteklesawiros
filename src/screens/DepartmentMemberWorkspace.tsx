import React, { useState } from 'react';
import {
  CalendarCheck2,
  CalendarDays,
  FolderArchive,
  Bell,
  ArrowRight,
  Send,
  FileText,
  RotateCcw,
  Check,
  Play,
  Download,
  Eye,
  Users,
  Target,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  ScheduleTaskAssignment,
  SundayPlanPdfPackage,
  SundaySchoolDivision,
  SCHEDULE_TASK_STATUS_CONFIG,
  DIVISIONS,
} from '../types';
import { SundayPlanPdfViewerModal } from '../components/SundayPlanPdfViewerModal';
import {
  YOUTH_ANNUAL_TARGETS_2019,
  CHILDREN_TARGETS_2019,
  MAEKELAWIYAN_TARGETS_2019,
  YOUTH_ORGANIZER_SQUADS_2019,
  CHILDREN_TEACHER_SQUADS_2019,
  MAEKELAWIYAN_TEACHER_SQUADS_2019,
} from '../data/youthCombinedPlanData';

type MemberWorkspaceTab = 'MY_ASSIGNMENTS' | 'SCHEDULE' | 'RESOURCES' | 'NOTIFICATIONS';

export const DepartmentMemberWorkspace: React.FC<{
  onOpenWorkClick?: (workId: string) => void;
  onOpenScheduleDetails?: (programId: string) => void;
}> = ({ onOpenWorkClick, onOpenScheduleDetails }) => {
  const {
    activeDepartment,
    departmentsList,
    currentUser,
    activeMembership,
    selectedDivision,
    scheduleAssignments,
    departmentNotifications,
    dailyPlanSheets,
    pdfPackages,
    works,
    acceptAssignment,
    updateAssignmentProgress,
    submitAssignmentDeliverable,
    markNotificationRead,
  } = useArchive();

  const [activeTab, setActiveTab] = useState<MemberWorkspaceTab>('MY_ASSIGNMENTS');
  const [assignmentFilter, setAssignmentFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [scheduleDivFilter, setScheduleDivFilter] = useState<'ALL' | SundaySchoolDivision>('ALL');
  const [selectedPdfPkg, setSelectedPdfPkg] = useState<SundayPlanPdfPackage | null>(null);

  // Submit deliverable modal
  const [submittingTask, setSubmittingTask] = useState<ScheduleTaskAssignment | null>(null);
  const [submissionMode, setSubmissionMode] = useState<'ONSITE_DUTY' | 'DOCUMENT'>(
    activeDepartment === 'ehud_merha_gibir' ? 'ONSITE_DUTY' : 'DOCUMENT'
  );
  const [submissionContent, setSubmissionContent] = useState<string>('');
  const [submissionFileName, setSubmissionFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEhudDept = activeDepartment === 'ehud_merha_gibir';
  const currentDeptInfo = departmentsList.find((d) => d.id === activeDepartment);

  // My tasks strictly authenticated by UID
  const myTasks = scheduleAssignments.filter((a) => {
    if (a.departmentId !== activeDepartment) return false;
    return (
      a.assignedMemberIds.includes(currentUser.id) ||
      a.responsibleLeadId === currentUser.id
    );
  });

  const activeMyTasks = myTasks.filter(
    (t) => !['COMPLETED', 'CANCELLED'].includes(t.status)
  );
  const completedMyTasks = myTasks.filter((t) => t.status === 'COMPLETED');

  // Department notifications
  const myNotifications = departmentNotifications.filter((n) => {
    if (n.departmentId !== activeDepartment) return false;
    if (!n.targetUserId) return true; // broadcast
    return n.targetUserId === currentUser.id;
  });
  const unreadNotifications = myNotifications.filter((n) => !n.isRead);

  // Department Works
  const deptWorks = works.filter((w) => w.departmentId === activeDepartment);

  // Department schedule sheets
  const relevantDailySheets = dailyPlanSheets.filter((sheet) => {
    if (activeDepartment === 'ehud_merha_gibir') {
      return scheduleDivFilter === 'ALL' || sheet.division === scheduleDivFilter;
    }
    if (activeDepartment === 'kinetibeb') return sheet.division === 'youth';
    return true;
  });

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTask) return;
    setIsSubmitting(true);
    try {
      const finalContent =
        submissionMode === 'ONSITE_DUTY'
          ? `[የመድረክ ተገኝነት ማረጋገጫ] ${submissionContent.trim() || 'በእሁድ መርሐ ግብሩ ላይ በአካል ተገኝቼ የዕለቱን ተረኝነት አገልግሎት አከናውኛለሁ።'}`
          : submissionContent.trim();
      await submitAssignmentDeliverable(submittingTask.id, {
        content: finalContent,
        fileName: submissionMode === 'DOCUMENT' ? submissionFileName || undefined : undefined,
      });
      setSubmittingTask(null);
      setSubmissionContent('');
      setSubmissionFileName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* 1. Compact Member Header & Sub-tabs */}
      <div className="rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[#8B0000] dark:text-[#FFD54F]">
                የአባል የሥራ ገበታ
              </span>
              <span aria-hidden="true">·</span>
              <span>ሚና፦ {activeMembership?.role || 'MEMBER'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-serif-ethiopic text-slate-900 dark:text-white truncate mt-0.5">
              {currentDeptInfo?.titleAmharic || 'የክፍሉ የአባልነት ገጽ'}
            </h1>
          </div>

          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0 self-start sm:self-auto">
            <div className="px-3 py-1.5 text-center">
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">ንቁ ሥራዎች</span>
              <span className="font-mono tabular-nums text-sm font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                {activeMyTasks.length}
              </span>
            </div>
            <div className="px-3 py-1.5 text-center">
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">የተጠናቀቁ</span>
              <span className="font-mono tabular-nums text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {completedMyTasks.length}
              </span>
            </div>
          </div>
        </div>

        {/* Member Sub-tabs Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-slate-800 pt-2.5">
          {[
            { id: 'MY_ASSIGNMENTS', label: 'ሥራዎቼ', count: activeMyTasks.length },
            { id: 'SCHEDULE', label: 'መርሐ ግብር', count: relevantDailySheets.length },
            { id: 'RESOURCES', label: 'ሰነዶች', count: deptWorks.length },
            { id: 'NOTIFICATIONS', label: 'ማሳወቂያ', count: unreadNotifications.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const isAlertCount = tab.id === 'NOTIFICATIONS' && tab.count > 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as MemberWorkspaceTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] ${
                    isActive
                      ? 'text-white/90'
                      : isAlertCount
                      ? 'text-rose-600 dark:text-rose-400 font-black'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB: MY ASSIGNMENTS */}
      {activeTab === 'MY_ASSIGNMENTS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-0.5">
              <button
                type="button"
                onClick={() => setAssignmentFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  assignmentFilter === 'ACTIVE'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                ንቁ (<span className="font-mono tabular-nums">{activeMyTasks.length}</span>)
              </button>
              <button
                type="button"
                onClick={() => setAssignmentFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  assignmentFilter === 'COMPLETED'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                የተጠናቀቁ (<span className="font-mono tabular-nums">{completedMyTasks.length}</span>)
              </button>
              <button
                type="button"
                onClick={() => setAssignmentFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  assignmentFilter === 'ALL'
                    ? 'bg-[#0C4A9E] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                ሁሉም (<span className="font-mono tabular-nums">{myTasks.length}</span>)
              </button>
            </div>
          </div>

          {myTasks.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-[#111D30] rounded-xl border border-slate-200 dark:border-slate-800 px-4">
              <CalendarCheck2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                ለጊዜው የተመደበልዎት ሥራ የለም
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                የክፍሉ አስተዳዳሪ የእሁድ ክፍለ-ጊዜዎችን ሲመድቡልዎት እዚህ ያገኟቸዋል።
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111D30] divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {myTasks
                .filter((t) => {
                  if (assignmentFilter === 'ACTIVE')
                    return !['COMPLETED', 'CANCELLED'].includes(t.status);
                  if (assignmentFilter === 'COMPLETED')
                    return t.status === 'COMPLETED';
                  return true;
                })
                .map((task) => {
                  const statusCfg = SCHEDULE_TASK_STATUS_CONFIG[task.status];

                  return (
                    <div key={task.id} className="p-4 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg?.bgClass} ${statusCfg?.colorClass} ${statusCfg?.borderClass}`}
                            >
                              {statusCfg?.amharicLabel}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {task.agendaSlotTitle}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white mt-1">
                            {task.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          {task.status === 'ASSIGNED' && (
                            <button
                              type="button"
                              onClick={() => acceptAssignment(task.id)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ተቀበል</span>
                            </button>
                          )}

                          {task.status === 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => updateAssignmentProgress(task.id, 'IN_PROGRESS')}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>ሥራ ጀምር</span>
                            </button>
                          )}

                          {task.status === 'IN_PROGRESS' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSubmittingTask(task);
                                setSubmissionMode(isEhudDept ? 'ONSITE_DUTY' : 'DOCUMENT');
                                setSubmissionContent(
                                  isEhudDept
                                    ? 'በእሁድ መርሐ ግብሩ ላይ በአካል ተገኝቼ የተመደበልኝን ክፍለ-ጊዜ በሰዓቱ አከናውኛለሁ።'
                                    : ''
                                );
                                setSubmissionFileName('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isEhudDept ? 'ተገኝነት / ሪፖርት አስረክብ' : 'ሥራ አስረክብ'}</span>
                            </button>
                          )}

                          {task.status === 'REVISION_REQUESTED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSubmittingTask(task);
                                setSubmissionMode('DOCUMENT');
                                setSubmissionContent(task.deliverableSubmission?.content || '');
                                setSubmissionFileName(task.deliverableSubmission?.fileName || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>እንደገና አስረክብ</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {task.instructions && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {task.instructions}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                        <span>
                          መርሐ ግብር፦ <strong className="text-slate-700 dark:text-slate-300 font-mono tabular-nums">{task.programDate} ({task.programTime})</strong>
                        </span>
                        <span>· ቀነ-ገደብ፦ <strong className="text-rose-600 dark:text-rose-400 font-mono tabular-nums">{task.deadlineDate}</strong></span>
                        {task.requiredDeliverable && (
                          <span className="text-[#0C4A9E] dark:text-[#7FAFFF] font-semibold">
                            · የሚጠበቅ፦ {task.requiredDeliverable}
                          </span>
                        )}
                      </div>

                      {task.adminFeedback && (
                        <p
                          className={`p-2.5 rounded-lg text-xs border ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                          }`}
                        >
                          <strong className="mr-1">የአስተዳዳሪ አስተያየት፦</strong>
                          «{task.adminFeedback}»
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: DEPARTMENT SCHEDULE */}
      {activeTab === 'SCHEDULE' && (
        <div className="bg-white dark:bg-[#111D30] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#B88500]" />
                <span>የክፍሉ ዕለታዊ መርሐ ግብሮች (<span className="font-mono tabular-nums">{relevantDailySheets.length}</span>)</span>
              </h3>
              <p className="text-xs text-slate-500">
                በ«{currentDeptInfo?.titleAmharic}» ሥር የታቀዱ የ2019 ዓ.ም. ዕለታዊ ፕሮግራሞች
              </p>
            </div>

            {isEhudDept && (
              <div className="flex items-center gap-1 flex-wrap">
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
              </div>
            )}
          </div>

          <div className="space-y-3">
            {relevantDailySheets.map((sheet) => (
              <div
                key={sheet.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-xs font-bold text-[#8B0000] dark:text-[#FF8A80] font-mono tabular-nums">
                      {sheet.dateAmharic}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-[11px] font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                      {DIVISIONS[sheet.division]?.titleAmharic || sheet.division}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {sheet.mainTopic}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums shrink-0">
                    {sheet.timeAmharic}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111D30]">
                  {sheet.slots.map((s) => (
                    <div
                      key={s.id}
                      className="px-4 py-2 text-xs flex items-center justify-between gap-3"
                    >
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                        {s.slotTitle}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                        {s.timeRange}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB: DEPARTMENT RESOURCES */}
      {activeTab === 'RESOURCES' && (
        <div className="space-y-4">
          {isEhudDept && (
            <div className="bg-white dark:bg-[#111D30] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#8B0000]" />
                    <span>የ2019 ዓ.ም. ኦፊሴላዊ PDF ጥቅሎች (<span className="font-mono tabular-nums">{pdfPackages.length}</span>)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    የወጣቶች (38 ገጽ)፣ የማዕከላውያን (13 ገጽ) እና የሕፃናት (7 ገጽ) የተቀናጀ ዕቅድ ሰነዶች
                  </p>
                </div>
                {onOpenScheduleDetails && (
                  <button
                    type="button"
                    onClick={() => onOpenScheduleDetails('ehud_portal')}
                    className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap cursor-pointer"
                  >
                    <span>ሙሉ የእሁድ መርሐ ግብር ገጽ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pdfPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] mb-1">
                        <span className="font-bold text-[#8B0000] dark:text-[#FF8A80]">
                          {DIVISIONS[pkg.division]?.titleAmharic}
                        </span>
                        <span className="font-mono tabular-nums text-slate-500">{pkg.totalPages} ገጽ</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {pkg.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{pkg.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPdfPkg(pkg)}
                        className="flex-1 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>አንብብ</span>
                      </button>
                      <a
                        href={pkg.filePath}
                        download={pkg.fileName}
                        className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="አውርድ"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Division Targets & Squads Quick Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/15 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <Target className="w-3.5 h-3.5 text-[#B88500]" />
                    <span>የ{DIVISIONS[selectedDivision].titleAmharic} ዓመታዊ ዒላማዎች</span>
                  </div>
                  <div className="space-y-1">
                    {(selectedDivision === 'children'
                      ? CHILDREN_TARGETS_2019
                      : selectedDivision === 'intermediates'
                      ? MAEKELAWIYAN_TARGETS_2019
                      : YOUTH_ANNUAL_TARGETS_2019
                    )
                      .slice(0, 3)
                      .map((t) => (
                        <div key={t.id} className="text-[11px] text-slate-700 dark:text-slate-300">
                          <strong className="text-[#8B0000] dark:text-[#FFD54F] font-mono">{t.code}</strong> · {t.titleAmharic}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/15 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                    <Users className="w-3.5 h-3.5 text-[#0C4A9E]" />
                    <span>የ{DIVISIONS[selectedDivision].titleAmharic} ተረኛ አዘጋጅ ቡድኖች</span>
                  </div>
                  <div className="space-y-1">
                    {(selectedDivision === 'children'
                      ? CHILDREN_TEACHER_SQUADS_2019
                      : selectedDivision === 'intermediates'
                      ? MAEKELAWIYAN_TEACHER_SQUADS_2019
                      : YOUTH_ORGANIZER_SQUADS_2019
                    )
                      .slice(0, 4)
                      .map((sq) => (
                        <div key={sq.id} className="text-[11px] text-slate-700 dark:text-slate-300">
                          <strong>{sq.nameAmharic}</strong> · አስተባባሪ፦ {sq.coordinatorName}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#111D30] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-[#0C4A9E]" />
                <span>የክፍሉ የጸደቁ ሰነዶችና ማህደር (<span className="font-mono tabular-nums">{deptWorks.length}</span>)</span>
              </h3>
              <p className="text-xs text-slate-500">
                {isEhudDept
                  ? 'ለየእሁድ መርሐ ግብር ክፍል አባላት የተፈቀዱ ቃለ-ጉባኤዎች፣ የዕለት ሉሆችና የስርዓተ-አገልግሎት ሰነዶች'
                  : `ለ«${currentDeptInfo?.titleAmharic}» አባላት የተፈቀዱ ሰነዶች፣ መመሪያዎችና የጥበብ ውጤቶች`}
              </p>
            </div>

            {deptWorks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  በዚህ ክፍል ውስጥ የተመዘገበ የጸደቀ ሰነድ ገና የለም
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deptWorks.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => onOpenWorkClick && onOpenWorkClick(w.id)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 hover:border-[#B88500] cursor-pointer transition-colors"
                  >
                    <span className="text-[11px] font-semibold text-[#0C4A9E] dark:text-[#7FAFFF]">
                      {w.categoryName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {w.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{w.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white dark:bg-[#111D30] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-500" />
              <span>የክፍሉ ማሳወቂያዎች (<span className="font-mono tabular-nums">{myNotifications.length}</span>)</span>
            </h3>
          </div>

          {myNotifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                ምንም አዲስ ማሳወቂያ የለም
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {myNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 text-xs cursor-pointer transition-colors ${
                    notif.isRead
                      ? 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-400'
                      : 'bg-blue-50/50 dark:bg-blue-950/25 text-slate-900 dark:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#0C4A9E] dark:text-[#7FAFFF]">
                      {notif.title}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                      {notif.createdAt}
                    </span>
                  </div>
                  <p className="leading-relaxed font-serif-ethiopic">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: SUBMIT DELIVERABLE ================= */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white mb-1">
              {isEhudDept ? 'የተረኝነት ተገኝነት ወይም ሪፖርት ማስረከብ' : 'የሥራ ሰነድ / ሪፖርት ማስረከብ'}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              ሥራ፦ <strong className="text-slate-800 dark:text-slate-200">{submittingTask.title}</strong>
            </p>

            {/* Submission Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSubmissionMode('ONSITE_DUTY');
                  if (!submissionContent.trim()) {
                    setSubmissionContent(
                      'በእሁድ መርሐ ግብሩ ላይ በአካል ተገኝቼ የተመደበልኝን ክፍለ-ጊዜ በሰዓቱ አከናውኛለሁ።'
                    );
                  }
                }}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  submissionMode === 'ONSITE_DUTY'
                    ? 'bg-[#0C4A9E] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                የመድረክ ተገኝነት ማረጋገጫ
              </button>
              <button
                type="button"
                onClick={() => setSubmissionMode('DOCUMENT')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  submissionMode === 'DOCUMENT'
                    ? 'bg-[#0C4A9E] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                ሰነድ / ሪፖርት አስረክብ
              </button>
            </div>

            <form onSubmit={handleDeliverableSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {submissionMode === 'ONSITE_DUTY'
                    ? 'የአፈጻጸም እና የተገኝነት ማስታወሻ *'
                    : 'የተዘጋጀው ጽሑፍ / ማጠቃለያ *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder={
                    isEhudDept
                      ? 'የዕለቱን መርሐ ግብር አፈጻጸም፣ የመድረክ ሰዓት አጠባበቅ፣ የተገኙ ተሳታፊዎች ወይም ቃለ-ጉባኤ እዚህ ያስገቡ...'
                      : 'የተዘጋጀውን ስክሪፕት፣ የትምህርት ነጥቦች፣ ወይም የዝግጅት ሪፖርት እዚህ ያስገቡ...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              {submissionMode === 'DOCUMENT' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የተያያዘ ፋይል ስም (ካለ)
                  </label>
                  <input
                    type="text"
                    value={submissionFileName}
                    onChange={(e) => setSubmissionFileName(e.target.value)}
                    placeholder={
                      isEhudDept
                        ? 'ለምሳሌ፡ የእሁድ_መርሐ_ግብር_ቃለ_ጉባኤ.pdf'
                        : 'ለምሳሌ፡ የመድረክ_ትዕይንት_ስክሪፕት.pdf'
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'በማስረከብ ላይ...' : 'ለአስተዳዳሪ አስረክብ (Submit)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPdfPkg && (
        <SundayPlanPdfViewerModal
          packageData={selectedPdfPkg}
          onClose={() => setSelectedPdfPkg(null)}
        />
      )}
    </div>
  );
};
