import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  Image, 
  useColorScheme,
  Switch,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Colors, Typography, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, Check, Save, Link, Trash2, Copy, Pill, Clock, Activity } from 'lucide-react-native';
import { AppCard, SectionHeader, PrimaryButton, Shimmer, MaxContentWidth } from '../components/PremiumComponents';
import { Alert } from 'react-native';
import { extractProductData } from '../services/ocrService';

type ProductReviewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductReview'>;
type ProductReviewRouteProp = RouteProp<RootStackParamList, 'ProductReview'>;

export default function ProductReviewScreen() {
  const route = useRoute<ProductReviewRouteProp>();
  const navigation = useNavigation<ProductReviewNavigationProp>();
  const { profileId, projectId, extractedData, imageUri, product: existingProduct, shouldExtract, debugSimulate } = route.params;

  const [isExtracting, setIsExtracting] = useState(!!shouldExtract);

  const addProduct = useStore(state => state.addProduct);
  const updateProduct = useStore(state => state.updateProduct);
  const deleteProduct = useStore(state => state.deleteProduct);
  
  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [name, setName] = useState(existingProduct?.name || extractedData?.product_name || '');
  const [category, setCategory] = useState(existingProduct?.category || extractedData?.category || '');
  const [ingredients, setIngredients] = useState(
    existingProduct?.ingredients || 
    (Array.isArray(extractedData?.ingredients) ? extractedData.ingredients.join(', ') : (extractedData?.ingredients || ''))
  );
  const [notes, setNotes] = useState(existingProduct?.notes || extractedData?.notes || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [rawText, setRawText] = useState(existingProduct?.raw_text || extractedData?.raw_text || '');
  const [sourceUrl, setSourceUrl] = useState(existingProduct?.source_url || '');

  // Background Extraction Logic
  useEffect(() => {
    if (shouldExtract && imageUri) {
      performExtraction();
    }
  }, []);

  const performExtraction = async () => {
    if (!imageUri) return;
    setIsExtracting(true);
    try {
      let data;
      if (debugSimulate) {
        await new Promise(r => setTimeout(r, 2000));
        data = {
          product_name: "Simulated Product",
          category: "Demo",
          ingredients: ["Alpha", "Beta", "Gamma"],
          notes: "This is a simulated result for UI testing.",
          raw_text: "DEBUG MODE"
        };
      } else {
        data = await extractProductData(imageUri);
      }
      
      setName(data.product_name);
      setCategory(data.category);
      setIngredients(Array.isArray(data.ingredients) ? data.ingredients.join(', ') : (data.ingredients || ''));
      setNotes(data.notes);
      setRawText(data.raw_text || '');
      triggerHaptic('success');
    } catch (e: any) {
      console.error("Extraction failed", e);
      Alert.alert("Extraction Failed", e.message || "Could not extract data from image.");
    } finally {
      setIsExtracting(false);
    }
  };

  const [isMedicine, setIsMedicine] = useState(existingProduct?.is_medicine || false);
  const [dosage, setDosage] = useState(existingProduct?.dosage || '');
  const [frequency, setFrequency] = useState(existingProduct?.frequency || '');
  const [duration, setDuration] = useState(existingProduct?.duration || '');

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    triggerHaptic('success');
    Alert.alert('Copied', 'Linked copied to clipboard');
  };

  const triggerHaptic = (type: 'success' | 'light' | 'medium' = 'medium') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });
      if (!result.canceled) {
        setSourceUrl(result.assets[0].uri);
        triggerHaptic('light');
      }
    } catch (err) {
      console.warn('Doc pick error', err);
    }
  };

  const handleDelete = async () => {
    if (!existingProduct) return;
    Alert.alert("Delete Product?", "This product will be removed from your context.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          await deleteProduct(existingProduct.id, profileId, projectId);
          navigation.goBack();
        } 
      }
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    triggerHaptic('success');
    
    const productPayload = {
      profile_id: profileId,
      project_id: projectId,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      ingredients: ingredients.trim(),
      notes: notes.trim(),
      image_uri: imageUri || existingProduct?.image_uri,
      raw_text: rawText.trim(),
      source_url: sourceUrl.trim(),
      is_medicine: isMedicine,
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      created_at: existingProduct?.created_at || Date.now()
    };

    if (existingProduct) {
      await updateProduct({ ...productPayload, id: existingProduct.id });
    } else {
      await addProduct(productPayload);
    }
    
    navigation.goBack(); 
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <MaxContentWidth>
        
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{existingProduct ? 'Edit Details' : 'Review Data'}</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              {existingProduct ? 'Update product intelligence.' : 'Verify extracted intelligence.'}
            </Text>
          </View>
          {existingProduct && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Trash2 color="#FF3B30" size={24} />
            </TouchableOpacity>
          )}
        </View>

        {(imageUri || existingProduct?.image_uri) && (
          <AppCard colors={colors} style={styles.imageCard}>
            <Image source={{ uri: imageUri || existingProduct?.image_uri }} style={styles.previewImage} resizeMode="cover" />
          </AppCard>
        )}

        <SectionHeader title="Product Identity" colors={colors} />
         <AppCard colors={colors} style={styles.inputCard}>
          {isExtracting ? (
            <Shimmer width={width - 64} height={24} style={{ margin: 12 }} />
          ) : (
            <TextInput 
              style={[styles.input, { color: colors.text }]} 
              value={name} 
              onChangeText={setName} 
              placeholder="Product Name" 
              placeholderTextColor={colors.subtext}
            />
          )}
        </AppCard>

        <SectionHeader title="Classification" colors={colors} />
        <AppCard colors={colors} style={styles.inputCard}>
          <View style={styles.medicineToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.medicineToggleLabel, { color: colors.text }]}>Medicine Mode</Text>
              <Text style={[styles.medicineToggleSub, { color: colors.subtext }]}>Track dosage & frequency</Text>
            </View>
            <Switch 
              value={isMedicine}
              onValueChange={(val) => {
                setIsMedicine(val);
                triggerHaptic('light');
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : (isMedicine ? '#fff' : '#f4f3f4')}
            />
          </View>

          {isMedicine && (
            <View style={styles.medicineFields}>
              <View style={styles.medicineInputRow}>
                <View style={styles.medicineField}>
                  <Text style={styles.fieldLabel}>Dosage</Text>
                  <TextInput 
                    style={[styles.smallInput, { color: colors.text }]} 
                    value={dosage} 
                    onChangeText={setDosage} 
                    placeholder="500mg" 
                    placeholderTextColor={colors.subtext}
                  />
                </View>
                <View style={styles.medicineField}>
                  <Text style={styles.fieldLabel}>Frequency</Text>
                  <TextInput 
                    style={[styles.smallInput, { color: colors.text }]} 
                    value={frequency} 
                    onChangeText={setFrequency} 
                    placeholder="2x daily" 
                    placeholderTextColor={colors.subtext}
                  />
                </View>
              </View>
              <View style={styles.medicineField}>
                <Text style={styles.fieldLabel}>Duration</Text>
                <TextInput 
                  style={[styles.smallInput, { color: colors.text }]} 
                  value={duration} 
                  onChangeText={setDuration} 
                  placeholder="7 days" 
                  placeholderTextColor={colors.subtext}
                />
              </View>
            </View>
          )}

          <View style={{ height: 12 }} />
          {isExtracting ? (
            <Shimmer width={width - 64} height={24} style={{ margin: 12 }} />
          ) : (
            <TextInput 
              style={[styles.input, { color: colors.text }]} 
              value={category} 
              onChangeText={setCategory} 
              placeholder="e.g. Cleanser, Supplement" 
              placeholderTextColor={colors.subtext}
            />
          )}
        </AppCard>

        <SectionHeader title="Core Description" colors={colors} />
        <AppCard colors={colors} style={styles.inputCard}>
          <TextInput 
            style={[styles.input, { color: colors.text }]} 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Brief product description" 
            placeholderTextColor={colors.subtext}
            multiline
          />
        </AppCard>

        <SectionHeader title="Composition / Ingredients" colors={colors} />
        <AppCard colors={colors} style={styles.inputCardLarge}>
          {isExtracting ? (
            <View style={{ padding: 12 }}>
              <Shimmer width={width - 80} height={16} style={{ marginBottom: 8 }} />
              <Shimmer width={width - 120} height={16} style={{ marginBottom: 8 }} />
              <Shimmer width={width - 100} height={16} />
            </View>
          ) : (
            <TextInput 
              style={[styles.textArea, { color: colors.text }]} 
              value={ingredients} 
              onChangeText={setIngredients} 
              multiline 
              placeholder="Extracted ingredients..." 
              placeholderTextColor={colors.subtext}
            />
          )}
        </AppCard>

        <SectionHeader title="Intelligence Notes" colors={colors} />
        <AppCard colors={colors} style={styles.inputCardLarge}>
          <TextInput 
            style={[styles.textArea, { color: colors.text }]} 
            value={notes} 
            onChangeText={setNotes} 
            multiline 
            placeholder="Usage instructions & AI tips..." 
            placeholderTextColor={colors.subtext}
          />
        </AppCard>

        <SectionHeader title="Documents & Research" colors={colors} />
        <View style={styles.documentRow}>
          <TouchableOpacity onPress={pickDocument} style={{ flex: 1 }}>
            <AppCard colors={colors} style={styles.pickerCard}>
              <View style={styles.pickerInner}>
                <FileText color={colors.primary} size={24} />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={[styles.pickerTitle, { color: colors.text }]}>
                    {sourceUrl ? 'Document Attached' : 'Attach PDF/Document'}
                  </Text>
                  <Text style={[styles.pickerSub, { color: colors.subtext }]} numberOfLines={1}>
                    {sourceUrl || 'Select a product guide or datasheet'}
                  </Text>
                </View>
              </View>
            </AppCard>
          </TouchableOpacity>
          {sourceUrl ? (
            <TouchableOpacity 
              onPress={() => handleCopy(sourceUrl)} 
              style={[styles.copyIconBtn, { backgroundColor: colors.overlay, borderColor: colors.border }]}
            >
              <Copy size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {existingProduct && (
           <>
            <SectionHeader title="Raw Extracted Text" colors={colors} />
            <AppCard colors={colors} style={styles.inputCardLarge}>
              <Text style={[styles.rawLabel, { color: colors.subtext }]}>Audit Trail</Text>
              <TextInput 
                style={[styles.textAreaSmall, { color: colors.subtext }]} 
                value={rawText} 
                onChangeText={setRawText} 
                multiline 
                editable={false}
              />
            </AppCard>
          </>
        )}

        <View style={{ height: 120 }} />
        </MaxContentWidth>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <MaxContentWidth>
          <PrimaryButton 
            title={existingProduct ? "Update Context" : "Save to Context"} 
            onPress={handleSave} 
            colors={colors}
            disabled={!name.trim()}
            icon={existingProduct ? <Save color="#fff" size={20} /> : <Check color="#fff" size={20} />}
          />
        </MaxContentWidth>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  header: { flex: 1 },
  deleteBtn: { padding: 8 },
  title: { ...Typography.h1 },
  subtitle: { ...Typography.subheadline, fontWeight: '600', marginTop: 4 },
  imageCard: { padding: 4, marginBottom: 20 },
  previewImage: { width: '100%', height: 220, borderRadius: 16 },
  inputCard: { paddingHorizontal: 16, paddingVertical: 4 },
  inputCardLarge: { paddingHorizontal: 16, paddingVertical: 12 },
  pickerCard: { padding: 16 },
  pickerInner: { flexDirection: 'row', alignItems: 'center' },
  pickerTitle: { fontSize: 16, fontWeight: '700' },
  pickerSub: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  input: { fontSize: 16, fontWeight: '700', paddingVertical: 12 },
  textArea: { fontSize: 15, fontWeight: '600', minHeight: 80, textAlignVertical: 'top' },
  textAreaSmall: { fontSize: 12, fontWeight: '500', maxHeight: 100, textAlignVertical: 'top' },
  rawLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  medicineToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  medicineToggleLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  medicineToggleSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  medicineFields: {
    paddingTop: 16,
    gap: 12,
  },
  medicineInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  medicineField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  smallInput: {
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 10,
  },
  documentRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  copyIconBtn: {
    width: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
