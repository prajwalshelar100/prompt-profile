import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  ScrollView, 
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
import { Star, CheckCircle, XCircle, MinusCircle, Save, Check, X } from 'lucide-react-native';
import { AppCard, SectionHeader, PrimaryButton } from '../components/PremiumComponents';

type ExperienceNavProp = NativeStackNavigationProp<RootStackParamList, 'ExperienceInput'>;
type ExperienceRouteProp = RouteProp<RootStackParamList, 'ExperienceInput'>;

export default function ExperienceInputScreen() {
  const route = useRoute<ExperienceRouteProp>();
  const navigation = useNavigation<ExperienceNavProp>();
  const { productId, projectId } = route.params;

  const product = useStore(state => {
     const projProducts = state.products[projectId] || [];
     return projProducts.find(p => p.id === productId);
  });

  const addExperience = useStore(state => state.addExperience);

  const [text, setText] = useState('');
  const [resultType, setResultType] = useState<'worked' | 'not_worked' | 'neutral'>('neutral');
  const [sideEffects, setSideEffects] = useState('');
  const [rating, setRating] = useState(3);
  const [reuse, setReuse] = useState<'yes' | 'no'>('yes');
  const [isSaving, setIsSaving] = useState(false);

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

  if (!product) return null;

  const handleSave = async () => {
    if (!text.trim()) return Alert.alert('Error', 'Please describe your experience.');
    setIsSaving(true);
    triggerHaptic('success');
    try {
      await addExperience({
        product_id: productId,
        experience_text: text.trim(),
        result_type: resultType,
        side_effects: sideEffects.trim(),
        rating,
        reuse_decision: reuse,
        created_at: Date.now()
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerSub, { color: colors.subtext }]}>Experience Log</Text>
          <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
        </View>

        <SectionHeader title="Immediate Outcome" colors={colors} />
        <View style={styles.typeRow}>
          <TypeButton 
            label="Worked" 
            icon={<CheckCircle size={18} />} 
            active={resultType === 'worked'} 
            activeColor={colors.success} 
            onPress={() => { triggerHaptic('light'); setResultType('worked'); }} 
            colors={colors}
          />
          <TypeButton 
            label="Neutral" 
            icon={<MinusCircle size={18} />} 
            active={resultType === 'neutral'} 
            activeColor={colors.subtext} 
            onPress={() => { triggerHaptic('light'); setResultType('neutral'); }} 
            colors={colors}
          />
          <TypeButton 
            label="Failed" 
            icon={<XCircle size={18} />} 
            active={resultType === 'not_worked'} 
            activeColor={colors.error} 
            onPress={() => { triggerHaptic('light'); setResultType('not_worked'); }} 
            colors={colors}
          />
        </View>

        <SectionHeader title="Experience Details" colors={colors} />
        <AppCard colors={colors} style={styles.inputCard}>
          <TextInput
            style={[styles.textArea, { color: colors.text }]}
            placeholder="What happened? When did you notice results?"
            placeholderTextColor={colors.subtext}
            multiline
            value={text}
            onChangeText={setText}
          />
        </AppCard>

        <SectionHeader title="Unexpected Side Effects" colors={colors} />
        <AppCard colors={colors} style={styles.inputCardSmall}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Irritation, redness, etc."
            placeholderTextColor={colors.subtext}
            value={sideEffects}
            onChangeText={setSideEffects}
          />
        </AppCard>

        <SectionHeader title="Global Rating" colors={colors} />
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map(s => (
            <TouchableOpacity key={s} onPress={() => { triggerHaptic('light'); setRating(s); }}>
              <Star 
                color={s <= rating ? "#FFCC00" : colors.border} 
                fill={s <= rating ? "#FFCC00" : "transparent"} 
                size={36} 
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader title="Repeat Decision" colors={colors} />
        <View style={styles.reuseRow}>
           <TouchableOpacity 
             style={[styles.reuseBtn, { backgroundColor: reuse === 'yes' ? colors.success : colors.overlay }]} 
             onPress={() => { triggerHaptic('light'); setReuse('yes'); }}
           >
             <Check color={reuse === 'yes' ? '#fff' : colors.subtext} size={20} />
             <Text style={[styles.reuseText, { color: reuse === 'yes' ? '#fff' : colors.subtext }]}>Yes, keep in routine</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[styles.reuseBtn, { backgroundColor: reuse === 'no' ? colors.error : colors.overlay }]} 
             onPress={() => { triggerHaptic('light'); setReuse('no'); }}
           >
             <X color={reuse === 'no' ? '#fff' : colors.subtext} size={20} />
             <Text style={[styles.reuseText, { color: reuse === 'no' ? '#fff' : colors.subtext }]}>No, remove/replace</Text>
           </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <PrimaryButton 
          title={isSaving ? 'Digitizing...' : 'Log Experience Memory'} 
          onPress={handleSave} 
          colors={colors}
          disabled={isSaving || !text.trim()}
          icon={<Save color="#fff" size={20} />}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function TypeButton({ label, icon, active, activeColor, onPress, colors }: any) {
  return (
    <TouchableOpacity 
      style={[
        styles.typeBtn, 
        { backgroundColor: active ? activeColor : colors.overlay, borderColor: active ? activeColor : 'transparent' }
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {React.cloneElement(icon, { color: active ? '#fff' : colors.subtext })}
      <Text style={[styles.typeBtnText, { color: active ? '#fff' : colors.subtext }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  headerSub: { ...Typography.caption, textTransform: 'uppercase', fontWeight: '800', letterSpacing: 1 },
  productName: { ...Typography.h1, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  typeBtnText: { marginLeft: 8, fontSize: 13, fontWeight: '700' },
  inputCard: { padding: 4, marginTop: 8 },
  inputCardSmall: { paddingHorizontal: 16, paddingVertical: 4, marginTop: 8 },
  textArea: { fontSize: 16, fontWeight: '600', height: 120, textAlignVertical: 'top', padding: 12 },
  input: { fontSize: 16, fontWeight: '600', paddingVertical: 12 },
  starRow: { flexDirection: 'row', marginTop: 8 },
  reuseRow: { gap: 12, marginTop: 8 },
  reuseBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, gap: 12 },
  reuseText: { fontSize: 15, fontWeight: '700' },
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
