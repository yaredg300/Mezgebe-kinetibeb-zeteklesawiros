package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ChildCare
import androidx.compose.material.icons.filled.EscalatorWarning
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.ArchiveRepository
import com.example.model.SundaySchoolDivision
import com.example.ui.components.HaragDivider
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.AntiqueGoldLight
import com.example.ui.theme.ChurchGoldenYellow
import com.example.ui.theme.ChurchGoldenYellowLight
import com.example.ui.theme.ChurchRoyalBlue
import com.example.ui.theme.ChurchRoyalBlueLight
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.ManuscriptBurgundyLight

/**
 * Screen presented before login to select the Sunday School division branch:
 * ፩. ሕፃናት (Children)
 * ፪. ማዕከላውያን (Intermediates)
 * ፫. ወጣት (Youth)
 * This selection branches and separates the whole application content.
 */
@Composable
fun DivisionSelectionScreen(
  repository: ArchiveRepository,
  onContinueToLogin: (SundaySchoolDivision) -> Unit,
  onExploreAsGuest: (SundaySchoolDivision) -> Unit,
  modifier: Modifier = Modifier
) {
  val currentDivision by repository.selectedDivision.collectAsState()
  var selectedDivision by remember { mutableStateOf(currentDivision) }
  val allWorks by repository.works.collectAsState()

  Surface(
    color = MaterialTheme.colorScheme.background,
    modifier = modifier
      .fillMaxSize()
      .statusBarsPadding()
      .navigationBarsPadding()
      .testTag("division_selection_screen")
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 20.dp, vertical = 16.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Spacer(modifier = Modifier.height(8.dp))

      // Sunday School Official Emblem & Branding
      Box(
        modifier = Modifier
          .size(80.dp)
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

      Spacer(modifier = Modifier.height(10.dp))

      Text(
        text = "ተክለ ሳዊሮስ ሰንበት ት/ቤት",
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        fontFamily = FontFamily.Serif
      )

      Text(
        text = "መዝገበ ኪነጥበብ • የዕድሜ እርከን መምረጫ",
        style = MaterialTheme.typography.bodySmall,
        color = AntiqueGoldDark,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 0.5.sp
      )

      Spacer(modifier = Modifier.height(10.dp))
      HaragDivider(modifier = Modifier.fillMaxWidth(0.7f))
      Spacer(modifier = Modifier.height(16.dp))

      // Headline Question & Instructions
      Text(
        text = "የትኛውን የኪነጥበብ ቅርንጫፍ መጎብኘት ይፈልጋሉ?",
        style = MaterialTheme.typography.headlineSmall,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onBackground,
        textAlign = TextAlign.Center
      )

      Spacer(modifier = Modifier.height(6.dp))

      Text(
        text = "የተመረጠው ቅርንጫፍ ሙሉውን የኪነጥበብ፣ የመድረክ ዝግጅትና የትምህርት ይዘት ለይቶ ያቀርብልዎታል።",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(horizontal = 8.dp)
      )

      Spacer(modifier = Modifier.height(20.dp))

      // --- THREE BRANCH OPTIONS (ሕፃናት ፣ ማዕከላውያን ፣ ወጣት) ---
      val divisions = listOf(
        DivisionCardData(
          division = SundaySchoolDivision.CHILDREN,
          icon = Icons.Filled.ChildCare,
          badgeColor = ChurchGoldenYellow,
          badgeBg = ChurchGoldenYellowLight.copy(alpha = 0.3f),
          borderActive = ChurchGoldenYellow,
          worksCount = allWorks.count { it.division == SundaySchoolDivision.CHILDREN }
        ),
        DivisionCardData(
          division = SundaySchoolDivision.INTERMEDIATES,
          icon = Icons.Filled.School,
          badgeColor = ChurchRoyalBlue,
          badgeBg = ChurchRoyalBlueLight.copy(alpha = 0.25f),
          borderActive = ChurchRoyalBlue,
          worksCount = allWorks.count { it.division == SundaySchoolDivision.INTERMEDIATES }
        ),
        DivisionCardData(
          division = SundaySchoolDivision.YOUTH,
          icon = Icons.Filled.Groups,
          badgeColor = ManuscriptBurgundy,
          badgeBg = ManuscriptBurgundyLight.copy(alpha = 0.25f),
          borderActive = AntiqueGold,
          worksCount = allWorks.count { it.division == SundaySchoolDivision.YOUTH }
        )
      )

      divisions.forEach { data ->
        val isSelected = selectedDivision == data.division
        DivisionBranchCard(
          data = data,
          isSelected = isSelected,
          onClick = {
            selectedDivision = data.division
            repository.selectDivision(data.division)
          },
          modifier = Modifier.testTag("division_card_${data.division.id}")
        )
        Spacer(modifier = Modifier.height(14.dp))
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Action Buttons (Floating pill styling)
      Button(
        onClick = {
          repository.selectDivision(selectedDivision)
          onContinueToLogin(selectedDivision)
        },
        modifier = Modifier
          .fillMaxWidth()
          .height(54.dp)
          .testTag("continue_to_login_button"),
        shape = RoundedCornerShape(27.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = MaterialTheme.colorScheme.primary,
          contentColor = MaterialTheme.colorScheme.onPrimary
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Center
        ) {
          Text(
            text = "በ«${selectedDivision.titleAmharic}» ቅርንጫፍ ወደ መግቢያ ቀጥል",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold
          )
          Spacer(modifier = Modifier.width(8.dp))
          Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      OutlinedButton(
        onClick = {
          repository.selectDivision(selectedDivision)
          onExploreAsGuest(selectedDivision)
        },
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp)
          .testTag("continue_guest_button"),
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(1.5.dp, AntiqueGold.copy(alpha = 0.7f)),
        colors = ButtonDefaults.outlinedButtonColors(
          contentColor = MaterialTheme.colorScheme.primary
        )
      ) {
        Text(
          text = "እንደ እንግዳ በ«${selectedDivision.titleAmharic}» በቀጥታ አስስ",
          style = MaterialTheme.typography.bodyMedium,
          fontWeight = FontWeight.SemiBold
        )
      }

      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

private data class DivisionCardData(
  val division: SundaySchoolDivision,
  val icon: ImageVector,
  val badgeColor: Color,
  val badgeBg: Color,
  val borderActive: Color,
  val worksCount: Int
)

@Composable
private fun DivisionBranchCard(
  data: DivisionCardData,
  isSelected: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val animatedBorderColor by animateColorAsState(
    targetValue = if (isSelected) data.borderActive else MaterialTheme.colorScheme.outline.copy(alpha = 0.25f),
    label = "border_color"
  )
  val animatedBgColor by animateColorAsState(
    targetValue = if (isSelected) {
      MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
    } else {
      MaterialTheme.colorScheme.surface
    },
    label = "bg_color"
  )
  val cardScale by animateFloatAsState(
    targetValue = if (isSelected) 1.015f else 1.0f,
    label = "scale"
  )

  Surface(
    onClick = onClick,
    shape = RoundedCornerShape(22.dp),
    color = animatedBgColor,
    tonalElevation = if (isSelected) 4.dp else 1.dp,
    shadowElevation = if (isSelected) 6.dp else 2.dp,
    border = BorderStroke(if (isSelected) 2.dp else 1.dp, animatedBorderColor),
    modifier = modifier
      .fillMaxWidth()
      .scale(cardScale)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(18.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        // Icon and Title
        Row(
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .size(46.dp)
              .clip(RoundedCornerShape(14.dp))
              .background(data.badgeBg)
              .border(1.dp, data.badgeColor.copy(alpha = 0.5f), RoundedCornerShape(14.dp)),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = data.icon,
              contentDescription = data.division.titleAmharic,
              tint = data.badgeColor,
              modifier = Modifier.size(26.dp)
            )
          }

          Spacer(modifier = Modifier.width(14.dp))

          Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = data.division.titleAmharic,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
              )
              Spacer(modifier = Modifier.width(8.dp))
              Surface(
                shape = RoundedCornerShape(10.dp),
                color = data.badgeBg,
                border = BorderStroke(0.5.dp, data.badgeColor.copy(alpha = 0.4f))
              ) {
                Text(
                  text = data.division.ageRangeAmharic,
                  style = MaterialTheme.typography.labelSmall,
                  fontWeight = FontWeight.Bold,
                  color = data.badgeColor,
                  modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                )
              }
            }
            Text(
              text = data.division.subtitleAmharic,
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }

        // Selection Radio/Check Indicator
        Box(
          modifier = Modifier
            .size(28.dp)
            .clip(CircleShape)
            .background(if (isSelected) data.badgeColor else Color.Transparent)
            .border(
              width = 2.dp,
              color = if (isSelected) data.badgeColor else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
              shape = CircleShape
            ),
          contentAlignment = Alignment.Center
        ) {
          if (isSelected) {
            Icon(
              imageVector = Icons.Filled.CheckCircle,
              contentDescription = "የተመረጠ",
              tint = Color.White,
              modifier = Modifier.size(22.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Description
      Text(
        text = data.division.descriptionAmharic,
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        lineHeight = 18.sp
      )

      Spacer(modifier = Modifier.height(8.dp))

      // Biblical Verse / Motto
      Surface(
        shape = RoundedCornerShape(10.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
        modifier = Modifier.fillMaxWidth()
      ) {
        Text(
          text = data.division.mottoAmharic,
          style = MaterialTheme.typography.labelSmall,
          color = AntiqueGoldDark,
          fontWeight = FontWeight.Medium,
          fontFamily = FontFamily.Serif,
          modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
        )
      }

      Spacer(modifier = Modifier.height(8.dp))

      // Works Count Tag
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "በመዝገብ ላይ ያሉ ሥራዎች፦",
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = AntiqueGold.copy(alpha = 0.12f),
          border = BorderStroke(0.5.dp, AntiqueGold.copy(alpha = 0.3f))
        ) {
          Text(
            text = "${data.worksCount} ሥራዎች ተመዝግበዋል",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = AntiqueGoldDark,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
          )
        }
      }
    }
  }
}
