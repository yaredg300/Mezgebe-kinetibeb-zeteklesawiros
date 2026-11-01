package com.example.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.BorderStroke
import androidx.compose.ui.window.Dialog
import com.example.data.ArchiveRepository
import com.example.model.SundaySchoolDivision
import com.example.ui.components.AppHeader
import com.example.ui.components.HaragDivider
import com.example.ui.components.ManuscriptBox
import com.example.ui.components.PrimaryButton
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.StatusApprovedGreen
import com.example.util.PdfManager
import com.example.util.SamplePdfPreset
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun CreateWorkScreen(
  repository: ArchiveRepository,
  onWorkCreated: (String) -> Unit,
  onBackClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  var title by remember { mutableStateOf("") }
  var writerName by remember { mutableStateOf(repository.currentUser.value.fullName) }
  var selectedCategoryId by remember { mutableStateOf("poetry") }
  var selectedDivision by remember { mutableStateOf(repository.selectedDivision.value) }
  var content by remember { mutableStateOf("") }
  var excerpt by remember { mutableStateOf("") }
  var tagText by remember { mutableStateOf("መንፈሳዊ, ግጥም, ተክለ ሣዊሮስ") }
  var isSubmitting by remember { mutableStateOf(false) }

  // PDF import state
  var attachedPdfName by remember { mutableStateOf<String?>(null) }
  var attachedPdfSize by remember { mutableStateOf<String?>(null) }
  var attachedPdfPath by remember { mutableStateOf<String?>(null) }
  var showSamplePdfPicker by remember { mutableStateOf(false) }

  val snackbarHostState = remember { SnackbarHostState() }
  val scope = rememberCoroutineScope()

  val pdfPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetContent()
  ) { uri: Uri? ->
    if (uri != null) {
      try {
        val imported = PdfManager.importPdfFromUri(context, uri)
        attachedPdfName = imported.fileName
        attachedPdfSize = imported.fileSizeFormatted
        attachedPdfPath = imported.localFilePath
        if (title.isBlank()) title = imported.title
        if (excerpt.isBlank()) excerpt = imported.excerpt
        if (content.isBlank()) content = imported.content
        selectedCategoryId = imported.suggestedCategoryId
        scope.launch {
          snackbarHostState.showSnackbar("የ PDF ሰነዱ በተሳካ ሁኔታ ተያይዟል፦ ${imported.fileName}")
        }
      } catch (e: Exception) {
        scope.launch {
          snackbarHostState.showSnackbar("ፒዲኤፉን ማስመጣት አልተቻለም፦ ${e.message}")
        }
      }
    }
  }

  Box(modifier = modifier.fillMaxSize()) {
    Column(modifier = Modifier.fillMaxSize()) {
      AppHeader(
        title = "አዲስ ስራ አቅርብ",
        subtitle = "የፈጠራ ስራዎችን ወደ መዝገቡ ማስገቢያ",
        showBack = true,
        onBackClick = onBackClick
      )

      LazyColumn(
        modifier = Modifier
          .fillMaxSize()
          .testTag("create_work_form"),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
      ) {
        // Archival Submission Rules Banner
        item {
          ManuscriptBox(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = 14.dp
          ) {
            Column {
              Text(
                text = "የስራ ማቅረቢያ መመሪያ",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif
              )
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = "የሚያቀርቡት ስራ ለሰንበት ት/ቤቱ የኪነጥበብ ገምጋሚዎች ይላካል። ከተገመገመና ከጸደቀ በኋላ በቋሚነት ወደ መዝገቡ ይገባል።",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        }

        // PDF Import & Attachment Card (CRITICAL FEATURE)
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
                    .size(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(ManuscriptBurgundy.copy(alpha = 0.12f)),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(
                    imageVector = Icons.Filled.PictureAsPdf,
                    contentDescription = "PDF Import",
                    tint = ManuscriptBurgundy,
                    modifier = Modifier.size(24.dp)
                  )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = "ፒዲኤፍ ሰነድ አስመጣ (Import PDF)",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  Text(
                    text = "የተዘጋጀ የፒዲኤፍ ሰነድ በማስመጣት ርዕሱን፣ ይዘቱንና ፋይሉን በቀጥታ ያያይዙ",
                    style = MaterialTheme.typography.bodySmall,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }

              Spacer(modifier = Modifier.height(12.dp))

              if (attachedPdfName != null) {
                // Attached PDF Preview Banner
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(StatusApprovedGreen.copy(alpha = 0.09f))
                    .border(1.dp, StatusApprovedGreen.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                    .padding(12.dp)
                ) {
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                  ) {
                    Row(
                      verticalAlignment = Alignment.CenterVertically,
                      modifier = Modifier.weight(1f)
                    ) {
                      Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = null,
                        tint = StatusApprovedGreen,
                        modifier = Modifier.size(20.dp)
                      )
                      Spacer(modifier = Modifier.width(8.dp))
                      Column {
                        Text(
                          text = attachedPdfName ?: "",
                          style = MaterialTheme.typography.labelMedium,
                          fontWeight = FontWeight.Bold,
                          color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                          text = "${attachedPdfSize ?: ""} • የተያያዘ የሰነድ ቅጂ",
                          style = MaterialTheme.typography.labelSmall,
                          color = StatusApprovedGreen
                        )
                      }
                    }

                    IconButton(
                      onClick = {
                        attachedPdfName = null
                        attachedPdfSize = null
                        attachedPdfPath = null
                      },
                      modifier = Modifier.size(32.dp)
                    ) {
                      Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "አስወግድ",
                        tint = MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(18.dp)
                      )
                    }
                  }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                  OutlinedButton(
                    onClick = { pdfPickerLauncher.launch("application/pdf") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("ፋይሉን ቀይር", fontSize = 11.sp)
                  }
                  OutlinedButton(
                    onClick = { showSamplePdfPicker = true },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("ከናሙና ቀይር", fontSize = 11.sp)
                  }
                }
              } else {
                // PDF Import Buttons
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                  ElevatedButton(
                    onClick = { pdfPickerLauncher.launch("application/pdf") },
                    modifier = Modifier
                      .weight(1f)
                      .testTag("import_pdf_device_btn"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.elevatedButtonColors(
                      containerColor = MaterialTheme.colorScheme.primaryContainer,
                      contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                  ) {
                    Icon(
                      imageVector = Icons.Filled.FileUpload,
                      contentDescription = null,
                      modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                      text = "ከስልክዎ ፒዲኤፍ ምረጥ",
                      fontSize = 11.sp,
                      fontWeight = FontWeight.SemiBold
                    )
                  }

                  OutlinedButton(
                    onClick = { showSamplePdfPicker = true },
                    modifier = Modifier
                      .weight(1f)
                      .testTag("import_sample_pdf_btn"),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Icon(
                      imageVector = Icons.Filled.Description,
                      contentDescription = null,
                      modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                      text = "የሰንበት ት/ቤት ናሙና",
                      fontSize = 11.sp
                    )
                  }
                }
              }
            }
          }
        }

        // Sunday School Age Division Branch Selector
        item {
          Column {
            Text(
              text = "የሰንበት ት/ቤት የዕድሜ እርከን (ቅርንጫፍ) *",
              style = MaterialTheme.typography.labelLarge,
              color = MaterialTheme.colorScheme.onSurface,
              fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              SundaySchoolDivision.entries.forEach { div ->
                val isSelected = div == selectedDivision
                Surface(
                  onClick = { selectedDivision = div },
                  shape = RoundedCornerShape(12.dp),
                  color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface,
                  border = BorderStroke(
                    width = if (isSelected) 2.dp else 1.dp,
                    color = if (isSelected) AntiqueGold else MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)
                  ),
                  modifier = Modifier
                    .weight(1f)
                    .testTag("create_division_${div.id}")
                ) {
                  Column(
                    modifier = Modifier.padding(vertical = 10.dp, horizontal = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                  ) {
                    Text(
                      text = div.titleAmharic,
                      style = MaterialTheme.typography.labelMedium,
                      fontWeight = FontWeight.Bold,
                      color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = div.ageRangeAmharic,
                      style = MaterialTheme.typography.labelSmall,
                      fontSize = 10.sp,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                }
              }
            }
          }
        }

        // Category Selector Chips
        item {
          Column {
            Text(
              text = "የኪነጥበብ ምድብ ይምረጡ *",
              style = MaterialTheme.typography.labelLarge,
              color = MaterialTheme.colorScheme.onSurface,
              fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              items(repository.categories) { cat ->
                val isSelected = cat.id == selectedCategoryId
                Box(
                  modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                      if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                    )
                    .clickable { selectedCategoryId = cat.id }
                    .padding(horizontal = 14.dp, vertical = 8.dp)
                    .testTag("category_chip_${cat.id}")
                ) {
                  Text(
                    text = cat.nameAmharic,
                    fontSize = 12.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                  )
                }
              }
            }
          }
        }

        // Author / Writer Input
        item {
          OutlinedTextField(
            value = writerName,
            onValueChange = { writerName = it },
            label = { Text("ደራሲ / አቅራቢ (Author) *") },
            placeholder = { Text("ለምሳሌ፦ ቃልኪዳን ሰይፉ") },
            modifier = Modifier
              .fillMaxWidth()
              .testTag("work_writer_input"),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = AntiqueGold,
              unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
          )
        }

        // Title Input
        item {
          OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("የስራው ርዕስ *") },
            placeholder = { Text("ለምሳሌ፦ የጽናት ቃል...") },
            modifier = Modifier
              .fillMaxWidth()
              .testTag("work_title_input"),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = AntiqueGold,
              unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
          )
        }

        // Excerpt Input
        item {
          OutlinedTextField(
            value = excerpt,
            onValueChange = { excerpt = it },
            label = { Text("አጭር ማጠቃለያ / Excerpt") },
            placeholder = { Text("የስራው አጭር ማብራሪያ ወይም የመጀመሪያ ስንኝ...") },
            modifier = Modifier
              .fillMaxWidth()
              .testTag("work_excerpt_input"),
            minLines = 2,
            maxLines = 3,
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = AntiqueGold,
              unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
          )
        }

        // Full Content Input (Verse / Manuscript Body)
        item {
          OutlinedTextField(
            value = content,
            onValueChange = { content = it },
            label = { Text("የስራው ሙሉ ይዘት (ስንኞች ወይም ጽሁፍ) *") },
            placeholder = { Text("ግጥም፣ የመድረክ ቲያትር ወይም ስነ ጽሁፍ እዚህ ይጻፉ...") },
            modifier = Modifier
              .fillMaxWidth()
              .height(200.dp)
              .testTag("work_content_input"),
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = AntiqueGold,
              unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
          )
        }

        // Tags Input
        item {
          OutlinedTextField(
            value = tagText,
            onValueChange = { tagText = it },
            label = { Text("መለያዎች (በኮማ የተለዩ)") },
            placeholder = { Text("ግጥም, ቅኔ, ታሪክ") },
            modifier = Modifier
              .fillMaxWidth()
              .testTag("work_tags_input"),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = AntiqueGold,
              unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
          )
        }

        // Submit Button
        item {
          Spacer(modifier = Modifier.height(10.dp))
          PrimaryButton(
            text = if (isSubmitting) "በመላክ ላይ..." else "ለግምገማ አቅርብ (Submit for Review)",
            onClick = {
              if (title.isBlank() || content.isBlank()) {
                scope.launch {
                  snackbarHostState.showSnackbar("እባክዎ ርዕስ እና ሙሉ ይዘቱን ያስገቡ")
                }
                return@PrimaryButton
              }

              isSubmitting = true
              scope.launch {
                val tags = tagText.split(",").map { it.trim() }.filter { it.isNotBlank() }
                val newWork = repository.submitNewWork(
                  title = title,
                  categoryId = selectedCategoryId,
                  content = content,
                  excerpt = excerpt,
                  tags = tags,
                  writerName = writerName,
                  division = selectedDivision,
                  hasPdfAttachment = attachedPdfName != null,
                  pdfFileName = attachedPdfName,
                  pdfFileSize = attachedPdfSize,
                  pdfLocalPath = attachedPdfPath
                )
                snackbarHostState.showSnackbar(
                  if (attachedPdfName != null) "ስራዎ ከፒዲኤፍ ሰነድ ጋር ለግምገማ ቀርቧል!"
                  else "ስራዎ በተሳካ ሁኔታ ለግምገማ ቀርቧል!"
                )
                delay(600)
                onWorkCreated(newWork.id)
              }
            },
            enabled = !isSubmitting,
            icon = Icons.Filled.Send,
            modifier = Modifier
              .fillMaxWidth()
              .testTag("submit_work_button")
          )
        }
      }
    }

    // Sample Archival PDF Selection Dialog
    if (showSamplePdfPicker) {
      Dialog(onDismissRequest = { showSamplePdfPicker = false }) {
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = MaterialTheme.colorScheme.surface,
          tonalElevation = 6.dp,
          modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
        ) {
          Column(modifier = Modifier.padding(18.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "የሰንበት ት/ቤት ናሙና ፒዲኤፍ",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
              )
              IconButton(onClick = { showSamplePdfPicker = false }) {
                Icon(Icons.Filled.Close, contentDescription = "ዝጋ")
              }
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = "ከዚህ በታች ካሉት ኦፊሴላዊ ሰነዶች አንዱን በመምረጥ ፒዲኤፉንና ይዘቱን በቀጥታ ያስመጡ፦",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(12.dp))

            PdfManager.getSamplePdfs().forEach { sample ->
              Box(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(vertical = 4.dp)
                  .clip(RoundedCornerShape(8.dp))
                  .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                  .clickable {
                    try {
                      val imported = PdfManager.generateSamplePdfFile(context, sample)
                      attachedPdfName = imported.fileName
                      attachedPdfSize = imported.fileSizeFormatted
                      attachedPdfPath = imported.localFilePath
                      title = imported.title
                      excerpt = imported.excerpt
                      content = imported.content
                      selectedCategoryId = imported.suggestedCategoryId
                      showSamplePdfPicker = false
                      scope.launch {
                        snackbarHostState.showSnackbar("ናሙና ፒዲኤፍ ተያይዟል፦ ${imported.fileName}")
                      }
                    } catch (e: Exception) {
                      scope.launch {
                        snackbarHostState.showSnackbar("ስህተት፦ ${e.message}")
                      }
                    }
                  }
                  .padding(12.dp)
              ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Icon(
                    imageVector = Icons.Filled.PictureAsPdf,
                    contentDescription = null,
                    tint = ManuscriptBurgundy,
                    modifier = Modifier.size(28.dp)
                  )
                  Spacer(modifier = Modifier.width(10.dp))
                  Column(modifier = Modifier.weight(1f)) {
                    Text(
                      text = sample.title,
                      style = MaterialTheme.typography.labelLarge,
                      fontWeight = FontWeight.Bold,
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = "${sample.categoryName} • ${sample.author} • ${sample.estimatedSize}",
                      style = MaterialTheme.typography.labelSmall,
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

    SnackbarHost(
      hostState = snackbarHostState,
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .padding(bottom = 24.dp)
    )
  }
}
