import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useDiscussions } from '../hooks/useDiscussions';
import { DiscussionCard } from '../components/DiscussionCard';
import { AppHeader } from '../components/AppHeader';
import { FadeIn } from '../components/FadeIn';
import { Loader } from '../components/Loader';
import { fonts } from '../theme/typography';

type SortType = 'recent' | 'popular';

export function DiscussionsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [sort, setSort] = useState<SortType>('recent');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { discussions, loading, loadingMore, error, hasMore, loadMore, toggleLike, refresh } =
    useDiscussions({ search, sort });

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

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
        onPress={() => (navigation as any).push('DiscussionDetail', { discussionId: item.id })}
      />
    </FadeIn>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{t('discussions.title')}</Text>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => (navigation as any).push('CreateDiscussion')}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newBtnText}>{t('discussions.new')}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('discussions.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Sort tabs */}
      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortBtn, sort === 'recent' && { backgroundColor: colors.primary }]}
          onPress={() => setSort('recent')}
        >
          <Text style={[styles.sortText, { color: sort === 'recent' ? '#FFFFFF' : colors.textSecondary }]}>
            {t('discussions.sortRecent')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sort === 'popular' && { backgroundColor: colors.primary }]}
          onPress={() => setSort('popular')}
        >
          <Text style={[styles.sortText, { color: sort === 'popular' ? '#FFFFFF' : colors.textSecondary }]}>
            {t('discussions.sortPopular')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      {/* Content */}
      {loading ? (
        <Loader />
      ) : discussions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {search ? t('discussions.noResults') : t('discussions.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={discussions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => { if (hasMore && !loadingMore) loadMore(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <Loader /> : null}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    padding: 0,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 20,
  },
});
