package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.ManuscriptBurgundy

/**
 * Traditional Ethiopian "Harag" (ሐረግ) stylized ornamental divider.
 * Draws subtle geometric interlocking diamond and braided knot lines inspired by ancient Ge'ez manuscripts.
 */
@Composable
fun HaragDivider(
  modifier: Modifier = Modifier,
  goldColor: Color = AntiqueGold,
  burgundyColor: Color = ManuscriptBurgundy,
  height: Dp = 18.dp
) {
  Canvas(
    modifier = modifier
      .fillMaxWidth()
      .height(height)
  ) {
    val width = size.width
    val midY = size.height / 2f
    val centerX = width / 2f

    // Center illuminated Ethiopian diamond rosette
    val diamondRadius = 6.dp.toPx()
    val centerPath = Path().apply {
      moveTo(centerX, midY - diamondRadius)
      lineTo(centerX + diamondRadius, midY)
      lineTo(centerX, midY + diamondRadius)
      lineTo(centerX - diamondRadius, midY)
      close()
    }
    drawPath(centerPath, color = burgundyColor)

    // Inner gold dot
    drawCircle(
      color = goldColor,
      radius = 2.5.dp.toPx(),
      center = Offset(centerX, midY)
    )

    // Flanking ornamental diamond dots
    val dotOffset = 18.dp.toPx()
    drawCircle(color = goldColor, radius = 2.dp.toPx(), center = Offset(centerX - dotOffset, midY))
    drawCircle(color = goldColor, radius = 2.dp.toPx(), center = Offset(centerX + dotOffset, midY))

    val dotOffset2 = 32.dp.toPx()
    drawCircle(color = burgundyColor, radius = 1.5.dp.toPx(), center = Offset(centerX - dotOffset2, midY))
    drawCircle(color = burgundyColor, radius = 1.5.dp.toPx(), center = Offset(centerX + dotOffset2, midY))

    // Delicate tapering hairline borders
    val startLineEnd = centerX - 42.dp.toPx()
    val endLineStart = centerX + 42.dp.toPx()

    if (startLineEnd > 24.dp.toPx()) {
      drawLine(
        color = goldColor.copy(alpha = 0.5f),
        start = Offset(16.dp.toPx(), midY),
        end = Offset(startLineEnd, midY),
        strokeWidth = 1.dp.toPx()
      )
    }

    if (endLineStart < width - 24.dp.toPx()) {
      drawLine(
        color = goldColor.copy(alpha = 0.5f),
        start = Offset(endLineStart, midY),
        end = Offset(width - 16.dp.toPx(), midY),
        strokeWidth = 1.dp.toPx()
      )
    }
  }
}

/**
 * Ethiopian Manuscript Island Card Container.
 * Renders a detached floating card with rounded corners, subtle elevation, and optional traditional corner flourishes.
 */
@Composable
fun ManuscriptBox(
  modifier: Modifier = Modifier,
  backgroundColor: Color = MaterialTheme.colorScheme.surface,
  borderColor: Color = AntiqueGold.copy(alpha = 0.35f),
  cornerAccentColor: Color = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
  cornerRadius: Dp = 18.dp,
  elevation: Dp = 2.dp,
  showCornerFlourish: Boolean = false,
  contentPadding: Dp = 16.dp,
  content: @Composable BoxScope.() -> Unit
) {
  val shape = RoundedCornerShape(cornerRadius)
  Box(
    modifier = modifier
      .then(if (elevation > 0.dp) Modifier.shadow(elevation, shape, clip = false) else Modifier)
      .clip(shape)
      .background(backgroundColor)
      .border(1.dp, borderColor, shape)
  ) {
    if (showCornerFlourish) {
      // Subtle corner flourishes
      Canvas(modifier = Modifier.matchParentSize()) {
        val offsetInset = (cornerRadius.toPx() * 0.4f).coerceAtLeast(6.dp.toPx())
        val cornerSize = 8.dp.toPx()
        val strokeW = 1.2.dp.toPx()

        // Top-Left
        drawLine(cornerAccentColor, Offset(offsetInset, offsetInset), Offset(offsetInset + cornerSize, offsetInset), strokeW)
        drawLine(cornerAccentColor, Offset(offsetInset, offsetInset), Offset(offsetInset, offsetInset + cornerSize), strokeW)

        // Top-Right
        drawLine(cornerAccentColor, Offset(size.width - offsetInset - cornerSize, offsetInset), Offset(size.width - offsetInset, offsetInset), strokeW)
        drawLine(cornerAccentColor, Offset(size.width - offsetInset, offsetInset), Offset(size.width - offsetInset, offsetInset + cornerSize), strokeW)

        // Bottom-Left
        drawLine(cornerAccentColor, Offset(offsetInset, size.height - offsetInset), Offset(offsetInset + cornerSize, size.height - offsetInset), strokeW)
        drawLine(cornerAccentColor, Offset(offsetInset, size.height - offsetInset - cornerSize), Offset(offsetInset, size.height - offsetInset), strokeW)

        // Bottom-Right
        drawLine(cornerAccentColor, Offset(size.width - offsetInset - cornerSize, size.height - offsetInset), Offset(size.width - offsetInset, size.height - offsetInset), strokeW)
        drawLine(cornerAccentColor, Offset(size.width - offsetInset, size.height - offsetInset - cornerSize), Offset(size.width - offsetInset, size.height - offsetInset), strokeW)
      }
    }

    Box(modifier = Modifier.padding(contentPadding)) {
      content()
    }
  }
}

/**
 * Illuminated Manuscript Seal Stamp (e.g. for official Sunday school archival verification)
 */
@Composable
fun ManuscriptSeal(
  text: String,
  modifier: Modifier = Modifier,
  color: Color = ManuscriptBurgundy
) {
  Box(
    modifier = modifier
      .size(44.dp)
      .clip(CircleShape)
      .background(color.copy(alpha = 0.12f))
      .border(1.5.dp, color, CircleShape),
    contentAlignment = Alignment.Center
  ) {
    Canvas(modifier = Modifier.size(36.dp)) {
      drawCircle(
        color = AntiqueGold,
        radius = size.minDimension / 2f,
        style = Stroke(width = 1.dp.toPx())
      )
    }
    Text(
      text = text,
      color = color,
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      fontFamily = FontFamily.Serif
    )
  }
}
