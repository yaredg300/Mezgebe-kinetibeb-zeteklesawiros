import React, { useState, useContext } from 'react';
import { useArchive, ArchiveContext, ArchiveProvider } from './context/ArchiveContext';
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
import { EhudMerhaGibirScreen } from './screens/EhudMerhaGibirScreen';
import { DepartmentGatewayScreen } from './screens/DepartmentGatewayScreen';
import { DepartmentPortalScreen } from './screens/DepartmentPortalScreen';

// Navigation & Overlays
import { AppHeader } from './components/AppHeader';
import { BottomNav, DesktopSidebar } from './components/Navigation';
import { SundaySchoolIdentityDialog } from './components/SundaySchoolIdentityDialog';
import { AllDepartmentsModal } from './components/AllDepartmentsModal';
import {
  LiturgicalAudioFloatingIsland,
  LiturgicalAudioPlayerModal,
} from './components/LiturgicalAudioComponents';

type AppFlow = 'splash' | 'department_gateway' | 'onboarding' | 'division_selection' | 'login' | 'main';

type DeepScreen =
  | { type: 'none' }
  | { type: 'category'; categoryId: string }
  | { type: 'work'; workId: string }
  | { type: 'create_work'; editWorkId?: string }
  | { type: 'reviewer_queue' };

const AppContent: React.FC = () => {
  const {
    currentAudioTrack,
    isAudioPlaying,
    audioProgress,
    toggleAudioPlayPause,
    stopAudio,
    setAudioProgress,
    selectDivision,
    activeDepartment,
    setActiveDepartment,
  } = useArchive();

  // Root authentication / onboarding flow with persistence check
  const [flow, setFlow] = useState<AppFlow>(() => {
    try {
      const hasOnboarded = localStorage.getItem('mezgebe_has_onboarded');
      if (hasOnboarded === 'true') {
        return 'main';
      }
    } catch {
      // fallback
    }
    return 'splash';
  });

  const [activeTab, setActiveTab] = useState<BottomNavTab>('HOME');
  const [deepScreen, setDeepScreen] = useState<DeepScreen>({ type: 'none' });
  const [showChurchInfo, setShowChurchInfo] = useState<boolean>(false);
  const [showDepartmentsModal, setShowDepartmentsModal] = useState<boolean>(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);

  const markOnboardedAndProceed = (nextFlow: AppFlow) => {
    try {
      localStorage.setItem('mezgebe_has_onboarded', 'true');
    } catch {
      // ignore
    }
    setFlow(nextFlow);
  };

  // Navigation handlers
  const handleOpenCategory = (categoryId: string) => {
    setDeepScreen({ type: 'category', categoryId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWork = (workId: string) => {
    setDeepScreen({ type: 'work', workId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreateWork = (editWorkId?: string) => {
    setDeepScreen({ type: 'create_work', editWorkId });
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
    return <SplashScreen onFinishSplash={() => setFlow('department_gateway')} />;
  }

  // 2. Department Choice Gateway Screen (Department switcher BEFORE intro)
  if (flow === 'department_gateway') {
    return (
      <DepartmentGatewayScreen
        onSelectKinetibeb={(viewIntro) => {
          setActiveDepartment('kinetibeb');
          if (viewIntro) {
            setFlow('onboarding');
          } else {
            setFlow('division_selection');
          }
        }}
        onSelectEhudMerhaGibir={() => {
          setActiveDepartment('ehud_merha_gibir');
          markOnboardedAndProceed('main');
        }}
        onExploreDirectly={(dept) => {
          setActiveDepartment(dept);
          markOnboardedAndProceed('main');
        }}
      />
    );
  }

  // 3. Onboarding Screen (Kinetibeb deep creation & review walkthrough)
  if (flow === 'onboarding') {
    return (
      <OnboardingScreen
        onComplete={() => {
          setFlow('division_selection');
        }}
        onBackToDepartmentChoice={() => setFlow('department_gateway')}
      />
    );
  }

  // 3. Division Selection Screen
  if (flow === 'division_selection') {
    return (
      <DivisionSelectionScreen
        onContinueToLogin={(div: SundaySchoolDivision) => {
          selectDivision(div);
          markOnboardedAndProceed('login');
        }}
        onExploreAsGuest={(div: SundaySchoolDivision) => {
          selectDivision(div);
          markOnboardedAndProceed('main');
        }}
      />
    );
  }

  // 4. Login Screen
  if (flow === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={(deptId) => {
          if (deptId) {
            setActiveDepartment(deptId);
          }
          markOnboardedAndProceed('main');
        }}
        onContinueAsGuest={(deptId) => {
          if (deptId) {
            setActiveDepartment(deptId);
          }
          markOnboardedAndProceed('main');
        }}
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
        onCreateWorkClick={() => handleOpenCreateWork()}
        onOpenDepartmentsHub={() => setShowDepartmentsModal(true)}
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
              onEditWork={(workId) => handleOpenCreateWork(workId)}
            />
          )}

          {deepScreen.type === 'create_work' && (
            <CreateWorkScreen
              editWorkId={deepScreen.editWorkId}
              onWorkCreated={(workId) => {
                handleOpenWork(workId);
              }}
              onBackClick={handleBackToTabs}
              onNavigateToLogin={() => setFlow('login')}
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
                activeDepartment === 'ehud_merha_gibir' ? (
                  <EhudMerhaGibirScreen
                    onSwitchToKinetibeb={() => setActiveDepartment('kinetibeb')}
                    onOpenWorkClick={handleOpenWork}
                    onOpenDepartmentsHub={() => setShowDepartmentsModal(true)}
                  />
                ) : activeDepartment === 'kinetibeb' ? (
                  <HomeScreen
                    onWorkClick={handleOpenWork}
                    onCategoryClick={handleOpenCategory}
                    onSearchClick={() => handleTabSelected('SEARCH')}
                    onCreateWorkClick={handleOpenCreateWork}
                    onOpenDepartmentsHub={() => setShowDepartmentsModal(true)}
                  />
                ) : (
                  <DepartmentPortalScreen
                    departmentId={activeDepartment}
                    onOpenDepartmentsHub={() => setShowDepartmentsModal(true)}
                    onSwitchToKinetibeb={() => setActiveDepartment('kinetibeb')}
                    onSwitchToEhudMerhaGibir={() => setActiveDepartment('ehud_merha_gibir')}
                  />
                )
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
                  onNavigateToLogin={() => setFlow('login')}
                  onOpenDepartmentsModal={() => setShowDepartmentsModal(true)}
                  onNavigateToDepartmentGateway={() => setFlow('department_gateway')}
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

      {/* All Sunday School Departments Directory & Switcher Modal */}
      <AllDepartmentsModal
        isOpen={showDepartmentsModal}
        onClose={() => setShowDepartmentsModal(false)}
        onSelectDepartment={(dept) => setActiveDepartment(dept)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  const existingContext = useContext(ArchiveContext);
  if (!existingContext) {
    return (
      <ArchiveProvider>
        <AppContent />
      </ArchiveProvider>
    );
  }
  return <AppContent />;
};

export default App;

