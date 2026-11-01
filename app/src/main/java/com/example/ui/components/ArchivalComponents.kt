package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.FolderSpecial
import androidx.compose.material.icons.filled.HistoryEdu
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.RecordVoiceOver
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.ui.draw.scale
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.TheaterComedy
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.MenuBook
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.R
import com.example.model.ChurchMember
import com.example.model.CulturalEvent
import com.example.model.MemberDuty
import com.example.model.ProgramAssignment
import com.example.model.ProgramRecurrence
import com.example.model.SubmissionStatus
import com.example.model.SundaySchoolDivision
import com.example.model.WorkCategory
import com.example.model.WorkItem
import com.example.model.Writer
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ChurchGoldenYellow
import com.example.ui.theme.ChurchGoldenYellowLight
import com.example.ui.theme.ChurchRoyalBlue
import com.example.ui.theme.ChurchRoyalBlueLight
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.ManuscriptBurgundyDark
import com.example.ui.theme.ManuscriptBurgundyLight
import com.example.ui.theme.ManuscriptInkDark
import com.example.ui.theme.ParchmentBackground
import com.example.ui.theme.ParchmentBorder
import com.example.ui.theme.ParchmentSurface
import com.example.ui.theme.ParchmentSurfaceVariant
import com.example.ui.theme.StatusApprovedGreen
import com.example.ui.theme.StatusArchivedBlue
import com.example.ui.theme.StatusReviewAmber
import com.example.ui.theme.StatusRevisionRed

/**
 * Cultural App Header with Tekle Sawiros Sunday School branding
 */
@Composable
fun AppHeader(
  title: String = "መዝገበ ኪነጥበብ",
  subtitle: String? = "ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት",
  showBack: Boolean = false,
  onBackClick: () -> Unit = {},
  actions: @Composable () -> Unit = {}
) {
  Surface(
    color = MaterialTheme.colorScheme.surface,
    tonalElevation = 1.dp,
    modifier = Modifier
      .fillMaxWidth()
      .testTag("app_header")
  ) {
    Column(
      modifier = Modifier
        .statusBarsPadding()
        .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.weight(1f)
        ) {
          if (showBack) {
            IconButton(
              onClick = onBackClick,
              modifier = Modifier
                .size(48.dp)
                .testTag("header_back_button")
            ) {
              Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "ተመለስ",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
              )
            }
            Spacer(modifier = Modifier.width(4.dp))
          } else {
            Box(
              modifier = Modifier
                .padding(end = 10.dp)
                .size(42.dp)
                .clip(CircleShape)
                .background(Color.White)
                .border(1.5.dp, AntiqueGold, CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Image(
                painter = painterResource(id = R.drawable.ic_church_logo),
                contentDescription = "የተክለ ሳዊሮስ ሰንበት ት/ቤት ዓርማ",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
              )
            }
          }

          Column {
            Text(
              text = title,
              style = MaterialTheme.typography.titleLarge,
              color = MaterialTheme.colorScheme.primary,
              fontWeight = FontWeight.Bold,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
            if (subtitle != null) {
              Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = AntiqueGoldDark,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
              )
            }
          }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
          actions()
        }
      }

      Spacer(modifier = Modifier.height(6.dp))
      HaragDivider(height = 10.dp)
    }
  }
}

/**
 * Mobile-first Bottom Navigation Bar (መነሻ, መዝገብ, ፈልግ, ዝግጅቶች, መገለጫ)
 */
enum class BottomNavTab(val titleAmharic: String, val selectedIcon: ImageVector, val unselectedIcon: ImageVector) {
  HOME("መነሻ", Icons.Filled.Home, Icons.Outlined.Home),
  ARCHIVE("መዝገብ", Icons.Filled.MenuBook, Icons.Outlined.MenuBook),
  SEARCH("ፈልግ", Icons.Filled.Search, Icons.Outlined.Search),
  EVENTS("ዝግጅቶች", Icons.Filled.CalendarMonth, Icons.Outlined.CalendarMonth),
  PROFILE("መገለጫ", Icons.Filled.Person, Icons.Outlined.Person)
}

@Composable
fun ArchivalBottomNav(
  currentTab: BottomNavTab,
  onTabSelected: (BottomNavTab) -> Unit,
  onAddWorkClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .fillMaxWidth()
      .navigationBarsPadding()
      .padding(horizontal = 14.dp, vertical = 8.dp),
    contentAlignment = Alignment.Center
  ) {
    Surface(
      shape = RoundedCornerShape(26.dp),
      color = MaterialTheme.colorScheme.surface,
      tonalElevation = 6.dp,
      shadowElevation = 10.dp,
      border = BorderStroke(1.dp, AntiqueGold.copy(alpha = 0.35f)),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("bottom_nav_bar")
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 6.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
      ) {
        BottomNavTab.values().forEach { tab ->
          val isSelected = currentTab == tab
          Box(
            modifier = Modifier
              .weight(if (isSelected) 1.25f else 0.9f)
              .clip(RoundedCornerShape(20.dp))
              .background(
                if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent
              )
              .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = ripple(bounded = true)
              ) { onTabSelected(tab) }
              .padding(vertical = 7.dp, horizontal = 4.dp)
              .testTag("nav_tab_${tab.name.lowercase()}"),
            contentAlignment = Alignment.Center
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.Center
            ) {
              Icon(
                imageVector = if (isSelected) tab.selectedIcon else tab.unselectedIcon,
                contentDescription = tab.titleAmharic,
                tint = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(20.dp)
              )
              if (isSelected) {
                Spacer(modifier = Modifier.width(5.dp))
                Text(
                  text = tab.titleAmharic,
                  style = MaterialTheme.typography.labelSmall,
                  fontWeight = FontWeight.Bold,
                  color = Color.White,
                  maxLines = 1
                )
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Status Badge for Workflow stages
 */
@Composable
fun StatusBadge(
  status: SubmissionStatus,
  modifier: Modifier = Modifier
) {
  val (badgeBg, badgeText) = when (status) {
    SubmissionStatus.APPROVED -> Pair(StatusApprovedGreen.copy(alpha = 0.14f), StatusApprovedGreen)
    SubmissionStatus.UNDER_REVIEW -> Pair(StatusReviewAmber.copy(alpha = 0.14f), StatusReviewAmber)
    SubmissionStatus.REVISION_REQUESTED -> Pair(StatusRevisionRed.copy(alpha = 0.14f), StatusRevisionRed)
    SubmissionStatus.PUBLISHED -> Pair(AntiqueGoldDark.copy(alpha = 0.14f), AntiqueGoldDark)
    SubmissionStatus.ARCHIVED -> Pair(StatusArchivedBlue.copy(alpha = 0.14f), StatusArchivedBlue)
    SubmissionStatus.DRAFT -> Pair(Color.Gray.copy(alpha = 0.14f), Color.DarkGray)
  }

  Box(
    modifier = modifier
      .clip(RoundedCornerShape(6.dp))
      .background(badgeBg)
      .border(1.dp, badgeText.copy(alpha = 0.3f), RoundedCornerShape(6.dp))
      .padding(horizontal = 8.dp, vertical = 3.dp)
  ) {
    Text(
      text = status.amharicLabel,
      color = badgeText,
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold
    )
  }
}

/**
 * Category Card (ቲያትር፣ ስነ ጽሁፍ፣ ግጥም...)
 */
@Composable
fun CategoryCard(
  category: WorkCategory,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val icon = when (category.id) {
    "poetry" -> Icons.Filled.AutoStories
    "literature" -> Icons.AutoMirrored.Filled.MenuBook
    "theater" -> Icons.Filled.TheaterComedy
    "monologue" -> Icons.Filled.RecordVoiceOver
    "script" -> Icons.Filled.Description
    "art" -> Icons.Filled.Palette
    "photography" -> Icons.Filled.PhotoCamera
    "video" -> Icons.Filled.Videocam
    "history" -> Icons.Filled.HistoryEdu
    else -> Icons.Filled.FolderSpecial
  }

  ManuscriptBox(
    modifier = modifier
      .fillMaxWidth()
      .clickable(
        interactionSource = remember { MutableInteractionSource() },
        indication = ripple(bounded = true),
        onClick = onClick
      )
      .testTag("category_card_${category.id}"),
    contentPadding = 14.dp
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Box(
        modifier = Modifier
          .size(46.dp)
          .clip(CircleShape)
          .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
          .border(1.dp, AntiqueGold.copy(alpha = 0.4f), CircleShape),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = icon,
          contentDescription = category.nameAmharic,
          tint = MaterialTheme.colorScheme.primary,
          modifier = Modifier.size(24.dp)
        )
      }

      Spacer(modifier = Modifier.width(14.dp))

      Column(modifier = Modifier.weight(1f)) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween,
          modifier = Modifier.fillMaxWidth()
        ) {
          Text(
            text = category.nameAmharic,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = "${category.workCount} ሥራዎች",
            style = MaterialTheme.typography.labelSmall,
            color = AntiqueGoldDark,
            fontWeight = FontWeight.SemiBold
          )
        }
        Spacer(modifier = Modifier.height(2.dp))
        Text(
          text = category.descriptionAmharic,
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis
        )
      }
    }
  }
}

/**
 * Work Card (Archival creative piece card)
 */
@Composable
fun WorkCard(
  work: WorkItem,
  onClick: () -> Unit,
  onBookmarkClick: () -> Unit,
  onQuickPreviewClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  CandlelightGlowBox(
    enabled = work.isFeatured,
    glowColor = AntiqueGold
  ) {
    ManuscriptBox(
      modifier = modifier
        .fillMaxWidth()
        .clickable(
          interactionSource = remember { MutableInteractionSource() },
          indication = ripple(bounded = true),
          onClick = onClick
        )
        .testTag("work_card_${work.id}"),
      contentPadding = 16.dp
    ) {
      Column {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f, fill = false)
          ) {
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(4.dp))
                .background(AntiqueGold.copy(alpha = 0.18f))
                .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
              Text(
                text = work.categoryName,
                fontSize = 11.sp,
                color = AntiqueGoldDark,
                fontWeight = FontWeight.Bold
              )
            }
            Spacer(modifier = Modifier.width(6.dp))
            // Division Badge
            val divBadgeBg = when (work.division) {
              SundaySchoolDivision.CHILDREN -> ChurchGoldenYellowLight.copy(alpha = 0.35f)
              SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlueLight.copy(alpha = 0.25f)
              SundaySchoolDivision.YOUTH -> AntiqueGold.copy(alpha = 0.16f)
            }
            val divBadgeColor = when (work.division) {
              SundaySchoolDivision.CHILDREN -> ChurchGoldenYellow
              SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlue
              SundaySchoolDivision.YOUTH -> AntiqueGoldDark
            }
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(4.dp))
                .background(divBadgeBg)
                .padding(horizontal = 5.dp, vertical = 2.dp)
            ) {
              Text(
                text = work.division.titleAmharic,
                fontSize = 10.sp,
                color = divBadgeColor,
                fontWeight = FontWeight.Bold
              )
            }
            Spacer(modifier = Modifier.width(6.dp))
            StatusBadge(status = work.status)
            if (work.hasPdfAttachment) {
              Spacer(modifier = Modifier.width(6.dp))
              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(4.dp))
                  .background(ManuscriptBurgundy.copy(alpha = 0.12f))
                  .border(0.8.dp, ManuscriptBurgundy.copy(alpha = 0.35f), RoundedCornerShape(4.dp))
                  .padding(horizontal = 5.dp, vertical = 2.dp)
              ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Icon(
                    imageVector = Icons.Filled.PictureAsPdf,
                    contentDescription = "PDF",
                    tint = ManuscriptBurgundy,
                    modifier = Modifier.size(11.dp)
                  )
                  Spacer(modifier = Modifier.width(3.dp))
                  Text(
                    text = "PDF",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = ManuscriptBurgundy
                  )
                }
              }
            }
          }

          Row(verticalAlignment = Alignment.CenterVertically) {
            if (onQuickPreviewClick != null) {
              IconButton(
                onClick = onQuickPreviewClick,
                modifier = Modifier
                  .size(34.dp)
                  .testTag("quick_preview_btn_${work.id}")
              ) {
                Icon(
                  imageVector = Icons.Filled.Visibility,
                  contentDescription = "ቅድመ-ዕይታ",
                  tint = MaterialTheme.colorScheme.onSurfaceVariant,
                  modifier = Modifier.size(19.dp)
                )
              }
            }

            val bookmarkScale by animateFloatAsState(
              targetValue = if (work.isBookmarked) 1.25f else 1f,
              animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
              label = "card_bookmark_scale"
            )
            IconButton(
              onClick = onBookmarkClick,
              modifier = Modifier
                .size(34.dp)
                .scale(bookmarkScale)
                .testTag("bookmark_btn_${work.id}")
            ) {
              Icon(
                imageVector = if (work.isBookmarked) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                contentDescription = "ዕልባት",
                tint = if (work.isBookmarked) AntiqueGold else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(20.dp)
              )
            }
          }
        }

      Spacer(modifier = Modifier.height(8.dp))

      Text(
        text = work.title,
        style = MaterialTheme.typography.titleMedium,
        color = MaterialTheme.colorScheme.onSurface,
        fontWeight = FontWeight.Bold,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis
      )

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = work.excerpt,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis
      )

      Spacer(modifier = Modifier.height(12.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Filled.Person,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(14.dp)
          )
          Spacer(modifier = Modifier.width(4.dp))
          Text(
            text = work.writerName,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Medium
          )
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
          Text(
            text = work.dateAmharic,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "• ${work.readTime}",
            style = MaterialTheme.typography.bodySmall,
            color = AntiqueGoldDark,
            fontWeight = FontWeight.Medium
          )
        }
      }
    }
  }
}
}

/**
 * Event Card with Program Recurrence (Weekly, Monthly, Yearly) and Art Work Assignments
 */
@Composable
fun EventCard(
  event: CulturalEvent,
  onClick: () -> Unit = {},
  onDeleteClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  ManuscriptBox(
    modifier = modifier
      .fillMaxWidth()
      .clickable(
        interactionSource = remember { MutableInteractionSource() },
        indication = ripple(bounded = true),
        onClick = onClick
      )
      .testTag("event_card_${event.id}"),
    contentPadding = 16.dp
  ) {
    Column {
      // Top Badges Row: Category + Recurrence Badge + Date
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          // Recurrence Pill (ሳምንታዊ / ወርሃዊ / ዓመታዊ)
          val (recBgColor, recTextColor, recLabel) = when (event.recurrence) {
            ProgramRecurrence.WEEKLY -> Triple(Color(0xFF256645).copy(alpha = 0.15f), Color(0xFF1E5638), "ሳምንታዊ (Weekly)")
            ProgramRecurrence.MONTHLY -> Triple(AntiqueGold.copy(alpha = 0.22f), AntiqueGoldDark, "ወርሃዊ (Monthly)")
            ProgramRecurrence.YEARLY -> Triple(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f), MaterialTheme.colorScheme.primary, "ዓመታዊ (Yearly)")
          }
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(4.dp))
              .background(recBgColor)
              .padding(horizontal = 8.dp, vertical = 3.dp)
          ) {
            Text(
              text = recLabel,
              fontSize = 10.sp,
              color = recTextColor,
              fontWeight = FontWeight.Bold
            )
          }

          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(4.dp))
              .background(MaterialTheme.colorScheme.surfaceVariant)
              .padding(horizontal = 6.dp, vertical = 3.dp)
          ) {
            Text(
              text = event.category,
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
              fontWeight = FontWeight.Medium
            )
          }
        }

        Text(
          text = event.dateAmharic,
          style = MaterialTheme.typography.bodySmall,
          color = AntiqueGoldDark,
          fontWeight = FontWeight.SemiBold
        )
      }

      Spacer(modifier = Modifier.height(8.dp))

      Text(
        text = event.title,
        style = MaterialTheme.typography.titleMedium,
        color = MaterialTheme.colorScheme.onSurface,
        fontWeight = FontWeight.Bold
      )

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = event.description,
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis
      )

      // Assignments from Art Works (የተመደቡ የኪነጥበብ ሥራዎች - ፀሃፊ፣ አዘጋጅ፣ አቅራቢ)
      if (event.assignments.isNotEmpty()) {
        Spacer(modifier = Modifier.height(10.dp))
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(6.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
            .border(0.8.dp, AntiqueGold.copy(alpha = 0.35f), RoundedCornerShape(6.dp))
            .padding(10.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            Icon(
              imageVector = Icons.Filled.AutoStories,
              contentDescription = null,
              tint = AntiqueGoldDark,
              modifier = Modifier.size(15.dp)
            )
            Text(
              text = "የኪነጥበብ ሥራ ምደባ (Art Work Assignment)",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.primary
            )
          }

          event.assignments.forEach { asgn ->
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(4.dp))
                .background(MaterialTheme.colorScheme.background.copy(alpha = 0.7f))
                .padding(8.dp)
            ) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = "📜 ${asgn.workTitle}",
                  style = MaterialTheme.typography.bodySmall,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.onSurface
                )
                Box(
                  modifier = Modifier
                    .clip(RoundedCornerShape(3.dp))
                    .background(AntiqueGold.copy(alpha = 0.15f))
                    .padding(horizontal = 5.dp, vertical = 1.dp)
                ) {
                  Text(
                    text = asgn.workCategory,
                    fontSize = 9.sp,
                    color = AntiqueGoldDark,
                    fontWeight = FontWeight.SemiBold
                  )
                }
              }

              Spacer(modifier = Modifier.height(6.dp))

              // ፀሃፊ፣ አዘጋጅ እና አቅራቢ Roles
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                // ፀሃፊ (Writer)
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = "✍️ ፀሃፊ",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                  )
                  Text(
                    text = asgn.writerMemberName,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                  )
                }

                // አዘጋጅ (Organizer)
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = "🎬 አዘጋጅ",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = AntiqueGoldDark
                  )
                  Text(
                    text = asgn.organizerMemberName,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                  )
                }

                // አቅራቢ (Presenter)
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = "🎙️ አቅራቢ",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF256645)
                  )
                  Text(
                    text = asgn.presenterMemberName,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                  )
                }
              }

              if (asgn.performanceNotes.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                  text = "📌 ማስታወሻ፦ ${asgn.performanceNotes}",
                  fontSize = 10.sp,
                  color = MaterialTheme.colorScheme.onSurfaceVariant,
                  maxLines = 2,
                  overflow = TextOverflow.Ellipsis
                )
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Time & Location row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          modifier = Modifier.weight(1f),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Filled.CalendarMonth,
              contentDescription = null,
              tint = AntiqueGoldDark,
              modifier = Modifier.size(13.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = event.timeAmharic,
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Filled.LocationOn,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(13.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = event.location,
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
          }
        }

        if (onDeleteClick != null) {
          IconButton(
            onClick = onDeleteClick,
            modifier = Modifier
              .size(28.dp)
              .testTag("delete_event_${event.id}")
          ) {
            Icon(
              imageVector = Icons.Filled.Delete,
              contentDescription = "መርሐ-ግብር ሰርዝ",
              tint = Color.Red.copy(alpha = 0.7f),
              modifier = Modifier.size(16.dp)
            )
          }
        }
      }
    }
  }
}

/**
 * Church Member Card (ፀሃፊ፣ አዘጋጅ፣ አቅራቢ)
 */
@Composable
fun ChurchMemberCard(
  member: ChurchMember,
  onClick: () -> Unit = {},
  onDeleteClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  val (dutyColor, dutyIcon, dutyTitle) = when (member.duty) {
    MemberDuty.WRITER -> Triple(MaterialTheme.colorScheme.primary, "✍️", "ፀሃፊ (Writer)")
    MemberDuty.ORGANIZER -> Triple(AntiqueGoldDark, "🎬", "አዘጋጅ (Organizer)")
    MemberDuty.PRESENTER -> Triple(Color(0xFF256645), "🎙️", "አቅራቢ (Presenter)")
  }

  ManuscriptBox(
    modifier = modifier
      .fillMaxWidth()
      .clickable(
        interactionSource = remember { MutableInteractionSource() },
        indication = ripple(bounded = true),
        onClick = onClick
      )
      .testTag("member_card_${member.id}"),
    contentPadding = 14.dp
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      verticalAlignment = Alignment.CenterVertically
    ) {
      // Member Avatar Badge
      Box(
        modifier = Modifier
          .size(44.dp)
          .clip(CircleShape)
          .background(dutyColor.copy(alpha = 0.15f))
          .border(1.dp, dutyColor.copy(alpha = 0.4f), CircleShape),
        contentAlignment = Alignment.Center
      ) {
        Text(
          text = dutyIcon,
          fontSize = 20.sp
        )
      }

      Spacer(modifier = Modifier.width(12.dp))

      Column(modifier = Modifier.weight(1f)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = member.fullName,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
          )

          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(4.dp))
              .background(dutyColor.copy(alpha = 0.15f))
              .padding(horizontal = 6.dp, vertical = 2.dp)
          ) {
            Text(
              text = dutyTitle,
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = dutyColor
            )
          }
        }

        Spacer(modifier = Modifier.height(2.dp))

        Text(
          text = "${member.spiritualTitle} • ${member.department}",
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        if (member.bio.isNotBlank()) {
          Spacer(modifier = Modifier.height(2.dp))
          Text(
            text = member.bio,
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.85f),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }

        if (member.phone.isNotBlank()) {
          Spacer(modifier = Modifier.height(4.dp))
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Filled.Person,
              contentDescription = null,
              tint = AntiqueGoldDark,
              modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = "ስልክ፦ ${member.phone}",
              fontSize = 10.sp,
              color = AntiqueGoldDark,
              fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
              text = "• የተመደቡ ሥራዎች፦ ${member.assignedWorksCount}",
              fontSize = 10.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }

      if (onDeleteClick != null) {
        IconButton(
          onClick = onDeleteClick,
          modifier = Modifier.size(28.dp)
        ) {
          Icon(
            imageVector = Icons.Filled.Delete,
            contentDescription = "አባል ሰርዝ",
            tint = Color.Red.copy(alpha = 0.6f),
            modifier = Modifier.size(16.dp)
          )
        }
      }
    }
  }
}

/**
 * Writer Profile Card
 */
@Composable
fun WriterCard(
  writer: Writer,
  onClick: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  ManuscriptBox(
    modifier = modifier
      .width(220.dp)
      .clickable(
        interactionSource = remember { MutableInteractionSource() },
        indication = ripple(bounded = true),
        onClick = onClick
      )
      .testTag("writer_card_${writer.id}"),
    contentPadding = 14.dp
  ) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
      Box(
        modifier = Modifier
          .size(54.dp)
          .clip(CircleShape)
          .background(MaterialTheme.colorScheme.primaryContainer)
          .border(1.5.dp, AntiqueGold, CircleShape),
        contentAlignment = Alignment.Center
      ) {
        Text(
          text = writer.name.take(1),
          style = MaterialTheme.typography.titleLarge,
          color = MaterialTheme.colorScheme.primary,
          fontWeight = FontWeight.Bold,
          fontFamily = FontFamily.Serif
        )
      }

      Spacer(modifier = Modifier.height(8.dp))

      Text(
        text = writer.name,
        style = MaterialTheme.typography.titleSmall,
        color = MaterialTheme.colorScheme.onSurface,
        fontWeight = FontWeight.Bold,
        textAlign = TextAlign.Center
      )

      Text(
        text = writer.roleTitle,
        style = MaterialTheme.typography.bodySmall,
        color = AntiqueGoldDark,
        fontSize = 11.sp,
        textAlign = TextAlign.Center,
        maxLines = 1
      )

      Spacer(modifier = Modifier.height(6.dp))

      Box(
        modifier = Modifier
          .clip(RoundedCornerShape(4.dp))
          .background(MaterialTheme.colorScheme.surfaceVariant)
          .padding(horizontal = 8.dp, vertical = 2.dp)
      ) {
        Text(
          text = "${writer.totalWorks} የተመዘገቡ ሥራዎች",
          fontSize = 10.sp,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    }
  }
}

/**
 * Primary Archival Button
 */
@Composable
fun PrimaryButton(
  text: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
  icon: ImageVector? = null
) {
  Box(
    modifier = modifier
      .heightIn(min = 48.dp)
      .clip(RoundedCornerShape(8.dp))
      .background(
        if (enabled) Brush.horizontalGradient(
          listOf(ManuscriptBurgundy, ManuscriptBurgundyLight)
        ) else Brush.horizontalGradient(listOf(Color.Gray, Color.LightGray))
      )
      .border(1.dp, AntiqueGold.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
      .clickable(
        enabled = enabled,
        interactionSource = remember { MutableInteractionSource() },
        indication = ripple(bounded = true),
        onClick = onClick
      )
      .padding(horizontal = 20.dp, vertical = 12.dp)
      .testTag("primary_btn"),
    contentAlignment = Alignment.Center
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.Center
    ) {
      if (icon != null) {
        Icon(
          imageVector = icon,
          contentDescription = null,
          tint = Color.White,
          modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
      }
      Text(
        text = text,
        color = Color.White,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.Bold
      )
    }
  }
}

/**
 * Secondary Archival Button
 */
@Composable
fun SecondaryButton(
  text: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  icon: ImageVector? = null
) {
  Box(
    modifier = modifier
      .heightIn(min = 48.dp)
      .clip(RoundedCornerShape(8.dp))
      .background(MaterialTheme.colorScheme.surface)
      .border(1.5.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(8.dp))
      .clickable(
        interactionSource = remember { MutableInteractionSource() },
        indication = ripple(bounded = true),
        onClick = onClick
      )
      .padding(horizontal = 18.dp, vertical = 12.dp)
      .testTag("secondary_btn"),
    contentAlignment = Alignment.Center
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.Center
    ) {
      if (icon != null) {
        Icon(
          imageVector = icon,
          contentDescription = null,
          tint = MaterialTheme.colorScheme.primary,
          modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
      }
      Text(
        text = text,
        color = MaterialTheme.colorScheme.primary,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.Bold
      )
    }
  }
}

/**
 * Editorial Search Bar (Floating Island Capsule style)
 */
@Composable
fun SearchBar(
  query: String,
  onQueryChange: (String) -> Unit,
  placeholderText: String = "በስራ ርእስ፣ በደራሲ ወይም በይዘት ፈልግ...",
  modifier: Modifier = Modifier
) {
  Surface(
    shape = RoundedCornerShape(22.dp),
    color = MaterialTheme.colorScheme.surface,
    tonalElevation = 2.dp,
    shadowElevation = 3.dp,
    border = BorderStroke(1.dp, AntiqueGold.copy(alpha = 0.35f)),
    modifier = modifier.fillMaxWidth()
  ) {
    OutlinedTextField(
      value = query,
      onValueChange = onQueryChange,
      modifier = Modifier
        .fillMaxWidth()
        .testTag("search_input_field"),
      placeholder = {
        Text(
          text = placeholderText,
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
        )
      },
      leadingIcon = {
        Icon(
          imageVector = Icons.Filled.Search,
          contentDescription = "ፈልግ",
          tint = AntiqueGold
        )
      },
      trailingIcon = {
        if (query.isNotEmpty()) {
          IconButton(onClick = { onQueryChange("") }) {
            Icon(
              imageVector = Icons.Filled.Clear,
              contentDescription = "አጽዳ",
              tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      },
      singleLine = true,
      shape = RoundedCornerShape(22.dp),
      colors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = Color.Transparent,
        unfocusedBorderColor = Color.Transparent,
        focusedContainerColor = Color.Transparent,
        unfocusedContainerColor = Color.Transparent
      )
    )
  }
}

/**
 * Empty State component with manuscript aesthetic
 */
@Composable
fun EmptyState(
  title: String,
  message: String,
  modifier: Modifier = Modifier,
  actionText: String? = null,
  onActionClick: () -> Unit = {}
) {
  Column(
    modifier = modifier
      .fillMaxWidth()
      .padding(32.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
  ) {
    ManuscriptSeal(text = "ኪነጥበብ", color = AntiqueGold)
    Spacer(modifier = Modifier.height(16.dp))
    Text(
      text = title,
      style = MaterialTheme.typography.titleMedium,
      color = MaterialTheme.colorScheme.onSurface,
      fontWeight = FontWeight.Bold,
      textAlign = TextAlign.Center
    )
    Spacer(modifier = Modifier.height(6.dp))
    Text(
      text = message,
      style = MaterialTheme.typography.bodyMedium,
      color = MaterialTheme.colorScheme.onSurfaceVariant,
      textAlign = TextAlign.Center
    )
    if (actionText != null) {
      Spacer(modifier = Modifier.height(18.dp))
      SecondaryButton(text = actionText, onClick = onActionClick)
    }
  }
}

/**
 * Loading State with manuscript gold spinner
 */
@Composable
fun LoadingState(modifier: Modifier = Modifier) {
  Box(
    modifier = modifier
      .fillMaxWidth()
      .padding(32.dp),
    contentAlignment = Alignment.Center
  ) {
    CircularProgressIndicator(
      color = AntiqueGold,
      strokeWidth = 3.dp,
      modifier = Modifier.size(36.dp)
    )
  }
}

/**
 * Confirmation Modal with manuscript styling
 */
@Composable
fun ConfirmationModal(
  title: String,
  message: String,
  confirmButtonText: String,
  dismissButtonText: String = "ይቅር",
  onConfirm: () -> Unit,
  onDismiss: () -> Unit
) {
  Dialog(onDismissRequest = onDismiss) {
    ManuscriptBox(
      modifier = Modifier.fillMaxWidth(),
      contentPadding = 20.dp
    ) {
      Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
          text = title,
          style = MaterialTheme.typography.titleLarge,
          color = MaterialTheme.colorScheme.primary,
          fontWeight = FontWeight.Bold,
          textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(10.dp))
        Text(
          text = message,
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurface,
          textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(20.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          SecondaryButton(
            text = dismissButtonText,
            onClick = onDismiss,
            modifier = Modifier.weight(1f)
          )
          PrimaryButton(
            text = confirmButtonText,
            onClick = {
              onConfirm()
              onDismiss()
            },
            modifier = Modifier.weight(1f)
          )
        }
      }
    }
  }
}
