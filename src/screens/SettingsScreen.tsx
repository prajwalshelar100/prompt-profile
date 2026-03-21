import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  Platform,
  Linking,
  Image,
  useColorScheme,
  Share
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  saveApiKey, getApiKey, deleteApiKey,
  saveGeminiKey, getGeminiKey, deleteGeminiKey 
} from '../services/secureStore';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import {
  User,
  Cpu,
  Heart,
  Github,
  Linkedin,
  Mail,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Twitter,
  Instagram,
  Coffee,
  Code,
  Layout,
  Zap,
  ChevronRight,
  Shield,
  FileText,
  Share as ShareIcon,
  Eye,
  EyeOff
} from 'lucide-react-native';
import { AppCard, SectionHeader, ListItem, PrimaryButton, SegmentedControl } from '../components/PremiumComponents';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [apiKey, setApiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Store state
  const {
    aiEnabled, setAiEnabled,
    includeHistory, recentOnly, smartFiltering, setSetting,
    userName, setUserName,
    profiles
  } = useStore();
  const activeProfile = profiles[0]; // For now, assume first profile or handle active state
  const { theme: currentTheme, setTheme } = useThemeStore();

  const systemColorScheme = useColorScheme();
  const isDark = currentTheme === 'system' ? systemColorScheme === 'dark' : currentTheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    const loadKeys = async () => {
      const oKey = await getApiKey();
      if (oKey) setApiKey(oKey);
      const gKey = await getGeminiKey();
      if (gKey) setGeminiKey(gKey);
    };
    loadKeys();
  }, []);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSetTheme = (theme: any) => {
    triggerHaptic();
    setTheme(theme);
  };

  const handleSaveKey = async () => {
    triggerHaptic();
    if (!apiKey.trim()) {
      await deleteApiKey();
      Alert.alert('Cleared', 'API Key removed.');
      return;
    }
    await saveApiKey(apiKey.trim());
    Alert.alert('Saved', 'API Key successfully saved.');
  };

  const handleSaveGeminiKey = async () => {
    triggerHaptic();
    if (!geminiKey.trim()) {
      await deleteGeminiKey();
      Alert.alert('Cleared', 'Gemini API Key removed.');
      return;
    }
    await saveGeminiKey(geminiKey.trim());
    Alert.alert('Saved', 'Gemini API Key successfully saved.');
  };

  const testKey = async () => {
    triggerHaptic();
    if (!apiKey.trim()) return Alert.alert('Error', 'Please enter an OpenAI API key first.');
    setIsTesting(true);
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
      });
      if (response.ok) {
        Alert.alert('Success', 'OpenAI API Key is valid!');
      } else {
        Alert.alert('Invalid Key', 'OpenAI rejected this API key.');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Could not verify key.');
    } finally {
      setIsTesting(false);
    }
  };

  const testGeminiKey = async () => {
    triggerHaptic();
    if (!geminiKey.trim()) return Alert.alert('Error', 'Please enter a Gemini API key first.');
    setIsTestingGemini(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey.trim()}`);
      if (response.ok) {
        Alert.alert('Success', 'Gemini API Key is valid!');
      } else {
        Alert.alert('Invalid Key', 'Google rejected this API key.');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Could not verify key.');
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleShare = async () => {
    triggerHaptic();
    try {
      await Share.share({
        message: 'Check out Prompt Profile — The ultimate personalized intelligence system for AI context! 🧠✨',
        url: 'https://prajwalshelar.online/prompt-profile'
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openUPI = () => {
    triggerHaptic();
    const upiId = "prajwalshelar100@oksbi";
    const url = `upi://pay?pa=${upiId}&pn=Prajwal%20Shelar&mc=0000&mode=02&purpose=00`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('UPI App Not Found', `Please pay to: ${upiId}`);
      }
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >

      {/* 1. Personalization */}
      <SectionHeader title="Personalization" colors={colors} />
      <AppCard colors={colors}>
        <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>Your Identity</Text>
        <View style={[styles.keyInputContainer, { backgroundColor: colors.overlay, borderColor: colors.border, marginBottom: 16 }]}>
          <User size={20} color={colors.subtext} style={{ marginLeft: 12 }} />
          <TextInput
            style={[styles.input, { color: colors.text, paddingLeft: 8 }]}
            placeholder="Your Name"
            placeholderTextColor={colors.subtext}
            value={userName || ''}
            onChangeText={(v) => { setUserName(v); }}
          />
        </View>

        {activeProfile && (
          <ListItem
            icon={<User size={20} color={colors.primary} />}
            title="Edit Detailed Profile"
            subtitle={`Context: ${activeProfile.name}`}
            onPress={() => navigation.navigate('PersonalProfile', { profileId: activeProfile.id })}
            colors={colors}
          />
        )}

        <Text style={[styles.cardSubtitle, { color: colors.subtext, marginTop: 16 }]}>Appearance</Text>
        <SegmentedControl
          options={[
            { label: 'Light', value: 'light', icon: <Sun /> },
            { label: 'Dark', value: 'dark', icon: <Moon /> },
            { label: 'System', value: 'system', icon: <Monitor /> },
          ]}
          selectedValue={currentTheme}
          onSelect={handleSetTheme}
          colors={colors}
        />
      </AppCard>

      {/* 2. AI Settings */}
      <SectionHeader title="AI Intelligence" colors={colors} />
      <AppCard colors={colors}>
        <ListItem
          icon={<Cpu size={20} color={colors.primary} />}
          title="Enable AI Features"
          subtitle="Toggle in-app chat & refinement"
          right={<Switch value={aiEnabled} onValueChange={(v) => { triggerHaptic(); setAiEnabled(v); }} trackColor={{ false: '#767577', true: colors.primary }} />}
          colors={colors}
          showArrow={false}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.cardSubtitle, { color: colors.text, marginTop: 8 }]}>Google Gemini (Free Tier Recommendation)</Text>
        <Text style={[styles.cardDesc, { color: colors.subtext }]}>Get a free key from Google AI Studio</Text>
        <View style={[styles.keyInputContainer, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Gemini API Key"
            placeholderTextColor={colors.subtext}
            value={geminiKey}
            onChangeText={setGeminiKey}
            secureTextEntry={!showGeminiKey}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => { triggerHaptic(); setShowGeminiKey(!showGeminiKey); }} style={styles.eyeIcon}>
            {showGeminiKey ? <EyeOff size={20} color={colors.subtext} /> : <Eye size={20} color={colors.subtext} />}
          </TouchableOpacity>
        </View>

        <View style={styles.keyActions}>
          <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.overlay }]} onPress={testGeminiKey}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{isTestingGemini ? 'Testing...' : 'Test Gemini'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveGeminiKey}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save Gemini</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 20 }]} />

        <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>OpenAI API Key (Secondary)</Text>
        <View style={[styles.keyInputContainer, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="sk-..."
            placeholderTextColor={colors.subtext}
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry={!showKey}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => { triggerHaptic(); setShowKey(!showKey); }} style={styles.eyeIcon}>
            {showKey ? <EyeOff size={20} color={colors.subtext} /> : <Eye size={20} color={colors.subtext} />}
          </TouchableOpacity>
        </View>

        <View style={styles.keyActions}>
          <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.overlay }]} onPress={testKey}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{isTesting ? 'Testing...' : 'Test OpenAI'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveKey}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save OpenAI</Text>
          </TouchableOpacity>
        </View>
      </AppCard>

      {/* 3. Context Engine Settings */}
      <SectionHeader title="Context Engine" colors={colors} />
      <AppCard colors={colors}>
        <ListItem
          icon={<SettingsIcon size={20} color={colors.primary} />}
          title="Include Full History"
          subtitle="Use all historical project data"
          right={<Switch value={includeHistory} onValueChange={(v) => { triggerHaptic(); setSetting('includeHistory', v); }} trackColor={{ false: '#767577', true: colors.primary }} />}
          colors={colors}
          showArrow={false}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ListItem
          icon={<Zap size={20} color={colors.primary} />}
          title="Smart Filtering"
          subtitle="Auto-optimize prompt context"
          right={<Switch value={smartFiltering} onValueChange={(v) => { triggerHaptic(); setSetting('smartFiltering', v); }} trackColor={{ false: '#767577', true: colors.primary }} />}
          colors={colors}
          showArrow={false}
        />
      </AppCard>

      {/* 4. Support & Growth */}
      <SectionHeader title="Support & Development" colors={colors} />
      <AppCard colors={colors} style={styles.supportCard}>
        <TouchableOpacity style={styles.sandwichRow} onPress={openUPI}>
          <View style={[styles.sandwichIcon, { backgroundColor: '#FFFEEA' }]}>
            <Coffee color="#D97706" size={24} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.supportTitle, { color: colors.text }]}>Buy me a sandwich 🥪</Text>
            <Text style={[styles.supportDesc, { color: colors.subtext }]}>Enjoying the app? Support its growth!</Text>
          </View>
          <ChevronRight color={colors.subtext} size={20} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ListItem
          icon={<ShareIcon size={20} color={colors.primary} />}
          title="Share Prompt Profile"
          subtitle="Help others master AI context"
          onPress={handleShare}
          colors={colors}
        />
      </AppCard>

      {/* 5. Legal */}
      <SectionHeader title="Legal & Privacy" colors={colors} />
      <AppCard colors={colors} style={styles.supportCard}>
        <ListItem
          icon={<Shield size={20} color={colors.primary} />}
          title="Privacy Policy"
          subtitle="How we protect your data"
          onPress={() => Alert.alert("Privacy Policy", "This app stores data locally on your device. We do not sell or share your data. AI features use Gemini/OpenAI APIs if enabled.")}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ListItem
          icon={<FileText size={20} color={colors.primary} />}
          title="Terms of Service"
          subtitle="App usage guidelines"
          onPress={() => Alert.alert("Terms of Service", "By using this app, you agree to its terms. All AI-generated content should be verified.")}
          colors={colors}
        />
      </AppCard>

      {/* 6. Developer Branding */}
      <SectionHeader title="The Developer" colors={colors} />
      <AppCard colors={colors} style={styles.devCard}>
        <View style={styles.devProfile}>
          <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
            <Image
              source={{ uri: 'https://github.com/prajwalshelar100.png' }}
              style={styles.avatar}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.devName, { color: colors.text }]}>Prajwal Shelar</Text>
            <Text style={[styles.devTagline, { color: colors.subtext }]}>Building AI-powered systems and intelligent software solutions</Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          <SkillTag label="Full Stack" colors={colors} />
          <SkillTag label="AI/ML" colors={colors} />
          <SkillTag label="Mobile" colors={colors} />
          <SkillTag label="Automation" colors={colors} />
        </View>

        <View style={styles.socialGrid}>
          <SocialButton icon={<Github />} onPress={() => Linking.openURL('https://github.com/prajwalshelar100')} colors={colors} />
          <SocialButton icon={<Linkedin />} onPress={() => Linking.openURL('https://www.linkedin.com/in/prajwalshelar')} colors={colors} />
          <SocialButton icon={<Twitter />} onPress={() => Linking.openURL('https://x.com/prajwalshelar99')} colors={colors} />
          <SocialButton icon={<ExternalLink />} onPress={() => Linking.openURL('https://prajwalshelar.online/')} colors={colors} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 20 }]} />

        <Text style={[styles.cardSubtitle, { color: colors.subtext, marginBottom: 12 }]}>What I Can Build For You</Text>
        <View style={styles.servicesGrid}>
          <ServiceItem icon={<Smartphone size={18} color={colors.primary} />} label="Mobile Apps" colors={colors} />
          <ServiceItem icon={<Cpu size={18} color={colors.primary} />} label="AI Tools" colors={colors} />
          <ServiceItem icon={<Zap size={18} color={colors.primary} />} label="Automation" colors={colors} />
          <ServiceItem icon={<Layout size={18} color={colors.primary} />} label="Dashboards" colors={colors} />
        </View>

        <PrimaryButton
          title="Work With Me 🚀"
          onPress={() => { triggerHaptic(); navigation.navigate('Contact'); }}
          colors={colors}
          style={{ marginTop: 24 }}
        />
      </AppCard>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.subtext }]}>Prompt Profile Premium v8.0 — Secure & Offline</Text>
        <Text style={[styles.copy, { color: colors.subtext }]}>© 2026 Prajwal Shelar</Text>
      </View>
    </ScrollView>
  );
}

function SkillTag({ label, colors }: any) {
  return (
    <View style={[styles.skillTag, { backgroundColor: colors.overlay }]}>
      <Text style={[styles.skillText, { color: colors.primary }]}>{label}</Text>
    </View>
  );
}

function SocialButton({ icon, onPress, colors }: any) {
  return (
    <TouchableOpacity style={[styles.socialBtn, { backgroundColor: colors.overlay }]} onPress={onPress}>
      {React.cloneElement(icon, { size: 20, color: colors.text })}
    </TouchableOpacity>
  );
}

function ServiceItem({ icon, label, colors }: any) {
  return (
    <View style={styles.serviceItem}>
      {icon}
      <Text style={[styles.serviceText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 60 },
  cardSubtitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  cardDesc: { fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  divider: { height: 1, marginVertical: 12 },
  keyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginTop: 8
  },
  input: { flex: 1, height: 50, fontSize: 16 },
  eyeIcon: { padding: 8 },
  keyActions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  secondaryBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  supportCard: { padding: 12 },
  sandwichRow: { flexDirection: 'row', alignItems: 'center' },
  sandwichIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  supportTitle: { fontSize: 16, fontWeight: '700' },
  supportDesc: { fontSize: 13, marginTop: 2 },
  devCard: { padding: 20 },
  devProfile: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, padding: 2 },
  avatar: { width: '100%', height: '100%', borderRadius: 32 },
  devName: { fontSize: 22, fontWeight: '800' },
  devTagline: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 8 },
  skillTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 12, fontWeight: '700' },
  socialGrid: { flexDirection: 'row', marginTop: 20, gap: 12 },
  socialBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', width: '47%', gap: 8 },
  serviceText: { fontSize: 14, fontWeight: '500' },
  footer: { marginTop: 40, alignItems: 'center' },
  version: { fontSize: 12, fontWeight: '600' },
  copy: { fontSize: 11, marginTop: 4, opacity: 0.7 }
});

