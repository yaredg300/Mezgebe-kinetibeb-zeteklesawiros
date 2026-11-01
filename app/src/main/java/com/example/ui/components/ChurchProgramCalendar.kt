package com.example.ui.components

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.CulturalEvent
import com.example.model.ProgramAssignment
import com.example.model.ProgramRecurrence
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ManuscriptRed

/**
 * Ethiopian Months info for liturgical calendar navigation
 */
data class EthiopianMonth(
  val nameAmharic: String,
  val gregorianApprox: String,
  val startDayOfWeek: Int, // 0 = Sunday, 1 = Monday, etc.
  val daysCount: Int = 30
)

val ethiopianMonths = listOf(
  EthiopianMonth("መስከረም", "ሴፕቴምበር / ኦክቶበር", 2),
  EthiopianMonth("ጥቅምት", "ኦክቶበር / ኖቬምበር", 5),
  EthiopianMonth("ኅዳር", "ኖቬምበር / ዲሴምበር", 0),
  EthiopianMonth("ታኅሣሥ", "ዲሴምበር / ጃንዋሪ", 2),
  EthiopianMonth("ጥር", "ጃንዋሪ / ፌብሩዋሪ", 4),
  EthiopianMonth("የካቲት", "ፌብሩዋሪ / ማርች", 6),
  EthiopianMonth("መጋቢት", "ማርች / ኤፕሪል", 1),
  EthiopianMonth("ሚያዝያ", "ኤፕሪል / ሜይ", 3),
  EthiopianMonth("ግንቦት", "ሜይ / ጁን", 5),
  EthiopianMonth("ሰኔ", "ጁን / ጁላይ", 0),
  EthiopianMonth("ሐምሌ", "ጁላይ / ኦገስት", 2),
  EthiopianMonth("ነሐሴ", "ኦገስት / ሴፕቴምበር", 4),
  EthiopianMonth("ጳጉሜን", "ሴፕቴምበር (፭/፮ ቀናት)", 6, 5)
)

/**
 * Interactive Church Calendar Component
 * Allows filtering between Weekly, Monthly, and Yearly church programs,
 * selecting calendar days, and displaying assigned tasks (ሥነፅሁፍ ፀሃፊ፣ አዘጋጅ፣ አቅራቢ).
 */
@Composable
fun ChurchProgramCalendar(
  events: List<CulturalEvent>,
  modifier: Modifier = Modifier,
  onAssignArtWorkClick: ((CulturalEvent) -> Unit)? = null,
  onToggleTaskCompletion: ((eventId: String, assignmentId: String) -> Unit)? = null,
  onAddEventClick: (() -> Unit)? = null
) {
  // Calendar Navigation State
  var currentMonthIndex by remember { mutableIntStateOf(6) } // Defaults to መጋቢት (Month 7)
  var selectedDay by remember { mutableStateOf<Int?>(null) }
  var selectedRecurrenceFilter by remember { mutableStateOf<ProgramRecurrence?>(null) } // null = All

  val currentMonth = ethiopianMonths[currentMonthIndex]
  val weekDays = listOf("እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ")

  // Counts for each recurrence type
  val weeklyCount = remember(events) { events.count { it.recurrence == ProgramRecurrence.WEEKLY } }
  val monthlyCount = remember(events) { events.count { it.recurrence == ProgramRecurrence.MONTHLY } }
  val yearlyCount = remember(events) { events.count { it.recurrence == ProgramRecurrence.YEARLY } }

  // Filter events based on recurrence & selected day
  val displayedEvents = remember(events, selectedRecurrenceFilter, selectedDay) {
    events.filter { event ->
      // 1. Check recurrence filter
      val matchesRecurrence = selectedRecurrenceFilter == null || event.recurrence == selectedRecurrenceFilter

      // 2. Check day filter if selected
      val matchesDay = if (selectedDay == null) {
        true
      } else {
        val dayNum = selectedDay!!
        val dayOfWeek = (currentMonth.startDayOfWeek + dayNum - 1) % 7

        when (event.recurrence) {
          ProgramRecurrence.WEEKLY -> {
            if (dayOfWeek == 0 && (event.dateAmharic.contains("እሁድ") || event.title.contains("ሰንበት"))) true
            else if (dayOfWeek == 4 && (event.dateAmharic.contains("ሐሙስ") || event.title.contains("ልምምድ"))) true
            else event.dateAmharic.contains(weekDays[dayOfWeek])
          }
          ProgramRecurrence.MONTHLY -> {
            if (dayNum == 15 && (event.dateAmharic.contains("፲፭") || event.dateAmharic.contains("15"))) true
            else if (dayNum == 21 && (event.dateAmharic.contains("፳፩") || event.dateAmharic.contains("21"))) true
            else event.dateAmharic.contains("$dayNum")
          }
          ProgramRecurrence.YEARLY -> {
            if (dayNum == 15 && currentMonth.nameAmharic == "መጋቢት") true
            else if (dayNum == 27 && currentMonth.nameAmharic == "መጋቢት") true
            else event.dateAmharic.contains(currentMonth.nameAmharic)
          }
        }
      }
      matchesRecurrence && matchesDay
    }
  }

  Column(
    modifier = modifier
      .fillMaxWidth()
      .animateContentSize(),
    verticalArrangement = Arrangement.spacedBy(14.dp)
  ) {
    // 1. Top Recurrence Filter Pills (All, Weekly, Monthly, Yearly)
    ManuscriptBox(
      modifier = Modifier.fillMaxWidth(),
      contentPadding = 12.dp
    ) {
      Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            Icon(
              imageVector = Icons.Filled.FilterList,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(18.dp)
            )
            Text(
              text = "የመርሐ-ግብር ማጣሪያ (Recurrence Filter)",
              style = MaterialTheme.typography.titleSmall,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.primary,
              fontFamily = FontFamily.Serif
            )
          }

          if (onAddEventClick != null) {
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(6.dp))
                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                .clickable { onAddEventClick() }
                .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Icon(
                  imageVector = Icons.Filled.Add,
                  contentDescription = null,
                  tint = MaterialTheme.colorScheme.primary,
                  modifier = Modifier.size(14.dp)
                )
                Text(
                  text = "አዲስ መርሐ-ግብር",
                  fontSize = 10.sp,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.primary
                )
              }
            }
          }
        }

        // 4 Filter Pills
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          // ALL
          FilterPill(
            label = "ሁሉንም (${events.size})",
            isSelected = selectedRecurrenceFilter == null,
            activeColor = MaterialTheme.colorScheme.primary,
            modifier = Modifier.weight(1f),
            onClick = { selectedRecurrenceFilter = null }
          )

          // WEEKLY
          FilterPill(
            label = "🌿 ሳምንታዊ ($weeklyCount)",
            isSelected = selectedRecurrenceFilter == ProgramRecurrence.WEEKLY,
            activeColor = Color(0xFF2E6930),
            modifier = Modifier.weight(1f),
            onClick = { selectedRecurrenceFilter = ProgramRecurrence.WEEKLY }
          )

          // MONTHLY
          FilterPill(
            label = "🌕 ወርሃዊ ($monthlyCount)",
            isSelected = selectedRecurrenceFilter == ProgramRecurrence.MONTHLY,
            activeColor = AntiqueGoldDark,
            modifier = Modifier.weight(1f),
            onClick = { selectedRecurrenceFilter = ProgramRecurrence.MONTHLY }
          )

          // YEARLY
          FilterPill(
            label = "🌟 ዓመታዊ ($yearlyCount)",
            isSelected = selectedRecurrenceFilter == ProgramRecurrence.YEARLY,
            activeColor = ManuscriptRed,
            modifier = Modifier.weight(1f),
            onClick = { selectedRecurrenceFilter = ProgramRecurrence.YEARLY }
          )
        }
      }
    }

    // 2. Interactive Calendar View Box
    ManuscriptBox(
      modifier = Modifier.fillMaxWidth(),
      contentPadding = 14.dp
    ) {
      Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        // Month Navigation Header
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          IconButton(
            onClick = {
              if (currentMonthIndex > 0) currentMonthIndex--
              else currentMonthIndex = ethiopianMonths.lastIndex
            },
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = Icons.AutoMirrored.Filled.ArrowBack,
              contentDescription = "ያለፈው ወር",
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(20.dp)
            )
          }

          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
              text = "${currentMonth.nameAmharic} ፳፻፲፮ ዓ.ም",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.primary,
              fontFamily = FontFamily.Serif
            )
            Text(
              text = currentMonth.gregorianApprox,
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          IconButton(
            onClick = {
              if (currentMonthIndex < ethiopianMonths.lastIndex) currentMonthIndex++
              else currentMonthIndex = 0
            },
            modifier = Modifier.size(36.dp)
          ) {
            Icon(
              imageVector = Icons.AutoMirrored.Filled.ArrowForward,
              contentDescription = "የሚቀጥለው ወር",
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        HaragDivider()

        // Weekday Headers (እሁድ, ሰኞ, ማክሰኞ, ረቡዕ, ሐሙስ, ዓርብ, ቅዳሜ)
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          weekDays.forEachIndexed { index, day ->
            val isWeekend = index == 0 || index == 6
            Text(
              text = day,
              modifier = Modifier.weight(1f),
              textAlign = TextAlign.Center,
              fontSize = 11.sp,
              fontWeight = if (isWeekend) FontWeight.Bold else FontWeight.Medium,
              color = if (isWeekend) AntiqueGoldDark else MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }

        // Calendar Grid (7 columns, up to 5-6 rows)
        val startOffset = currentMonth.startDayOfWeek
        val totalCells = startOffset + currentMonth.daysCount
        val rows = (totalCells + 6) / 7

        Column(
          modifier = Modifier.fillMaxWidth(),
          verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          for (r in 0 until rows) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              for (c in 0 until 7) {
                val cellIndex = r * 7 + c
                val dayNumber = cellIndex - startOffset + 1

                if (dayNumber in 1..currentMonth.daysCount) {
                  val isSelected = selectedDay == dayNumber
                  val dayOfWeek = c

                  // Determine program dots on this day
                  val hasWeekly = dayOfWeek == 0 || dayOfWeek == 4
                  val hasMonthly = dayNumber == 15 || dayNumber == 21
                  val hasYearly = currentMonth.nameAmharic == "መጋቢት" && (dayNumber == 15 || dayNumber == 27)

                  Box(
                    modifier = Modifier
                      .weight(1f)
                      .height(40.dp)
                      .clip(RoundedCornerShape(6.dp))
                      .background(
                        when {
                          isSelected -> AntiqueGoldDark.copy(alpha = 0.25f)
                          dayOfWeek == 0 -> MaterialTheme.colorScheme.primary.copy(alpha = 0.04f)
                          else -> Color.Transparent
                        }
                      )
                      .border(
                        width = if (isSelected) 1.5.dp else 0.5.dp,
                        color = if (isSelected) AntiqueGoldDark else Color.Transparent,
                        shape = RoundedCornerShape(6.dp)
                      )
                      .clickable {
                        selectedDay = if (selectedDay == dayNumber) null else dayNumber
                      }
                      .padding(2.dp),
                    contentAlignment = Alignment.Center
                  ) {
                    Column(
                      horizontalAlignment = Alignment.CenterHorizontally,
                      verticalArrangement = Arrangement.Center
                    ) {
                      Text(
                        text = "$dayNumber",
                        fontSize = 12.sp,
                        fontWeight = if (isSelected || dayOfWeek == 0) FontWeight.Bold else FontWeight.Normal,
                        color = when {
                          isSelected -> AntiqueGoldDark
                          dayOfWeek == 0 -> MaterialTheme.colorScheme.primary
                          else -> MaterialTheme.colorScheme.onSurface
                        }
                      )

                      // Dots for Events
                      Row(
                        horizontalArrangement = Arrangement.spacedBy(2.dp),
                        verticalAlignment = Alignment.CenterVertically
                      ) {
                        if (hasWeekly && (selectedRecurrenceFilter == null || selectedRecurrenceFilter == ProgramRecurrence.WEEKLY)) {
                          Box(
                            modifier = Modifier
                              .size(4.dp)
                              .clip(CircleShape)
                              .background(Color(0xFF2E6930))
                          )
                        }
                        if (hasMonthly && (selectedRecurrenceFilter == null || selectedRecurrenceFilter == ProgramRecurrence.MONTHLY)) {
                          Box(
                            modifier = Modifier
                              .size(4.dp)
                              .clip(CircleShape)
                              .background(AntiqueGoldDark)
                          )
                        }
                        if (hasYearly && (selectedRecurrenceFilter == null || selectedRecurrenceFilter == ProgramRecurrence.YEARLY)) {
                          Box(
                            modifier = Modifier
                              .size(4.dp)
                              .clip(CircleShape)
                              .background(ManuscriptRed)
                          )
                        }
                      }
                    }
                  }
                } else {
                  Spacer(modifier = Modifier.weight(1f))
                }
              }
            }
          }
        }

        // Legend & Day Clear Option
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            CalendarLegendDot(color = Color(0xFF2E6930), label = "ሳምንታዊ")
            CalendarLegendDot(color = AntiqueGoldDark, label = "ወርሃዊ")
            CalendarLegendDot(color = ManuscriptRed, label = "ዓመታዊ")
          }

          if (selectedDay != null) {
            Text(
              text = "ቀን $selectedDay ተመርጧል (አጽዳ)",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.primary,
              modifier = Modifier.clickable { selectedDay = null }
            )
          }
        }
      }
    }

    // 3. Section Title: Programs & Assigned Tasks
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Column {
        Text(
          text = if (selectedDay != null) {
            "የቀን $selectedDay መርሃ-ግብራት እና የተመደቡ ተግባራት"
          } else {
            when (selectedRecurrenceFilter) {
              ProgramRecurrence.WEEKLY -> "ሳምንታዊ መርሃ-ግብራት እና የተመደቡ ተግባራት"
              ProgramRecurrence.MONTHLY -> "ወርሃዊ መርሃ-ግብራት እና የተመደቡ ተግባራት"
              ProgramRecurrence.YEARLY -> "ዓመታዊ መርሃ-ግብራት እና የተመደቡ ተግባራት"
              null -> "ሁሉም መርሃ-ግብራት እና የተመደቡ ተግባራት"
            }
          },
          style = MaterialTheme.typography.titleMedium,
          fontWeight = FontWeight.Bold,
          color = MaterialTheme.colorScheme.primary,
          fontFamily = FontFamily.Serif
        )
        Text(
          text = "${displayedEvents.size} መርሃ-ግብራት ተገኝተዋል",
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }

      ManuscriptSeal(
        text = when (selectedRecurrenceFilter) {
          ProgramRecurrence.WEEKLY -> "ሳምንታዊ"
          ProgramRecurrence.MONTHLY -> "ወርሃዊ"
          ProgramRecurrence.YEARLY -> "ዓመታዊ"
          null -> "ሁሉም"
        },
        color = when (selectedRecurrenceFilter) {
          ProgramRecurrence.WEEKLY -> Color(0xFF2E6930)
          ProgramRecurrence.MONTHLY -> AntiqueGoldDark
          ProgramRecurrence.YEARLY -> ManuscriptRed
          null -> MaterialTheme.colorScheme.primary
        }
      )
    }

    // 4. Display Filtered Events with Assigned Tasks
    if (displayedEvents.isEmpty()) {
      ManuscriptBox(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = 24.dp
      ) {
        Column(
          modifier = Modifier.fillMaxWidth(),
          horizontalAlignment = Alignment.CenterHorizontally,
          verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Icon(
            imageVector = Icons.Filled.CalendarMonth,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
            modifier = Modifier.size(36.dp)
          )
          Text(
            text = "በዚህ ማጣሪያ የተገኘ መርሐ-ግብር የለም።",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
          )
          if (selectedDay != null || selectedRecurrenceFilter != null) {
            Text(
              text = "ሁሉንም መርሃ-ግብራት ለማየት ማጣሪያውን ያጽዱ",
              style = MaterialTheme.typography.labelMedium,
              color = MaterialTheme.colorScheme.primary,
              fontWeight = FontWeight.Bold,
              modifier = Modifier.clickable {
                selectedDay = null
                selectedRecurrenceFilter = null
              }
            )
          }
        }
      }
    } else {
      displayedEvents.forEach { event ->
        ProgramWithAssignedTasksCard(
          event = event,
          onAssignArtWorkClick = if (onAssignArtWorkClick != null) {
            { onAssignArtWorkClick(event) }
          } else null,
          onToggleTaskCompletion = onToggleTaskCompletion
        )
      }
    }
  }
}

/**
 * Filter Pill Component
 */
@Composable
private fun FilterPill(
  label: String,
  isSelected: Boolean,
  activeColor: Color,
  modifier: Modifier = Modifier,
  onClick: () -> Unit
) {
  Box(
    modifier = modifier
      .clip(RoundedCornerShape(16.dp))
      .background(if (isSelected) activeColor else MaterialTheme.colorScheme.surfaceVariant)
      .border(
        width = 1.dp,
        color = if (isSelected) activeColor else AntiqueGold.copy(alpha = 0.3f),
        shape = RoundedCornerShape(16.dp)
      )
      .clickable { onClick() }
      .padding(vertical = 6.dp, horizontal = 4.dp),
    contentAlignment = Alignment.Center
  ) {
    Text(
      text = label,
      fontSize = 11.sp,
      fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
      color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
      maxLines = 1,
      overflow = TextOverflow.Ellipsis
    )
  }
}

/**
 * Legend Dot for Calendar Grid
 */
@Composable
private fun CalendarLegendDot(color: Color, label: String) {
  Row(
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(4.dp)
  ) {
    Box(
      modifier = Modifier
        .size(6.dp)
        .clip(CircleShape)
        .background(color)
    )
    Text(
      text = label,
      fontSize = 10.sp,
      color = MaterialTheme.colorScheme.onSurfaceVariant
    )
  }
}

/**
 * Detailed Event Card displaying:
 * 1. Event Recurrence & Metadata
 * 2. Assigned Art Works & Member Tasks (✍️ ፀሃፊ, 🎬 አዘጋጅ, 🎙️ አቅራቢ)
 * 3. Performance Notes & Interactive Task Readiness Check
 */
@Composable
fun ProgramWithAssignedTasksCard(
  event: CulturalEvent,
  modifier: Modifier = Modifier,
  onAssignArtWorkClick: (() -> Unit)? = null,
  onToggleTaskCompletion: ((eventId: String, assignmentId: String) -> Unit)? = null
) {
  val recurrenceColor = when (event.recurrence) {
    ProgramRecurrence.WEEKLY -> Color(0xFF2E6930)
    ProgramRecurrence.MONTHLY -> AntiqueGoldDark
    ProgramRecurrence.YEARLY -> ManuscriptRed
  }

  ManuscriptBox(
    modifier = modifier.fillMaxWidth(),
    contentPadding = 14.dp
  ) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
      // Event Header: Recurrence Badge + Title
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(4.dp))
              .background(recurrenceColor.copy(alpha = 0.15f))
              .border(0.5.dp, recurrenceColor, RoundedCornerShape(4.dp))
              .padding(horizontal = 6.dp, vertical = 2.dp)
          ) {
            Text(
              text = "● ${event.recurrence.amharicLabel} መርሐ-ግብር",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = recurrenceColor
            )
          }

          Spacer(modifier = Modifier.height(4.dp))

          Text(
            text = event.title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
            fontFamily = FontFamily.Serif
          )
        }

        ManuscriptSeal(
          text = event.category,
          color = MaterialTheme.colorScheme.primary
        )
      }

      // Date, Time, Venue Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(3.dp)
        ) {
          Icon(
            imageVector = Icons.Filled.Event,
            contentDescription = null,
            tint = AntiqueGoldDark,
            modifier = Modifier.size(13.dp)
          )
          Text(
            text = event.dateAmharic,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(3.dp)
        ) {
          Icon(
            imageVector = Icons.Filled.Schedule,
            contentDescription = null,
            tint = AntiqueGoldDark,
            modifier = Modifier.size(13.dp)
          )
          Text(
            text = event.timeAmharic,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(3.dp)
        ) {
          Icon(
            imageVector = Icons.Filled.LocationOn,
            contentDescription = null,
            tint = AntiqueGoldDark,
            modifier = Modifier.size(13.dp)
          )
          Text(
            text = event.location,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurface,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }
      }

      if (event.description.isNotBlank()) {
        Text(
          text = event.description,
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }

      HaragDivider()

      // Assigned Tasks Section
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(5.dp)
        ) {
          Icon(
            imageVector = Icons.Filled.Assignment,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(16.dp)
          )
          Text(
            text = "የተመደቡ ተግባራትና የሥነፅሁፍ ሥራዎች (${event.assignments.size})",
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
          )
        }

        if (onAssignArtWorkClick != null) {
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(6.dp))
              .background(AntiqueGold.copy(alpha = 0.15f))
              .clickable { onAssignArtWorkClick() }
              .padding(horizontal = 8.dp, vertical = 3.dp)
          ) {
            Text(
              text = "+ ሥራ መድብ",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = AntiqueGoldDark
            )
          }
        }
      }

      if (event.assignments.isEmpty()) {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(6.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
            .padding(10.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "ለዚህ መርሐ-ግብር እስካሁን የተመደበ የኪነጥበብ ሥራ የለም።",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      } else {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          event.assignments.forEach { asgn ->
            SingleAssignedTaskBox(
              assignment = asgn,
              onToggleCompletion = if (onToggleTaskCompletion != null) {
                { onToggleTaskCompletion(event.id, asgn.id) }
              } else null
            )
          }
        }
      }
    }
  }
}

/**
 * Single Assigned Task Display Box
 * Shows Art Work Title, Category, ✍️ ፀሃፊ, 🎬 አዘጋጅ, 🎙️ አቅራቢ, and Notes
 */
@Composable
private fun SingleAssignedTaskBox(
  assignment: ProgramAssignment,
  modifier: Modifier = Modifier,
  onToggleCompletion: (() -> Unit)? = null
) {
  Box(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(8.dp))
      .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
      .border(0.5.dp, AntiqueGold.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
      .padding(10.dp)
  ) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
      // Art Work Title & Completion Checkbox
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(6.dp),
          modifier = Modifier.weight(1f)
        ) {
          Icon(
            imageVector = Icons.Filled.AutoStories,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(16.dp)
          )
          Text(
            text = assignment.workTitle,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
          )
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(4.dp))
              .background(AntiqueGold.copy(alpha = 0.2f))
              .padding(horizontal = 4.dp, vertical = 1.dp)
          ) {
            Text(
              text = assignment.workCategory,
              fontSize = 9.sp,
              fontWeight = FontWeight.Medium,
              color = AntiqueGoldDark
            )
          }
        }

        // Completion Status Pill or Checkbox
        if (onToggleCompletion != null) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .clip(RoundedCornerShape(12.dp))
              .clickable { onToggleCompletion() }
              .padding(horizontal = 6.dp, vertical = 2.dp)
          ) {
            Icon(
              imageVector = if (assignment.isCompleted) Icons.Filled.CheckCircle else Icons.Filled.RadioButtonUnchecked,
              contentDescription = "ሁኔታ",
              tint = if (assignment.isCompleted) Color(0xFF2E6930) else MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = if (assignment.isCompleted) "ዝግጁ ሆኗል" else "በዝግጅት ላይ",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = if (assignment.isCompleted) Color(0xFF2E6930) else MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }

      // Three Key Roles: ✍️ ፀሃፊ, 🎬 አዘጋጅ, 🎙️ አቅራቢ
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        RoleBadgeItem(
          icon = "✍️",
          roleTitle = "ፀሃፊ",
          memberName = assignment.writerMemberName,
          accentColor = MaterialTheme.colorScheme.primary,
          modifier = Modifier.weight(1f)
        )
        RoleBadgeItem(
          icon = "🎬",
          roleTitle = "አዘጋጅ",
          memberName = assignment.organizerMemberName,
          accentColor = AntiqueGoldDark,
          modifier = Modifier.weight(1f)
        )
        RoleBadgeItem(
          icon = "🎙️",
          roleTitle = "አቅራቢ",
          memberName = assignment.presenterMemberName,
          accentColor = Color(0xFF256645),
          modifier = Modifier.weight(1f)
        )
      }

      // Performance Notes
      if (assignment.performanceNotes.isNotBlank()) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(4.dp))
            .background(Color(0xFFFFF9E6).copy(alpha = 0.6f))
            .border(0.5.dp, AntiqueGold.copy(alpha = 0.3f), RoundedCornerShape(4.dp))
            .padding(6.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          Text(text = "📋", fontSize = 11.sp)
          Text(
            text = "መመሪያ፦ ${assignment.performanceNotes}",
            style = MaterialTheme.typography.labelSmall,
            color = AntiqueGoldDark,
            fontFamily = FontFamily.Serif
          )
        }
      }
    }
  }
}

/**
 * Role Badge Item (ፀሃፊ / አዘጋጅ / አቅራቢ)
 */
@Composable
private fun RoleBadgeItem(
  icon: String,
  roleTitle: String,
  memberName: String,
  accentColor: Color,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .clip(RoundedCornerShape(6.dp))
      .background(accentColor.copy(alpha = 0.08f))
      .border(0.5.dp, accentColor.copy(alpha = 0.3f), RoundedCornerShape(6.dp))
      .padding(horizontal = 6.dp, vertical = 4.dp)
  ) {
    Column {
      Text(
        text = "$icon $roleTitle",
        fontSize = 9.sp,
        fontWeight = FontWeight.Bold,
        color = accentColor
      )
      Text(
        text = memberName,
        fontSize = 11.sp,
        fontWeight = FontWeight.Medium,
        color = MaterialTheme.colorScheme.onSurface,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis
      )
    }
  }
}
