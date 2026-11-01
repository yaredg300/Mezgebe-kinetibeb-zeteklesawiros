import React, { useState } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { UserRole, USER_ROLES, DIVISIONS, WorkItem } from '../types';
import { WorkCard } from '../components/Cards';
import { HaragDivider } from '../components/Ornaments';
import { QuickWorkPreviewModal } from '../components/LiturgicalAudioComponents';
import {
  User,
  ShieldCheck,
  Bookmark,
  FileText,
  Sparkles,
  LogOut,
  Moon,
  Sun,
  Layers,
  ChevronRight,
  ClipboardList,
  Info,
  Calendar,
} from 'lucide-react';

interface ProfileScreenProps {
  onSelectWork: (workId: string) => void;
  onNavigateToReviewerQueue: () => void;
  onNavigateToCreateWork: () => void;
  onNavigateToEvents: () => void;
  onOpenChurchInfo: () => void;
  onSwitchDivision: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onSelectWork,
  onNavigateToReviewerQueue,
  onNavigateToCreateWork,
  onNavigateToEvents,
  onOpenChurchInfo,
  onSwitchDivision,
}) => {
  const {
    currentUser,
    setUserRole,
    works,
    selectedDivision,
    themeMode,
    toggleThemeMode,
    toggleBookmark,
    playWorkAudio,
  } = useArchive();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'submissions'>('bookmarks');
  const [previewWork, setPreviewWork] = useState<WorkItem | null>(null);

  // Bookmarked works
  const bookmarkedWorks = works.filter((w) => w.isBookmarked);

  // User's submissions (match fullName or writerName)
  const mySubmissions = works.filter(
    (w) =>
      w.writerName.toLowerCase().includes(currentUser.fullName.toLowerCase()) ||
      currentUser.fullName.toLowerCase().includes(w.writerName.toLowerCase())
  );

  // Reviewer queue count (under review or revision requested)
  const pendingCount = works.filter(
    (w) => w.status === 'UNDER_REVIEW' || w.status === 'REVISION_REQUESTED'
  ).length;

  const canReview = [
    'REVIEWER',
    'EDITOR',
    'ADMIN',
    'SUPER_ADMIN',
  ].includes(currentUser.role);

  const availableRoles: UserRole[] = [
    'MEMBER',
    'CONTRIBUTOR',
    'REVIEWER',
    'EDITOR',
    'ADMIN',
    'SUPER_ADMIN',
  ];

  return (
    <div className="min-h-full pb-28 md:pb-16 px-4 md:px-8 max-w-5xl mx-auto pt-4 font-ethiopic">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0C4A9E] to-[#072958] text-white p-6 md:p-8 shadow-xl border border-[#B88500]/30 mb-8">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with gold border */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#F5B800]/70 overflow-hidden shadow-lg bg-[#072958] flex items-center justify-center">
              <User className="w-12 h-12 text-[#F5B800]" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#F5B800] text-slate-900 p-1.5 rounded-full shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* User details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className="font-serif-ethiopic text-2xl md:text-3xl font-bold text-[#F9F5EC]">
                {currentUser.fullName}
              </h1>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#F5B800]/20 text-[#FFD54F] border border-[#F5B800]/30">
                {USER_ROLES[currentUser.role]?.amharicTitle || currentUser.role}
              </span>
            </div>
            <p className="text-white/70 text-sm mb-2">{currentUser.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Layers className="w-3.5 h-3.5 text-[#F5B800]" />
                {DIVISIONS[selectedDivision]?.titleAmharic} ክፍል
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B800]" />
                ተክለ ሣዊሮስ ሰ/ት/ቤት (፲፱፻፶፯)
              </span>
            </div>
          </div>

          {/* Quick role switcher dropdown for developer / tester convenience */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 text-xs w-full md:w-auto">
            <label className="block text-white/70 mb-1 font-medium">
              የተጠቃሚ ሚና ቀይር (RBAC):
            </label>
            <select
              value={currentUser.role}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              aria-label="የተጠቃሚ ሚና ቀይር (RBAC)"
              className="bg-[#072958] border border-[#F5B800]/40 text-[#FFD54F] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-[#F5B800] text-xs w-full"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {USER_ROLES[r]?.amharicTitle} ({r})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="text-center p-3 rounded-2xl bg-white/5">
            <div className="text-2xl font-bold font-serif-ethiopic text-[#F5B800]">
              {bookmarkedWorks.length}
            </div>
            <div className="text-xs text-white/70 mt-0.5">የተቀመጡ</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/5">
            <div className="text-2xl font-bold font-serif-ethiopic text-[#F5B800]">
              {mySubmissions.length}
            </div>
            <div className="text-xs text-white/70 mt-0.5">ያበረከትኳቸው</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/5">
            <div className="text-2xl font-bold font-serif-ethiopic text-[#F5B800]">
              {pendingCount}
            </div>
            <div className="text-xs text-white/70 mt-0.5">በግምገማ ላይ ያሉ</div>
          </div>
        </div>
      </div>

      {/* Reviewer / Admin banner if applicable */}
      {canReview && (
        <div className="mb-8 p-4 md:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif-ethiopic font-bold text-slate-900 dark:text-slate-100 text-base">
                የገምጋሚና የአስተዳዳሪ ክፍል (Reviewer Queue)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {pendingCount} ስራዎች ለግምገማ፣ ለማጽደቅ ወይም ለማሻሻያ እየተጠባበቁ ነው።
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToReviewerQueue}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0C4A9E] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#072958] transition-all shrink-0"
          >
            ወደ ግምገማ ሰሌዳ ሂድ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button
          onClick={onNavigateToCreateWork}
          className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/20 shadow-xs hover:border-[#B88500] transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2.5 rounded-xl bg-[#B88500]/10 text-[#B88500] w-fit mb-2">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">
              አዲስ ስራ መዝግብ
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              ግጥም፣ ጽሁፍ፣ ስክሪፕት...
            </div>
          </div>
        </button>

        <button
          onClick={onNavigateToEvents}
          className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/20 shadow-xs hover:border-[#B88500] transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-2">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">
              መርሐ ግብሮች
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              የበዓላትና ዝግጅቶች ቀን መቁጠሪያ
            </div>
          </div>
        </button>

        <button
          onClick={onOpenChurchInfo}
          className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/20 shadow-xs hover:border-[#B88500] transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit mb-2">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">
              ስለ ሰንበት ት/ቤቱ
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              ታሪክና የክፍላት መዋቅር
            </div>
          </div>
        </button>

        <button
          onClick={toggleThemeMode}
          className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/20 shadow-xs hover:border-[#B88500] transition-all text-left flex flex-col justify-between"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mb-2">
            {themeMode === 'DARK' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">
              {themeMode === 'DARK' ? 'ቀን ሞድ' : 'ምሽት ሞድ'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              የገጽ እይታ ቀለም
            </div>
          </div>
        </button>
      </div>

      <HaragDivider className="my-6" />

      {/* Tabs: Bookmarks vs Submissions */}
      <div className="flex items-center gap-4 border-b border-[#B88500]/20 mb-6">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'text-[#0C4A9E] dark:text-[#FFD54F] border-b-2 border-[#B88500]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          የተቀመጡ ስራዎች ({bookmarkedWorks.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'text-[#0C4A9E] dark:text-[#FFD54F] border-b-2 border-[#B88500]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          ያበረከትኳቸው ስራዎች ({mySubmissions.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarkedWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedWorks.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  onClick={() => onSelectWork(work.id)}
                  onBookmarkClick={() => toggleBookmark(work.id)}
                  onQuickPreviewClick={() => setPreviewWork(work)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/40 dark:bg-[#111D30]/40 border border-dashed border-[#B88500]/30">
              <Bookmark className="w-10 h-10 mx-auto text-[#B88500]/50 mb-2" />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                እስካሁን ምንም የተቀመጠ ስራ የለም። በስራ ዝርዝር ውስጥ የማስታወሻ ምልክቱን በመጫን ማስቀመጥ ይችላሉ።
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div>
          {mySubmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySubmissions.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  onClick={() => onSelectWork(work.id)}
                  onBookmarkClick={() => toggleBookmark(work.id)}
                  onQuickPreviewClick={() => setPreviewWork(work)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/40 dark:bg-[#111D30]/40 border border-dashed border-[#B88500]/30">
              <FileText className="w-10 h-10 mx-auto text-[#B88500]/50 mb-2" />
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                እስካሁን ያበረከቱት ስራ የለም። አዲስ ግጥም፣ ጽሁፍ ወይም ስክሪፕት መመዝገብ ይችላሉ።
              </p>
              <button
                onClick={onNavigateToCreateWork}
                className="px-4 py-2 bg-[#0C4A9E] text-white text-xs font-semibold rounded-xl"
              >
                አዲስ ስራ አስገባ
              </button>
            </div>
          )}
        </div>
      )}

      {/* Switch Division & Logout Footer */}
      <div className="mt-12 pt-6 border-t border-[#B88500]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onSwitchDivision}
          className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-[#0C4A9E] dark:hover:text-[#F5B800] flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-[#B88500]/10"
        >
          <Layers className="w-4 h-4" />
          ክፍል ቀይር (ሕፃናት / ማዕከላውያን / ወጣት)
        </button>

        <button
          onClick={onSwitchDivision}
          className="text-xs font-medium text-[#8B0000] hover:underline flex items-center gap-1.5 py-2 px-3"
        >
          <LogOut className="w-4 h-4" />
          ውጣ (ይውጡ)
        </button>
      </div>

      {/* Quick Preview Modal */}
      {previewWork && (
        <QuickWorkPreviewModal
          isOpen={true}
          work={previewWork}
          onDismiss={() => setPreviewWork(null)}
          onOpenFullDetail={(id) => {
            setPreviewWork(null);
            onSelectWork(id);
          }}
          onPlayAudio={(w) => playWorkAudio(w)}
          onToggleBookmark={(id) => toggleBookmark(id)}
        />
      )}
    </div>
  );
};
