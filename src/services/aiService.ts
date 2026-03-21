import { getApiKey, getGeminiKey } from './secureStore';
import { ExtractedProductData } from '../types';
import * as ImageManipulator from 'expo-image-manipulator';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return manipResult.base64 || '';
  } catch (e) {
    console.error('Image compression failed', e);
    return '';
  }
};

export const analyzeProductImage = async (base64Image: string): Promise<ExtractedProductData> => {
  const geminiKey = await getGeminiKey();
  const openAiKey = await getApiKey();

  if (geminiKey) {
    try {
      return await analyzeProductImageWithGemini(base64Image, geminiKey);
    } catch (e) {
      console.warn("Gemini extraction failed, trying OpenAI...", e);
    }
  }

  if (openAiKey) {
    return await analyzeProductImageWithOpenAI(base64Image, openAiKey);
  }

  throw new Error('No AI API key found. Please set Gemini or OpenAI key in Settings.');
};

const analyzeProductImageWithGemini = async (base64Image: string, apiKey: string): Promise<ExtractedProductData> => {
  const prompt = `Extract product intelligence from this image. 
  Focus on: Product Name, Brand if visible, Ingredients (especially active ones), and the primary Category (e.g., Serum, Moisturizer, Supplement).
  
  Return strictly structured JSON:
{
  "product_name": "string (Title Case)",
  "ingredients": ["string"],
  "category": "string (One word)",
  "notes": "string (short description of what it does)"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: base64Image } }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json"
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini error: ${err.error?.message || 'Unknown'}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return JSON.parse(content) as ExtractedProductData;
};

const analyzeProductImageWithOpenAI = async (base64Image: string, apiKey: string): Promise<ExtractedProductData> => {
  const prompt = `Extract product intelligence from this image. Return strictly structured JSON:
  {
    "product_name": "string",
    "ingredients": ["string"],
    "category": "string",
    "notes": "string"
  }`;

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ],
        },
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  return JSON.parse(content) as ExtractedProductData;
};

export const generatePrompt = async (context: string, mode: 'offline' | 'hybrid' | 'ai-only' | 'backend' = 'hybrid'): Promise<string> => {
  if (mode === 'offline') {
    return `[OFFLINE TEMPLATE]\nYou are an expert assistant for the Profile outlined below. I need you to analyze this structured data:\n\n${context}\n\nProvide personalized guidance based on this exact context.`;
  }

  const geminiKey = await getGeminiKey();
  const openAiKey = await getApiKey();

  const system = `You are an expert AI assistant builder specializing in constructing optimal initialization prompts.`;
  const user = `Create an expert initialization prompt for an AI assistant based strictly on this context:\n\n${context}\n\nReturn ONLY the constructed prompt string.`;

  if (geminiKey) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${user}` }] }]
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || context;
    } catch (e) {
      console.warn("Gemini prompt gen failed", e);
    }
  }

  if (openAiKey) {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || context;
  }

  return context;
};

export const generateChatResponse = async (messages: { role: string, content: string }[]): Promise<string> => {
  const geminiKey = await getGeminiKey();
  const openAiKey = await getApiKey();

  if (geminiKey) {
    try {
      // Convert OpenAI messages format to Gemini
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
    } catch (e) {
      console.warn("Gemini chat failed", e);
    }
  }

  if (openAiKey) {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response from OpenAI.';
  }

  throw new Error('No API key available for chat.');
};
