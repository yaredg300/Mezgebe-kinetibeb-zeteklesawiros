import React, { useState } from 'react';
import { useArchive } from './context/ArchiveContext';
import { BottomNavTab, SundaySchoolDivision } from './types';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DivisionSelectionScreen } from './screens/DivisionSelectionScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ArchiveScreen } from './screens/ArchiveScreen';
import { CategoryDetailScreen } from './screens/CategoryDetailScreen';
import { WorkDetailScreen } from './screens/WorkDetailScreen';
import { EventsScreen } from './screens/EventsScreen';
import { CreateWorkScreen } from './screens/CreateWorkScreen';
import { ReviewerQueueScreen } from './screens/ReviewerQueueScreen';
import { SearchScreen } from './screens/SearchScreen';
import { ProfileScreen } from './screens/ProfileScreen';

// Navigation & Overlays
import { AppHeader } from './components/AppHeader';
import { BottomNav, DesktopSidebar } from './components/Navigation';
import { SundaySchoolIdentityDialog } from './components/SundaySchoolIdentityDialog';
import {
  LiturgicalAudioFloatingIsland,
  LiturgicalAudioPlayerModal,
} from './components/LiturgicalAudioComponents';

type AppFlow = 'splash' | 'onboarding' | 'division_selection' | 'login' | 'main';

type DeepScreen =
  | { type: 'none' }
  | { type: 'category'; categoryId: string }
  | { type: 'work'; workId: string }
  | { type: 'create_work' }
  | { type: 'reviewer_queue' };

export const App: React.FC = () => {
  const {
    currentAudioTrack,
    isAudioPlaying,
    audioProgress,
    toggleAudioPlayPause,
    stopAudio,
    setAudioProgress,
    selectDivision,
  } = useArchive();

  // Root authentication / onboarding flow
  const [flow, setFlow] = useState<AppFlow>('splash');
  const [activeTab, setActiveTab] = useState<BottomNavTab>('HOME');
  const [deepScreen, setDeepScreen] = useState<DeepScreen>({ type: 'none' });
  const [showChurchInfo, setShowChurchInfo] = useState<boolean>(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);

  // Navigation handlers
  const handleOpenCategory = (categoryId: string) => {
    setDeepScreen({ type: 'category', categoryId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWork = (workId: string) => {
    setDeepScreen({ type: 'work', workId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreateWork = () => {
    setDeepScreen({ type: 'create_work' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReviewerQueue = () => {
    setDeepScreen({ type: 'reviewer_queue' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTabs = () => {
    setDeepScreen({ type: 'none' });
  };

  const handleTabSelected = (tab: BottomNavTab) => {
    setActiveTab(tab);
    setDeepScreen({ type: 'none' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Splash Screen
  if (flow === 'splash') {
    return <SplashScreen onFinishSplash={() => setFlow('onboarding')} />;
  }

  // 2. Onboarding Screen
  if (flow === 'onboarding') {
    return <OnboardingScreen onComplete={() => setFlow('division_selection')} />;
  }

  // 3. Division Selection Screen
  if (flow === 'division_selection') {
    return (
      <DivisionSelectionScreen
        onContinueToLogin={(div: SundaySchoolDivision) => {
          selectDivision(div);
          setFlow('login');
        }}
        onExploreAsGuest={(div: SundaySchoolDivision) => {
          selectDivision(div);
          setFlow('main');
        }}
      />
    );
  }

  // 4. Login Screen
  if (flow === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={() => setFlow('main')}
        onContinueAsGuest={() => setFlow('main')}
        onChangeDivisionClick={() => setFlow('division_selection')}
      />
    );
  }

  // 5. Main Application Shell
  return (
    <div className="min-h-screen bg-[#F9FAFD] dark:bg-[#0B1320] text-slate-800 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar (visible on md: screens and above) */}
      <DesktopSidebar
        currentTab={activeTab}
        onTabSelected={handleTabSelected}
        onCreateWorkClick={handleOpenCreateWork}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1">
          {/* Deep screens take precedence */}
          {deepScreen.type === 'category' && (
            <CategoryDetailScreen
              categoryId={deepScreen.categoryId}
              onWorkClick={handleOpenWork}
              onBackClick={handleBackToTabs}
            />
          )}

          {deepScreen.type === 'work' && (
            <WorkDetailScreen
              workId={deepScreen.workId}
              onBackClick={handleBackToTabs}
            />
          )}

          {deepScreen.type === 'create_work' && (
            <CreateWorkScreen
              onWorkCreated={(workId) => {
                handleOpenWork(workId);
              }}
              onBackClick={handleBackToTabs}
            />
          )}

          {deepScreen.type === 'reviewer_queue' && (
            <ReviewerQueueScreen
              onWorkClick={handleOpenWork}
              onBackClick={handleBackToTabs}
            />
          )}

          {/* Root tabs */}
          {deepScreen.type === 'none' && (
            <>
              {activeTab === 'HOME' && (
                <HomeScreen
                  onWorkClick={handleOpenWork}
                  onCategoryClick={handleOpenCategory}
                  onSearchClick={() => handleTabSelected('SEARCH')}
                  onCreateWorkClick={handleOpenCreateWork}
                />
              )}

              {activeTab === 'ARCHIVE' && (
                <ArchiveScreen
                  onCategoryClick={handleOpenCategory}
                  onSearchClick={() => handleTabSelected('SEARCH')}
                  onCreateWorkClick={handleOpenCreateWork}
                />
              )}

              {activeTab === 'SEARCH' && (
                <SearchScreen
                  onSelectWork={handleOpenWork}
                  onSelectCategory={handleOpenCategory}
                />
              )}

              {activeTab === 'EVENTS' && <EventsScreen />}

              {activeTab === 'PROFILE' && (
                <ProfileScreen
                  onSelectWork={handleOpenWork}
                  onNavigateToReviewerQueue={handleOpenReviewerQueue}
                  onNavigateToCreateWork={handleOpenCreateWork}
                  onNavigateToEvents={() => handleTabSelected('EVENTS')}
                  onOpenChurchInfo={() => setShowChurchInfo(true)}
                  onSwitchDivision={() => setFlow('division_selection')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Liturgical Audio Floating Island */}
      {currentAudioTrack && (
        <LiturgicalAudioFloatingIsland
          track={currentAudioTrack}
          isPlaying={isAudioPlaying}
          progress={audioProgress}
          onTogglePlayPause={toggleAudioPlayPause}
          onClose={stopAudio}
          onOpenDetails={() => setIsAudioModalOpen(true)}
        />
      )}

      {/* Liturgical Audio Player Full Modal */}
      {currentAudioTrack && (
        <LiturgicalAudioPlayerModal
          isOpen={isAudioModalOpen}
          track={currentAudioTrack}
          isPlaying={isAudioPlaying}
          progress={audioProgress}
          onTogglePlayPause={toggleAudioPlayPause}
          onSeek={setAudioProgress}
          onClose={() => setIsAudioModalOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={activeTab}
        onTabSelected={handleTabSelected}
        onCreateWorkClick={handleOpenCreateWork}
      />

      {/* Church Identity Dialog (1957 Tekle Sawiros Church History & Divisions) */}
      <SundaySchoolIdentityDialog
        isOpen={showChurchInfo}
        onClose={() => setShowChurchInfo(false)}
      />
    </div>
  );
};

export default App;
