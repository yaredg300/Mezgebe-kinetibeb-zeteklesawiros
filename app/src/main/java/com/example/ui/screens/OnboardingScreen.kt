package com.example.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HistoryEdu
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material.icons.filled.TheaterComedy
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.PrimaryButton
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.ManuscriptBurgundyLight
import com.example.ui.theme.StatusApprovedGreen

@Composable
fun OnboardingScreen(
  onComplete: () -> Unit
) {
  var currentStep by remember { mutableIntStateOf(0) }

  Surface(
    color = MaterialTheme.colorScheme.background,
    modifier = Modifier
      .fillMaxSize()
      .statusBarsPadding()
      .navigationBarsPadding()
      .testTag("onboarding_screen")
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(24.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // Header skip button
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .size(34.dp)
              .clip(CircleShape)
              .background(Color.White)
              .border(1.5.dp, AntiqueGold, CircleShape),
            contentAlignment = Alignment.Center
          ) {
            Image(
              painter = painterResource(id = R.drawable.ic_church_logo),
              contentDescription = "ዓርማ",
              contentScale = ContentScale.Crop,
              modifier = Modifier.fillMaxSize()
            )
          }
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "መዝገበ ኪነጥበብ",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
          )
        }
        if (currentStep < 2) {
          TextButton(
            onClick = onComplete,
            modifier = Modifier.testTag("skip_onboarding_btn")
          ) {
            Text(
              text = "ዝለል",
              color = AntiqueGoldDark,
              fontWeight = FontWeight.Medium
            )
          }
        } else {
          Spacer(modifier = Modifier.width(48.dp))
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Animated Step Content
      Box(modifier = Modifier.weight(1f)) {
        AnimatedContent(
          targetState = currentStep,
          transitionSpec = { fadeIn() togetherWith fadeOut() },
          label = "onboarding_step"
        ) { step ->
          when (step) {
            0 -> OnboardingStepCreate()
            1 -> OnboardingStepPreserve()
            2 -> OnboardingStepResponsiblePublishing()
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Indicator Dots
      Row(
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
      ) {
        repeat(3) { index ->
          val isSelected = index == currentStep
          Box(
            modifier = Modifier
              .padding(horizontal = 4.dp)
              .size(if (isSelected) 22.dp else 8.dp, 8.dp)
              .clip(RoundedCornerShape(4.dp))
              .background(
                if (isSelected) MaterialTheme.colorScheme.primary else AntiqueGold.copy(alpha = 0.35f)
              )
          )
        }
      }

      Spacer(modifier = Modifier.height(24.dp))

      // Action Button
      if (currentStep < 2) {
        PrimaryButton(
          text = "ቀጣይ",
          onClick = { currentStep++ },
          modifier = Modifier.fillMaxWidth(),
          icon = Icons.AutoMirrored.Filled.ArrowForward
        )
      } else {
        PrimaryButton(
          text = "ጀምር",
          onClick = onComplete,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("start_app_btn"),
          icon = Icons.Filled.CheckCircle
        )
      }
    }
  }
}

@Composable
private fun OnboardingStepCreate() {
  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center,
    modifier = Modifier.fillMaxSize()
  ) {
    // Hero illustration container
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .height(210.dp)
        .clip(RoundedCornerShape(12.dp))
        .border(1.5.dp, AntiqueGold.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
    ) {
      Image(
        painter = painterResource(id = R.drawable.img_manuscript_hero),
        contentDescription = "የፈጠራ ስራዎች ብራና",
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize()
      )
    }

    Spacer(modifier = Modifier.height(28.dp))

    Text(
      text = "ደረጃ ፩ — መፍጠር",
      style = MaterialTheme.typography.labelLarge,
      color = AntiqueGoldDark,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.sp
    )

    Spacer(modifier = Modifier.height(6.dp))

    Text(
      text = "የፈጠራ ሥራዎችን እንፍጠር",
      style = MaterialTheme.typography.headlineLarge,
      color = MaterialTheme.colorScheme.primary,
      fontWeight = FontWeight.Bold,
      fontFamily = FontFamily.Serif,
      textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(8.dp))
    HaragDivider(height = 12.dp)
    Spacer(modifier = Modifier.height(8.dp))

    Text(
      text = "የሰንበት ትምህርት ቤታችን የኪነጥበብ ክፍል አባላት ግጥም፣ ስነ ጽሁፍ፣ ቲያትር፣ መነባንብ እና ድርሳናትን በጥራት የሚጽፉበት እና ለቤተክርስቲያን አገልግሎት የሚያበረክቱበት ዲጂታል የስራ መድረክ።",
      style = MaterialTheme.typography.bodyLarge,
      color = MaterialTheme.colorScheme.onSurface,
      textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(20.dp))

    // Badges of Arts
    Row(
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      modifier = Modifier.fillMaxWidth(),
      verticalAlignment = Alignment.CenterVertically
    ) {
      ArtsPill("ግጥም", Icons.Filled.AutoStories, modifier = Modifier.weight(1f))
      ArtsPill("ስነ ጽሁፍ", Icons.Filled.MenuBook, modifier = Modifier.weight(1f))
      ArtsPill("ቲያትር", Icons.Filled.TheaterComedy, modifier = Modifier.weight(1f))
    }
  }
}

@Composable
private fun OnboardingStepPreserve() {
  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center,
    modifier = Modifier.fillMaxSize()
  ) {
    ManuscriptBox(
      modifier = Modifier
        .fillMaxWidth()
        .height(210.dp),
      contentPadding = 16.dp
    ) {
      Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceAround,
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Row(
          horizontalArrangement = Arrangement.SpaceEvenly,
          modifier = Modifier.fillMaxWidth()
        ) {
          PreserveIconBox("ብራና", Icons.Filled.HistoryEdu)
          PreserveIconBox("ፎቶግራፍ", Icons.Filled.PhotoLibrary)
          PreserveIconBox("ሰነዶች", Icons.Filled.MenuBook)
        }
        Text(
          text = "«የቀደመውን ታሪክ ያልጠበቀ አዲስ ታሪክ መጻፍ አይችልም።»",
          style = MaterialTheme.typography.bodyMedium,
          fontFamily = FontFamily.Serif,
          color = AntiqueGoldDark,
          textAlign = TextAlign.Center
        )
      }
    }

    Spacer(modifier = Modifier.height(28.dp))

    Text(
      text = "ደረጃ ፪ — መጠበቅ",
      style = MaterialTheme.typography.labelLarge,
      color = AntiqueGoldDark,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.sp
    )

    Spacer(modifier = Modifier.height(6.dp))

    Text(
      text = "ትውስታችንን እንጠብቅ",
      style = MaterialTheme.typography.headlineLarge,
      color = MaterialTheme.colorScheme.primary,
      fontWeight = FontWeight.Bold,
      fontFamily = FontFamily.Serif,
      textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(8.dp))
    HaragDivider(height = 12.dp)
    Spacer(modifier = Modifier.height(8.dp))

    Text(
      text = "የዓመታት የኪነጥበብ ዝግጅቶች፣ የድራማ ስክሪፕቶች፣ ፎቶግራፎችና የመድረክ ትውስታዎች ሳይጠፉ ለቀጣዩ ትውልድ በክብር ተመዝግበው የሚቀመጡበት አስተማማኝ ቅርስ።",
      style = MaterialTheme.typography.bodyLarge,
      color = MaterialTheme.colorScheme.onSurface,
      textAlign = TextAlign.Center
    )
  }
}

@Composable
private fun OnboardingStepResponsiblePublishing() {
  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center,
    modifier = Modifier.fillMaxSize()
  ) {
    // Visual Approval Workflow Chart: ፀሐፊ → ግምገማ → ኃላፊ → ፀድቋል → መዝገብ
    ManuscriptBox(
      modifier = Modifier
        .fillMaxWidth()
        .height(210.dp),
      contentPadding = 14.dp
    ) {
      Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Text(
          text = "የስራ ፍሰት እና የስርዓት ቁጥጥር",
          style = MaterialTheme.typography.labelMedium,
          color = AntiqueGoldDark,
          fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Step chain
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          WorkflowNode("ፀሐፊ", Icons.Filled.MenuBook)
          ArrowNode()
          WorkflowNode("ግምገማ", Icons.Filled.RateReview)
          ArrowNode()
          WorkflowNode("ኃላፊ", Icons.Filled.VerifiedUser)
          ArrowNode()
          WorkflowNode("ፀድቋል", Icons.Filled.CheckCircle, isApproved = true)
        }

        Spacer(modifier = Modifier.height(12.dp))

        Box(
          modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(AntiqueGold.copy(alpha = 0.15f))
            .border(1.dp, AntiqueGoldDark.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
          Text(
            text = "ወደ ቋሚ መዝገብ (Archived)",
            style = MaterialTheme.typography.labelSmall,
            color = ManuscriptBurgundy,
            fontWeight = FontWeight.Bold
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(28.dp))

    Text(
      text = "ደረጃ ፫ — ህጋዊና ስርዓታዊ ምዝገባ",
      style = MaterialTheme.typography.labelLarge,
      color = AntiqueGoldDark,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.sp
    )

    Spacer(modifier = Modifier.height(6.dp))

    Text(
      text = "በኃላፊነት እንዘግብ",
      style = MaterialTheme.typography.headlineLarge,
      color = MaterialTheme.colorScheme.primary,
      fontWeight = FontWeight.Bold,
      fontFamily = FontFamily.Serif,
      textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(8.dp))
    HaragDivider(height = 12.dp)
    Spacer(modifier = Modifier.height(8.dp))

    Text(
      text = "ማንኛውም የፈጠራ ስራ በቤተክርስቲያን ኃላፊዎችና ገምጋሚዎች ተመርምሮና ጸድቆ ብቻ የሚታተምበት ጥብቅና አስተማማኝ ስርዓት።",
      style = MaterialTheme.typography.bodyLarge,
      color = MaterialTheme.colorScheme.onSurface,
      textAlign = TextAlign.Center
    )
  }
}

@Composable
private fun ArtsPill(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier = Modifier) {
  Box(
    modifier = modifier
      .clip(RoundedCornerShape(6.dp))
      .background(MaterialTheme.colorScheme.surfaceVariant)
      .border(1.dp, AntiqueGold.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
      .padding(vertical = 8.dp),
    contentAlignment = Alignment.Center
  ) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      Icon(imageVector = icon, contentDescription = null, tint = ManuscriptBurgundy, modifier = Modifier.size(16.dp))
      Spacer(modifier = Modifier.width(4.dp))
      Text(text = label, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = ManuscriptBurgundy)
    }
  }
}

@Composable
private fun PreserveIconBox(title: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Box(
      modifier = Modifier
        .size(54.dp)
        .clip(CircleShape)
        .background(AntiqueGold.copy(alpha = 0.15f))
        .border(1.dp, AntiqueGold, CircleShape),
      contentAlignment = Alignment.Center
    ) {
      Icon(imageVector = icon, contentDescription = null, tint = ManuscriptBurgundy, modifier = Modifier.size(28.dp))
    }
    Spacer(modifier = Modifier.height(4.dp))
    Text(text = title, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
  }
}

@Composable
private fun WorkflowNode(title: String, icon: androidx.compose.ui.graphics.vector.ImageVector, isApproved: Boolean = false) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Box(
      modifier = Modifier
        .size(40.dp)
        .clip(CircleShape)
        .background(if (isApproved) StatusApprovedGreen.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
        .border(1.dp, if (isApproved) StatusApprovedGreen else AntiqueGold, CircleShape),
      contentAlignment = Alignment.Center
    ) {
      Icon(
        imageVector = icon,
        contentDescription = null,
        tint = if (isApproved) StatusApprovedGreen else ManuscriptBurgundy,
        modifier = Modifier.size(20.dp)
      )
    }
    Spacer(modifier = Modifier.height(2.dp))
    Text(
      text = title,
      style = MaterialTheme.typography.labelSmall,
      fontSize = 10.sp,
      fontWeight = FontWeight.Bold,
      color = if (isApproved) StatusApprovedGreen else MaterialTheme.colorScheme.onSurface
    )
  }
}

@Composable
private fun ArrowNode() {
  Text(text = "→", fontSize = 16.sp, color = AntiqueGoldDark, fontWeight = FontWeight.Bold)
}
