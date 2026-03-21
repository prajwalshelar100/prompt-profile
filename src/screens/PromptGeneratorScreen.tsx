import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { buildMasterPrompt } from '../services/contextBuilder';
import { getApiKey, getGeminiKey } from '../services/secureStore';
import * as Clipboard from 'expo-clipboard';
import { Copy, Check, MessageCircle, RefreshCw, Save, Sparkles } from 'lucide-react-native';
import { AppCard, SectionHeader, PrimaryButton } from '../components/PremiumComponents';

type PromptGeneratorRouteProp = RouteProp<RootStackParamList, 'PromptGenerator'>;
type PromptGenNavProp = NativeStackNavigationProp<RootStackParamList, 'PromptGenerator'>;

export default function PromptGeneratorScreen() {
  const route = useRoute<PromptGeneratorRouteProp>();
  const navigation = useNavigation<PromptGenNavProp>();
  const { profileId, projectId } = route.params;

  const profile = useStore(state => state.profiles.find(p => p.id === profileId));
  const project = useStore(state => {
    const profileProjects = state.projects[profileId] || [];
    return profileProjects.find(p => p.id === projectId);
  });

  const products = useStore(state => state.products[projectId]) || [];
  const notes = useStore(state => state.notes[projectId]) || [];
  const experiences = useStore(state => state.experiences);
  const routines = useStore(state => state.routines[projectId]) || [];
  const savePrompt = useStore(state => state.savePrompt);
  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [promptText, setPromptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const triggerHaptic = (type: 'success' | 'light' | 'medium' = 'medium') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  useEffect(() => {
    const checkKeys = async () => {
      const oKey = await getApiKey();
      const gKey = await getGeminiKey();
      setHasApiKey(!!(oKey || gKey));
    };
    checkKeys();
  }, []);

  useEffect(() => {
    if (profile && project && !promptText) {
      generate();
    }
  }, [profileId, projectId, profile, project]);

  const health_records = useStore(state => state.health_records);
  const healthRecords = health_records[projectId] || [];

  const generate = () => {
    if (!profile || !project) return;
    triggerHaptic('light');
    const masterStr = buildMasterPrompt(project, profile, products, notes, experiences, routines, healthRecords);
    setPromptText(masterStr);
  };

  const copyToClipboard = async () => {
    triggerHaptic('success');
    await Clipboard.setStringAsync(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    triggerHaptic('success');
    await savePrompt(profileId, projectId, promptText, 'offline');
    Alert.alert('Saved', 'Context prompt stored in local history.');
  };

  const openChat = async () => {
    if (!hasApiKey) {
      Alert.alert('API Key Required', 'Please set your OpenAI API key in Settings to use the Chat functionality.');
      return;
    }
    triggerHaptic('medium');
    await savePrompt(profileId, projectId, promptText, 'ai-only');
    navigation.navigate('AIChat', { initialSystemPrompt: promptText, profileId, projectId });
  };

  if (!profile) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Context Compiler</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Review your synthesized intelligence layer.</Text>
        </View>

        <SectionHeader title="Synthesized Output" colors={colors} />
        <AppCard colors={colors} style={styles.promptCard}>
          <TextInput
            style={[styles.promptInput, { color: colors.text }]}
            multiline
            value={promptText}
            onChangeText={setPromptText}
            scrollEnabled={false}
          />
        </AppCard>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.smallBtn, { backgroundColor: colors.overlay }]}
            onPress={generate}
          >
            <RefreshCw color={colors.primary} size={16} />
            <Text style={[styles.smallBtnText, { color: colors.primary }]}> Rebuild</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallBtn, { backgroundColor: colors.overlay }]}
            onPress={handleSave}
          >
            <Save color={colors.primary} size={16} />
            <Text style={[styles.smallBtnText, { color: colors.primary }]}> Save this prompt</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Deployment Options" colors={colors} />
        <View style={styles.deploymentRow}>
          <PrimaryButton
            title={copied ? "Copied!" : "Copy for AI Platform"}
            onPress={copyToClipboard}
            colors={colors}
            style={styles.deployBtn}
            icon={copied ? <Check color="#fff" size={20} /> : <Copy color="#fff" size={20} />}
          />

          {hasApiKey && (
            <PrimaryButton
              title="Chat with AI"
              onPress={openChat}
              colors={colors}
              style={[styles.deployBtn, { backgroundColor: colors.text }]}
              icon={<MessageCircle color={colors.background} size={20} />}
              textStyle={{ color: colors.background }}
            />
          )}
        </View>

        {!hasApiKey && (
          <AppCard colors={colors} style={styles.aiHintCard}>
            <Sparkles color={colors.primary} size={20} />
            <Text style={[styles.aiHintText, { color: colors.subtext }]}>
              Pro Tip: Add an API key in Settings to chat with this context directly in the app.
            </Text>
          </AppCard>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <PrimaryButton
          title="Done / Back to Hub"
          onPress={() => navigation.goBack()}
          colors={colors}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  title: { ...Typography.h1 },
  subtitle: { ...Typography.subheadline, fontWeight: '600', marginTop: 4 },
  promptCard: { padding: 4, marginTop: 8 },
  promptInput: { fontSize: 15, fontWeight: '500', lineHeight: 22, minHeight: 250, padding: 12, textAlignVertical: 'top' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  smallBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  smallBtnText: { fontSize: 13, fontWeight: '700' },
  deploymentRow: { gap: 12, marginTop: 8 },
  deployBtn: { flex: 1 },
  aiHintCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, borderStyle: 'dashed', borderWidth: 1 },
  aiHintText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1
  }
});
