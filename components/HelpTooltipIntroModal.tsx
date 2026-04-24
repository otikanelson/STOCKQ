import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface HelpTooltipIntroModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpTooltipIntroModal: React.FC<HelpTooltipIntroModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="help-circle" size={40} color={theme.primary} />
          </View>

          {/* Title */}
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Need Help?
          </ThemedText>

          {/* Description */}
          <ThemedText style={[styles.description, { color: theme.subtext }]}>
            Look for the help icon throughout the app for quick explanations and tips.
          </ThemedText>

          {/* Example */}
          <View style={[styles.exampleBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <ThemedText style={[styles.exampleLabel, { color: theme.subtext }]}>
              Tap this icon for help:
            </ThemedText>
            <View style={styles.exampleIcon}>
              <Ionicons name="help-circle-outline" size={28} color={theme.primary} />
            </View>
          </View>

          {/* Action */}
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <ThemedText style={styles.buttonText}>Got It!</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: width - 80,
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  exampleBox: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  exampleLabel: {
    fontSize: 13,
    marginBottom: 12,
  },
  exampleIcon: {
    padding: 4,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    },
});

