import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useDiscussions } from '../hooks/useDiscussions';
import { DiscussionCard } from './DiscussionCard';
import { FadeIn } from './FadeIn';
import { Loader } from './Loader';

interface Props {
  /** Shared search query, owned by the screen and passed to both tabs. */
  search: string;
  sort: 'recent' | 'popular';
}

/**
 * Self-contained discussions list for one sort order. Owns its own
 * useDiscussions instance so it can live as a scene inside SwipeTabs, while
 * the search query stays shared and is injected by the parent screen.
 */
export function DiscussionsList({ search, sort }: Props) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { discussions, loading, loadingMore, error, hasMore, loadMore, toggleLike, refresh } =
    useDiscussions({ search, sort });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const renderItem = ({ item, index }: { item: typeof discussions[0]; index: number }) => (
    <FadeIn delay={index * 60} direction="up">
      <DiscussionCard
        discussion={item}
        onLike={() => toggleLike(item.id)}
        onPress={() => router.push(`/(main)/discussion/${item.id}`)}
      />
    </FadeIn>
  );

  if (loading) return <Loader />;

  if (error) {
    return <Text style={[styles.error, { color: colors.error }]}>{error}</Text>;
  }

  if (discussions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {search ? t('discussions.noResults') : t('discussions.empty')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={discussions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={() => {
        if (hasMore && !loadingMore) loadMore();
      }}
      onEndReachedThreshold={0.3}
      ListFooterComponent={loadingMore ? <Loader /> : null}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 14, textAlign: 'center', marginTop: 12 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, marginTop: 12 },
  listContent: { paddingTop: 4, paddingBottom: 20 },
});
