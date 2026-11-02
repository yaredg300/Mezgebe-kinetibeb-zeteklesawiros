import React, { useState } from 'react';
import {
  X,
  Palette,
  CalendarDays,
  BookOpen,
  Music,
  Users,
  Megaphone,
  HandCoins,
  Plus,
  Layers,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { DepartmentInfo, SundaySchoolDepartment } from '../types';

interface AllDepartmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDepartment: (deptId: SundaySchoolDepartment) => void;
}

export const AllDepartmentsModal: React.FC<AllDepartmentsModalProps> = ({
  isOpen,
  onClose,
  onSelectDepartment,
}) => {
  const { activeDepartment, departmentsList, addDepartment } = useArchive();
  const [showAddForm, setShowAddForm] = useState(false);

  // New department form
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCoordinator, setNewCoordinator] = useState('');
  const [newIcon, setNewIcon] = useState('BookOpen');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await addDepartment({
        titleAmharic: newTitle.trim(),
        subtitleAmharic: newSubtitle.trim() || 'የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት አገልግሎት ክፍል',
        shortTitleAmharic: newTitle.trim().slice(0, 14),
        iconName: newIcon,
        badgeLabel: newTitle.trim().slice(0, 10),
        descriptionAmharic: newDescription.trim() || 'በደብረ መድኃኒት ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት አዲስ የተደራጀ ክፍል',
        accentColor: '#0C4A9E',
        status: 'ACTIVE',
        coordinatorName: newCoordinator.trim() || 'የክፍሉ አስተባባሪ',
        memberCount: 1,
        programsCount: 1,
      });

      setNewTitle('');
      setNewSubtitle('');
      setNewDescription('');
      setNewCoordinator('');
      setShowAddForm(false);
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-full bg-white border border-[#B88500] shrink-0">
              <img
                src="/assets/ic_church_logo.jpg"
                alt="ዓርማ"
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] leading-tight">
                የሰንበት ትምህርት ቤቱ ክፍሎች መረብ
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት ሁሉንም ክፍሎች በአንድ ላይ ማደራጃ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {/* Quick Active Switcher Banner */}
          <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#1A2638] border border-[#B88500]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#B88500] uppercase block">
                የአሁኑ ገቢር ክፍል (Active Department)
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-serif-ethiopic">
                {activeDepartment === 'ehud_merha_gibir'
                  ? '📅 የእሁድ መርሃ ግብር ክፍል (Sunday Service & Planning)'
                  : '🎭 የኪነጥበብ ክፍል (Arts & Cultural Archive)'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeDepartment !== 'kinetibeb' && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectDepartment('kinetibeb');
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                >
                  ወደ ኪነጥበብ ቀይር
                </button>
              )}
              {activeDepartment !== 'ehud_merha_gibir' && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectDepartment('ehud_merha_gibir');
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial py-1.5 px-3 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold transition-colors"
                >
                  ወደ እሁድ መርሃ ግብር ቀይር
                </button>
              )}
            </div>
          </div>

          {/* Department List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                ክፍሎችና ዘርፎች ({departmentsList.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm((prev) => !prev)}
                className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'ቅጹን ዝጋ' : 'አዲስ ክፍል ጨምር'}</span>
              </button>
            </div>

            {/* Add Department Inline Form */}
            {showAddForm && (
              <form
                onSubmit={handleCreateDepartment}
                className="p-3.5 mb-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-200"
              >
                <span className="text-xs font-bold text-[#B88500] block">
                  አዲስ የሰንበት ት/ቤት ክፍል መመዝገቢያ
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="የክፍሉ ስም (ለምሳሌ፦ የንብረት ክፍል)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111D30]"
                  />
                  <input
                    type="text"
                    placeholder="ኃላፊ / አስተባባሪ"
                    value={newCoordinator}
                    onChange={(e) => setNewCoordinator(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111D30]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="የክፍሉ አጭር ዓላማና ተግባር..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111D30]"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#111D30]"
                  >
                    <option value="BookOpen">📖 ትምህርት</option>
                    <option value="Music">🎵 መዝሙር</option>
                    <option value="Users">👥 አባላት</option>
                    <option value="Megaphone">📢 ሚዲያ</option>
                    <option value="HandCoins">🤝 ልማት</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      ተው
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newTitle.trim()}
                      className="px-3.5 py-1 bg-[#0C4A9E] text-white font-bold text-xs rounded-lg hover:bg-[#072958] disabled:opacity-50"
                    >
                      {isSubmitting ? '...' : 'መዝግብ'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Departments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {departmentsList.map((dept) => {
                const isActive = activeDepartment === dept.id;
                return (
                  <div
                    key={dept.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'border-[#0C4A9E] dark:border-[#7FAFFF] bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-[#0C4A9E]/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#15202E] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: dept.accentColor || '#0C4A9E' }}
                          >
                            {renderIcon(dept.iconName, 'w-3.5 h-3.5')}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-serif-ethiopic leading-tight">
                              {dept.titleAmharic}
                            </h4>
                            <span className="text-[10px] text-slate-400 block leading-tight">
                              {dept.shortTitleAmharic}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            dept.status === 'ACTIVE'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {dept.status === 'ACTIVE' ? 'ገቢር በር' : 'ንቁ ክፍል'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-serif-ethiopic line-clamp-2 mt-2 leading-relaxed">
                        {dept.descriptionAmharic}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {dept.coordinatorName || 'አስተባባሪ'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectDepartment(dept.id as SundaySchoolDepartment);
                          onClose();
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[#0C4A9E] text-white hover:bg-[#072958]'
                        }`}
                      >
                        <span>{isActive ? 'ገቢር በር ✓' : 'በር ግባ →'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-serif-ethiopic">
            ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት • ፲፱፻፶፯ / 1957
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            ዝጋ
          </button>
        </div>
      </div>
    </div>
  );
};
