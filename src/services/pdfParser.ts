import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ExtractedProductData } from '../types';

/**
 * Note: PDF parsing on-device without heavy native libraries is limited.
 * For this MVP, we will extract text content if possible or metadata.
 * In a real production app, one might use a cloud function or a more specialized native module.
 */
export const extractProductFromPDF = async (): Promise<ExtractedProductData> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true
    });

    if (result.canceled) {
      throw new Error('PDF selection cancelled');
    }

    const file = result.assets[0];
    
    // For now, we'll return a placeholder extraction.
    // Real PDF text extraction often requires native modules like react-native-pdf-lib
    // or a web-view based approach with pdf.js.
    
    return {
      product_name: file.name.replace('.pdf', ''),
      category: 'PDF Import',
      ingredients: 'N/A',
      notes: `Imported from PDF: ${file.name}. Size: ${file.size} bytes.`,
      raw_text: `PDF Metadata: ${file.name}`
    };
  } catch (e: any) {
    throw new Error('Failed to parse PDF: ' + e.message);
  }
};
