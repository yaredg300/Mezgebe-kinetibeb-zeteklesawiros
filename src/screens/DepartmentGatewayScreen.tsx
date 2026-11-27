import React, { useState } from 'react';
import {
  Palette,
  CalendarDays,
  BookOpen,
  Music,
  Users,
  Megaphone,
  HandCoins,
  Plus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronRight,
  X,
  Lock,
  Crown,
  AlertCircle,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { HaragDivider } from '../components/Ornaments';
import { LockedDepartmentModal } from '../components/LockedDepartmentModal';
import { AuthErrorAlert } from '../components/AuthErrorAlert';
import {
  PRIMARY_FIREBASE_ADMIN_EMAIL,
  getAuthErrorMessageAmharic,
  isMasterOperatorEmail,
} from '../firebase/config';
import { SundaySchoolDepartment, DepartmentInfo } from '../types';

interface DepartmentGatewayScreenProps {
  onSelectKinetibeb: (viewIntro?: boolean) => void;
  onSelectEhudMerhaGibir: () => void;
  onExploreDirectly: (dept: SundaySchoolDepartment) => void;
  onGoToLogin?: (dept?: SundaySchoolDepartment) => void;
}

export const DepartmentGatewayScreen: React.FC<DepartmentGatewayScreenProps> = ({
  onSelectKinetibeb,
  onSelectEhudMerhaGibir,
  onExploreDirectly,
  onGoToLogin,
}) => {
  const {
    departmentsList,
    addDepartment,
    isMasterOperator,
    assignedDepartmentId,
    isDepartmentLocked,
    lockDepartmentChoice,
    loginAsMasterOperator,
    firebaseUser,
    logout,
  } = useArchive();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedDeptDetail, setSelectedDeptDetail] = useState<DepartmentInfo | null>(null);
  const [lockedModalDept, setLockedModalDept] = useState<DepartmentInfo | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingInMaster, setIsLoggingInMaster] = useState<boolean>(false);

  // New Department Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCoordinator, setNewCoordinator] = useState('');
  const [newIcon, setNewIcon] = useState('BookOpen');
  const [newColor] = useState('#0C4A9E');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kinetibebDept = departmentsList.find((d) => d.id === 'kinetibeb');
  const ehudDept = departmentsList.find((d) => d.id === 'ehud_merha_gibir');
  const assignedDeptInfo = departmentsList.find((d) => d.id === assignedDepartmentId) || null;

  const isKinetibebLocked = isDepartmentLocked('kinetibeb');
  const isEhudLocked = isDepartmentLocked('ehud_merha_gibir');

  const navigateToDepartment = (deptId: SundaySchoolDepartment, viewIntro: boolean = false) => {
    if (deptId === 'kinetibeb') {
      if (viewIntro) {
        onSelectKinetibeb(true);
      } else {
        onExploreDirectly('kinetibeb');
      }
    } else if (deptId === 'ehud_merha_gibir') {
      onSelectEhudMerhaGibir();
    } else {
      onExploreDirectly(deptId);
    }
  };

  const handleSelectDepartment = (deptId: SundaySchoolDepartment, viewIntro: boolean = false) => {
    if (isDepartmentLocked(deptId)) {
      const target = departmentsList.find((d) => d.id === deptId) || null;
      setLockedModalDept(target);
      return;
    }
    const allowed = lockDepartmentChoice(deptId);
    if (!allowed) {
      const target = departmentsList.find((d) => d.id === deptId) || null;
      setLockedModalDept(target);
      return;
    }
    navigateToDepartment(deptId, viewIntro);
  };

  const handleMasterLogin = async () => {
    setAuthError(null);
    setIsLoggingInMaster(true);
    try {
      const signedInUser = await loginAsMasterOperator();
      if (signedInUser && !isMasterOperatorEmail(signedInUser.email)) {
        setAuthError(
          `የገቡት በ«${signedInUser.email}» ነው። ሁሉንም ክፍሎች የመክፈት ፈቃድ ያለው ዋና አስተባባሪ (${PRIMARY_FIREBASE_ADMIN_EMAIL}) ብቻ ነው።`
        );
      }
    } catch (err: any) {
      const msg = getAuthErrorMessageAmharic(err);
      if (msg) setAuthError(msg);
    } finally {
      setIsLoggingInMaster(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMasterOperator || !newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await addDepartment({
        titleAmharic: newTitle.trim(),
        subtitleAmharic: newSubtitle.trim() || 'የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት አገልግሎት ክፍል',
        shortTitleAmharic: newTitle.trim().slice(0, 14),
        iconName: newIcon,
        badgeLabel: newTitle.trim().slice(0, 10),
        descriptionAmharic:
          newDescription.trim() || 'በደብረ መድኃኒት ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት አዲስ የተደራጀ ክፍል',
        accentColor: newColor,
        status: 'ACTIVE',
        coordinatorName: newCoordinator.trim() || 'የክፍሉ አስተባባሪ',
        memberCount: 1,
        programsCount: 1,
      });

      setNewTitle('');
      setNewSubtitle('');
      setNewDescription('');
      setNewCoordinator('');
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Palette':
        return <Palette className={className} />;
      case 'CalendarDays':
        return <CalendarDays className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Music':
        return <Music className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Megaphone':
        return <Megaphone className={className} />;
      case 'HandCoins':
        return <HandCoins className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-slate-800 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center pt-2 pb-5">
          <div className="p-1 rounded-full bg-white border-2 border-[#B88500] shadow-md mb-3 flex items-center justify-center">
            <img
              src="/assets/ic_church_logo.jpg"
              alt="ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት ዓርማ"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <span className="text-[11px] sm:text-xs font-bold text-[#B88500] uppercase tracking-widest bg-[#F5B800]/15 px-3 py-1 rounded-full border border-[#B88500]/30 mb-1.5">
            ደብረ መድኃኒት ቅዱስ ተክለ ሣዊሮስ ሰንበት ት/ቤት • ፲፱፻፶፯ / 1957
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-ethiopic text-[#0C4A9E] leading-tight">
            የሰንበት ትምህርት ቤቱ ዲጂታል ማዕከል
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-1.5 font-serif-ethiopic">
            {isMasterOperator
              ? 'ዋና አስተባባሪ በመሆንዎ ሁሉም የሰንበት ትምህርት ቤቱ ክፍሎች ለእርስዎ ክፍት ናቸው።'
              : assignedDeptInfo
              ? `እርስዎ በ«${assignedDeptInfo.titleAmharic}» ክፍል ብቻ እንዲያገለግሉ ስለተመደቡ ሌሎች ክፍሎች ተቆልፈዋል።`
              : 'በደንቡ መሠረት ለመመዝገብና ለማገልገል አንድ ክፍል ብቻ ይምረጡ፤ አንድ ክፍል ሲከፍቱ ሌሎች ክፍሎች በሙሉ ይቆለፋሉ።'}
          </p>

          <HaragDivider className="my-4" height={16} goldColor="#B88500" burgundyColor="#8B0000" />

          {/* Master Operator / Single-Department Lock Status Banner */}
          <div className="w-full">
            {isMasterOperator ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#B88500]/20 to-amber-500/15 border-2 border-[#B88500] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B88500] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8B0000] uppercase tracking-wider block">
                      ዋና አስተባባሪ (Master Operator: {PRIMARY_FIREBASE_ADMIN_EMAIL})
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 font-serif-ethiopic">
                      ሁሉም ክፍሎች ክፍት ናቸው — ማናቸውንም ክፍል መክፈትና ማስተዳደር ይችላሉ።
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ውጣ (Sign Out)</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      assignedDeptInfo
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-amber-100 text-[#B88500] border border-amber-300'
                    }`}
                  >
                    {assignedDeptInfo ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#0C4A9E] uppercase tracking-wider block">
                      {assignedDeptInfo
                        ? 'የአንድ ክፍል ቁልፍ ገቢር ነው (Single-Department Lock)'
                        : 'የአገልግሎት ክፍል ምርጫ (1 Department Only)'}
                    </span>
                    <p className="text-xs text-slate-700 font-serif-ethiopic leading-snug">
                      {assignedDeptInfo ? (
                        <>
                          የተፈቀደልዎ በር፦ <strong>{assignedDeptInfo.titleAmharic}</strong> — ሌሎች ክፍሎች ተቆልፈዋል።
                        </>
                      ) : (
                        'አንድ የአገልግሎት ክፍል ሲመርጡ ወይም ሲመዘገቡ ሌሎች ክፍሎች በሙሉ ይቆለፋሉ።'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {firebaseUser && (
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ውጣ</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isLoggingInMaster}
                    onClick={handleMasterLogin}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#B88500] to-[#8B0000] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                    title={`Master Operator Only (${PRIMARY_FIREBASE_ADMIN_EMAIL})`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{isLoggingInMaster ? 'በመገናኘት ላይ...' : 'ዋና አስተባባሪ (Master Operator)'}</span>
                  </button>
                </div>
              </div>
            )}

            <AuthErrorAlert
              message={authError}
              onDismiss={() => setAuthError(null)}
              className="mt-3"
            />
          </div>
        </div>

        {/* Two Flagship Department Cards (Kinetibeb vs Ehud Merha Gibir) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* 1. Kinetibeb Card */}
          <div
            className={`relative rounded-2xl border-2 shadow-md transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between overflow-hidden group ${
              isKinetibebLocked
                ? 'bg-slate-100/90 border-slate-300 opacity-80'
                : 'bg-white border-[#B88500]/40 hover:shadow-lg'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F5B800]/20 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                    isKinetibebLocked
                      ? 'bg-slate-200 border-slate-300 text-slate-500'
                      : 'bg-[#B88500]/15 border-[#B88500]/40 text-[#8B0000]'
                  }`}
                >
                  {isKinetibebLocked ? <Lock className="w-6 h-6" /> : <Palette className="w-6 h-6" />}
                </div>
                {isKinetibebLocked ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>የተቆለፈ</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#8B0000]/10 text-[#8B0000] border border-[#8B0000]/25">
                    {assignedDepartmentId === 'kinetibeb' ? 'የእርስዎ ክፍል ✓' : 'የፈጠራና የቅርስ ማህደር'}
                  </span>
                )}
              </div>

              <h2
                className={`text-xl sm:text-2xl font-bold font-serif-ethiopic ${
                  isKinetibebLocked ? 'text-slate-600' : 'text-[#8B0000]'
                }`}
              >
                የኪነጥበብ ክፍል
              </h2>

              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Art, Theater, Literature & Cultural Heritage
              </p>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif-ethiopic mt-3">
                የሰንበት ትምህርት ቤታችን አባላት ግጥም፣ መንፈሳዊ ቲያትር፣ መነባንብ፣ ስነ ጽሁፍ፣ ስዕላትና ፎቶግራፎችን የሚያስቀምጡበት እና በኃላፊነት የሚያጸድቁበት ዲጂታል ማህደር።
              </p>

              {/* Badges / Stats */}
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  ፳፰ ግጥሞች
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  ፲፬ ቲያትሮች
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  ፳፪ ሥዕሎች
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  ፬፭ ፎቶዎች
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              {isKinetibebLocked ? (
                <button
                  type="button"
                  onClick={() => setLockedModalDept(kinetibebDept || null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-rose-700" />
                  <span>ተቆልፏል (በሌላ ክፍል ተመድበዋል)</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectDepartment('kinetibeb', false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#B88500] to-[#8B0000] hover:brightness-105 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <span>ወደ ኪነጥበብ ክፍል ግባ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDepartment('kinetibeb', true)}
                    className="py-3 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8B0000] font-bold text-xs flex items-center justify-center gap-1 border border-amber-300 transition-all cursor-pointer"
                    title="የኪነጥበብ ክፍሉን መግቢያ እና የስራ ፍሰት እይ"
                  >
                    <span>መግቢያ (Intro)</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 2. Ehud Merha Gibir Card */}
          <div
            className={`relative rounded-2xl border-2 shadow-md transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between overflow-hidden group ${
              isEhudLocked
                ? 'bg-slate-100/90 border-slate-300 opacity-80'
                : 'bg-white border-[#0C4A9E]/40 hover:shadow-lg'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#0C4A9E]/15 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                    isEhudLocked
                      ? 'bg-slate-200 border-slate-300 text-slate-500'
                      : 'bg-[#0C4A9E]/15 border-[#0C4A9E]/40 text-[#0C4A9E]'
                  }`}
                >
                  {isEhudLocked ? <Lock className="w-6 h-6" /> : <CalendarDays className="w-6 h-6" />}
                </div>
                {isEhudLocked ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>የተቆለፈ</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0C4A9E]/10 text-[#0C4A9E] border border-[#0C4A9E]/25 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#B88500]" />
                    <span>
                      {assignedDepartmentId === 'ehud_merha_gibir' ? 'የእርስዎ ክፍል ✓' : '2019 ዓ.ም ዕቅዶች ገቢር'}
                    </span>
                  </span>
                )}
              </div>

              <h2
                className={`text-xl sm:text-2xl font-bold font-serif-ethiopic ${
                  isEhudLocked ? 'text-slate-600' : 'text-[#0C4A9E]'
                }`}
              >
                የእሁድ መርሃ ግብር ክፍል
              </h2>

              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Sunday Service & Program Administration 2019
              </p>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif-ethiopic mt-3">
                የ2019 ዓ.ም የ፶፩ ሳምንታት ዓመታዊና ወርሃዊ መርሐ ግብራት፣ የወጣቶች፣ የማዕከላውያንና የሕፃናት ፳፰ የዕለት ሰሌዳዎች፣ ፲ የአዘጋጅ ምድቦች፣ ፲፩ ተግባራዊ ዒላማዎች እና ፫ የፒዲኤፍ (PDF) ጥቅሎች።
              </p>

              {/* Badges / Stats */}
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0C4A9E] border border-blue-200">
                  ፶፩ ሳምንታት
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0C4A9E] border border-blue-200">
                  ሕፃናት፣ ማዕከላውያንና ወጣቶች
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0C4A9E] border border-blue-200">
                  ፫ የፒዲኤፍ ጥቅሎች (58 ገጽ)
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0C4A9E] border border-blue-200">
                  ፲ የአዘጋጅ ምድቦች
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              {isEhudLocked ? (
                <button
                  type="button"
                  onClick={() => setLockedModalDept(ehudDept || null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-rose-700" />
                  <span>ተቆልፏል (በሌላ ክፍል ተመድበዋል)</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectDepartment('ehud_merha_gibir', false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0C4A9E] to-[#072958] hover:brightness-105 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <span>ወደ እሁድ መርሃ ግብር ግባ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {onGoToLogin ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (lockDepartmentChoice('ehud_merha_gibir')) {
                          onGoToLogin('ehud_merha_gibir');
                        }
                      }}
                      className="py-3 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0C4A9E] font-bold text-xs flex items-center justify-center gap-1 border border-blue-300 transition-all cursor-pointer"
                      title="በአባልነት ወይም በአስተዳዳሪ መለያ ይግቡ"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>በመለያ ግባ</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectDepartment('ehud_merha_gibir', false)}
                      className="py-3 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0C4A9E] font-bold text-xs flex items-center justify-center gap-1 border border-blue-300 transition-all cursor-pointer"
                      title="የ2019 ዓመታዊና የዕለት ዕቅዶችን ሰሌዳ ይመልከቱ"
                    >
                      <span>የዕቅድ ሰሌዳ</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Sunday School Departments Hub */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#B88500] uppercase tracking-wider">
                  የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት ክፍሎች መረብ
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {departmentsList.length} ክፍሎች
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-ethiopic text-slate-800 mt-0.5">
                {isMasterOperator
                  ? 'ሁሉም የሰንበት ት/ቤት ክፍሎች (ዋና አስተባባሪ መዳረሻ)'
                  : 'የአገልግሎት ክፍሎች (በአንድ ክፍል ብቻ መግባት ይቻላል)'}
              </h3>
            </div>

            {isMasterOperator && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#F5B800] to-[#B88500] hover:brightness-105 text-slate-900 font-bold text-xs shadow-xs transition-all shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>አዲስ ክፍል አክል</span>
              </button>
            )}
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {departmentsList.map((dept) => {
              const isFlagship = dept.id === 'kinetibeb' || dept.id === 'ehud_merha_gibir';
              const locked = isDepartmentLocked(dept.id);
              const isAssigned = assignedDepartmentId === dept.id;

              return (
                <div
                  key={dept.id}
                  onClick={() => {
                    if (locked) {
                      setLockedModalDept(dept);
                    } else {
                      setSelectedDeptDetail(dept);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    locked
                      ? 'bg-slate-100/80 border-slate-200 opacity-70 hover:opacity-90'
                      : isAssigned
                      ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-300'
                      : isFlagship
                      ? 'bg-amber-50/40 border-[#B88500]/30 hover:border-[#B88500]'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
                          locked ? 'bg-slate-400' : ''
                        }`}
                        style={locked ? {} : { backgroundColor: dept.accentColor || '#0C4A9E' }}
                      >
                        {locked ? <Lock className="w-4 h-4" /> : renderIcon(dept.iconName, 'w-4 h-4')}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-serif-ethiopic leading-tight">
                          {dept.titleAmharic}
                        </h4>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          {dept.shortTitleAmharic}
                        </span>
                      </div>
                    </div>

                    {locked ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-0.5 shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        <span>የተቆለፈ</span>
                      </span>
                    ) : isAssigned ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        የእርስዎ ክፍል ✓
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          dept.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dept.status === 'PREPARATION'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dept.status === 'ACTIVE'
                          ? 'ክፍት'
                          : dept.status === 'PREPARATION'
                          ? 'በዝግጅት ላይ'
                          : 'የታቀደ'}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 font-serif-ethiopic line-clamp-2 mt-2 leading-relaxed">
                    {dept.descriptionAmharic}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2.5 mt-2.5 border-t border-slate-200/60">
                    <span className="truncate max-w-[130px]">
                      {dept.coordinatorName || 'አስተባባሪ'}
                    </span>
                    {locked ? (
                      <span className="font-bold text-rose-700 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> ተቆልፏል
                      </span>
                    ) : (
                      <span className="font-bold text-[#0C4A9E] flex items-center gap-0.5">
                        በር ግባ <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center py-6 text-xs text-slate-500 font-serif-ethiopic">
          የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት • በ፲፱፻፶፯ ዓ.ም. የተመሠረተ • አዲስ አበባ
        </div>
      </div>

      {/* Add Department Modal (Master Operator Only) */}
      {showAddModal && isMasterOperator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F5B800]/20 flex items-center justify-center text-[#B88500]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 font-serif-ethiopic">
                    አዲስ የሰንበት ት/ቤት ክፍል አክል
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    በሰንበት ትምህርት ቤቱ መዋቅር ውስጥ አዲስ የአገልግሎት ዘርፍ ይመዝግቡ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  የክፍሉ ሙሉ ስም *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ለምሳሌ፦ የንብረትና ሂሳብ ክፍል፣ የበጎ አድራጎት ክፍል"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0C4A9E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  አጭር መሪ ቃል / ንዑስ ርዕስ
                </label>
                <input
                  type="text"
                  placeholder="ለምሳሌ፦ የደብሩ ንብረት ቁጥጥርና የኦዲት ስርዓት"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0C4A9E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  የክፍሉ ዓላማና ተግባር
                </label>
                <textarea
                  rows={2}
                  placeholder="ክፍሉ የሚያከናውናቸው ዋና ዋና ተግባራት፣ ሳምንታዊ ስራዎችና ዓላማ..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0C4A9E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ተጠሪ / አስተባባሪ
                  </label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፦ ዲ/ን ተስፋዬ ከበደ"
                    value={newCoordinator}
                    onChange={(e) => setNewCoordinator(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0C4A9E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ምልክት (Icon)
                  </label>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0C4A9E] bg-white"
                  >
                    <option value="BookOpen">📖 መጽሐፍ (ትምህርት)</option>
                    <option value="Music">🎵 መዝሙር (ዜማ)</option>
                    <option value="Users">👥 አባላት (ሰዎች)</option>
                    <option value="Megaphone">📢 ሚዲያ (ማስታወቂያ)</option>
                    <option value="HandCoins">🤝 ልማት (በጎ አድራጎት)</option>
                    <option value="Palette">🎨 ኪነጥበብ (ጥበብ)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'በመመዝገብ ላይ...' : 'ክፍሉን መዝግብ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Detail Modal (only opens for unlocked departments) */}
      {selectedDeptDetail && !isDepartmentLocked(selectedDeptDetail.id) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: selectedDeptDetail.accentColor || '#0C4A9E' }}
                >
                  {renderIcon(selectedDeptDetail.iconName, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif-ethiopic leading-tight">
                    {selectedDeptDetail.titleAmharic}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDeptDetail.subtitleAmharic}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDeptDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  የክፍሉ መግለጫ
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif-ethiopic">
                  {selectedDeptDetail.descriptionAmharic}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">ኃላፊ / አስተባባሪ</span>
                  <span className="font-bold text-slate-800">
                    {selectedDeptDetail.coordinatorName || 'የክፍሉ አስተባባሪ'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">የክፍሉ ሁኔታ</span>
                  <span className="font-bold text-[#0C4A9E]">
                    {selectedDeptDetail.status === 'ACTIVE'
                      ? 'ገቢር (Active)'
                      : selectedDeptDetail.status === 'PREPARATION'
                      ? 'በዝግጅት ላይ (In Prep)'
                      : 'የታቀደ'}
                  </span>
                </div>
              </div>

              {!isMasterOperator && !assignedDepartmentId && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                  ማሳሰቢያ፦ ወደዚህ ክፍል ሲገቡ ሌሎች ክፍሎች በሙሉ በደንቡ መሠረት ይቆለፋሉ።
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDeptDetail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ዝጋ
              </button>
              {onGoToLogin && (
                <button
                  type="button"
                  onClick={() => {
                    const targetId = selectedDeptDetail.id as SundaySchoolDepartment;
                    if (lockDepartmentChoice(targetId)) {
                      setSelectedDeptDetail(null);
                      onGoToLogin(targetId);
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0C4A9E] border border-blue-200 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>በመለያ ግባ / ተመዝገብ</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedDeptDetail.id as SundaySchoolDepartment;
                  setSelectedDeptDetail(null);
                  handleSelectDepartment(targetId, false);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white shadow-xs flex items-center gap-1.5"
              >
                <span>ወደ «{selectedDeptDetail.shortTitleAmharic || selectedDeptDetail.titleAmharic}» በር ግባ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locked Department Modal */}
      <LockedDepartmentModal
        department={lockedModalDept}
        onClose={() => setLockedModalDept(null)}
        onRedirectToMyDepartment={(myDeptId) => {
          navigateToDepartment(myDeptId, false);
        }}
      />
    </div>
  );
};
