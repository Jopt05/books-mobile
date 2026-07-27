import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useReadingStats, StatsPeriod } from '../hooks/useReadingStats';

const PERIODS: { value: StatsPeriod; labelKey: string }[] = [
  { value: 'month', labelKey: 'stats.thisMonth' },
  { value: 'year', labelKey: 'stats.thisYear' },
];

export function ReadingStats() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { stats, period, setPeriod, loading } = useReadingStats();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header with title + period toggle */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('stats.title')}</Text>
        <View style={[styles.toggle, { borderColor: colors.border }]}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.toggleBtn, period === p.value && { backgroundColor: colors.primary }]}
              onPress={() => setPeriod(p.value)}
            >
              <Text style={[styles.toggleText, { color: period === p.value ? '#FFFFFF' : colors.textSecondary }]}>
                {t(p.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.grid}>
        <View style={[styles.stat, { backgroundColor: colors.background }]}>
          {loading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>...</Text>
          ) : (
            <>
              <Text style={[styles.number, { color: colors.text }]}>{stats?.booksRead ?? 0}</Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('stats.booksRead')}</Text>
            </>
          )}
        </View>
        <View style={[styles.stat, { backgroundColor: colors.background }]}>
          {loading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>...</Text>
          ) : (
            <>
              <Text style={[styles.number, { color: colors.text }]}>{(stats?.pagesRead ?? 0).toLocaleString()}</Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('stats.pagesRead')}</Text>
            </>
          )}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold' },
  toggle: { flexDirection: 'row', borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  toggleText: { fontSize: 14, fontWeight: '500' },
  grid: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 8, padding: 14, alignItems: 'center' },
  number: { fontSize: 24, fontWeight: 'bold' },
  label: { fontSize: 14, marginTop: 4 },
  loadingText: { fontSize: 14 },
});
