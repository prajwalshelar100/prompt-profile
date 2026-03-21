import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
  useColorScheme,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Project, Profile } from '../types';
import {
  Plus,
  Search,
  Settings as SettingsIcon,
  User,
  ChevronRight,
  Sparkles,
  Box,
  MessageSquare,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Briefcase,
  Copy as ClipboardIcon
} from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../theme';
import { extractProductFromPDF } from '../services/pdfParser';
import { AppCard, SectionHeader, ActionMenu, PrimaryButton, FadeInView, Shimmer, MaxContentWidth } from '../components/PremiumComponents';

import * as Clipboard from 'expo-clipboard';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type ProfilesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profiles'>;

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const profiles = useStore(state => state.profiles);
  const projectsMap = useStore(state => state.projects);
  const userName = useStore(state => state.userName);
  const themeMode = useThemeStore(state => state.theme);

  const loadState = useStore(state => state.loadState);
  const loadProfileProjects = useStore(state => state.loadProfileProjects);
  const isStoreLoading = useStore(state => state.isLoading);

  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const activeProfile = profiles[0];

  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});
  const [showAboutDetail, setShowAboutDetail] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const [isReadyState, setIsReadyState] = useState(false);

  useEffect(() => {
    loadState().then(() => {
      setIsReadyState(true);
    });
  }, []);

  useEffect(() => {
    if (activeProfile) {
      loadProfileProjects(activeProfile.id);
    }
  }, [activeProfile?.id]);

  useEffect(() => {
    if (isReadyState && (!userName || profiles.length === 0)) {
      navigation.navigate('Onboarding' as any);
    }
  }, [profiles.length, isReadyState, userName]);

  const activeProjects = useMemo(() => {
    return activeProfile ? (projectsMap[activeProfile.id] || []) : [];
  }, [activeProfile, projectsMap]);

  const navigateWithContext = (screen: string, params = {}) => {
    triggerHaptic();
    if (!activeProfile) {
      navigation.navigate('Onboarding' as any);
      return;
    }
    const targetProject = activeProjects[0];
    if (!targetProject) {
      Alert.alert(
        'Project Required',
        'Create a project first to store your context.',
        [{ text: 'Create Now', onPress: () => navigation.navigate('Onboarding' as any) }]
      );
      return;
    }
    navigation.navigate(screen as any, {
      ...params,
      projectId: targetProject.id,
      profileId: activeProfile.id
    });
  };

  const handleAddPDF = async () => {
    triggerHaptic();
    try {
      const extractedData = await extractProductFromPDF();
      if (activeProfile) {
        const projects = projectsMap[activeProfile.id] || [];
        let projectId = projects[0]?.id;
        if (!projectId) {
          projectId = await useStore.getState().addProject({
            profile_id: activeProfile.id,
            name: 'Default Project',
            created_at: Date.now()
          });
        }
        navigation.navigate('ProductReview' as any, {
          profileId: activeProfile.id,
          projectId,
          extractedData,
          imageUri: undefined
        });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const recentPrompts = useStore(state => state.recentPrompts);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    triggerHaptic();
  };

  const toggleExpandPrompt = (id: string) => {
    triggerHaptic();
    setExpandedPrompts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderProjectCard = ({ item }: { item: Project }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => { triggerHaptic(); navigation.navigate('ProjectDetail' as any, { projectId: item.id }); }}
    >
      <AppCard colors={colors} style={styles.projectCard}>
        <View style={[styles.projectIconBox, { backgroundColor: colors.overlay }]}>
          <Box color={colors.primary} size={24} />
        </View>
        <Text style={[styles.projectName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.projectDate, { color: colors.subtext }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </AppCard>
    </TouchableOpacity>
  );

  const renderProfileItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => { triggerHaptic(); navigation.navigate('ProfileDetail', { profileId: item.id }); }}
    >
      <AppCard colors={colors} style={styles.profileItemCard}>
        <View style={[styles.profileIconBox, { backgroundColor: colors.overlay }]}>
          <User color={colors.primary} size={28} />
        </View>
        <Text style={[styles.profileItemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>Active Profile</Text>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <MaxContentWidth>
        {/* Premium Header */}
        <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.subtext }]}>Hello,</Text>
          <Text style={[styles.profileName, { color: colors.text }]}>{userName || 'Explorer'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: colors.overlay }]}
          onPress={() => { triggerHaptic(); navigation.navigate('Settings'); }}
        >
          <SettingsIcon color={colors.primary} size={22} />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <FadeInView delay={100}>
        <AppCard colors={colors} style={styles.aboutCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { triggerHaptic(); setShowAboutDetail(!showAboutDetail); }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={[styles.projectIconBox, { backgroundColor: colors.overlay, marginBottom: 0 }]}>
                <Sparkles color={colors.primary} size={24} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.aboutTitle, { color: colors.text }]}>What is Prompt Profile?</Text>
                <Text style={[styles.aboutSubtitle, { color: colors.subtext }]}>The ultimate intelligence layer.</Text>
              </View>
              <ChevronRight
                color={colors.border}
                size={20}
                style={{ transform: [{ rotate: showAboutDetail ? '90deg' : '0deg' }] }}
              />
            </View>
          </TouchableOpacity>

          {(showAboutDetail || Platform.OS === 'web') && (
            <FadeInView>
              <Text style={[styles.aboutText, { color: colors.subtext }]}>
                We capture your real-world experiences, products, and routines to generate hyper-accurate context prompts for AI agents.
                {"\n\n"}
                By building a detailed "Source of Truth" on your device, you can get better results from LLMs without repeating yourself.
              </Text>
            </FadeInView>
          )}
        </AppCard>
      </FadeInView>

      <FadeInView delay={300} direction="down">
        <SectionHeader
          title="Your Profiles"
          colors={colors}
          rightText="See All"
          onRightPress={() => navigation.navigate('Profiles')}
        />
        {isStoreLoading && profiles.length === 0 ? (
          <View style={{ flexDirection: 'row', paddingLeft: 16 }}>
            {[1, 2, 3].map(i => (
              <Shimmer key={i} width={width * 0.4} height={140} borderRadius={16} style={{ marginRight: 16 }} />
            ))}
          </View>
        ) : (
          <FlatList
            data={profiles.slice(0, 5)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.profilesList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.profileItemCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16 }]}
                onPress={() => {
                  triggerHaptic();
                  navigation.navigate('ProfileDetail', { profileId: item.id });
                }}
              >
                <View style={[styles.profileIconBox, { backgroundColor: colors.overlay }]}>
                  <User color={colors.primary} size={28} />
                </View>
                <Text style={[styles.profileItemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: colors.overlay }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>ACTIVE</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </FadeInView>

      {/* Recent Prompts - Quick Copy */}
      <FadeInView delay={500}>
        <SectionHeader title="Recent Prompts" colors={colors} />
        {isStoreLoading && recentPrompts.length === 0 ? (
          <View style={{ paddingHorizontal: 16 }}>
             <Shimmer width={width - 32} height={120} borderRadius={16} style={{ marginBottom: 16 }} />
             <Shimmer width={width - 32} height={120} borderRadius={16} />
          </View>
        ) : recentPrompts.length === 0 ? (
          <AppCard colors={colors} style={styles.emptyCard}>
            <Sparkles size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.subtext, marginTop: 12 }]}>No prompts generated yet. Start exploring your context!</Text>
          </AppCard>
        ) : (
          recentPrompts.map((prompt) => {
            const isExpanded = expandedPrompts[prompt.id];
            return (
              <TouchableOpacity
                key={prompt.id}
                activeOpacity={0.9}
                onPress={() => toggleExpandPrompt(prompt.id)}
              >
                <AppCard colors={colors} style={styles.promptHubCard}>
                  <View style={styles.promptHeader}>
                    <View style={styles.promptInfo}>
                      <Clock size={14} color={colors.subtext} />
                      <Text style={[styles.promptTime, { color: colors.subtext }]}>
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.sourceBadge, { backgroundColor: colors.overlay }]}>
                      <Text style={[styles.sourceText, { color: colors.primary }]}>{prompt.source.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.promptPreview, { color: colors.text }]}
                    numberOfLines={isExpanded ? undefined : 3}
                  >
                    {prompt.content}
                  </Text>

                  <View style={styles.promptFooter}>
                    <TouchableOpacity
                      style={[styles.copyBtn, { backgroundColor: colors.primary, flex: 1 }]}
                      onPress={() => copyToClipboard(prompt.content)}
                    >
                      <ClipboardIcon color="#fff" size={18} />
                      <Text style={styles.copyBtnText}>Copy Prompt</Text>
                    </TouchableOpacity>
                    {prompt.content.length > 100 && (
                      <TouchableOpacity
                        style={[styles.expandBtn, { borderColor: colors.border }]}
                        onPress={() => toggleExpandPrompt(prompt.id)}
                      >
                        <Text style={[styles.expandBtnText, { color: colors.subtext }]}>
                          {isExpanded ? 'Show Less' : 'Full View'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </AppCard>
              </TouchableOpacity>
            );
          })
        )}
      </FadeInView>

        <View style={{ height: 100 }} />
      </MaxContentWidth>
    </ScrollView>
  );
}

function ActivityItem({ icon, text, textColor }: any) {
  return (
    <View style={styles.activityItem}>
      {icon}
      <Text style={[styles.activityText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: { ...Typography.subheadline, fontWeight: '600' },
  profileName: { ...Typography.h1 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
    marginTop: 8
  },
  seeAllBtn: { marginTop: 20 },
  seeAll: { ...Typography.subheadline, fontWeight: '700' },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  actionItem: { width: '23%', alignItems: 'center' },
  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 4 }
    })
  },
  actionLabel: { ...Typography.caption, fontWeight: '700', textAlign: 'center' },
  smartImports: { paddingHorizontal: 16 },
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  importIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  importLabel: { flex: 1, marginLeft: 12, ...Typography.body, fontWeight: '600' },
  projectsList: { paddingLeft: 16, paddingRight: 4, paddingVertical: 8 },
  projectCard: {
    width: width * 0.44,
    marginRight: 16,
    padding: 16,
  },
  projectIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  projectName: { ...Typography.body, fontWeight: '700', marginBottom: 4 },
  projectDate: { ...Typography.caption },
  emptyCard: { marginHorizontal: 16, padding: 30, alignItems: 'center' },
  emptyText: { ...Typography.subheadline, textAlign: 'center' },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  activityText: { ...Typography.subheadline, fontWeight: '500', marginLeft: 12 },
  secActionText: {
    fontSize: 14,
    fontWeight: '700'
  },
  aboutCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20
  },
  profilesList: {
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 8
  },
  profileItemCard: {
    width: width * 0.4,
    marginRight: 16,
    padding: 16,
    alignItems: 'center'
  },
  profileIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  profileItemName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#34C75920'
  },
  badgeText: {
    fontSize: 10,
    color: '#34C759',
    fontWeight: '800'
  },
  promptHubCard: {
    marginBottom: 16,
    padding: 16
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  promptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  promptTime: {
    fontSize: 11,
    fontWeight: '600'
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  sourceText: {
    fontSize: 9,
    fontWeight: '900'
  },
  promptPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8
  },
  copyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  promptFooter: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  expandBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: '600'
  },
  aboutSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2
  }
});
