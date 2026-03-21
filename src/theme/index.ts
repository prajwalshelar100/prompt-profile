import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F8F9FB', // Softer, more premium grey-blue tint
    card: '#FFFFFF',
    text: '#1C1C1E', // Apple-style off-black
    subtext: '#636366', // Apple-style grey
    primary: '#007AFF', // Vibrant Blue
    secondary: '#5856D6',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    overlay: 'rgba(0,0,0,0.03)',
    tint: '#007AFF15',
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    subtext: '#8E8E93',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    border: '#2C2C2E',
    error: '#FF453A',
    success: '#32D74B',
    overlay: 'rgba(255,255,255,0.05)',
    tint: '#0A84FF20',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Typography = {
  h1: { fontSize: 34, fontWeight: '800' as const, letterSpacing: 0.37 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: 0.35 },
  h3: { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0.38 },
  body: { fontSize: 17, fontWeight: '400' as const, letterSpacing: -0.41 },
  subheadline: { fontSize: 15, fontWeight: '400' as const, letterSpacing: -0.24 },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0 },
};

export const createSharedStyles = (isDark: boolean) => {
  const colors = isDark ? Colors.dark : Colors.light;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 10,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    title: {
      ...Typography.h2,
      color: colors.text,
    },
    text: {
      ...Typography.body,
      color: colors.text,
    },
    subtext: {
      ...Typography.subheadline,
      color: colors.subtext,
    }
  });
};
