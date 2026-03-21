import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme, 
  ScrollView, 
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Switch
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { AppCard, SectionHeader, PrimaryButton, FadeInView, MaxContentWidth } from '../components/PremiumComponents';
import { Camera, Link as LinkIcon, Type, FileText, ChevronRight, X, Sparkles, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { extractProductFromUrl } from '../services/linkParser';
import { extractProductFromPDF } from '../services/pdfParser';

export default function UnifiedAddScreen() {
  const navigation = useNavigation<any>();
  const profiles = useStore(state => state.profiles);
  const activeProfile = profiles[0];
  const addProduct = useStore(state => state.addProduct);
  const loadAllProducts = useStore(state => state.loadAllProducts);

  const [activeMode, setActiveMode] = useState<'none' | 'manual' | 'link' | 'pdf'>('none');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualUsage, setManualUsage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMedicine, setIsMedicine] = useState(false);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');

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

  const resetForm = () => {
    setActiveMode('none');
    setManualTitle('');
    setManualDesc('');
    setManualUsage('');
    setLinkUrl('');
    setIsMedicine(false);
    setDosage('');
    setFrequency('');
    setDuration('');
  };

  const handleManualAdd = async () => {
    if (!manualTitle.trim()) return Alert.alert('Error', 'Please enter a product name.');
    if (!activeProfile) return Alert.alert('Error', 'Please create a profile first.');
    
    setIsProcessing(true);
    triggerHaptic('success');
    try {
      await addProduct({
        profile_id: activeProfile.id,
        name: manualTitle.trim(),
        description: manualDesc.trim(),
        notes: isMedicine ? `Dosage: ${dosage}, Frequency: ${frequency}` : `Usage logic: ${manualUsage.trim()}`,
        category: isMedicine ? 'Medicine/Treatment' : 'Manual Entry',
        dosage,
        frequency,
        duration: isMedicine ? duration : manualUsage,
        is_medicine: isMedicine,
        created_at: Date.now()
      });
      await loadAllProducts(activeProfile.id);
      Alert.alert('Success', 'Product added to your library.', [
        { text: 'OK', onPress: () => { resetForm(); navigation.goBack(); } }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLinkAdd = async () => {
    if (!linkUrl.trim()) return;
    if (!activeProfile) return Alert.alert('Error', 'Please create a profile first.');

    setIsProcessing(true);
    triggerHaptic('light');
    try {
      const extractedData = await extractProductFromUrl(linkUrl.trim());
      navigation.navigate('ProductReview', {
        profileId: activeProfile.id,
        projectId: undefined, // Floating product
        extractedData,
        imageUri: undefined
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not parse that URL.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePDFAdd = async () => {
    if (!activeProfile) return Alert.alert('Error', 'Please create a profile first.');
    triggerHaptic('light');
    try {
      const extractedData = await extractProductFromPDF();
      navigation.navigate('ProductReview', {
        profileId: activeProfile.id,
        projectId: undefined,
        extractedData,
        imageUri: undefined
      });
    } catch (e: any) {
      Alert.alert('PDF Error', e.message);
    }
  };

  const renderOption = (id: string, label: string, sub: string, icon: any, color: string, onPress: () => void) => (
    <TouchableOpacity 
      style={{ marginBottom: 16 }} 
      onPress={() => { triggerHaptic(); onPress(); }}
      activeOpacity={0.7}
    >
      <AppCard colors={colors} style={styles.optionCard}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          {React.cloneElement(icon, { color: color, size: 24 })}
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.subLabel, { color: colors.subtext }]}>{sub}</Text>
        </View>
        <ChevronRight color={colors.border} size={20} />
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <MaxContentWidth>
        <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Add Content</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>How would you like to build your context?</Text>
      </View>

      {activeMode === 'none' ? (
        <View>
          {renderOption('camera', 'Scan Label', 'Use camera to scan product fact sheet', <Camera />, '#007AFF', () => navigation.navigate('CameraCapture', { profileId: activeProfile?.id }))}
          {renderOption('link', 'Import Link', 'Add product via URL / Web shop', <LinkIcon />, '#34C759', () => setActiveMode('link'))}
          {renderOption('manual', 'Manual Description', 'Write detail, usage duration & logic', <Type />, '#5856D6', () => setActiveMode('manual'))}
          {renderOption('pdf', 'Add PDF/Document', 'Extract expert info from assets', <FileText />, '#FF9500', handlePDFAdd)}
        </View>
      ) : (
        <FadeInView>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => { triggerHaptic(); setActiveMode('none'); }}
          >
            <X color={colors.subtext} size={24} />
            <Text style={[styles.backText, { color: colors.subtext }]}>Back to Options</Text>
          </TouchableOpacity>

          <AppCard colors={colors} style={styles.formCard}>
            {activeMode === 'link' ? (
              <View>
                <SectionHeader title="Product Link" colors={colors} />
                <TextInput 
                  style={[styles.input, { color: colors.text, backgroundColor: colors.overlay }]}
                  placeholder="https://example.com/product..."
                  placeholderTextColor={colors.subtext}
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  autoFocus
                  autoCapitalize="none"
                />
                <PrimaryButton 
                  title={isProcessing ? "Processing..." : "Extract Data"} 
                  onPress={handleLinkAdd} 
                  colors={colors}
                  disabled={isProcessing || !linkUrl.trim()}
                  style={{ marginTop: 24 }}
                  icon={<Sparkles color="#fff" size={20} />}
                />
              </View>
            ) : (
              <View>
                <SectionHeader title="Manual Entry" colors={colors} />
                <Text style={[styles.inputLabel, { color: colors.text }]}>Product/Asset Name</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, backgroundColor: colors.overlay }]}
                  placeholder="e.g. Skin Hydrator Pro"
                  placeholderTextColor={colors.subtext}
                  value={manualTitle}
                  onChangeText={setManualTitle}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                  <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>How it works / Description</Text>
                  <TouchableOpacity 
                    onPress={() => Alert.alert('Coming Soon', 'AI Enrichment will be available when an API key is configured.')}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Sparkles color={colors.primary} size={14} />
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>Smart Enrich</Text>
                  </TouchableOpacity>
                </View>
                <TextInput 
                  style={[styles.input, styles.multiInput, { color: colors.text, backgroundColor: colors.overlay }]}
                  placeholder="Explain the product logic..."
                  placeholderTextColor={colors.subtext}
                  value={manualDesc}
                  onChangeText={setManualDesc}
                  multiline
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8, gap: 10 }}>
                  <Switch 
                    value={isMedicine} 
                    onValueChange={setIsMedicine} 
                    trackColor={{ false: '#767577', true: colors.primary }} 
                  />
                  <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>This is a Medicine / Health Supplement</Text>
                </View>

                {isMedicine && (
                  <FadeInView>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Dosage</Text>
                        <TextInput 
                          style={[styles.input, { color: colors.text, backgroundColor: colors.overlay }]}
                          placeholder="e.g. 500mg"
                          placeholderTextColor={colors.subtext}
                          value={dosage}
                          onChangeText={setDosage}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Frequency</Text>
                        <TextInput 
                          style={[styles.input, { color: colors.text, backgroundColor: colors.overlay }]}
                          placeholder="e.g. 2x daily"
                          placeholderTextColor={colors.subtext}
                          value={frequency}
                          onChangeText={setFrequency}
                        />
                      </View>
                    </View>
                    <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>Treatment Duration</Text>
                    <TextInput 
                      style={[styles.input, { color: colors.text, backgroundColor: colors.overlay }]}
                      placeholder="e.g. 7 days, 3 months"
                      placeholderTextColor={colors.subtext}
                      value={duration}
                      onChangeText={setDuration}
                    />
                  </FadeInView>
                )}

                {!isMedicine && (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>Usage Duration & Schedule</Text>
                    <TextInput 
                      style={[styles.input, { color: colors.text, backgroundColor: colors.overlay }]}
                      placeholder="e.g. 2 months, twice daily"
                      placeholderTextColor={colors.subtext}
                      value={manualUsage}
                      onChangeText={setManualUsage}
                    />
                  </>
                )}

                <PrimaryButton 
                  title={isProcessing ? "Saving..." : "Add to Library"} 
                  onPress={handleManualAdd} 
                  colors={colors}
                  disabled={isProcessing || !manualTitle.trim()}
                  style={{ marginTop: 32 }}
                  icon={<Check color="#fff" size={20} />}
                />
              </View>
            )}
          </AppCard>
        </FadeInView>
      )}

        <View style={{ height: 100 }} />
      </MaxContentWidth>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { marginBottom: 32 },
  title: { ...Typography.h1 },
  subtitle: { ...Typography.subheadline, fontWeight: '600', marginTop: 4 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 16 },
  label: { fontSize: 18, fontWeight: '700' },
  subLabel: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  formCard: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { padding: 16, borderRadius: 12, fontSize: 16, fontWeight: '600' },
  multiInput: { height: 120, textAlignVertical: 'top' }
});
