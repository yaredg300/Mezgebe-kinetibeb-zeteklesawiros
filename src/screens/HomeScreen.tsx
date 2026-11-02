import React, { useState } from 'react';
import {
  Search,
  Plus,
  Paperclip,
  Mic,
  ArrowUp,
  BookOpen,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { SundaySchoolDivision, WorkItem, DIVISIONS } from '../types';
import { AppHeader } from '../components/AppHeader';
import { ManuscriptBox, HaragDivider, StatusBadge } from '../components/Ornaments';
import { WorkCard, CategoryCard, WriterCard, EventCard } from '../components/Cards';
import { SundaySchoolIdentityDialog } from '../components/SundaySchoolIdentityDialog';
import { QuickWorkPreviewModal } from '../components/LiturgicalAudioComponents';
import { DepartmentSwitcher } from '../components/DepartmentSwitcher';

export const HomeScreen: React.FC<{
  onWorkClick: (workId: string) => void;
  onCategoryClick: (categoryId: string) => void;
  onSearchClick: () => void;
  onCreateWorkClick: () => void;
  onOpenDepartmentsHub?: () => void;
}> = ({
  onWorkClick,
  onCategoryClick,
  onSearchClick,
  onCreateWorkClick,
  onOpenDepartmentsHub,
}) => {
  const {
    works,
    categories,
    writers,
    events,
    selectedDivision,
    selectDivision,
    toggleBookmark,
    playWorkAudio,
  } = useArchive();

  const [showChurchInfo, setShowChurchInfo] = useState<boolean>(false);
  const [previewWork, setPreviewWork] = useState<WorkItem | null>(null);
  const [boardTab, setBoardTab] = useState<'mine' | 'school' | 'drafts'>('mine');

  // Filter works by division
  const divisionWorks = works.filter((w) => w.division === selectedDivision);
  const featuredWorks = divisionWorks.filter((w) => w.isFeatured);
  const recentWorks = [...divisionWorks].reverse().slice(0, 4);

  const activeDivisionInfo = DIVISIONS[selectedDivision];

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      {/* App Header */}
      <AppHeader
        title="መዝገበ ኪነጥበብ"
        subtitle="ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት"
        onOpenChurchInfo={() => setShowChurchInfo(true)}
        onOpenDepartmentsHub={onOpenDepartmentsHub}
        onSearchClick={onSearchClick}
      />

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-5">
        {/* Department Switcher (Kinetibeb vs Ehud Merha Gibir) */}
        <DepartmentSwitcher variant="hero" />

        {/* Hero Sunday School Identity Banner */}
        <ManuscriptBox
          onClick={() => setShowChurchInfo(true)}
          className="p-0 overflow-hidden cursor-pointer"
        >
          <div className="bg-gradient-to-r from-[#072958] via-[#0C4A9E] to-[#072958] text-white p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="p-1 rounded-full bg-white border-2 border-[#F5B800] shrink-0 shadow-lg">
                <img
                  src="/assets/ic_church_logo.jpg"
                  alt="የተክለ ሳዊሮስ ሰንበት ት/ቤት ዓርማ"
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F5B800]/25 text-[#FFD54F] text-xs font-bold mb-1 border border-[#F5B800]/40">
                  ፲፱፻፶፯ • 1957 ዓ.ም.
                </span>

                <h2 className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-white">
                  ተክለ ሳዊሮስ ሰንበት ት/ቤት
                </h2>

                <p className="text-xs text-white/90 font-medium leading-relaxed mt-1">
                  የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
                </p>

                <p className="text-xs text-[#FFD54F] italic font-serif-ethiopic mt-1">
                  «በእግዚአብሔር ቃል የታነጸ፣ በኪነጥበብ የጎለበተ ትውልድ»
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-3 bg-white dark:bg-[#111D30] border-t border-[#B88500]/20 flex items-center justify-around text-center text-xs">
            <div>
              <span className="block text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
                {works.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">የተመዘገቡ ሥራዎች</span>
            </div>
            <span className="text-[#B88500]">•</span>
            <div>
              <span className="block text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
                {categories.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">ምድቦች</span>
            </div>
            <span className="text-[#B88500]">•</span>
            <div>
              <span className="block text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
                {writers.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">ደራስያን</span>
            </div>
          </div>
        </ManuscriptBox>

        {/* Division Branch Floating Island (ሕፃናት | ማዕከላውያን | ወጣት) */}
        <ManuscriptBox className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: activeDivisionInfo.accentColor }}
              />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                የኪነጥበብ ቅርንጫፍ (የዕድሜ እርከን)
              </h3>
            </div>

            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${activeDivisionInfo.accentColor}20`,
                color: activeDivisionInfo.accentColor,
              }}
            >
              {divisionWorks.length} ሥራዎች
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['children', 'intermediates', 'youth'] as SundaySchoolDivision[]).map((div) => {
              const info = DIVISIONS[div];
              const isSelected = selectedDivision === div;
              return (
                <button
                  key={div}
                  onClick={() => selectDivision(div)}
                  className={`p-2.5 rounded-xl border transition-all text-center ${
                    isSelected
                      ? 'border-2 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-[#B88500]/40'
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: info.accentColor,
                          backgroundColor: `${info.accentColor}18`,
                          color: info.accentColor,
                        }
                      : {}
                  }
                >
                  <span className="text-xs sm:text-sm font-bold block">{info.titleAmharic}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {info.ageRangeAmharic}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs font-serif-ethiopic text-[#966C00] dark:text-[#FFD54F] mt-3 italic px-1">
            {activeDivisionInfo.mottoAmharic}
          </p>
        </ManuscriptBox>

        {/* Floating Creation Prompt Capsule */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            ዛሬ ምን መፍጠር ወይም መመዝገብ ይፈልጋሉ?
          </h3>
          <p className="text-xs text-[#966C00] dark:text-[#FFD54F]">
            የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ መዝገብ
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/40 shadow-md">
          <div
            onClick={onSearchClick}
            className="text-xs sm:text-sm text-slate-400 cursor-pointer py-1 px-2"
          >
            የስራውን ርዕስ፣ ግጥም፣ ተውኔት ወይም ዜማ እዚህ ይፈልጉ...
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-[#0C4A9E] dark:text-blue-300 px-2.5 py-1 rounded-md bg-[#0C4A9E]/10">
              የፈጠራ ረቂቅ
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onCreateWorkClick}
                className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="ሰነድ አያይዝ"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={onSearchClick}
                className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="ድምጽ/ዜማ"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={onCreateWorkClick}
                className="w-8 h-8 rounded-full bg-[#0C4A9E] hover:bg-[#072958] text-white flex items-center justify-center shadow-md ml-1"
                title="መዝግብ"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Boards Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {(['mine', 'school', 'drafts'] as const).map((tab) => {
                const label = tab === 'mine' ? 'የእኔ ሥራዎች' : tab === 'school' ? 'የሰንበት ት/ቤት' : 'ረቂቆች';
                const isSelected = boardTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setBoardTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#0C4A9E]/10 text-[#0C4A9E] dark:text-[#7FAFFF]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onSearchClick}
              className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 hover:text-[#0C4A9E]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>ፈልግ...</span>
            </button>
          </div>

          {/* Boards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Add New Work Card */}
            <div
              onClick={onCreateWorkClick}
              className="p-4 rounded-2xl bg-white dark:bg-[#111D30] border-2 border-dashed border-[#B88500]/50 hover:border-[#B88500] shadow-xs flex flex-col items-center justify-center text-center cursor-pointer min-h-[170px] group transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#0C4A9E]/10 text-[#0C4A9E] dark:text-[#7FAFFF] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                አዲስ ሥራ መዝግብ
              </h4>
              <p className="text-[10px] text-[#966C00] dark:text-[#FFD54F] mt-0.5">
                ተውኔት • ግጥም • ዜማ
              </p>
            </div>

            {/* Board item previews */}
            {divisionWorks.slice(0, 3).map((work) => (
              <div
                key={work.id}
                onClick={() => onWorkClick(work.id)}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#111D30] border border-[#B88500]/30 shadow-xs hover:border-[#B88500] cursor-pointer flex flex-col justify-between min-h-[170px] transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {work.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {work.dateAmharic}
                  </p>
                </div>

                {/* Miniature 4-cell preview layout */}
                <div className="grid grid-cols-2 gap-1 my-2 h-16">
                  <div className="rounded-lg bg-[#0C4A9E]/10 flex items-center justify-center text-[10px] font-bold text-[#0C4A9E] dark:text-blue-300">
                    {work.categoryName.slice(0, 2)}
                  </div>
                  <div className="space-y-1">
                    <div className="h-7 rounded bg-[#B88500]/15" />
                    <div className="h-7 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#966C00] dark:text-[#FFD54F] font-medium truncate max-w-[70px]">
                    {work.writerName}
                  </span>
                  <StatusBadge status={work.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1. Featured Works Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-4 rounded-sm bg-[#B88500]" />
            <h3 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
              ተመራጭ ሥራዎች
            </h3>
            <span className="text-xs text-slate-500">
              (የ«{activeDivisionInfo.titleAmharic}» ክፍል)
            </span>
          </div>

          {featuredWorks.length === 0 ? (
            <ManuscriptBox className="p-6 text-center text-slate-500">
              <p className="text-xs">በዚህ ክፍል እስካሁን ተመራጭ ሥራ አልተመደበም።</p>
              <button
                onClick={onCreateWorkClick}
                className="mt-2 text-xs font-bold text-[#B88500] hover:underline"
              >
                ለዚህ ክፍል አዲስ ስራ አቅርብ +
              </button>
            </ManuscriptBox>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {featuredWorks.map((work) => (
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

        {/* 2. Art Categories Preview */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-4 rounded-sm bg-[#B88500]" />
            <h3 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
              የኪነጥበብ ምድቦች
            </h3>
            <span className="text-xs text-slate-500">በዘርፍ የተከፋፈሉ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.slice(0, 4).map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onClick={() => onCategoryClick(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* 3. Recently Added Works */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-4 rounded-sm bg-[#B88500]" />
            <h3 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
              አዲስ የተጨመሩ
            </h3>
            <span className="text-xs text-slate-500">በቅርቡ ወደ መዝገቡ የገቡ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentWorks.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                onClick={() => onWorkClick(work.id)}
                onBookmarkClick={() => toggleBookmark(work.id)}
                onQuickPreviewClick={() => setPreviewWork(work)}
              />
            ))}
          </div>
        </div>

        {/* 4. Featured Writers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-4 rounded-sm bg-[#B88500]" />
            <h3 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
              ተመራጭ ደራሲያን
            </h3>
            <span className="text-xs text-slate-500">ለሰንበት ት/ቤቱ ያበረከቱ</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {writers.map((writer) => (
              <WriterCard key={writer.id} writer={writer} />
            ))}
          </div>
        </div>

        {/* 5. Upcoming Events */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-4 rounded-sm bg-[#B88500]" />
            <h3 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
              የሚመጡ ዝግጅቶች
            </h3>
            <span className="text-xs text-slate-500">የኪነጥበብ ምሽቶችና ጉባኤዎች</span>
          </div>

          <div className="space-y-3">
            {events.slice(0, 2).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={onCreateWorkClick}
        className="fixed bottom-24 right-5 z-30 px-4 py-3 rounded-full bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xl active:scale-95 transition-transform"
        title="ስራ አቅርብ"
      >
        <Plus className="w-5 h-5" />
        <span>ስራ አቅርብ</span>
      </button>

      {/* Church Info Modal */}
      <SundaySchoolIdentityDialog
        isOpen={showChurchInfo}
        onClose={() => setShowChurchInfo(false)}
      />

      {/* Quick Work Preview Sheet */}
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
