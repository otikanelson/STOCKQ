import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

interface PinResetModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  message?: string;
}

export function PinResetModal({
  visible,
  onClose,
  onSuccess,
  title = 'Reset Security PIN',
  message = 'Enter your Login PIN to remove the current Security PIN. You can set a new one later in settings.',
}: PinResetModalProps) {
  const { theme } = useTheme();
  const [loginPin, setLoginPin] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleReset = async () => {
    console.log('🔍 PIN Reset - Starting with input:', loginPin);
    
    if (loginPin.length !== 4) {
      console.log('🔍 PIN Reset - Invalid length:', loginPin.length);
      Toast.show({
        type: 'error',
        text1: 'Invalid PIN',
        text2: 'Please enter your 4-digit Login PIN',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 PIN Reset - Checking AsyncStorage...');
      
      // Debug: Check all possible PIN keys
      const debugKeys = [
        'admin_login_pin',
        'admin_pin', 
        'admin_security_pin',
        'auth_user_name',
        'auth_user_role',
        'pin_migration_completed'
      ];
      
      const debugValues = await AsyncStorage.multiGet(debugKeys);
      console.log('🔍 Debug - AsyncStorage values:', debugValues);
      
      // Check both old and new PIN storage keys for compatibility
      let storedLoginPin = await AsyncStorage.getItem('admin_login_pin');
      console.log('🔍 admin_login_pin value:', storedLoginPin);
      
      // Fallback to old PIN key if new one doesn't exist
      if (!storedLoginPin) {
        storedLoginPin = await AsyncStorage.getItem('admin_pin');
        console.log('🔍 Using fallback admin_pin:', storedLoginPin);
      } else {
        console.log('🔍 Using admin_login_pin:', storedLoginPin);
      }
      
      if (!storedLoginPin) {
        console.log('🔍 No PIN found in either location');
        // Show debug info in the error
        Toast.show({
          type: 'error',
          text1: 'No Login PIN Found',
          text2: 'Check console - no PIN in storage',
        });
        setIsLoading(false);
        return;
      }
      
      console.log('🔍 Comparing PINs - Input:', loginPin, 'Stored:', storedLoginPin);
      
      if (loginPin !== storedLoginPin) {
        console.log('🔍 PIN mismatch!');
        Toast.show({
          type: 'error',
          text1: 'Authentication Failed',
          text2: `Input: ${loginPin}, Expected: ${storedLoginPin?.substring(0,2)}**`,
        });
        setIsLoading(false);
        return;
      }

      console.log('🔍 PIN match! Removing Security PIN...');
      
      // Remove Security PIN
      await AsyncStorage.removeItem('admin_security_pin');
      await AsyncStorage.removeItem('admin_last_auth');

      Toast.show({
        type: 'success',
        text1: 'Security PIN Removed',
        text2: 'You can set a new Security PIN in settings',
      });

      setLoginPin('');
      onSuccess();
    } catch (error) {
      console.error('🔍 Error resetting Security PIN:', error);
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: 'Could not remove Security PIN',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setLoginPin('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={[styles.modalIconBox, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="key-outline" size={32} color={theme.primary} />
          </View>

          <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
            {title}
          </ThemedText>
          
          <ThemedText style={[styles.modalMessage, { color: theme.subtext }]}>
            {message}
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
              Enter Login PIN:
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                  textAlign: 'center',
                  fontSize: 18,
                  letterSpacing: 8,
                }
              ]}
              value={loginPin}
              onChangeText={setLoginPin}
              placeholder="••••"
              placeholderTextColor={theme.subtext}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              autoFocus
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={[
                styles.modalBtn,
                { 
                  backgroundColor: theme.background, 
                  borderWidth: 1, 
                  borderColor: theme.border 
                }
              ]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <ThemedText style={{ color: theme.text }}>
                Cancel
              </ThemedText>
            </Pressable>
            
            <Pressable
              style={[
                styles.modalBtn,
                { 
                  backgroundColor: loginPin.length === 4 && !isLoading ? theme.primary : theme.border,
                  opacity: loginPin.length === 4 && !isLoading ? 1 : 0.5,
                }
              ]}
              onPress={handleReset}
              disabled={loginPin.length !== 4 || isLoading}
            >
              {isLoading ? (
                <ThemedText style={{ color: '#FFF' }}>Removing...</ThemedText>
              ) : (
                <ThemedText style={{ color: '#FFF' }}>
                  Remove PIN
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999, // High z-index to appear above other elements
    elevation: 1000, // High elevation for Android
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    zIndex: 10000,
    elevation: 1001,
  },
  modalIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});