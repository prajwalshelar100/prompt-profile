import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Platform,
  useColorScheme,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { Colors, Spacing, Typography } from '../theme';
import { AppCard, SectionHeader, ListItem, PrimaryButton, FadeInView } from '../components/PremiumComponents';
import { 
  User, 
  Plus, 
  ChevronRight, 
  Briefcase,
  History,
  Trash2,
  Edit2,
  Check,
  X,
  Code,
  Heart,
  ShoppingCart,
  Zap,
  Star,
  Coffee
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const ICONS: Record<string, any> = {
  'user': User,
  'briefcase': Briefcase,
  'code': Code,
  'heart': Heart,
  'shopping-cart': ShoppingCart,
  'zap': Zap,
  'star': Star,
  'coffee': Coffee
};

export default function ProfilesScreen() {
  const navigation = useNavigation<any>();
  const profiles = useStore(state => state.profiles);
  const deleteProfile = useStore(state => state.deleteProfile);
  const updateProfile = useStore(state => state.updateProfile);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);

  const themeMode = useThemeStore(state => state.theme);
  const systemColorScheme = useColorScheme();
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (Platform.OS !== 'web') {
      const style = type === 'light' ? Haptics.ImpactFeedbackStyle.Light : 
                    type === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : 
                    Haptics.ImpactFeedbackStyle.Heavy;
      Haptics.impactAsync(style);
    }
  };

  const handleSaveName = async (id: string) => {
    if (!editName.trim()) return setIsEditing(null);
    triggerHaptic('medium');
    await updateProfile(id, { name: editName.trim() });
    setIsEditing(null);
  };

  const handleDelete = (id: string) => {
    triggerHaptic('heavy');
    Alert.alert(
      "Delete Profile?",
      "All associated data will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteProfile(id) }
      ]
    );
  };

  const setIcon = async (id: string, iconName: string) => {
    triggerHaptic('medium');
    await updateProfile(id, { icon: iconName });
    setShowIconPicker(null);
  };

  const renderProfileItem = ({ item }: { item: any }) => {
    const IconComp = ICONS[item.icon] || User;
    const editingThis = isEditing === item.id;

    return (
      <AppCard colors={colors} style={styles.profileCard}>
        <View style={styles.profileInfo}>
          <TouchableOpacity 
            style={[styles.avatar, { backgroundColor: colors.overlay }]}
            onPress={() => { triggerHaptic(); setShowIconPicker(item.id); }}
          >
            <IconComp color={colors.primary} size={28} />
            <View style={styles.editIconBadge}>
              <Edit2 size={8} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ flex: 1 }} 
            onPress={() => { triggerHaptic(); navigation.navigate('ProfileDetail', { profileId: item.id }); }}
          >
            {editingThis ? (
              <View style={styles.editRow}>
                <TextInput 
                  style={[styles.editInput, { color: colors.text, backgroundColor: colors.overlay }]}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleSaveName(item.id)} style={styles.saveBtn}>
                  <Check color="#34C759" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(null)}>
                  <X color={colors.subtext} size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, { color: colors.text }]}>{item.name}</Text>
                <TouchableOpacity onPress={() => { triggerHaptic(); setEditName(item.name); setIsEditing(item.id); }}>
                  <Edit2 color={colors.subtext} size={14} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={[styles.profileDesc, { color: colors.subtext }]}>
              {item.description || 'Intelligence Sandbox'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.trashBtn}>
            <Trash2 color={colors.error} opacity={0.6} size={20} />
          </TouchableOpacity>
        </View>
      </AppCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Intelligence Profiles</Text>
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => { triggerHaptic('medium'); navigation.navigate('Onboarding' as any); }}
        >
          <Plus color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={profiles}
        keyExtractor={item => item.id}
        renderItem={renderProfileItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <User color={colors.subtext} size={64} opacity={0.3} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No profiles found. Create your first intelligence sandbox.</Text>
          </View>
        }
      />

      <Modal visible={!!showIconPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <AppCard colors={colors} style={styles.iconPickerCard}>
            <SectionHeader title="Choose Icon" colors={colors} />
            <View style={styles.iconGrid}>
              {Object.keys(ICONS).map(name => {
                const Icon = ICONS[name];
                return (
                  <TouchableOpacity 
                    key={name}
                    style={[styles.iconOption, { backgroundColor: colors.overlay }]}
                    onPress={() => showIconPicker && setIcon(showIconPicker, name)}
                  >
                    <Icon color={colors.primary} size={28} />
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity 
              style={[styles.closeModal, { backgroundColor: colors.border }]} 
              onPress={() => setShowIconPicker(null)}
            >
              <Text style={{ fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </AppCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 100 },
  profileCard: { marginBottom: 16, padding: 16 },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 16, position: 'relative' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileDesc: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editInput: { flex: 1, height: 36, borderRadius: 8, paddingHorizontal: 10, fontSize: 16, fontWeight: '600' },
  saveBtn: { padding: 4 },
  trashBtn: { padding: 10 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { marginTop: 16, fontSize: 15, fontWeight: '600', textAlign: 'center', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  iconPickerCard: { width: '85%', padding: 20 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 10, justifyContent: 'center' },
  iconOption: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  closeModal: { marginTop: 20, paddingVertical: 12, alignItems: 'center', borderRadius: 12 }
});
