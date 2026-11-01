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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Publish
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
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
import androidx.compose.ui.window.Dialog
import com.example.data.ArchiveRepository
import com.example.model.SubmissionStatus
import com.example.model.UserRole
import com.example.model.WorkItem
import com.example.ui.components.AppHeader
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.ManuscriptSeal
import com.example.ui.components.PrimaryButton
import com.example.ui.components.SecondaryButton
import com.example.ui.components.StatusBadge
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.StatusApprovedGreen
import com.example.ui.theme.StatusReviewAmber
import com.example.ui.theme.StatusRevisionRed
import kotlinx.coroutines.launch

@Composable
fun ReviewerQueueScreen(
  repository: ArchiveRepository,
  onWorkClick: (String) -> Unit,
  onBackClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val works by repository.works.collectAsState()
  val currentUser by repository.currentUser.collectAsState()
  var activeReviewWork by remember { mutableStateOf<WorkItem?>(null) }
  var reviewNotes by remember { mutableStateOf("") }
  var searchQuery by remember { mutableStateOf("") }
  var selectedStatusFilter by remember { mutableStateOf<SubmissionStatus?>(null) }
  val snackbarHostState = remember { SnackbarHostState() }
  val scope = rememberCoroutineScope()

  val underReviewWorks = works.filter { it.status == SubmissionStatus.UNDER_REVIEW || it.status == SubmissionStatus.REVISION_REQUESTED }
  val approvedWorks = works.filter { it.status == SubmissionStatus.APPROVED || it.status == SubmissionStatus.PUBLISHED }

  val filteredAllWorks = works.filter { work ->
    val matchesStatus = selectedStatusFilter == null || work.status == selectedStatusFilter
    val matchesSearch = searchQuery.isBlank() ||
      work.title.contains(searchQuery, ignoreCase = true) ||
      work.writerName.contains(searchQuery, ignoreCase = true) ||
      work.categoryName.contains(searchQuery, ignoreCase = true) ||
      work.tags.any { it.contains(searchQuery, ignoreCase = true) }
    matchesStatus && matchesSearch
  }

  var selectedTab by remember { mutableStateOf(ReviewQueueTab.PENDING) }

  Box(modifier = modifier.fillMaxSize()) {
    Column(modifier = Modifier.fillMaxSize()) {
      AppHeader(
        title = if (currentUser.role == UserRole.ADMIN || currentUser.role == UserRole.SUPER_ADMIN) "የአድሚንና የጽሁፎች ማዕከል" else "የግምገማ ወረፋ",
        subtitle = "የቀረቡ፣ የጸደቁና የተመዘገቡ ስራዎች መቆጣጠሪያ",
        showBack = true,
        onBackClick = onBackClick
      )

      LazyColumn(
        modifier = Modifier
          .fillMaxSize()
          .testTag("reviewer_queue_content"),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        item {
          ManuscriptBox(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = 14.dp
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              ManuscriptSeal(
                text = if (currentUser.role == UserRole.ADMIN || currentUser.role == UserRole.SUPER_ADMIN) "አድሚን" else "ገምጋሚ",
                color = MaterialTheme.colorScheme.primary
              )
              Spacer(modifier = Modifier.width(14.dp))
              Column {
                Text(
                  text = "የኪነጥበብ ስራዎች አስተዳደርና ግምገማ",
                  style = MaterialTheme.typography.titleSmall,
                  color = MaterialTheme.colorScheme.primary,
                  fontWeight = FontWeight.Bold,
                  fontFamily = FontFamily.Serif
                )
                Text(
                  text = "ተቆጣጣሪ፦ ${currentUser.fullName} (${currentUser.role.amharicTitle})",
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        }

        // Tabs: Pending Review vs Approved vs All Writings
        item {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            QueueTabButton(
              title = "በግምገማ (${underReviewWorks.size})",
              isSelected = selectedTab == ReviewQueueTab.PENDING,
              onClick = { selectedTab = ReviewQueueTab.PENDING },
              modifier = Modifier.weight(1f)
            )
            QueueTabButton(
              title = "የጸደቁ (${approvedWorks.size})",
              isSelected = selectedTab == ReviewQueueTab.APPROVED,
              onClick = { selectedTab = ReviewQueueTab.APPROVED },
              modifier = Modifier.weight(1f)
            )
            QueueTabButton(
              title = "ሁሉም ጽሁፎች (${works.size})",
              isSelected = selectedTab == ReviewQueueTab.ALL_WRITINGS,
              onClick = { selectedTab = ReviewQueueTab.ALL_WRITINGS },
              modifier = Modifier.weight(1.2f)
            )
          }
        }

        // Search and filter for ALL_WRITINGS tab
        if (selectedTab == ReviewQueueTab.ALL_WRITINGS) {
          item {
            OutlinedTextField(
              value = searchQuery,
              onValueChange = { searchQuery = it },
              label = { Text("ጽሁፎችን ወይም ደራሲን ፈልግ...") },
              placeholder = { Text("ለምሳሌ፦ ቃልኪዳን ሰይፉ፣ ግጥም፣ ብርሃን...") },
              leadingIcon = {
                Icon(
                  imageVector = Icons.Filled.Search,
                  contentDescription = null,
                  tint = MaterialTheme.colorScheme.primary
                )
              },
              trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                  IconButton(onClick = { searchQuery = "" }) {
                    Icon(
                      imageVector = Icons.Filled.Clear,
                      contentDescription = "አጥራ",
                      tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                }
              },
              modifier = Modifier
                .fillMaxWidth()
                .testTag("admin_all_writings_search"),
              singleLine = true,
              colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AntiqueGold,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline
              )
            )
          }

          // Status filter chips
          item {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              val filters = listOf(
                null to "ሁሉም",
                SubmissionStatus.UNDER_REVIEW to "በግምገማ",
                SubmissionStatus.APPROVED to "የጸደቀ",
                SubmissionStatus.REVISION_REQUESTED to "ማሻሻያ",
                SubmissionStatus.PUBLISHED to "የታተመ"
              )

              filters.forEach { (status, label) ->
                val isSelected = selectedStatusFilter == status
                Box(
                  modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                      if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                    )
                    .clickable { selectedStatusFilter = status }
                    .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                  Text(
                    text = label,
                    fontSize = 11.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }
            }
          }
        }

        val displayList = when (selectedTab) {
          ReviewQueueTab.PENDING -> underReviewWorks
          ReviewQueueTab.APPROVED -> approvedWorks
          ReviewQueueTab.ALL_WRITINGS -> filteredAllWorks
        }

        if (displayList.isEmpty()) {
          item {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = when (selectedTab) {
                  ReviewQueueTab.PENDING -> "በአሁኑ ሰዓት ግምገማ የሚጠብቅ ስራ የለም።"
                  ReviewQueueTab.APPROVED -> "ምንም የጸደቀ ስራ የለም።"
                  ReviewQueueTab.ALL_WRITINGS -> "የተፈለገው ጽሁፍ አልተገኘም።"
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        } else {
          items(displayList, key = { it.id }) { work ->
            ReviewWorkCard(
              work = work,
              onInspect = { onWorkClick(work.id) },
              onActionClick = {
                activeReviewWork = work
                reviewNotes = work.reviewerFeedback ?: ""
              }
            )
          }
        }
      }
    }

    // Review Action Modal Dialog
    if (activeReviewWork != null) {
      val workToReview = activeReviewWork!!
      Dialog(onDismissRequest = { activeReviewWork = null }) {
        ManuscriptBox(
          modifier = Modifier.fillMaxWidth(),
          contentPadding = 20.dp
        ) {
          Column {
            Text(
              text = "የስራ ግምገማ ውሳኔ",
              style = MaterialTheme.typography.titleMedium,
              color = MaterialTheme.colorScheme.primary,
              fontWeight = FontWeight.Bold,
              fontFamily = FontFamily.Serif
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = workToReview.title,
              style = MaterialTheme.typography.titleSmall,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "ደራሲ፦ ${workToReview.writerName} (${workToReview.categoryName})",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedTextField(
              value = reviewNotes,
              onValueChange = { reviewNotes = it },
              label = { Text("የገምጋሚ አስተያየት / ማስታወሻ") },
              placeholder = { Text("ለደራሲው የሚሰጥ ምክረ ሃሳብ ወይም የማሻሻያ ነጥብ...") },
              modifier = Modifier
                .fillMaxWidth()
                .height(100.dp),
              maxLines = 4
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Action Buttons: Approve / Request Revision
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              // Request Revision
              Box(
                modifier = Modifier
                  .weight(1f)
                  .clip(RoundedCornerShape(6.dp))
                  .background(StatusRevisionRed.copy(alpha = 0.12f))
                  .border(1.dp, StatusRevisionRed, RoundedCornerShape(6.dp))
                  .clickable {
                    repository.updateSubmissionStatus(
                      workId = workToReview.id,
                      newStatus = SubmissionStatus.REVISION_REQUESTED,
                      feedback = reviewNotes
                    )
                    activeReviewWork = null
                    scope.launch {
                      snackbarHostState.showSnackbar("ለደራሲው የማሻሻያ ጥያቄ ተልኳል")
                    }
                  }
                  .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = "ማሻሻያ ጠይቅ",
                  fontSize = 12.sp,
                  color = StatusRevisionRed,
                  fontWeight = FontWeight.Bold
                )
              }

              // Approve
              Box(
                modifier = Modifier
                  .weight(1f)
                  .clip(RoundedCornerShape(6.dp))
                  .background(StatusApprovedGreen)
                  .clickable {
                    repository.updateSubmissionStatus(
                      workId = workToReview.id,
                      newStatus = SubmissionStatus.APPROVED,
                      approvedBy = currentUser.fullName,
                      feedback = reviewNotes
                    )
                    activeReviewWork = null
                    scope.launch {
                      snackbarHostState.showSnackbar("ስራው ጸድቆ በቋሚነት ወደ መዝገቡ ገብቷል!")
                    }
                  }
                  .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = "አጽድቅ (Approve)",
                  fontSize = 12.sp,
                  color = Color.White,
                  fontWeight = FontWeight.Bold
                )
              }
            }

            // Additional Admin Actions: Mark Published, Send to Review, Delete
            if (currentUser.role == UserRole.ADMIN || currentUser.role == UserRole.SUPER_ADMIN) {
              Spacer(modifier = Modifier.height(10.dp))
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                Box(
                  modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                    .border(1.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(6.dp))
                    .clickable {
                      repository.updateSubmissionStatus(
                        workId = workToReview.id,
                        newStatus = SubmissionStatus.PUBLISHED,
                        approvedBy = currentUser.fullName,
                        feedback = reviewNotes
                      )
                      activeReviewWork = null
                      scope.launch {
                        snackbarHostState.showSnackbar("ስራው ታትሞ ለህዝብ ቀርቧል!")
                      }
                    }
                    .padding(vertical = 8.dp),
                  contentAlignment = Alignment.Center
                ) {
                  Text(
                    text = "እንደ ታተመ አድርግ",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                  )
                }

                Box(
                  modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color.Red.copy(alpha = 0.08f))
                    .border(1.dp, Color.Red.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                    .clickable {
                      repository.deleteWork(workToReview.id)
                      activeReviewWork = null
                      scope.launch {
                        snackbarHostState.showSnackbar("ስራው ከመዝገብ ተሰርዟል")
                      }
                    }
                    .padding(vertical = 8.dp),
                  contentAlignment = Alignment.Center
                ) {
                  Text(
                    text = "ስራውን ሰርዝ",
                    fontSize = 11.sp,
                    color = Color.Red,
                    fontWeight = FontWeight.Bold
                  )
                }
              }
            }
          }
        }
      }
    }

    SnackbarHost(
      hostState = snackbarHostState,
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .padding(bottom = 24.dp)
    )
  }
}

enum class ReviewQueueTab {
  PENDING,
  APPROVED,
  ALL_WRITINGS
}

@Composable
private fun QueueTabButton(
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
private fun ReviewWorkCard(
  work: WorkItem,
  onInspect: () -> Unit,
  onActionClick: () -> Unit
) {
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
        Text(
          text = work.categoryName,
          fontSize = 11.sp,
          color = AntiqueGoldDark,
          fontWeight = FontWeight.Bold
        )
        StatusBadge(status = work.status)
      }

      Spacer(modifier = Modifier.height(6.dp))

      Text(
        text = work.title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onSurface
      )

      Text(
        text = "ደራሲ፦ ${work.writerName} • ${work.dateAmharic}",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant
      )

      Spacer(modifier = Modifier.height(8.dp))

      Text(
        text = work.excerpt,
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        maxLines = 2
      )

      Spacer(modifier = Modifier.height(12.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        SecondaryButton(
          text = "ይዘቱን አንብብ",
          onClick = onInspect,
          modifier = Modifier.weight(1f)
        )
        PrimaryButton(
          text = "ገምግም / ወስን",
          onClick = onActionClick,
          modifier = Modifier.weight(1f)
        )
      }
    }
  }
}
