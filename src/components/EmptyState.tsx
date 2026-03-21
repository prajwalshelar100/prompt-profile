import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileQuestion } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  colors?: { card: string; text: string; subtext: string; border: string };
}

export default function EmptyState({ title, description, colors }: EmptyStateProps) {
  return (
    <View style={[styles.container, colors && { backgroundColor: colors.card, borderColor: colors.border }]}>
      <FileQuestion color={colors?.subtext || '#ccc'} size={48} />
      <Text style={[styles.title, colors && { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, colors && { color: colors.subtext }]}>{description}</Text>
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
    borderColor: '#EAEAEA',
    marginVertical: 12,
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
