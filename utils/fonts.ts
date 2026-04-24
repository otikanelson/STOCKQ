
export const FONT_FAMILY = {
  light: 'qurova-light',
  regular: 'qurova-regular',
  medium: 'qurova-medium',
  semibold: 'qurova-semibold',
  bold: 'qurova-bold',
};

// Fonts are automatically loaded via app.json configuration
// No manual loading needed

// Default font styles for common use cases
export const fontStyles = {
  h1: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 28,
    fontWeight: '700' as const,
  },
  h3: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 24,
    fontWeight: '600' as const,
  },
  h4: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    fontWeight: '400' as const,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  caption: {
    fontFamily: FONT_FAMILY.light,
    fontSize: 12,
    fontWeight: '300' as const,
  },
};
