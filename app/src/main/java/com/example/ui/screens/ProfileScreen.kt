package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AddCircleOutline
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BrightnessAuto
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.Image
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import com.example.R
import com.example.data.AppThemeMode
import com.example.data.ArchiveRepository
import com.example.model.UserRole
import com.example.ui.components.AppHeader
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.ManuscriptSeal
import com.example.ui.components.SecondaryButton
import com.example.ui.components.WorkCard
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.StatusApprovedGreen
import com.example.ui.theme.StatusReviewAmber

@Composable
fun ProfileScreen(
  repository: ArchiveRepository,
  onWorkClick: (String) -> Unit,
  onCreateWorkClick: () -> Unit,
  onReviewQueueClick: () -> Unit,
  onLogoutClick: () -> Unit,
  onNavigateToEvents: (() -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  val user by repository.currentUser.collectAsState()
  val works by repository.works.collectAsState()
  val bookmarkedWorks = works.filter { it.isBookmarked }
  val events by repository.events.collectAsState()
  val currentThemeMode by repository.themeMode.collectAsState()
  var selectedTab by remember { mutableStateOf(ProfileTab.SUBMISSIONS) }

  Column(modifier = modifier.fillMaxSize()) {
    AppHeader(
      title = "መገለጫ",
      subtitle = "የአባል መረጃ እና የፈጠራ ስራዎች ማዕከል",
      actions = {
        IconButton(
          onClick = { repository.toggleThemeMode() },
          modifier = Modifier.testTag("profile_theme_toggle_btn")
        ) {
          Icon(
            imageVector = if (currentThemeMode == AppThemeMode.DARK) Icons.Filled.LightMode else Icons.Filled.DarkMode,
            contentDescription = if (currentThemeMode == AppThemeMode.DARK) "ብሩህ ገጽታ (Bright Mode)" else "የጨለማ ገጽታ (Dark Mode)",
            tint = MaterialTheme.colorScheme.primary
          )
        }
      }
    )

    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("profile_screen_content"),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
      // User Profile Header Card
      item {
        ManuscriptBox(
          modifier = Modifier.fillMaxWidth(),
          contentPadding = 18.dp
        ) {
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Box(
                modifier = Modifier
                  .size(68.dp)
                  .clip(CircleShape)
                  .background(MaterialTheme.colorScheme.primaryContainer)
                  .border(2.dp, AntiqueGold, CircleShape),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = user.fullName.take(1),
                  style = MaterialTheme.typography.headlineLarge,
                  color = MaterialTheme.colorScheme.primary,
                  fontWeight = FontWeight.Bold,
                  fontFamily = FontFamily.Serif
                )
              }

              Spacer(modifier = Modifier.width(16.dp))

              Column(modifier = Modifier.weight(1f)) {
                Text(
                  text = user.fullName,
                  style = MaterialTheme.typography.titleLarge,
                  color = MaterialTheme.colorScheme.primary,
                  fontWeight = FontWeight.Bold
                )
                Text(
                  text = user.email,
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                  modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(AntiqueGold.copy(alpha = 0.16f))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                  Text(
                    text = "ሚና፦ ${user.role.amharicTitle}",
                    fontSize = 11.sp,
                    color = AntiqueGoldDark,
                    fontWeight = FontWeight.Bold
                  )
                }
              }
            }

            Spacer(modifier = Modifier.height(14.dp))
            HaragDivider(height = 10.dp)
            Spacer(modifier = Modifier.height(10.dp))

            // Stats row
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceAround
            ) {
              ProfileStatItem(number = "${works.size}", label = "የእኔ ስራዎች")
              ProfileStatItem(number = "${user.mySubmissionsCount}", label = "ያቀረብኳቸው")
              ProfileStatItem(number = "${bookmarkedWorks.size}", label = "የተቀመጡ")
            }
          }
        }
      }

      // Role Switcher (Crucial for testing Role Architecture: Member, Contributor, Reviewer, Admin)
      item {
        ManuscriptBox(
          modifier = Modifier.fillMaxWidth(),
          contentPadding = 14.dp
        ) {
          Column {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                  imageVector = Icons.Filled.Security,
                  contentDescription = null,
                  tint = AntiqueGold,
                  modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                  text = "የሚና መቀየሪያ (Role Switcher)",
                  style = MaterialTheme.typography.titleSmall,
                  color = MaterialTheme.colorScheme.primary,
                  fontWeight = FontWeight.Bold
                )
              }
              Text(
                text = "የስርዓት ሙከራ",
                style = MaterialTheme.typography.labelSmall,
                color = AntiqueGoldDark
              )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // First 3 roles: Member, Contributor, Reviewer
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              listOf(UserRole.MEMBER, UserRole.CONTRIBUTOR, UserRole.REVIEWER).forEach { role ->
                val isSelected = user.role == role
                Box(
                  modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(
                      if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                    )
                    .clickable { repository.setUserRole(role) }
                    .padding(vertical = 8.dp),
                  contentAlignment = Alignment.Center
                ) {
                  Text(
                    text = when (role) {
                      UserRole.MEMBER -> "አባል"
                      UserRole.CONTRIBUTOR -> "ደራሲ"
                      UserRole.REVIEWER -> "ገምጋሚ"
                      else -> ""
                    },
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                  )
                }
              }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Second 3 roles: Editor, Admin, Super Admin
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              listOf(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN).forEach { role ->
                val isSelected = user.role == role
                Box(
                  modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(
                      if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                    )
                    .clickable { repository.setUserRole(role) }
                    .padding(vertical = 8.dp),
                  contentAlignment = Alignment.Center
                ) {
                  Text(
                    text = when (role) {
                      UserRole.EDITOR -> "አዘጋጅ"
                      UserRole.ADMIN -> "አድሚን"
                      UserRole.SUPER_ADMIN -> "ዋና"
                      else -> ""
                    },
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                  )
                }
              }
            }
          }
        }
      }

      // Sunday School Organization Info Card
      item {
        ManuscriptBox(
          modifier = Modifier
            .fillMaxWidth()
            .testTag("profile_church_info_card"),
          contentPadding = 14.dp
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
          ) {
            Box(
              modifier = Modifier
                .size(54.dp)
                .clip(CircleShape)
                .background(Color.White)
                .border(2.dp, AntiqueGold, CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Image(
                painter = painterResource(id = R.drawable.ic_church_logo),
                contentDescription = "የተክለ ሳዊሮስ ሰንበት ት/ቤት ዓርማ",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                  .fillMaxSize()
                  .clip(CircleShape)
              )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = "ተክለ ሳዊሮስ ሰንበት ት/ቤት",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
                fontFamily = FontFamily.Serif
              )
              Text(
                text = "የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 14.sp,
                fontSize = 10.sp
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "የተመሰረተበት፦ ፲፱፻፶፯ / 1957 ዓ.ም. • የኪነጥበብ ክፍል",
                style = MaterialTheme.typography.labelSmall,
                color = AntiqueGoldDark,
                fontWeight = FontWeight.Medium
              )
            }
          }
        }
      }

      // Theme Appearance Selector (Bright Mode & Dark Mode)
      item {
        ManuscriptBox(
          modifier = Modifier
            .fillMaxWidth()
            .testTag("theme_mode_selector_card"),
          contentPadding = 14.dp
        ) {
          Column {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.SpaceBetween,
              modifier = Modifier.fillMaxWidth()
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                  imageVector = if (currentThemeMode == AppThemeMode.DARK) Icons.Filled.DarkMode else Icons.Filled.LightMode,
                  contentDescription = null,
                  tint = MaterialTheme.colorScheme.primary,
                  modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                  text = "የመተግበሪያው ገጽታ (Appearance)",
                  style = MaterialTheme.typography.titleSmall,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.onSurface
                )
              }
              Text(
                text = when (currentThemeMode) {
                  AppThemeMode.LIGHT -> "ብሩህ"
                  AppThemeMode.DARK -> "ጨለማ"
                  AppThemeMode.SYSTEM -> "ስርዓት"
                },
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
              )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              AppThemeMode.values().forEach { mode ->
                val isSelected = currentThemeMode == mode
                val icon = when (mode) {
                  AppThemeMode.LIGHT -> Icons.Filled.LightMode
                  AppThemeMode.DARK -> Icons.Filled.DarkMode
                  AppThemeMode.SYSTEM -> Icons.Filled.BrightnessAuto
                }
                val label = when (mode) {
                  AppThemeMode.LIGHT -> "ብሩህ (Bright)"
                  AppThemeMode.DARK -> "ጨለማ (Dark)"
                  AppThemeMode.SYSTEM -> "ስርዓት (System)"
                }

                Box(
                  modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                      if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                    )
                    .border(
                      width = if (isSelected) 1.5.dp else 1.dp,
                      color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                      shape = RoundedCornerShape(8.dp)
                    )
                    .clickable { repository.setThemeMode(mode) }
                    .padding(vertical = 10.dp, horizontal = 4.dp)
                    .testTag("theme_option_${mode.name.lowercase()}"),
                  contentAlignment = Alignment.Center
                ) {
                  Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                      imageVector = icon,
                      contentDescription = label,
                      tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                      modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                      text = label,
                      fontSize = 11.sp,
                      fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                      color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                      maxLines = 1
                    )
                  }
                }
              }
            }
          }
        }
      }

      // Admin Master Archive & Event Management
      if (user.role == UserRole.ADMIN || user.role == UserRole.SUPER_ADMIN) {
        item {
          ProfileNavTile(
            title = "የሁሉንም ጽሁፎች ማዕከል (All Writings Archive)",
            subtitle = "ሁሉንም ${works.size} ስራዎች፣ ረቂቆችና የጸደቁ ጽሁፎች ተቆጣጠር",
            icon = Icons.Filled.MenuBook,
            badge = "${works.size} ጽሁፎች",
            onClick = onReviewQueueClick
          )
        }

        if (onNavigateToEvents != null) {
          item {
            ProfileNavTile(
              title = "የዝግጅቶች መርሃ-ግብር አስተዳደር (Manage Programs)",
              subtitle = "አዳዲስ የኪነጥበብ መድረኮችንና ፌስቲቫሎችን መዝግብ",
              icon = Icons.Filled.CalendarMonth,
              badge = "${events.size} መርሃ-ግብራት",
              onClick = onNavigateToEvents
            )
          }
        }
      }

      // Action Tiles for Creator / Reviewer / Admin
      if (user.role == UserRole.CONTRIBUTOR || user.role == UserRole.ADMIN || user.role == UserRole.SUPER_ADMIN) {
        item {
          ProfileNavTile(
            title = "አዲስ ስራ አቅርብ (Submit Creative Work)",
            subtitle = "ግጥም፣ ስነ ጽሁፍ ወይም ስክሪፕት ለግምገማ ይላኩ",
            icon = Icons.Filled.AddCircleOutline,
            onClick = onCreateWorkClick
          )
        }
      }

      if (user.role == UserRole.REVIEWER || user.role == UserRole.ADMIN || user.role == UserRole.SUPER_ADMIN) {
        item {
          ProfileNavTile(
            title = "የግምገማ ወረፋ (Review Queue)",
            subtitle = "የቀረቡ ሥራዎችን መገምገም፣ ማጽደቅና ማሻሻያ መጠየቅ",
            icon = Icons.Filled.RateReview,
            badge = "ግምገማ",
            onClick = onReviewQueueClick
          )
        }
      }

      // Tab switcher: My Works / Submissions / Bookmarks
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          ProfileTabButton(
            title = "የቀረቡ (${works.size})",
            isSelected = selectedTab == ProfileTab.SUBMISSIONS,
            onClick = { selectedTab = ProfileTab.SUBMISSIONS },
            modifier = Modifier.weight(1f)
          )
          ProfileTabButton(
            title = "ዕልባቶች (${bookmarkedWorks.size})",
            isSelected = selectedTab == ProfileTab.BOOKMARKS,
            onClick = { selectedTab = ProfileTab.BOOKMARKS },
            modifier = Modifier.weight(1f)
          )
        }
      }

      // Content of selected tab
      when (selectedTab) {
        ProfileTab.SUBMISSIONS -> {
          items(works, key = { it.id }) { work ->
            WorkCard(
              work = work,
              onClick = { onWorkClick(work.id) },
              onBookmarkClick = { repository.toggleBookmark(work.id) }
            )
          }
        }
        ProfileTab.BOOKMARKS -> {
          if (bookmarkedWorks.isEmpty()) {
            item {
              Text(
                text = "ምንም ዕልባት የተደረገ ስራ የለም።",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(16.dp)
              )
            }
          } else {
            items(bookmarkedWorks, key = { it.id }) { work ->
              WorkCard(
                work = work,
                onClick = { onWorkClick(work.id) },
                onBookmarkClick = { repository.toggleBookmark(work.id) }
              )
            }
          }
        }
      }

      // Settings and Logout
      item {
        Spacer(modifier = Modifier.height(10.dp))
        SecondaryButton(
          text = "ውጣ / Logout",
          onClick = onLogoutClick,
          icon = Icons.Filled.ExitToApp,
          modifier = Modifier.fillMaxWidth()
        )
      }
    }
  }
}

enum class ProfileTab {
  SUBMISSIONS,
  BOOKMARKS
}

@Composable
private fun ProfileStatItem(number: String, label: String) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Text(
      text = number,
      style = MaterialTheme.typography.titleLarge,
      fontWeight = FontWeight.Bold,
      color = MaterialTheme.colorScheme.primary,
      fontFamily = FontFamily.Serif
    )
    Text(
      text = label,
      style = MaterialTheme.typography.labelSmall,
      color = MaterialTheme.colorScheme.onSurfaceVariant
    )
  }
}

@Composable
private fun ProfileTabButton(
  title: String,
  isSelected: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .clip(RoundedCornerShape(6.dp))
      .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
      .clickable(onClick = onClick)
      .padding(vertical = 10.dp),
    contentAlignment = Alignment.Center
  ) {
    Text(
      text = title,
      style = MaterialTheme.typography.labelMedium,
      fontWeight = FontWeight.Bold,
      color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
    )
  }
}

@Composable
private fun ProfileNavTile(
  title: String,
  subtitle: String,
  icon: ImageVector,
  badge: String? = null,
  onClick: () -> Unit
) {
  ManuscriptBox(
    modifier = Modifier
      .fillMaxWidth()
      .clickable(onClick = onClick),
    contentPadding = 12.dp
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Box(
        modifier = Modifier
          .size(42.dp)
          .clip(CircleShape)
          .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
        contentAlignment = Alignment.Center
      ) {
        Icon(imageVector = icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
      }

      Spacer(modifier = Modifier.width(12.dp))

      Column(modifier = Modifier.weight(1f)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text(
            text = title,
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Bold
          )
          if (badge != null) {
            Spacer(modifier = Modifier.width(6.dp))
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(4.dp))
                .background(StatusReviewAmber.copy(alpha = 0.2f))
                .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
              Text(text = badge, fontSize = 10.sp, color = StatusReviewAmber, fontWeight = FontWeight.Bold)
            }
          }
        }
        Text(
          text = subtitle,
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }

      Icon(
        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
        contentDescription = null,
        tint = AntiqueGoldDark,
        modifier = Modifier.size(18.dp)
      )
    }
  }
}
