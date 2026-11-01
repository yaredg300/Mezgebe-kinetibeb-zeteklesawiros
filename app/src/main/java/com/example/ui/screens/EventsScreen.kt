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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.FormatListBulleted
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.ArchiveRepository
import com.example.model.ChurchMember
import com.example.model.CulturalEvent
import com.example.model.MemberDuty
import com.example.model.ProgramAssignment
import com.example.model.ProgramRecurrence
import com.example.model.UserRole
import com.example.ui.components.AppHeader
import com.example.ui.components.ChurchMemberCard
import com.example.ui.components.ChurchProgramCalendar
import com.example.ui.components.EventCard
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.ManuscriptSeal
import com.example.ui.components.PrimaryButton
import com.example.ui.components.SecondaryButton
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import kotlinx.coroutines.launch

private enum class EventMainTab(val title: String) {
  PROGRAMS("የቤተክርስቲያን መርሃ-ግብራት"),
  MEMBERS("የኪነጥበብ አባላት (ፀሃፊ፣ አዘጋጅ፣ አቅራቢ)")
}

private enum class ProgramViewMode(val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
  CALENDAR("የቀን መቁጠሪያ እይታ", Icons.Filled.CalendarMonth),
  LIST("የዝርዝር እይታ", Icons.Filled.FormatListBulleted)
}

private enum class ProgramFilter(val label: String, val recurrence: ProgramRecurrence?) {
  ALL("ሁሉም መርሃ-ግብራት", null),
  WEEKLY("ሳምንታዊ", ProgramRecurrence.WEEKLY),
  MONTHLY("ወርሃዊ", ProgramRecurrence.MONTHLY),
  YEARLY("ዓመታዊ", ProgramRecurrence.YEARLY)
}

private enum class MemberDutyFilter(val label: String, val duty: MemberDuty?) {
  ALL("ሁሉም አባላት", null),
  WRITERS("✍️ ፀሃፊዎች", MemberDuty.WRITER),
  ORGANIZERS("🎬 አዘጋጆች", MemberDuty.ORGANIZER),
  PRESENTERS("🎙️ አቅራቢዎች", MemberDuty.PRESENTER)
}

@Composable
fun EventsScreen(
  repository: ArchiveRepository,
  modifier: Modifier = Modifier
) {
  val events by repository.events.collectAsState()
  val members by repository.members.collectAsState()
  val works by repository.works.collectAsState()
  val currentUser by repository.currentUser.collectAsState()
  val isAdmin = currentUser.role == UserRole.ADMIN || currentUser.role == UserRole.SUPER_ADMIN || currentUser.role == UserRole.EDITOR

  var currentMainTab by remember { mutableStateOf(EventMainTab.PROGRAMS) }
  var programViewMode by remember { mutableStateOf(ProgramViewMode.CALENDAR) }
  var selectedProgramFilter by remember { mutableStateOf(ProgramFilter.ALL) }
  var selectedMemberFilter by remember { mutableStateOf(MemberDutyFilter.ALL) }

  var showAddProgramDialog by remember { mutableStateOf(false) }
  var showAddMemberDialog by remember { mutableStateOf(false) }
  var programToAssignArtWork by remember { mutableStateOf<CulturalEvent?>(null) }

  val snackbarHostState = remember { SnackbarHostState() }
  val scope = rememberCoroutineScope()

  val filteredEvents = remember(events, selectedProgramFilter) {
    if (selectedProgramFilter.recurrence == null) {
      events
    } else {
      events.filter { it.recurrence == selectedProgramFilter.recurrence }
    }
  }

  val filteredMembers = remember(members, selectedMemberFilter) {
    if (selectedMemberFilter.duty == null) {
      members
    } else {
      members.filter { it.duty == selectedMemberFilter.duty }
    }
  }

  Box(modifier = modifier.fillMaxSize()) {
    Column(modifier = Modifier.fillMaxSize()) {
      AppHeader(
        title = "የቤተክርስቲያን መርሃ-ግብራት እና አባላት",
        subtitle = "ሳምንታዊ፣ ወርሃዊና ዓመታዊ መድረኮች ከሥነፅሁፍ ምደባ ጋር",
        actions = {
          if (isAdmin) {
            IconButton(
              onClick = {
                if (currentMainTab == EventMainTab.PROGRAMS) {
                  showAddProgramDialog = true
                } else {
                  showAddMemberDialog = true
                }
              },
              modifier = Modifier.testTag("events_header_add_btn")
            ) {
              Icon(
                imageVector = Icons.Filled.AddCircle,
                contentDescription = "አዲስ ጨምር",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(28.dp)
              )
            }
          }
        }
      )

      // Main Tabs: Programs vs Members
      TabRow(
        selectedTabIndex = currentMainTab.ordinal,
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.primary,
        indicator = { tabPositions ->
          TabRowDefaults.SecondaryIndicator(
            Modifier.tabIndicatorOffset(tabPositions[currentMainTab.ordinal]),
            color = MaterialTheme.colorScheme.primary
          )
        }
      ) {
        EventMainTab.entries.forEach { tab ->
          Tab(
            selected = currentMainTab == tab,
            onClick = { currentMainTab = tab },
            text = {
              Text(
                text = tab.title,
                fontSize = 12.sp,
                fontWeight = if (currentMainTab == tab) FontWeight.Bold else FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
              )
            }
          )
        }
      }

      LazyColumn(
        modifier = Modifier
          .fillMaxSize()
          .testTag("events_screen_content"),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        when (currentMainTab) {
          EventMainTab.PROGRAMS -> {
            // View Mode Switcher: Calendar View vs List View
            item {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .clip(RoundedCornerShape(8.dp))
                  .background(MaterialTheme.colorScheme.surfaceVariant)
                  .padding(3.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                ProgramViewMode.entries.forEach { mode ->
                  val isSelected = programViewMode == mode
                  Box(
                    modifier = Modifier
                      .weight(1f)
                      .clip(RoundedCornerShape(6.dp))
                      .background(if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent)
                      .clickable { programViewMode = mode }
                      .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                  ) {
                    Row(
                      verticalAlignment = Alignment.CenterVertically,
                      horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                      Icon(
                        imageVector = mode.icon,
                        contentDescription = null,
                        tint = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(16.dp)
                      )
                      Text(
                        text = mode.title,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                      )
                    }
                  }
                }
              }
            }

            if (programViewMode == ProgramViewMode.CALENDAR) {
              // Interactive Calendar Component
              item {
                ChurchProgramCalendar(
                  events = events,
                  onAssignArtWorkClick = if (isAdmin) {
                    { ev -> programToAssignArtWork = ev }
                  } else null,
                  onToggleTaskCompletion = { eventId, assignmentId ->
                    repository.toggleAssignmentCompletion(eventId, assignmentId)
                    scope.launch {
                      snackbarHostState.showSnackbar("የተግባሩ ሁኔታ ተቀይሯል")
                    }
                  },
                  onAddEventClick = if (isAdmin) {
                    { showAddProgramDialog = true }
                  } else null
                )
              }
            } else {
              // Classic List View
              item {
                ManuscriptBox(
                  modifier = Modifier.fillMaxWidth(),
                  contentPadding = 14.dp
                ) {
                  Column {
                    Row(
                      modifier = Modifier.fillMaxWidth(),
                      verticalAlignment = Alignment.CenterVertically,
                      horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                      Text(
                        text = "የኪነጥበብ መድረኮች ዝርዝር",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif
                      )
                      ManuscriptSeal(
                        text = "${events.size} መርሃ-ግብራት",
                        color = MaterialTheme.colorScheme.primary
                      )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                      text = "ሳምንታዊ የሰንበት ጉባኤያት፣ ወርሃዊ የበዓል ምሽቶች እና ዓመታዊ ታላላቅ ፌስቲቫሎች ከነሥነፅሁፍ ፀሃፊ፣ አዘጋጅ እና አቅራቢ ምደባቸው እዚህ ተመዝግበዋል።",
                      style = MaterialTheme.typography.bodySmall,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                }
              }

              // Recurrence Filter Pills (All, Weekly, Monthly, Yearly)
              item {
                LazyRow(
                  horizontalArrangement = Arrangement.spacedBy(8.dp),
                  modifier = Modifier.fillMaxWidth()
                ) {
                  items(ProgramFilter.entries) { filter ->
                    val isSelected = selectedProgramFilter == filter
                    val count = when (filter) {
                      ProgramFilter.ALL -> events.size
                      ProgramFilter.WEEKLY -> events.count { it.recurrence == ProgramRecurrence.WEEKLY }
                      ProgramFilter.MONTHLY -> events.count { it.recurrence == ProgramRecurrence.MONTHLY }
                      ProgramFilter.YEARLY -> events.count { it.recurrence == ProgramRecurrence.YEARLY }
                    }

                    Box(
                      modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(
                          if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                        )
                        .border(
                          width = 1.dp,
                          color = if (isSelected) MaterialTheme.colorScheme.primary else AntiqueGold.copy(alpha = 0.3f),
                          shape = RoundedCornerShape(20.dp)
                        )
                        .clickable { selectedProgramFilter = filter }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                      Text(
                        text = "${filter.label} ($count)",
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                      )
                    }
                  }
                }
              }

              // Quick Add Program Action Banner for Admins
              if (isAdmin) {
                item {
                  Box(
                    modifier = Modifier
                      .fillMaxWidth()
                      .clip(RoundedCornerShape(8.dp))
                      .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.08f))
                      .clickable { showAddProgramDialog = true }
                      .padding(12.dp)
                      .testTag("admin_add_program_banner"),
                    contentAlignment = Alignment.Center
                  ) {
                    Row(
                      verticalAlignment = Alignment.CenterVertically,
                      horizontalArrangement = Arrangement.Center
                    ) {
                      Icon(
                        imageVector = Icons.Filled.AddCircle,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(18.dp)
                      )
                      Spacer(modifier = Modifier.width(8.dp))
                      Text(
                        text = "+ አዲስ መርሃ-ግብር መዝግብ (ሳምንታዊ / ወርሃዊ / ዓመታዊ)",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                      )
                    }
                  }
                }
              }

              if (filteredEvents.isEmpty()) {
                item {
                  Box(
                    modifier = Modifier
                      .fillMaxWidth()
                      .padding(32.dp),
                    contentAlignment = Alignment.Center
                  ) {
                    Text(
                      text = "በዚህ ምድብ ምንም የተመዘገበ መርሐ-ግብር የለም።",
                      style = MaterialTheme.typography.bodyMedium,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                }
              } else {
                items(filteredEvents, key = { it.id }) { event ->
                  Column(modifier = Modifier.fillMaxWidth()) {
                    EventCard(
                      event = event,
                      onDeleteClick = if (isAdmin) {
                        {
                          repository.deleteEvent(event.id)
                          scope.launch {
                            snackbarHostState.showSnackbar("«${event.title}» ከመዝገብ ተሰርዟል")
                          }
                        }
                      } else null
                    )

                    // Button to assign an art work with roles directly to this program
                    if (isAdmin) {
                      Spacer(modifier = Modifier.height(4.dp))
                      Box(
                        modifier = Modifier
                          .fillMaxWidth()
                          .clip(RoundedCornerShape(6.dp))
                          .background(AntiqueGold.copy(alpha = 0.12f))
                          .clickable { programToAssignArtWork = event }
                          .padding(horizontal = 12.dp, vertical = 6.dp),
                        contentAlignment = Alignment.CenterEnd
                      ) {
                        Row(
                          verticalAlignment = Alignment.CenterVertically,
                          horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                          Icon(
                            imageVector = Icons.Filled.Assignment,
                            contentDescription = null,
                            tint = AntiqueGoldDark,
                            modifier = Modifier.size(14.dp)
                          )
                          Text(
                            text = "+ የኪነጥበብ ሥራ መድብ (ፀሃፊ፣ አዘጋጅ፣ አቅራቢ)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = AntiqueGoldDark
                          )
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          EventMainTab.MEMBERS -> {
            // Members Header Summary Box
            item {
              ManuscriptBox(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = 14.dp
              ) {
                Column {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                  ) {
                    Text(
                      text = "የኪነጥበብ አባላት ማውጫ",
                      style = MaterialTheme.typography.titleMedium,
                      color = MaterialTheme.colorScheme.primary,
                      fontWeight = FontWeight.Bold,
                      fontFamily = FontFamily.Serif
                    )
                    ManuscriptSeal(
                      text = "${members.size} አባላት",
                      color = AntiqueGoldDark
                    )
                  }
                  Spacer(modifier = Modifier.height(4.dp))
                  Text(
                    text = "የስነ ጽሁፍ ፀሃፊያን፣ የመድረክና የዝግጅት አስተባባሪዎች (አዘጋጆች) እንዲሁም አንደበተ ርቱዕ አቅራቢዎችና ተዋንያን መረጃ።",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }
            }

            // Member Duty Filters (All, Writers, Organizers, Presenters)
            item {
              LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
              ) {
                items(MemberDutyFilter.entries) { filter ->
                  val isSelected = selectedMemberFilter == filter
                  val count = when (filter) {
                    MemberDutyFilter.ALL -> members.size
                    MemberDutyFilter.WRITERS -> members.count { it.duty == MemberDuty.WRITER }
                    MemberDutyFilter.ORGANIZERS -> members.count { it.duty == MemberDuty.ORGANIZER }
                    MemberDutyFilter.PRESENTERS -> members.count { it.duty == MemberDuty.PRESENTER }
                  }

                  Box(
                    modifier = Modifier
                      .clip(RoundedCornerShape(20.dp))
                      .background(
                        if (isSelected) AntiqueGoldDark else MaterialTheme.colorScheme.surfaceVariant
                      )
                      .clickable { selectedMemberFilter = filter }
                      .padding(horizontal = 12.dp, vertical = 6.dp)
                  ) {
                    Text(
                      text = "${filter.label} ($count)",
                      fontSize = 11.sp,
                      fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                      color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                }
              }
            }

            // Quick Add Member Action Banner
            if (isAdmin) {
              item {
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(AntiqueGoldDark.copy(alpha = 0.1f))
                    .clickable { showAddMemberDialog = true }
                    .padding(12.dp)
                    .testTag("admin_add_member_banner"),
                  contentAlignment = Alignment.Center
                ) {
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                  ) {
                    Icon(
                      imageVector = Icons.Filled.PersonAdd,
                      contentDescription = null,
                      tint = AntiqueGoldDark,
                      modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                      text = "+ አዲስ አባል መዝግብ (ፀሃፊ፣ አዘጋጅ፣ ወይም አቅራቢ)",
                      style = MaterialTheme.typography.bodyMedium,
                      fontWeight = FontWeight.Bold,
                      color = AntiqueGoldDark
                    )
                  }
                }
              }
            }

            if (filteredMembers.isEmpty()) {
              item {
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                  contentAlignment = Alignment.Center
                ) {
                  Text(
                    text = "በዚህ ሚና የተመዘገበ አባል የለም።",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }
            } else {
              items(filteredMembers, key = { it.id }) { member ->
                ChurchMemberCard(
                  member = member,
                  onDeleteClick = if (isAdmin) {
                    {
                      repository.deleteMember(member.id)
                      scope.launch {
                        snackbarHostState.showSnackbar("«${member.fullName}» ከአባላት መዝገብ ተሰርዟል")
                      }
                    }
                  } else null
                )
              }
            }
          }
        }
      }
    }

    // Modal: Add New Church Program (Weekly, Monthly, Yearly)
    if (showAddProgramDialog) {
      AddProgramModalDialog(
        onDismiss = { showAddProgramDialog = false },
        onSave = { title, recurrence, category, date, time, location, organizer, description ->
          repository.addEvent(
            title = title,
            recurrence = recurrence,
            category = category,
            dateAmharic = date,
            timeAmharic = time,
            location = location,
            organizer = organizer,
            description = description
          )
          showAddProgramDialog = false
          scope.launch {
            snackbarHostState.showSnackbar("አዲሱ ${recurrence.amharicLabel} መርሐ-ግብር «$title» ተመዝግቧል!")
          }
        }
      )
    }

    // Modal: Add New Member (ፀሃፊ፣ አዘጋጅ፣ አቅራቢ)
    if (showAddMemberDialog) {
      AddMemberModalDialog(
        onDismiss = { showAddMemberDialog = false },
        onSave = { fullName, duty, phone, spiritualTitle, department, bio ->
          repository.addMember(
            fullName = fullName,
            duty = duty,
            phone = phone,
            spiritualTitle = spiritualTitle,
            department = department,
            bio = bio
          )
          showAddMemberDialog = false
          scope.launch {
            snackbarHostState.showSnackbar("አዲሱ የኪነጥበብ አባል «$fullName» (${duty.amharicTitle}) ተመዝግቧል!")
          }
        }
      )
    }

    // Modal: Assign Art Work (ሥነፅሁፍ ፀሃፊ፣ አዘጋጅ እና አቅራቢ) to a Program
    programToAssignArtWork?.let { targetProgram ->
      AssignArtWorkModalDialog(
        program = targetProgram,
        members = members,
        availableWorks = works.map { it.title to it.categoryName },
        onDismiss = { programToAssignArtWork = null },
        onAssign = { workTitle, workCategory, writerMember, organizerMember, presenterMember, notes ->
          val newAssignment = ProgramAssignment(
            id = "asgn_${System.currentTimeMillis()}",
            workTitle = workTitle,
            workCategory = workCategory,
            writerMemberId = writerMember.id,
            writerMemberName = writerMember.fullName,
            organizerMemberId = organizerMember.id,
            organizerMemberName = organizerMember.fullName,
            presenterMemberId = presenterMember.id,
            presenterMemberName = presenterMember.fullName,
            performanceNotes = notes
          )
          repository.addAssignmentToProgram(targetProgram.id, newAssignment)
          programToAssignArtWork = null
          scope.launch {
            snackbarHostState.showSnackbar("የሥነፅሁፍ ሥራው «$workTitle» ለ«${targetProgram.title}» ተመድቧል!")
          }
        }
      )
    }

    SnackbarHost(
      hostState = snackbarHostState,
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .padding(bottom = 80.dp)
    )
  }
}

/**
 * Dialog to add a new Church Program with Weekly, Monthly, or Yearly recurrence
 */
@Composable
private fun AddProgramModalDialog(
  onDismiss: () -> Unit,
  onSave: (title: String, recurrence: ProgramRecurrence, category: String, date: String, time: String, location: String, organizer: String, description: String) -> Unit
) {
  var title by remember { mutableStateOf("") }
  var selectedRecurrence by remember { mutableStateOf(ProgramRecurrence.WEEKLY) }
  var selectedCategory by remember { mutableStateOf("ሳምንታዊ ጉባኤ") }
  var dateAmharic by remember { mutableStateOf("በየሳምንቱ እሁድ") }
  var timeAmharic by remember { mutableStateOf("ከቀኑ ፰:00 ጀምሮ") }
  var location by remember { mutableStateOf("ደብረ ሣዊሮስ ታላቁ አዳራሽ") }
  var organizer by remember { mutableStateOf("የኪነጥበብ ክፍል") }
  var description by remember { mutableStateOf("") }
  var errorMessage by remember { mutableStateOf<String?>(null) }

  val categories = listOf("ሳምንታዊ ጉባኤ", "የግጥም ምሽት", "የመድረክ ድራማ", "ወርሃዊ በዓል", "ዓመታዊ ፌስቲቫል", "አውደ ጥናት", "የቅኔ ጉባኤ")

  Dialog(onDismissRequest = onDismiss) {
    ManuscriptBox(
      modifier = Modifier
        .fillMaxWidth()
        .padding(4.dp),
      contentPadding = 18.dp
    ) {
      LazyColumn(
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        item {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "አዲስ መርሐ-ግብር መዝግብ",
              style = MaterialTheme.typography.titleMedium,
              color = MaterialTheme.colorScheme.primary,
              fontWeight = FontWeight.Bold,
              fontFamily = FontFamily.Serif
            )
            ManuscriptSeal(text = "አድሚን", color = MaterialTheme.colorScheme.primary)
          }
        }

        item {
          HaragDivider()
        }

        // Recurrence Selector (ሳምንታዊ፣ ወርሃዊ፣ ዓመታዊ)
        item {
          Text(
            text = "የመርሐ-ግብሩ ድግግሞሽ (Recurrence) *",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
          )
          Spacer(modifier = Modifier.height(4.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            ProgramRecurrence.entries.forEach { rec ->
              val isSelected = selectedRecurrence == rec
              Box(
                modifier = Modifier
                  .weight(1f)
                  .clip(RoundedCornerShape(8.dp))
                  .background(
                    if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                  )
                  .clickable {
                    selectedRecurrence = rec
                    if (rec == ProgramRecurrence.WEEKLY) {
                      dateAmharic = "በየሳምንቱ እሁድ"
                      selectedCategory = "ሳምንታዊ ጉባኤ"
                    } else if (rec == ProgramRecurrence.MONTHLY) {
                      dateAmharic = "በየወሩ በ፲፭ኛው ቀን"
                      selectedCategory = "ወርሃዊ በዓል"
                    } else {
                      dateAmharic = "መጋቢት ፲፭ ፳፻፲፮ ዓ.ም (ዓመታዊ)"
                      selectedCategory = "ዓመታዊ ፌስቲቫል"
                    }
                  }
                  .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = rec.amharicLabel,
                  fontSize = 12.sp,
                  fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                  color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        }

        item {
          OutlinedTextField(
            value = title,
            onValueChange = {
              title = it
              if (it.isNotBlank()) errorMessage = null
            },
            label = { Text("የመርሐ-ግብሩ ርዕስ *") },
            placeholder = { Text("ለምሳሌ፦ ሳምንታዊ የኪነጥበብ ሰዓት") },
            modifier = Modifier
              .fillMaxWidth()
              .testTag("program_title_input"),
            singleLine = true
          )
        }

        item {
          Text(
            text = "ምድብ ይምረጡ፦",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
          )
          Spacer(modifier = Modifier.height(4.dp))
          LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            items(categories) { cat ->
              val isSelected = selectedCategory == cat
              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(16.dp))
                  .background(
                    if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                  )
                  .clickable { selectedCategory = cat }
                  .padding(horizontal = 10.dp, vertical = 6.dp)
              ) {
                Text(
                  text = cat,
                  fontSize = 11.sp,
                  fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                  color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        }

        item {
          OutlinedTextField(
            value = dateAmharic,
            onValueChange = { dateAmharic = it },
            label = { Text("ቀን *") },
            placeholder = { Text("ለምሳሌ፦ በየሳምንቱ እሁድ") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
        }

        item {
          OutlinedTextField(
            value = timeAmharic,
            onValueChange = { timeAmharic = it },
            label = { Text("ሰዓት *") },
            placeholder = { Text("ለምሳሌ፦ ከቀኑ ፰:00 ጀምሮ") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
        }

        item {
          OutlinedTextField(
            value = location,
            onValueChange = { location = it },
            label = { Text("ቦታ *") },
            placeholder = { Text("ለምሳሌ፦ ደብረ ሣዊሮስ አዳራሽ") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
        }

        item {
          OutlinedTextField(
            value = organizer,
            onValueChange = { organizer = it },
            label = { Text("አዘጋጅ ክፍል / ኮሚቴ") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
        }

        item {
          OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("ዝርዝር መግለጫ") },
            placeholder = { Text("ስለ መርሐ-ግብሩ ዓላማና ይዘት...") },
            modifier = Modifier
              .fillMaxWidth()
              .height(90.dp),
            maxLines = 4
          )
        }

        if (errorMessage != null) {
          item {
            Text(
              text = errorMessage!!,
              color = Color.Red,
              style = MaterialTheme.typography.bodySmall,
              fontWeight = FontWeight.Bold
            )
          }
        }

        item {
          Spacer(modifier = Modifier.height(6.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            SecondaryButton(
              text = "ሰርዝ",
              onClick = onDismiss,
              modifier = Modifier.weight(1f)
            )
            PrimaryButton(
              text = "መዝግብ",
              onClick = {
                if (title.isBlank()) {
                  errorMessage = "እባክዎ የመርሐ-ግብሩን ርዕስ ያስገቡ"
                  return@PrimaryButton
                }
                onSave(
                  title.trim(),
                  selectedRecurrence,
                  selectedCategory,
                  dateAmharic.trim(),
                  timeAmharic.trim(),
                  location.trim(),
                  organizer.trim(),
                  if (description.isBlank()) "በተክለ ሣዊሮስ ሰንበት ት/ቤት የ${selectedRecurrence.amharicLabel} $selectedCategory መርሐ-ግብር" else description.trim()
                )
              },
              modifier = Modifier
                .weight(1f)
                .testTag("save_program_btn")
            )
          }
        }
      }
    }
  }
}

/**
 * Dialog to add a new Church Member with duty (ፀሃፊ, አዘጋጅ, አቅራቢ)
 */
@Composable
private fun AddMemberModalDialog(
  onDismiss: () -> Unit,
  onSave: (fullName: String, duty: MemberDuty, phone: String, spiritualTitle: String, department: String, bio: String) -> Unit
) {
  var fullName by remember { mutableStateOf("") }
  var selectedDuty by remember { mutableStateOf(MemberDuty.WRITER) }
  var spiritualTitle by remember { mutableStateOf("አባል") }
  var department by remember { mutableStateOf("የኪነጥበብ ክፍል") }
  var phone by remember { mutableStateOf("") }
  var bio by remember { mutableStateOf("") }
  var errorMessage by remember { mutableStateOf<String?>(null) }

  Dialog(onDismissRequest = onDismiss) {
    ManuscriptBox(
      modifier = Modifier
        .fillMaxWidth()
        .padding(4.dp),
      contentPadding = 18.dp
    ) {
      LazyColumn(
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        item {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "አዲስ የኪነጥበብ አባል መዝግብ",
              style = MaterialTheme.typography.titleMedium,
              color = MaterialTheme.colorScheme.primary,
              fontWeight = FontWeight.Bold,
              fontFamily = FontFamily.Serif
            )
            ManuscriptSeal(text = "አባል", color = AntiqueGoldDark)
          }
        }

        item {
          HaragDivider()
        }

        // Duty Selector: ፀሃፊ, አዘጋጅ, or አቅራቢ
        item {
          Text(
            text = "የአባሉ ሚና (Role / Duty) *",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
          )
          Spacer(modifier = Modifier.height(4.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            MemberDuty.entries.forEach { duty ->
              val isSelected = selectedDuty == duty
              val (color, icon) = when (duty) {
                MemberDuty.WRITER -> MaterialTheme.colorScheme.primary to "✍️"
                MemberDuty.ORGANIZER -> AntiqueGoldDark to "🎬"
                MemberDuty.PRESENTER -> Color(0xFF256645) to "🎙️"
              }
              Box(
                modifier = Modifier
                  .weight(1f)
                  .clip(RoundedCornerShape(8.dp))
                  .background(if (isSelected) color else MaterialTheme.colorScheme.surfaceVariant)
                  .clickable {
                    selectedDuty = duty
                    when (duty) {
                      MemberDuty.WRITER -> {
                        spiritualTitle = "ዋና ፀሃፊ"
                        department = "የስነ ጽሁፍ ክፍል"
                      }
                      MemberDuty.ORGANIZER -> {
                        spiritualTitle = "አዘጋጅ"
                        department = "የዝግጅት ክፍል"
                      }
                      MemberDuty.PRESENTER -> {
                        spiritualTitle = "አቅራቢ"
                        department = "የመድረክ ክፍል"
                      }
                    }
                  }
                  .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
              ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                  Text(text = icon, fontSize = 16.sp)
                  Text(
                    text = duty.amharicTitle,
                    fontSize = 11.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }
            }
          }
        }

        item {
          OutlinedTextField(
            value = fullName,
            onValueChange = {
              fullName = it
              if (it.isNotBlank()) errorMessage = null
            },
            label = { Text("ሙሉ ስም *") },
            placeholder = { Text("ለምሳሌ፦ ቃልኪዳን ሰይፉ") },
            modifier = Modifier
              .fillMaxWidth()
              .testTag("member_name_input"),
            singleLine = true
          )
        }

        item {
          OutlinedTextField(
            value = spiritualTitle,
            onValueChange = { spiritualTitle = it },
            label = { Text("ማዕረግ / ኃላፊነት") },
            placeholder = { Text("ለምሳሌ፦ ዋና ፀሃፊ ወይም ዲያቆን") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
        }

        item {
          OutlinedTextField(
            value = department,
            onValueChange = { department = it },
            label = { Text("ክፍል / ኮሚቴ") },
            placeholder = { Text("ለምሳሌ፦ የስነ ጽሁፍ ክፍል") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
        }

        item {
          OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("ስልክ ቁጥር") },
            placeholder = { Text("ለምሳሌ፦ 0911-00-00-00") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
        }

        item {
          OutlinedTextField(
            value = bio,
            onValueChange = { bio = it },
            label = { Text("የአባሉ መግለጫ / የተሰጥዖ ዘርፍ") },
            placeholder = { Text("ስለ ልምዱና ስላዘጋጃቸው ስራዎች ማስታወሻ...") },
            modifier = Modifier
              .fillMaxWidth()
              .height(80.dp),
            maxLines = 3
          )
        }

        if (errorMessage != null) {
          item {
            Text(
              text = errorMessage!!,
              color = Color.Red,
              style = MaterialTheme.typography.bodySmall,
              fontWeight = FontWeight.Bold
            )
          }
        }

        item {
          Spacer(modifier = Modifier.height(6.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            SecondaryButton(
              text = "ሰርዝ",
              onClick = onDismiss,
              modifier = Modifier.weight(1f)
            )
            PrimaryButton(
              text = "መዝግብ",
              onClick = {
                if (fullName.isBlank()) {
                  errorMessage = "እባክዎ የአባሉን ሙሉ ስም ያስገቡ"
                  return@PrimaryButton
                }
                onSave(
                  fullName.trim(),
                  selectedDuty,
                  phone.trim(),
                  spiritualTitle.trim(),
                  department.trim(),
                  bio.trim()
                )
              },
              modifier = Modifier
                .weight(1f)
                .testTag("save_member_btn")
            )
          }
        }
      }
    }
  }
}

/**
 * Dialog to assign an Art Work (ሥነፅሁፍ) to a program with:
 * ✍️ ፀሃፊ, 🎬 አዘጋጅ, and 🎙️ አቅራቢ
 */
@Composable
private fun AssignArtWorkModalDialog(
  program: CulturalEvent,
  members: List<ChurchMember>,
  availableWorks: List<Pair<String, String>>,
  onDismiss: () -> Unit,
  onAssign: (workTitle: String, workCategory: String, writerMember: ChurchMember, organizerMember: ChurchMember, presenterMember: ChurchMember, notes: String) -> Unit
) {
  val writers = members.filter { it.duty == MemberDuty.WRITER }.ifEmpty { members }
  val organizers = members.filter { it.duty == MemberDuty.ORGANIZER }.ifEmpty { members }
  val presenters = members.filter { it.duty == MemberDuty.PRESENTER }.ifEmpty { members }

  var customWorkTitle by remember { mutableStateOf(availableWorks.firstOrNull()?.first ?: "አዲስ መንፈሳዊ ግጥም") }
  var workCategory by remember { mutableStateOf(availableWorks.firstOrNull()?.second ?: "ግጥም") }
  var selectedWriter by remember { mutableStateOf(writers.first()) }
  var selectedOrganizer by remember { mutableStateOf(organizers.first()) }
  var selectedPresenter by remember { mutableStateOf(presenters.first()) }
  var performanceNotes by remember { mutableStateOf("") }
  var errorMessage by remember { mutableStateOf<String?>(null) }

  Dialog(onDismissRequest = onDismiss) {
    ManuscriptBox(
      modifier = Modifier
        .fillMaxWidth()
        .padding(4.dp),
      contentPadding = 18.dp
    ) {
      LazyColumn(
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        item {
          Column {
            Text(
              text = "የኪነጥበብ ሥራ ምደባ",
              style = MaterialTheme.typography.titleMedium,
              color = MaterialTheme.colorScheme.primary,
              fontWeight = FontWeight.Bold,
              fontFamily = FontFamily.Serif
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
              text = "ለ«${program.title}» (${program.recurrence.amharicLabel})",
              style = MaterialTheme.typography.bodySmall,
              color = AntiqueGoldDark,
              fontWeight = FontWeight.SemiBold
            )
          }
        }

        item {
          HaragDivider()
        }

        // 1. Choose or Enter Art Work Title
        item {
          Text(
            text = "የሥነፅሁፍ ሥራ (Art Work) ምረጥ ወይም ጻፍ *",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
          )
          Spacer(modifier = Modifier.height(4.dp))
          if (availableWorks.isNotEmpty()) {
            LazyRow(
              horizontalArrangement = Arrangement.spacedBy(6.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              items(availableWorks.take(6)) { (title, cat) ->
                val isSelected = customWorkTitle == title
                Box(
                  modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(
                      if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                    )
                    .clickable {
                      customWorkTitle = title
                      workCategory = cat
                    }
                    .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                  Text(
                    text = title,
                    fontSize = 10.sp,
                    maxLines = 1,
                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }
            }
            Spacer(modifier = Modifier.height(6.dp))
          }

          OutlinedTextField(
            value = customWorkTitle,
            onValueChange = {
              customWorkTitle = it
              if (it.isNotBlank()) errorMessage = null
            },
            label = { Text("የሥራው ርዕስ *") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
          )
        }

        // 2. Select ✍️ ፀሃፊ (Writer) from members
        item {
          Text(
            text = "✍️ ፀሃፊ (Writer) ምረጥ *",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
          )
          Spacer(modifier = Modifier.height(4.dp))
          LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            items(writers) { w ->
              val isSelected = selectedWriter.id == w.id
              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(8.dp))
                  .background(
                    if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                  )
                  .clickable { selectedWriter = w }
                  .padding(horizontal = 10.dp, vertical = 6.dp)
              ) {
                Text(
                  text = w.fullName,
                  fontSize = 11.sp,
                  fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                  color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        }

        // 3. Select 🎬 አዘጋጅ (Organizer) from members
        item {
          Text(
            text = "🎬 አዘጋጅ (Organizer) ምረጥ *",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = AntiqueGoldDark
          )
          Spacer(modifier = Modifier.height(4.dp))
          LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            items(organizers) { org ->
              val isSelected = selectedOrganizer.id == org.id
              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(8.dp))
                  .background(
                    if (isSelected) AntiqueGoldDark else MaterialTheme.colorScheme.surfaceVariant
                  )
                  .clickable { selectedOrganizer = org }
                  .padding(horizontal = 10.dp, vertical = 6.dp)
              ) {
                Text(
                  text = org.fullName,
                  fontSize = 11.sp,
                  fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                  color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        }

        // 4. Select 🎙️ አቅራቢ (Presenter) from members
        item {
          Text(
            text = "🎙️ አቅራቢ (Presenter) ምረጥ *",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF256645)
          )
          Spacer(modifier = Modifier.height(4.dp))
          LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            items(presenters) { prs ->
              val isSelected = selectedPresenter.id == prs.id
              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(8.dp))
                  .background(
                    if (isSelected) Color(0xFF256645) else MaterialTheme.colorScheme.surfaceVariant
                  )
                  .clickable { selectedPresenter = prs }
                  .padding(horizontal = 10.dp, vertical = 6.dp)
              ) {
                Text(
                  text = prs.fullName,
                  fontSize = 11.sp,
                  fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                  color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        }

        // 5. Performance Notes
        item {
          OutlinedTextField(
            value = performanceNotes,
            onValueChange = { performanceNotes = it },
            label = { Text("የአቀራረብ መመሪያ / ማስታወሻ") },
            placeholder = { Text("ለምሳሌ፦ ከመድረክ በስተግራ በበገና ታጅቦ ይቀርባል...") },
            modifier = Modifier
              .fillMaxWidth()
              .height(75.dp),
            maxLines = 3
          )
        }

        if (errorMessage != null) {
          item {
            Text(
              text = errorMessage!!,
              color = Color.Red,
              style = MaterialTheme.typography.bodySmall,
              fontWeight = FontWeight.Bold
            )
          }
        }

        item {
          Spacer(modifier = Modifier.height(6.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            SecondaryButton(
              text = "ሰርዝ",
              onClick = onDismiss,
              modifier = Modifier.weight(1f)
            )
            PrimaryButton(
              text = "ምደባውን አጽድቅ",
              onClick = {
                if (customWorkTitle.isBlank()) {
                  errorMessage = "እባክዎ የሥራውን ርዕስ ያስገቡ"
                  return@PrimaryButton
                }
                onAssign(
                  customWorkTitle.trim(),
                  workCategory,
                  selectedWriter,
                  selectedOrganizer,
                  selectedPresenter,
                  performanceNotes.trim()
                )
              },
              modifier = Modifier
                .weight(1f)
                .testTag("confirm_assignment_btn")
            )
          }
        }
      }
    }
  }
}
