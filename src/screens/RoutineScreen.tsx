import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  useColorScheme,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Plus, Trash2, GripVertical, Check, Repeat } from 'lucide-react-native';
import { AppCard, SectionHeader, PrimaryButton } from '../components/PremiumComponents';

type RoutineNavProp = NativeStackNavigationProp<RootStackParamList, 'Routine'>;
type RoutineRouteProp = RouteProp<RootStackParamList, 'Routine'>;

export default function RoutineScreen() {
  const route = useRoute<RoutineRouteProp>();
  const navigation = useNavigation<RoutineNavProp>();
  const { projectId, routineId } = route.params;

  const products = useStore(state => state.products[projectId]) || [];
  const addRoutine = useStore(state => state.addRoutine);
  const updateRoutine = useStore(state => state.updateRoutine);
  const existingRoutine = useStore(state => 
    routineId ? (state.routines[projectId] || []).find(r => r.id === routineId) : null
  );

  const [routineName, setRoutineName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (existingRoutine) {
      setRoutineName(existingRoutine.name || '');
      setSelectedProducts(existingRoutine.products || []);
      setStartTime(existingRoutine.startTime || '');
      setDaysOfWeek(existingRoutine.daysOfWeek || []);
    }
  }, [existingRoutine]);

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

  const toggleProduct = (id: string) => {
    triggerHaptic('light');
    if (selectedProducts.includes(id)) {
      setSelectedProducts(prev => prev.filter(pid => pid !== id));
    } else {
      setSelectedProducts(prev => [...prev, id]);
    }
  };
  const toggleDay = (day: string) => {
    triggerHaptic('light');
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(prev => prev.filter(d => d !== day));
    } else {
      setDaysOfWeek(prev => [...prev, day]);
    }
  };

  const handleSave = async () => {
    if (!routineName.trim()) return Alert.alert('Error', 'Please name your routine (e.g. Morning).');
    if (selectedProducts.length === 0) return Alert.alert('Error', 'Add at least one product.');
    
    setIsSaving(true);
    triggerHaptic('success');
    try {
      if (routineId && existingRoutine) {
        await updateRoutine({
          ...existingRoutine,
          name: routineName.trim(),
          products: selectedProducts,
          startTime: startTime.trim(),
          daysOfWeek: daysOfWeek,
        });
      } else {
        await addRoutine({
          project_id: projectId,
          name: routineName.trim(),
          products: selectedProducts,
          startTime: startTime.trim(),
          daysOfWeek: daysOfWeek,
          created_at: Date.now()
        });
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderProductSelector = ({ item }: { item: any }) => {
    const isSelected = selectedProducts.includes(item.id);
    return (
      <View style={{ marginBottom: 12 }}>
        <AppCard colors={colors} style={isSelected ? { borderColor: colors.primary, borderWidth: 2 } : {}}>
          <TouchableOpacity 
            style={styles.selectorItem} 
            onPress={() => toggleProduct(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.selectorInfo}>
              <Text style={[styles.selectorName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.selectorCat, { color: colors.subtext }]}>{item.category || 'Product'}</Text>
            </View>
            <View style={[styles.checkCircle, { backgroundColor: isSelected ? colors.primary : colors.overlay }]}>
              {isSelected && <Check color="#fff" size={16} />}
            </View>
          </TouchableOpacity>
        </AppCard>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {routineId ? 'Edit Routine' : 'New Routine'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>Sequence your experience logic.</Text>
            </View>

            <SectionHeader title="Routine Identity" colors={colors} />
            <AppCard colors={colors} style={styles.inputCard}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Morning Ritual, Post-Gym"
                placeholderTextColor={colors.subtext}
                value={routineName}
                onChangeText={setRoutineName}
              />
            </AppCard>

            <SectionHeader title="Select Products in Order" colors={colors} />
          </>
        }
        renderItem={renderProductSelector}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No products available in this context. Add products to build a routine.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <PrimaryButton 
          title={isSaving ? 'Establishing...' : (routineId ? 'Update Routine' : 'Establish Routine')} 
          onPress={handleSave} 
          colors={colors}
          disabled={isSaving || !routineName.trim() || selectedProducts.length === 0}
          icon={<Repeat color="#fff" size={20} />}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { ...Typography.h1 },
  subtitle: { ...Typography.subheadline, fontWeight: '600', marginTop: 4 },
  inputCard: { padding: 4 },
  input: { fontSize: 18, fontWeight: '700', padding: 16 },
  selectorItem: { flexDirection: 'row', alignItems: 'center' },
  selectorInfo: { flex: 1 },
  selectorName: { fontSize: 16, fontWeight: '700' },
  selectorCat: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { ...Typography.body, textAlign: 'center' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1
  },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  smallInput: { padding: 12, borderRadius: 10, fontSize: 16, fontWeight: '600' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dayChip: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 12, fontWeight: '800' }
});
