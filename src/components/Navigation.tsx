import React from 'react';
import { Home, BookOpen, Search, Calendar, User, PlusCircle } from 'lucide-react';
import { BottomNavTab } from '../types';
import { useArchive } from '../context/ArchiveContext';

interface NavigationProps {
  currentTab: BottomNavTab;
  onTabSelected: (tab: BottomNavTab) => void;
  onCreateWorkClick: () => void;
}

export const BottomNav: React.FC<NavigationProps> = ({
  currentTab,
  onTabSelected,
  onCreateWorkClick,
}) => {
  const tabs: { id: BottomNavTab; titleAmharic: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'HOME', titleAmharic: 'ዋና ገጽ', icon: Home },
    { id: 'ARCHIVE', titleAmharic: 'መዝገብ', icon: BookOpen },
    { id: 'SEARCH', titleAmharic: 'ፈልግ', icon: Search },
    { id: 'EVENTS', titleAmharic: 'መርሐ-ግብር', icon: Calendar },
    { id: 'PROFILE', titleAmharic: 'መገለጫ', icon: User },
  ];

  return (
    <nav
      aria-label="የስርዓቱ ዋና አሰሳ"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#111D30]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabSelected(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'text-[#0C4A9E] dark:text-[#7FAFFF] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isSelected ? 'bg-[#0C4A9E]/10 dark:bg-blue-950/40' : ''}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{tab.titleAmharic}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopSidebar: React.FC<NavigationProps> = ({
  currentTab,
  onTabSelected,
  onCreateWorkClick,
}) => {
  const { currentUser } = useArchive();

  const tabs: { id: BottomNavTab; titleAmharic: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'HOME', titleAmharic: 'ዋና ገጽ (Home)', icon: Home },
    { id: 'ARCHIVE', titleAmharic: 'መዝገብ (Archive)', icon: BookOpen },
    { id: 'SEARCH', titleAmharic: 'ፈልግ (Search)', icon: Search },
    { id: 'EVENTS', titleAmharic: 'መርሐ-ግብርና አባላት (Events)', icon: Calendar },
    { id: 'PROFILE', titleAmharic: 'የአባል መገለጫ (Profile)', icon: User },
  ];

  return (
    <aside
      aria-label="የኮምፒውተር አሰሳ ምናሌ"
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[#111D30] border-r border-[#B88500]/25 dark:border-slate-800 p-4 shadow-sm justify-between z-20 shrink-0"
    >
      <div>
        {/* Organization / User Card at top */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-[#B88500]/30 mb-6">
          <img
            src="/assets/ic_church_logo.jpg"
            alt="ተክለ ሳዊሮስ ዓርማ"
            className="w-11 h-11 rounded-full object-cover border-2 border-[#B88500]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {currentUser.fullName}
            </h4>
            <p className="text-xs text-[#966C00] dark:text-[#FFD54F] truncate font-medium">
              {currentUser.department}
            </p>
          </div>
        </div>

        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
          አሰሳ / Navigation
        </div>

        {/* Nav Links */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isSelected = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabSelected(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#0C4A9E] text-white font-bold shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <IconComponent className="w-5 h-5 shrink-0" />
                <span>{tab.titleAmharic}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Add Work Button */}
        <div className="mt-6 px-1">
          <button
            onClick={onCreateWorkClick}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B88500] to-[#0C4A9E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity"
          >
            <PlusCircle className="w-4 h-4" />
            <span>አዲስ ሥራ አቅርብ +</span>
          </button>
        </div>
      </div>

      {/* Bottom Organization Stamp */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
          ተክለ ሳዊሮስ ሰንበት ት/ቤት
        </p>
        <p className="text-[10px] text-[#966C00] dark:text-[#FFD54F] mt-0.5">
          ፲፱፻፶፯ • 1957 ዓ.ም.
        </p>
      </div>
    </aside>
  );
};
