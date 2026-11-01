package com.example.ui.screens

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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.FilterList
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
import androidx.compose.foundation.border
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.ArchiveRepository
import com.example.model.SundaySchoolDivision
import com.example.model.WorkCategory
import com.example.ui.components.AppHeader
import com.example.ui.components.EmptyState
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.SearchBar
import com.example.ui.components.WorkCard
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ChurchGoldenYellow
import com.example.ui.theme.ChurchRoyalBlue
import com.example.ui.theme.ManuscriptBurgundy

@Composable
fun CategoryDetailScreen(
  categoryId: String,
  repository: ArchiveRepository,
  onWorkClick: (String) -> Unit,
  onBackClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val category = repository.categories.find { it.id == categoryId } ?: repository.categories.first()
  val works by repository.works.collectAsState()
  val activeDivision by repository.selectedDivision.collectAsState()
  var selectedDivisionFilter by remember { mutableStateOf<SundaySchoolDivision?>(activeDivision) }
  var searchQuery by remember { mutableStateOf("") }
  var filterOnlyApproved by remember { mutableStateOf(false) }

  val categoryWorks = works.filter { it.categoryId == category.id }
  val filteredWorks = categoryWorks.filter { work ->
    val matchesDivision = if (selectedDivisionFilter != null) work.division == selectedDivisionFilter else true
    val matchesQuery = if (searchQuery.isBlank()) true
    else work.title.contains(searchQuery, ignoreCase = true) ||
         work.writerName.contains(searchQuery, ignoreCase = true) ||
         work.content.contains(searchQuery, ignoreCase = true)

    val matchesFilter = if (filterOnlyApproved) work.approvedBy != null else true
    matchesDivision && matchesQuery && matchesFilter
  }

  Column(modifier = modifier.fillMaxSize()) {
    AppHeader(
      title = category.nameAmharic,
      subtitle = category.nameEnglish,
      showBack = true,
      onBackClick = onBackClick
    )

    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("category_detail_content"),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
      // Category Artwork & Header Banner
      item {
        ManuscriptBox(
          modifier = Modifier.fillMaxWidth(),
          contentPadding = 0.dp
        ) {
          Column {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .height(130.dp)
            ) {
              Image(
                painter = painterResource(id = R.drawable.img_manuscript_hero),
                contentDescription = category.nameAmharic,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
              )
              Box(
                modifier = Modifier
                  .fillMaxSize()
                  .background(Color.Black.copy(alpha = 0.4f))
              )
              Column(
                modifier = Modifier
                  .fillMaxSize()
                  .padding(14.dp),
                verticalArrangement = Arrangement.Bottom
              ) {
                Text(
                  text = "የኪነጥበብ ዘርፍ መዝገብ",
                  color = AntiqueGold,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold
                )
                Text(
                  text = category.nameAmharic,
                  color = Color.White,
                  style = MaterialTheme.typography.headlineLarge,
                  fontFamily = FontFamily.Serif,
                  fontWeight = FontWeight.Bold
                )
              }
            }

            Column(modifier = Modifier.padding(14.dp)) {
              Text(
                text = category.descriptionAmharic,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
              )
              Spacer(modifier = Modifier.height(8.dp))
              HaragDivider(height = 10.dp)
              Spacer(modifier = Modifier.height(6.dp))
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = "በዚህ ምድብ ውስጥ ${categoryWorks.size} የተመዘገቡ ሥራዎች",
                  style = MaterialTheme.typography.labelSmall,
                  color = AntiqueGoldDark,
                  fontWeight = FontWeight.Bold
                )
                Box(
                  modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(
                      if (filterOnlyApproved) MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                      else MaterialTheme.colorScheme.surfaceVariant
                    )
                    .clickable { filterOnlyApproved = !filterOnlyApproved }
                    .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                  Text(
                    text = if (filterOnlyApproved) "የጸደቁ ብቻ (የተመረጡ)" else "ሁሉንም አሳይ",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                  )
                }
              }
            }
          }
        }
      }

      // Search Bar
      item {
        SearchBar(
          query = searchQuery,
          onQueryChange = { searchQuery = it },
          placeholderText = "በ${category.nameAmharic} ውስጥ ፈልግ..."
        )
      }

      // Sunday School Division filter chips
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(6.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          val isAllSelected = selectedDivisionFilter == null
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(16.dp))
              .background(if (isAllSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
              .clickable { selectedDivisionFilter = null }
              .padding(horizontal = 12.dp, vertical = 6.dp)
              .testTag("category_filter_all_divisions")
          ) {
            Text(
              text = "ሁሉም ክፍሎች",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = if (isAllSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
            )
          }

          SundaySchoolDivision.entries.forEach { div ->
            val isSelected = selectedDivisionFilter == div
            val badgeColor = when (div) {
              SundaySchoolDivision.CHILDREN -> ChurchGoldenYellow
              SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlue
              SundaySchoolDivision.YOUTH -> AntiqueGoldDark
            }
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(16.dp))
                .background(
                  if (isSelected) badgeColor.copy(alpha = 0.2f)
                  else MaterialTheme.colorScheme.surfaceVariant
                )
                .border(
                  width = if (isSelected) 1.5.dp else 0.dp,
                  color = if (isSelected) badgeColor else Color.Transparent,
                  shape = RoundedCornerShape(16.dp)
                )
                .clickable { selectedDivisionFilter = div }
                .padding(horizontal = 10.dp, vertical = 6.dp)
                .testTag("category_filter_${div.id}")
            ) {
              Text(
                text = div.titleAmharic,
                fontSize = 11.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) badgeColor else MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }
      }

      // Works List
      if (filteredWorks.isEmpty()) {
        item {
          EmptyState(
            title = "ምንም የተገኘ ስራ የለም",
            message = "ለተመረጠው የፍለጋ ቃል ወይም ማጣሪያ የሚዛመድ ስራ አልተገኘም።",
            actionText = "ፍለጋውን አጽዳ",
            onActionClick = {
              searchQuery = ""
              filterOnlyApproved = false
            }
          )
        }
      } else {
        items(filteredWorks, key = { it.id }) { work ->
          WorkCard(
            work = work,
            onClick = { onWorkClick(work.id) },
            onBookmarkClick = { repository.toggleBookmark(work.id) }
          )
        }
      }
    }
  }
}
