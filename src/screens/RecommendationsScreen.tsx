import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useForYou } from '../hooks/useForYou';
import { fonts } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import type { RecommendedBook } from '../utils/mapForYouItem';
import type { RecommendationReason } from '../api/recommendations';

function BookCard({
  book,
  discoverLabel,
  reasonText,
}: {
  book: RecommendedBook;
  discoverLabel: string;
  reasonText: (reason: RecommendationReason) => string;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const reason = book.reasons[0] ? reasonText(book.reasons[0]) : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/(main)/book/${book.id}`)}
    >
      <View style={[styles.coverContainer, { backgroundColor: colors.border }]}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book-outline" size={24} color={colors.textSecondary} />
          </View>
        )}
        {book.source === 'discovery' && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{discoverLabel}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
        {book.title}
      </Text>
      <Text style={[styles.bookSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
        {book.authors.join(', ')}
      </Text>
      {reason ? (
        <Text style={[styles.reason, { color: colors.primary }]} numberOfLines={1}>
          {reason}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export function RecommendationsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { items, loading, hasMore, loadMore, refresh } = useForYou();
  const [refreshing, setRefreshing] = useState(false);

  const reasonText = useCallback(
    (reason: RecommendationReason): string =>
      t(`recommendations.reason.${reason.key}`).replace('{count}', String(reason.count ?? '')),
    [t],
  );

  useEffect(() => {
    refresh();
    // Load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const renderFooter = useCallback(() => {
    if (!loading || items.length === 0) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }, [loading, items.length, colors.primary]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {t('recommendations.emptyForYou')}
      </Text>
    );
  }, [loading, colors.textSecondary, t]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader title={t('recommendations.pageTitle')} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('recommendations.forYouSubtitle')}
          </Text>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (hasMore && !loading) loadMore();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            discoverLabel={t('recommendations.discoveryBadge')}
            reasonText={reasonText}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  column: { gap: 12, marginBottom: 16 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  emptyText: { fontSize: 14, marginTop: 24, textAlign: 'center' },
  card: { flex: 1 },
  coverContainer: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  bookTitle: { fontSize: 14, fontFamily: fonts.bold, marginTop: 6 },
  bookSubtitle: { fontSize: 14, marginTop: 2 },
  reason: { fontSize: 14, marginTop: 2 },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
  loadingFooter: { paddingVertical: 16, alignItems: 'center' },
});
