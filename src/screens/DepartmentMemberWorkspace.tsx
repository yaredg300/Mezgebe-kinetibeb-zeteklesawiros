import React, { useState } from 'react';
import {
  CalendarCheck2,
  CalendarDays,
  FolderArchive,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  FileText,
  RotateCcw,
  Sparkles,
  Building2,
  User,
  Check,
  Play,
  FileCheck,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import {
  ScheduleTaskAssignment,
  ScheduleTaskStatus,
  SCHEDULE_TASK_STATUS_CONFIG,
  DIVISIONS,
} from '../types';
import { HaragDivider, CrossOrnament } from '../components/Ornaments';

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
    scheduleAssignments,
    departmentNotifications,
    dailyPlanSheets,
    works,
    acceptAssignment,
    updateAssignmentProgress,
    submitAssignmentDeliverable,
    markNotificationRead,
  } = useArchive();

  const [activeTab, setActiveTab] = useState<MemberWorkspaceTab>('MY_ASSIGNMENTS');
  const [assignmentFilter, setAssignmentFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  // Submit deliverable modal
  const [submittingTask, setSubmittingTask] = useState<ScheduleTaskAssignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState<string>('');
  const [submissionFileName, setSubmissionFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentDeptInfo = departmentsList.find((d) => d.id === activeDepartment);

  // My tasks
  const myTasks = scheduleAssignments.filter((a) => {
    if (a.departmentId !== activeDepartment) return false;
    return (
      a.assignedMemberIds.includes(currentUser.id) ||
      a.responsibleLeadId === currentUser.id ||
      a.assignedMemberNames.some((n) => n === currentUser.fullName)
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
    if (activeDepartment === 'ehud_merha_gibir') return true;
    if (activeDepartment === 'kinetibeb') return sheet.division === 'youth';
    return true;
  });

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTask) return;
    setIsSubmitting(true);
    try {
      await submitAssignmentDeliverable(submittingTask.id, {
        content: submissionContent,
        fileName: submissionFileName || undefined,
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
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#0C4A9E] via-[#072958] to-[#141926] text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B88500]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B88500] text-slate-900 text-[10px] font-black tracking-wider uppercase">
                የአባል የሥራ ገበታ
              </span>
              <span className="text-xs text-blue-200">
                የተመደበ ሚና፦ {activeMembership?.role || 'MEMBER'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-[#FFD54F]">
              {currentDeptInfo?.titleAmharic || 'የክፍሉ የአባልነት ገጽ'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-serif-ethiopic mt-0.5">
              የእኔ የሥራ ምደባዎች፣ ዕለታዊ መርሐ ግብሮች፣ ሰነዶችና ማሳወቂያዎች
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center">
              <p className="text-[10px] text-blue-200">ንቁ ሥራዎቼ</p>
              <p className="text-lg font-black text-white">{activeMyTasks.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center">
              <p className="text-[10px] text-blue-200">የተጠናቀቁ</p>
              <p className="text-lg font-black text-emerald-300">{completedMyTasks.length}</p>
            </div>
          </div>
        </div>

        {/* Member Sub-tabs Navigation */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 scrollbar-none border-t border-white/10 pt-3">
          {[
            { id: 'MY_ASSIGNMENTS', label: 'የእኔ የሥራ ምደባዎች', count: activeMyTasks.length },
            { id: 'SCHEDULE', label: 'የክፍሉ መርሐ ግብር', count: relevantDailySheets.length },
            { id: 'RESOURCES', label: 'የክፍሉ ሰነዶችና ማህደር', count: deptWorks.length },
            { id: 'NOTIFICATIONS', label: 'ማሳወቂያዎች', count: unreadNotifications.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MemberWorkspaceTab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
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
                      ? tab.count > 0 && tab.id === 'NOTIFICATIONS'
                        ? 'bg-rose-600 text-white'
                        : 'bg-blue-100 text-blue-900'
                      : tab.count > 0 && tab.id === 'NOTIFICATIONS'
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

      {/* 2. TAB: MY ASSIGNMENTS */}
      {activeTab === 'MY_ASSIGNMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAssignmentFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  assignmentFilter === 'ACTIVE'
                    ? 'bg-[#0C4A9E] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                ንቁ ሥራዎች ({activeMyTasks.length})
              </button>
              <button
                onClick={() => setAssignmentFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  assignmentFilter === 'COMPLETED'
                    ? 'bg-[#0C4A9E] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                የተጠናቀቁ ({completedMyTasks.length})
              </button>
              <button
                onClick={() => setAssignmentFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  assignmentFilter === 'ALL'
                    ? 'bg-[#0C4A9E] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                ሁሉም ({myTasks.length})
              </button>
            </div>
          </div>

          {/* Tasks list */}
          {myTasks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800">
              <CalendarCheck2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                ለጊዜው የተመደበልዎት ሥራ የለም
              </p>
              <p className="text-xs text-slate-500">
                የክፍሉ አስተዳዳሪ አዳዲስ የዕሁድ ክፍለ-ጊዜዎችን ሲመድቡልዎት እዚህ ያገኟቸዋል።
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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
                    <div
                      key={task.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111D30] shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg?.bgClass} ${statusCfg?.colorClass} ${statusCfg?.borderClass}`}
                            >
                              {statusCfg?.amharicLabel}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              ክፍለ-ጊዜ፦ {task.agendaSlotTitle}
                            </span>
                          </div>
                          <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white">
                            {task.title}
                          </h3>
                        </div>

                        {/* Interactive Workflow Buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {task.status === 'ASSIGNED' && (
                            <button
                              onClick={() => acceptAssignment(task.id)}
                              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ተቀበል (Accept Task)</span>
                            </button>
                          )}

                          {task.status === 'ACCEPTED' && (
                            <button
                              onClick={() =>
                                updateAssignmentProgress(task.id, 'IN_PROGRESS')
                              }
                              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>ሥራ ጀምር (Start Progress)</span>
                            </button>
                          )}

                          {task.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => {
                                setSubmittingTask(task);
                                setSubmissionContent('');
                                setSubmissionFileName('');
                              }}
                              className="px-4 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>ሥራ አስረክብ (Submit Deliverable)</span>
                            </button>
                          )}

                          {task.status === 'REVISION_REQUESTED' && (
                            <button
                              onClick={() => {
                                setSubmittingTask(task);
                                setSubmissionContent(task.deliverableSubmission?.content || '');
                                setSubmissionFileName(task.deliverableSubmission?.fileName || '');
                              }}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>ማሻሻያውን እንደገና አስረክብ (Re-Submit)</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Instructions */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif-ethiopic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        {task.instructions}
                      </p>

                      {/* Dates & Deliverables */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>መርሐ ግብር፦ <strong className="text-slate-800 dark:text-slate-200">{task.programDate} ({task.programTime})</strong></span>
                        <span>የማስረከቢያ ቀን፦ <strong className="text-rose-600 dark:text-rose-400">{task.deadlineDate}</strong></span>
                        {task.requiredDeliverable && (
                          <span className="text-[#0C4A9E] dark:text-[#7FAFFF] font-bold">
                            የሚጠበቅ ሰነድ፦ {task.requiredDeliverable}
                          </span>
                        )}
                      </div>

                      {/* Administrator Feedback banner */}
                      {task.adminFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs font-serif-ethiopic ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                          }`}
                        >
                          <span className="font-bold block mb-0.5">
                            የአስተዳዳሪ ግምገማና አስተያየት፦
                          </span>
                          <p className="leading-relaxed">«{task.adminFeedback}»</p>
                        </div>
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
        <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#B88500]" />
              <span>የክፍሉ መርሐ ግብሮችና ክፍለ-ጊዜዎች</span>
            </h3>
            <p className="text-xs text-slate-500">
              በ«{currentDeptInfo?.titleAmharic}» ሥር የታቀዱ የ2019 ዓ.ም. ዕለታዊ ፕሮግራሞች
            </p>
          </div>

          <div className="space-y-4">
            {relevantDailySheets.map((sheet) => (
              <div
                key={sheet.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#8B0000] text-white text-[10px] font-black">
                      {sheet.dateAmharic}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {sheet.mainTopic}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">{sheet.timeAmharic}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {sheet.slots.map((s) => (
                    <div
                      key={s.id}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {s.slotTitle}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{s.timeRange}</span>
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
        <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-[#0C4A9E]" />
              <span>የክፍሉ የጸደቁ ሰነዶችና ማህደር ({deptWorks.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              ለ«{currentDeptInfo?.titleAmharic}» አባላት የተፈቀዱ ሰነዶች፣ መመሪያዎችና የጥበብ ውጤቶች
            </p>
          </div>

          {deptWorks.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
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
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-[#B88500] cursor-pointer transition-colors"
                >
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 text-[10px] font-bold">
                    {w.categoryName}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {w.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{w.excerpt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white dark:bg-[#111D30] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-500" />
              <span>የክፍሉ ማሳወቂያዎች ({myNotifications.length})</span>
            </h3>
          </div>

          {myNotifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                ምንም አዲስ ማሳወቂያ የለም
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-colors ${
                    notif.isRead
                      ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 text-slate-900 dark:text-white font-medium shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#0C4A9E] dark:text-[#7FAFFF]">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{notif.createdAt}</span>
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
              የሥራ ሰነድ / ሪፖርት ማስረከብ
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ሥራ፦ <strong className="text-slate-800 dark:text-slate-200">{submittingTask.title}</strong>
            </p>

            <form onSubmit={handleDeliverableSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተዘጋጀው ጽሑፍ / ማጠቃለያ *
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="የተዘጋጀውን ስክሪፕት፣ የትምህርት ነጥቦች፣ ወይም የዝግጅት ሪፖርት እዚህ ያስገቡ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተያያዘ ፋይል ስም (ካለ)
                </label>
                <input
                  type="text"
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  placeholder="ለምሳሌ፡ የመድረክ_ትዕይንት_ስክሪፕት.pdf"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

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
    </div>
  );
};
