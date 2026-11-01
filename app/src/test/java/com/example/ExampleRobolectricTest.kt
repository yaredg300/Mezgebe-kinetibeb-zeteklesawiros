package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.ArchiveRepository
import com.example.util.PdfManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("መዝገበ ኪነጥበብ", appName)
  }

  @Test
  fun `pdf generation and sample preset import works`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val repo = ArchiveRepository()

    // Test sample presets exist
    val presets = PdfManager.getSamplePdfs()
    assertTrue(presets.isNotEmpty())

    // Generate sample PDF file
    val imported = PdfManager.generateSamplePdfFile(context, presets.first())
    assertNotNull(imported.localFilePath)
    assertTrue(imported.fileName.endsWith(".pdf"))

    // Submit work with attached PDF
    val work = repo.submitNewWork(
      title = imported.title,
      categoryId = imported.suggestedCategoryId,
      content = imported.content,
      excerpt = imported.excerpt,
      tags = listOf("ናሙና", "ፒዲኤፍ"),
      writerName = "ዲ/ን ቴዎድሮስ",
      hasPdfAttachment = true,
      pdfFileName = imported.fileName,
      pdfFileSize = imported.fileSizeFormatted,
      pdfLocalPath = imported.localFilePath
    )

    assertTrue(work.hasPdfAttachment)
    assertEquals(imported.fileName, work.pdfFileName)

    // Test generate work PDF
    val generatedPdf = PdfManager.generateWorkPdf(context, work)
    assertTrue(generatedPdf.exists())
    assertTrue(generatedPdf.length() > 0)
  }
}
