import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Linking, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  useColorScheme
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../theme';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react-native';
import { AppCard, PrimaryButton, SectionHeader } from '../components/PremiumComponents';

export default function ContactScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('App');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { theme: currentTheme } = useThemeStore();
  const systemColorScheme = useColorScheme();
  const isDark = currentTheme === 'system' ? systemColorScheme === 'dark' : currentTheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const triggerHaptic = (type: 'success' | 'light' = 'light') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('Required Fields', 'Please fill in all fields to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Formspree Submission
      const response = await fetch('https://formspree.io/f/shelar.prajwal.99@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          projectType,
          message,
          _subject: `New Project Request: ${projectType} from ${name}`
        })
      });
      
      triggerHaptic('success');
      
      Alert.alert(
        'Request Sent! 🚀', 
        'Thank you for reaching out. I will review your project details and get back to you shortly.',
        [{ text: 'Great!', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Submission Error', 'Could not send request. Please try WhatsApp or Email instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    triggerHaptic();
    Linking.openURL('https://wa.me/919987909499?text=Hi Prajwal, I saw your Prompt Profile app and want to discuss a project.');
  };

  const openEmail = () => {
    triggerHaptic();
    Linking.openURL('mailto:shelar.prajwal.99@gmail.com?subject=Project Inquiry');
  };

  const ProjectTypeBtn = ({ label }: { label: string }) => (
    <TouchableOpacity 
      style={[
        styles.typeBtn, 
        { borderColor: colors.border },
        projectType === label && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
      onPress={() => {
        triggerHaptic();
        setProjectType(label);
      }}
    >
      <Text style={[
        styles.typeText, 
        { color: colors.text },
        projectType === label && { color: '#fff', fontWeight: '700' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Work With Me</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Need a custom solution? Let’s build something powerful together.
          </Text>
        </View>

        <AppCard colors={colors} style={styles.formCard}>
          <Text style={[styles.label, { color: colors.text }]}>What should I call you?</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.overlay, color: colors.text, borderColor: colors.border }]} 
            placeholder="Name"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Your Email</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.overlay, color: colors.text, borderColor: colors.border }]} 
            placeholder="email@example.com"
            placeholderTextColor={colors.subtext}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Project Type</Text>
          <View style={styles.typeGrid}>
            <ProjectTypeBtn label="App" />
            <ProjectTypeBtn label="Website" />
            <ProjectTypeBtn label="AI Tool" />
            <ProjectTypeBtn label="Automation" />
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Tell me about your project</Text>
          <TextInput 
            style={[styles.textArea, { backgroundColor: colors.overlay, color: colors.text, borderColor: colors.border }]} 
            placeholder="Briefly describe your goals..."
            placeholderTextColor={colors.subtext}
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
          />

          <PrimaryButton 
            title={isSubmitting ? "Sending..." : "Send Request 🚀"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            colors={colors}
            style={{ marginTop: 24 }}
          />
        </AppCard>

        <SectionHeader title="Quick Contact" colors={colors} />
        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#25D366' }]} onPress={openWhatsApp}>
            <MessageSquare color="#fff" size={20} />
            <Text style={styles.quickBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={openEmail}>
            <Mail color="#fff" size={20} />
            <Text style={styles.quickBtnText}>Email</Text>
          </TouchableOpacity>
        </View>

        <AppCard colors={colors} style={styles.trustCard}>
          <Text style={[styles.trustTitle, { color: colors.text }]}>Why work with me?</Text>
          <TrustItem icon={<CheckCircle size={18} color={colors.success} />} text="Fast & Reliable Delivery" colors={colors} />
          <TrustItem icon={<CheckCircle size={18} color={colors.success} />} text="Modern Tech Stack (React Native, AI)" colors={colors} />
          <TrustItem icon={<CheckCircle size={18} color={colors.success} />} text="Scalable & Secure Solutions" colors={colors} />
        </AppCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TrustItem({ icon, text, colors }: any) {
  return (
    <View style={styles.trustItem}>
      {icon}
      <Text style={[styles.trustText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: 16, lineHeight: 24, marginTop: 8 },
  formCard: { padding: 20 },
  label: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginLeft: 2 },
  input: { height: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  typeText: { fontSize: 14, fontWeight: '600' },
  textArea: { height: 120, borderRadius: 16, borderWidth: 1, padding: 16, fontSize: 16, textAlignVertical: 'top' },
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 54, borderRadius: 16 },
  quickBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 10 },
  trustCard: { padding: 20 },
  trustTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  trustItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  trustText: { fontSize: 15, fontWeight: '500' }
});
