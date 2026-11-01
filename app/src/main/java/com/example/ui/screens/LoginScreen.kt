package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.Image
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import com.example.R
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.runtime.collectAsState
import com.example.data.ArchiveRepository
import com.example.model.SundaySchoolDivision
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.ManuscriptSeal
import com.example.ui.components.PrimaryButton
import com.example.ui.components.SecondaryButton
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ChurchGoldenYellowLight
import com.example.ui.theme.ManuscriptBurgundy

@Composable
fun LoginScreen(
  repository: ArchiveRepository = remember { ArchiveRepository.instance },
  onLoginSuccess: () -> Unit,
  onContinueAsGuest: () -> Unit,
  onChangeDivisionClick: (() -> Unit)? = null
) {
  val selectedDivision by repository.selectedDivision.collectAsState()
  var isRegisterMode by remember { mutableStateOf(false) }
  var email by remember { mutableStateOf("kalkidan@teklesawiros.org") }
  var password by remember { mutableStateOf("******") }
  var fullName by remember { mutableStateOf("ቃልኪዳን ሰይፉ") }
  var isPasswordVisible by remember { mutableStateOf(false) }
  var feedbackMessage by remember { mutableStateOf<String?>(null) }

  Surface(
    color = MaterialTheme.colorScheme.background,
    modifier = Modifier
      .fillMaxSize()
      .statusBarsPadding()
      .navigationBarsPadding()
      .testTag("login_screen")
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(24.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center
    ) {
      // Sunday School Official Logo
      Box(
        modifier = Modifier
          .size(88.dp)
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

      Spacer(modifier = Modifier.height(14.dp))

      Text(
        text = "ተክለ ሳዊሮስ ሰንበት ት/ቤት",
        style = MaterialTheme.typography.titleLarge,
        color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Serif
      )

      Text(
        text = "የጨረቃ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን",
        style = MaterialTheme.typography.bodySmall,
        color = AntiqueGoldDark,
        fontWeight = FontWeight.Medium,
        textAlign = TextAlign.Center,
        lineHeight = 16.sp
      )

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = "መዝገበ ኪነጥበብ • ፲፱፻፶፯ / 1957",
        style = MaterialTheme.typography.labelMedium,
        color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.Bold
      )

      Spacer(modifier = Modifier.height(8.dp))
      HaragDivider(height = 14.dp)
      Spacer(modifier = Modifier.height(14.dp))

      // Active Branch / Division Capsule
      Surface(
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        border = androidx.compose.foundation.BorderStroke(1.dp, AntiqueGold.copy(alpha = 0.4f)),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("login_division_banner")
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 10.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Column {
            Text(
              text = "የተመረጠው የዕድሜ እርከን / ቅርንጫፍ፦",
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = "«${selectedDivision.titleAmharic}» ክፍል",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = AntiqueGoldDark
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "(${selectedDivision.ageRangeAmharic})",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }

          if (onChangeDivisionClick != null) {
            Surface(
              onClick = onChangeDivisionClick,
              shape = RoundedCornerShape(12.dp),
              color = MaterialTheme.colorScheme.surface,
              border = androidx.compose.foundation.BorderStroke(1.dp, AntiqueGold.copy(alpha = 0.5f)),
              modifier = Modifier.testTag("change_division_button")
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
              ) {
                Icon(
                  imageVector = Icons.Filled.SwapHoriz,
                  contentDescription = "ቅርንጫፍ ቀይር",
                  tint = AntiqueGold,
                  modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                  text = "ቀይር",
                  style = MaterialTheme.typography.labelMedium,
                  fontWeight = FontWeight.Bold,
                  color = AntiqueGoldDark
                )
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      ManuscriptBox(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = 20.dp
      ) {
        Column {
          Text(
            text = if (isRegisterMode) "አዲስ መለያ መፍጠሪያ" else "ወደ መዝገቡ መግቢያ",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Bold
          )

          Spacer(modifier = Modifier.height(4.dp))

          Text(
            text = if (isRegisterMode)
              "የሰንበት ት/ቤቱን የፈጠራ ስራዎች ለማቅረብና ለማሰስ ይመዝገቡ"
            else
              "የተፈቀደላቸው አባላት፣ ደራስያን እና ገምጋሚዎች መግቢያ",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )

          Spacer(modifier = Modifier.height(18.dp))

          if (isRegisterMode) {
            OutlinedTextField(
              value = fullName,
              onValueChange = { fullName = it },
              label = { Text("ሙሉ ስም (የአባል ስም)") },
              modifier = Modifier
                .fillMaxWidth()
                .testTag("register_fullname_input"),
              singleLine = true,
              colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AntiqueGold,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline
              )
            )
            Spacer(modifier = Modifier.height(12.dp))
          }

          OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("ኢሜይል / Email") },
            leadingIcon = {
              Icon(Icons.Filled.Email, contentDescription = null, tint = AntiqueGold)
            },
            modifier = Modifier
              .fillMaxWidth()
              .testTag("login_email_input"),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = AntiqueGold,
              unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
          )

          Spacer(modifier = Modifier.height(12.dp))

          OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("የይለፍ ቃል / Password") },
            leadingIcon = {
              Icon(Icons.Filled.Lock, contentDescription = null, tint = AntiqueGold)
            },
            trailingIcon = {
              IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                Icon(
                  imageVector = if (isPasswordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                  contentDescription = null,
                  tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            },
            visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("login_password_input"),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = AntiqueGold,
              unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
          )

          if (!isRegisterMode) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.End
            ) {
              TextButton(onClick = { feedbackMessage = "የይለፍ ቃል መቀየሪያ ጥያቄ ወደ አስተዳዳሪ ተልኳል" }) {
                Text(
                  text = "የይለፍ ቃል ረሳሁ?",
                  style = MaterialTheme.typography.labelSmall,
                  color = AntiqueGoldDark
                )
              }
            }
          } else {
            Spacer(modifier = Modifier.height(12.dp))
          }

          if (feedbackMessage != null) {
            Text(
              text = feedbackMessage!!,
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.primary,
              textAlign = TextAlign.Center,
              modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp)
            )
          }

          Spacer(modifier = Modifier.height(8.dp))

          PrimaryButton(
            text = if (isRegisterMode) "መለያ ፍጠር" else "ግባ / Login",
            onClick = onLoginSuccess,
            modifier = Modifier
              .fillMaxWidth()
              .testTag("submit_login_btn")
          )

          Spacer(modifier = Modifier.height(12.dp))

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = if (isRegisterMode) "ቀደም ሲል መለያ አለዎት?" else "አዲስ አባል ነዎት?",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            TextButton(
              onClick = {
                isRegisterMode = !isRegisterMode
                feedbackMessage = null
              },
              modifier = Modifier.testTag("toggle_register_mode_btn")
            ) {
              Text(
                text = if (isRegisterMode) "ግባ" else "መለያ ፍጠር",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Direct Member / Guest Exploration
      SecondaryButton(
        text = "እንደ አባል በቀጥታ አስስ (Guest Access)",
        onClick = onContinueAsGuest,
        modifier = Modifier
          .fillMaxWidth()
          .testTag("guest_access_btn")
      )

      Spacer(modifier = Modifier.height(14.dp))

      Text(
        text = "የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል መዝገብ ቤት",
        style = MaterialTheme.typography.bodySmall,
        fontSize = 11.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        textAlign = TextAlign.Center
      )
    }
  }
}
