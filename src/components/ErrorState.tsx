import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  colors?: { card: string; text: string; subtext: string; border: string; error: string };
}

export default function ErrorState({ message, onRetry, colors }: ErrorStateProps) {
  return (
    <View style={[styles.container, colors && { backgroundColor: colors.card, borderColor: colors.border }]}>
      <AlertCircle color={colors?.error || '#FF3B30'} size={48} />
      <Text style={[styles.title, colors && { color: colors.error }]}>Something went wrong</Text>
      <Text style={[styles.message, colors && { color: colors.subtext }]}>{message}</Text>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw color="#fff" size={16} />
          <Text style={styles.retryText}> Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD1D1',
    marginVertical: 12,
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: '700',
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
