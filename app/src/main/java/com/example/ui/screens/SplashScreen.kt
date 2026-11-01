package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.example.R
import com.example.ui.components.HaragDivider
import com.example.ui.components.PrimaryButton
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldLight
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.ManuscriptBurgundyDark
import com.example.ui.theme.ParchmentBackground
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
  onFinishSplash: () -> Unit
) {
  var visible by remember { mutableStateOf(false) }

  LaunchedEffect(Unit) {
    visible = true
    delay(2400)
    onFinishSplash()
  }

  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(
        Brush.verticalGradient(
          colors = listOf(
            ManuscriptBurgundyDark,
            ManuscriptBurgundy,
            ManuscriptBurgundyDark
          )
        )
      )
      .testTag("splash_screen"),
    contentAlignment = Alignment.Center
  ) {
    AnimatedVisibility(
      visible = visible,
      enter = fadeIn(animationSpec = tween(900)) + scaleIn(initialScale = 0.88f)
    ) {
      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.padding(32.dp)
      ) {
        // Sunday School Official Logo
        Box(
          modifier = Modifier
            .size(130.dp)
            .clip(CircleShape)
            .background(Color.White)
            .border(3.dp, AntiqueGold, CircleShape)
            .padding(4.dp)
            .border(1.dp, AntiqueGoldLight, CircleShape),
          contentAlignment = Alignment.Center
        ) {
          Image(
            painter = painterResource(id = R.drawable.ic_church_logo),
            contentDescription = "የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት ዓርማ",
            modifier = Modifier
              .size(118.dp)
              .clip(CircleShape),
            contentScale = ContentScale.Crop
          )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
          text = "ተክለ ሳዊሮስ ሰንበት ት/ቤት",
          fontSize = 24.sp,
          fontWeight = FontWeight.Bold,
          fontFamily = FontFamily.Serif,
          color = Color.White,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
          text = "የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን",
          fontSize = 13.sp,
          fontWeight = FontWeight.Normal,
          color = AntiqueGoldLight,
          textAlign = TextAlign.Center,
          lineHeight = 18.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        HaragDivider(
          goldColor = AntiqueGold,
          burgundyColor = Color.White.copy(alpha = 0.5f),
          modifier = Modifier.padding(horizontal = 24.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
          text = "መዝገበ ኪነጥበብ • ፲፱፻፶፯ / 1957",
          fontSize = 15.sp,
          fontWeight = FontWeight.SemiBold,
          color = Color.White.copy(alpha = 0.95f),
          textAlign = TextAlign.Center,
          letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(36.dp))

        PrimaryButton(
          text = "ወደ መዝገቡ ግባ",
          onClick = onFinishSplash,
          modifier = Modifier.fillMaxWidth(0.7f)
        )
      }
    }
  }
}
