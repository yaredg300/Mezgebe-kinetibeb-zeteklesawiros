import React, { useState } from 'react';
import { Search, Sparkles, FileText } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { AppHeader } from '../components/AppHeader';
import { ManuscriptBox, HaragDivider } from '../components/Ornaments';
import { CategoryCard } from '../components/Cards';

export const ArchiveScreen: React.FC<{
  onCategoryClick: (categoryId: string) => void;
  onSearchClick: () => void;
  onCreateWorkClick: () => void;
}> = ({ onCategoryClick, onSearchClick, onCreateWorkClick }) => {
  const { categories, works } = useArchive();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.nameAmharic.toLowerCase().includes(q) ||
      cat.nameEnglish.toLowerCase().includes(q) ||
      cat.descriptionAmharic.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      <AppHeader
        title="መዝገብ"
        subtitle="የተክለ ሣዊሮስ ኪነጥበብ ቅርሶች እና ሰነዶች"
        onSearchClick={onSearchClick}
      />

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Search input in archive */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="የመዝገብ ምድቦችን ፈልግ..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500] shadow-xs"
          />
        </div>

        {/* Archival Philosophy Banner */}
        <ManuscriptBox className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1 text-[#0C4A9E] dark:text-[#7FAFFF]">
            <Sparkles className="w-4 h-4 text-[#B88500]" />
            <h3 className="text-sm font-bold font-serif-ethiopic">
              የኪነጥበብ መዝገብ ቤት ፍልስፍና
            </h3>
          </div>

          <p className="text-xs font-bold text-[#B88500] dark:text-[#FFD54F] mt-1">
            ፍጠር → ጠብቅ → ገምግም → አጽድቅ → አትም → አስታውስ
          </p>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2 font-serif-ethiopic">
            እያንዳንዱ የፈጠራ ስራ የሰንበት ትምህርት ቤቱን መንፈሳዊ ታሪክ የሚያበለጽግ የትውልድ አሻራ ነው። በመዝገቡ ውስጥ የተካተቱ ሥራዎች በሙሉ በቤተክርስቲያን ኃላፊዎች ቁጥጥርና ፈቃድ የተመዘገቡ ናቸው።
          </p>
        </ManuscriptBox>

        {/* PDF & Document Documentation Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-[#0C4A9E]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0C4A9E] text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                የሰነዶችና የ PDF ቋሚ ቅጂ
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                እያንዳንዱ ሥራ በቤተክርስቲያን ጥበባዊ ማህተም የተረጋገጠ PDF ቅጂ አለው።
              </p>
            </div>
          </div>

          <button
            onClick={onCreateWorkClick}
            className="px-4 py-2 rounded-xl bg-[#0C4A9E] text-white text-xs font-bold hover:bg-[#072958] shrink-0 shadow-sm"
          >
            አዲስ ሰነድ መዝግብ +
          </button>
        </div>

        {/* Categories Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
              የኪነጥበብ ምድቦች ({filteredCategories.length})
            </h3>
            <span className="text-xs text-slate-500">
              ጠቅላላ {works.length} የተመዘገቡ ሥራዎች
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => onCategoryClick(category.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
