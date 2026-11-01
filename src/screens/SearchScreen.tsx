import React, { useState, useMemo } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { WorkItem, SundaySchoolDivision, DIVISIONS } from '../types';
import { WorkCard } from '../components/Cards';
import { QuickWorkPreviewModal } from '../components/LiturgicalAudioComponents';
import { Search, SlidersHorizontal, BookOpen, X } from 'lucide-react';

interface SearchScreenProps {
  onSelectWork: (workId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onSelectWork,
  onSelectCategory,
}) => {
  const {
    works,
    categories,
    selectedDivision,
    selectDivision,
    toggleBookmark,
    playWorkAudio,
  } = useArchive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<SundaySchoolDivision | 'ALL'>(selectedDivision);
  const [previewWork, setPreviewWork] = useState<WorkItem | null>(null);

  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      // Division filter
      if (divisionFilter !== 'ALL' && w.division !== divisionFilter) {
        return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'ALL' && w.categoryId !== selectedCategoryFilter) {
        return false;
      }

      // Search query (title, writerName, content, tags, categoryName)
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = w.title.toLowerCase().includes(q);
      const matchAuthor = w.writerName.toLowerCase().includes(q);
      const matchContent = w.content.toLowerCase().includes(q);
      const matchCategory = w.categoryName.toLowerCase().includes(q);
      const matchTags = w.tags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchAuthor || matchContent || matchCategory || matchTags;
    });
  }, [works, searchQuery, divisionFilter, selectedCategoryFilter]);

  return (
    <div className="min-h-full pb-28 md:pb-16 px-4 md:px-8 max-w-6xl mx-auto pt-4">
      {/* Search Input Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="በርዕስ፣ በደራሲ፣ በይዘት ወይም በስነ-ጽሁፍ መለያ ፈልግ..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B88500] text-slate-900 dark:text-slate-100 text-sm md:text-base font-ethiopic"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Division filter pill bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1 flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          ክፍል:
        </span>
        <button
          onClick={() => setDivisionFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-ethiopic font-medium whitespace-nowrap transition-all ${
            divisionFilter === 'ALL'
              ? 'bg-[#0C4A9E] text-white shadow-sm'
              : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#0C4A9E]'
          }`}
        >
          ሁሉም ክፍላት
        </button>
        <button
          onClick={() => setDivisionFilter('children')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-ethiopic font-medium whitespace-nowrap transition-all ${
            divisionFilter === 'children'
              ? 'bg-[#F5B800] text-slate-900 font-bold shadow-sm'
              : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#F5B800]'
          }`}
        >
          {DIVISIONS.children.titleAmharic} ({DIVISIONS.children.ageRangeAmharic})
        </button>
        <button
          onClick={() => setDivisionFilter('intermediates')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-ethiopic font-medium whitespace-nowrap transition-all ${
            divisionFilter === 'intermediates'
              ? 'bg-[#0C4A9E] text-white font-bold shadow-sm'
              : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#0C4A9E]'
          }`}
        >
          {DIVISIONS.intermediates.titleAmharic} ({DIVISIONS.intermediates.ageRangeAmharic})
        </button>
        <button
          onClick={() => setDivisionFilter('youth')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-ethiopic font-medium whitespace-nowrap transition-all ${
            divisionFilter === 'youth'
              ? 'bg-[#8B0000] text-white font-bold shadow-sm'
              : 'bg-white dark:bg-[#111D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#8B0000]'
          }`}
        >
          {DIVISIONS.youth.titleAmharic} ({DIVISIONS.youth.ageRangeAmharic})
        </button>
      </div>

      {/* Category horizontal filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-none mb-6">
        <button
          onClick={() => setSelectedCategoryFilter('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-ethiopic whitespace-nowrap transition-all ${
            selectedCategoryFilter === 'ALL'
              ? 'bg-[#B88500] text-white font-bold shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-[#B88500]/20'
          }`}
        >
          ሁሉም ዘርፎች
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryFilter(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-ethiopic whitespace-nowrap transition-all ${
              selectedCategoryFilter === cat.id
                ? 'bg-[#B88500] text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-[#B88500]/20'
            }`}
          >
            {cat.nameAmharic}
          </button>
        ))}
      </div>

      {/* Result counter & clear button */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-ethiopic">
          የተገኙ ስራዎች: <strong className="text-slate-900 dark:text-slate-100 font-bold">{filteredWorks.length}</strong>
        </span>
        {(searchQuery || selectedCategoryFilter !== 'ALL' || divisionFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryFilter('ALL');
              setDivisionFilter('ALL');
            }}
            className="text-xs text-[#8B0000] hover:underline font-ethiopic"
          >
            ማጣሪያዎችን አጽዳ
          </button>
        )}
      </div>

      {/* Results grid */}
      {filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="text-center py-16 px-4 bg-white/50 dark:bg-[#111D30]/40 rounded-3xl border border-dashed border-[#B88500]/30">
          <BookOpen className="w-12 h-12 mx-auto text-[#B88500]/60 mb-3" />
          <h3 className="font-serif-ethiopic text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            ምንም ስራ አልተገኘም
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-ethiopic max-w-md mx-auto mb-4">
            የተፈለገው ቃል ወይም ማጣሪያ የሚስማማ ስራ በመዝገቡ ውስጥ አልተገኘም። እባክዎ ፍለጋዎን ይቀይሩ ወይም ማጣሪያዎቹን ያጽዱ።
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryFilter('ALL');
              setDivisionFilter('ALL');
            }}
            className="px-4 py-2 bg-[#0C4A9E] text-white text-xs font-semibold rounded-xl"
          >
            ሁሉንም ስራዎች አሳይ
          </button>
        </div>
      )}

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
