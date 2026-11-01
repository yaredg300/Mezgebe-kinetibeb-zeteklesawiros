import React from 'react';
import {
  Bookmark,
  FileText,
  Clock,
  Eye,
  Calendar,
  MapPin,
  CheckCircle2,
  BookOpen,
  Clapperboard,
  Mic,
  Scroll,
  Palette,
  Camera,
  Video,
  History,
  FolderArchive,
} from 'lucide-react';
import { WorkItem, WorkCategory, Writer, CulturalEvent, DIVISIONS } from '../types';
import { ManuscriptBox, StatusBadge } from './Ornaments';

const CATEGORY_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  FileText,
  Clapperboard,
  Mic,
  Scroll,
  Palette,
  Camera,
  Video,
  History,
  FolderArchive,
};

export const WorkCard: React.FC<{
  work: WorkItem;
  onClick: () => void;
  onBookmarkClick: () => void;
  onQuickPreviewClick: () => void;
}> = ({ work, onClick, onBookmarkClick, onQuickPreviewClick }) => {
  const divisionInfo = DIVISIONS[work.division];

  return (
    <ManuscriptBox
      onClick={onClick}
      className="p-4 sm:p-5 hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-full"
    >
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#B88500]/15 text-[#966C00] dark:text-[#FFD54F]">
              {work.categoryName}
            </span>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
              style={{ backgroundColor: divisionInfo.accentColor }}
            >
              {divisionInfo.titleAmharic}
            </span>
            <StatusBadge status={work.status} />
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onQuickPreviewClick}
              className="p-1.5 rounded-full text-slate-400 hover:text-[#0C4A9E] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="ፈጣን ቅድመ-ዕይታ"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onBookmarkClick}
              className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                work.isBookmarked ? 'text-[#B88500]' : 'text-slate-400'
              }`}
              title="ዕልባት"
            >
              <Bookmark className={`w-4 h-4 ${work.isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 group-hover:text-[#0C4A9E] dark:group-hover:text-[#7FAFFF] transition-colors leading-snug">
          {work.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed font-serif-ethiopic">
          {work.excerpt}
        </p>

        {/* PDF indicator if attached */}
        {work.hasPdfAttachment && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-[10px] font-bold text-rose-700 dark:text-rose-400">
            <FileText className="w-3 h-3" />
            <span>PDF ሰነድ አለው</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium truncate max-w-[140px] text-slate-700 dark:text-slate-300">
          ✍️ {work.writerName}
        </span>
        <div className="flex items-center gap-2 text-[11px] shrink-0">
          <span>{work.dateAmharic}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {work.readTime}
          </span>
        </div>
      </div>
    </ManuscriptBox>
  );
};

export const CategoryCard: React.FC<{
  category: WorkCategory;
  onClick: () => void;
}> = ({ category, onClick }) => {
  const IconComponent = CATEGORY_ICON_MAP[category.iconName] || BookOpen;

  return (
    <ManuscriptBox
      onClick={onClick}
      className="p-4 sm:p-5 hover:translate-y-[-2px] transition-all group flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#0C4A9E]/10 dark:bg-blue-950/50 border border-[#0C4A9E]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-[#0C4A9E] dark:text-[#7FAFFF]">
        <IconComponent className="w-6 h-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100 group-hover:text-[#0C4A9E] dark:group-hover:text-[#7FAFFF] transition-colors">
            {category.nameAmharic}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#B88500]/15 text-[#966C00] dark:text-[#FFD54F] shrink-0">
            {category.workCount} ሥራዎች
          </span>
        </div>

        <p className="text-xs text-[#B88500] dark:text-[#FFD54F] font-medium mt-0.5">
          {category.nameEnglish}
        </p>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {category.descriptionAmharic}
        </p>
      </div>
    </ManuscriptBox>
  );
};

export const WriterCard: React.FC<{
  writer: Writer;
}> = ({ writer }) => {
  return (
    <ManuscriptBox className="p-4 w-64 shrink-0 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#B88500]/20 border-2 border-[#B88500] flex items-center justify-center font-serif-ethiopic font-bold text-lg text-[#0C4A9E] dark:text-[#7FAFFF]">
            {writer.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {writer.name}
              </h4>
              {writer.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
            </div>
            <p className="text-xs text-[#966C00] dark:text-[#FFD54F] truncate font-medium">
              {writer.roleTitle}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
          {writer.bio}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
        {writer.totalWorks} የተመዘገቡ ሥራዎች
      </div>
    </ManuscriptBox>
  );
};

export const EventCard: React.FC<{
  event: CulturalEvent;
  onClick?: () => void;
}> = ({ event, onClick }) => {
  const recurrenceBadge =
    event.recurrence === 'WEEKLY'
      ? { label: 'ሳምንታዊ', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400' }
      : event.recurrence === 'MONTHLY'
      ? { label: 'ወርሃዊ', colorClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400' }
      : { label: 'ዓመታዊ', colorClass: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400' };

  return (
    <ManuscriptBox
      onClick={onClick}
      className="p-4 sm:p-5 hover:translate-y-[-2px] transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${recurrenceBadge.colorClass}`}>
            ● {recurrenceBadge.label} መርሐ-ግብር
          </span>
          <span className="text-xs font-bold text-[#0C4A9E] dark:text-blue-300">
            {event.category}
          </span>
        </div>

        <h3 className="text-base font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
          {event.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#B88500]" />
            {event.dateAmharic}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#B88500]" />
            {event.location}
          </span>
        </div>

        <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
          {event.assignments.length} የተመደቡ ሥራዎች
        </span>
      </div>
    </ManuscriptBox>
  );
};
