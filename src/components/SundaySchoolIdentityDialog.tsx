import React from 'react';
import { X } from 'lucide-react';
import { HaragDivider } from './Ornaments';

export const SundaySchoolIdentityDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111D30] border-2 border-[#B88500] p-6 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Church Logo */}
        <div className="inline-block p-1 rounded-full bg-white border-2 border-[#B88500] shadow-sm mb-3">
          <img
            src="/assets/ic_church_logo.jpg"
            alt="ተክለ ሳዊሮስ ሰንበት ት/ቤት ዓርማ"
            className="w-24 h-24 rounded-full object-cover"
            onError={(e) => {
              // fallback if asset path differs
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <h2 className="text-xl font-bold font-serif-ethiopic text-[#0C4A9E] dark:text-[#7FAFFF]">
          ተክለ ሳዊሮስ ሰንበት ት/ቤት
        </h2>

        <p className="text-xs text-[#966C00] dark:text-[#FFD54F] font-medium mt-1 leading-relaxed">
          የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
        </p>

        <div className="inline-block mt-2 px-3 py-1 rounded-md bg-[#B88500]/15 border border-[#B88500]/30 text-xs font-bold text-[#0C4A9E] dark:text-[#FFD54F]">
          የተመሰረተበት ዓ.ም.፦ ፲፱፻፶፯ / 1957 ዓ.ም.
        </div>

        <HaragDivider className="my-3" height={16} />

        <p className="text-sm font-serif-ethiopic text-slate-700 dark:text-slate-300 font-medium italic">
          «በእግዚአብሔር ቃል የታነጸ፣ በኪነጥበብ የጎለበተ ትውልድ»
        </p>

        <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-left">
          <h4 className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] mb-2">
            የሰንበት ት/ቤቱ ዋና ዋና ክፍሎች
          </h4>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
            <li>• <strong className="text-[#0C4A9E] dark:text-blue-300">የኪነ ጥበብና ተውኔት ክፍል፦</strong> ድራማ፣ ስነ ግጥም፣ መጣጥፍና መነባንብ</li>
            <li>• <strong className="text-[#0C4A9E] dark:text-blue-300">የመዝሙርና ዜማ ክፍል፦</strong> የቅዱስ ያሬድ ዜማዎችና ዝማሬ</li>
            <li>• <strong className="text-[#0C4A9E] dark:text-blue-300">የትምህርትና ስልጠና ክፍል፦</strong> የመጽሐፍ ቅዱስና የስነ-ምግባር ትምህርት</li>
            <li>• <strong className="text-[#0C4A9E] dark:text-blue-300">የህዝብ ግንኙነትና የሚዲያ ክፍል፦</strong> ሰነዶች፣ ፎቶግራፍና መዝገብ</li>
          </ul>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-left">
          <h4 className="text-xs font-bold text-[#966C00] dark:text-[#FFD54F] mb-1">
            የኪነጥበብ መዝገብ ቤት ዓላማ
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ከ፲፱፻፶፯ ጀምሮ በአባላት የተፈጠሩ መንፈሳዊ ግጥሞችን፣ ተውኔቶችን፣ ጥናታዊ ጽሁፎችንና ቅርሶችን በክብር በመመዝገብ ለቀጣዩ ትውልድ ማስተላለፍ።
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-sm font-bold shadow-md transition-colors"
        >
          እሺ (ተመለስ)
        </button>
      </div>
    </div>
  );
};
