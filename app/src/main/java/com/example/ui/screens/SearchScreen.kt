package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.border
import androidx.compose.ui.graphics.Color
import com.example.data.ArchiveRepository
import com.example.model.SundaySchoolDivision
import com.example.ui.components.AppHeader
import com.example.ui.components.EmptyState
import com.example.ui.components.SearchBar
import com.example.ui.components.WorkCard
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ChurchGoldenYellow
import com.example.ui.theme.ChurchRoyalBlue

@Composable
fun SearchScreen(
  repository: ArchiveRepository,
  onWorkClick: (String) -> Unit,
  modifier: Modifier = Modifier
) {
  val works by repository.works.collectAsState()
  val activeDivision by repository.selectedDivision.collectAsState()
  var searchQuery by remember { mutableStateOf("") }
  var selectedDivisionFilter by remember { mutableStateOf<SundaySchoolDivision?>(activeDivision) }
  var selectedCategoryFilter by remember { mutableStateOf("all") }

  val filterCategories = listOf("all" to "ሁሉም ምድቦች") + repository.categories.map { it.id to it.nameAmharic }

  val filteredWorks = works.filter { work ->
    val matchesDivision = if (selectedDivisionFilter != null) work.division == selectedDivisionFilter else true
    val matchesCategory = if (selectedCategoryFilter == "all") true else work.categoryId == selectedCategoryFilter
    val matchesQuery = if (searchQuery.isBlank()) true else {
      work.title.contains(searchQuery, ignoreCase = true) ||
      work.writerName.contains(searchQuery, ignoreCase = true) ||
      work.excerpt.contains(searchQuery, ignoreCase = true) ||
      work.content.contains(searchQuery, ignoreCase = true) ||
      work.tags.any { it.contains(searchQuery, ignoreCase = true) }
    }
    matchesDivision && matchesCategory && matchesQuery
  }

  Column(modifier = modifier.fillMaxSize()) {
    AppHeader(
      title = "ፈልግ",
      subtitle = "በመዝገቡ ውስጥ የተካተቱ የኪነጥበብ ስራዎች ፍለጋ"
    )

    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("search_screen_content"),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
      item {
        SearchBar(
          query = searchQuery,
          onQueryChange = { searchQuery = it },
          placeholderText = "በርዕስ፣ በደራሲ ወይም በስንኝ ፈልግ..."
        )
      }

      // Division Filter Chips Row (ሕፃናት ፣ ማዕከላውያን ፣ ወጣት)
      item {
        LazyRow(
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          contentPadding = PaddingValues(vertical = 2.dp)
        ) {
          item {
            val isAllSelected = selectedDivisionFilter == null
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(18.dp))
                .background(if (isAllSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                .clickable { selectedDivisionFilter = null }
                .padding(horizontal = 12.dp, vertical = 6.dp)
                .testTag("search_division_filter_all")
            ) {
              Text(
                text = "ሁሉም ክፍሎች",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = if (isAllSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
              )
            }
          }

          items(SundaySchoolDivision.entries) { div ->
            val isSelected = selectedDivisionFilter == div
            val badgeColor = when (div) {
              SundaySchoolDivision.CHILDREN -> ChurchGoldenYellow
              SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlue
              SundaySchoolDivision.YOUTH -> AntiqueGoldDark
            }
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(18.dp))
                .background(
                  if (isSelected) badgeColor.copy(alpha = 0.2f)
                  else MaterialTheme.colorScheme.surfaceVariant
                )
                .border(
                  width = if (isSelected) 1.5.dp else 0.dp,
                  color = if (isSelected) badgeColor else Color.Transparent,
                  shape = RoundedCornerShape(18.dp)
                )
                .clickable { selectedDivisionFilter = div }
                .padding(horizontal = 12.dp, vertical = 6.dp)
                .testTag("search_division_filter_${div.id}")
            ) {
              Text(
                text = div.titleAmharic,
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) badgeColor else MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }
      }

      // Category Filter Chips Row
      item {
        LazyRow(
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          contentPadding = PaddingValues(vertical = 4.dp)
        ) {
          items(filterCategories) { (catId, catLabel) ->
            val isSelected = selectedCategoryFilter == catId
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(
                  if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                )
                .clickable { selectedCategoryFilter = catId }
                .padding(horizontal = 14.dp, vertical = 6.dp)
                .testTag("search_filter_$catId")
            ) {
              Text(
                text = catLabel,
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }
      }

      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "የተገኙ ውጤቶች (${filteredWorks.size})",
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Serif
          )
          if (searchQuery.isNotBlank() || selectedCategoryFilter != "all") {
            Text(
              text = "ማጣሪያውን አጽዳ",
              style = MaterialTheme.typography.labelSmall,
              color = AntiqueGoldDark,
              modifier = Modifier.clickable {
                searchQuery = ""
                selectedCategoryFilter = "all"
              }
            )
          }
        }
      }

      if (filteredWorks.isEmpty()) {
        item {
          EmptyState(
            title = "ምንም ስራ አልተገኘም",
            message = "የተጻፈውን ቃል አስተካክለው ይሞክሩ ወይም ሌላ ምድብ ይምረጡ።",
            actionText = "ሁሉንም አሳይ",
            onActionClick = {
              searchQuery = ""
              selectedCategoryFilter = "all"
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
