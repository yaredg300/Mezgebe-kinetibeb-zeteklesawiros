package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import com.example.R
import com.example.data.AppThemeMode
import com.example.data.ArchiveRepository
import com.example.ui.components.ArchivalBottomNav
import com.example.ui.components.BottomNavTab
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptSeal
import com.example.ui.screens.ArchiveScreen
import com.example.ui.screens.CategoryDetailScreen
import com.example.ui.screens.CreateWorkScreen
import com.example.ui.screens.DivisionSelectionScreen
import com.example.ui.screens.EventsScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.OnboardingScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.ReviewerQueueScreen
import com.example.ui.screens.SearchScreen
import com.example.ui.screens.SplashScreen
import com.example.ui.screens.WorkDetailScreen
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.MyApplicationTheme

sealed class AppDestination {
  data object Splash : AppDestination()
  data object Onboarding : AppDestination()
  data object DivisionSelection : AppDestination()
  data object Login : AppDestination()
  data object MainApp : AppDestination()
  data class CategoryDetail(val categoryId: String) : AppDestination()
  data class WorkDetail(val workId: String) : AppDestination()
  data object CreateWork : AppDestination()
  data object ReviewerQueue : AppDestination()
}

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      val repository = remember { ArchiveRepository.instance }
      val themeMode by repository.themeMode.collectAsState()
      val systemDark = isSystemInDarkTheme()
      val isDark = when (themeMode) {
        AppThemeMode.LIGHT -> false
        AppThemeMode.DARK -> true
        AppThemeMode.SYSTEM -> systemDark
      }

      MyApplicationTheme(darkTheme = isDark) {
        MezgebeKinetibebApp(repository = repository)
      }
    }
  }
}

@Composable
fun MezgebeKinetibebApp(repository: ArchiveRepository = remember { ArchiveRepository.instance }) {
  var currentDestination by remember { mutableStateOf<AppDestination>(AppDestination.Splash) }
  var currentTab by remember { mutableStateOf(BottomNavTab.HOME) }
  val backStack = remember { mutableListOf<AppDestination>() }

  fun navigateTo(destination: AppDestination) {
    backStack.add(currentDestination)
    currentDestination = destination
  }

  fun navigateBack() {
    if (backStack.isNotEmpty()) {
      currentDestination = backStack.removeAt(backStack.lastIndex)
    } else if (currentDestination != AppDestination.MainApp) {
      currentDestination = AppDestination.MainApp
    }
  }

  // Handle system hardware back gesture
  BackHandler(enabled = currentDestination != AppDestination.Splash && currentDestination != AppDestination.MainApp) {
    navigateBack()
  }

  Surface(
    modifier = Modifier.fillMaxSize(),
    color = MaterialTheme.colorScheme.background
  ) {
    AnimatedContent(
      targetState = currentDestination,
      transitionSpec = { fadeIn() togetherWith fadeOut() },
      label = "screen_transition"
    ) { destination ->
      when (destination) {
        is AppDestination.Splash -> {
          SplashScreen(
            onFinishSplash = {
              currentDestination = AppDestination.Onboarding
            }
          )
        }

        is AppDestination.Onboarding -> {
          OnboardingScreen(
            onComplete = {
              currentDestination = AppDestination.DivisionSelection
            }
          )
        }

        is AppDestination.DivisionSelection -> {
          DivisionSelectionScreen(
            repository = repository,
            onContinueToLogin = {
              currentDestination = AppDestination.Login
            },
            onExploreAsGuest = {
              currentDestination = AppDestination.MainApp
            }
          )
        }

        is AppDestination.Login -> {
          LoginScreen(
            repository = repository,
            onLoginSuccess = {
              currentDestination = AppDestination.MainApp
            },
            onContinueAsGuest = {
              currentDestination = AppDestination.MainApp
            },
            onChangeDivisionClick = {
              currentDestination = AppDestination.DivisionSelection
            }
          )
        }

        is AppDestination.MainApp -> {
          MainResponsiveContainer(
            repository = repository,
            currentTab = currentTab,
            onTabSelected = { currentTab = it },
            onWorkClick = { workId -> navigateTo(AppDestination.WorkDetail(workId)) },
            onCategoryClick = { categoryId -> navigateTo(AppDestination.CategoryDetail(categoryId)) },
            onSearchClick = { currentTab = BottomNavTab.SEARCH },
            onCreateWorkClick = { navigateTo(AppDestination.CreateWork) },
            onReviewQueueClick = { navigateTo(AppDestination.ReviewerQueue) },
            onLogoutClick = {
              backStack.clear()
              currentDestination = AppDestination.DivisionSelection
            }
          )
        }

        is AppDestination.CategoryDetail -> {
          CategoryDetailScreen(
            categoryId = destination.categoryId,
            repository = repository,
            onWorkClick = { workId -> navigateTo(AppDestination.WorkDetail(workId)) },
            onBackClick = { navigateBack() }
          )
        }

        is AppDestination.WorkDetail -> {
          WorkDetailScreen(
            workId = destination.workId,
            repository = repository,
            onBackClick = { navigateBack() }
          )
        }

        is AppDestination.CreateWork -> {
          CreateWorkScreen(
            repository = repository,
            onWorkCreated = { newWorkId ->
              navigateBack()
              navigateTo(AppDestination.WorkDetail(newWorkId))
            },
            onBackClick = { navigateBack() }
          )
        }

        is AppDestination.ReviewerQueue -> {
          ReviewerQueueScreen(
            repository = repository,
            onWorkClick = { workId -> navigateTo(AppDestination.WorkDetail(workId)) },
            onBackClick = { navigateBack() }
          )
        }
      }
    }
  }
}

/**
 * Responsive Adaptive Container for Mobile & Tablet/Expanded screens
 */
@Composable
fun MainResponsiveContainer(
  repository: ArchiveRepository,
  currentTab: BottomNavTab,
  onTabSelected: (BottomNavTab) -> Unit,
  onWorkClick: (String) -> Unit,
  onCategoryClick: (String) -> Unit,
  onSearchClick: () -> Unit,
  onCreateWorkClick: () -> Unit,
  onReviewQueueClick: () -> Unit,
  onLogoutClick: () -> Unit
) {
  BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
    val isTabletOrExpanded = maxWidth >= 600.dp

    if (isTabletOrExpanded) {
      // Canonical Tablet Layout: Side Navigation Rail + Centered Fluid Content
      Row(modifier = Modifier.fillMaxSize()) {
        TabletArchivalNavRail(
          currentTab = currentTab,
          onTabSelected = onTabSelected,
          repository = repository
        )

        Box(
          modifier = Modifier
            .weight(1f)
            .fillMaxHeight(),
          contentAlignment = Alignment.TopCenter
        ) {
          Box(modifier = Modifier.widthIn(max = 840.dp)) {
            MainTabContent(
              currentTab = currentTab,
              repository = repository,
              onTabSelected = onTabSelected,
              onWorkClick = onWorkClick,
              onCategoryClick = onCategoryClick,
              onSearchClick = onSearchClick,
              onCreateWorkClick = onCreateWorkClick,
              onReviewQueueClick = onReviewQueueClick,
              onLogoutClick = onLogoutClick
            )
          }
        }
      }
    } else {
      // Mobile-First Layout: Screen Content + Bottom Navigation Bar
      Scaffold(
        bottomBar = {
          ArchivalBottomNav(
            currentTab = currentTab,
            onTabSelected = onTabSelected,
            onAddWorkClick = onCreateWorkClick
          )
        }
      ) { innerPadding ->
        Box(
          modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
        ) {
          MainTabContent(
            currentTab = currentTab,
            repository = repository,
            onTabSelected = onTabSelected,
            onWorkClick = onWorkClick,
            onCategoryClick = onCategoryClick,
            onSearchClick = onSearchClick,
            onCreateWorkClick = onCreateWorkClick,
            onReviewQueueClick = onReviewQueueClick,
            onLogoutClick = onLogoutClick
          )
        }
      }
    }
  }
}

@Composable
fun MainTabContent(
  currentTab: BottomNavTab,
  repository: ArchiveRepository,
  onTabSelected: (BottomNavTab) -> Unit,
  onWorkClick: (String) -> Unit,
  onCategoryClick: (String) -> Unit,
  onSearchClick: () -> Unit,
  onCreateWorkClick: () -> Unit,
  onReviewQueueClick: () -> Unit,
  onLogoutClick: () -> Unit
) {
  when (currentTab) {
    BottomNavTab.HOME -> {
      HomeScreen(
        repository = repository,
        onWorkClick = onWorkClick,
        onCategoryClick = onCategoryClick,
        onSearchClick = onSearchClick,
        onCreateWorkClick = onCreateWorkClick
      )
    }

    BottomNavTab.ARCHIVE -> {
      ArchiveScreen(
        repository = repository,
        onCategoryClick = onCategoryClick,
        onSearchClick = onSearchClick,
        onCreateWorkClick = onCreateWorkClick
      )
    }

    BottomNavTab.SEARCH -> {
      SearchScreen(
        repository = repository,
        onWorkClick = onWorkClick
      )
    }

    BottomNavTab.EVENTS -> {
      EventsScreen(
        repository = repository
      )
    }

    BottomNavTab.PROFILE -> {
      ProfileScreen(
        repository = repository,
        onWorkClick = onWorkClick,
        onCreateWorkClick = onCreateWorkClick,
        onReviewQueueClick = onReviewQueueClick,
        onLogoutClick = onLogoutClick,
        onNavigateToEvents = { onTabSelected(BottomNavTab.EVENTS) }
      )
    }
  }
}

/**
 * Tablet Manuscript Floating Island Navigation Sidebar (inspired by detached island UI)
 */
@Composable
fun TabletArchivalNavRail(
  currentTab: BottomNavTab,
  onTabSelected: (BottomNavTab) -> Unit,
  repository: ArchiveRepository
) {
  val currentUser by repository.currentUser.collectAsState()

  Box(
    modifier = Modifier
      .fillMaxHeight()
      .statusBarsPadding()
      .navigationBarsPadding()
      .padding(16.dp)
  ) {
    Surface(
      shape = RoundedCornerShape(22.dp),
      color = MaterialTheme.colorScheme.surface,
      tonalElevation = 4.dp,
      shadowElevation = 8.dp,
      border = BorderStroke(1.dp, AntiqueGold.copy(alpha = 0.35f)),
      modifier = Modifier
        .width(220.dp)
        .fillMaxHeight()
        .testTag("tablet_nav_rail")
    ) {
      Column(
        modifier = Modifier
          .fillMaxHeight()
          .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
      ) {
        Column {
          // Top User & Organization Card
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .fillMaxWidth()
              .clip(RoundedCornerShape(12.dp))
              .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.08f))
              .padding(10.dp)
          ) {
            Box(
              modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color.White)
                .border(1.5.dp, AntiqueGold, CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Image(
                painter = painterResource(id = R.drawable.ic_church_logo),
                contentDescription = "ዓርማ",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
              )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = currentUser.fullName,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1
              )
              Text(
                text = currentUser.role.amharicTitle,
                style = MaterialTheme.typography.labelSmall,
                color = AntiqueGoldDark,
                maxLines = 1
              )
            }
          }

          Spacer(modifier = Modifier.height(18.dp))

          Text(
            text = "አሰሳ / Navigation",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
          )

          Spacer(modifier = Modifier.height(6.dp))

          BottomNavTab.values().forEach { tab ->
            val isSelected = currentTab == tab
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 3.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(
                  if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent
                )
                .clickable { onTabSelected(tab) }
                .padding(horizontal = 12.dp, vertical = 10.dp)
                .testTag("tablet_nav_${tab.name.lowercase()}")
            ) {
              Icon(
                imageVector = if (isSelected) tab.selectedIcon else tab.unselectedIcon,
                contentDescription = tab.titleAmharic,
                tint = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(22.dp)
              )
              Spacer(modifier = Modifier.width(12.dp))
              Text(
                text = tab.titleAmharic,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }

        // Bottom Organization Stamp
        Column(
          horizontalAlignment = Alignment.CenterHorizontally,
          modifier = Modifier.fillMaxWidth()
        ) {
          Text(
            text = "ተክለ ሳዊሮስ ሰንበት ት/ቤት",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = "፲፱፻፶፯ • 1957",
            style = MaterialTheme.typography.labelSmall,
            color = AntiqueGoldDark
          )
        }
      }
    }
  }
}

/**
 * Backward compatibility greeting composable for Roborazzi screenshot test
 */
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
  Text(text = "Hello $name!", modifier = modifier)
}
