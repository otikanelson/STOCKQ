import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../context/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

interface AuthorLoginProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthorLogin({ visible, onClose }: AuthorLoginProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState(false);

  const handleLogin = async () => {
    if (!secretKey.trim()) {
      setInputError(true);
      Toast.show({
        type: 'error',
        text1: 'Secret Key Required',
        text2: 'Please enter the author secret key',
      });
      return;
    }

    setInputError(false);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/author/login`, {
        secretKey: secretKey.trim(),
      });

      if (response.data.success) {
        const { sessionToken } = response.data.data;

        // Store author session
        await AsyncStorage.multiSet([
          ['auth_session_token', sessionToken],
          ['auth_user_role', 'author'],
          ['auth_user_id', 'author'],
          ['auth_user_name', 'Author'],
          ['auth_last_login', Date.now().toString()],
          ['auth_is_author', 'true'],
        ]);

        Toast.show({
          type: 'success',
          text1: 'Author Access Granted',
          text2: 'Welcome to the Author Dashboard',
        });

        setSecretKey('');
        
        // Close modal immediately to prevent state updates after navigation
        onClose();
        
        // Navigate after closing modal
        setTimeout(() => {
          router.replace('/author/dashboard' as any);
        }, 50);
      }
    } catch (error: any) {
      let errorMessage = 'Invalid secret key';
      
      try {
        if (error.response) {
          // Server responded with error
          const status = error.response.status;
          const serverError = error.response.data?.error;
          
          if (status === 401) {
            errorMessage = serverError || 'Invalid secret key';
            setInputError(true);
            // Don't log - this is expected for wrong password
          } else if (status === 403) {
            errorMessage = 'Access forbidden';
            setInputError(true);
          } else if (status >= 500) {
            errorMessage = 'Server error - please try again later';
            console.error('Author login server error:', status);
          } else {
            errorMessage = serverError || 'Login failed';
            setInputError(true);
          }
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Connection timeout - please check your internet';
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
          errorMessage = 'Network error - please check your connection';
        } else if (error.message) {
          errorMessage = error.message;
          setInputError(true);
        }
      } catch (parseError) {
        // Silently handle parsing errors
        setInputError(true);
      }
      
      Toast.show({
        type: 'error',
        text1: 'Access Denied',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSecretKey('');
    setInputError(false);
    setShowPassword(false);
    onClose();
  };

  const handleTextChange = (text: string) => {
    setSecretKey(text);
    if (inputError) {
      setInputError(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="shield-checkmark" size={40} color={theme.primary} />
          </View>

          <ThemedText style={[styles.title, { color: theme.text }]}>Author Access</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.subtext }]}>
            Enter the secret key to access the author dashboard
          </ThemedText>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: inputError ? theme.notification : theme.border,
                  backgroundColor: theme.background,
                  borderWidth: inputError ? 2 : 2,
                },
              ]}
              placeholder="Secret Key"
              placeholderTextColor={theme.subtext}
              secureTextEntry={!showPassword}
              value={secretKey}
              onChangeText={handleTextChange}
              autoFocus
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              blurOnSubmit={false}
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              accessible={true}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={inputError ? theme.notification : theme.subtext}
              />
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>Cancel</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.button, styles.loginButton, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <ThemedText style={[styles.buttonText, { color: '#FFF' }]}>Login</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingRight: 50,
    fontSize: 16,
    },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 16,
    padding: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  loginButton: {},
  buttonText: {
    fontSize: 16,
    },
});

