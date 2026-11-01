package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/**
 * Specific Manuscript Palette:
 * - Warm Ivory: #FDFCF0
 * - Manuscript Red: #8B0000
 * - Antique Gold: #C5A059
 * - Charcoal: #333333
 */
val WarmIvoryColor = WarmIvory
val ManuscriptRedColor = ChurchRoyalBlue
val AntiqueGoldColor = ChurchGoldenYellow
val CharcoalColor = Charcoal

@Immutable
data class ManuscriptPalette(
  val warmIvory: Color = WarmIvoryColor,
  val manuscriptRed: Color = ManuscriptRedColor,
  val antiqueGold: Color = AntiqueGoldColor,
  val charcoal: Color = CharcoalColor,
  val antiqueGoldDark: Color = AntiqueGoldDark,
  val antiqueGoldLight: Color = AntiqueGoldLight,
  val manuscriptRedLight: Color = ChurchRoyalBlueLight,
  val manuscriptRedDark: Color = ChurchRoyalBlueDark,
  val warmIvorySurfaceVariant: Color = WarmIvorySurfaceVariant,
  val warmIvoryBorder: Color = WarmIvoryBorder,
  val charcoalMuted: Color = CharcoalMuted
)

val LocalManuscriptPalette = staticCompositionLocalOf { ManuscriptPalette() }

val MaterialTheme.manuscriptPalette: ManuscriptPalette
  @Composable
  @ReadOnlyComposable
  get() = LocalManuscriptPalette.current

val DarkColorScheme =
  darkColorScheme(
    primary = Color(0xFF7CA6F8),
    onPrimary = Color(0xFF04214E),
    primaryContainer = Color(0xFF0C3D82),
    onPrimaryContainer = Color(0xFFDCE8FF),
    secondary = ChurchGoldenYellowLight,
    onSecondary = Color(0xFF382900),
    secondaryContainer = Color(0xFF563E00),
    onSecondaryContainer = Color(0xFFFFE599),
    tertiary = Color(0xFFFF8B8B),
    onTertiary = Color(0xFF1E1E1E),
    background = DarkNightBackground,
    onBackground = DarkInkLight,
    surface = DarkNightSurface,
    onSurface = DarkInkLight,
    surfaceVariant = DarkNightSurfaceVariant,
    onSurfaceVariant = DarkInkMuted,
    outline = DarkNightBorder,
    outlineVariant = ChurchGoldenYellowLight.copy(alpha = 0.35f),
    scrim = Color.Black
  )

val LightColorScheme =
  lightColorScheme(
    primary = ChurchRoyalBlue,
    onPrimary = Color.White,
    primaryContainer = ChurchSkyBlueContainer,
    onPrimaryContainer = ChurchRoyalBlueDark,
    secondary = ChurchGoldenYellow,
    onSecondary = Color(0xFF352600),
    secondaryContainer = ChurchGoldContainer,
    onSecondaryContainer = Color(0xFF563D00),
    tertiary = ManuscriptRed,
    onTertiary = Color.White,
    background = WarmIvory,
    onBackground = Charcoal,
    surface = WarmIvorySurface,
    onSurface = Charcoal,
    surfaceVariant = WarmIvorySurfaceVariant,
    onSurfaceVariant = CharcoalMuted,
    outline = WarmIvoryBorder,
    outlineVariant = ChurchGoldenYellow.copy(alpha = 0.4f),
    scrim = Charcoal
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  // For manuscript aesthetic, retain deliberate cultural color palette
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
  val palette = ManuscriptPalette()

  CompositionLocalProvider(LocalManuscriptPalette provides palette) {
    MaterialTheme(
      colorScheme = colorScheme,
      typography = Typography,
      content = content
    )
  }
}

/**
 * Convenient alias for the manuscript theme
 */
@Composable
fun ManuscriptTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit
) = MyApplicationTheme(darkTheme = darkTheme, content = content)


