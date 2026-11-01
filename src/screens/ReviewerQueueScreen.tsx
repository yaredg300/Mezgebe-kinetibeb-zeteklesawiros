import React, { useState } from 'react';
import {
  Check,
  RotateCcw,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { WorkItem, SubmissionStatus } from '../types';
import { AppHeader } from '../components/AppHeader';
import { ManuscriptBox, ManuscriptSeal, StatusBadge } from '../components/Ornaments';

export const ReviewerQueueScreen: React.FC<{
  onWorkClick: (workId: string) => void;
  onBackClick: () => void;
}> = ({ onWorkClick, onBackClick }) => {
  const { works, currentUser, reviewWorkAction, deleteWork } = useArchive();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');

  // Revision modal state
  const [revisionWork, setRevisionWork] = useState<WorkItem | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const pendingWorks = works.filter(
    (w) => w.status === 'UNDER_REVIEW' || w.status === 'REVISION_REQUESTED'
  );
  const approvedWorks = works.filter((w) => w.status === 'APPROVED' || w.status === 'PUBLISHED');

  const filteredAllWorks = works.filter((w) => {
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      w.title.toLowerCase().includes(q) ||
      w.writerName.toLowerCase().includes(q) ||
      w.categoryName.toLowerCase().includes(q) ||
      w.tags.some((t) => t.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const displayedList =
    activeTab === 'pending'
      ? pendingWorks
      : activeTab === 'approved'
      ? approvedWorks
      : filteredAllWorks;

  const handleApprove = (work: WorkItem) => {
    reviewWorkAction(work.id, 'APPROVED', null, `${currentUser.fullName} (${currentUser.role})`);
    setActionNotice(`«${work.title}» በተሳካ ሁኔታ ጸድቋል!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleRequestRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionWork) return;
    reviewWorkAction(revisionWork.id, 'REVISION_REQUESTED', feedbackText, `${currentUser.fullName}`);
    setActionNotice(`ለ«${revisionWork.title}» ማሻሻያ ተጠይቋል!`);
    setRevisionWork(null);
    setFeedbackText('');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDelete = (work: WorkItem) => {
    if (confirm(`እርግጠኛ ነዎት «${work.title}» ይሰረዝ?`)) {
      deleteWork(work.id);
      setActionNotice(`«${work.title}» ተሰርዟል!`);
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      <AppHeader
        title={
          currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'
            ? 'የአድሚንና የጽሁፎች ማዕከል'
            : 'የግምገማ ወረፋ'
        }
        subtitle="የቀረቡ፣ የጸደቁና የተመዘገቡ ስራዎች መቆጣጠሪያ"
        showBack={true}
        onBackClick={onBackClick}
      />

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Supervisor Status Card */}
        <ManuscriptBox className="p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <ManuscriptSeal
              text={
                currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'
                  ? 'አድሚን'
                  : 'ገምጋሚ'
              }
              color="#0C4A9E"
            />
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
                የኪነጥበብ ስራዎች አስተዳደርና ግምገማ
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                ተቆጣጣሪ፦ <strong>{currentUser.fullName}</strong> ({currentUser.department})
              </p>
            </div>
          </div>
        </ManuscriptBox>

        {/* Action Notice */}
        {actionNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Queue Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
              activeTab === 'pending'
                ? 'bg-[#0C4A9E] text-white border-[#0C4A9E] shadow-sm'
                : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            በግምገማ ({pendingWorks.length})
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
              activeTab === 'approved'
                ? 'bg-[#2E6930] text-white border-[#2E6930] shadow-sm'
                : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            የጸደቁ ({approvedWorks.length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
              activeTab === 'all'
                ? 'bg-[#B88500] text-white border-[#B88500] shadow-sm'
                : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            ሁሉም ጽሁፎች ({works.length})
          </button>
        </div>

        {/* Search & Filter when on All tab */}
        {activeTab === 'all' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="በርዕስ፣ በደራሲ ወይም በምድብ ፈልግ..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | 'all')}
              className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 font-bold"
            >
              <option value="all">ሁሉም ሁኔታዎች (All Statuses)</option>
              <option value="UNDER_REVIEW">በግምገማ ላይ</option>
              <option value="REVISION_REQUESTED">ማሻሻያ የተጠየቀበት</option>
              <option value="APPROVED">የጸደቀ</option>
              <option value="PUBLISHED">የታተመ</option>
            </select>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          {displayedList.length === 0 ? (
            <ManuscriptBox className="p-8 text-center text-slate-500">
              <p className="text-sm">በዚህ ዝርዝር ውስጥ ምንም ሥራ አልተገኘም።</p>
            </ManuscriptBox>
          ) : (
            displayedList.map((work) => (
              <ManuscriptBox key={work.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B88500]/15 text-[#966C00] dark:text-[#FFD54F]">
                        {work.categoryName}
                      </span>
                      <StatusBadge status={work.status} />
                    </div>

                    <h4
                      onClick={() => onWorkClick(work.id)}
                      className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 hover:text-[#0C4A9E] cursor-pointer"
                    >
                      {work.title}
                    </h4>

                    <p className="text-xs text-slate-500 mt-0.5">
                      ደራሲ፦ <strong>{work.writerName}</strong> • {work.dateAmharic} • እትም v{work.version}
                    </p>
                  </div>

                  <button
                    onClick={() => onWorkClick(work.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#0C4A9E] hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="ሙሉውን አንብብ"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-serif-ethiopic line-clamp-2">
                  {work.excerpt}
                </p>

                {work.reviewerFeedback && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-800 dark:text-rose-300">
                    <strong>የገምጋሚ አስተያየት፦</strong> {work.reviewerFeedback}
                  </div>
                )}

                {/* Reviewer Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {work.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleApprove(work)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>አጽድቅ (Approve)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setRevisionWork(work);
                        setFeedbackText(work.reviewerFeedback || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ማሻሻያ ጠይቅ</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(work)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1"
                    title="ሰርዝ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ሰርዝ</span>
                  </button>
                </div>
              </ManuscriptBox>
            ))
          )}
        </div>
      </div>

      {/* Revision Request Modal */}
      {revisionWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#111D30] border-2 border-amber-500 p-6 shadow-2xl">
            <button
              onClick={() => setRevisionWork(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold font-serif-ethiopic">
                የማሻሻያ ጥያቄ ማቅረቢያ
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              ሥራ፦ <strong>{revisionWork.title}</strong> (ደራሲ፦ {revisionWork.writerName})
            </p>

            <form onSubmit={handleRequestRevision} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  የገምጋሚ አስተያየትና መመሪያ *
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="ደራሲው እንዲያስተካክላቸው የሚፈልጓቸውን ነጥቦች በዝርዝር ይግለጹ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                >
                  ማሻሻያውን ላክ
                </button>
                <button
                  type="button"
                  onClick={() => setRevisionWork(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  ተመለስ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
