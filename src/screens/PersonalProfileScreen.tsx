import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/themeStore';
import { Colors, Spacing, Typography } from '../theme';
import { AppCard, SectionHeader, PrimaryButton } from '../components/PremiumComponents';
import { 
  User, 
  Briefcase, 
  Activity, 
  Dumbbell, 
  Stethoscope, 
  Scale,
  ChevronLeft
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Profile } from '../types';

export default function PersonalProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { profileId } = route.params as { profileId: string };
  
  const profiles = useStore(state => state.profiles);
  const updateProfile = useStore(state => state.updateProfile);
  const themeMode = useThemeStore(state => state.theme);
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  const profile = profiles.find(p => p.id === profileId);

  if (!profile) return null;

  const [formData, setFormData] = useState<Profile>({
    ...profile
  });

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    try {
      triggerHaptic();
      await updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const renderInput = (
    label: string, 
    value: string | undefined, 
    onChange: (text: string) => void, 
    placeholder: string,
    icon: React.ReactNode,
    multiline: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: colors.overlay, 
            color: colors.text,
            height: multiline ? 100 : 50,
            textAlignVertical: multiline ? 'top' : 'center'
          }
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        multiline={multiline}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Detailed Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppCard colors={colors} style={styles.sectionCard}>
          <SectionHeader title="Professional & Basic" colors={colors} />
          {renderInput('Occupation', formData.occupation, (val) => setFormData({...formData, occupation: val}), 'e.g. Software Engineer', <Briefcase size={18} color={colors.primary} />)}
          {renderInput('Experience', formData.experience, (val) => setFormData({...formData, experience: val}), 'e.g. 5 years in Tech', <Activity size={18} color={colors.primary} />)}
          {renderInput('Age', formData.age, (val) => setFormData({...formData, age: val}), 'e.g. 28', <User size={18} color={colors.primary} />)}
        </AppCard>

        <AppCard colors={colors} style={styles.sectionCard}>
          <SectionHeader title="Physical Stats" colors={colors} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              {renderInput('Height', formData.height, (val) => setFormData({...formData, height: val}), 'e.g. 180cm', <Scale size={18} color={colors.primary} />)}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              {renderInput('Weight', formData.weight, (val) => setFormData({...formData, weight: val}), 'e.g. 75kg', <Scale size={18} color={colors.primary} />)}
            </View>
          </View>
        </AppCard>

        <AppCard colors={colors} style={styles.sectionCard}>
          <SectionHeader title="Health & Wellness" colors={colors} />
          {renderInput('Health Issues', formData.healthIssues, (val) => setFormData({...formData, healthIssues: val}), 'Any chronic conditions...', <Stethoscope size={18} color={colors.primary} />, true)}
          {renderInput('Regular Medicines', formData.medicines, (val) => setFormData({...formData, medicines: val}), 'List your medications...', <Activity size={18} color={colors.primary} />, true)}
        </AppCard>

        <AppCard colors={colors} style={styles.sectionCard}>
          <SectionHeader title="Interests" colors={colors} />
          {renderInput('Sports & Fitness', formData.sportsInterest, (val) => setFormData({...formData, sportsInterest: val}), 'Football, Gym, Yoga...', <Dumbbell size={18} color={colors.primary} />, true)}
        </AppCard>

        <PrimaryButton 
          title="Save Profile" 
          onPress={handleSave} 
          colors={colors} 
          style={styles.saveBtn}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: { marginRight: 15 },
  title: { fontSize: 24, fontWeight: '800' },
  scrollContent: { padding: 16 },
  sectionCard: { marginBottom: 20, padding: 16 },
  inputContainer: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500'
  },
  row: { flexDirection: 'row' },
  saveBtn: { marginTop: 10, marginBottom: 30 }
});
