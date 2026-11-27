import React, { useState } from 'react';
import { Send, FileUp, Sparkles, CheckCircle2, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { SundaySchoolDivision, DIVISIONS, SundaySchoolDepartment } from '../types';
import { AppHeader } from '../components/AppHeader';
import { ManuscriptBox } from '../components/Ornaments';
import { getDepartmentCategories } from '../data/departmentCategories';
import { getAuthErrorMessageAmharic } from '../firebase/config';
import { AuthErrorAlert } from '../components/AuthErrorAlert';

interface WorkPreset {
  label: string;
  title: string;
  category: string;
  division: SundaySchoolDivision;
  excerpt: string;
  content: string;
  tags: string;
}

const KINETIBEB_SAMPLE_PRESETS: WorkPreset[] = [
  {
    label: 'ናሙና 1 (ግጥም)',
    title: 'የቅዱሳን አበው ፈለግ እና መንፈሳዊ ተጋድሎ',
    category: 'poetry',
    division: 'youth',
    excerpt: 'በጽናት የተመላው የኦርቶዶክሳዊት ቤተክርስቲያን ቅኔ እና የዜማ ድርሰት...',
    content: `በብርሃን ጎዳና በጽናት ሲጓዙ፣
የእምነትን አርማ በልባቸው ይዘው፤
የቀደሙት አበው ያቆዩልን ቅርስ፣
በተክለ ሣዊሮስ መንፈስ እንዳይፈርስ።

እነሆ ብዕሬ ለትውልድ ይነበብ፣
በቅኔና ዝማሬ ነፍሴ ስትታጀብ!`,
    tags: 'ግጥም, ቅኔ, ጽናት, አበው',
  },
  {
    label: 'ናሙና 2 (ተውኔት)',
    title: 'የሕፃናት የሰናፍጭ ቅንጣት እምነት ተውኔት',
    category: 'theater',
    division: 'children',
    excerpt: 'እምነት እንደ ሰናፍጭ ቅንጣት ታህል ቢኖረን ተራራውን መንቀል እንችላለን የሚለው የሕፃናት ድራማ...',
    content: `ትዕይንት ፩፦ በገሊላ ሜዳ
ገጸ-ባሕሪያት፦ ሳሙኤል (ሕፃን)፣ መምህሩ፣ የሰንበት ት/ቤት ልጆች

ሳሙኤል፦
«መምህር ሆይ! የሰናፍጭ ቅንጣት በጣም ትንሽ ናት፤ ታዲያ እንዴት ተራራ ታንቀሳቅሳለች?»

መምህሩ፦
«ልጄ ሆይ፣ ትንሽ ብትሆንም እግዚአብሔር በልባችን ሲያሳድጋት ታላቅ ዛፍ ሆና ወፎች በቅርንጫፎቿ ያርፋሉ!»`,
    tags: 'ሕፃናት, ተውኔት, እምነት',
  },
];

const EHUD_SAMPLE_PRESETS: WorkPreset[] = [
  {
    label: 'የዕለት መርሐ ግብር ሉህ',
    title: 'የእሁድ ሳምንታዊ የዕለት መርሐ ግብር ሉህ — 2019 ዓ.ም.',
    category: 'daily_plan_sheets',
    division: 'youth',
    excerpt: 'የእሁድ ዕለት ዝርዝር የደቂቃ ክፍፍል፣ የጸሎት መሪ፣ የትምህርት ርዕስና የተረኛ አስተባባሪ ሉህ።',
    content: `ቀን፦ ________ 2019 ዓ.ም.
ሰዓት፦ ከቀኑ 7:30 – 9:30
ተረኛ ምድብ፦ ________
የመርሐ ግብሩ መሪ፦ ________

1. 7:30 – 7:40 | መግቢያ ጸሎትና ንባበ ስንክሳር
2. 7:40 – 8:00 | የእለቱ መዝሙርና ኅብረት
3. 8:00 – 8:45 | ቃለ እግዚአብሔር (መምህር፦ ________)
4. 8:45 – 9:10 | ልዩ የመድረክ ክፍለ-ጊዜ / ውይይት
5. 9:10 – 9:30 | ማስታወቂያ፣ የሰላምታ ጊዜና የማጠቃለያ ጸሎት`,
    tags: 'የዕለት ሉህ, እሁድ, መርሐ ግብር',
  },
  {
    label: 'የመርሐ ግብር ቃለ-ጉባኤ',
    title: 'የእሁድ መርሐ ግብር አስተባባሪዎች ቃለ-ጉባኤ',
    category: 'program_minutes',
    division: 'youth',
    excerpt: 'የሳምንቱ መርሐ ግብር አፈጻጸም ግምገማ፣ የተነሱ ሃሳቦችና የቀጣይ ሳምንት የድርጊት መርሐ ግብር።',
    content: `የስብሰባ ቀን፦ ________ 2019 ዓ.ም.
ተገኚዎች፦ የእሁድ መርሐ ግብር ጽ/ቤት እና የተረኛ ምድብ አስተባባሪዎች

ዋና ዋና አጀንዳዎች፦
1. ያለፈው እሁድ መርሐ ግብር የሰዓት አከባበርና የተሳታፊዎች ብዛት ግምገማ
2. ለቀጣዩ እሁድ የአዳራሽ ዝግጅት፣ የድምፅ መሣሪያና የመምህር ማረጋገጫ
3. የተወሰኑ ውሳኔዎችና ኃላፊነት የተሰጣቸው አገልጋዮች

ያዘጋጀው ጸሐፊ፦ ________`,
    tags: 'ቃለ-ጉባኤ, ግምገማ, ውሳኔ',
  },
  {
    label: 'ሳምንታዊ አፈጻጸም ሪፖርት',
    title: 'ሳምንታዊ የእሁድ መርሐ ግብር አፈጻጸም ሪፖርት',
    category: 'weekly_timetables',
    division: 'intermediates',
    excerpt: 'የሳምንቱ የተሳታፊዎች ቆጠራ፣ የሰዓት አጠባበቅ፣ ጥንካሬዎችና የሚሻሻሉ ነጥቦች ሪፖርት።',
    content: `የሪፖርቱ ክፍለ-ጊዜ፦ ________ 2019 ዓ.ም.
የተሳታፊዎች ብዛት፦ ወንድ ___ | ሴት ___ | ጠቅላላ ___
መርሐ ግብሩ የተጀመረበት ሰዓት፦ ___ | የተጠናቀቀበት፦ ___

ጥንካሬዎች፦
- ዝግጅቱ በተያዘለት ሰዓት መጀመሩ እና የተማሪዎች ንቁ ተሳትፎ

መሻሻል ያለባቸው ነጥቦች፦
- የቅድመ-ዝግጅት ቁሳቁሶች ከ30 ደቂቃ በፊት መሟላታቸውን ማረጋገጥ`,
    tags: 'ሪፖርት, አፈጻጸም, ክትትል',
  },
];

export const CreateWorkScreen: React.FC<{
  onWorkCreated: (workId: string) => void;
  onBackClick: () => void;
  editWorkId?: string;
  onNavigateToLogin?: () => void;
}> = ({ onWorkCreated, onBackClick, editWorkId, onNavigateToLogin }) => {
  const {
    selectedDivision,
    currentUser,
    firebaseUser,
    signInWithGoogle,
    submitNewWork,
    updateWork,
    works,
    departmentsList,
    approvedDepartmentsList,
    canSwitchDepartments,
    isSuperAdmin,
    isDepartmentPortalLocked,
    activeDepartment,
  } = useArchive();

  const existingWork = editWorkId ? works.find((w) => w.id === editWorkId) : null;
  const initialDeptId: SundaySchoolDepartment =
    existingWork?.departmentId || activeDepartment || 'kinetibeb';
  const initialCategories = getDepartmentCategories(initialDeptId);

  const [departmentId, setDepartmentId] = useState<SundaySchoolDepartment>(initialDeptId);
  const [title, setTitle] = useState(existingWork?.title || '');
  const [writerName, setWriterName] = useState(existingWork?.writerName || currentUser.fullName);
  const [categoryId, setCategoryId] = useState(
    existingWork?.categoryId || initialCategories[0]?.id || 'poetry'
  );
  const [division, setDivision] = useState<SundaySchoolDivision>(
    existingWork?.division || selectedDivision
  );

  const selectableDepartments = isDepartmentPortalLocked
    ? departmentsList.filter((d) => d.id === activeDepartment)
    : !isSuperAdmin && !canSwitchDepartments && firebaseUser && approvedDepartmentsList.length > 0
      ? approvedDepartmentsList
      : departmentsList;

  const availableCategories = getDepartmentCategories(departmentId);
  const isEhudMode = departmentId === 'ehud_merha_gibir';
  const activePresets = isEhudMode ? EHUD_SAMPLE_PRESETS : KINETIBEB_SAMPLE_PRESETS;

  const [content, setContent] = useState(existingWork?.content || '');
  const [authError, setAuthError] = useState<string | null>(null);
  const [excerpt, setExcerpt] = useState(existingWork?.excerpt || '');
  const [tagText, setTagText] = useState(
    existingWork?.tags?.join(', ') ||
      (initialDeptId === 'ehud_merha_gibir'
        ? 'እሁድ, መርሐ ግብር, ተክለ ሣዊሮስ'
        : 'መንፈሳዊ, ተክለ ሣዊሮስ')
  );
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPdfName, setAttachedPdfName] = useState<string | null>(
    existingWork?.pdfFileName || null
  );
  const [attachedPdfSize, setAttachedPdfSize] = useState<string | null>(
    existingWork?.pdfFileSize || null
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleApplyPreset = (preset: WorkPreset) => {
    setTitle(preset.title);
    setCategoryId(preset.category);
    setDivision(preset.division);
    setExcerpt(preset.excerpt);
    setContent(preset.content);
    setTagText(preset.tags);
    setAttachedPdfName(`${preset.title.slice(0, 15)}.pdf`);
    setAttachedPdfSize('112 KB');
    setAttachedFile(null);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setFileError('የሰነዱ መጠን ከ 15 MB ማነስ አለበት።');
        return;
      }
      setAttachedFile(file);
      setAttachedPdfName(file.name);
      setAttachedPdfSize(`${(file.size / 1024).toFixed(0)} KB`);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const tags = tagText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      let resultId = '';
      if (existingWork) {
        const updated = await updateWork(existingWork.id, {
          title,
          categoryId,
          content,
          excerpt,
          tags,
          division,
          file: attachedFile,
          hasPdfAttachment: attachedPdfName !== null || attachedFile !== null,
          pdfFileName: attachedFile?.name || attachedPdfName,
          pdfFileSize: attachedFile ? `${(attachedFile.size / 1024).toFixed(0)} KB` : attachedPdfSize,
        });
        resultId = updated.id;
      } else {
        const newWork = await submitNewWork({
          title,
          categoryId,
          content,
          excerpt,
          tags,
          writerName,
          division,
          departmentId,
          hasPdfAttachment: attachedPdfName !== null || attachedFile !== null,
          pdfFileName: attachedFile?.name || attachedPdfName,
          pdfFileSize: attachedFile ? `${(attachedFile.size / 1024).toFixed(0)} KB` : attachedPdfSize,
          file: attachedFile,
        });
        resultId = newWork.id;
      }

      setSuccessId(resultId);
      setTimeout(() => {
        onWorkCreated(resultId);
      }, 800);
    } catch (err: any) {
      console.error('Work submission error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320]">
      <AppHeader
        title={
          existingWork
            ? 'ሰነዱን አሻሽል (Edit & Resubmit)'
            : isEhudMode
              ? 'አዲስ የመርሐ ግብር ሰነድ አቅርብ'
              : 'አዲስ ስራ አቅርብ'
        }
        subtitle={
          existingWork
            ? `«${existingWork.title}» ማሻሻያ ማቅረቢያ`
            : isEhudMode
              ? 'የዕለት ሉሆች፣ ቃለ-ጉባኤዎችና የዕቅድ ሰነዶች ማስገቢያ'
              : 'የፈጠራ ስራዎችን ወደ መዝገቡ ማስገቢያ'
        }
        showBack={true}
        onBackClick={onBackClick}
      />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Guest Warning / Call to Action */}
        {!firebaseUser && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  ሰነዶችን ለማቅረብ መለያ ያስፈልጋል
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  ሰነዶችዎ በቤተክርስቲያኑ ቋሚ መዝገብና በ Google Cloud Storage በደህንነት እንዲቀመጡ እባክዎ መጀመሪያ ይግቡ።
                </p>
                <AuthErrorAlert
                  message={authError}
                  onDismiss={() => setAuthError(null)}
                  className="mt-2"
                />
                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  <button
                    type="button"
                    onClick={async () => {
                      setAuthError(null);
                      try {
                        await signInWithGoogle();
                      } catch (err: any) {
                        const msg = getAuthErrorMessageAmharic(err);
                        if (msg) setAuthError(msg);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                  >
                    በ Google ግባ
                  </button>
                  {onNavigateToLogin && (
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold transition-colors"
                    >
                      በኢሜይል ግባ / ተመዝገብ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Archival Submission Rules Banner */}
        <ManuscriptBox className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1.5 text-[#0C4A9E] dark:text-[#7FAFFF]">
            <Sparkles className="w-4 h-4 text-[#B88500]" />
            <h3 className="text-sm font-bold font-serif-ethiopic">
              {existingWork
                ? 'የሰነድ ማሻሻያ መመሪያ'
                : isEhudMode
                  ? 'የእሁድ መርሐ ግብር ሰነድ ማቅረቢያ መመሪያ'
                  : 'የስራ ማቅረቢያ መመሪያ'}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif-ethiopic">
            {existingWork
              ? 'የገምጋሚውን አስተያየት መሰረት በማድረግ ይዘቱን ያሻሽሉ። አዲሱ እትም በቀጥታ ወደ ገምጋሚዎች ወረፋ ይገባል።'
              : isEhudMode
                ? 'የሚያቀርቡት የዕለት ሉህ፣ ቃለ-ጉባኤ ወይም ሳምንታዊ ሪፖርት ለእሁድ መርሐ ግብር ክፍል አስተባባሪዎች ይላካል። ከጸደቀ በኋላ በቋሚነት ወደ ክፍሉ መዝገብ ይገባል።'
                : 'የሚያቀርቡት ስራ ለሰንበት ት/ቤቱ ገምጋሚዎች ይላካል። ከተገመገመና ከጸደቀ በኋላ በቋሚነት ወደ መዝገቡ ይገባል። እባክዎ ትክክለኛ የጸሐፊ ስም፣ ይዘትና ምድብ ይምረጡ።'}
          </p>
        </ManuscriptBox>

        {/* Quick Sample Presets (Only when creating new) */}
        {!existingWork && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              ፈጣን ናሙናዎችን ተጠቀም (Quick Template):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {activePresets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#B88500]/15 hover:bg-[#B88500]/25 text-[#966C00] dark:text-[#FFD54F] border border-[#B88500]/30 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <ManuscriptBox className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {isEhudMode ? 'የሰነዱ / የመርሐ ግብሩ ርዕስ *' : 'የሥራው ርዕስ *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isEhudMode
                    ? 'ለምሳሌ፡ የጥር 2 የእሁድ መርሐ ግብር ቃለ-ጉባኤ'
                    : 'ለምሳሌ፡ የብርሃን ማዕበል እና የጽናት ቃል'
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {isEhudMode ? 'አዘጋጅ / ጸሐፊ' : 'ደራሲ / ፀሐፊ'}
                </label>
                <input
                  type="text"
                  required
                  value={writerName}
                  onChange={(e) => setWriterName(e.target.value)}
                  placeholder={isEhudMode ? 'የአዘጋጁ / ጸሐፊው ስም' : 'የደራሲው ስም'}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  የዕድሜ እርከን ቅርንጫፍ (Division) *
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value as SundaySchoolDivision)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                >
                  {(['children', 'intermediates', 'youth'] as SundaySchoolDivision[]).map((d) => (
                    <option key={d} value={d}>
                      {DIVISIONS[d].titleAmharic} ({DIVISIONS[d].ageRangeAmharic})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  የሰንበት ት/ቤት ክፍል (Department) *
                </label>
                <select
                  value={departmentId}
                  disabled={(isDepartmentPortalLocked || selectableDepartments.length === 1) && !existingWork}
                  onChange={(e) => {
                    const newDept = e.target.value as SundaySchoolDepartment;
                    setDepartmentId(newDept);
                    const newCats = getDepartmentCategories(newDept);
                    if (newCats.length > 0 && !newCats.some((c) => c.id === categoryId)) {
                      setCategoryId(newCats[0].id);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500] disabled:opacity-75"
                >
                  {selectableDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.titleAmharic} ({d.badgeLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  የመዝገብ ዘርፍ ምድብ (Category) *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                >
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAmharic} ({c.nameEnglish})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                አጭር ማጠቃለያ / Excerpt
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="ለካርድ ቅድመ-ዕይታ የሚሆን አጭር ማጠቃለያ"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {isEhudMode ? 'የሰነዱ / የመርሐ ግብሩ ሙሉ ይዘት (Content) *' : 'የሥራው ሙሉ ይዘት (Content) *'}
              </label>
              <textarea
                rows={8}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  isEhudMode
                    ? 'የዕለቱን መርሐ ግብር ዝርዝር፣ ቃለ-ጉባኤ ወይም ሳምንታዊ ሪፖርት እዚህ ይጻፉ...'
                    : 'ሙሉውን ግጥም፣ ተውኔት ወይም ስነ-ጽሁፍ እዚህ ይጻፉ...'
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-serif-ethiopic rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                መለያዎች (Tags - በነጠላ ሰረዝ ይለዩ)
              </label>
              <input
                type="text"
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                placeholder={isEhudMode ? 'እሁድ, ቃለ-ጉባኤ, መርሐ ግብር' : 'ግጥም, ቅኔ, መንፈሳዊ'}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
              />
            </div>

            {/* Document / PDF Attachment Box */}
            <div className="p-3.5 rounded-xl border border-dashed border-[#B88500]/60 bg-amber-50/40 dark:bg-amber-950/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <FileUp className="w-5 h-5 text-[#B88500]" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      የሰነድ ማያያዣ (PDF / Word)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      በ Google Cloud Storage ይቀመጣል። ከፍተኛ መጠን፦ 15 MB
                    </p>
                  </div>
                </div>

                <label className="px-3 py-1.5 rounded-lg bg-[#B88500] hover:bg-[#966C00] text-white text-xs font-bold cursor-pointer shrink-0 transition-colors">
                  <span>ሰነድ ምረጥ</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileAttach}
                    className="hidden"
                  />
                </label>
              </div>

              {fileError && (
                <p className="text-xs text-rose-600 font-bold mt-2">{fileError}</p>
              )}

              {attachedPdfName && (
                <div className="mt-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-[#B88500]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {attachedPdfName} {attachedPdfSize ? `(${attachedPdfSize})` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedPdfName(null);
                      setAttachedPdfSize(null);
                      setAttachedFile(null);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>በማስመዝገብ ላይ (Saving to Cloud)...</span>
                </>
              ) : successId ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#FFD54F]" />
                  <span>ስራው በተሳካ ሁኔታ ቀርቧል!</span>
                </>
              ) : existingWork ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>የተሻሻለውን ስራ በድጋሚ አቅርብ →</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ስራውን ለመገምገም አቅርብ →</span>
                </>
              )}
            </button>
          </form>
        </ManuscriptBox>
      </div>
    </div>
  );
};
