import React, { useState, useCallback } from 'react';
import { Text, ScrollView, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { CurrentlyReading } from '../components/CurrentlyReading';
import { QuickJournalCard } from '../components/QuickJournalCard';
import { StreakBanner } from '../components/StreakBanner';
import { ReadingStats } from '../components/ReadingStats';
import { QuickFeed } from '../components/QuickFeed';
import { EmptyHomeState } from '../components/EmptyHomeState';
import { AppHeader } from '../components/AppHeader';
import { FadeIn } from '../components/FadeIn';

export function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { progress, loading, refresh: refreshProgress } = useReadingProgress();
  const [streakKey, setStreakKey] = useState(0);
  const [journalKey, setJournalKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const hasBooks = !loading && progress.length > 0;
  const showEmpty = !loading && progress.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProgress();
    setStreakKey((k) => k + 1);
    setJournalKey((k) => k + 1);
    setRefreshing(false);
  }, [refreshProgress]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <FadeIn direction="none">
          <Text style={[styles.title, { color: colors.text }]}>{t('tabs.home')}</Text>
        </FadeIn>

        {hasBooks && (
          <FadeIn delay={50} direction="up">
            <QuickJournalCard key={journalKey} onEntryCreated={() => { setStreakKey((k) => k + 1); refreshProgress(); }} />
          </FadeIn>
        )}

        {hasBooks && (
          <FadeIn delay={100} direction="up">
            <StreakBanner key={streakKey} />
          </FadeIn>
        )}

        {showEmpty && (
          <FadeIn delay={50} direction="up">
            <EmptyHomeState />
          </FadeIn>
        )}

        {hasBooks && (
          <FadeIn delay={150} direction="up">
            <CurrentlyReading books={progress} />
          </FadeIn>
        )}

        {hasBooks && (
          <FadeIn delay={200} direction="up">
            <ReadingStats />
          </FadeIn>
        )}

        <FadeIn delay={hasBooks ? 250 : 100} direction="up">
          <QuickFeed />
        </FadeIn>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingTop: 24 },
  title: { fontSize: 28, fontFamily: fonts.bold, paddingHorizontal: 16, marginBottom: 12 },
});
