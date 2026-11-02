import React, { useState, useEffect } from 'react';
import {
  Volume2,
  FileDown,
  Printer,
  Bookmark,
  Share2,
  Type,
  CheckCircle2,
  Sparkles,
  Edit3,
  AlertCircle,
  X,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { PARCHMENT_PALETTES, ParchmentPaletteId } from '../types';
import { AppHeader } from '../components/AppHeader';
import { ManuscriptBox, HaragDivider, StatusBadge, ReadingProgressHairline, AudioWaveformVisualizer } from '../components/Ornaments';
import { downloadWorkPdf, printWorkArchivalDocument } from '../utils/pdfExport';

export const WorkDetailScreen: React.FC<{
  workId: string;
  onBackClick: () => void;
  onEditWork?: (workId: string) => void;
}> = ({ workId, onBackClick, onEditWork }) => {
  const { works, currentUser, toggleBookmark, playWorkAudio, isAudioPlaying, currentAudioTrack, toggleAudioPlayPause } = useArchive();

  const work = works.find((w) => w.id === workId) || works[0];

  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);
  const [selectedPaletteId, setSelectedPaletteId] = useState<ParchmentPaletteId>('classic');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const selectedPalette = PARCHMENT_PALETTES.find((p) => p.id === selectedPaletteId) || PARCHMENT_PALETTES[0];
  const isThisWorkAudioPlaying = isAudioPlaying && currentAudioTrack?.id === `trk_${work.id}`;

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
      } else {
        const currentProgress = window.scrollY / totalScroll;
        setScrollProgress(Math.min(1, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadPdf = () => {
    try {
      const filename = downloadWorkPdf(work);
      setDownloadSuccessMessage(`የ PDF ሰነዱ በተሳካ ሁኔታ ወርዷል፦ ${filename}`);
      setTimeout(() => {
        setDownloadSuccessMessage(null);
      }, 5000);
    } catch (e: any) {
      setDownloadSuccessMessage(`ፒዲኤፍ ማውረድ አልተቻለም፦ ${e?.message || e}`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: work.title,
        text: `${work.title} - ${work.writerName} (ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ መዝገብ)`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setDownloadSuccessMessage('የሥራው አገናኝ (Link) ተገልብጧል!');
      setTimeout(() => setDownloadSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-16 bg-[#F9FAFD] dark:bg-[#0B1320] transition-colors">
      {/* Dynamic Reading Progress Hairline */}
      <ReadingProgressHairline progressFraction={scrollProgress} />

      {/* Header */}
      <AppHeader
        title={work.title}
        subtitle={`${work.categoryName} • ${work.writerName}`}
        showBack={true}
        onBackClick={onBackClick}
        actions={
          <div className="flex items-center gap-1">
            {/* Audio Recitation button */}
            <button
              onClick={() => {
                if (isThisWorkAudioPlaying) {
                  toggleAudioPlayPause();
                } else {
                  playWorkAudio(work);
                }
              }}
              className={`p-2 rounded-xl transition-colors ${
                isThisWorkAudioPlaying
                  ? 'text-[#B88500] bg-[#B88500]/15'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="በድምፅ አድምጥ"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Direct Download PDF */}
            <button
              onClick={handleDownloadPdf}
              className="p-2 rounded-xl text-[#8B0000] dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="PDF አውርድ"
            >
              <FileDown className="w-5 h-5" />
            </button>

            {/* Font size toggle */}
            <button
              onClick={() => {
                setFontSizeMultiplier((prev) => (prev >= 1.3 ? 1 : prev + 0.15));
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="የፊደል መጠን"
            >
              <Type className="w-5 h-5" />
            </button>

            {/* Edit work button if author or admin */}
            {onEditWork &&
              (currentUser.role === 'ADMIN' ||
                currentUser.role === 'SUPER_ADMIN' ||
                currentUser.id === work.writerId ||
                work.status === 'REVISION_REQUESTED') && (
                <button
                  onClick={() => onEditWork(work.id)}
                  className="p-2 rounded-xl text-[#0C4A9E] dark:text-[#7FAFFF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="ስራውን አሻሽል (Edit Work)"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}

            {/* Bookmark */}
            <button
              onClick={() => toggleBookmark(work.id)}
              className={`p-2 rounded-xl transition-colors ${
                work.isBookmarked
                  ? 'text-[#B88500]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="ዕልባት"
            >
              <Bookmark className={`w-5 h-5 ${work.isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="አጋራ"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* Toast Notification */}
      {downloadSuccessMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0C4A9E] text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FFD54F]" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Reviewer Feedback / Revision Request Card */}
        {work.reviewerFeedback && (
          <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  የገምጋሚ ማስታወሻ / የተጠየቀ ማሻሻያ፦
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {work.reviewerFeedback}
                </p>
              </div>
            </div>
            {onEditWork && (
              <button
                onClick={() => onEditWork(work.id)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ስራውን አሻሽል</span>
              </button>
            )}
          </div>
        )}
        {/* Manuscript Cover Header Card */}
        <ManuscriptBox className="p-6 sm:p-8 text-center" showCornerFlourish={true}>
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#B88500]/15 text-[#966C00] dark:text-[#FFD54F]">
              {work.categoryName}
            </span>
            <StatusBadge status={work.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] leading-tight">
            {work.title}
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 mt-2">
            ደራሲ፦ {work.writerName}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            የተጻፈበት ቀን፦ {work.dateAmharic} • የንባብ ቆይታ፦ {work.readTime}
          </p>

          <HaragDivider className="my-4" height={16} />
        </ManuscriptBox>

        {/* Official Archival Certification Seal Card (if approved) */}
        {work.approvedBy && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-500/40 flex items-center gap-3.5 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold font-serif-ethiopic text-xs border-2 border-emerald-300">
              የጸደቀ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  በሰንበት ትምህርት ቤቱ የጸደቀ ቋሚ መዝገብ
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                ያረጋገጡት፦ <strong>{work.approvedBy}</strong> ({work.approvedDate || '፳፻፲፮ ዓ.ም'})
              </p>
              <span className="text-[10px] font-bold text-[#B88500] dark:text-[#FFD54F]">
                እትም/Version: v{work.version}
              </span>
            </div>
          </div>
        )}

        {/* Parchment Palette Switcher & Audio Live Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            የብራና ገጽታ፦
          </span>

          <div className="flex items-center gap-1.5">
            {PARCHMENT_PALETTES.map((palette) => {
              const isSelected = selectedPaletteId === palette.id;
              return (
                <button
                  key={palette.id}
                  onClick={() => setSelectedPaletteId(palette.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                    palette.bgClass
                  } ${palette.textClass} ${
                    isSelected ? 'ring-2 ring-[#B88500] scale-105' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {palette.nameAmharic}
                </button>
              );
            })}
          </div>
        </div>

        {/* Manuscript Reading Body with Selected Parchment Palette */}
        <div
          className={`p-6 sm:p-10 rounded-3xl border shadow-md transition-colors duration-200 ${selectedPalette.bgClass} ${selectedPalette.textClass} ${selectedPalette.borderClass}`}
        >
          {/* Opening decorative flourish */}
          <div className="text-center text-sm tracking-widest text-[#B88500] mb-4">
            ✤ ✤ ✤
          </div>

          {/* Audio playing banner if active */}
          {isThisWorkAudioPlaying && (
            <div className="mb-6 p-2.5 rounded-xl bg-[#B88500]/15 flex items-center justify-center gap-2 text-xs font-bold text-[#966C00] dark:text-[#FFD54F]">
              <AudioWaveformVisualizer isPlaying={true} barColor="#966C00" />
              <span>በድምፅ በመደመጥ ላይ ይገኛል...</span>
            </div>
          )}

          {/* Actual content with font scale */}
          <div
            className="font-serif-ethiopic whitespace-pre-wrap leading-relaxed tracking-wide select-text"
            style={{
              fontSize: `${1.1 * fontSizeMultiplier}rem`,
              lineHeight: `${1.85 * fontSizeMultiplier}`,
            }}
          >
            {work.content}
          </div>

          <HaragDivider className="my-8" height={16} />

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">መለያዎች፦</span>
            {work.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-black/5 dark:bg-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Archival PDF Document Download Card (CRITICAL FEATURE) */}
        <ManuscriptBox className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FileDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                  የሰነዱ ቋሚ የ PDF ቅጂ (Archival PDF)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  የተክለ ሣዊሮስ ሰንበት ት/ቤት ጥበባዊ ማህተም እና ይዘት ያለው የ PDF ሰነድ ያውርዱ
                </p>
                {work.hasPdfAttachment && work.pdfFileName && (
                  <p className="text-[11px] font-bold text-[#B88500] mt-1">
                    የተያያዘ ሰነድ፦ {work.pdfFileName} ({work.pdfFileSize || 'PDF'})
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {work.pdfUrl && (
                <a
                  href={work.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-[#966C00] dark:text-[#FFD54F] border border-[#B88500]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  title="በ Google Cloud Storage የተቀመጠውን የመጀመሪያ ፋይል ይመልከቱ"
                >
                  <FileDown className="w-4 h-4 text-[#B88500]" />
                  <span>Cloud Storage ፋይል</span>
                </a>
              )}

              <button
                onClick={handleDownloadPdf}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#5E0000] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>PDF አውርድ</span>
              </button>

              <button
                onClick={() => printWorkArchivalDocument(work)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="አትም (Print)"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">አትም</span>
              </button>
            </div>
          </div>
        </ManuscriptBox>

        {/* Institutional Archive Footnote */}
        <div className="text-center py-6 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
            ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል ዲጂታል መዝገብ
          </p>
          <p>ሁሉም የፈጠራ ስራዎች በቅጂ መብትና በቤተክርስቲያን መዝገብ የተጠበቁ ናቸው።</p>
        </div>
      </div>
    </div>
  );
};
