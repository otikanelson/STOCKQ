# Qurova Font Implementation Guide

The Qurova font has been set up globally throughout your app. Here's how to use it:

## Quick Start

### Option 1: Use Pre-defined Text Styles (Recommended)
```tsx
import { textStyles } from '../utils/globalStyles';
import { Text } from 'react-native';

// Heading
<ThemedText style={textStyles.h1}>Main Title</ThemedText>
<ThemedText style={textStyles.h2}>Subtitle</ThemedText>
<ThemedText style={textStyles.h3}>Section Title</ThemedText>

// Body text
<ThemedText style={textStyles.body}>Regular paragraph text</ThemedText>
<ThemedText style={textStyles.bodySmall}>Smaller body text</ThemedText>

// Labels and captions
<ThemedText style={textStyles.label}>Label text</ThemedText>
<ThemedText style={textStyles.caption}>Small caption text</ThemedText>
```

### Option 2: Use Font Family Directly
```tsx
import { FONT_FAMILY } from '../utils/fonts';
import { Text } from 'react-native';

<ThemedText style={{ fontFamily: FONT_FAMILY.bold, fontSize: 24 }}>
  Custom Styled Text
</ThemedText>
```

### Option 3: Merge with Custom Styles
```tsx
import { mergeGlobalStyles } from '../utils/globalStyles';
import { Text } from 'react-native';

<ThemedText style={mergeGlobalStyles({ fontSize: 18, color: '#333' })}>
  Text with custom styling
</ThemedText>
```

## Available Font Weights

- `FONT_FAMILY.light` - Light weight (300)
- `FONT_FAMILY.regular` - Regular weight (400) - Default
- `FONT_FAMILY.medium` - Medium weight (500)
- `FONT_FAMILY.semibold` - Semi-bold weight (600)
- `FONT_FAMILY.bold` - Bold weight (700)

## Available Text Style Presets

| Style | Font Weight | Font Size | Use Case |
|-------|-------------|-----------|----------|
| `h1` | Bold (700) | 32 | Main page titles |
| `h2` | Bold (700) | 28 | Major section titles |
| `h3` | Semibold (600) | 24 | Subsection titles |
| `h4` | Semibold (600) | 20 | Small section titles |
| `body` | Regular (400) | 16 | Main body text |
| `bodySmall` | Regular (400) | 14 | Secondary body text |
| `bodyXSmall` | Regular (400) | 12 | Tertiary body text |
| `label` | Medium (500) | 14 | Form labels, buttons |
| `labelSmall` | Medium (500) | 12 | Small labels |
| `caption` | Light (300) | 12 | Captions, hints |
| `captionSmall` | Light (300) | 10 | Very small captions |

## Migration Guide

### Before (without Qurova)
```tsx
<ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
  Some text
</ThemedText>
```

### After (with Qurova)
```tsx
import { textStyles } from '../utils/globalStyles';

<ThemedText style={textStyles.label}>
  Some text
</ThemedText>
```

## Font Loading

Fonts are automatically loaded when the app starts via the `loadFonts()` function in `app/_layout.tsx`. No additional setup is needed.

## Troubleshooting

If fonts don't appear to be loading:

1. Ensure the font files exist in `assets/fonts/`
2. Check that `app.json` has the correct font configuration
3. Clear the app cache and rebuild:
   ```bash
   expo prebuild --clean
   npm run start -- --clear
   ```

## Notes

- The Qurova font is now the default font family for all text in the app
- All font weights are available for use
- The font loads asynchronously on app startup
- Font loading is handled automatically - no manual loading required in components
