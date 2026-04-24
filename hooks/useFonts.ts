import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        console.log('🔤 Loading Qurova fonts...');
        
        // Try loading with different naming conventions
        const fontMap = {
          'Qurova-Light': require('../assets/fonts/qurova-light.ttf'),
          'Qurova-Regular': require('../assets/fonts/qurova-regular.ttf'),
          'Qurova-Medium': require('../assets/fonts/qurova-medium.ttf'),
          'Qurova-SemiBold': require('../assets/fonts/qurova-semibold.ttf'),
          'Qurova-Bold': require('../assets/fonts/qurova-bold.ttf'),
          // Also try lowercase versions
          'qurova-light': require('../assets/fonts/qurova-light.ttf'),
          'qurova-regular': require('../assets/fonts/qurova-regular.ttf'),
          'qurova-medium': require('../assets/fonts/qurova-medium.ttf'),
          'qurova-semibold': require('../assets/fonts/qurova-semibold.ttf'),
          'qurova-bold': require('../assets/fonts/qurova-bold.ttf'),
        };
        
        await Font.loadAsync(fontMap);
        console.log('✅ Qurova fonts loaded successfully');
        console.log('📋 Available fonts:', Object.keys(fontMap));
        setFontsLoaded(true);
      } catch (error) {
        console.error('❌ Error loading fonts:', error);
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return fontsLoaded;
};
