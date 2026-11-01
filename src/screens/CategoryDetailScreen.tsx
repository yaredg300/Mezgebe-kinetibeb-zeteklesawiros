import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { SundaySchoolDivision, WorkItem, DIVISIONS } from '../types';
import { AppHeader } from '../components/AppHeader';
import { ManuscriptBox, HaragDivider } from '../components/Ornaments';
import { WorkCard } from '../components/Cards';
import { QuickWorkPreviewModal } from '../components/LiturgicalAudioComponents';

export const CategoryDetailScreen: React.FC<{
  categoryId: string;
  onWorkClick: (workId: string) => void;
  onBackClick: () => void;
}> = ({ categoryId, onWorkClick, onBackClick }) => {
  const { categories, works, selectedDivision, toggleBookmark, playWorkAudio } = useArchive();

  const category = categories.find((c) => c.id === categoryId) || categories[0];
  const [selectedDivFilter, setSelectedDivFilter] = useState<SundaySchoolDivision | 'all'>(selectedDivision);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterApprovedOnly, setFilterApprovedOnly] = useState<boolean>(false);
  const [previewWork, setPreviewWork] = useState<WorkItem | null>(null);

  const categoryWorks = works.filter((w) => w.categoryId === category.id);

  const filteredWorks = categoryWorks.filter((work) => {
    const matchesDiv = selectedDivFilter === 'all' || work.division === selectedDivFilter;
    const matchesApproved = !filterApprovedOnly || work.approvedBy !== null;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery.trim() ||
      work.title.toLowerCase().includes(q) ||
      work.writerName.toLowerCase().includes(q) ||
      work.content.toLowerCase().includes(q) ||
      work.tags.some((t) => t.toLowerCase().includes(q));

    return matchesDiv && matchesApproved && matchesQuery;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      <AppHeader
        title={category.nameAmharic}
        subtitle={category.nameEnglish}
        showBack={true}
        onBackClick={onBackClick}
      />

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Category Header Banner with artwork */}
        <ManuscriptBox className="overflow-hidden p-0">
          <div className="relative h-36 sm:h-44 bg-slate-900">
            <img
              src="/assets/img_manuscript_hero.jpg"
              alt={category.nameAmharic}
              className="w-full h-full object-cover opacity-60"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5">
              <span className="text-xs font-bold text-[#FFD54F]">
                የኪነጥበብ ዘርፍ መዝገብ
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-ethiopic text-white">
                {category.nameAmharic}
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif-ethiopic">
              {category.descriptionAmharic}
            </p>
          </div>
        </ManuscriptBox>

        {/* Division Filters & Search */}
        <div className="space-y-2.5">
          {/* Division Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedDivFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                selectedDivFilter === 'all'
                  ? 'bg-[#0C4A9E] text-white border-[#0C4A9E]'
                  : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              ሁሉም ክፍሎች
            </button>

            {(['children', 'intermediates', 'youth'] as SundaySchoolDivision[]).map((div) => {
              const info = DIVISIONS[div];
              const isSelected = selectedDivFilter === div;
              return (
                <button
                  key={div}
                  onClick={() => setSelectedDivFilter(div)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                    isSelected
                      ? 'text-white border-transparent'
                      : 'bg-white dark:bg-[#111D30] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  style={isSelected ? { backgroundColor: info.accentColor } : {}}
                >
                  {info.titleAmharic} ({info.ageRangeAmharic})
                </button>
              );
            })}
          </div>

          {/* Search bar & filter checkbox */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`በ${category.nameAmharic} ውስጥ ፈልግ...`}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 px-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterApprovedOnly}
                onChange={(e) => setFilterApprovedOnly(e.target.checked)}
                className="rounded accent-[#0C4A9E]"
              />
              <span>የጸደቁ ብቻ (Approved Only)</span>
            </label>
          </div>
        </div>

        {/* Works List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>የተገኙ ሥራዎች፦ {filteredWorks.length}</span>
            <span>በምድቡ ጠቅላላ፦ {categoryWorks.length}</span>
          </div>

          {filteredWorks.length === 0 ? (
            <ManuscriptBox className="p-8 text-center text-slate-500">
              <p className="text-sm">በዚህ ማጣሪያ የተገኘ ሥራ የለም።</p>
              <button
                onClick={() => {
                  setSelectedDivFilter('all');
                  setSearchQuery('');
                  setFilterApprovedOnly(false);
                }}
                className="mt-2 text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] hover:underline"
              >
                ሁሉንም አሳይ
              </button>
            </ManuscriptBox>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredWorks.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  onClick={() => onWorkClick(work.id)}
                  onBookmarkClick={() => toggleBookmark(work.id)}
                  onQuickPreviewClick={() => setPreviewWork(work)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickWorkPreviewModal
        isOpen={previewWork !== null}
        work={previewWork}
        onDismiss={() => setPreviewWork(null)}
        onOpenFullDetail={(workId) => {
          setPreviewWork(null);
          onWorkClick(workId);
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
