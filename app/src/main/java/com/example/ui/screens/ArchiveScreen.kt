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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import com.example.data.ArchiveRepository
import com.example.ui.components.AppHeader
import com.example.ui.components.CategoryCard
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.SearchBar
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ManuscriptBurgundy

@Composable
fun ArchiveScreen(
  repository: ArchiveRepository,
  onCategoryClick: (String) -> Unit,
  onSearchClick: () -> Unit,
  onCreateWorkClick: (() -> Unit)? = null,
  modifier: Modifier = Modifier
) {
  var searchQuery by remember { mutableStateOf("") }
  var selectedFilter by remember { mutableStateOf("ሁሉም") }

  val filteredCategories = repository.categories.filter {
    if (searchQuery.isBlank()) true
    else it.nameAmharic.contains(searchQuery, ignoreCase = true) ||
         it.nameEnglish.contains(searchQuery, ignoreCase = true) ||
         it.descriptionAmharic.contains(searchQuery, ignoreCase = true)
  }

  Column(modifier = modifier.fillMaxSize()) {
    AppHeader(
      title = "መዝገብ",
      subtitle = "የተክለ ሣዊሮስ ኪነጥበብ ቅርሶች እና ሰነዶች",
      actions = {
        IconButton(onClick = onSearchClick) {
          Icon(
            imageVector = Icons.Filled.Search,
            contentDescription = "ፈልግ",
            tint = MaterialTheme.colorScheme.primary
          )
        }
      }
    )

    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("archive_screen_content"),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      // Search Bar inside archive
      item {
        SearchBar(
          query = searchQuery,
          onQueryChange = { searchQuery = it },
          placeholderText = "የመዝገብ ምድቦችን ፈልግ..."
        )
      }

      // Archival Philosophy Banner
      item {
        ManuscriptBox(
          modifier = Modifier
            .fillMaxWidth()
            .testTag("archive_philosophy_card"),
          contentPadding = 14.dp
        ) {
          Column {
            Text(
              text = "የኪነጥበብ መዝገብ ቤት ፍልስፍና",
              style = MaterialTheme.typography.titleSmall,
              color = MaterialTheme.colorScheme.primary,
              fontWeight = FontWeight.Bold,
              fontFamily = FontFamily.Serif
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = "ፍጠር → ጠብቅ → ገምግም → አጽድቅ → አትም → አስታውስ",
              style = MaterialTheme.typography.bodySmall,
              color = AntiqueGoldDark,
              fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              text = "እያንዳንዱ የፈጠራ ስራ የሰንበት ትምህርት ቤቱን መንፈሳዊ ታሪክ የሚያበለጽግ የትውልድ አሻራ ነው።",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }

      // PDF Archive & Import Banner
      item {
        ManuscriptBox(
          modifier = Modifier
            .fillMaxWidth()
            .clickable { onCreateWorkClick?.invoke() }
            .testTag("archive_import_pdf_banner"),
          contentPadding = 14.dp
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .size(42.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(ManuscriptBurgundy.copy(alpha = 0.12f)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Filled.PictureAsPdf,
                contentDescription = "PDF",
                tint = ManuscriptBurgundy,
                modifier = Modifier.size(24.dp)
              )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = "የ PDF ሰነዶች መዝገብ (PDF Archive)",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = "ፒዲኤፍ ሰነዶችን ወደ መዝገቡ ያስመጡ ወይም ያውርዱ",
                style = MaterialTheme.typography.bodySmall,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
            Icon(
              imageVector = Icons.Filled.Add,
              contentDescription = "አስመጣ",
              tint = MaterialTheme.colorScheme.primary
            )
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
            text = "የተመዘገቡ ምድቦች (${filteredCategories.size})",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Serif
          )
          Text(
            text = "፲ ምድቦች በጠቅላላ",
            style = MaterialTheme.typography.labelSmall,
            color = AntiqueGoldDark
          )
        }
      }

      items(filteredCategories, key = { it.id }) { category ->
        CategoryCard(
          category = category,
          onClick = { onCategoryClick(category.id) }
        )
      }
    }
  }
}
