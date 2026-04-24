import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from '../components/ThemedText';

interface DisabledFeatureOverlayProps {
  reason: string;
}

export const DisabledFeatureOverlay: React.FC<DisabledFeatureOverlayProps> = ({ 
  reason
}) => {
  const { theme } = useTheme();
  const bgColor = '#FF3B30';

  return (
    <View style={[styles.overlay, { backgroundColor: bgColor + 'F5' }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons 
            name="lock-closed" 
            size={48} 
            color="#FFF" 
          />
        </View>
        <ThemedText style={styles.title}>
          ACCESS DENIED
        </ThemedText>
        <ThemedText style={styles.message}>{reason}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  message: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

