import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  useColorScheme, 
  TextInput,
  Platform,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { Colors, Typography, Spacing } from '../theme';
import { AppCard, SectionHeader, FadeInView } from '../components/PremiumComponents';
import { Package, Search, Filter, ChevronRight, Box, FileText, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const EMPTY_ARRAY: any[] = [];

export default function ProductsScreen() {
  const navigation = useNavigation<any>();
  const profiles = useStore(state => state.profiles);
  const activeProfile = profiles[0];
  const allProducts = useStore(state => activeProfile ? (state.allProducts[activeProfile.id] || EMPTY_ARRAY) : EMPTY_ARRAY);
  const loadAllProducts = useStore(state => state.loadAllProducts);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'info'>('all');

  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    if (activeProfile) {
      loadAllProducts(activeProfile.id);
    }
  }, [activeProfile]);

  const filteredData = useMemo(() => {
    return allProducts.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'products' && item.category !== 'Information') ||
                        (activeTab === 'info' && item.category === 'Information');
      return matchesSearch && matchesTab;
    });
  }, [allProducts, searchQuery, activeTab]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={styles.itemContainer}
      onPress={() => {
        triggerHaptic();
        navigation.navigate('ProductReview', { 
          profileId: activeProfile?.id || '', 
          projectId: item.project_id || '', 
          product: item,
          imageUri: undefined 
        });
      }}
    >
      <AppCard colors={colors} style={styles.itemCard}>
        <View style={[styles.itemIconBox, { backgroundColor: colors.overlay }]}>
          {item.category === 'Information' ? (
            <Info color={colors.secondary} size={24} />
          ) : (
            <Box color={colors.primary} size={24} />
          )}
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.itemSub, { color: colors.subtext }]} numberOfLines={1}>
            {item.category || 'Legacy Product'} • {new Date(item.created_at || Date.now()).toLocaleDateString()}
          </Text>
        </View>
        <ChevronRight color={colors.border} size={20} />
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Products & Assets</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Your unified intelligence library.</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search color={colors.subtext} size={20} />
        <TextInput 
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search products, info, assets..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => triggerHaptic()}>
          <Filter color={colors.primary} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['all', 'products', 'info'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => { triggerHaptic(); setActiveTab(tab); }}
            style={[
              styles.tab, 
              activeTab === tab && { backgroundColor: colors.primary }
            ]}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === tab ? '#fff' : colors.subtext }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList 
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <FadeInView delay={200} style={styles.emptyContainer}>
            <AppCard colors={colors} style={styles.emptyCard}>
              <Package size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.subtext }]}>
                {searchQuery ? "No matches found." : "Your library is empty. Add your first product or asset to build context."}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: colors.primary }]}
                  onPress={() => { triggerHaptic(); navigation.navigate('UnifiedAdd' as any); }}
                >
                  <Text style={styles.addBtnText}>Add Content Now</Text>
                </TouchableOpacity>
              )}
            </AppCard>
          </FadeInView>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { ...Typography.h1, fontSize: 32 },
  subtitle: { ...Typography.subheadline, fontWeight: '600', marginTop: 4 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    paddingHorizontal: 16, 
    height: 50, 
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 20
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '600' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  tab: { 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: 'transparent' 
  },
  tabText: { fontSize: 14, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  itemContainer: { marginBottom: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  itemIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  itemContent: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 17, fontWeight: '700' },
  itemSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyCard: { padding: 40, alignItems: 'center', width: width - 40 },
  emptyText: { ...Typography.body, marginTop: 16, textAlign: 'center', lineHeight: 22 },
  addBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' }
});
