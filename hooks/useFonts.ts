import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync().catch(() => {});

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        console.log('🔤 Loading custom fonts...');
        
        const fontMap = {
          // Qurova fonts
          'Qurova-Light': require('../assets/fonts/qurova-light.ttf'),
          'Qurova-Regular': require('../assets/fonts/qurova-regular.ttf'),
          'Qurova-Medium': require('../assets/fonts/qurova-medium.ttf'),
          'Qurova-SemiBold': require('../assets/fonts/qurova-semibold.ttf'),
          'Qurova-Bold': require('../assets/fonts/qurova-bold.ttf'),
          // Lowercase versions for consistency
          'qurova-light': require('../assets/fonts/qurova-light.ttf'),
          'qurova-regular': require('../assets/fonts/qurova-regular.ttf'),
          'qurova-medium': require('../assets/fonts/qurova-medium.ttf'),
          'qurova-semibold': require('../assets/fonts/qurova-semibold.ttf'),
          'qurova-bold': require('../assets/fonts/qurova-bold.ttf'),
          // Other custom fonts
          'brillant': require('../assets/fonts/brillant.otf'),
          'Carevo': require('../assets/fonts/Carevo.ttf'),
          'Higelak': require('../assets/fonts/Higelak.ttf'),
          'SlabionPersonalUseOnly': require('../assets/fonts/SlabionPersonalUseOnly.ttf'),
          'YellowGinger': require('../assets/fonts/Yellow Ginger.ttf'),
          'SauceTomato': require('../assets/fonts/Sauce Tomato.otf'),
        };
        
        // Load all fonts at once
        await Font.loadAsync(fontMap);
        console.log('✅ All fonts loaded successfully');
        
        // Small delay to ensure fonts are fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setFontsLoaded(true);
        
        // Hide splash screen after fonts are loaded
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('❌ Error loading fonts:', error);
        // Still mark as loaded to prevent infinite loading
        setFontsLoaded(true);
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.error('Error hiding splash screen:', e);
        }
      }
    };

    loadFonts();
  }, []);

  return fontsLoaded;
};
