import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { 
  Activity, 
  ChevronLeft, 
  Save, 
  FileText, 
  Plus, 
  Trash2, 
  Thermometer, 
  Droplet, 
  AlertCircle,
  Stethoscope,
  Pill,
  Upload
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useStore } from '../store/useStore';
import { 
  GlassCard, 
  PremiumButton, 
  GradientBackground, 
  Spacing, 
  FadeInView 
} from '../components/PremiumComponents';
import { Colors } from '../theme';
import { HealthRecord } from '../types';

const HealthProfileScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { profileId } = route.params;
  const { profiles, updateProfile, health_records, addHealthRecord, deleteHealthRecord } = useStore();
  
  const profile = profiles.find(p => p.id === profileId);
  const records = health_records[profileId] || [];

  const [formData, setFormData] = useState({
    age: profile?.age || '',
    height: profile?.height || '',
    weight: profile?.weight || '',
    blood_group: profile?.blood_group || '',
    allergies: profile?.allergies || '',
    healthIssues: profile?.healthIssues || '',
    medicines: profile?.medicines || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!profile) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileId, formData);
      Alert.alert('Success', 'Health profile updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRecord = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        Alert.prompt(
          'Record Title',
          'Enter a name for this record (e.g., Blood Test Mar 2024)',
          async (title) => {
            if (!title) return;
            
            await addHealthRecord({
              profile_id: profileId,
              title: title,
              type: asset.mimeType?.includes('pdf') ? 'prescription' : 'lab_report',
              file_uri: asset.uri,
              created_at: Date.now(),
            });
            Alert.alert('Success', 'Record added');
          }
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleDeleteRecord = (id: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to remove this health record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteHealthRecord(id, profileId) 
        }
      ]
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft color={Colors.light.text} size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Profile</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveIcon}
          >
            <Save color={isSaving ? Colors.light.subtext : Colors.light.primary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FadeInView delay={100}>
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Activity size={20} color={Colors.light.primary} />
                <Text style={styles.sectionTitle}>Biometrics</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                    placeholder="e.g. 28"
                    placeholderTextColor={Colors.light.subtext}
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Blood Group</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.blood_group}
                    onChangeText={(text) => setFormData({ ...formData, blood_group: text })}
                    placeholder="e.g. O+"
                    placeholderTextColor={Colors.light.subtext}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Height</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.height}
                    onChangeText={(text) => setFormData({ ...formData, height: text })}
                    placeholder="e.g. 175cm"
                    placeholderTextColor={Colors.light.subtext}
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Weight</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.weight}
                    onChangeText={(text) => setFormData({ ...formData, weight: text })}
                    placeholder="e.g. 70kg"
                    placeholderTextColor={Colors.light.subtext}
                  />
                </View>
              </View>
            </GlassCard>
          </FadeInView>

          <Spacing size="m" />

          <FadeInView delay={200}>
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <AlertCircle size={20} color={Colors.light.primary} />
                <Text style={styles.sectionTitle}>Medical History</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Allergies</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.allergies}
                  onChangeText={(text) => setFormData({ ...formData, allergies: text })}
                  placeholder="Known allergies..."
                  multiline
                  placeholderTextColor={Colors.light.subtext}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Chronic Conditions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.healthIssues}
                  onChangeText={(text) => setFormData({ ...formData, healthIssues: text })}
                  placeholder="Any long-term conditions..."
                  multiline
                  placeholderTextColor={Colors.light.subtext}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Regular Medications</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.medicines}
                  onChangeText={(text) => setFormData({ ...formData, medicines: text })}
                  placeholder="Medicines you take daily..."
                  multiline
                  placeholderTextColor={Colors.light.subtext}
                />
              </View>
            </GlassCard>
          </FadeInView>

          <Spacing size="m" />

          <FadeInView delay={300}>
            <View style={styles.recordsHeader}>
              <Text style={styles.sectionTitle}>Health Records</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
                <Plus size={20} color={Colors.light.background} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {records.length === 0 ? (
              <View style={styles.emptyRecords}>
                <FileText size={48} color={Colors.light.subtext} strokeWidth={1} />
                <Text style={styles.emptyText}>No records added yet</Text>
              </View>
            ) : (
              records.map((record) => (
                <GlassCard key={record.id} style={styles.recordCard}>
                  <View style={styles.recordIcon}>
                    <FileText size={20} color={Colors.light.primary} />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDate}>
                      {new Date(record.created_at).toLocaleDateString()} • {record.type.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteRecord(record.id)}>
                    <Trash2 size={20} color={Colors.light.error} />
                  </TouchableOpacity>
                </GlassCard>
              ))
            )}
          </FadeInView>

          <Spacing size="xl" />
          <PremiumButton
            title={isSaving ? "Saving..." : "Save All Changes"}
            onPress={handleSave}
            loading={isSaving}
            icon={<Save size={20} color={Colors.light.background} />}
          />
          <Spacing size="xl" />
        </ScrollView>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  saveIcon: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    color: Colors.light.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyRecords: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    color: Colors.light.subtext,
    fontSize: 16,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(64, 123, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  recordDate: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: 2,
  },
});

export default HealthProfileScreen;
