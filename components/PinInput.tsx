import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  onClear?: () => void;
  error?: boolean;
  disabled?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  length = 4,
  onComplete,
  onClear,
  error = false,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [pin, setPin] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus on mount with proper delay
    const timer = setTimeout(() => {
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [disabled]);

  useEffect(() => {
    // Check if PIN is complete
    if (pin.every((digit) => digit !== '') && !disabled) {
      const completedPin = pin.join('');
      // Remove console.log for security
      onComplete(completedPin);
    }
  }, [pin, disabled, onComplete]);

  const handleChangeText = (text: string) => {
    if (disabled) return;

    // Only allow numeric input and limit to specified length
    const digits = text.replace(/\D/g, '').split('').slice(0, length);
    const newPin = [...Array(length).fill('')];
    
    digits.forEach((digit, index) => {
      newPin[index] = digit;
    });
    
    setPin(newPin);
    
    // Update focused index to next empty position or last position
    const nextEmptyIndex = newPin.findIndex(digit => digit === '');
    setFocusedIndex(nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex);
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (disabled) return;
    
    // Handle backspace
    if (nativeEvent.key === 'Backspace') {
      const newPin = [...pin];
      const currentIndex = Math.max(0, focusedIndex);
      
      if (newPin[currentIndex] !== '') {
        newPin[currentIndex] = '';
      } else if (currentIndex > 0) {
        newPin[currentIndex - 1] = '';
        setFocusedIndex(currentIndex - 1);
      }
      
      setPin(newPin);
    }
  };

  const handleClear = () => {
    setPin(Array(length).fill(''));
    setFocusedIndex(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    onClear?.();
  };

  const handleDotPress = (index: number) => {
    if (disabled) return;
    
    setFocusedIndex(index);
    // Ensure the input is focused and keyboard shows
    if (inputRef.current) {
      inputRef.current.blur();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <Pressable style={styles.container} onPress={() => handleDotPress(focusedIndex)}>
      {/* Hidden input for keyboard */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={length}
        value={pin.join('')}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        editable={!disabled}
        autoFocus={!disabled}
        secureTextEntry={true}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        importantForAutofill="yes"
        blurOnSubmit={false}
        caretHidden={true}
        contextMenuHidden={true}
        selectTextOnFocus={false}
        showSoftInputOnFocus={true}
      />

      {/* PIN dots display */}
      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <Pressable
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: theme.surface,
                borderColor: error
                  ? theme.notification
                  : focusedIndex === index
                  ? theme.primary
                  : theme.border,
                borderWidth: focusedIndex === index ? 2 : 1,
              },
            ]}
            onPress={() => handleDotPress(index)}
            accessible={true}
            accessibilityLabel={`PIN digit ${index + 1} ${digit !== '' ? 'filled' : 'empty'}`}
            accessibilityRole="button"
          >
            {digit !== '' && (
              <View
                style={[
                  styles.filledDot,
                  {
                    backgroundColor: error ? theme.notification : theme.primary,
                  },
                ]}
              />
            )}
          </Pressable>
        ))}
      </View>

      {/* Clear button */}
      {pin.some((digit) => digit !== '') && !disabled && (
        <Pressable 
          style={styles.clearButton} 
          onPress={handleClear}
          accessible={true}
          accessibilityLabel="Clear PIN"
          accessibilityRole="button"
        >
          <Ionicons name="backspace-outline" size={24} color={theme.subtext} />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    height: 1,
    width: 1,
    zIndex: -1,
  },
  pinContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  pinDot: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  clearButton: {
    padding: 8,
  },
});
