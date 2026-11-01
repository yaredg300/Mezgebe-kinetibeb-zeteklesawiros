package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.ArchiveRepository
import com.example.data.LiturgicalAudioTrack
import com.example.model.SundaySchoolDivision
import com.example.model.WorkItem
import com.example.ui.theme.AntiqueGold
import com.example.ui.theme.AntiqueGoldDark
import com.example.ui.theme.AntiqueGoldLight
import com.example.ui.theme.ChurchGoldenYellow
import com.example.ui.theme.ChurchGoldenYellowLight
import com.example.ui.theme.ChurchRoyalBlue
import com.example.ui.theme.ChurchRoyalBlueLight
import com.example.ui.theme.ManuscriptBurgundy
import com.example.ui.theme.ManuscriptBurgundyDark

/**
 * 1. Candlelight Aura & Ambient Glow Box:
 * Emulates the warm, breathing candlelight glow found in ancient stone Ethiopian monasteries
 * around sacred manuscripts. Uses an infinite transition with gentle alpha and radial expansion.
 */
@Composable
fun CandlelightGlowBox(
  modifier: Modifier = Modifier,
  glowColor: Color = AntiqueGold,
  enabled: Boolean = true,
  content: @Composable BoxScope.() -> Unit
) {
  if (!enabled) {
    Box(modifier = modifier) { content() }
    return
  }

  val infiniteTransition = rememberInfiniteTransition(label = "candlelight_pulse")
  val glowAlpha by infiniteTransition.animateFloat(
    initialValue = 0.12f,
    targetValue = 0.32f,
    animationSpec = infiniteRepeatable(
      animation = tween(2400, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "glow_alpha"
  )
  val glowRadiusRatio by infiniteTransition.animateFloat(
    initialValue = 0.85f,
    targetValue = 1.08f,
    animationSpec = infiniteRepeatable(
      animation = tween(2800, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "glow_radius"
  )

  Box(
    modifier = modifier
      .drawBehind {
        val maxDim = maxOf(size.width, size.height) * glowRadiusRatio
        drawCircle(
          brush = Brush.radialGradient(
            colors = listOf(
              glowColor.copy(alpha = glowAlpha),
              glowColor.copy(alpha = glowAlpha * 0.4f),
              Color.Transparent
            ),
            center = center,
            radius = maxDim / 1.6f
          ),
          center = center,
          radius = maxDim / 1.6f
        )
      }
  ) {
    content()
  }
}

/**
 * 2. Animated Real-time Audio Waveform Equalizer (5 pulsing bars):
 * Renders an animated sound wave visualization for spiritual recitations & choral audio.
 */
@Composable
fun AudioWaveformVisualizer(
  isPlaying: Boolean,
  barColor: Color = AntiqueGold,
  modifier: Modifier = Modifier,
  barCount: Int = 5,
  barWidth: Dp = 3.dp,
  maxHeight: Dp = 16.dp
) {
  val infiniteTransition = rememberInfiniteTransition(label = "audio_waveform")

  val phase1 by infiniteTransition.animateFloat(
    initialValue = 0.25f,
    targetValue = 0.95f,
    animationSpec = infiniteRepeatable(
      animation = tween(450, easing = LinearEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "bar1"
  )
  val phase2 by infiniteTransition.animateFloat(
    initialValue = 0.85f,
    targetValue = 0.30f,
    animationSpec = infiniteRepeatable(
      animation = tween(380, easing = LinearEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "bar2"
  )
  val phase3 by infiniteTransition.animateFloat(
    initialValue = 0.35f,
    targetValue = 1.0f,
    animationSpec = infiniteRepeatable(
      animation = tween(520, easing = LinearEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "bar3"
  )
  val phase4 by infiniteTransition.animateFloat(
    initialValue = 0.70f,
    targetValue = 0.20f,
    animationSpec = infiniteRepeatable(
      animation = tween(410, easing = LinearEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "bar4"
  )
  val phase5 by infiniteTransition.animateFloat(
    initialValue = 0.30f,
    targetValue = 0.80f,
    animationSpec = infiniteRepeatable(
      animation = tween(490, easing = LinearEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "bar5"
  )

  val heights = listOf(phase1, phase2, phase3, phase4, phase5)

  Row(
    modifier = modifier.height(maxHeight),
    horizontalArrangement = Arrangement.spacedBy(2.5.dp),
    verticalAlignment = Alignment.CenterVertically
  ) {
    for (i in 0 until barCount) {
      val factor = if (isPlaying) heights[i % heights.size] else 0.3f
      Box(
        modifier = Modifier
          .width(barWidth)
          .height(maxHeight * factor)
          .clip(RoundedCornerShape(2.dp))
          .background(barColor)
      )
    }
  }
}

/**
 * 3. Floating Liturgical Audio / Recitation Island:
 * A detached modern floating pill island placed above navigation content that provides
 * ambient spoken word / liturgical drama / hymnal audio recitation controls.
 */
@Composable
fun LiturgicalAudioFloatingIsland(
  track: LiturgicalAudioTrack,
  isPlaying: Boolean,
  progress: Float,
  onTogglePlayPause: () -> Unit,
  onClose: () -> Unit,
  onOpenDetails: () -> Unit,
  modifier: Modifier = Modifier
) {
  val (divColor, divBg) = when (track.division) {
    SundaySchoolDivision.CHILDREN -> ChurchGoldenYellow to ChurchGoldenYellowLight.copy(alpha = 0.35f)
    SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlue to ChurchRoyalBlueLight.copy(alpha = 0.25f)
    SundaySchoolDivision.YOUTH -> AntiqueGoldDark to AntiqueGold.copy(alpha = 0.2f)
  }

  Surface(
    shape = RoundedCornerShape(24.dp),
    color = MaterialTheme.colorScheme.surface,
    tonalElevation = 8.dp,
    shadowElevation = 12.dp,
    border = BorderStroke(1.2.dp, Brush.horizontalGradient(listOf(AntiqueGold, divColor, AntiqueGold))),
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 14.dp, vertical = 6.dp)
      .testTag("liturgical_audio_island")
  ) {
    Column(modifier = Modifier.fillMaxWidth()) {
      // Top Thin Audio Progress Bar
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(2.5.dp)
          .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
      ) {
        Box(
          modifier = Modifier
            .fillMaxWidth(progress)
            .height(2.5.dp)
            .background(Brush.horizontalGradient(listOf(AntiqueGold, divColor)))
        )
      }

      Row(
        modifier = Modifier
          .fillMaxWidth()
          .clickable { onOpenDetails() }
          .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Glowing Liturgical Icon with Equalizer Waveform
        Box(
          modifier = Modifier
            .size(38.dp)
            .clip(CircleShape)
            .background(divBg)
            .border(1.dp, divColor.copy(alpha = 0.6f), CircleShape),
          contentAlignment = Alignment.Center
        ) {
          if (isPlaying) {
            AudioWaveformVisualizer(
              isPlaying = true,
              barColor = divColor,
              maxHeight = 16.dp
            )
          } else {
            Icon(
              imageVector = Icons.Filled.VolumeUp,
              contentDescription = "ድምፅ",
              tint = divColor,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        Spacer(modifier = Modifier.width(10.dp))

        // Track Details
        Column(modifier = Modifier.weight(1f)) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = track.title,
              style = MaterialTheme.typography.labelMedium,
              fontWeight = FontWeight.Bold,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis,
              color = MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.weight(1f, fill = false)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Box(
              modifier = Modifier
                .clip(RoundedCornerShape(4.dp))
                .background(divBg)
                .padding(horizontal = 4.dp, vertical = 1.dp)
            ) {
              Text(
                text = track.division.titleAmharic,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = divColor
              )
            }
          }

          Text(
            text = "${track.narratorOrCantor} • ${track.durationAmharic}",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }

        Spacer(modifier = Modifier.width(6.dp))

        // Play/Pause Spring Button
        val playButtonScale by animateFloatAsState(
          targetValue = if (isPlaying) 1.05f else 1f,
          animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
          label = "play_scale"
        )
        IconButton(
          onClick = onTogglePlayPause,
          modifier = Modifier
            .size(36.dp)
            .scale(playButtonScale)
            .clip(CircleShape)
            .background(AntiqueGold.copy(alpha = 0.2f))
            .testTag("island_play_pause_button")
        ) {
          Icon(
            imageVector = if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
            contentDescription = if (isPlaying) "አቁም" else "አጫውት",
            tint = AntiqueGoldDark,
            modifier = Modifier.size(20.dp)
          )
        }

        // Close / Dismiss Island
        IconButton(
          onClick = onClose,
          modifier = Modifier
            .size(28.dp)
            .testTag("island_close_button")
        ) {
          Icon(
            imageVector = Icons.Filled.Close,
            contentDescription = "ዝጋ",
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
            modifier = Modifier.size(16.dp)
          )
        }
      }
    }
  }
}

/**
 * 4. Full Liturgical Audio Recitation Player Dialog/BottomSheet:
 * Expanded interactive controller for spiritual spoken word and choral recordings.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiturgicalAudioPlayerSheet(
  track: LiturgicalAudioTrack,
  isPlaying: Boolean,
  progress: Float,
  onTogglePlayPause: () -> Unit,
  onSeek: (Float) -> Unit,
  onDismiss: () -> Unit
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = MaterialTheme.colorScheme.surface,
    tonalElevation = 6.dp
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 24.dp)
        .padding(bottom = 32.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // Traditional Ethiopian illuminated cross seal
      Box(
        modifier = Modifier
          .size(80.dp)
          .clip(CircleShape)
          .background(AntiqueGold.copy(alpha = 0.16f))
          .border(2.dp, AntiqueGold, CircleShape),
        contentAlignment = Alignment.Center
      ) {
        AudioWaveformVisualizer(
          isPlaying = isPlaying,
          barColor = AntiqueGoldDark,
          barCount = 7,
          barWidth = 4.dp,
          maxHeight = 36.dp
        )
      }

      Spacer(modifier = Modifier.height(16.dp))

      Text(
        text = track.title,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Serif,
        color = MaterialTheme.colorScheme.onSurface
      )

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = track.narratorOrCantor,
        style = MaterialTheme.typography.bodyMedium,
        color = AntiqueGoldDark,
        fontWeight = FontWeight.Medium
      )

      Spacer(modifier = Modifier.height(6.dp))

      // Division and category tag
      Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Box(
          modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
            .padding(horizontal = 8.dp, vertical = 2.dp)
        ) {
          Text(
            text = track.categoryName,
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
          )
        }
        Box(
          modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(AntiqueGold.copy(alpha = 0.16f))
            .padding(horizontal = 8.dp, vertical = 2.dp)
        ) {
          Text(
            text = track.division.titleAmharic,
            fontSize = 11.sp,
            color = AntiqueGoldDark,
            fontWeight = FontWeight.Bold
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      if (track.description.isNotBlank()) {
        Text(
          text = "«${track.description}»",
          style = MaterialTheme.typography.bodySmall,
          fontFamily = FontFamily.Serif,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          modifier = Modifier.padding(horizontal = 8.dp)
        )
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Progress Slider
      Slider(
        value = progress,
        onValueChange = onSeek,
        colors = SliderDefaults.colors(
          thumbColor = AntiqueGold,
          activeTrackColor = AntiqueGold,
          inactiveTrackColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        modifier = Modifier.fillMaxWidth()
      )

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        val currentSeconds = (progress * track.durationSeconds).toInt()
        val minutes = currentSeconds / 60
        val secs = currentSeconds % 60
        Text(
          text = String.format("%d:%02d", minutes, secs),
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
          text = track.durationAmharic,
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Playback Controls Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
      ) {
        OutlinedButton(
          onClick = { onSeek((progress - 0.1f).coerceAtLeast(0f)) },
          shape = CircleShape,
          contentPadding = PaddingValues(0.dp),
          modifier = Modifier.size(44.dp)
        ) {
          Text("-15s", fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }

        Button(
          onClick = onTogglePlayPause,
          shape = CircleShape,
          colors = ButtonDefaults.buttonColors(containerColor = AntiqueGoldDark),
          contentPadding = PaddingValues(0.dp),
          modifier = Modifier.size(64.dp)
        ) {
          Icon(
            imageVector = if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
            contentDescription = if (isPlaying) "አቁም" else "አጫውት",
            tint = Color.White,
            modifier = Modifier.size(32.dp)
          )
        }

        OutlinedButton(
          onClick = { onSeek((progress + 0.1f).coerceAtMost(1f)) },
          shape = CircleShape,
          contentPadding = PaddingValues(0.dp),
          modifier = Modifier.size(44.dp)
        ) {
          Text("+15s", fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
      }
    }
  }
}

/**
 * 5. Modern Quick Work Preview Bottom Sheet (ፈጣን ቅድመ-ዕይታ):
 * Allows instant reading, audio recitation preview, and quick bookmarking directly from any card.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickWorkPreviewBottomSheet(
  work: WorkItem,
  onDismiss: () -> Unit,
  onOpenFullDetail: (String) -> Unit,
  onPlayAudio: (WorkItem) -> Unit,
  onToggleBookmark: (String) -> Unit
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = false)
  var isBookmarked by remember(work.isBookmarked) { mutableStateOf(work.isBookmarked) }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = MaterialTheme.colorScheme.surface,
    tonalElevation = 6.dp,
    modifier = Modifier.testTag("quick_preview_sheet")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp)
        .padding(bottom = 28.dp)
    ) {
      // Header with Category & Division
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(6.dp))
              .background(AntiqueGold.copy(alpha = 0.18f))
              .padding(horizontal = 8.dp, vertical = 3.dp)
          ) {
            Text(
              text = work.categoryName,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = AntiqueGoldDark
            )
          }

          val divBadgeBg = when (work.division) {
            SundaySchoolDivision.CHILDREN -> ChurchGoldenYellowLight.copy(alpha = 0.35f)
            SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlueLight.copy(alpha = 0.25f)
            SundaySchoolDivision.YOUTH -> AntiqueGold.copy(alpha = 0.16f)
          }
          val divBadgeColor = when (work.division) {
            SundaySchoolDivision.CHILDREN -> ChurchGoldenYellow
            SundaySchoolDivision.INTERMEDIATES -> ChurchRoyalBlue
            SundaySchoolDivision.YOUTH -> AntiqueGoldDark
          }
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(6.dp))
              .background(divBadgeBg)
              .padding(horizontal = 8.dp, vertical = 3.dp)
          ) {
            Text(
              text = work.division.titleAmharic,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = divBadgeColor
            )
          }
        }

        val bookmarkScale by animateFloatAsState(
          targetValue = if (isBookmarked) 1.25f else 1f,
          animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
          label = "preview_bookmark_scale"
        )
        IconButton(
          onClick = {
            isBookmarked = !isBookmarked
            onToggleBookmark(work.id)
          },
          modifier = Modifier.scale(bookmarkScale)
        ) {
          Icon(
            imageVector = if (isBookmarked) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
            contentDescription = "ዕልባት",
            tint = if (isBookmarked) AntiqueGold else MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      Text(
        text = work.title,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Serif,
        color = MaterialTheme.colorScheme.onSurface
      )

      Spacer(modifier = Modifier.height(4.dp))

      Text(
        text = "ፀሐፊ፦ ${work.writerName} • ${work.dateAmharic}",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.Medium
      )

      Spacer(modifier = Modifier.height(12.dp))

      // Illuminated Manuscript Excerpt Card
      Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
        border = BorderStroke(1.dp, AntiqueGold.copy(alpha = 0.3f)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Text(
            text = "« ${work.excerpt} »",
            style = MaterialTheme.typography.bodyMedium,
            fontFamily = FontFamily.Serif,
            lineHeight = 22.sp,
            color = MaterialTheme.colorScheme.onSurface
          )
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Action Buttons Row: Listen Audio + Open Full Detail
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        Button(
          onClick = {
            onPlayAudio(work)
            onDismiss()
          },
          shape = RoundedCornerShape(12.dp),
          colors = ButtonDefaults.buttonColors(containerColor = AntiqueGoldDark),
          modifier = Modifier
            .weight(1f)
            .testTag("preview_listen_audio_btn")
        ) {
          Icon(
            imageVector = Icons.Filled.VolumeUp,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text("በድምፅ አድምጥ", fontWeight = FontWeight.Bold, fontSize = 13.sp)
        }

        Button(
          onClick = {
            onOpenFullDetail(work.id)
            onDismiss()
          },
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .weight(1f)
            .testTag("preview_read_full_btn")
        ) {
          Icon(
            imageVector = Icons.Filled.OpenInNew,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text("ሙሉውን አንብብ", fontWeight = FontWeight.Bold, fontSize = 13.sp)
        }
      }
    }
  }
}

/**
 * 6. Dynamic Reading Progress Hairline:
 * Fixed at the top edge of the screen, dynamically fills as the user scrolls through manuscripts.
 */
@Composable
fun ReadingProgressHairline(
  progressFraction: Float,
  modifier: Modifier = Modifier
) {
  Box(
    modifier = modifier
      .fillMaxWidth()
      .height(3.5.dp)
      .background(Color.Transparent)
  ) {
    Box(
      modifier = Modifier
        .fillMaxWidth(progressFraction.coerceIn(0f, 1f))
        .height(3.5.dp)
        .background(
          Brush.horizontalGradient(
            listOf(AntiqueGoldLight, AntiqueGold, ManuscriptBurgundy)
          )
        )
    )
  }
}

/**
 * 7. Authentic Ethiopian Parchment Palettes for Reader View
 */
enum class ParchmentPalette(
  val id: String,
  val nameAmharic: String,
  val backgroundColor: Color,
  val textColor: Color,
  val accentColor: Color
) {
  CLASSIC(
    id = "classic",
    nameAmharic = "የጥንት ብራና",
    backgroundColor = Color(0xFFF9F5EC),
    textColor = Color(0xFF2C241B),
    accentColor = ManuscriptBurgundy
  ),
  MONASTERY_DARK(
    id = "monastery",
    nameAmharic = "የገዳም ሻማ",
    backgroundColor = Color(0xFF1B1815),
    textColor = Color(0xFFEADBCE),
    accentColor = AntiqueGoldLight
  ),
  ROYAL_VELVET(
    id = "royal",
    nameAmharic = "ንጉሣዊ ቬልቬት",
    backgroundColor = Color(0xFF141926),
    textColor = Color(0xFFE6EAF5),
    accentColor = ChurchGoldenYellow
  ),
  SAGE_PAPYRUS(
    id = "papyrus",
    nameAmharic = "ፓፒረስ",
    backgroundColor = Color(0xFFF2F4ED),
    textColor = Color(0xFF242C23),
    accentColor = Color(0xFF4A6B48)
  )
}
