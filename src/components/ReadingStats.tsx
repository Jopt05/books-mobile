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
    <View style={styles.container}>
      <View style={[styles.stat, { backgroundColor: colors.surface }]}>
        <Text style={[styles.number, { color: colors.primary }]}>{stats.booksRead}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('stats.booksRead')}</Text>
      </View>
      <View style={[styles.stat, { backgroundColor: colors.surface }]}>
        <Text style={[styles.number, { color: colors.primary }]}>{stats.booksReading}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('stats.booksReading')}</Text>
      </View>
      <View style={[styles.stat, { backgroundColor: colors.surface }]}>
        <Text style={[styles.number, { color: colors.primary }]}>{stats.totalPages}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('stats.totalPages')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12, paddingHorizontal: 16 },
  stat: { alignItems: 'center', padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4 },
  number: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 14, marginTop: 4 },
});
