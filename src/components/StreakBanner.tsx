import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';

interface StreakBannerProps {
  streak: number;
}

export function StreakBanner({ streak }: StreakBannerProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  if (streak <= 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.emoji}>🔥</Text>
      <View>
        <Text style={styles.count}>{streak}</Text>
        <Text style={styles.label}>{t('streak.days')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 16, marginHorizontal: 16 },
  emoji: { fontSize: 28, marginRight: 10 },
  count: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  label: { fontSize: 14, color: '#FFFFFF' },
});
