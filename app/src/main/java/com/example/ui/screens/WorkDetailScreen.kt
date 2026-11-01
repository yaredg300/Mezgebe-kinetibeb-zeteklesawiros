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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Pause
import androidx.compose.runtime.derivedStateOf
import com.example.ui.components.ParchmentPalette
import com.example.ui.components.ReadingProgressHairline
import com.example.ui.components.AudioWaveformVisualizer
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.R
import com.example.data.AppThemeMode
import com.example.data.ArchiveRepository
import com.example.model.SubmissionStatus
import com.example.ui.components.AppHeader
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.ManuscriptSeal
import com.example.ui.components.StatusBadge
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.StatusApprovedGreen
import com.example.util.PdfManager
import java.io.File
import kotlinx.coroutines.launch

@Composable
fun WorkDetailScreen(
  workId: String,
  repository: ArchiveRepository,
  onBackClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val works by repository.works.collectAsState()
  val work = works.find { it.id == workId } ?: works.first()
  val currentThemeMode by repository.themeMode.collectAsState()
  var fontSizeScale by remember { mutableFloatStateOf(1f) }
  var selectedParchment by remember { mutableStateOf(ParchmentPalette.CLASSIC) }
  val snackbarHostState = remember { SnackbarHostState() }
  val scope = rememberCoroutineScope()

  val listState = rememberLazyListState()
  val scrollProgress by remember {
    derivedStateOf {
      val total = listState.layoutInfo.totalItemsCount
      if (total <= 1) 0f
      else (listState.firstVisibleItemIndex.toFloat() / (total - 1).toFloat()).coerceIn(0f, 1f)
    }
  }

  val currentAudioTrack by repository.currentAudioTrack.collectAsState()
  val isAudioPlaying by repository.isAudioPlaying.collectAsState()
  val isThisWorkAudioPlaying = isAudioPlaying && currentAudioTrack?.id == "trk_${work.id}"

  // PDF download state
  var isDownloadingPdf by remember { mutableStateOf(false) }
  var downloadedPdfFile by remember { mutableStateOf<File?>(null) }
  var showDownloadSuccessDialog by remember { mutableStateOf(false) }

  fun performPdfDownload() {
    isDownloadingPdf = true
    scope.launch {
      try {
        val file = PdfManager.generateWorkPdf(context, work)
        downloadedPdfFile = file
        isDownloadingPdf = false
        showDownloadSuccessDialog = true
        snackbarHostState.showSnackbar("የ PDF ሰነዱ በተሳካ ሁኔታ ወርዷል!")
      } catch (e: Exception) {
        isDownloadingPdf = false
        snackbarHostState.showSnackbar("ፒዲኤፍ ማውረድ አልተቻለም፦ ${e.message}")
      }
    }
  }

  Box(modifier = modifier.fillMaxSize()) {
    Column(modifier = Modifier.fillMaxSize()) {
      AppHeader(
        title = work.title,
        subtitle = "${work.categoryName} • ${work.writerName}",
        showBack = true,
        onBackClick = onBackClick,
        actions = {
          // Liturgical Audio Recitation Button
          IconButton(
            onClick = {
              if (isThisWorkAudioPlaying) {
                repository.toggleAudioPlayPause()
              } else {
                repository.playWorkAudio(work)
                scope.launch {
                  snackbarHostState.showSnackbar("የሥራው የድምፅ ንባብ ተጀምሯል")
                }
              }
            },
            modifier = Modifier.testTag("detail_listen_audio_btn")
          ) {
            Icon(
              imageVector = if (isThisWorkAudioPlaying) Icons.Filled.Pause else Icons.Filled.VolumeUp,
              contentDescription = "በድምፅ አድምጥ",
              tint = if (isThisWorkAudioPlaying) AntiqueGold else MaterialTheme.colorScheme.primary
            )
          }

          // Direct Download PDF button in top bar
          IconButton(
            onClick = { performPdfDownload() },
            modifier = Modifier.testTag("detail_download_pdf_btn")
          ) {
            if (isDownloadingPdf) {
              CircularProgressIndicator(
                modifier = Modifier.size(18.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.primary
              )
            } else {
              Icon(
                imageVector = Icons.Filled.PictureAsPdf,
                contentDescription = "PDF አውርድ",
                tint = ManuscriptBurgundy
              )
            }
          }

          // Reading Mode Theme Toggle (Bright / Dark)
          IconButton(
            onClick = { repository.toggleThemeMode() },
            modifier = Modifier.testTag("detail_theme_toggle_btn")
          ) {
            Icon(
              imageVector = if (currentThemeMode == AppThemeMode.DARK) Icons.Filled.LightMode else Icons.Filled.DarkMode,
              contentDescription = if (currentThemeMode == AppThemeMode.DARK) "ብሩህ የንባብ ገጽታ" else "የጨለማ የንባብ ገጽታ",
              tint = MaterialTheme.colorScheme.primary
            )
          }

          // Font size adjust
          IconButton(
            onClick = {
              fontSizeScale = if (fontSizeScale >= 1.3f) 1f else fontSizeScale + 0.15f
            },
            modifier = Modifier.testTag("font_size_btn")
          ) {
            Icon(
              imageVector = Icons.Filled.FormatSize,
              contentDescription = "የፊደል መጠን",
              tint = MaterialTheme.colorScheme.primary
            )
          }

          // Bookmark
          IconButton(
            onClick = {
              repository.toggleBookmark(work.id)
              scope.launch {
                snackbarHostState.showSnackbar(
                  if (work.isBookmarked) "ከዕልባት ተወግዷል" else "ወደ ዕልባት ተጨምሯል"
                )
              }
            },
            modifier = Modifier.testTag("detail_bookmark_btn")
          ) {
            Icon(
              imageVector = if (work.isBookmarked) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
              contentDescription = "ዕልባት",
              tint = if (work.isBookmarked) AntiqueGold else MaterialTheme.colorScheme.primary
            )
          }

          // Share
          IconButton(
            onClick = {
              scope.launch {
                snackbarHostState.showSnackbar("የሥራው ማጋሪያ አገናኝ ተዘጋጅቷል")
              }
            },
            modifier = Modifier.testTag("detail_share_btn")
          ) {
            Icon(
              imageVector = Icons.Filled.Share,
              contentDescription = "አጋራ",
              tint = MaterialTheme.colorScheme.primary
            )
          }
        }
      )

      // Dynamic Reading Progress Hairline (fills as user scrolls)
      ReadingProgressHairline(progressFraction = scrollProgress)

      LazyColumn(
        state = listState,
        modifier = Modifier
          .fillMaxSize()
          .testTag("work_detail_scroll"),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
      ) {
        // Manuscript Cover Header Banner
        item {
          ManuscriptBox(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = 18.dp
          ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Box(
                  modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(AntiqueGold.copy(alpha = 0.18f))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                  Text(
                    text = work.categoryName,
                    fontSize = 12.sp,
                    color = AntiqueGoldDark,
                    fontWeight = FontWeight.Bold
                  )
                }

                StatusBadge(status = work.status)
              }

              Spacer(modifier = Modifier.height(14.dp))

              Text(
                text = work.title,
                style = MaterialTheme.typography.displayMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif,
                textAlign = TextAlign.Center
              )

              Spacer(modifier = Modifier.height(8.dp))

              Text(
                text = "ደራሲ፦ ${work.writerName}",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.Medium
              )

              Text(
                text = "የተጻፈበት ቀን፦ ${work.dateAmharic} • የንባብ ቆይታ፦ ${work.readTime}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )

              Spacer(modifier = Modifier.height(12.dp))
              HaragDivider(height = 14.dp)
            }
          }
        }

        // Official Archival Certification Seal Card (if approved)
        if (work.approvedBy != null) {
          item {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(StatusApprovedGreen.copy(alpha = 0.08f))
                .border(1.dp, StatusApprovedGreen.copy(alpha = 0.35f), RoundedCornerShape(8.dp))
                .padding(14.dp)
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
              ) {
                ManuscriptSeal(text = "የጸደቀ", color = StatusApprovedGreen)
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                  Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                      imageVector = Icons.Filled.Verified,
                      contentDescription = null,
                      tint = StatusApprovedGreen,
                      modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                      text = "በሰንበት ትምህርት ቤቱ የጸደቀ ቋሚ መዝገብ",
                      style = MaterialTheme.typography.labelMedium,
                      color = StatusApprovedGreen,
                      fontWeight = FontWeight.Bold
                    )
                  }
                  Text(
                    text = "ያረጋገጡት፦ ${work.approvedBy} (${work.approvedDate ?: "፳፻፲፮ ዓ.ም"})",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  Text(
                    text = "እትም/Version: v${work.version}",
                    style = MaterialTheme.typography.labelSmall,
                    color = AntiqueGoldDark
                  )
                }
              }
            }
          }
        }

        // Modern Parchment Palette Switcher & Audio Live Badge
        item {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "የብራና ገጽታ፦",
              style = MaterialTheme.typography.labelSmall,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
              ParchmentPalette.entries.forEach { palette ->
                val isSelected = selectedParchment == palette
                Box(
                  modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(palette.backgroundColor)
                    .border(
                      width = if (isSelected) 2.dp else 1.dp,
                      color = if (isSelected) AntiqueGold else Color.Gray.copy(alpha = 0.3f),
                      shape = RoundedCornerShape(12.dp)
                    )
                    .clickable { selectedParchment = palette }
                    .padding(horizontal = 8.dp, vertical = 4.dp)
                    .testTag("parchment_palette_${palette.id}")
                ) {
                  Text(
                    text = palette.nameAmharic,
                    fontSize = 10.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    color = palette.textColor
                  )
                }
              }
            }
          }
        }

        // Manuscript Reading Body with animated parchment texture colors
        item {
          val animBgColor by animateColorAsState(
            targetValue = selectedParchment.backgroundColor,
            label = "parchment_bg"
          )
          val animTextColor by animateColorAsState(
            targetValue = selectedParchment.textColor,
            label = "parchment_text"
          )

          ManuscriptBox(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = 24.dp,
            backgroundColor = animBgColor,
            borderColor = AntiqueGold.copy(alpha = 0.4f),
            showCornerFlourish = true
          ) {
            Column {
              // Opening decorative flourish
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
              ) {
                Text(
                  text = "✤ ✤ ✤",
                  color = AntiqueGold,
                  fontSize = 14.sp,
                  letterSpacing = 4.sp
                )
              }

              if (isThisWorkAudioPlaying) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                  modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(AntiqueGold.copy(alpha = 0.15f))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                  horizontalArrangement = Arrangement.Center,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  AudioWaveformVisualizer(
                    isPlaying = true,
                    barColor = AntiqueGoldDark,
                    barCount = 6,
                    maxHeight = 14.dp
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = "በድምፅ በመደመጥ ላይ ይገኛል...",
                    fontSize = 11.sp,
                    color = AntiqueGoldDark,
                    fontWeight = FontWeight.Bold
                  )
                }
              }

              Spacer(modifier = Modifier.height(16.dp))

              // The actual reading text with adjustable font size and parchment color
              Text(
                text = work.content,
                fontSize = (17 * fontSizeScale).sp,
                lineHeight = (28 * fontSizeScale).sp,
                fontFamily = FontFamily.Serif,
                color = animTextColor,
                letterSpacing = 0.3.sp
              )

              Spacer(modifier = Modifier.height(24.dp))

              HaragDivider(height = 12.dp)

              Spacer(modifier = Modifier.height(14.dp))

              // Archival Tag Chips
              Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
              ) {
                Text(
                  text = "መለያዎች፦",
                  style = MaterialTheme.typography.labelSmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                work.tags.forEach { tag ->
                  Box(
                    modifier = Modifier
                      .clip(RoundedCornerShape(4.dp))
                      .background(MaterialTheme.colorScheme.surfaceVariant)
                      .padding(horizontal = 8.dp, vertical = 2.dp)
                  ) {
                    Text(
                      text = "#$tag",
                      fontSize = 11.sp,
                      color = MaterialTheme.colorScheme.primary
                    )
                  }
                }
              }
            }
          }
        }

        // Archival PDF Document Download Card (CRITICAL FEATURE)
        item {
          ManuscriptBox(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = 16.dp
          ) {
            Column {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
              ) {
                Box(
                  modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(ManuscriptBurgundy.copy(alpha = 0.12f))
                    .border(1.dp, ManuscriptBurgundy.copy(alpha = 0.3f), RoundedCornerShape(8.dp)),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(
                    imageVector = Icons.Filled.PictureAsPdf,
                    contentDescription = "PDF",
                    tint = ManuscriptBurgundy,
                    modifier = Modifier.size(26.dp)
                  )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = "የሰነዱ ቋሚ የ PDF ቅጂ (Archival PDF)",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  Text(
                    text = "የተክለ ሣዊሮስ ሰንበት ት/ቤት ጥበባዊ ማህተም እና ይዘት ያለው የ PDF ሰነድ ያውርዱ",
                    style = MaterialTheme.typography.bodySmall,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }

              if (work.hasPdfAttachment && work.pdfFileName != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(6.dp))
                    .background(AntiqueGold.copy(alpha = 0.12f))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                  Text(
                    text = "የተያያዘ የመጀመሪያ ሰነድ፦ ${work.pdfFileName} (${work.pdfFileSize ?: "PDF"})",
                    style = MaterialTheme.typography.labelSmall,
                    color = AntiqueGoldDark,
                    fontWeight = FontWeight.Medium
                  )
                }
              }

              Spacer(modifier = Modifier.height(14.dp))

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                ElevatedButton(
                  onClick = { performPdfDownload() },
                  modifier = Modifier
                    .weight(1f)
                    .testTag("download_pdf_card_btn"),
                  shape = RoundedCornerShape(8.dp),
                  colors = ButtonDefaults.elevatedButtonColors(
                    containerColor = ManuscriptBurgundy,
                    contentColor = Color.White
                  )
                ) {
                  if (isDownloadingPdf) {
                    CircularProgressIndicator(
                      modifier = Modifier.size(16.dp),
                      strokeWidth = 2.dp,
                      color = Color.White
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("በማዘጋጀት ላይ...", fontSize = 12.sp)
                  } else {
                    Icon(
                      imageVector = Icons.Filled.FileDownload,
                      contentDescription = null,
                      modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("PDF አውርድ (Download)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                  }
                }

                if (downloadedPdfFile != null) {
                  OutlinedButton(
                    onClick = { PdfManager.openPdf(context, downloadedPdfFile!!) },
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("ክፈት", fontSize = 12.sp)
                  }
                }
              }
            }
          }
        }

        // Institutional Archive Footnote
        item {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text(
              text = "ዘተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል ዲጂታል መዝገብ",
              style = MaterialTheme.typography.bodySmall,
              fontSize = 11.sp,
              color = AntiqueGoldDark,
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = "ሁሉም የፈጠራ ስራዎች በቅጂ መብትና በቤተክርስቲያን መዝገብ የተጠበቁ ናቸው።",
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
              textAlign = TextAlign.Center
            )
          }
        }
      }
    }

    // PDF Download Success Modal Dialog
    if (showDownloadSuccessDialog && downloadedPdfFile != null) {
      val file = downloadedPdfFile!!
      Dialog(onDismissRequest = { showDownloadSuccessDialog = false }) {
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = MaterialTheme.colorScheme.surface,
          tonalElevation = 6.dp,
          modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
        ) {
          Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Box(
              modifier = Modifier
                .size(54.dp)
                .clip(CircleShape)
                .background(StatusApprovedGreen.copy(alpha = 0.14f)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Filled.CheckCircle,
                contentDescription = null,
                tint = StatusApprovedGreen,
                modifier = Modifier.size(34.dp)
              )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
              text = "የ PDF ሰነዱ በተሳካ ሁኔታ ወርዷል!",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onSurface,
              textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
              text = "${file.name}\nመጠን፦ ${PdfManager.formatFileSize(file.length())}",
              style = MaterialTheme.typography.bodySmall,
              color = AntiqueGoldDark,
              textAlign = TextAlign.Center,
              fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
              text = "ሰነዱ በስልክዎ Downloads / Documents ማህደር ውስጥ ተቀምጧል።",
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
              textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(18.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              ElevatedButton(
                onClick = { PdfManager.openPdf(context, file) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.elevatedButtonColors(
                  containerColor = MaterialTheme.colorScheme.primary,
                  contentColor = MaterialTheme.colorScheme.onPrimary
                )
              ) {
                Text("ሰነዱን ክፈት", fontSize = 12.sp, fontWeight = FontWeight.Bold)
              }

              OutlinedButton(
                onClick = { PdfManager.sharePdf(context, file, work.title) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(8.dp)
              ) {
                Text("አጋራ (Share)", fontSize = 12.sp)
              }
            }

            Spacer(modifier = Modifier.height(6.dp))

            TextButton(
              onClick = { showDownloadSuccessDialog = false },
              modifier = Modifier.fillMaxWidth()
            ) {
              Text("ተመለስ (Close)", color = MaterialTheme.colorScheme.onSurfaceVariant)
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
