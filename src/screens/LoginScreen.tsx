import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowLeftRight,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Loader2,
  Palette,
  CalendarDays,
  BookOpen,
  Music,
  Users,
  Megaphone,
  HandCoins,
  Layers,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { DIVISIONS, USER_ROLES, UserRole, SundaySchoolDepartment } from '../types';
import { HaragDivider, ManuscriptBox } from '../components/Ornaments';

export const LoginScreen: React.FC<{
  onLoginSuccess: (deptId?: SundaySchoolDepartment) => void;
  onContinueAsGuest: (deptId?: SundaySchoolDepartment) => void;
  onChangeDivisionClick: () => void;
}> = ({ onLoginSuccess, onContinueAsGuest, onChangeDivisionClick }) => {
  const {
    selectedDivision,
    currentUser,
    departmentsList,
    activeDepartment,
    setActiveDepartment,
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
    resetPasswordEmail,
  } = useArchive();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>('CONTRIBUTOR');

  // Gate selection for entering the app
  const [selectedDeptId, setSelectedDeptId] = useState<SundaySchoolDepartment>(() => {
    return activeDepartment || 'kinetibeb';
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const divisionInfo = DIVISIONS[selectedDivision];
  const selectedDeptInfo = departmentsList.find((d) => d.id === selectedDeptId) || departmentsList[0];

  const mapAuthErrorToAmharic = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return '';
    }
    if (code === 'auth/popup-blocked') {
      return 'የGoogle መግቢያ መስኮት በአሳሽዎ ታግዷል። እባክዎ Pop-up ይፍቀዱ ወይም በኢሜይል ይግቡ።';
    }
    if (code === 'auth/email-already-in-use') {
      return 'ይህ የኢሜይል አድራሻ አስቀድሞ ተመዝግቧል። እባክዎ በቀጥታ «ግባ» የሚለውን ይምረጡ።';
    }
    if (code === 'auth/invalid-email') {
      return 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ።';
    }
    if (code === 'auth/weak-password') {
      return 'የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መሆን አለበት።';
    }
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-credential'
    ) {
      return 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል። እባክዎ እንደገና ይሞክሩ።';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'በ Firebase Console ውስጥ Email/Password መግቢያ ገና አልበራም። እባክዎ በ Console > Authentication ውስጥ ያብሩት።';
    }
    if (code === 'auth/too-many-requests') {
      return 'ብዙ ሙከራዎች ተደርገዋል። እባክዎ ጥቂት ደቂቃዎች ቆይተው እንደገና ይሞክሩ።';
    }
    return err?.message || 'ያልታወቀ ስህተት አጋጥሟል። እባክዎ እንደገና ይሞክሩ።';
  };

  const handleSelectDepartmentGate = (deptId: SundaySchoolDepartment) => {
    setSelectedDeptId(deptId);
    setActiveDepartment(deptId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ።');
      return;
    }

    if (isRegisterMode && !fullName.trim()) {
      setErrorMessage('እባክዎ ሙሉ ስምዎን ያስገቡ።');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መሆን አለበት።');
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure the chosen department gate is set as active
      setActiveDepartment(selectedDeptId);

      if (isRegisterMode) {
        // Real Firebase account creation with department assignment
        await registerWithEmail(email, password, fullName, role);
        setSuccessMessage(`አካውንትዎ ተፈጥሯል! ወደ «${selectedDeptInfo?.titleAmharic || 'ክፍል'}» በር በመግባት ላይ...`);
      } else {
        // Real Firebase account login
        await loginWithEmail(email, password);
        setSuccessMessage(`እንኳን ደህና መጡ! ወደ «${selectedDeptInfo?.titleAmharic || 'ክፍል'}» በር በመግባት ላይ...`);
      }

      setTimeout(() => {
        onLoginSuccess(selectedDeptId);
      }, 700);
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(mapAuthErrorToAmharic(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsResetting(true);
    try {
      await resetPasswordEmail(resetEmail);
      setSuccessMessage(`የይለፍ ቃል መቀየሪያ ማስፈንጠሪያ ወደ ${resetEmail} ተልኳል!`);
      setShowForgotModal(false);
    } catch (err: any) {
      setErrorMessage(mapAuthErrorToAmharic(err));
    } finally {
      setIsResetting(false);
    }
  };

  const renderDeptIcon = (iconName: string, className = 'w-4 h-4') => {
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
    <div className="min-h-screen bg-[#F9FAFD] dark:bg-[#0B1320] py-8 px-3 sm:px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg mx-auto">
        {/* Emblem & Church Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="p-1 rounded-full bg-white border-2 border-[#B88500] shadow-md mb-2">
            <img
              src="/assets/ic_church_logo.jpg"
              alt="ተክለ ሳዊሮስ ሰንበት ት/ቤት"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-xl font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
            ተክለ ሳዊሮስ ሰንበት ት/ቤት
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
          </p>
          <p className="text-xs font-bold text-[#B88500] mt-1">
            መዝገበ ኪነጥበብና የክፍሎች ማስተባበሪያ • ፲፱፻፶፯ / 1957
          </p>
        </div>

        <HaragDivider className="my-2 max-w-xs mx-auto" height={14} />

        {/* Selected Age Division Capsule */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 shadow-xs mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: divisionInfo.accentColor }}
            />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                የ«{divisionInfo.titleAmharic}» ክፍል
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {divisionInfo.ageRangeAmharic}
              </span>
            </div>
          </div>

          <button
            onClick={onChangeDivisionClick}
            className="flex items-center gap-1 text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>ዕድሜ ቀይር</span>
          </button>
        </div>

        {/* Form Container */}
        <ManuscriptBox className="p-4 sm:p-6">
          {/* CRITICAL: DEPARTMENT GATE CHOOSER AT LOGIN */}
          <div className="mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#B88500]" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                  የመግቢያ በር ይምረጡ (Choose Department Gate) *
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#0C4A9E] dark:text-[#7FAFFF] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                ራሱን የቻለ ስራ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              እያንዳንዱ የሰንበት ትምህርት ቤት ክፍል ራሱን ችሎ የሚሰራ በመሆኑ፣ ለመግባት የሚፈልጉትን የክፍል በር ይምረጡ፦
            </p>

            {/* Department Grid / Cards */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {departmentsList.map((dept) => {
                const isSelected = selectedDeptId === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelectDepartmentGate(dept.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0C4A9E] dark:border-[#7FAFFF] bg-blue-50/70 dark:bg-blue-950/40 shadow-xs ring-1 ring-[#0C4A9E]'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111D30] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div
                        className="p-1.5 rounded-lg text-white shrink-0"
                        style={{ backgroundColor: dept.accentColor || '#0C4A9E' }}
                      >
                        {renderDeptIcon(dept.iconName, 'w-3.5 h-3.5')}
                      </div>
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-[#0C4A9E] dark:text-[#7FAFFF] shrink-0 fill-current" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic truncate">
                        {dept.shortTitleAmharic || dept.titleAmharic}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {dept.coordinatorName || 'የክፍሉ አስተባባሪ'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Gate Capsule */}
            <div className="mt-3 p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-[#B88500]/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  የተመረጠው መግቢያ በር፦{' '}
                  <strong className="text-[#0C4A9E] dark:text-[#FFD54F]">
                    {selectedDeptInfo?.titleAmharic}
                  </strong>
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#B88500] uppercase tracking-wider shrink-0">
                በር ነቅቷል ✓
              </span>
            </div>
          </div>

          {/* Login / Register Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all ${
                !isRegisterMode
                  ? 'border-[#0C4A9E] text-[#0C4A9E] dark:border-[#7FAFFF] dark:text-[#7FAFFF]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ግባ (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all ${
                isRegisterMode
                  ? 'border-[#0C4A9E] text-[#0C4A9E] dark:border-[#7FAFFF] dark:text-[#7FAFFF]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              አዲስ ተመዝገብ (Create Account)
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-xs font-medium text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ሙሉ ስም *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required={isRegisterMode}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ለምሳሌ፡ ዮሐንስ ግርማ"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                የኢሜይል አድራሻ (Email) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="የእርስዎ_ኢሜይል@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  የይለፍ ቃል (Password) *
                </label>
                {!isRegisterMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
                  >
                    የይለፍ ቃል ረሱ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegisterMode ? 'ቢያንስ 6 ፊደላት ወይም ቁጥሮች' : 'የይለፍ ቃል'}
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role selection only in register mode */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የአገልግሎት ዘርፍ / ሚና (Church Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                >
                  <option value="CONTRIBUTOR">ደራሲ / አቅራቢ (Contributor / Writer)</option>
                  <option value="MEMBER">አባል / ተጠቃሚ (Member)</option>
                  <option value="REVIEWER">ገምጋሚ / የክፍል ኃላፊ (Reviewer)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>በማረጋገጥ ላይ...</span>
                </>
              ) : isRegisterMode ? (
                `በ«${selectedDeptInfo?.shortTitleAmharic || 'ክፍል'}» በር አካውንት ፍጠር`
              ) : (
                `በ«${selectedDeptInfo?.shortTitleAmharic || 'ክፍል'}» በር ግባ (Sign In)`
              )}
            </button>
          </form>

          {/* Google Sign In Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-[#111D30] text-slate-400 font-medium">ወይም</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoadingGoogle}
            onClick={async () => {
              try {
                setIsLoadingGoogle(true);
                setErrorMessage(null);
                setActiveDepartment(selectedDeptId);
                const user = await signInWithGoogle();
                if (user) {
                  onLoginSuccess(selectedDeptId);
                }
              } catch (err: any) {
                const code = err?.code || '';
                if (
                  code !== 'auth/popup-closed-by-user' &&
                  code !== 'auth/cancelled-popup-request'
                ) {
                  setErrorMessage(mapAuthErrorToAmharic(err));
                }
              } finally {
                setIsLoadingGoogle(false);
              }
            }}
            className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoadingGoogle ? 'በመገናኘት ላይ...' : `በ Google ገብተህ ወደ «${selectedDeptInfo?.shortTitleAmharic || 'ክፍል'}» በር ግባ`}</span>
          </button>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => {
                setActiveDepartment(selectedDeptId);
                onContinueAsGuest(selectedDeptId);
              }}
              className="text-xs font-bold text-[#B88500] hover:underline"
            >
              እንደ እንግዳ ወደ «{selectedDeptInfo?.titleAmharic}» በር ይቀጥሉ →
            </button>
          </div>
        </ManuscriptBox>

        {/* Security / Firebase Note */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-4">
          የተጠቃሚ መለያዎች በ Google Firebase በከፍተኛ ደህንነት ይጠበቃሉ።
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#B88500]/30 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-[#0C4A9E] dark:text-[#7FAFFF] mb-3">
              <KeyRound className="w-5 h-5 text-[#B88500]" />
              <h3 className="text-sm font-bold font-serif-ethiopic">የይለፍ ቃል መቀየሪያ</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              የተመዘገቡበትን የኢሜይል አድራሻ ያስገቡ። የይለፍ ቃል መቀየሪያ ሊንክ ይላክልዎታል።
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="ኢሜይል አድራሻ"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isResetting ? 'በመላክ ላይ...' : 'ሊንክ ላክ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
