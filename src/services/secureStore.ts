import * as SecureStore from 'expo-secure-store';

const OPEN_API_KEY_KEY = 'OPENAI_API_KEY';
const GEMINI_API_KEY_KEY = 'GEMINI_API_KEY';

export const saveApiKey = async (key: string) => {
  await SecureStore.setItemAsync(OPEN_API_KEY_KEY, key);
};

export const getApiKey = async () => {
  return await SecureStore.getItemAsync(OPEN_API_KEY_KEY);
};

export const deleteApiKey = async () => {
  await SecureStore.deleteItemAsync(OPEN_API_KEY_KEY);
};

export const saveGeminiKey = async (key: string) => {
  await SecureStore.setItemAsync(GEMINI_API_KEY_KEY, key);
};

export const getGeminiKey = async () => {
  return await SecureStore.getItemAsync(GEMINI_API_KEY_KEY);
};

export const deleteGeminiKey = async () => {
  await SecureStore.deleteItemAsync(GEMINI_API_KEY_KEY);
};
