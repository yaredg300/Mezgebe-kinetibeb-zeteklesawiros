import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { SundayPlanPdfPackage } from '../types';
import { ManuscriptBox, HaragDivider } from './Ornaments';

interface SundayPlanPdfViewerModalProps {
  packageData: SundayPlanPdfPackage | null;
  onClose: () => void;
}

export const SundayPlanPdfViewerModal: React.FC<SundayPlanPdfViewerModalProps> = ({
  packageData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'outline'>('preview');

  if (!packageData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#111D30] rounded-2xl shadow-2xl border-2 border-[#B88500]/50 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#072958] via-[#0C4A9E] to-[#072958] text-white p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-[#F5B800]/40 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/10 border border-[#F5B800]/40 shrink-0 text-[#FFD54F]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD54F] text-[#072958]">
                  {packageData.yearAmharic}
                </span>
                <span className="text-xs text-white/80 font-serif-ethiopic">
                  {packageData.division === 'youth'
                    ? 'የወጣት ክፍል'
                    : packageData.division === 'children'
                    ? 'የሕፃናት ክፍል'
                    : 'የማዕከላውያን ክፍል'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-serif-ethiopic text-white leading-snug">
                {packageData.title}
              </h2>
              <p className="text-xs text-white/80 mt-0.5">{packageData.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            title="ዝጋ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'preview'
                  ? 'bg-[#0C4A9E] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              ሰነዱን አንብብ (Viewer)
            </button>
            <button
              onClick={() => setActiveTab('outline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'outline'
                  ? 'bg-[#0C4A9E] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              የይዘት ማውጫ ({packageData.sections.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={packageData.filePath}
              download={packageData.fileName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B88500] hover:bg-[#966C00] text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>አውርድ (PDF)</span>
            </a>
            <a
              href={packageData.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              title="በአዲስ መስኮት ክፈት"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'preview' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
                <p>
                  <strong>ማሳሰቢያ፦</strong> ይህ ሰነድ በሰንበት ት/ቤቱ የተዘጋጀው ኦፊሴላዊ የ2019 ዓ.ም. የዕቅድ ጥቅል ነው። ከታች ባለው መስኮት ማንበብ ወይም በቀጥታ ማውረድ ይችላሉ።
                </p>
              </div>

              {/* PDF Preview Frame */}
              <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                <iframe
                  src={`${packageData.filePath}#toolbar=1&navpanes=0`}
                  title={packageData.title}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ManuscriptBox className="p-4">
                <h3 className="text-sm font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF] mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  ስለ ሰነዱ አጠቃላይ መረጃ
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  {packageData.description}
                </p>
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                  <strong>ወሰንና ሽፋን፦</strong> {packageData.scopeSummary}
                </div>
              </ManuscriptBox>

              <HaragDivider />

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  የዕቅድ ጥቅሉ ዋና ዋና ክፍሎች
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {packageData.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-[#1A2638] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs hover:border-[#0C4A9E] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#0C4A9E]/10 text-[#0C4A9E] dark:text-[#7FAFFF] text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {section.title}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                        ገጽ {section.pageNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-serif-ethiopic">
            የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት • የእሁድ መርሃ ግብር ክፍል
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            ዝጋ
          </button>
        </div>
      </div>
    </div>
  );
};
