import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useColorScheme
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import {
  Plus,
  Link as LinkIcon,
  Camera,
  Briefcase,
  FileText,
  ChevronRight,
  Activity,
  MessageSquare,
  Clipboard,
  Type,
  X,
  Sparkles,
  Copy,
  Star,
  Repeat,
  History,
  Zap,
  CheckCircle,
  Box,
  Heart
} from 'lucide-react-native';
import { Colors, Typography } from '../theme';
import { AppCard, SectionHeader, PrimaryButton, FadeInView } from '../components/PremiumComponents';
import * as ExpoClipboard from 'expo-clipboard';
import { extractProductFromUrl } from '../services/linkParser';
import EmptyState from '../components/EmptyState';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  colors: any;
}

function ActionButton({ icon, label, onPress, colors }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SmallActionButton({ icon, label, onPress, colors }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.smallActionBtn, { backgroundColor: colors.overlay }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.smallActionLabel, { color: colors.primary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

type ProjectDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'ProjectDetail'>;
type ProjectDetailRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

export default function ProjectDetailScreen() {
  const route = useRoute<ProjectDetailRouteProp>();
  const navigation = useNavigation<ProjectDetailNavProp>();
  const { projectId } = route.params;

  const project = useStore(state => {
    for (const profileId in state.projects) {
      const p = state.projects[profileId].find(proj => proj.id === projectId);
      if (p) return p;
    }
    return null;
  });

  const products = useStore(state => state.products[projectId]) || [];
  const notes = useStore(state => state.notes[projectId]) || [];
  const prompts = useStore(state => state.prompts[projectId]) || [];
  const routines = useStore(state => state.routines[projectId]) || [];
  const profiles = useStore(state => state.profiles);
  const experiencesMap = useStore(state => state.experiences);
  const health_records = useStore(state => state.health_records);
  const records = health_records[projectId] || [];

  const loadProjectData = useStore(state => state.loadProjectData);
  const loadProductExperiences = useStore(state => state.loadProductExperiences);
  const addNote = useStore(state => state.addNote);
  const addProduct = useStore(state => state.addProduct);

  const [newNote, setNewNote] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const [showTextAdd, setShowTextAdd] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [obsName, setObsName] = useState('');

  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const triggerHaptic = (type: 'success' | 'light' | 'medium' = 'medium') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  useEffect(() => {
    loadProjectData(projectId);
  }, [projectId]);

  useEffect(() => {
    products.forEach(p => loadProductExperiences(p.id));
  }, [products.length]);

  if (!project) return null;

  const handleTextAdd = async () => {
    if (!newProductName.trim()) return;
    triggerHaptic('success');
    try {
      const productData = {
        profile_id: project.profile_id,
        project_id: projectId,
        name: newProductName.trim(),
        category: 'Manual Entry',
        ingredients: '',
        notes: 'Added via text',
        raw_text: newProductName,
        created_at: Date.now()
      };
      await addProduct(productData);
      setNewProductName('');
      setShowTextAdd(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    triggerHaptic('success');
    await addNote({
      profile_id: project.profile_id,
      project_id: projectId,
      content: newNote.trim(),
      title: obsName.trim() || undefined,
      created_at: Date.now()
    });
    setNewNote('');
    setObsName('');
  };

  const handleExtractLink = async () => {
    if (!linkUrl.trim()) return;
    setIsExtracting(true);
    triggerHaptic('light');
    try {
      const extractedData = await extractProductFromUrl(linkUrl.trim());
      setShowLinkInput(false);
      setLinkUrl('');
      navigation.navigate('ProductReview', {
        profileId: project.profile_id,
        projectId,
        extractedData,
        imageUri: undefined
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not parse that URL.');
    } finally {
      setIsExtracting(false);
    }
  };

  const renderProductItem = (product: any) => (
    <TouchableOpacity 
      key={product.id} 
      onPress={() => navigation.navigate('ProductReview', { 
        profileId: project.profile_id, 
        projectId, 
        product, 
        imageUri: undefined 
      })}
    >
      <AppCard colors={colors} style={styles.productCard}>
        <View style={styles.productInfo}>
          <Box color={colors.primary} size={20} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <Text style={[styles.productMeta, { color: colors.subtext }]}>{product.category}</Text>
          </View>
        </View>
        <ChevronRight color={colors.border} size={18} />
      </AppCard>
    </TouchableOpacity>
  );

  const renderRoutineItem = (routine: any) => (
    <AppCard key={routine.id} colors={colors} style={styles.routineCard}>
      <View style={styles.routineMain}>
        <View style={styles.routineHeader}>
          <View style={styles.routineTitleRow}>
            <Repeat color={colors.primary} size={18} />
            <Text style={[styles.routineName, { color: colors.text }]}>{routine.name}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Routine', { projectId, routineId: routine.id })}
            style={styles.editBtn}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.routineDetails}>
          <View style={styles.detailItem}>
            <Zap color={colors.subtext} size={14} />
            <Text style={[styles.detailText, { color: colors.subtext }]}>{routine.startTime}</Text>
          </View>
          <Text style={[styles.detailText, { color: colors.subtext, marginLeft: 8 }]}>
            • {routine.daysOfWeek.join(', ')}
          </Text>
        </View>
      </View>
    </AppCard>
  );

  const renderNoteItem = (note: any) => (
    <AppCard key={note.id} colors={colors} style={styles.noteCard}>
      {note.title && (
        <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
      )}
      <Text style={[styles.noteContent, { color: colors.text }]}>{note.content}</Text>
      <Text style={[styles.noteDate, { color: colors.subtext }]}>
        {new Date(note.created_at).toLocaleDateString()}
      </Text>
    </AppCard>
  );

  const renderRecordItem = (record: any) => (
    <AppCard key={record.id} colors={colors} style={styles.recordCard}>
      <View style={styles.recordIcon}>
        <FileText size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>{record.title}</Text>
        <Text style={[styles.recordType, { color: colors.subtext }]}>{record.type.toUpperCase()}</Text>
      </View>
    </AppCard>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{project.name}</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Manage your project context and products.</Text>
        </View>

        <SectionHeader 
          title="Products & Assets" 
          colors={colors} 
          rightText="+ Add Library"
          onRightPress={() => navigation.navigate('ProductPicker', { projectId, profileId: project.profile_id })}
        />
        <View style={styles.actionRow}>
          <ActionButton 
            icon={<Camera color={colors.primary} size={20} />} 
            label="Scan" 
            onPress={() => navigation.navigate('CameraCapture', { profileId: project.profile_id, projectId })}
            colors={colors}
          />
          <ActionButton 
            icon={<LinkIcon color={colors.primary} size={20} />} 
            label="Link" 
            onPress={() => setShowLinkInput(true)}
            colors={colors}
          />
          <ActionButton 
            icon={<Type color={colors.primary} size={20} />} 
            label="Text" 
            onPress={() => setShowTextAdd(true)}
            colors={colors}
          />
        </View>

        {showLinkInput && (
          <FadeInView>
            <AppCard colors={colors} style={styles.popupCard}>
              <View style={styles.popupHeader}>
                <Text style={[styles.popupTitle, { color: colors.text }]}>Add Product Link</Text>
                <TouchableOpacity onPress={() => setShowLinkInput(false)}>
                  <X color={colors.subtext} size={20} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.overlay, color: colors.text }]}
                placeholder="Paste URL here..."
                placeholderTextColor={colors.subtext}
                value={linkUrl}
                onChangeText={setLinkUrl}
                autoCapitalize="none"
              />
              <PrimaryButton 
                title={isExtracting ? "Extracting..." : "Add Product"} 
                onPress={handleExtractLink} 
                colors={colors}
                disabled={!linkUrl.trim() || isExtracting}
                style={{ marginTop: 12 }}
              />
            </AppCard>
          </FadeInView>
        )}

        {showTextAdd && (
          <FadeInView>
            <AppCard colors={colors} style={styles.popupCard}>
              <View style={styles.popupHeader}>
                <Text style={[styles.popupTitle, { color: colors.text }]}>Manual Product Entry</Text>
                <TouchableOpacity onPress={() => setShowTextAdd(false)}>
                  <X color={colors.subtext} size={20} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: colors.overlay, color: colors.text }]}
                placeholder="Product name..."
                placeholderTextColor={colors.subtext}
                value={newProductName}
                onChangeText={setNewProductName}
              />
              <PrimaryButton 
                title="Save Product" 
                onPress={handleTextAdd} 
                colors={colors}
                disabled={!newProductName.trim()}
                style={{ marginTop: 12 }}
              />
            </AppCard>
          </FadeInView>
        )}

        {products.length === 0 ? (
          <EmptyState 
            title="No products yet"
            description="Add products to build your routine and analysis base."
            colors={colors}
          />
        ) : (
          products.map(renderProductItem)
        )}

        <SectionHeader 
          title="Routines" 
          colors={colors} 
          rightText="+ New"
          onRightPress={() => navigation.navigate('Routine', { projectId })}
        />
        {routines.length === 0 ? (
          <EmptyState 
            title="Next Step: Create Routine"
            description="Organize your products into an actionable schedule."
            colors={colors}
          />
        ) : (
          routines.map(renderRoutineItem)
        )}

        <SectionHeader title="Intelligence Summary" colors={colors} />
        <AppCard colors={colors} style={styles.summaryCard}>
          <View style={styles.workedSection}>
            <Text style={[styles.summaryHeader, { color: '#34C759' }]}>Problems Solved (Worked)</Text>
            <View style={styles.productTagRow}>
              {products.filter(p => (experiencesMap[p.id] || []).some(e => e.result_type === 'worked')).length > 0 ? (
                products.filter(p => (experiencesMap[p.id] || []).some(e => e.result_type === 'worked')).map(p => (
                  <View key={p.id} style={[styles.productTag, { backgroundColor: '#34C75920' }]}>
                    <Text style={{ color: '#34C759', fontSize: 12, fontWeight: '700' }}>{p.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyLabel, { color: colors.subtext }]}>No successful products logged yet.</Text>
              )}
            </View>
          </View>
          
          <View style={[styles.summaryDividerVertical, { backgroundColor: colors.border }]} />

          <View style={styles.failedSection}>
            <Text style={[styles.summaryHeader, { color: '#FF3B30' }]}>Problems Caused (Failed)</Text>
            <View style={styles.productTagRow}>
              {products.filter(p => (experiencesMap[p.id] || []).some(e => e.result_type === 'not_worked')).length > 0 ? (
                products.filter(p => (experiencesMap[p.id] || []).some(e => e.result_type === 'not_worked')).map(p => (
                  <View key={p.id} style={[styles.productTag, { backgroundColor: '#FF3B3020' }]}>
                    <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '700' }}>{p.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyLabel, { color: colors.subtext }]}>No problematic products identified.</Text>
              )}
            </View>
          </View>
        </AppCard>

        <SectionHeader 
          title="Medical Record Gallery" 
          colors={colors} 
          rightText="+ Add"
          onRightPress={() => navigation.navigate('HealthProfile', { profileId: project.profile_id })}
        />
        {records.length === 0 ? (
          <EmptyState 
            title="Store Lab Reports & Prescriptions"
            description="Keep your clinical assets linked to this project context."
            colors={colors}
          />
        ) : (
          <View style={styles.recordGrid}>
            {records.map(renderRecordItem)}
          </View>
        )}

        <SectionHeader title="Real-time Observations" colors={colors} />
        <AppCard colors={colors} style={styles.noteInputCard}>
          <TextInput
            style={[styles.obsTitleInput, { color: colors.text }]}
            placeholder="Observation Name (optional)..."
            placeholderTextColor={colors.subtext}
            value={obsName}
            onChangeText={setObsName}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TextInput
            style={[styles.input, { backgroundColor: 'transparent', height: 80, textAlignVertical: 'top' }]}
            placeholder="Add specific detail or result..."
            placeholderTextColor={colors.subtext}
            value={newNote}
            onChangeText={setNewNote}
            multiline
          />
          <TouchableOpacity 
            style={[styles.addNoteBtn, { backgroundColor: colors.primary }]} 
            onPress={handleAddNote}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </AppCard>

        {notes.length === 0 ? (
          <EmptyState 
            title="Log Your Progress"
            description="Records changes, reactions, or specific observations here."
            colors={colors}
          />
        ) : (
          notes.map(renderNoteItem)
        )}

        <SectionHeader title="Health Context" colors={colors} />
        <TouchableOpacity 
          onPress={() => navigation.navigate('HealthProfile', { profileId: project.profile_id })}
        >
          <AppCard colors={colors} style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Heart color={colors.error} size={20} fill={colors.error + '20'} />
              <Text style={[styles.healthTitle, { color: colors.text }]}>Patient Profile & Records</Text>
              <ChevronRight color={colors.border} size={18} />
            </View>
            
            {(profiles.find(p => p.id === project.profile_id)?.blood_group || 
              profiles.find(p => p.id === project.profile_id)?.allergies) ? (
              <View style={styles.healthSummary}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Blood Group</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {profiles.find(p => p.id === project.profile_id)?.blood_group || 'Not set'}
                  </Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Allergies</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>
                    {profiles.find(p => p.id === project.profile_id)?.allergies || 'None listed'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.healthEmptyText, { color: colors.subtext }]}>
                Complete the health profile to improve AI medical analysis.
              </Text>
            )}
          </AppCard>
        </TouchableOpacity>

        <SectionHeader title="AI Insights" colors={colors} />
        <PrimaryButton 
          title="Generate Smart Routine" 
          onPress={() => navigation.navigate('PromptGenerator', { profileId: project.profile_id, projectId })} 
          colors={colors}
          icon={<Sparkles color="#fff" size={20} />}
          style={{ marginBottom: 12 }}
        />
        <SmallActionButton 
          icon={<MessageSquare />} 
          label="Analyze Context with AI" 
          onPress={() => navigation.navigate('AIChat', { profileId: project.profile_id, projectId })}
          colors={colors}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 20 },
  header: { marginBottom: 24 },
  title: { ...Typography.h1 },
  subtitle: { ...Typography.subheadline, marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: { flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  smallActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderBottomWidth: 0 },
  smallActionLabel: { marginLeft: 8, fontSize: 15, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  productCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, justifyContent: 'space-between' },
  productInfo: { flexDirection: 'row', alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: '700' },
  productMeta: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  routineCard: { padding: 16, marginBottom: 12 },
  routineMain: { flex: 1 },
  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routineTitleRow: { flexDirection: 'row', alignItems: 'center' },
  routineName: { fontSize: 16, fontWeight: '700', marginLeft: 10 },
  editBtn: { padding: 8 },
  routineDetails: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, fontWeight: '500' },
  noteCard: { padding: 16, marginBottom: 12 },
  noteTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  noteContent: { fontSize: 14, lineHeight: 20 },
  noteDate: { fontSize: 11, marginTop: 10, textAlign: 'right' },
  noteInputCard: { padding: 12, marginBottom: 16 },
  obsTitleInput: { fontSize: 15, fontWeight: '700', padding: 8 },
  divider: { height: 1, marginVertical: 4 },
  input: { borderRadius: 12, padding: 12, fontSize: 15 },
  addNoteBtn: { position: 'absolute', bottom: 12, right: 12, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  popupCard: { padding: 20, marginBottom: 16, borderWidth: 2, borderColor: '#007AFF50' },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  popupTitle: { fontSize: 17, fontWeight: '800' },
  healthCard: {
    padding: 16,
    marginBottom: 20,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  healthTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  healthSummary: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 16,
    opacity: 0.5,
  },
  healthEmptyText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 12,
    fontStyle: 'italic',
  },
  summaryCard: { padding: 16, marginBottom: 12 },
  workedSection: { marginBottom: 0 },
  failedSection: { marginTop: 0 },
  summaryHeader: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  productTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  summaryDividerVertical: { height: 1, marginVertical: 16, opacity: 0.5 },
  emptyLabel: { fontSize: 12, fontStyle: 'italic' },
  recordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  recordCard: { width: '48%', padding: 12, flexDirection: 'row', alignItems: 'center' },
  recordIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,122,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  recordTitle: { fontSize: 13, fontWeight: '700' },
  recordType: { fontSize: 10, fontWeight: '700', marginTop: 2 }
});
