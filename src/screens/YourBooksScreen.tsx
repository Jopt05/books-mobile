import React from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useYourBooks } from '../hooks/useYourBooks';
import { AppHeader } from '../components/AppHeader';
import { SearchBar } from '../components/SearchBar';
import { TimelineBookCard } from '../components/TimelineBookCard';
import { Loader } from '../components/Loader';

type RouteParams = { username?: string; status?: string };

export function YourBooksScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const username = params.username || '';
  const { colors } = useTheme();
  const { t } = useLanguage();

  const {
    status,
    statuses,
    labels,
    changeStatus,
    sortDir,
    toggleSortDir,
    sortHelp,
    query,
    setQuery,
    sections,
    total,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    dateLabelFor,
  } = useYourBooks(username, params.status);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <AppHeader variant="back" title={`${t('yourBooks.title')} (${total})`} showAvatar={false} />

      {/* Filter chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {statuses.map((s) => {
            const active = status === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => changeStatus(s)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {labels[s]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search */}
      <SearchBar onSearch={setQuery} placeholder={t('yourBooks.searchPlaceholder')} />

      {/* Sort row: helper text + direction toggle */}
      <View style={styles.sortRow}>
        <View style={styles.sortHelp}>
          <Ionicons name="swap-vertical-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.sortHelpText, { color: colors.textSecondary }]} numberOfLines={1}>
            {sortHelp}
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleSortDir}
          style={[styles.sortToggle, { backgroundColor: colors.border }]}
          hitSlop={8}
          accessibilityLabel={t('yourBooks.toggleSort')}
        >
          <Ionicons
            name={sortDir === 'desc' ? 'arrow-down' : 'arrow-up'}
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.sortToggleText, { color: colors.textSecondary }]}>
            {sortDir === 'desc' ? t('yourBooks.newestFirst') : t('yourBooks.oldestFirst')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loader />
      ) : sections.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmarks-outline" size={44} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {query.trim() ? t('yourBooks.noResults') : t('yourBooks.empty')}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
            </View>
          )}
          renderItem={({ item }) => (
            <TimelineBookCard book={item} dateLabel={dateLabelFor(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
          onEndReached={() => {
            // Infinite scroll only applies to the full (unfiltered) list; an
            // in-memory search works over what's already loaded.
            if (!query.trim() && hasMore) loadMore();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  chipText: { fontSize: 14, fontFamily: fonts.bold },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  sortHelp: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  sortHelpText: { fontSize: 14, fontFamily: fonts.regular, flex: 1 },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  sortToggleText: { fontSize: 14, fontFamily: fonts.bold },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  sectionTitle: { fontSize: 20, fontFamily: fonts.bold },
  sectionLine: { flex: 1, height: 1 },
  separator: { height: 10 },
  sectionGap: { height: 6 },
  footer: { paddingVertical: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
