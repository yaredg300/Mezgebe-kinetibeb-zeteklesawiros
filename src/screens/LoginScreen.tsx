import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeftRight, CheckCircle } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { DIVISIONS, USER_ROLES, UserRole } from '../types';
import { HaragDivider, ManuscriptBox } from '../components/Ornaments';

export const LoginScreen: React.FC<{
  onLoginSuccess: () => void;
  onContinueAsGuest: () => void;
  onChangeDivisionClick: () => void;
}> = ({ onLoginSuccess, onContinueAsGuest, onChangeDivisionClick }) => {
  const { selectedDivision, currentUser, setUserRole } = useArchive();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('ቃልኪዳን ሰይፉ');
  const [email, setEmail] = useState<string>('kalkidan@teklesawiros.org');
  const [password, setPassword] = useState<string>('******');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [message, setMessage] = useState<string | null>(null);

  const divisionInfo = DIVISIONS[selectedDivision];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserRole(role);
    setMessage(isRegisterMode ? 'የአባልነት ምዝገባ ተጠናቋል!' : 'በተሳካ ሁኔታ ገብተዋል!');
    setTimeout(() => {
      onLoginSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFD] dark:bg-[#0B1320] py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        {/* Emblem & Church Header */}
        <div className="flex flex-col items-center text-center mb-5">
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
            መዝገበ ኪነጥበብ • ፲፱፻፶፯ / 1957
          </p>
        </div>

        <HaragDivider className="my-2 max-w-xs mx-auto" height={14} />

        {/* Selected Branch Capsule */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 shadow-xs mb-5">
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
            <span>ቀይር</span>
          </button>
        </div>

        {/* Form Container */}
        <ManuscriptBox className="p-6">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
            <button
              onClick={() => setIsRegisterMode(false)}
              className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all ${
                !isRegisterMode
                  ? 'border-[#0C4A9E] text-[#0C4A9E] dark:border-[#7FAFFF] dark:text-[#7FAFFF]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ግባ (Login)
            </button>
            <button
              onClick={() => setIsRegisterMode(true)}
              className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all ${
                isRegisterMode
                  ? 'border-[#0C4A9E] text-[#0C4A9E] dark:border-[#7FAFFF] dark:text-[#7FAFFF]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              አዲስ ተመዝገብ (Sign Up)
            </button>
          </div>

          {message && (
            <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ሙሉ ስም
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ሙሉ ስም ያስገቡ"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ኢሜይል ወይም የተጠቃሚ ስም
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@teklesawiros.org"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                የይለፍ ቃል
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="የይለፍ ቃል"
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

            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                የአባልነት ሚና (System Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
              >
                {Object.entries(USER_ROLES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.amharicTitle} ({key})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs sm:text-sm shadow-md transition-colors mt-2"
            >
              {isRegisterMode ? 'ይመዝገቡ' : 'ግባ (Sign In)'}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={onContinueAsGuest}
              className="text-xs font-bold text-[#B88500] hover:underline"
            >
              እንደ እንግዳ ያለ ምዝገባ ይቀጥሉ →
            </button>
          </div>
        </ManuscriptBox>
      </div>
    </div>
  );
};
