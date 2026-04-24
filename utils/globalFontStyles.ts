import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from './fonts';

/**
 * Global font style that applies Qurova to all text
 * This is the base style that should be applied to all Text components
 */
export const globalFontStyle = {
  fontFamily: FONT_FAMILY.regular,
};

/**
 * Helper to merge global font style with component-specific styles
 * Usage: <ThemedText style={applyGlobalFont(customStyle)} />
 */
export const applyGlobalFont = (customStyle?: any) => {
  if (!customStyle) {
    return globalFontStyle;
  }

  // If customStyle is an array, prepend global font
  if (Array.isArray(customStyle)) {
    return [globalFontStyle, ...customStyle];
  }

  // If customStyle is an object, merge with global font
  return {
    ...globalFontStyle,
    ...customStyle,
  };
};

/**
 * Pre-defined text styles using Qurova font
 * Use these for consistent typography across the app
 */
export const textStyles = StyleSheet.create({
  h1: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 32,
    fontWeight: '700',
  },
  h2: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 28,
    fontWeight: '700',
  },
  h3: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 24,
    fontWeight: '600',
  },
  h4: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    fontWeight: '400',
  },
  bodyXSmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    fontWeight: '400',
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 14,
    fontWeight: '500',
  },
  labelSmall: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  caption: {
    fontFamily: FONT_FAMILY.light,
    fontSize: 12,
    fontWeight: '300',
  },
  captionSmall: {
    fontFamily: FONT_FAMILY.light,
    fontSize: 10,
    fontWeight: '300',
  },
});
