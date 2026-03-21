import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { ExtractedProductData } from '../types';
import { analyzeProductImage, compressImage } from './aiService';
import { getApiKey } from './secureStore';

export const preprocessImage = async (imageUri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (e) {
    console.error('Image preprocessing failed', e);
    return imageUri;
  }
};

/**
 * Main OCR/Analysis flow. 
 * Prioritizes:
 * 1. Google ML Kit (FREE FOREVER, On-Device, Native and APK only) - Mandatory Primary
 * 2. Google Gemini (Free Tier API, Online, Smart Analysis Fallback)
 * 3. OpenAI (Paid API, Online, Hybrid Fallback)
 * 4. Tesseract.js (Free, Web only)
 */
export const extractProductData = async (imageUri: string): Promise<ExtractedProductData> => {
  let mlKitError = null;

  // 1. Primary for Mobile: Google ML Kit (Free & On-Device)
  if (Platform.OS !== 'web') {
    try {
      const TextRecognition = require('@react-native-ml-kit/text-recognition').default;
      console.log("Attempting Google ML Kit extraction...");
      const result = await TextRecognition.recognize(imageUri);
      if (result.text && result.text.length > 5) {
        return parseOfflineData(result.text);
      }
    } catch (e: any) {
      console.warn("ML Kit failed:", e.message);
      mlKitError = e.message;
    }
    
    // Fallback: If ML Kit failed on mobile, we strictly allow manual entry as requested 
    // to keep it "Free Tier Forever" and simple.
    throw new Error("OCR extraction failed. Please enter details manually.");
  }
  
  // High Quality AI Vision (Web/Cloud Fallback if enabled)
  // ... (keeping code for internal use if needed, but the main entry point is constrained)

  // 3. Fallback for Web: Tesseract.js (Works in browser)
  if (Platform.OS === 'web') {
    try {
      const Tesseract = require('tesseract.js');
      console.log("Attempting local Tesseract (Web) fallback...");
      const { data: { text } } = await Tesseract.recognize(imageUri, 'eng');
      return parseOfflineData(text);
    } catch (error) {
      console.error("Web Tesseract Failed:", error);
    }
  }

  // Final fallback: Let user enter manually with a helpful message
  throw new Error(
    mlKitError && !Platform.OS.includes('web') 
      ? "AI Extraction failed. Please set a Gemini API key in Settings for smart analysis, or enter details manually below."
      : "OCR is currently unavailable. Please enter project details manually."
  );
};

const parseOfflineData = (rawText: string): ExtractedProductData => {
  const lowerText = rawText.toLowerCase();
  
  let category = "Misc";
  if (lowerText.includes("cream") || lowerText.includes("lotion")) category = "Cream/Lotion";
  if (lowerText.includes("serum")) category = "Serum";
  if (lowerText.includes("wash") || lowerText.includes("cleanser")) category = "Cleanser";
  
  let ingredients = "";
  const ingMatch = rawText.match(/ingredients?[\s\S]{0,150}/i);
  if (ingMatch) {
    ingredients = ingMatch[0].replace(/ingredients?:?/i, '').trim().substring(0, 100);
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 3);
  const name = lines.length > 0 ? lines[0] : "Unknown (Scanned)";

  return {
    product_name: name,
    category,
    ingredients,
    notes: "Analyzed offline via OCR.",
    raw_text: rawText
  };
};
