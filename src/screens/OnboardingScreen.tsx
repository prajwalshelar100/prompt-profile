import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  useColorScheme,
  Dimensions,
  Animated
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Sparkles, ChevronRight, Layout } from 'lucide-react-native';
import { AppCard, PrimaryButton } from '../components/PremiumComponents';

const { width } = Dimensions.get('window');

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const userName = useStore(state => state.userName);
  const setUserName = useStore(state => state.setUserName);
  const addProfile = useStore(state => state.addProfile);
  const addProject = useStore(state => state.addProject);
  const profiles = useStore(state => state.profiles);
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  const [step, setStep] = useState(userName ? 1 : 0);
  const [internalUserName, setInternalUserName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [description, setDescription] = useState('');

  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNextStep = async () => {
    if (step === 0) {
      if (!internalUserName.trim()) return;
      triggerHaptic('medium');
      await setUserName(internalUserName.trim());
      setStep(1);
    } else {
      if (!profileName.trim()) return;
      const id = await addProfile(profileName.trim(), description.trim());
      
      if (profiles.length === 0) {
        navigation.replace('Home');
      } else {
        navigation.goBack();
      }
    }
  };

  const suggestions = ['Personal Care', 'Professional', 'Fitness', 'Learning'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.content}>
            {/* Step Indicator */}
            <View style={styles.indicatorContainer}>
              <View style={[styles.indicator, { backgroundColor: colors.primary, width: step === 0 ? 32 : 12 }]} />
              <View style={[styles.indicator, { backgroundColor: step === 1 ? colors.primary : colors.overlay, width: step === 1 ? 32 : 12 }]} />
            </View>

            {step === 0 ? (
              <View>
                <View style={[styles.iconBox, { backgroundColor: colors.tint }]}>
                  <User color={colors.primary} size={32} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Welcome to{"\n"}Prompt Profile</Text>
                <Text style={[styles.subtitle, { color: colors.subtext }]}>Before we begin, what should we call you?</Text>
                
                <AppCard colors={colors} style={styles.inputCard}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Your Name"
                    placeholderTextColor={colors.subtext}
                    value={internalUserName}
                    onChangeText={setInternalUserName}
                    autoFocus
                  />
                </AppCard>
                <Text style={[styles.hint, { color: colors.subtext }]}>Your name will be used to personalize your prompts and workspace.</Text>
              </View>
            ) : (
              <View>
                <View style={[styles.iconBox, { backgroundColor: colors.tint }]}>
                  <Layout color={colors.primary} size={32} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Hi, {internalUserName || userName}! 👋</Text>
                <Text style={[styles.subtitle, { color: colors.subtext }]}>Let's create your first Intelligence Profile.</Text>
                
                <AppCard colors={colors} style={styles.inputCard}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g. Daily Health"
                    placeholderTextColor={colors.subtext}
                    value={profileName}
                    onChangeText={setProfileName}
                    autoFocus
                  />
                </AppCard>

                <View style={styles.suggestions}>
                  {suggestions.map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.chip, { backgroundColor: colors.overlay }]} 
                      onPress={() => { triggerHaptic(); setProfileName(s); }}
                    >
                      <Text style={[styles.chipText, { color: colors.primary }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Optional Focus</Text>
                <AppCard colors={colors} style={styles.inputCard}>
                  <TextInput
                    style={[styles.input, { color: colors.text, fontSize: 16 }]}
                    placeholder="e.g. Tracking routine and results"
                    placeholderTextColor={colors.subtext}
                    value={description}
                    onChangeText={setDescription}
                  />
                </AppCard>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title={step === 0 ? "Continue" : (profiles.length === 0 ? "Enter Workspace" : "Create Profile")} 
              onPress={handleNextStep} 
              colors={colors}
              disabled={step === 0 ? !internalUserName.trim() : !profileName.trim()}
              icon={<ChevronRight color="#fff" size={20} />}
            />
            {profiles.length > 0 && (
              <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={[styles.cancelButtonText, { color: colors.subtext }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  content: { flex: 1, paddingTop: 40 },
  indicatorContainer: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  indicator: { height: 6, borderRadius: 3 },
  iconBox: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { ...Typography.h1, fontSize: 32, lineHeight: 40 },
  subtitle: { ...Typography.body, fontSize: 17, marginTop: 12, marginBottom: 40 },
  inputCard: { padding: 4, marginBottom: 12 },
  input: { padding: 16, fontSize: 20, fontWeight: '600' },
  hint: { ...Typography.caption, paddingHorizontal: 4 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, marginBottom: 24 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  chipText: { fontWeight: '700', fontSize: 13 },
  sectionTitle: { ...Typography.subheadline, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  footer: { marginTop: 40 },
  cancelButton: { marginTop: 16, padding: 16, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
});
