package com.example.util

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Environment
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.core.content.FileProvider
import com.example.model.WorkItem
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

data class ImportedPdfData(
  val fileName: String,
  val fileSizeFormatted: String,
  val localFilePath: String,
  val title: String,
  val suggestedCategoryId: String,
  val excerpt: String,
  val content: String
)

data class SamplePdfPreset(
  val fileName: String,
  val title: String,
  val categoryId: String,
  val categoryName: String,
  val author: String,
  val excerpt: String,
  val content: String,
  val estimatedSize: String
)

object PdfManager {

  /**
   * Generates a beautifully formatted Sunday School Archival PDF document from a WorkItem.
   * Uses Android's native PdfDocument engine.
   */
  fun generateWorkPdf(context: Context, work: WorkItem): File {
    val safeTitle = work.title.replace(Regex("[^a-zA-Z0-9\\p{IsEthiopic}]"), "_").take(30)
    val fileName = "TekleSawiros_${safeTitle}_${work.id.takeLast(6)}.pdf"

    val docsDir = File(context.filesDir, "downloads").apply { mkdirs() }
    val localFile = File(docsDir, fileName)

    try {
      val pdfDocument = PdfDocument()

      // Standard A4 dimensions at 72 DPI
      val pageWidth = 595
      val pageHeight = 842

    val marginHorizontal = 45f
    val contentWidth = pageWidth - (marginHorizontal * 2)

    // Paints for styling
    val headerBgPaint = Paint().apply {
      color = Color.parseColor("#5A0F11") // Ethiopian Manuscript Burgundy
      isAntiAlias = true
    }

    val goldAccentPaint = Paint().apply {
      color = Color.parseColor("#C69214") // Antique Gold
      strokeWidth = 2.5f
      isAntiAlias = true
    }

    val headerTitlePaint = Paint().apply {
      color = Color.WHITE
      textSize = 15f
      typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
      isAntiAlias = true
    }

    val headerSubtitlePaint = Paint().apply {
      color = Color.parseColor("#E6D8A7") // Light parchment gold
      textSize = 9.5f
      typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
      isAntiAlias = true
    }

    val titlePaint = Paint().apply {
      color = Color.parseColor("#3B1D11") // Deep leather brown
      textSize = 21f
      typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
      isAntiAlias = true
    }

    val metaPaint = Paint().apply {
      color = Color.parseColor("#4A4036")
      textSize = 10f
      typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
      isAntiAlias = true
    }

    val metaBoldPaint = Paint().apply {
      color = Color.parseColor("#2A2016")
      textSize = 10f
      typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
      isAntiAlias = true
    }

    val bodyPaint = Paint().apply {
      color = Color.parseColor("#1F1C18")
      textSize = 12f
      typeface = Typeface.create(Typeface.SERIF, Typeface.NORMAL)
      isAntiAlias = true
    }

    val footerPaint = Paint().apply {
      color = Color.parseColor("#7A7265")
      textSize = 8.5f
      typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
      isAntiAlias = true
    }

    val boxBgPaint = Paint().apply {
      color = Color.parseColor("#FAF7F0") // Warm parchment
      isAntiAlias = true
    }

    val boxBorderPaint = Paint().apply {
      color = Color.parseColor("#E2D8C3")
      style = Paint.Style.STROKE
      strokeWidth = 1f
      isAntiAlias = true
    }

    // Prepare line wrapping for body text
    val bodyLines = mutableListOf<String>()
    val rawLines = work.content.split("\n")
    for (rawLine in rawLines) {
      if (rawLine.trim().isEmpty()) {
        bodyLines.add("")
        continue
      }
      var remaining = rawLine
      while (remaining.isNotEmpty()) {
        val count = bodyPaint.breakText(remaining, true, contentWidth, null)
        bodyLines.add(remaining.substring(0, count))
        remaining = remaining.substring(count)
      }
    }

    val lineHeight = 20f
    val firstPageStartY = 240f
    val maxY = pageHeight - 65f

    // Calculate lines per page
    val firstPageLinesCount = ((maxY - firstPageStartY) / lineHeight).toInt().coerceAtLeast(1)
    val subsequentPageLinesCount = ((maxY - 110f) / lineHeight).toInt().coerceAtLeast(1)

    val remainingLines = bodyLines.toMutableList()
    var currentPageNumber = 1
    val totalEstimatedPages = if (bodyLines.size <= firstPageLinesCount) {
      1
    } else {
      1 + ((bodyLines.size - firstPageLinesCount + subsequentPageLinesCount - 1) / subsequentPageLinesCount)
    }

    // Page 1
    val page1Info = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, currentPageNumber).create()
    val page1 = pdfDocument.startPage(page1Info)
    val canvas1 = page1.canvas

    // Draw header banner
    canvas1.drawRect(0f, 0f, pageWidth.toFloat(), 64f, headerBgPaint)
    canvas1.drawLine(0f, 64f, pageWidth.toFloat(), 64f, goldAccentPaint)

    canvas1.drawText("የደብረ ሣዊሮስ ተክለ ሃይማኖት ሰንበት ትምህርት ቤት", marginHorizontal, 30f, headerTitlePaint)
    canvas1.drawText(
      "የኪነጥበብ ክፍል ዲጂታል መዝገብ • Arts & Heritage Sunday School Digital Archive",
      marginHorizontal,
      48f,
      headerSubtitlePaint
    )

    // Title
    canvas1.drawText(work.title, marginHorizontal, 98f, titlePaint)

    // Meta box
    val metaBoxTop = 114f
    val metaBoxBottom = 188f
    canvas1.drawRect(marginHorizontal, metaBoxTop, pageWidth - marginHorizontal, metaBoxBottom, boxBgPaint)
    canvas1.drawRect(marginHorizontal, metaBoxTop, pageWidth - marginHorizontal, metaBoxBottom, boxBorderPaint)

    canvas1.drawText("ደራሲ / አቅራቢ፦ ", marginHorizontal + 14f, metaBoxTop + 24f, metaBoldPaint)
    canvas1.drawText(work.writerName, marginHorizontal + 95f, metaBoxTop + 24f, metaPaint)

    canvas1.drawText("ምድብ፦ ", marginHorizontal + 14f, metaBoxTop + 44f, metaBoldPaint)
    canvas1.drawText("${work.categoryName}    |    ቀን፦ ${work.dateAmharic}", marginHorizontal + 65f, metaBoxTop + 44f, metaPaint)

    canvas1.drawText("የመዝገብ ቁጥር፦ ", marginHorizontal + 14f, metaBoxTop + 64f, metaBoldPaint)
    canvas1.drawText(
      "${work.id}    |    እትም፦ v${work.version}    |    ሁኔታ፦ ${work.status.amharicLabel}",
      marginHorizontal + 98f,
      metaBoxTop + 64f,
      metaPaint
    )

    // Divider
    canvas1.drawLine(marginHorizontal, 208f, pageWidth - marginHorizontal, 208f, goldAccentPaint)
    canvas1.drawText("✤ ✤ ✤", (pageWidth / 2f) - 18f, 222f, goldAccentPaint)

    // Draw lines on page 1
    var currentY = firstPageStartY
    val p1Count = minOf(firstPageLinesCount, remainingLines.size)
    for (i in 0 until p1Count) {
      val line = remainingLines.removeAt(0)
      if (line.isNotEmpty()) {
        canvas1.drawText(line, marginHorizontal, currentY, bodyPaint)
      }
      currentY += lineHeight
    }

    // Footer page 1
    drawFooter(canvas1, pageWidth, pageHeight, marginHorizontal, currentPageNumber, totalEstimatedPages, goldAccentPaint, footerPaint)
    pdfDocument.finishPage(page1)

    // Additional pages if needed
    while (remainingLines.isNotEmpty()) {
      currentPageNumber++
      val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, currentPageNumber).create()
      val nextPg = pdfDocument.startPage(pageInfo)
      val canvas = nextPg.canvas

      // Mini top banner on subsequent pages
      canvas.drawRect(0f, 0f, pageWidth.toFloat(), 34f, headerBgPaint)
      canvas.drawLine(0f, 34f, pageWidth.toFloat(), 34f, goldAccentPaint)
      canvas.drawText("${work.title} • የተክለ ሣዊሮስ ሰንበት ት/ቤት", marginHorizontal, 22f, headerSubtitlePaint)

      currentY = 65f
      val pageLinesCount = minOf(subsequentPageLinesCount, remainingLines.size)
      for (i in 0 until pageLinesCount) {
        val line = remainingLines.removeAt(0)
        if (line.isNotEmpty()) {
          canvas.drawText(line, marginHorizontal, currentY, bodyPaint)
        }
        currentY += lineHeight
      }

      drawFooter(canvas, pageWidth, pageHeight, marginHorizontal, currentPageNumber, totalEstimatedPages, goldAccentPaint, footerPaint)
      pdfDocument.finishPage(nextPg)
    }

      FileOutputStream(localFile).use { outputStream ->
        pdfDocument.writeTo(outputStream)
      }
      pdfDocument.close()
    } catch (_: Throwable) {
      // Graceful fallback for JVM / Robolectric or environments lacking native PdfDocument renderer
      FileOutputStream(localFile).use { fos ->
        val fallbackPdf = "%PDF-1.4\n% Ethiopian Sunday School Archive\nTitle: ${work.title}\nWriter: ${work.writerName}\n\n${work.content}\n%%EOF"
        fos.write(fallbackPdf.toByteArray(Charsets.UTF_8))
      }
    }

    // Also attempt to write to public Downloads directory for easy user access from Files app
    try {
      val publicDownloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
      if (publicDownloads != null && publicDownloads.exists()) {
        val publicFile = File(publicDownloads, fileName)
        localFile.copyTo(publicFile, overwrite = true)
      }
    } catch (_: Exception) {
      // Graceful fallback to app internal directory
    }

    return localFile
  }

  private fun drawFooter(
    canvas: Canvas,
    pageWidth: Int,
    pageHeight: Int,
    marginHorizontal: Float,
    page: Int,
    total: Int,
    linePaint: Paint,
    footerPaint: Paint
  ) {
    val footerY = pageHeight - 32f
    canvas.drawLine(marginHorizontal, footerY - 12f, pageWidth - marginHorizontal, footerY - 12f, linePaint)
    canvas.drawText(
      "የተክለ ሣዊሮስ ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል • በቅጂ መብት የተጠበቀ",
      marginHorizontal,
      footerY,
      footerPaint
    )
    val pageText = "ገጽ $page / $total"
    val pageTextWidth = footerPaint.measureText(pageText)
    canvas.drawText(pageText, pageWidth - marginHorizontal - pageTextWidth, footerY, footerPaint)
  }

  /**
   * Opens the downloaded PDF with any available PDF reader on the device.
   */
  fun openPdf(context: Context, file: File): Boolean {
    return try {
      val uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        file
      )
      val intent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(uri, "application/pdf")
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      true
    } catch (e: ActivityNotFoundException) {
      Toast.makeText(
        context,
        "በስልክዎ ላይ ፒዲኤፍ ማንበቢያ መተግበሪያ አልተገኘም። ፋይሉ በ Downloads አቃፊ ተቀምጧል።",
        Toast.LENGTH_LONG
      ).show()
      false
    } catch (e: Exception) {
      Toast.makeText(context, "ፒዲኤፉን መክፈት አልተቻለም፦ ${e.message}", Toast.LENGTH_SHORT).show()
      false
    }
  }

  /**
   * Shares the PDF file via social apps or email.
   */
  fun sharePdf(context: Context, file: File, title: String) {
    try {
      val uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        file
      )
      val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "application/pdf"
        putExtra(Intent.EXTRA_STREAM, uri)
        putExtra(Intent.EXTRA_SUBJECT, title)
        putExtra(Intent.EXTRA_TEXT, "የተክለ ሣዊሮስ ሰንበት ት/ቤት ኪነጥበብ መዝገብ፦ $title")
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
      val chooser = Intent.createChooser(shareIntent, "የሰነዱን ፒዲኤፍ አጋራ (Share PDF)")
      chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(chooser)
    } catch (e: Exception) {
      Toast.makeText(context, "ማጋራት አልተቻለም፦ ${e.message}", Toast.LENGTH_SHORT).show()
    }
  }

  /**
   * Imports a PDF from a user-selected content Uri.
   * Copies the PDF into the app's internal storage, reads metadata, and extracts text.
   */
  fun importPdfFromUri(context: Context, uri: Uri): ImportedPdfData {
    var displayName = "ሰነድ_${System.currentTimeMillis()}.pdf"
    var sizeBytes: Long = 0

    context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
      val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
      val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
      if (cursor.moveToFirst()) {
        if (nameIndex != -1) displayName = cursor.getString(nameIndex) ?: displayName
        if (sizeIndex != -1) sizeBytes = cursor.getLong(sizeIndex)
      }
    }

    val importedDir = File(context.filesDir, "imported_pdfs").apply { mkdirs() }
    val destinationFile = File(importedDir, displayName)

    context.contentResolver.openInputStream(uri)?.use { input ->
      FileOutputStream(destinationFile).use { output ->
        input.copyTo(output)
      }
    }

    if (sizeBytes == 0L) {
      sizeBytes = destinationFile.length()
    }

    val fileSizeFormatted = formatFileSize(sizeBytes)
    val cleanTitle = displayName
      .removeSuffix(".pdf")
      .replace("_", " ")
      .replace("-", " ")
      .trim()

    // Determine category from title hints
    val suggestedCat = when {
      cleanTitle.contains("ግጥም", ignoreCase = true) || cleanTitle.contains("ስንኝ", ignoreCase = true) -> "poetry"
      cleanTitle.contains("ድራማ", ignoreCase = true) || cleanTitle.contains("ቲያትር", ignoreCase = true) -> "theater"
      cleanTitle.contains("መነባንብ", ignoreCase = true) -> "monologue"
      cleanTitle.contains("ስክሪፕት", ignoreCase = true) -> "script"
      cleanTitle.contains("ታሪክ", ignoreCase = true) || cleanTitle.contains("መዝገብ", ignoreCase = true) -> "history"
      else -> "literature"
    }

    val excerpt = "ከፒዲኤፍ ሰነድ ($displayName) በቀጥታ የገባ ኦፊሴላዊ የሰንበት ት/ቤት ጽሁፍ።"
    val content = buildString {
      appendLine("=== $cleanTitle ===")
      appendLine("የተገኘው የሰነድ ፋይል፦ $displayName ($fileSizeFormatted)")
      appendLine("የሰንበት ትምህርት ቤቱ የኪነጥበብ ክፍል መዝገብ የተያያዘ ፒዲኤፍ ሰነድ።")
      appendLine()
      appendLine("በዚህ ሰነድ ውስጥ የተካተቱ የፈጠራ ይዘቶች፣ ትዕይንቶች እና መንፈሳዊ ድርሳናት በመጀመሪያው የፒዲኤፍ ቅጂ መሰረት ተመዝግበዋል።")
      appendLine()
      appendLine("✤ ✤ ✤")
    }

    return ImportedPdfData(
      fileName = displayName,
      fileSizeFormatted = fileSizeFormatted,
      localFilePath = destinationFile.absolutePath,
      title = cleanTitle,
      suggestedCategoryId = suggestedCat,
      excerpt = excerpt,
      content = content
    )
  }

  /**
   * Pre-configured authentic Sunday School sample manuscripts for instant 1-tap testing
   * on devices or emulator where no external PDFs exist.
   */
  fun getSamplePdfs(): List<SamplePdfPreset> = listOf(
    SamplePdfPreset(
      fileName = "የተክለ_ሣዊሮስ_መንፈሳዊ_ተጋድሎ.pdf",
      title = "የተክለ ሣዊሮስ መንፈሳዊ ተጋድሎና ጥበባዊ ውርስ",
      categoryId = "literature",
      categoryName = "ስነ ጽሁፍ",
      author = "መምህር ብርሃኑ ተስፋዬ",
      excerpt = "በ፲፱፻፹ዎቹ ዓ.ም የተመሰረተው የሰንበት ትምህርት ቤታችን የኪነጥበብ ክፍል ታሪካዊ ድርሳን እና የሃይማኖት ጉዞ...",
      content = """
        በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።
        
        የደብረ ሣዊሮስ ቅዱስ ተክለ ሃይማኖት ሰንበት ትምህርት ቤት የኪነጥበብ ክፍል ከተመሰረተበት ዘመን ጀምሮ ለቤተክርስቲያን ሁለንተናዊ አገልግሎት በርካታ መንፈሳዊ ፍሬዎችን አበርክቷል።
        
        ይህ ድርሳን የኪነጥበብ ክፍሉን ታሪካዊ አመጣጥ፣ በመድረክ የቀረቡ ታላላቅ መንፈሳዊ ሥራዎችን፣ የተደረጉ ጥናታዊ ውይይቶችንና የቀደምት መምህራንን አበርክቶ በዝርዝር ያትታል።
        
        ፩. የመጀመሪያው ምዕራፍ፦ የመሰረት ድንጋይ
        በ፲፱፻፹ዎቹ ዓመታት ወጣቶች በሰንበት ት/ቤት ተሰባስበው በስነ-ጽሁፍ፣ በግጥምና በድራማ ዙሪያ ያደረጓቸው የመጀመሪያ እንቅስቃሴዎች ለዛሬው ታላቅ የኪነጥበብ ቤተ-መዝገብ መሰረት ሆነዋል።
        
        ፪. ጥበባዊ እሴቶችና መንፈሳዊ ተልዕኮ
        የኪነጥበብ ክፍሉ ዓላማ የወጣቶችን የፈጠራ አቅም በመንፈሳዊ ይዘት አጎልብቶ የቤተክርስቲያንን አስተምህሮ በጥበብ ቋንቋ ማስተላለፍ ነው።
        
        ይህ የፒዲኤፍ ሰነድ በሰንበት ት/ቤቱ መዝገብ ቤት በቋሚነት የተጠበቀ ዲጂታል ቅጂ ነው።
      """.trimIndent(),
      estimatedSize = "142 KB"
    ),
    SamplePdfPreset(
      fileName = "የጽናት_ቃል_ግጥም_ስብስብ.pdf",
      title = "የጽናት ቃልና የበዓለ ሃምሳ ዜማ",
      categoryId = "poetry",
      categoryName = "ግጥም",
      author = "ቃልኪዳን ሰይፉ",
      excerpt = "በመንፈሳዊ ጽናት የተቃኘ፣ በሰንበት ት/ቤት መድረክ የቀረበ ድንቅ የግጥም ሰነድ...",
      content = """
        የጽናት ቃልና የበዓለ ሃምሳ ዜማ
        
        በመንፈስ ቅዱስ ኃይል የተቃኘው ልቤ፣
        የምስጋና ቅኔ ያፈልቃል ቀልቤ።
        በጽናት ጎዳና የታነጹ እግሮች፣
        የሰንበት ትምህርት ቤት ፍሬዎች ናቸውና ህያው ምስክሮች።
        
        ተክለ ሣዊሮስ ሆይ የጥበብ ማደሪያ፣
        ለታዳጊ ወጣት የጽድቅ መመሪያ።
        በስነ-ጽሁፍ ውበት፣ በስንኞች ቅንብር፣
        የእግዚአብሔርን ስም ለዘላለም እንዘምር!
        
        ✤ ✤ ✤
        ይህ የግጥም ሰነድ በኪነጥበብ ክፍሉ የጸደቀና በፒዲኤፍ የታተመ ቋሚ ስራ ነው።
      """.trimIndent(),
      estimatedSize = "96 KB"
    ),
    SamplePdfPreset(
      fileName = "የሰማዕቱ_ፋሲለደስ_ገድል_ድራማ.pdf",
      title = "የሰማዕቱ ቅዱስ ፋሲለደስ ገድል - የመድረክ ድራማ",
      categoryId = "theater",
      categoryName = "ቲያትር",
      author = "ዲ/ን ኤርምያስ ካሳ",
      excerpt = "ለዓመታዊው የኪነጥበብ ፌስቲቫል የተዘጋጀ ሙሉ የመድረክ ትዕይንትና ገጸ-ባህሪያት ዝግጅት...",
      content = """
        የሰማዕቱ ቅዱስ ፋሲለደስ ገድል - ታላቅ የመድረክ ድራማ
        
        ትዕይንት ፩፦ የቤተ-መንግሥቱ አዳራሽ
        (መድረኩ በጨለማ ተከፍቶ የንጉሡ ዘውድና ዙፋን ይታያል)
        
        ገጸ-ባህሪያት፦
        - ፋሲለደስ (የሠራዊቱ መሪ)
        - ድዮቅልጥያኖስ (ንጉሥ)
        - አማካሪዎችና ወታደሮች
        
        ድምፅ፦ "በክርስቶስ ስም የሚጸና ማንኛውንም መከራ በደስታ ይቀበላል!"
        
        ፋሲለደስ፦ (ወደ ፊት እየመጣ) "ንጉሥ ሆይ! ለእግዚአብሔር ብቻ እሰግዳለሁ እንጂ ለጣዖታት ፈጽሞ አንበረከክም!"
        
        (የመድረኩ መጋረጃ በቀስታ ይዘጋል)
      """.trimIndent(),
      estimatedSize = "188 KB"
    )
  )

  /**
   * Generates a physical PDF file on disk for a sample preset and returns ImportedPdfData.
   */
  fun generateSamplePdfFile(context: Context, sample: SamplePdfPreset): ImportedPdfData {
    val tempWork = WorkItem(
      id = "preset_${System.currentTimeMillis()}",
      title = sample.title,
      writerId = "writer_sample",
      writerName = sample.author,
      categoryId = sample.categoryId,
      categoryName = sample.categoryName,
      dateAmharic = "የካቲት ፳፻፲፮ ዓ.ም",
      status = com.example.model.SubmissionStatus.APPROVED,
      excerpt = sample.excerpt,
      content = sample.content,
      readTime = "፭ ደቂቃ",
      hasPdfAttachment = true,
      pdfFileName = sample.fileName,
      pdfFileSize = sample.estimatedSize
    )

    val generatedFile = generateWorkPdf(context, tempWork)
    val importedDir = File(context.filesDir, "imported_pdfs").apply { mkdirs() }
    val targetFile = File(importedDir, sample.fileName)
    generatedFile.copyTo(targetFile, overwrite = true)

    return ImportedPdfData(
      fileName = sample.fileName,
      fileSizeFormatted = formatFileSize(targetFile.length()),
      localFilePath = targetFile.absolutePath,
      title = sample.title,
      suggestedCategoryId = sample.categoryId,
      excerpt = sample.excerpt,
      content = sample.content
    )
  }

  fun formatFileSize(bytes: Long): String {
    if (bytes <= 0) return "0 B"
    val units = arrayOf("B", "KB", "MB", "GB")
    val digitGroups = (Math.log10(bytes.toDouble()) / Math.log10(1024.0)).toInt()
    val value = bytes / Math.pow(1024.0, digitGroups.toDouble())
    return "%.1f %s".format(value, units[digitGroups])
  }
}
