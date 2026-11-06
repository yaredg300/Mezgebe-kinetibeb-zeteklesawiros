import React, { useState } from 'react';
import { useArchive } from '../context/ArchiveContext';
import {
  UserRole,
  USER_ROLES,
  DIVISIONS,
  WorkItem,
  MemberDuty,
  MEMBER_DUTY_LABELS,
  SundaySchoolDepartment,
} from '../types';
import { WorkCard } from '../components/Cards';
import { HaragDivider, ManuscriptBox } from '../components/Ornaments';
import { QuickWorkPreviewModal } from '../components/LiturgicalAudioComponents';
import firebaseConfig from '../../firebase-applet-config.json';
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
  HardDrive,
  Users,
  Shield,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ProfileScreenProps {
  onSelectWork: (workId: string) => void;
  onNavigateToReviewerQueue: () => void;
  onNavigateToCreateWork: () => void;
  onNavigateToEvents: () => void;
  onOpenChurchInfo: () => void;
  onSwitchDivision: () => void;
  onNavigateToLogin?: () => void;
  onOpenDepartmentsModal?: () => void;
  onNavigateToDepartmentGateway?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onSelectWork,
  onNavigateToReviewerQueue,
  onNavigateToCreateWork,
  onNavigateToEvents,
  onOpenChurchInfo,
  onSwitchDivision,
  onNavigateToLogin,
  onOpenDepartmentsModal,
}) => {
  const {
    currentUser,
    setUserRole,
    works,
    members,
    events,
    selectedDivision,
    themeMode,
    toggleThemeMode,
    toggleBookmark,
    playWorkAudio,
    firebaseUser,
    signInWithGoogle,
    logout,
    departmentsList,
    activeDepartment,
    setActiveDepartment,
    isGoogleDriveConnected,
    connectGoogleDrive,
    disconnectGoogleDrive,
  } = useArchive();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'submissions' | 'departments' | 'drive'>('bookmarks');
  const [previewWork, setPreviewWork] = useState<WorkItem | null>(null);
  const [selectedDeptProfile, setSelectedDeptProfile] = useState<string>(activeDepartment || 'kinetibeb');
  const [driveNotice, setDriveNotice] = useState<string | null>(null);
  const [isConnectingDrive, setIsConnectingDrive] = useState<boolean>(false);

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

  // Servants for the selected department profile
  const currentDeptInfo = departmentsList.find((d) => d.id === selectedDeptProfile) || departmentsList[0];
  const deptMembers = members.filter((m) => {
    if (m.departmentId === selectedDeptProfile) return true;
    if (
      m.department &&
      currentDeptInfo &&
      (m.department.includes(currentDeptInfo.shortTitleAmharic) ||
        m.department.includes(currentDeptInfo.badgeLabel))
    ) {
      return true;
    }
    if (!m.departmentId && selectedDeptProfile === 'kinetibeb') return true;
    return false;
  });

  const deptWorks = works.filter((w) =>
    w.departmentId ? w.departmentId === selectedDeptProfile : selectedDeptProfile === 'kinetibeb'
  );

  const deptEvents = events.filter((ev) => {
    if (ev.departmentId === selectedDeptProfile) return true;
    if (
      currentDeptInfo &&
      ev.organizer &&
      (ev.organizer.includes(currentDeptInfo.shortTitleAmharic) ||
        ev.organizer.includes(currentDeptInfo.titleAmharic))
    ) {
      return true;
    }
    if (!ev.departmentId && selectedDeptProfile === 'kinetibeb') return true;
    return false;
  });

  const handleConnectDrive = async () => {
    setIsConnectingDrive(true);
    try {
      const token = await connectGoogleDrive();
      if (token) {
        setDriveNotice('Google Drive በተሳካ ሁኔታ ተገናኝቷል! የኪነጥበብ ስራዎችን ወደ Drive ማመሳከር ይችላሉ።');
      } else {
        setDriveNotice('የ Google Drive ግንኙነት አልተጠናቀቀም።');
      }
    } catch (e: any) {
      setDriveNotice(`ስህተት ተከስቷል፦ ${e?.message || 'ግንኙነት አልተሳካም'}`);
    } finally {
      setIsConnectingDrive(false);
      setTimeout(() => setDriveNotice(null), 5000);
    }
  };

  const handleDisconnectDrive = () => {
    disconnectGoogleDrive();
    setDriveNotice('የ Google Drive ግንኙነት ተቋርጧል።');
    setTimeout(() => setDriveNotice(null), 4000);
  };

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
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-white/80">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Layers className="w-3.5 h-3.5 text-[#F5B800]" />
                {DIVISIONS[selectedDivision]?.titleAmharic} ክፍል
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-[#F5B800]" />
                ያገለገሉበት ክፍል፦ {currentDeptInfo?.shortTitleAmharic || 'የኪነጥበብ ክፍል'}
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B800]" />
                ተክለ ሣዊሮስ ሰ/ት/ቤት (፲፱፻፶፯)
              </span>
            </div>
          </div>

          {/* Quick role switcher & active department dropdown */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 text-xs w-full md:w-auto space-y-2">
            <div>
              <label className="block text-white/70 mb-1 font-medium">
                የተጠቃሚ ሚና ቀይር (RBAC):
              </label>
              <select
                value={currentUser.role}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                aria-label="የተጠቃሚ ሚና ቀይር (RBAC)"
                className="bg-[#072958] border border-[#F5B800]/40 text-[#FFD54F] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-[#F5B800] text-xs w-full cursor-pointer"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {USER_ROLES[r]?.amharicTitle} ({r})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/70 mb-1 font-medium">
                የአገልግሎት ክፍል፦
              </label>
              <select
                value={activeDepartment}
                onChange={(e) => {
                  const val = e.target.value as SundaySchoolDepartment;
                  setActiveDepartment(val);
                  setSelectedDeptProfile(val);
                }}
                aria-label="የአገልግሎት ክፍል ይምረጡ"
                className="bg-[#072958] border border-[#F5B800]/40 text-[#FFD54F] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-[#F5B800] text-xs w-full cursor-pointer"
              >
                {departmentsList.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.shortTitleAmharic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-white/10">
          <div className="text-center p-2.5 sm:p-3 rounded-2xl bg-white/5">
            <div className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-[#F5B800]">
              {bookmarkedWorks.length}
            </div>
            <div className="text-[11px] sm:text-xs text-white/70 mt-0.5">የተቀመጡ</div>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-2xl bg-white/5">
            <div className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-[#F5B800]">
              {mySubmissions.length}
            </div>
            <div className="text-[11px] sm:text-xs text-white/70 mt-0.5">ያበረከትኳቸው</div>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-2xl bg-white/5">
            <div className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-[#F5B800]">
              {pendingCount}
            </div>
            <div className="text-[11px] sm:text-xs text-white/70 mt-0.5">በግምገማ ላይ</div>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-2xl bg-white/5">
            <div className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-[#F5B800]">
              {departmentsList.length}
            </div>
            <div className="text-[11px] sm:text-xs text-white/70 mt-0.5">ክፍሎች</div>
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
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0C4A9E] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#072958] transition-all shrink-0 cursor-pointer"
          >
            ወደ ግምገማ ሰሌዳ ሂድ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drive Action Notification */}
      {driveNotice && (
        <div className="mb-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{driveNotice}</span>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button
          onClick={onNavigateToCreateWork}
          className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/20 shadow-xs hover:border-[#B88500] transition-all text-left flex flex-col justify-between cursor-pointer"
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
          className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/20 shadow-xs hover:border-[#B88500] transition-all text-left flex flex-col justify-between cursor-pointer"
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
          onClick={() => setActiveTab('departments')}
          className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/20 shadow-xs hover:border-[#B88500] transition-all text-left flex flex-col justify-between cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-[#B88500] dark:text-[#FFD54F] w-fit mb-2">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">
              የክፍላት መገለጫዎች
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              የ7ቱ ክፍሎች አባላትና ሃላፊዎች
            </div>
          </div>
        </button>

        <button
          onClick={toggleThemeMode}
          className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/20 shadow-xs hover:border-[#B88500] transition-all text-left flex flex-col justify-between cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mb-2">
            {themeMode === 'DARK' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100">
              {themeMode === 'DARK' ? 'ቀን ሞድ (Light)' : 'ምሽት ሞድ (Dark)'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              የገጽ እይታ ቀለም
            </div>
          </div>
        </button>
      </div>

      <HaragDivider className="my-6" />

      {/* Tabs: Bookmarks vs Submissions vs Department Profiles vs Google Drive */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-[#B88500]/20 mb-6 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all shrink-0 relative flex items-center gap-1.5 cursor-pointer ${
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
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all shrink-0 relative flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'submissions'
              ? 'text-[#0C4A9E] dark:text-[#FFD54F] border-b-2 border-[#B88500]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          ያበረከትኳቸው ስራዎች ({mySubmissions.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all shrink-0 relative flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'departments'
              ? 'text-[#0C4A9E] dark:text-[#FFD54F] border-b-2 border-[#B88500]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          የክፍላት መገለጫዎችና አገልጋዮች
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all shrink-0 relative flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'drive'
              ? 'text-[#0C4A9E] dark:text-[#FFD54F] border-b-2 border-[#B88500]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          Google Drive ማመሳሰያ
          {isGoogleDriveConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Tab 1: Bookmarks */}
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

      {/* Tab 2: Submissions */}
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
                className="px-4 py-2 bg-[#0C4A9E] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                አዲስ ስራ አስገባ
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Department Profiles & Servants Directory */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Department Selection Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {departmentsList.map((dept) => {
              const isSelected = selectedDeptProfile === dept.id;
              const count = members.filter((m) => {
                if (m.departmentId === dept.id) return true;
                if (m.department && (m.department.includes(dept.shortTitleAmharic) || m.department.includes(dept.badgeLabel))) return true;
                if (!m.departmentId && dept.id === 'kinetibeb') return true;
                return false;
              }).length;

              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptProfile(dept.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0C4A9E] text-white border-[#0C4A9E] shadow-sm'
                      : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span>{dept.shortTitleAmharic}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Department Profile Hero Card */}
          {currentDeptInfo && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111D30] border-2 border-[#B88500]/40 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md"
                    style={{ backgroundColor: currentDeptInfo.accentColor || '#0C4A9E' }}
                  >
                    {currentDeptInfo.badgeLabel?.slice(0, 2) || 'ክፍ'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                        {currentDeptInfo.titleAmharic}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#B88500]/15 text-[#966C00] dark:text-[#FFD54F]">
                        {currentDeptInfo.badgeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {currentDeptInfo.subtitleAmharic}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    <Shield className="w-3.5 h-3.5 text-[#B88500]" />
                    አስተባባሪ፦ {currentDeptInfo.coordinatorName || 'የኮሚቴ መሪ'}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    <Users className="w-3.5 h-3.5 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                    {deptMembers.length} አገልጋዮች
                  </span>
                </div>
              </div>

              {/* Department Statistics Ribbon */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-center">
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
                    {deptWorks.length}
                  </div>
                  <div className="text-[11px] text-slate-500">የተመዘገቡ ሰነዶች</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif-ethiopic text-[#B88500] dark:text-[#FFD54F]">
                    {deptEvents.length}
                  </div>
                  <div className="text-[11px] text-slate-500">የተያዙ መርሐ-ግብራት</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif-ethiopic text-emerald-600 dark:text-emerald-400">
                    {deptMembers.length}
                  </div>
                  <div className="text-[11px] text-slate-500">ንቁ አገልጋዮች</div>
                </div>
              </div>

              {/* Mission & Purpose */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  የክፍሉ ዓላማና አገልግሎት
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif-ethiopic">
                  {currentDeptInfo.descriptionAmharic}
                </p>
              </div>

              {/* Quick Navigation and Activation Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDepartment(selectedDeptProfile);
                      onNavigateToEvents();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0C4A9E] text-white text-xs font-bold hover:bg-[#072958] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>የክፍሉ መርሐ-ግብራት ({deptEvents.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDepartment(selectedDeptProfile);
                      // Switch to active department
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeDepartment === selectedDeptProfile
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-[#111D30] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#B88500]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {activeDepartment === selectedDeptProfile
                        ? 'የአሁን ንቁ ክፍል ነው'
                        : 'እንደ ዋና ክፍል ምረጥ'}
                    </span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  ተክለ ሣዊሮስ ሰ/ት/ቤት • {currentDeptInfo.shortTitleAmharic}
                </span>
              </div>
            </div>
          )}

          {/* Department Servants Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B88500]" />
                የ{currentDeptInfo?.shortTitleAmharic || 'ክፍሉ'} የተመዘገቡ አገልጋዮች ({deptMembers.length})
              </h4>
            </div>

            {deptMembers.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-white/40 dark:bg-[#111D30]/40 border border-dashed border-[#B88500]/30 text-xs text-slate-500">
                ለዚህ ክፍል እስካሁን የተመዘገበ አገልጋይ የለም።
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {deptMembers.map((member) => (
                  <ManuscriptBox key={member.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-[#0C4A9E]/10 border-2 border-[#B88500] flex items-center justify-center font-serif-ethiopic font-bold text-base text-[#0C4A9E] dark:text-[#7FAFFF]">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {member.fullName}
                              </h5>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#B88500]/15 text-[#966C00] dark:text-[#FFD54F]">
                                {member.spiritualTitle}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {member.department} • ከ{member.joinedYear} ጀምሮ
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {MEMBER_DUTY_LABELS[member.duty]?.icon} {MEMBER_DUTY_LABELS[member.duty]?.amharic}
                        </span>
                      </div>

                      {member.bio && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 font-serif-ethiopic line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-[#B88500]" />
                        {member.phone || 'ስልክ አልተመዘገበም'}
                      </span>
                      <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                        {member.assignedWorksCount || 0} የተመደቡ ሥራዎች
                      </span>
                    </div>
                  </ManuscriptBox>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Google Drive Sync & Integration */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111D30] border-2 border-[#B88500]/40 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                    Google Drive ማህደር ማመሳሰያ
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ስራዎችን በ Google Drive ላይ ያስቀምጡና ያመሳክሩ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isGoogleDriveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isGoogleDriveConnected ? 'ተገናኝቷል (Connected)' : 'አልተገናኘም'}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                በዚህ መዝገብ ውስጥ ያሉትን የኪነጥበብ፣ የስነ-ጽሁፍ፣ የመነባንብና የቴአትር ሰነዶች በ Google Drive
                ላይ በተፈጠረው <strong>«መዝገበ ኪነጥበብ - ተክለ ሣዊሮስ ሰ/ት/ቤት»</strong> ማህደር ውስጥ በ PDF እና በፅሁፍ
                ቅርጸት ማስቀመጥ እንዲሁም ከ Drive በቀጥታ ወደ መዝገቡ ማስመጣት ይችላሉ።
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    📁 ራስ-ሰር የአቃፊ አደረጃጀት
                  </span>
                  ሁሉም የወረዱ ወይም የተጋሩ ሰነዶች በ Drive ውስጥ በየክፍሉና በምድባቸው ተለይተው ይቀመጣሉ።
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    🔒 የፍቃድ ደህንነት
                  </span>
                  ፋይሎችን ከማውረድ ወይም ከማስመጣትዎ በፊት ሁልጊዜ የማረጋገጫ መልእክት ይጠየቃሉ።
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {isGoogleDriveConnected ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDisconnectDrive}
                    className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    ግንኙነቱን አቋርጥ (Disconnect)
                  </button>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Drive ፋይሎችን ለማመሳከር ዝግጁ ነው
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleConnectDrive}
                  disabled={isConnectingDrive}
                  className="px-5 py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>{isConnectingDrive ? 'በመገናኘት ላይ...' : 'Google Drive አገናኝ'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cloud & Firebase Status Pill */}
      <div className="mt-8 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">Google Cloud & Firebase ተገናኝቷል፦</span>
          <span className="font-mono text-[11px] text-[#0C4A9E] dark:text-[#7FAFFF]">
            {firebaseConfig.projectId || 'ferrous-sweep-9pz3c'}
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          {firebaseUser ? `የገቡበት አካውንት፦ ${firebaseUser.email}` : 'ያልገቡበት ሁኔታ (Guest)'}
        </span>
      </div>

      {/* Switch Division & Logout Footer */}
      <div className="mt-6 pt-4 border-t border-[#B88500]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onSwitchDivision}
          className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-[#0C4A9E] dark:hover:text-[#F5B800] flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-[#B88500]/10 cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          ክፍል ቀይር (ሕፃናት / ማዕከላውያን / ወጣት)
        </button>

        {firebaseUser ? (
          <button
            onClick={logout}
            className="text-xs font-medium text-[#8B0000] hover:underline flex items-center gap-1.5 py-2 px-3 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            ከአካውንት ውጣ (Sign Out)
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch {
                  // Handled safely
                }
              }}
              className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline flex items-center gap-1.5 py-2 px-3 cursor-pointer"
            >
              <User className="w-4 h-4" />
              በ Google ግባ
            </button>
            {onNavigateToLogin && (
              <button
                onClick={onNavigateToLogin}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0C4A9E] text-white hover:bg-[#072958] transition-colors cursor-pointer"
              >
                በኢሜይል ግባ / ተመዝገብ
              </button>
            )}
          </div>
        )}
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
