import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
  TextInput,
  useColorScheme
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { Colors, Typography } from '../theme';
import { AppCard, PrimaryButton } from '../components/PremiumComponents';
import { ChevronLeft, Check, Box, Search, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type ProductPickerRouteProp = RouteProp<RootStackParamList, 'ProductPicker'>;

export default function ProductPickerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProductPickerRouteProp>();
  const { projectId, profileId } = route.params;

  const allProducts = useStore(state => state.allProducts[profileId]) || [];
  const projectProducts = useStore(state => state.products[projectId]) || [];
  const addProductsToProject = useStore(state => state.addProductsToProject);
  const loadAllProducts = useStore(state => state.loadAllProducts);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    loadAllProducts(profileId);
  }, [profileId]);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(style);
  };

  const toggleProduct = (id: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddSelected = async () => {
    if (selectedIds.length === 0) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    await addProductsToProject(projectId, selectedIds);
    navigation.goBack();
  };

  // Filter out products already in project
  const filteredLibrary = allProducts.filter(p => 
    !projectProducts.some(pp => pp.id === p.id) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity 
        onPress={() => toggleProduct(item.id)}
        activeOpacity={0.7}
        style={{ marginBottom: 12 }}
      >
        <AppCard 
          colors={colors} 
          style={[
            styles.productCard, 
            isSelected && { borderColor: colors.primary, borderWidth: 2 }
          ]}
        >
          <View style={styles.productInfo}>
            <View style={[styles.iconContainer, { backgroundColor: colors.overlay }]}>
              <Box color={colors.primary} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.productCategory, { color: colors.subtext }]}>{item.category || 'General'}</Text>
            </View>
            <View style={[
              styles.checkbox, 
              { borderColor: colors.border },
              isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}>
              {isSelected && <Check color="#fff" size={12} />}
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Product Library</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.overlay }]}>
        <Search color={colors.subtext} size={20} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search your library..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X color={colors.subtext} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredLibrary}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Box color={colors.subtext} size={48} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {searchQuery ? 'No matching products' : 'No new products in library'}
            </Text>
          </View>
        }
      />

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <PrimaryButton
          title={selectedIds.length > 0 ? `Add ${selectedIds.length} Products` : 'Select Products'}
          onPress={handleAddSelected}
          colors={colors}
          disabled={selectedIds.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 24, fontWeight: '800', marginLeft: 10 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    paddingHorizontal: 16, 
    height: 50, 
    borderRadius: 15,
    marginBottom: 10
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  list: { padding: 20, paddingBottom: 100 },
  productCard: { padding: 16 },
  productInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: '700' },
  productCategory: { fontSize: 13, marginTop: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' }
});
