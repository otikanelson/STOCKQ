import { Text, TextProps } from 'react-native';
import { FONT_FAMILY } from '../utils/fonts';

/**
 * ThemedText component that automatically applies Qurova font
 * Maps fontWeight to appropriate Qurova font variants
 */
export function ThemedText(props: TextProps) {
  const { style, ...rest } = props;

  // Flatten the style array to handle nested arrays
  const flattenStyle = (s: any): any[] => {
    if (!s) return [];
    if (Array.isArray(s)) {
      return s.flatMap(item => flattenStyle(item));
    }
    return [s];
  };

  const flatStyles = flattenStyle(style);

  // Extract fontWeight and map to Qurova variants
  let fontWeight: string | undefined;
  const cleanedStyles = flatStyles.map((s) => {
    if (!s) return s;
    const { fontWeight: fw, ...cleanStyle } = s;
    if (fw) fontWeight = fw;
    return cleanStyle;
  });

  // Map fontWeight to Qurova font family
  let fontFamily = FONT_FAMILY.regular;
  if (fontWeight) {
    const weight = parseInt(fontWeight as string);
    if (weight >= 700) {
      fontFamily = FONT_FAMILY.bold;
    } else if (weight >= 600) {
      fontFamily = FONT_FAMILY.semibold;
    } else if (weight >= 500) {
      fontFamily = FONT_FAMILY.medium;
    } else if (weight <= 300) {
      fontFamily = FONT_FAMILY.light;
    }
  }

  // Merge Qurova font with cleaned styles
  const mergedStyle = [
    { fontFamily },
    ...cleanedStyles,
  ];

  return <Text {...rest} style={mergedStyle} />;
}
