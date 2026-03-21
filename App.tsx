import React from 'react';
import { useColorScheme, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/database/dbService';
import { useStore } from './src/store/useStore';
import { useThemeStore } from './src/store/themeStore';
import { Colors } from './src/theme';
import { AnimatedLogo } from './src/components/AnimatedLogo';
import { NavigationContext, navigationRef } from './src/navigation/NavigationContext';

export default function App() {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);
  const loadState = useStore(state => state.loadState);
  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [currentRoute, setCurrentRoute] = React.useState('Home');

  React.useEffect(() => {
    async function prepare() {
      try {
        await initDB();
        await loadState();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoaded(true);
      }
    }
    prepare();
  }, [loadState]);

  if (!isLoaded || showSplash) {
    if (!isLoaded) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Loading Prompt Profile...</Text>
        </View>
      );
    }
    return <AnimatedLogo colors={colors} onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            setCurrentRoute(navigationRef.getCurrentRoute()?.name || 'Home');
          }}
          onStateChange={() => {
            setCurrentRoute(navigationRef.getCurrentRoute()?.name || 'Home');
          }}
        >
          <NavigationContext.Provider value={{ currentRoute }}>
            <AppNavigator />
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </NavigationContext.Provider>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
