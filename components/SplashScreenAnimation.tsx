import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export function SplashScreenAnimation({ onFinish }: Props) {
  const { isDark, theme } = useTheme();
  
  // Start off-screen to the right
  const translateX = useSharedValue(width);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const bgOpacity = useSharedValue(1);

  useEffect(() => {
    // Delay the entire animation by 3.2 seconds to let native splash screen finish
    const timer = setTimeout(() => {
      // 1. Slide in from right → center (400ms)
      translateX.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      }, () => {
        // 2. Brief pause, then zoom out + fade (500ms)
        scale.value = withDelay(
          200,
          withTiming(6, { duration: 500, easing: Easing.in(Easing.cubic) })
        );
        opacity.value = withDelay(
          300,
          withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
        );
        // 3. Fade out background slightly after icon fades
        bgOpacity.value = withDelay(
          500,
          withTiming(0, { duration: 300 }, () => {
            runOnJS(onFinish)();
          })
        );
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, bgStyle, { backgroundColor: theme.background }]}>
      <Animated.View style={iconStyle}>
        <Image
          source={isDark ? require('../assets/images/icon.png') : require('../assets/images/icon_light.png')}
          style={styles.icon}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  icon: {
    width: 120,
    height: 120,
  },
});
