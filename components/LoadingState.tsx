import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from '../components/ThemedText';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'large'
}) => {
  const { theme } = useTheme();

  return (
    <View style={[
      fullScreen ? styles.fullScreen : styles.inline,
      { backgroundColor: fullScreen ? theme.background : 'transparent' }
    ]}>
      <ActivityIndicator size={size} color={theme.primary} style={styles.spinner} />
      {message && (
        <ThemedText style={[styles.message, { color: theme.subtext }]}>{message}</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inline: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  spinner: { marginBottom: 12 },
  message: { fontSize: 14, },
});

export const SkeletonLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const { theme, isDark } = useTheme();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 110,
            borderRadius: 20,
            borderWidth: 1,
            marginBottom: 12,
            backgroundColor: isDark ? '#ffffff08' : '#0000000A',
            borderColor: theme.border,
          }}
        />
      ))}
    </>
  );
};

