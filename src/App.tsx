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
import { EhudPlanningScreen } from './screens/EhudPlanningScreen';
import { EhudFollowingScreen } from './screens/EhudFollowingScreen';
import { EhudProgramRatingScreen } from './screens/EhudProgramRatingScreen';
import { DepartmentGatewayScreen } from './screens/DepartmentGatewayScreen';
import { DepartmentPortalScreen } from './screens/DepartmentPortalScreen';
import { WaitingForApprovalScreen } from './screens/WaitingForApprovalScreen';
import { DepartmentAdminWorkspace } from './screens/DepartmentAdminWorkspace';
import { DepartmentMemberWorkspace } from './screens/DepartmentMemberWorkspace';

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

export const AppContent: React.FC = () => {
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
    isDeptAdmin,
    canApproveDeptMembers,
    hasPendingApproval,
    isSuperAdmin,
    isDepartmentPortalLocked,
    approvedDepartmentsList,
    activeMembership,
    canSwitchDepartments,
    firebaseUser,
    isAuthReady,
  } = useArchive();

  const [workspaceMode, setWorkspaceMode] = useState<'WORKSPACE' | 'HERITAGE'>(() =>
    firebaseUser ? 'WORKSPACE' : 'HERITAGE'
  );
  const prevAuthUidRef = React.useRef<string | null>(firebaseUser?.uid || null);

  React.useEffect(() => {
    if (!isAuthReady) return;
    const currentUid = firebaseUser?.uid || null;
    if (currentUid !== prevAuthUidRef.current) {
      prevAuthUidRef.current = currentUid;
      if (currentUid && (isSuperAdmin || activeMembership?.status === 'APPROVED')) {
        setWorkspaceMode('WORKSPACE');
      } else {
        setWorkspaceMode('HERITAGE');
      }
    } else if (!currentUid && workspaceMode === 'WORKSPACE') {
      setWorkspaceMode('HERITAGE');
    }
  }, [isAuthReady, firebaseUser, isSuperAdmin, activeMembership?.status]);

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
  const [focusedEhudSheetId, setFocusedEhudSheetId] = useState<string | null>(null);
  const [deepScreen, setDeepScreen] = useState<DeepScreen>({ type: 'none' });
  const [showChurchInfo, setShowChurchInfo] = useState<boolean>(false);
  const [showDepartmentsModal, setShowDepartmentsModal] = useState<boolean>(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (
      activeDepartment !== 'ehud_merha_gibir' &&
      (activeTab === 'EHUD_PLANNING' ||
        activeTab === 'EHUD_FOLLOWING' ||
        activeTab === 'EHUD_RATING')
    ) {
      setActiveTab('HOME');
    }
  }, [activeDepartment, activeTab]);

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
        onGoToLogin={(dept) => {
          if (dept) setActiveDepartment(dept);
          setFlow('login');
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

  // 5. Waiting For Department Approval Gate (for pending/rejected/suspended users)
  if (flow === 'main' && hasPendingApproval) {
    return (
      <WaitingForApprovalScreen
        onLogoutClick={() => setFlow('login')}
        onExploreOtherDepartment={
          !isDepartmentPortalLocked ? (dept) => setActiveDepartment(dept) : undefined
        }
      />
    );
  }

  const allowCrossDeptSwitch = !isDepartmentPortalLocked && canSwitchDepartments;

  // 6. Main Application Shell
  return (
    <div className="min-h-screen bg-[#F9FAFD] dark:bg-[#0B1320] text-slate-800 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar (visible on md: screens and above) */}
      <DesktopSidebar
        currentTab={activeTab}
        onTabSelected={handleTabSelected}
        onCreateWorkClick={() => handleOpenCreateWork()}
        onOpenDepartmentsHub={allowCrossDeptSwitch ? () => setShowDepartmentsModal(true) : undefined}
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
                <div>
                  {/* Compact Segmented View Mode Switcher */}
                  <div className="bg-white/90 dark:bg-[#111D30]/90 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                      <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setWorkspaceMode('WORKSPACE')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            workspaceMode === 'WORKSPACE'
                              ? 'bg-[#0C4A9E] text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          የሥራ ገበታ
                        </button>
                        <button
                          type="button"
                          onClick={() => setWorkspaceMode('HERITAGE')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            workspaceMode === 'HERITAGE'
                              ? 'bg-[#0C4A9E] text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {isDepartmentPortalLocked ? 'መርሐ ግብርና ዕቅድ' : 'ማህደርና መግቢያ'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {workspaceMode === 'WORKSPACE' ? (
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
                      {isDeptAdmin || canApproveDeptMembers ? (
                        <DepartmentAdminWorkspace
                          onOpenWorkClick={handleOpenWork}
                          onOpenScheduleDetails={() => setWorkspaceMode('HERITAGE')}
                        />
                      ) : (
                        <DepartmentMemberWorkspace
                          onOpenWorkClick={handleOpenWork}
                          onOpenScheduleDetails={() => setWorkspaceMode('HERITAGE')}
                        />
                      )}
                    </div>
                  ) : (
                    activeDepartment === 'ehud_merha_gibir' ? (
                      <EhudMerhaGibirScreen
                        onSwitchToKinetibeb={
                          allowCrossDeptSwitch ? () => setActiveDepartment('kinetibeb') : undefined
                        }
                        onOpenWorkClick={handleOpenWork}
                        onOpenDepartmentsHub={
                          allowCrossDeptSwitch ? () => setShowDepartmentsModal(true) : undefined
                        }
                      />
                    ) : activeDepartment === 'kinetibeb' ? (
                      <HomeScreen
                        onWorkClick={handleOpenWork}
                        onCategoryClick={handleOpenCategory}
                        onSearchClick={() => handleTabSelected('SEARCH')}
                        onCreateWorkClick={handleOpenCreateWork}
                        onOpenDepartmentsHub={
                          allowCrossDeptSwitch ? () => setShowDepartmentsModal(true) : undefined
                        }
                      />
                    ) : (
                      <DepartmentPortalScreen
                        departmentId={activeDepartment}
                        onOpenDepartmentsHub={
                          allowCrossDeptSwitch ? () => setShowDepartmentsModal(true) : () => {}
                        }
                        onSwitchToKinetibeb={
                          allowCrossDeptSwitch ? () => setActiveDepartment('kinetibeb') : () => {}
                        }
                        onSwitchToEhudMerhaGibir={
                          allowCrossDeptSwitch
                            ? () => setActiveDepartment('ehud_merha_gibir')
                            : () => {}
                        }
                        onNavigateToArchive={() => handleTabSelected('ARCHIVE')}
                        onNavigateToSearch={() => handleTabSelected('SEARCH')}
                        onNavigateToEvents={() => handleTabSelected('EVENTS')}
                        onNavigateToProfile={() => handleTabSelected('PROFILE')}
                      />
                    )
                  )}
                </div>
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

              {activeTab === 'EHUD_PLANNING' && (
                <EhudPlanningScreen
                  focusedSheetId={focusedEhudSheetId}
                  onFocusSheetChange={setFocusedEhudSheetId}
                  onNavigateToTab={handleTabSelected}
                />
              )}

              {activeTab === 'EHUD_FOLLOWING' && (
                <EhudFollowingScreen
                  focusedSheetId={focusedEhudSheetId}
                  onFocusSheetChange={setFocusedEhudSheetId}
                  onNavigateToTab={handleTabSelected}
                />
              )}

              {activeTab === 'EHUD_RATING' && (
                <EhudProgramRatingScreen
                  focusedSheetId={focusedEhudSheetId}
                  onFocusSheetChange={setFocusedEhudSheetId}
                  onNavigateToTab={handleTabSelected}
                />
              )}

              {activeTab === 'PROFILE' && (
                <ProfileScreen
                  onSelectWork={handleOpenWork}
                  onNavigateToReviewerQueue={handleOpenReviewerQueue}
                  onNavigateToCreateWork={() => handleOpenCreateWork()}
                  onNavigateToEvents={() => handleTabSelected('EVENTS')}
                  onOpenChurchInfo={() => setShowChurchInfo(true)}
                  onSwitchDivision={() => setFlow('division_selection')}
                  onNavigateToLogin={() => setFlow('login')}
                  onOpenDepartmentsModal={() => setShowDepartmentsModal(true)}
                  onNavigateToDepartmentGateway={() => setFlow('department_gateway')}
                  onOpenWorkspace={() => {
                    setWorkspaceMode('WORKSPACE');
                    handleTabSelected('HOME');
                  }}
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
      {allowCrossDeptSwitch && (
        <AllDepartmentsModal
          isOpen={showDepartmentsModal}
          onClose={() => setShowDepartmentsModal(false)}
          onSelectDepartment={(dept) => setActiveDepartment(dept)}
        />
      )}
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

