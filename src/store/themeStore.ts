import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useColorScheme } from 'react-native';

// Simple storage wrapper for SecureStore (or just memory if we don't need persistence yet)
// But since we want persistence, let's use a basic JSON store or SecureStore
import * as SecureStore from 'expo-secure-store';

const themeStorage = {
  getItem: (name: string) => SecureStore.getItem(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => themeStorage),
    }
  )
);
