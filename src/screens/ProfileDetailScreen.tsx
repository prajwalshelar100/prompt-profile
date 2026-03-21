import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme, 
  Platform 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/themeStore';
import { Colors, Typography, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Plus, Briefcase, ChevronRight, LayoutGrid } from 'lucide-react-native';
import { AppCard, SectionHeader, PrimaryButton, ListItem } from '../components/PremiumComponents';
import EmptyState from '../components/EmptyState';

type ProfileDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileDetail'>;
type ProfileDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProfileDetail'>;

export default function ProfileDetailScreen() {
  const route = useRoute<ProfileDetailScreenRouteProp>();
  const navigation = useNavigation<ProfileDetailScreenNavigationProp>();
  const { profileId } = route.params;

  const profile = useStore(state => state.profiles.find(p => p.id === profileId));
  const projects = useStore(state => state.projects[profileId]) || [];
  const loadProfileProjects = useStore(state => state.loadProfileProjects);
  
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
    loadProfileProjects(profileId);
  }, [profileId]);

  if (!profile) return null;

  const handleCreateProject = async () => {
    triggerHaptic('success');
    const newProjectId = await useStore.getState().addProject({
      profile_id: profileId,
      name: `New Context ${projects.length + 1}`,
      created_at: Date.now()
    });
    navigation.navigate('ProjectDetail', { projectId: newProjectId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.profileName, { color: colors.text }]}>{profile.name} Contexts</Text>
        <Text style={[styles.profileDesc, { color: colors.subtext }]}>
          Managing intelligence layers for {profile.name}.
        </Text>
      </View>

      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<SectionHeader title="Active Contexts" colors={colors} />}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <AppCard colors={colors}>
              <ListItem
                icon={<Briefcase color={colors.primary} size={20} />}
                title={item.name}
                subtitle={`Created ${new Date(item.created_at).toLocaleDateString()}`}
                onPress={() => { triggerHaptic(); navigation.navigate('ProjectDetail', { projectId: item.id }); }}
                colors={colors}
              />
            </AppCard>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState 
            title="No context layers" 
            description="Create project-specific contexts like 'Travel' or 'Winter Routine'." 
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <PrimaryButton 
          title="Create New Context" 
          onPress={handleCreateProject} 
          colors={colors}
          icon={<Plus color="#fff" size={20} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  profileName: { ...Typography.h1 },
  profileDesc: { ...Typography.subheadline, fontWeight: '600', marginTop: 4 },
  list: { paddingHorizontal: 20 },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 34 : 20 
  }
});
