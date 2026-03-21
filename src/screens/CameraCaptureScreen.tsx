import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  Alert, 
  Platform,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { preprocessImage, extractProductData } from '../services/ocrService';
import { RootStackParamList } from '../navigation/types';
import { X, Camera, RefreshCw, Sparkles, Check } from 'lucide-react-native';
import { Colors, Typography } from '../theme';
import { PrimaryButton } from '../components/PremiumComponents';

const { width } = Dimensions.get('window');

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CameraCapture'>;
type CameraScreenRouteProp = RouteProp<RootStackParamList, 'CameraCapture'>;

export default function CameraCaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const route = useRoute<CameraScreenRouteProp>();
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const { profileId, projectId } = route.params;

  const triggerHaptic = (type: 'success' | 'light' | 'medium' = 'medium') => {
    if (Platform.OS !== 'web') {
      if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Prompt Profile needs camera access to digitize your experiences.</Text>
        <PrimaryButton title="Grant Permission" onPress={requestPermission} colors={Colors.light} />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      triggerHaptic('medium');
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (photo) setPhotoUri(photo.uri);
    }
  };

  const analyzePhoto = async () => {
    if (!photoUri) return;
    setIsAnalyzing(true);
    triggerHaptic('medium');
    try {
      const processedUri = await preprocessImage(photoUri);
      
      triggerHaptic('success');
      // Navigate immediately - extraction will happen on the next screen
      navigation.replace('ProductReview', { 
        profileId, 
        projectId, 
        imageUri: processedUri, 
        shouldExtract: true 
      });
    } catch (error: any) {
      console.error('Preprocessing Error:', error);
      Alert.alert('Error', 'Failed to process image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (photoUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
        {isAnalyzing && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.overlayText}>Extracting Intelligence...</Text>
          </View>
        )}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.smallBtn, { backgroundColor: '#333' }]} 
            onPress={() => { triggerHaptic('light'); setPhotoUri(null); }}
            disabled={isAnalyzing}
          >
            <RefreshCw color="#fff" size={20} />
            <Text style={styles.smallBtnText}>Retake</Text>
          </TouchableOpacity>
          
          <PrimaryButton 
            title="Analyze" 
            onPress={analyzePhoto} 
            colors={Colors.dark} 
            disabled={isAnalyzing}
            style={{ flex: 1, marginLeft: 16 }}
            icon={<Sparkles color="#fff" size={20} />}
          />
        </View>

        {__DEV__ && (
          <TouchableOpacity 
            onPress={async () => {
              navigation.replace('ProductReview', { 
                profileId, 
                projectId, 
                imageUri: photoUri, 
                shouldExtract: true,
                debugSimulate: true
              });
            }}
            style={{ position: 'absolute', top: 60, right: 20, backgroundColor: 'rgba(50,50,50,0.8)', padding: 10, borderRadius: 12 }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>SIMULATE</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} />
      
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.guideContainer}>
             <Text style={styles.guideText}>Center the product label</Text>
          </View>
        </View>
        
        <View style={styles.cameraUI}>
          {/* Scan Guide Frame */}
          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanLabel}>Align product label here</Text>
          </View>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture} activeOpacity={0.7}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  permissionText: { color: '#fff', ...Typography.body, textAlign: 'center', marginBottom: 24, paddingHorizontal: 40 },
  previewContainer: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  overlayText: { color: '#fff', marginTop: 16, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  controls: { flexDirection: 'row', padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, alignItems: 'center', backgroundColor: '#000' },
  smallBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, gap: 8 },
  smallBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  camera: { flex: 1 },
  cameraHeader: { padding: 20, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
  closeBtn: { padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24 },
  guideContainer: { flex: 1, alignItems: 'center', marginRight: 44 },
  guideText: { color: '#fff', fontSize: 13, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  cameraUI: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingBottom: 40 },
  scanFrameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  scanFrame: { 
    width: width * 0.7, 
    height: width * 0.9, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.5)', 
    borderRadius: 24,
    borderStyle: 'dashed'
  },
  scanLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginTop: 12, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  captureButton: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10 }
});
