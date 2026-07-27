import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

interface StreakBannerProps {
  streak?: number;
}

export function StreakBanner({ streak: propStreak }: StreakBannerProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [streak, setStreak] = useState<number | null>(propStreak ?? null);

  useEffect(() => {
    client.get<{ currentStreak: number }>('/journal/streak')
      .then((res) => setStreak(res.data.currentStreak))
      .catch(() => {});
  }, [propStreak]);

  if (streak === null || streak === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Ionicons name="flame" size={28} color="#F59E0B" />
      <View style={styles.textContainer}>
        <Text style={[styles.count, { color: colors.text }]}>{streak} {t('streak.days')}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{t('streak.title')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  textContainer: {},
  count: { fontSize: 18, fontFamily: fonts.bold },
  message: { fontSize: 14 }
});
