import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  FileText,
  HardDrive,
  Layers,
  BookOpen,
  Calendar,
  Users,
  Plus,
  Tag,
  CheckCircle2,
  FolderOpen,
  Filter,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { AppHeader } from '../components/AppHeader';
import { ManuscriptBox, HaragDivider } from '../components/Ornaments';
import { CategoryCard, WorkCard } from '../components/Cards';
import { GoogleDriveModal } from '../components/GoogleDriveModal';
import { QuickWorkPreviewModal } from '../components/LiturgicalAudioComponents';
import { WorkItem, SundaySchoolDepartment, WorkCategory } from '../types';
import { getDepartmentCategories, getAllDepartmentCategories } from '../data/departmentCategories';

export const ArchiveScreen: React.FC<{
  onCategoryClick: (categoryId: string) => void;
  onSearchClick: () => void;
  onCreateWorkClick: () => void;
  onWorkClick?: (workId: string) => void;
}> = ({ onCategoryClick, onSearchClick, onCreateWorkClick, onWorkClick }) => {
  const {
    works,
    activeDepartment,
    setActiveDepartment,
    departmentsList,
    toggleBookmark,
    playWorkAudio,
    isGoogleDriveConnected,
  } = useArchive();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<SundaySchoolDepartment | 'ALL'>(
    activeDepartment || 'ALL'
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'works' | 'categories'>('works');
  const [previewWork, setPreviewWork] = useState<WorkItem | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Active department metadata
  const currentDept = departmentsList.find((d) => d.id === selectedDeptFilter);

  // Available categories for the currently selected department
  const departmentCategories: WorkCategory[] = useMemo(() => {
    const rawCategories =
      selectedDeptFilter === 'ALL'
        ? getAllDepartmentCategories()
        : getDepartmentCategories(selectedDeptFilter);

    // Compute actual work count for each category within this department context
    return rawCategories.map((cat) => {
      const count = works.filter((w) => {
        const matchesDept =
          selectedDeptFilter === 'ALL' ||
          (w.departmentId ? w.departmentId === selectedDeptFilter : selectedDeptFilter === 'kinetibeb');
        if (!matchesDept) return false;
        return (
          w.categoryId === cat.id ||
          w.categoryName.toLowerCase().includes(cat.nameAmharic.toLowerCase()) ||
          cat.nameAmharic.toLowerCase().includes(w.categoryName.toLowerCase())
        );
      }).length;

      return {
        ...cat,
        workCount: count,
      };
    });
  }, [selectedDeptFilter, works]);

  // Filter works by department, category, and search query
  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      // 1. Department match
      const matchesDept =
        selectedDeptFilter === 'ALL' ||
        (w.departmentId ? w.departmentId === selectedDeptFilter : selectedDeptFilter === 'kinetibeb');

      if (!matchesDept) return false;

      // 2. Category match
      if (selectedCategoryFilter !== 'ALL') {
        const catObj = departmentCategories.find((c) => c.id === selectedCategoryFilter);
        const matchesCategory =
          w.categoryId === selectedCategoryFilter ||
          (catObj &&
            (w.categoryName.toLowerCase().includes(catObj.nameAmharic.toLowerCase()) ||
              catObj.nameAmharic.toLowerCase().includes(w.categoryName.toLowerCase())));
        if (!matchesCategory) return false;
      }

      // 3. Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.writerName.toLowerCase().includes(q) ||
        w.categoryName.toLowerCase().includes(q) ||
        w.excerpt.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [works, selectedDeptFilter, selectedCategoryFilter, searchQuery, departmentCategories]);

  // Filter categories for the Categories Tab
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return departmentCategories;
    const q = searchQuery.toLowerCase();
    return departmentCategories.filter(
      (cat) =>
        cat.nameAmharic.toLowerCase().includes(q) ||
        cat.nameEnglish.toLowerCase().includes(q) ||
        cat.descriptionAmharic.toLowerCase().includes(q)
    );
  }, [departmentCategories, searchQuery]);

  const handleSelectDepartment = (deptId: SundaySchoolDepartment | 'ALL') => {
    setSelectedDeptFilter(deptId);
    setSelectedCategoryFilter('ALL'); // Reset category when department changes
    if (deptId !== 'ALL') {
      setActiveDepartment(deptId);
    }
  };

  const handleSelectCategoryFromCard = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    setViewMode('works');
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      <AppHeader
        title="የሰንበት ት/ቤት መዝገብ"
        subtitle={
          currentDept
            ? `${currentDept.titleAmharic} • ቋሚ ቅርሶችና ሰነዶች`
            : 'የተክለ ሣዊሮስ ሁሉም ክፍላት ቅርሶችና ሰነዶች'
        }
        onSearchClick={onSearchClick}
      />

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Department Switcher Ribbon */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#B88500]" />
              የክፍላት መዝገብ ይምረጡ፦
            </span>
            <span className="text-[11px] text-slate-500">
              {selectedDeptFilter === 'ALL' ? 'ሁሉም ክፍሎች' : currentDept?.titleAmharic}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSelectDepartment('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDeptFilter === 'ALL'
                  ? 'bg-[#0C4A9E] text-white shadow-sm'
                  : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#0C4A9E]'
              }`}
            >
              ሁሉም ክፍላት ({works.length})
            </button>

            {departmentsList.map((dept) => {
              const isSelected = selectedDeptFilter === dept.id;
              const count = works.filter((w) =>
                w.departmentId ? w.departmentId === dept.id : dept.id === 'kinetibeb'
              ).length;

              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleSelectDepartment(dept.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#B88500]'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: dept.accentColor || '#0C4A9E' }
                      : {}
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: dept.accentColor || '#B88500' }}
                  />
                  <span>{dept.shortTitleAmharic || dept.titleAmharic}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Department Showcase Banner */}
        {currentDept && selectedDeptFilter !== 'ALL' && (
          <div
            className="p-4 sm:p-5 rounded-2xl text-white shadow-md relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentDept.accentColor || '#0C4A9E'}, #072958)`,
            }}
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-[#FFD54F] border border-white/20">
                    {currentDept.badgeLabel || 'አገልግሎት ክፍል'}
                  </span>
                  <span className="text-[11px] text-white/80">
                    {departmentCategories.length} የመዝገብ ዘርፎች
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold font-serif-ethiopic text-white">
                  {currentDept.titleAmharic} መዝገብ
                </h2>
                <p className="text-xs text-white/90 leading-relaxed max-w-xl mt-1">
                  {currentDept.descriptionAmharic}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#FFD54F]">
                  <span>አስተባባሪ፦ {currentDept.coordinatorName || 'የክፍሉ ኃላፊ'}</span>
                  <span>•</span>
                  <span>የተመዘገቡ ሰነዶች፦ {filteredWorks.length}</span>
                  <span>•</span>
                  <span>የጸደቁ፦ {filteredWorks.filter((w) => w.status === 'APPROVED').length}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <HardDrive className="w-4 h-4 text-[#FFD54F]" />
                  <span>Google Drive</span>
                </button>

                <button
                  type="button"
                  onClick={onCreateWorkClick}
                  className="px-3.5 py-2 rounded-xl bg-[#F5B800] hover:bg-[#FFD54F] text-slate-900 text-xs font-bold shadow-md flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>ሰነድ ጨምር</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toolbar: Search + Google Drive & Add */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${
                selectedDeptFilter === 'ALL'
                  ? 'በሁሉም ክፍላት ሰነዶች ውስጥ ፈልግ'
                  : `በ«${currentDept?.shortTitleAmharic || currentDept?.titleAmharic}» መዝገብ ፈልግ`
              }...`}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(true)}
              className={`px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border shadow-xs transition-colors ${
                isGoogleDriveConnected
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0C4A9E] dark:text-[#7FAFFF] border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#0C4A9E]'
              }`}
              title="Google Drive ሰነዶች ማመሳከሪያ"
            >
              <HardDrive className="w-4 h-4 text-[#0C4A9E] dark:text-[#7FAFFF]" />
              <span className="hidden sm:inline">Google Drive</span>
              {isGoogleDriveConnected && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={onCreateWorkClick}
              className="px-4 py-2.5 rounded-2xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>አዲስ መዝግብ</span>
            </button>
          </div>
        </div>

        {/* Department-Specific Category Filter Pills */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5 text-[#B88500]" />
              <span>
                {selectedDeptFilter === 'ALL'
                  ? 'የመዝገብ ዘርፎች (Categories)፦'
                  : `የ«${currentDept?.shortTitleAmharic}» የመዝገብ ዘርፎች፦`}
              </span>
            </span>
            {selectedCategoryFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('ALL')}
                className="text-[11px] text-[#8B0000] hover:underline flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                <span>ሁሉንም አሳይ</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              ሁሉም ዘርፎች ({filteredWorks.length})
            </button>

            {departmentCategories.map((cat) => {
              const isSelected = selectedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#B88500] text-white shadow-2xs'
                      : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#B88500]'
                  }`}
                >
                  <span>{cat.nameAmharic}</span>
                  <span className="text-[10px] opacity-80">({cat.workCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode Toggle: Works Grid vs Categories Grid */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode('works')}
              className={`pb-1 text-xs sm:text-sm font-bold transition-all relative ${
                viewMode === 'works'
                  ? 'text-[#0C4A9E] dark:text-[#7FAFFF] border-b-2 border-[#B88500]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              የተመዘገቡ ሥራዎችና ሰነዶች ({filteredWorks.length})
            </button>

            <button
              type="button"
              onClick={() => setViewMode('categories')}
              className={`pb-1 text-xs sm:text-sm font-bold transition-all relative ${
                viewMode === 'categories'
                  ? 'text-[#0C4A9E] dark:text-[#7FAFFF] border-b-2 border-[#B88500]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              የመዝገብ ዘርፎች ማውጫ ({filteredCategories.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            {selectedDeptFilter === 'ALL' ? 'ሁሉም ክፍሎች' : currentDept?.titleAmharic}
          </span>
        </div>

        {/* View 1: Works Grid */}
        {viewMode === 'works' && (
          <div>
            {filteredWorks.length === 0 ? (
              <ManuscriptBox className="p-8 text-center text-slate-500 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-[#B88500]/50" />
                <p className="text-xs font-serif-ethiopic font-bold text-slate-700 dark:text-slate-200">
                  {selectedCategoryFilter !== 'ALL'
                    ? 'በዚህ ዘርፍ የተመዘገበ ሰነድ አልተገኘም።'
                    : 'በዚህ ክፍል እስካሁን የተመዘገበ ሰነድ አልተገኘም።'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {selectedCategoryFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('ALL')}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      የክፍሉን ሁሉንም ሰነዶች አሳይ
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onCreateWorkClick}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0C4A9E] text-white text-xs font-bold"
                  >
                    ለዚህ ክፍል አዲስ ሰነድ መዝግብ +
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDriveModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-blue-300 text-blue-700 dark:text-blue-300 text-xs font-bold"
                  >
                    ከ Google Drive አስመጣ
                  </button>
                </div>
              </ManuscriptBox>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredWorks.map((work) => (
                  <WorkCard
                    key={work.id}
                    work={work}
                    onClick={() => {
                      if (onWorkClick) onWorkClick(work.id);
                    }}
                    onBookmarkClick={() => toggleBookmark(work.id)}
                    onQuickPreviewClick={() => setPreviewWork(work)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* View 2: Categories Grid (department-specific categories) */}
        {viewMode === 'categories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleSelectCategoryFromCard(category.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Google Drive Synchronization Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onImportComplete={(newWork) => {
          if (onWorkClick) onWorkClick(newWork.id);
        }}
      />

      {/* Quick Work Preview Sheet */}
      <QuickWorkPreviewModal
        isOpen={previewWork !== null}
        work={previewWork}
        onDismiss={() => setPreviewWork(null)}
        onOpenFullDetail={(workId) => {
          setPreviewWork(null);
          if (onWorkClick) onWorkClick(workId);
        }}
        onPlayAudio={(work) => {
          playWorkAudio(work);
        }}
        onToggleBookmark={(workId) => {
          toggleBookmark(workId);
        }}
      />
    </div>
  );
};
