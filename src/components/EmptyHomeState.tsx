import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'expo-router';
import { fonts } from '../theme/typography';

export function EmptyHomeState() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Ionicons name="book-outline" size={48} color={colors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>{t('home.emptyTitle')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{t('home.emptyDescription')}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(main)/(search)/')}
      >
        <Text style={styles.buttonText}>{t('home.emptyCta')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 24, borderRadius: 12, padding: 24, alignItems: 'center' },
  icon: { marginBottom: 12 },
  title: { fontSize: 18, fontFamily: fonts.bold, textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 15, fontFamily: fonts.regular, textAlign: 'center', marginBottom: 20, maxWidth: 280 },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
});
