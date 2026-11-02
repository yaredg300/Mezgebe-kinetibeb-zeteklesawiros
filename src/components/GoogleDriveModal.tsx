import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  RefreshCw,
  FolderSync,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { WorkItem } from '../types';
import {
  listGoogleDriveFiles,
  uploadWorkToGoogleDrive,
  readGoogleDriveFileText,
  GoogleDriveFile,
} from '../utils/googleDrive';
import { generateArchivalPdf } from '../utils/pdfExport';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWork?: WorkItem | null;
  onImportComplete?: (newWork: WorkItem) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  targetWork,
  onImportComplete,
}) => {
  const {
    googleAccessToken,
    isGoogleDriveConnected,
    connectGoogleDrive,
    disconnectGoogleDrive,
    submitNewWork,
    activeDepartment,
    departmentsList,
  } = useArchive();

  const [activeTab, setActiveTab] = useState<'upload' | 'browse'>(targetWork ? 'upload' : 'browse');
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadedLink, setUploadedLink] = useState<string | null>(null);

  // Destructive / Mutating operation confirmation state (MANDATORY per Workspace Skill)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (isOpen && isGoogleDriveConnected && googleAccessToken) {
      handleFetchFiles();
    }
  }, [isOpen, isGoogleDriveConnected, googleAccessToken]);

  if (!isOpen) return null;

  const handleFetchFiles = async () => {
    if (!googleAccessToken) return;
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const files = await listGoogleDriveFiles(googleAccessToken);
      setDriveFiles(files);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'ፋይሎችን ከ Google Drive ማንበብ አልተቻለም' });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleConnect = async () => {
    setStatusMessage(null);
    try {
      await connectGoogleDrive();
      setStatusMessage({ type: 'success', text: 'Google Drive በተሳካ ሁኔታ ተገናኝቷል!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'ከ Google Drive ጋር መገናኘት አልተቻለም' });
    }
  };

  const handleUploadWork = () => {
    if (!targetWork || !googleAccessToken) return;

    // Trigger mandatory explicit user confirmation dialog
    setConfirmModal({
      isOpen: true,
      title: 'ወደ Google Drive ቋሚ መዝገብ አስቀምጥ?',
      description: `«${targetWork.title}» የተሰኘው ሰነድ በ Google Drive ውስጥ በሚገኘው «መዝገበ ኪነጥበብ - ተክለ ሣዊሮስ» አቃፊ ውስጥ ይቀመጣል።`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsUploading(true);
        setStatusMessage(null);
        try {
          // Generate PDF blob
          let pdfBlob: Blob | undefined;
          try {
            const { doc } = generateArchivalPdf(targetWork);
            pdfBlob = doc.output('blob');
          } catch {
            // fallback to text
          }

          const result = await uploadWorkToGoogleDrive(targetWork, googleAccessToken, pdfBlob);
          setUploadedLink(result.webViewLink || null);
          setStatusMessage({
            type: 'success',
            text: `«${targetWork.title}» ወደ Google Drive በተሳካ ሁኔታ ተልኳል!`,
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err?.message || 'ወደ Google Drive መላክ አልተቻለም' });
        } finally {
          setIsUploading(false);
        }
      },
    });
  };

  const handleImportFile = (file: GoogleDriveFile) => {
    if (!googleAccessToken) return;

    setConfirmModal({
      isOpen: true,
      title: 'ፋይሉን ወደ ቤተክርስቲያኑ መዝገብ አስመጣ?',
      description: `«${file.name}» የተሰኘው የ Google Drive ፋይል ይዘት ተነቦ ወደ ${
        departmentsList.find((d) => d.id === activeDepartment)?.titleAmharic || 'የኪነጥበብ ክፍል'
      } መዝገብ ውስጥ እንደ አዲስ ረቂቅ ሥራ ይመዘገባል።`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsImporting(true);
        setStatusMessage(null);
        try {
          const text = await readGoogleDriveFileText(file.id, file.mimeType, googleAccessToken);
          const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          const newWork = await submitNewWork({
            title: cleanTitle,
            categoryId: 'literature',
            content: text.trim() || 'ይዘት ከ Google Drive ተመሳክሯል...',
            excerpt: text.slice(0, 100).trim() || 'ከ Google Drive የተመጣ ሰነድ',
            tags: ['GoogleDrive', 'ሰነድ', 'ማህደር'],
            writerName: 'የ Google Drive ሰነድ',
            departmentId: activeDepartment,
          });

          setStatusMessage({
            type: 'success',
            text: `«${cleanTitle}» ወደ መዝገቡ ገብቷል!`,
          });

          if (onImportComplete) {
            onImportComplete(newWork);
          }
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err?.message || 'ፋይሉን ማስመጣት አልተቻለም' });
        } finally {
          setIsImporting(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
                Google Drive ማህደር ማገናኛ
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                የተክለ ሣዊሮስ ሰንበት ት/ቤት ሰነዶች ማመሳከሪያና ምትኬ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
            {uploadedLink && (
              <a
                href={uploadedLink}
                target="_blank"
                rel="noreferrer"
                className="underline flex items-center gap-1 hover:opacity-80"
              >
                በ Drive ክፈት
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Content body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {/* Connection state banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isGoogleDriveConnected ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isGoogleDriveConnected ? 'Google Drive ተገናኝቷል' : 'Google Drive አልተገናኘም'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isGoogleDriveConnected
                  ? 'የተክለ ሣዊሮስ ሰነዶችን ወደ Drive ማስቀመጥና ከዚያም ማስመጣት ይችላሉ።'
                  : 'ሥራዎችን በቀጥታ ወደ Drive ለመላክ ወይም ፋይሎችን ለማስመጣት መለያዎን ያገናኙ።'}
              </p>
            </div>

            {isGoogleDriveConnected ? (
              <button
                type="button"
                onClick={disconnectGoogleDrive}
                className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                ግንኙነት አቋርጥ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="px-4 py-2 rounded-xl bg-[#0C4A9E] text-white text-xs font-bold shadow-md hover:bg-[#072958] flex items-center gap-2"
              >
                <HardDrive className="w-4 h-4" />
                <span>Google Drive አገናኝ</span>
              </button>
            )}
          </div>

          {isGoogleDriveConnected && (
            <>
              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                {targetWork && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'upload'
                        ? 'bg-[#0C4A9E] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>ይህንን ሥራ ወደ Drive አስቀምጥ</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'browse'
                      ? 'bg-[#0C4A9E] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>ከ Google Drive ፋይሎችን አስስና አስመጣ</span>
                </button>
              </div>

              {/* Tab 1: Upload targeted work */}
              {activeTab === 'upload' && targetWork && (
                <div className="p-4 rounded-xl border border-[#B88500]/30 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#B88500]/20 text-[#B88500] shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {targetWork.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {targetWork.categoryName} • {targetWork.writerName} • {targetWork.dateAmharic}
                      </p>
                      <p className="text-[11px] text-[#B88500] mt-1 font-serif-ethiopic">
                        ወደ «መዝገበ ኪነጥበብ - ተክለ ሣዊሮስ» ቋሚ አቃፊ እንደ PDF እና የጽሑፍ ሰነድ ይቀመጣል።
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleUploadWork}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B88500] to-[#0C4A9E] text-white font-bold text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploading ? 'በመላክ ላይ...' : 'አሁን ወደ Google Drive አስቀምጥ'}</span>
                  </button>
                </div>
              )}

              {/* Tab 2: Browse & Import from Drive */}
              {activeTab === 'browse' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      በ Google Drive ውስጥ የተገኙ ፋይሎች ({driveFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleFetchFiles}
                      disabled={isLoadingFiles}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                      <span>አድስ</span>
                    </button>
                  </div>

                  {isLoadingFiles ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      ፋይሎች ከ Google Drive እየተነበቡ ነው...
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                      በ Google Drive ውስጥ ምንም ተስማሚ ሰነድ አልተገኘም።
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {driveFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {file.name}
                            </h5>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {file.mimeType}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isImporting}
                            onClick={() => handleImportFile(file)}
                            className="px-3 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-[11px] font-bold shrink-0 disabled:opacity-50"
                          >
                            ወደ መዝገብ አስመጣ
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mandatory User Confirmation Modal for Mutating Drive Operations */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2 text-[#0C4A9E] dark:text-[#7FAFFF]">
              <FolderSync className="w-5 h-5 text-[#B88500]" />
              <h3 className="text-sm font-bold font-serif-ethiopic">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif-ethiopic">
              {confirmModal.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                ይቅር
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-1.5 rounded-xl bg-[#0C4A9E] text-white text-xs font-bold hover:bg-[#072958]"
              >
                አረጋግጥና ቀጥል
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
