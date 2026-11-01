import React, { useEffect } from 'react';
import { HaragDivider } from '../components/Ornaments';

export const SplashScreen: React.FC<{
  onFinishSplash: () => void;
}> = ({ onFinishSplash }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishSplash();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onFinishSplash]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#072958] via-[#0C4A9E] to-[#072958] text-white text-center animate-in fade-in duration-700">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Sunday School Official Emblem */}
        <div className="p-1 rounded-full bg-white border-4 border-[#F5B800] shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
          <img
            src="/assets/ic_church_logo.jpg"
            alt="ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት ዓርማ"
            className="w-32 h-32 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-serif-ethiopic text-white drop-shadow-md">
          ተክለ ሳዊሮስ ሰንበት ት/ቤት
        </h1>

        <p className="text-xs sm:text-sm text-[#FFD54F] font-medium mt-2 leading-relaxed px-4">
          የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
        </p>

        <HaragDivider
          className="my-4"
          goldColor="#F5B800"
          burgundyColor="#FFFFFF"
          height={18}
        />

        <div className="text-sm font-semibold tracking-wider text-white/95">
          መዝገበ ኪነጥበብ • ፲፱፻፶፯ / 1957
        </div>

        <p className="text-xs text-white/70 italic font-serif-ethiopic mt-2">
          «በእግዚአብሔር ቃል የታነጸ፣ በኪነጥበብ የጎለበተ ትውልድ»
        </p>

        <button
          onClick={onFinishSplash}
          className="mt-10 px-8 py-3 rounded-full bg-gradient-to-r from-[#F5B800] to-[#B88500] hover:brightness-110 text-slate-900 font-bold text-sm shadow-xl active:scale-95 transition-all"
        >
          ወደ መዝገቡ ግባ →
        </button>
      </div>
    </div>
  );
};
