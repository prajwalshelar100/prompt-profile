import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import ProductReviewScreen from '../screens/ProductReviewScreen';
import CameraCaptureScreen from '../screens/CameraCaptureScreen';
import PromptGeneratorScreen from '../screens/PromptGeneratorScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ExperienceInputScreen from '../screens/ExperienceInputScreen';
import RoutineScreen from '../screens/RoutineScreen';
import SettingsScreen from '../screens/SettingsScreen';
// @ts-ignore
import ProductsScreen from '../screens/ProductsScreen';
// @ts-ignore
import UnifiedAddScreen from '../screens/UnifiedAddScreen';
import PersonalProfileScreen from '../screens/PersonalProfileScreen';

import ContactScreen from '../screens/ContactScreen';
import ProfilesScreen from '../screens/ProfilesScreen';
import ProductPickerScreen from '../screens/ProductPickerScreen';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../theme';
import { useColorScheme, View, TouchableOpacity, Text, StyleSheet, Platform, Modal } from 'react-native';
import { Home, User, Settings as SettingsIcon, Plus, Box, Camera, Link as LinkIcon, FileText, Type } from 'lucide-react-native';
import { NavigationProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ActionMenu } from '../components/PremiumComponents';
import { NavigationContext, navigationRef } from './NavigationContext';

// @ts-ignore
import HealthProfileScreen from '../screens/HealthProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', color: colors.text },
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profiles" component={ProfilesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PersonalProfile" component={PersonalProfileScreen} options={{ title: 'My Details' }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Create Profile' }} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ title: 'Projects' }} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project Context' }} />
        <Stack.Screen name="ProductReview" component={ProductReviewScreen} options={{ title: 'Review Product' }} />
        <Stack.Screen name="CameraCapture" component={CameraCaptureScreen} options={{ title: 'Scan Product' }} />
        <Stack.Screen name="PromptGenerator" component={PromptGeneratorScreen} options={{ title: 'Compile Prompt' }} />
        <Stack.Screen name="AIChat" component={AIChatScreen} options={{ title: 'AI Assistant' }} />
        <Stack.Screen name="ExperienceInput" component={ExperienceInputScreen} options={{ title: 'Log Experience' }} />
        <Stack.Screen name="Routine" component={RoutineScreen} options={{ title: 'Define Routine' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Products & Assets' }} />
        <Stack.Screen name="UnifiedAdd" component={UnifiedAddScreen} options={{ title: 'Add Content' }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Support' }} />
        <Stack.Screen name="ProductPicker" component={ProductPickerScreen} options={{ title: 'Select Products' }} />
        <Stack.Screen name="HealthProfile" component={HealthProfileScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      <FloatingTabBar colors={colors} />
    </View>
  );
}

function FloatingTabBar({ colors }: { colors: any }) {
  const { currentRoute } = React.useContext(NavigationContext);
  const [menuVisible, setMenuVisible] = React.useState(false);

  const activeProfile = useStore(state => state.profiles[0]);
  const projectsData = useStore(state => activeProfile ? state.projects[activeProfile.id] : undefined);
  const projects = projectsData || [];
  
  const showBar = ['Home', 'Profiles', 'Settings', 'Products'].includes(currentRoute);

  if (!showBar) return null;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navigateTo = (screen: string, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(screen as any, params);
    }
  };

  return (
    <>
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => { triggerHaptic(); navigateTo('Home'); }}>
          <Home color={currentRoute === 'Home' ? colors.primary : colors.subtext} size={24} />
          <Text style={[styles.tabLabel, { color: currentRoute === 'Home' ? colors.primary : colors.subtext }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => { triggerHaptic(); navigateTo('Profiles'); }}>
          <User color={currentRoute === 'Profiles' ? colors.primary : colors.subtext} size={24} />
          <Text style={[styles.tabLabel, { color: currentRoute === 'Profiles' ? colors.primary : colors.subtext }]}>Profiles</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.fabButton, { backgroundColor: colors.primary }]} 
          onPress={() => { triggerHaptic(); setMenuVisible(true); }}
        >
          <Plus color="#fff" size={32} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => { triggerHaptic(); navigateTo('Products'); }}>
          <Box color={currentRoute === 'Products' ? colors.primary : colors.subtext} size={24} />
          <Text style={[styles.tabLabel, { color: currentRoute === 'Products' ? colors.primary : colors.subtext }]}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => { triggerHaptic(); navigateTo('Settings'); }}>
          <SettingsIcon color={currentRoute === 'Settings' ? colors.primary : colors.subtext} size={24} />
          <Text style={[styles.tabLabel, { color: currentRoute === 'Settings' ? colors.primary : colors.subtext }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ActionMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
        colors={colors}
        options={[
          { label: 'Create Profile', icon: <User color="#fff" size={20} />, color: colors.primary, onPress: () => navigateTo('Onboarding') },
          { label: 'Add Product', icon: <Box color="#fff" size={20} />, color: '#34C759', onPress: () => navigateTo('UnifiedAdd') },
          { label: 'Add Info/Asset', icon: <FileText color="#fff" size={20} />, color: '#5856D6', onPress: () => navigateTo('UnifiedAdd') }
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 8 }
    })
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 10 }
    })
  }
});
