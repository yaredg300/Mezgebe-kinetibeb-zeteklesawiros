package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.R
import com.example.data.AppThemeMode
import com.example.data.ArchiveRepository
import com.example.model.SundaySchoolDivision
import com.example.model.WorkCategory
import com.example.model.WorkItem
import com.example.ui.components.AppHeader
import com.example.ui.components.CategoryCard
import com.example.ui.components.EventCard
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.QuickWorkPreviewBottomSheet
import com.example.ui.components.StatusBadge
import com.example.ui.components.WorkCard
import com.example.ui.components.WriterCard
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.AntiqueGoldLight
import com.example.ui.theme.ChurchGoldenYellow
import com.example.ui.theme.ChurchGoldenYellowLight
import com.example.ui.theme.ChurchRoyalBlue
import com.example.ui.theme.ChurchRoyalBlueDark
import com.example.ui.theme.ChurchRoyalBlueLight

@Composable
fun HomeScreen(
  repository: ArchiveRepository,
  onWorkClick: (String) -> Unit,
  onCategoryClick: (String) -> Unit,
  onSearchClick: () -> Unit,
  onCreateWorkClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val works by repository.works.collectAsState()
  val events by repository.events.collectAsState()
  val currentUser by repository.currentUser.collectAsState()
  val currentThemeMode by repository.themeMode.collectAsState()
  val selectedDivision by repository.selectedDivision.collectAsState()
  var showChurchInfoDialog by remember { mutableStateOf(false) }
  var previewWorkItem by remember { mutableStateOf<WorkItem?>(null) }

  // Branch separation: filter works based on selected Sunday School division
  val divisionWorks = remember(works, selectedDivision) {
    works.filter { it.division == selectedDivision }
  }
  val featuredWorks = remember(divisionWorks) {
    divisionWorks.filter { it.isFeatured }
  }
  val recentWorks = remember(divisionWorks) {
    divisionWorks.sortedByDescending { it.id }.take(4)
  }

  if (showChurchInfoDialog) {
    SundaySchoolIdentityDialog(onDismiss = { showChurchInfoDialog = false })
  }

  Box(modifier = modifier.fillMaxSize()) {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("home_screen_content"),
      contentPadding = PaddingValues(bottom = 96.dp)
    ) {
      // Header
      item {
        AppHeader(
          title = "መዝገበ ኪነጥበብ",
          subtitle = "ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት",
          actions = {
            IconButton(
              onClick = { showChurchInfoDialog = true },
              modifier = Modifier.testTag("header_church_info_btn")
            ) {
              Icon(
                imageVector = Icons.Filled.Info,
                contentDescription = "ስለ ሰንበት ት/ቤቱ",
                tint = MaterialTheme.colorScheme.primary
              )
            }
            IconButton(
              onClick = { repository.toggleThemeMode() },
              modifier = Modifier.testTag("header_theme_toggle_btn")
            ) {
              Icon(
                imageVector = if (currentThemeMode == AppThemeMode.DARK) Icons.Filled.LightMode else Icons.Filled.DarkMode,
                contentDescription = if (currentThemeMode == AppThemeMode.DARK) "ብሩህ ገጽታ (Bright Mode)" else "የጨለማ ገጽታ (Dark Mode)",
                tint = MaterialTheme.colorScheme.primary
              )
            }
            IconButton(
              onClick = onSearchClick,
              modifier = Modifier.testTag("header_search_btn")
            ) {
              Icon(
                imageVector = Icons.Filled.Search,
                contentDescription = "ፈልግ",
                tint = MaterialTheme.colorScheme.primary
              )
            }
          }
        )
      }

      // Hero Sunday School Identity Banner
      item {
        ManuscriptBox(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp)
            .testTag("home_hero_banner"),
          backgroundColor = MaterialTheme.colorScheme.surface,
          contentPadding = 0.dp
        ) {
          Column {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .background(
                  Brush.verticalGradient(
                    colors = listOf(
                      ChurchRoyalBlueDark,
                      ChurchRoyalBlue
                    )
                  )
                )
                .clickable { showChurchInfoDialog = true }
                .padding(16.dp)
            ) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
              ) {
                // Official Sunday School Logo
                Box(
                  modifier = Modifier
                    .size(76.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .border(2.5.dp, AntiqueGold, CircleShape)
                    .padding(3.dp)
                    .border(1.dp, ChurchGoldenYellowLight, CircleShape),
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

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                  ) {
                    Box(
                      modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(ChurchGoldenYellowLight.copy(alpha = 0.25f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                      Text(
                        text = "፲፱፻፶፯ • 1957 ዓ.ም.",
                        color = ChurchGoldenYellowLight,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                      )
                    }
                  }
                  Spacer(modifier = Modifier.height(4.dp))
                  Text(
                    text = "ተክለ ሳዊሮስ ሰንበት ት/ቤት",
                    color = Color.White,
                    style = MaterialTheme.typography.titleMedium,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold
                  )
                  Text(
                    text = "የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን",
                    color = Color.White.copy(alpha = 0.88f),
                    fontSize = 11.sp,
                    lineHeight = 15.sp,
                    maxLines = 2
                  )
                  Spacer(modifier = Modifier.height(4.dp))
                  Text(
                    text = "«በእግዚአብሔር ቃል የታነጸ፣ በኪነጥበብ የጎለበተ ትውልድ»",
                    color = AntiqueGoldLight,
                    fontSize = 11.sp,
                    maxLines = 1
                  )
                }
              }
            }

            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
              horizontalArrangement = Arrangement.SpaceAround,
              verticalAlignment = Alignment.CenterVertically
            ) {
              ArchiveStatItem(number = "${works.size}", label = "የተመዘገቡ ሥራዎች")
              Text(text = "•", color = AntiqueGold)
              ArchiveStatItem(number = "${repository.categories.size}", label = "ምድቦች")
              Text(text = "•", color = AntiqueGold)
              ArchiveStatItem(number = "${repository.writers.size}", label = "ደራስያን")
            }
          }
        }
      }

      // Floating Island for Age Division Selection (ሕፃናት ፣ ማዕከላውያን ፣ ወጣት)
      item {
        DivisionBranchFloatingIsland(
          selectedDivision = selectedDivision,
          onDivisionSelected = { repository.selectDivision(it) },
          totalDivisionWorks = divisionWorks.size
        )
      }

      // Floating Creation Prompt Capsule (inspired by modern island UX)
      item {
        FloatingCreationPromptCapsule(
          onSearchClick = onSearchClick,
          onCreateWorkClick = onCreateWorkClick
        )
      }

      // Floating Board Workspace Cards (Mine, Team, Drafts + Quick Add Card)
      item {
        FloatingBoardsSection(
          works = divisionWorks,
          onWorkClick = onWorkClick,
          onCreateWorkClick = onCreateWorkClick,
          onSearchClick = onSearchClick
        )
      }

      // 1. ተመራጭ ሥራዎች (Featured Works)
      item {
        Spacer(modifier = Modifier.height(10.dp))
        SectionTitleHeader(
          title = "ተመራጭ ሥራዎች",
          subtitle = "የ«${selectedDivision.titleAmharic}» ቅርንጫፍ ተመራጭ የኪነጥበብ ሥራዎች"
        )
      }

      if (featuredWorks.isEmpty()) {
        item {
          ManuscriptBox(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 16.dp, vertical = 6.dp),
            contentPadding = 16.dp
          ) {
            Column(
              modifier = Modifier.fillMaxWidth(),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = "በ«${selectedDivision.titleAmharic}» ክፍል እስካሁን ተመራጭ ሥራ አልተመደበም",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
              )
              Spacer(modifier = Modifier.height(8.dp))
              androidx.compose.material3.TextButton(onClick = onCreateWorkClick) {
                Text("ለዚህ ክፍል አዲስ ስራ አቅርብ +", color = AntiqueGoldDark, fontWeight = FontWeight.Bold)
              }
            }
          }
        }
      } else {
        item {
          LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.padding(bottom = 12.dp)
          ) {
            items(featuredWorks, key = { it.id }) { work ->
              Box(modifier = Modifier.width(310.dp)) {
                WorkCard(
                  work = work,
                  onClick = { onWorkClick(work.id) },
                  onBookmarkClick = { repository.toggleBookmark(work.id) },
                  onQuickPreviewClick = { previewWorkItem = work }
                )
              }
            }
          }
        }
      }

      // 2. የኪነጥበብ ምድቦች (Art Categories Preview)
      item {
        SectionTitleHeader(title = "የኪነጥበብ ምድቦች", subtitle = "በዘርፍ የተከፋፈሉ የስነ ጥበብ ዘርፎች")
      }

      items(repository.categories.take(4), key = { it.id }) { cat ->
        Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 5.dp)) {
          CategoryCard(
            category = cat,
            onClick = { onCategoryClick(cat.id) }
          )
        }
      }

      // 3. አዲስ የተጨመሩ (Recently Added)
      item {
        Spacer(modifier = Modifier.height(12.dp))
        SectionTitleHeader(title = "አዲስ የተጨመሩ", subtitle = "በቅርቡ ወደ መዝገቡ የገቡ የፈጠራ ስራዎች")
      }

      items(recentWorks, key = { it.id }) { work ->
        Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
          WorkCard(
            work = work,
            onClick = { onWorkClick(work.id) },
            onBookmarkClick = { repository.toggleBookmark(work.id) },
            onQuickPreviewClick = { previewWorkItem = work }
          )
        }
      }

      // 4. ተመራጭ ደራሲያን (Featured Writers)
      item {
        Spacer(modifier = Modifier.height(14.dp))
        SectionTitleHeader(title = "ተመራጭ ደራሲያን", subtitle = "ለሰንበት ት/ቤቱ የኪነጥበብ ክፍል ያበረከቱ")
      }

      item {
        LazyRow(
          contentPadding = PaddingValues(horizontal = 16.dp),
          horizontalArrangement = Arrangement.spacedBy(12.dp),
          modifier = Modifier.padding(bottom = 12.dp)
        ) {
          items(repository.writers, key = { it.id }) { writer ->
            WriterCard(writer = writer)
          }
        }
      }

      // 5. የሚመጡ ዝግጅቶች (Upcoming Events)
      item {
        Spacer(modifier = Modifier.height(14.dp))
        SectionTitleHeader(title = "የሚመጡ ዝግጅቶች", subtitle = "የኪነጥበብ ምሽቶች፣ ኤግዚቢሽኖችና አውደ ጥናቶች")
      }

      items(events, key = { it.id }) { event ->
        Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
          EventCard(event = event)
        }
      }
    }

    // Floating Action Button for Creators
    FloatingActionButton(
      onClick = onCreateWorkClick,
      containerColor = MaterialTheme.colorScheme.primary,
      contentColor = Color.White,
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(end = 20.dp, bottom = 24.dp)
        .testTag("floating_create_work_btn")
    ) {
      Row(
        modifier = Modifier.padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Icon(imageVector = Icons.Filled.Add, contentDescription = "ስራ አቅርብ")
        Spacer(modifier = Modifier.width(6.dp))
        Text(
          text = "ስራ አቅርብ",
          style = MaterialTheme.typography.labelLarge,
          fontWeight = FontWeight.Bold
        )
      }
    }

    // Modern Quick Manuscript Preview Bottom Sheet
    previewWorkItem?.let { item ->
      QuickWorkPreviewBottomSheet(
        work = item,
        onDismiss = { previewWorkItem = null },
        onOpenFullDetail = { workId ->
          previewWorkItem = null
          onWorkClick(workId)
        },
        onPlayAudio = { workItem ->
          repository.playWorkAudio(workItem)
        },
        onToggleBookmark = { workId ->
          repository.toggleBookmark(workId)
        }
      )
    }
  }
}

@Composable
private fun SectionTitleHeader(title: String, subtitle: String) {
  Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      Box(
        modifier = Modifier
          .size(4.dp, 18.dp)
          .background(AntiqueGold, RoundedCornerShape(2.dp))
      )
      Spacer(modifier = Modifier.width(8.dp))
      Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Serif
      )
    }
    Text(
      text = subtitle,
      style = MaterialTheme.typography.bodySmall,
      color = MaterialTheme.colorScheme.onSurfaceVariant,
      modifier = Modifier.padding(start = 12.dp, top = 2.dp)
    )
  }
}

@Composable
private fun ArchiveStatItem(number: String, label: String) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Text(
      text = number,
      style = MaterialTheme.typography.titleMedium,
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
fun SundaySchoolIdentityDialog(
  onDismiss: () -> Unit
) {
  Dialog(onDismissRequest = onDismiss) {
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(16.dp))
        .background(MaterialTheme.colorScheme.surface)
        .border(1.5.dp, AntiqueGold, RoundedCornerShape(16.dp))
        .padding(20.dp)
        .testTag("sunday_school_info_dialog")
    ) {
      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.End
        ) {
          IconButton(
            onClick = onDismiss,
            modifier = Modifier.size(32.dp)
          ) {
            Icon(
              imageVector = Icons.Filled.Close,
              contentDescription = "ዝጋ",
              tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }

        // Sunday School Official Emblem
        Box(
          modifier = Modifier
            .size(110.dp)
            .clip(CircleShape)
            .background(Color.White)
            .border(3.dp, AntiqueGold, CircleShape)
            .padding(4.dp)
            .border(1.dp, ChurchGoldenYellowLight, CircleShape),
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

        Spacer(modifier = Modifier.height(14.dp))

        Text(
          text = "ተክለ ሳዊሮስ ሰንበት ት/ቤት",
          style = MaterialTheme.typography.titleLarge,
          fontWeight = FontWeight.Bold,
          fontFamily = FontFamily.Serif,
          color = MaterialTheme.colorScheme.primary,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
          text = "የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን",
          style = MaterialTheme.typography.bodySmall,
          color = AntiqueGoldDark,
          textAlign = TextAlign.Center,
          fontWeight = FontWeight.Medium,
          lineHeight = 16.sp
        )

        Spacer(modifier = Modifier.height(6.dp))

        Box(
          modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(AntiqueGold.copy(alpha = 0.15f))
            .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
          Text(
            text = "የተመሰረተበት ዓ.ም.፦ ፲፱፻፶፯ / 1957",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
          )
        }

        Spacer(modifier = Modifier.height(14.dp))

        HaragDivider(height = 12.dp)

        Spacer(modifier = Modifier.height(12.dp))

        Text(
          text = "«በእግዚአብሔር ቃል የታነጸ፣ በኪነጥበብ የጎለበተ ትውልድ»",
          style = MaterialTheme.typography.bodyMedium,
          fontWeight = FontWeight.Medium,
          fontFamily = FontFamily.Serif,
          color = MaterialTheme.colorScheme.onSurface,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(14.dp))

        Column(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f))
            .padding(12.dp)
        ) {
          Text(
            text = "የሰንበት ት/ቤቱ ዋና ዋና ክፍሎች",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
          )
          Spacer(modifier = Modifier.height(6.dp))
          Text(
            text = "• የኪነ ጥበብና ተውኔት ክፍል (ድራማ፣ ስነ ግጥም፣ መጣጥፍ)\n• የመዝሙርና ዜማ ክፍል\n• የትምህርትና ስልጠና ክፍል\n• የህዝብ ግንኙነትና የሚዲያ ክፍል",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface,
            lineHeight = 20.sp
          )
        }

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(
          onClick = onDismiss,
          modifier = Modifier.fillMaxWidth()
        ) {
          Text(
            text = "እሺ",
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
          )
        }
      }
    }
  }
}

/**
 * Floating Creation Prompt Capsule
 * Inspired by modern detached island input interface (Linear/Raycast style)
 */
@Composable
fun FloatingCreationPromptCapsule(
  onSearchClick: () -> Unit,
  onCreateWorkClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Column(
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 16.dp, vertical = 10.dp),
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Text(
      text = "ዛሬ ምን መፍጠር ወይም መመዝገብ ይፈልጋሉ?",
      style = MaterialTheme.typography.titleMedium,
      fontWeight = FontWeight.Bold,
      color = MaterialTheme.colorScheme.onSurface,
      textAlign = TextAlign.Center
    )
    Spacer(modifier = Modifier.height(2.dp))
    Text(
      text = "የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ መዝገብ",
      style = MaterialTheme.typography.bodySmall,
      color = AntiqueGoldDark,
      textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(12.dp))

    // Floating Prompt Capsule
    Surface(
      shape = RoundedCornerShape(24.dp),
      color = MaterialTheme.colorScheme.surface,
      tonalElevation = 3.dp,
      shadowElevation = 6.dp,
      border = BorderStroke(1.dp, AntiqueGold.copy(alpha = 0.35f)),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("floating_prompt_capsule")
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 12.dp)
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier
            .fillMaxWidth()
            .clickable { onSearchClick() }
        ) {
          Text(
            text = "የስራውን ርዕስ፣ ግጥም፣ ተውኔት ወይም ዜማ እዚህ ይፈልጉ...",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
            modifier = Modifier.weight(1f)
          )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.08f))
                .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
              Text(
                text = "የፈጠራ ረቂቅ",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Medium
              )
            }
          }

          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            // Attachment Icon
            IconButton(
              onClick = onCreateWorkClick,
              modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
            ) {
              Icon(
                imageVector = Icons.Filled.AttachFile,
                contentDescription = "ሰነድ አያይዝ",
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(18.dp)
              )
            }

            // Audio / Mic Icon
            IconButton(
              onClick = onSearchClick,
              modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
            ) {
              Icon(
                imageVector = Icons.Filled.Mic,
                contentDescription = "ድምጽ/ዜማ",
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(18.dp)
              )
            }

            // Up Arrow / Send Button
            Box(
              modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primary)
                .clickable { onCreateWorkClick() },
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Filled.ArrowUpward,
                contentDescription = "መዝግብ",
                tint = Color.White,
                modifier = Modifier.size(18.dp)
              )
            }
          }
        }
      }
    }
  }
}

/**
 * Floating Board Workspace Cards (Mine, Team, Drafts + Quick Add Card)
 * Inspired by modern detached island board navigation
 */
@Composable
fun FloatingBoardsSection(
  works: List<WorkItem>,
  onWorkClick: (String) -> Unit,
  onCreateWorkClick: () -> Unit,
  onSearchClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  var selectedTab by remember { mutableStateOf(0) }
  val tabs = listOf("የእኔ ሥራዎች", "የሰንበት ት/ቤት", "ረቂቆች")

  Column(modifier = modifier.fillMaxWidth()) {
    // Header with Filter Pills and Search Chip
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 6.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        tabs.forEachIndexed { index, title ->
          val isSelected = selectedTab == index
          Text(
            text = title,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier
              .clip(RoundedCornerShape(8.dp))
              .background(
                if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) else Color.Transparent
              )
              .clickable { selectedTab = index }
              .padding(horizontal = 8.dp, vertical = 5.dp)
          )
        }
      }

      // Search Pill on Right
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
          .clip(RoundedCornerShape(16.dp))
          .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
          .clickable { onSearchClick() }
          .padding(horizontal = 10.dp, vertical = 5.dp)
      ) {
        Icon(
          imageVector = Icons.Filled.Search,
          contentDescription = "ፈልግ",
          tint = MaterialTheme.colorScheme.onSurfaceVariant,
          modifier = Modifier.size(13.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
          text = "ፈልግ...",
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    }

    // Floating Boards Row
    LazyRow(
      contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
      horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
      // 1. "+ Add New Board / Work" Card
      item {
        Surface(
          shape = RoundedCornerShape(20.dp),
          color = MaterialTheme.colorScheme.surface,
          tonalElevation = 2.dp,
          shadowElevation = 4.dp,
          border = BorderStroke(1.2.dp, AntiqueGold.copy(alpha = 0.4f)),
          modifier = Modifier
            .width(170.dp)
            .height(180.dp)
            .clip(RoundedCornerShape(20.dp))
            .clickable { onCreateWorkClick() }
            .testTag("floating_new_work_card")
        ) {
          Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
          ) {
            Box(
              modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
                .border(1.2.dp, MaterialTheme.colorScheme.primary, CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Filled.Add,
                contentDescription = "አዲስ ሥራ",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(26.dp)
              )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
              text = "አዲስ ሥራ መዝግብ",
              style = MaterialTheme.typography.labelMedium,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
              text = "ተውኔት • ግጥም • ዜማ",
              style = MaterialTheme.typography.labelSmall,
              color = AntiqueGoldDark
            )
          }
        }
      }

      // 2. Real Work Board Cards with miniature preview layout
      items(works.take(4), key = { it.id }) { work ->
        Surface(
          shape = RoundedCornerShape(20.dp),
          color = MaterialTheme.colorScheme.surface,
          tonalElevation = 2.dp,
          shadowElevation = 4.dp,
          border = BorderStroke(1.dp, AntiqueGold.copy(alpha = 0.3f)),
          modifier = Modifier
            .width(185.dp)
            .height(180.dp)
            .clip(RoundedCornerShape(20.dp))
            .clickable { onWorkClick(work.id) }
            .testTag("floating_board_card_${work.id}")
        ) {
          Column(
            modifier = Modifier
              .fillMaxSize()
              .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
          ) {
            Column {
              Text(
                text = work.title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1
              )
              Text(
                text = "የተመዘገበ: ${work.dateAmharic}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1
              )
            }

            // Miniature 4-cell layout inspired by the reference board thumbnail
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(vertical = 6.dp),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              Box(
                modifier = Modifier
                  .weight(1f)
                  .fillMaxHeight()
                  .clip(RoundedCornerShape(8.dp))
                  .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.08f)),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = work.categoryName.take(2),
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.primary
                )
              }
              Column(
                modifier = Modifier
                  .weight(1f)
                  .fillMaxHeight(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(AntiqueGold.copy(alpha = 0.15f))
                )
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                )
              }
            }

            // Bottom metadata pill
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = work.writerName,
                style = MaterialTheme.typography.labelSmall,
                color = AntiqueGoldDark,
                maxLines = 1,
                modifier = Modifier.weight(1f)
              )
              StatusBadge(status = work.status)
            }
          }
        }
      }
    }
  }
}

/**
 * Interactive Floating Island for Sunday School Age Division Branching:
 * ፩. ሕፃናት (Children: 4-12 yrs)
 * ፪. ማዕከላውያን (Intermediates: 13-18 yrs)
 * ፫. ወጣት (Youth: 19+ yrs)
 * Tapping any branch filters the whole content and updates the global repository state.
 */
@Composable
fun DivisionBranchFloatingIsland(
  selectedDivision: SundaySchoolDivision,
  onDivisionSelected: (SundaySchoolDivision) -> Unit,
  totalDivisionWorks: Int,
  modifier: Modifier = Modifier
) {
  val (activeBadgeColor, activeBadgeBg) = when (selectedDivision) {
    SundaySchoolDivision.CHILDREN -> ChurchGoldenYellow to ChurchGoldenYellowLight.copy(alpha = 0.3f)
    SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlue to ChurchRoyalBlueLight.copy(alpha = 0.25f)
    SundaySchoolDivision.YOUTH -> AntiqueGoldDark to AntiqueGold.copy(alpha = 0.2f)
  }

  Surface(
    shape = RoundedCornerShape(22.dp),
    color = MaterialTheme.colorScheme.surface,
    tonalElevation = 3.dp,
    shadowElevation = 4.dp,
    border = BorderStroke(1.2.dp, activeBadgeColor.copy(alpha = 0.4f)),
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 16.dp, vertical = 6.dp)
      .testTag("division_floating_island")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(14.dp)
    ) {
      // Branch Title Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Box(
            modifier = Modifier
              .size(10.dp)
              .clip(CircleShape)
              .background(activeBadgeColor)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "የኪነጥበብ ቅርንጫፍ (የዕድሜ እርከን)",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Surface(
          shape = RoundedCornerShape(10.dp),
          color = activeBadgeBg,
          border = BorderStroke(0.5.dp, activeBadgeColor.copy(alpha = 0.5f))
        ) {
          Text(
            text = "$totalDivisionWorks ሥራዎች",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = activeBadgeColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // 3 Floating Capsule Segmented Buttons (ሕፃናት | ማዕከላውያን | ወጣት)
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        SundaySchoolDivision.entries.forEach { div ->
          val isSelected = div == selectedDivision
          val (badgeColor, bgFill) = when (div) {
            SundaySchoolDivision.CHILDREN -> ChurchGoldenYellow to ChurchGoldenYellowLight.copy(alpha = 0.32f)
            SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlue to ChurchRoyalBlueLight.copy(alpha = 0.28f)
            SundaySchoolDivision.YOUTH -> AntiqueGold to AntiqueGold.copy(alpha = 0.18f)
          }

          Surface(
            onClick = { onDivisionSelected(div) },
            shape = RoundedCornerShape(16.dp),
            color = if (isSelected) bgFill else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
            border = BorderStroke(
              width = if (isSelected) 2.dp else 0.8.dp,
              color = if (isSelected) badgeColor else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
            ),
            modifier = Modifier
              .weight(1f)
              .testTag("home_division_pill_${div.id}")
          ) {
            Column(
              modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = div.titleAmharic,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) badgeColor else MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = div.ageRangeAmharic,
                style = MaterialTheme.typography.labelSmall,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // Spiritual Motto / Verse for this branch
      Text(
        text = selectedDivision.mottoAmharic,
        style = MaterialTheme.typography.labelSmall,
        color = AntiqueGoldDark,
        fontFamily = FontFamily.Serif,
        modifier = Modifier.padding(horizontal = 4.dp)
      )
    }
  }
}

