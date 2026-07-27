import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { ReadingStats as ReadingStatsType } from '../api/userBooks';

interface ReadingStatsProps {
  stats: ReadingStatsType;
}

export function ReadingStats({ stats }: ReadingStatsProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('streak.title')}</Text>
      <View style={styles.grid}>
        <View style={[styles.stat, { backgroundColor: colors.background }]}>
          <Text style={[styles.number, { color: colors.text }]}>{stats.booksRead}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('stats.booksRead')}</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.background }]}>
          <Text style={[styles.number, { color: colors.text }]}>{stats.pagesRead.toLocaleString()}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('stats.totalPages')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  grid: { flexDirection: 'row', gap: 12 },
  stat: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  number: { fontSize: 24, fontWeight: 'bold' },
  label: { fontSize: 14, marginTop: 4 },
});
