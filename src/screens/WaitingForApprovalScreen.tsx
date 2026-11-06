import React, { useState } from 'react';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  LogOut,
  Building2,
  Users,
  CheckCircle2,
  Send,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { HaragDivider, CrossOrnament, ManuscriptBox } from '../components/Ornaments';
import { SundaySchoolDepartment, SundaySchoolDivision, DIVISIONS } from '../types';

export const WaitingForApprovalScreen: React.FC<{
  onLogoutClick?: () => void;
  onExploreOtherDepartment?: (deptId: SundaySchoolDepartment) => void;
}> = ({ onLogoutClick, onExploreOtherDepartment }) => {
  const {
    currentUser,
    activeDepartment,
    departmentsList,
    activeMembership,
    approvedMemberships,
    requestDepartmentMembership,
    logout,
  } = useArchive();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [targetDeptId, setTargetDeptId] = useState<string>('kinetibeb');
  const [selectedDiv, setSelectedDiv] = useState<SundaySchoolDivision>('youth');
  const [skillsInput, setSkillsInput] = useState<string>('');
  const [responsibilitiesInput, setResponsibilitiesInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const currentDeptInfo = departmentsList.find((d) => d.id === activeDepartment);
  const membershipStatus = activeMembership?.status || 'PENDING';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handleApplyToAnotherDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await requestDepartmentMembership(
        targetDeptId,
        selectedDiv,
        skillsArray,
        responsibilitiesInput
      );
      setApplySuccess('የአባልነት ማመልከቻዎ በተሳካ ሁኔታ ተልኳል!');
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(null);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1320] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#B88500]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <ManuscriptBox showCornerFlourish className="p-6 sm:p-8 text-center shadow-xl">
          {/* Spiritual Cross & Header */}
          <div className="flex justify-center mb-3">
            <CrossOrnament size="md" color="gold" />
          </div>

          <p className="text-[11px] font-bold tracking-widest text-[#B88500] dark:text-[#E6B800] uppercase mb-1">
            የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት
          </p>

          <h1 className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-[#8B0000] dark:text-[#FFB4AB] mb-2">
            {membershipStatus === 'REJECTED'
              ? 'የአባልነት ማመልከቻ ውድቅ ተደርጓል'
              : membershipStatus === 'SUSPENDED'
              ? 'የአባልነት አገልግሎት ለጊዜው ታግዷል'
              : 'የክፍሉ አስተዳዳሪ ማረጋገጫ በመጠባበቅ ላይ'}
          </h1>

          <HaragDivider className="my-3" />

          {/* Department badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B88500]/15 dark:bg-[#B88500]/25 border border-[#B88500]/40 text-xs font-bold text-[#8B0000] dark:text-[#FFD54F] mb-5">
            <Building2 className="w-3.5 h-3.5 text-[#B88500]" />
            <span>የተጠየቀው ክፍል፦ {currentDeptInfo?.titleAmharic || activeDepartment}</span>
          </div>

          {/* Status Illustration / Icon */}
          <div className="flex justify-center mb-4">
            {membershipStatus === 'REJECTED' ? (
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-700 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
            ) : membershipStatus === 'SUSPENDED' ? (
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-300 dark:border-blue-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner animate-pulse">
                <Clock className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Status message */}
          {membershipStatus === 'PENDING' && (
            <div className="space-y-3 mb-6">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif-ethiopic">
                የተከበሩ <strong className="font-bold text-slate-900 dark:text-white">{currentUser.fullName}</strong>፤ 
                ወደ <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">«{currentDeptInfo?.titleAmharic || 'ክፍሉ'}»</span> ያቀረቡት የአባልነት ማመልከቻ ደርሶ በክፍሉ አስተዳዳሪ በመታየት ላይ ነው።
              </p>
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-left text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B88500]" />
                  <span>የክፍል ደህንነትና ምስጢራዊነት ጥበቃ</span>
                </p>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  የሰንበት ት/ቤቱ ደንብ የክፍሉ ሰነዶች፣ ዓመታዊና ዕለታዊ መርሐ ግብሮች፣ የሥራ ምደባዎች እና አባላት መረጃ የሚታዩት በክፍሉ አስተዳዳሪ በይፋ ሲጸድቅ ብቻ ነው።
                </p>
              </div>
            </div>
          )}

          {membershipStatus === 'REJECTED' && (
            <div className="space-y-3 mb-6">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif-ethiopic">
                ወደ «{currentDeptInfo?.titleAmharic}» ያቀረቡት የአባልነት ማመልከቻ በክፍሉ አስተዳዳሪ ተቀባይነት አላገኘም።
              </p>
              {activeMembership?.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-left text-xs text-rose-900 dark:text-rose-200">
                  <span className="font-bold block mb-1">የተሰጠ ምክንያት፦</span>
                  <p className="italic">«{activeMembership.rejectionReason}»</p>
                </div>
              )}
            </div>
          )}

          {membershipStatus === 'SUSPENDED' && (
            <div className="space-y-3 mb-6">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif-ethiopic">
                በዚህ ክፍል ያለዎት የአባልነት አገልግሎት ለጊዜው ታግዷል። እባክዎ የሰንበት ት/ቤቱን የበላይ አስተዳደር ያነጋግሩ።
              </p>
              {activeMembership?.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-left text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block mb-1">የእገዳ ምክንያት፦</span>
                  <p className="italic">«{activeMembership.rejectionReason}»</p>
                </div>
              )}
            </div>
          )}

          {/* User Request Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
              <span>የአመልካች ስም፦</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.fullName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
              <span>ኢሜይል፦</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{currentUser.email || 'ያልተገለጸ'}</span>
            </div>
            {activeMembership?.division && (
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                <span>የዕድሜ እርከን፦</span>
                <span className="font-bold text-[#8B0000] dark:text-[#FFB4AB]">
                  {DIVISIONS[activeMembership.division]?.titleAmharic || activeMembership.division}
                </span>
              </div>
            )}
            {activeMembership?.serviceSkills && activeMembership.serviceSkills.length > 0 && (
              <div className="text-slate-500 dark:text-slate-400 pt-1">
                <span className="block mb-1">ያመለከቱባቸው የአገልግሎት ክህሎቶች፦</span>
                <div className="flex flex-wrap gap-1">
                  {activeMembership.serviceSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Approved in other departments? */}
          {approvedMemberships.length > 0 && (
            <div className="mb-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-left">
              <p className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>በሌላ ክፍል ውስጥ የጸደቀ አባልነት አለዎት፦</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {approvedMemberships.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (onExploreOtherDepartment) {
                        onExploreOtherDepartment(m.departmentId as SundaySchoolDepartment);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold text-blue-900 dark:text-blue-100 flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{m.departmentName}</span>
                    <span className="text-[10px] text-slate-500">({m.role})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full py-2.5 px-4 rounded-full bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'በማረጋገጥ ላይ...' : 'የውሳኔ ሁኔታውን እንደገና ፈትሽ (Refresh)'}</span>
            </button>

            <button
              onClick={() => setShowApplyModal(true)}
              className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#B88500]" />
              <span>ወደ ሌላ ክፍል አባልነት አመልክት (Request Another Department)</span>
            </button>

            <button
              onClick={async () => {
                await logout();
                if (onLogoutClick) onLogoutClick();
              }}
              className="w-full py-2 px-4 rounded-full text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ከአካውንት ውጣ (Sign Out)</span>
            </button>
          </div>
        </ManuscriptBox>
      </div>

      {/* Modal: Apply to another department */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111D30] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-white mb-1">
              ወደ ሌላ ክፍል አባልነት ማመልከት
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              ሊቀላቀሉ የሚፈልጉትን የሰንበት ት/ቤት ክፍል፣ የእድሜ እርከን እና የአገልግሎት ክህሎት ይምረጡ።
            </p>

            {applySuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{applySuccess}</span>
              </div>
            )}

            <form onSubmit={handleApplyToAnotherDept} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የሚፈለገው ክፍል *
                </label>
                <select
                  value={targetDeptId}
                  onChange={(e) => setTargetDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                >
                  {departmentsList.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.titleAmharic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የዕድሜ እርከን (Age Division) *
                </label>
                <select
                  value={selectedDiv}
                  onChange={(e) => setSelectedDiv(e.target.value as SundaySchoolDivision)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                >
                  <option value="children">ሕፃናት (Children)</option>
                  <option value="intermediates">ማዕከላውያን (Intermediates)</option>
                  <option value="youth">ወጣቶች (Youth)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የአገልግሎት ክህሎቶች (በኮማ ይለዩ)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="ለምሳሌ፡ መዝሙር፣ ቲያትር፣ የሰዓት ቁጥጥር..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የሚመርጡት ኃላፊነት
                </label>
                <input
                  type="text"
                  value={responsibilitiesInput}
                  onChange={(e) => setResponsibilitiesInput(e.target.value)}
                  placeholder="ለምሳሌ፡ የመድረክ መሪነት፣ የጽሑፍ ዝግጅት..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
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
                  <span>{isSubmitting ? 'በመላክ ላይ...' : 'አመልክት'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
