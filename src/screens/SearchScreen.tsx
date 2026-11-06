import React, { useState, useMemo } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { WorkItem, SundaySchoolDivision, SundaySchoolDepartment, DIVISIONS, WorkCategory } from '../types';
import { WorkCard } from '../components/Cards';
import { QuickWorkPreviewModal } from '../components/LiturgicalAudioComponents';
import { Search, SlidersHorizontal, BookOpen, Layers, X, Sparkles, Filter } from 'lucide-react';
import { getDepartmentCategories, getAllDepartmentCategories } from '../data/departmentCategories';

interface SearchScreenProps {
  onSelectWork: (workId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

const DEPARTMENT_QUICK_KEYWORDS: Record<string, string[]> = {
  kinetibeb: ['ግጥም', 'ቲያትር', 'መነባንብ', 'ስክሪፕት', 'ብራና'],
  ehud_merha_gibir: ['2019 ዕቅድ', 'የእሁድ ሰሌዳ', 'አዘጋጆች', 'የዕለት ሉህ', 'ተረኛ'],
  education: ['ሞጁል', 'ፈተና', 'ነገረ መለኮት', 'መጽሐፍ ቅዱስ', 'ስርዓተ ቤተክርስቲያን'],
  mezmur: ['ቅዱስ ያሬድ', 'ድጓ', 'በገና', 'የበዓላት መዝሙር', 'ማኅሌት'],
  records: ['ቆጠራ', 'መገኘት', 'ስነ-ስርዓት', 'የአባላት ምዝገባ', 'ደንብ'],
  media: ['ማስታወቂያ', 'ዜና', 'መጽሔት', 'ፎቶግራፍ', 'ቪዲዮ'],
  finance: ['ፕሮጀክት', 'ሁለገብ አዳራሽ', 'በጎ አድራጎት', 'ሒሳብ', 'ባዛር'],
};

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onSelectWork,
  onSelectCategory,
}) => {
  const {
    works,
    selectedDivision,
    departmentsList,
    activeDepartment,
    toggleBookmark,
    playWorkAudio,
  } = useArchive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<SundaySchoolDivision | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<SundaySchoolDepartment | 'ALL'>(
    activeDepartment || 'ALL'
  );
  const [previewWork, setPreviewWork] = useState<WorkItem | null>(null);

  // Active department metadata
  const activeDepartmentInfo = departmentsList.find((d) => d.id === departmentFilter);

  // Department-specific categories
  const departmentCategories: WorkCategory[] = useMemo(() => {
    return departmentFilter === 'ALL'
      ? getAllDepartmentCategories()
      : getDepartmentCategories(departmentFilter);
  }, [departmentFilter]);

  // Quick keywords for the selected department
  const quickKeywords = useMemo(() => {
    if (departmentFilter !== 'ALL' && DEPARTMENT_QUICK_KEYWORDS[departmentFilter]) {
      return DEPARTMENT_QUICK_KEYWORDS[departmentFilter];
    }
    return ['ግጥም', 'ትምህርት', 'መዝሙር', 'እሁድ ዕቅድ', 'ስነ-ስርዓት', 'ሚዲያ', 'ልማት'];
  }, [departmentFilter]);

  const handleDepartmentChange = (deptId: SundaySchoolDepartment | 'ALL') => {
    setDepartmentFilter(deptId);
    setSelectedCategoryFilter('ALL');
  };

  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      // 1. Department filter
      if (departmentFilter !== 'ALL') {
        const matchesDept = w.departmentId
          ? w.departmentId === departmentFilter
          : departmentFilter === 'kinetibeb';
        if (!matchesDept) return false;
      }

      // 2. Division filter
      if (divisionFilter !== 'ALL' && w.division !== divisionFilter) {
        return false;
      }

      // 3. Category filter
      if (selectedCategoryFilter !== 'ALL') {
        const catObj = departmentCategories.find((c) => c.id === selectedCategoryFilter);
        const matchesCat =
          w.categoryId === selectedCategoryFilter ||
          (catObj &&
            (w.categoryName.toLowerCase().includes(catObj.nameAmharic.toLowerCase()) ||
              catObj.nameAmharic.toLowerCase().includes(w.categoryName.toLowerCase())));
        if (!matchesCat) return false;
      }

      // 4. Search query
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = w.title.toLowerCase().includes(q);
      const matchAuthor = w.writerName.toLowerCase().includes(q);
      const matchContent = w.content.toLowerCase().includes(q);
      const matchCategory = w.categoryName.toLowerCase().includes(q);
      const matchDept = w.departmentTitle?.toLowerCase().includes(q);
      const matchTags = w.tags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchAuthor || matchContent || matchCategory || matchDept || matchTags;
    });
  }, [works, searchQuery, departmentFilter, divisionFilter, selectedCategoryFilter, departmentCategories]);

  return (
    <div className="min-h-full pb-28 md:pb-16 px-4 md:px-8 max-w-6xl mx-auto pt-4 font-ethiopic">
      {/* Search Input Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              departmentFilter === 'ALL'
                ? 'በሁሉም ክፍሎች ሰነዶች፣ ደራሲያን፣ ማህደሮችና መለያዎች ፈልግ...'
                : `በ«${activeDepartmentInfo?.shortTitleAmharic || activeDepartmentInfo?.titleAmharic}» ውስጥ ፈልግ...`
            }
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B88500] text-slate-900 dark:text-slate-100 text-sm md:text-base font-ethiopic"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Search Keywords for the Active Department */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none text-xs">
        <span className="text-slate-400 shrink-0 flex items-center gap-1 text-[11px]">
          <Sparkles className="w-3 h-3 text-[#B88500]" />
          ፈጣን ቃላት፦
        </span>
        {quickKeywords.map((kw) => (
          <button
            key={kw}
            type="button"
            onClick={() => setSearchQuery(kw)}
            className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#B88500]/20 hover:text-[#B88500] text-[11px] whitespace-nowrap transition-colors cursor-pointer"
          >
            #{kw}
          </button>
        ))}
      </div>

      {/* 1. Department Filter Ribbon */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0C4A9E] dark:text-[#7FAFFF]" />
            <span>የሰንበት ት/ቤት ክፍል ይምረጡ፦</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {departmentFilter === 'ALL' ? 'ሁሉም ክፍሎች' : activeDepartmentInfo?.titleAmharic}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleDepartmentChange('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-ethiopic font-bold whitespace-nowrap transition-all cursor-pointer ${
              departmentFilter === 'ALL'
                ? 'bg-[#0C4A9E] text-white shadow-sm'
                : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#0C4A9E]'
            }`}
          >
            ሁሉም ክፍላት ({works.length})
          </button>

          {departmentsList.map((dept) => {
            const isSelected = departmentFilter === dept.id;
            const count = works.filter((w) =>
              w.departmentId ? w.departmentId === dept.id : dept.id === 'kinetibeb'
            ).length;

            return (
              <button
                key={dept.id}
                onClick={() => handleDepartmentChange(dept.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-ethiopic font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#B88500]'
                }`}
                style={isSelected ? { backgroundColor: dept.accentColor || '#0C4A9E' } : {}}
              >
                <span>{dept.shortTitleAmharic || dept.titleAmharic}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Age Division Filter Bar */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#B88500]" />
          <span>የዕድሜ እርከን፦</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setDivisionFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
              divisionFilter === 'ALL'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            ሁሉም ዕድሜ
          </button>
          <button
            onClick={() => setDivisionFilter('children')}
            className={`px-3 py-1 rounded-xl text-xs font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
              divisionFilter === 'children'
                ? 'bg-[#F5B800] text-slate-900 font-bold'
                : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {DIVISIONS.children.titleAmharic} ({DIVISIONS.children.ageRangeAmharic})
          </button>
          <button
            onClick={() => setDivisionFilter('intermediates')}
            className={`px-3 py-1 rounded-xl text-xs font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
              divisionFilter === 'intermediates'
                ? 'bg-[#0C4A9E] text-white font-bold'
                : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {DIVISIONS.intermediates.titleAmharic} ({DIVISIONS.intermediates.ageRangeAmharic})
          </button>
          <button
            onClick={() => setDivisionFilter('youth')}
            className={`px-3 py-1 rounded-xl text-xs font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
              divisionFilter === 'youth'
                ? 'bg-[#8B0000] text-white font-bold'
                : 'bg-white dark:bg-[#111D30] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {DIVISIONS.youth.titleAmharic} ({DIVISIONS.youth.ageRangeAmharic})
          </button>
        </div>
      </div>

      {/* 3. Department-Specific Category Filter Pills */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
          <Filter className="w-3.5 h-3.5 text-[#B88500]" />
          <span>
            {departmentFilter === 'ALL'
              ? 'የመዝገብ ዘርፎች ማጣሪያ፦'
              : `የ«${activeDepartmentInfo?.shortTitleAmharic}» ዘርፎች፦`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-[#B88500] text-white font-bold shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-[#B88500]/20'
            }`}
          >
            ሁሉም ዘርፎች
          </button>
          {departmentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === cat.id
                  ? 'bg-[#B88500] text-white font-bold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-[#B88500]/20'
              }`}
            >
              {cat.nameAmharic}
            </button>
          ))}
        </div>
      </div>

      {/* Result counter & active department indication */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-ethiopic">
          የተገኙ ስራዎች: <strong className="text-slate-900 dark:text-slate-100 font-bold">{filteredWorks.length}</strong>
          {departmentFilter !== 'ALL' && activeDepartmentInfo && (
            <span className="ml-1.5 text-[#0C4A9E] dark:text-[#7FAFFF] font-bold">
              (በ«{activeDepartmentInfo.shortTitleAmharic || activeDepartmentInfo.titleAmharic}» ውስጥ)
            </span>
          )}
        </span>

        {(searchQuery ||
          selectedCategoryFilter !== 'ALL' ||
          divisionFilter !== 'ALL' ||
          departmentFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryFilter('ALL');
              setDivisionFilter('ALL');
              setDepartmentFilter('ALL');
            }}
            className="text-xs text-[#8B0000] hover:underline font-medium cursor-pointer"
          >
            ማጣሪያዎችን አጥፋ
          </button>
        )}
      </div>

      {/* Works Results Grid */}
      {filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorks.map((work) => (
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
        <div className="text-center py-16 px-4 rounded-3xl bg-white/50 dark:bg-[#111D30]/50 border border-dashed border-[#B88500]/30 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-[#B88500]/40 mx-auto mb-3" />
          <h3 className="font-serif-ethiopic text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            ምንም የተገኘ ስራ የለም
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-ethiopic mb-4">
            {departmentFilter !== 'ALL'
              ? `በ«${activeDepartmentInfo?.titleAmharic}» ውስጥ የተፈለገው ቃል አልተገኘም። ወደ ሁሉም ክፍላት በመቀየር ይፈልጉ።`
              : 'የተለየ ርዕስ፣ የደራሲ ስም ወይም ማጣሪያዎችን ቀይረው ይሞክሩ።'}
          </p>
          {departmentFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setDepartmentFilter('ALL')}
              className="px-4 py-2 rounded-xl bg-[#0C4A9E] text-white text-xs font-bold hover:bg-[#072958] cursor-pointer"
            >
              በሁሉም ክፍላት ፈልግ
            </button>
          )}
        </div>
      )}

      {/* Quick Work Preview Sheet */}
      <QuickWorkPreviewModal
        isOpen={previewWork !== null}
        work={previewWork}
        onDismiss={() => setPreviewWork(null)}
        onOpenFullDetail={(workId) => {
          setPreviewWork(null);
          onSelectWork(workId);
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
