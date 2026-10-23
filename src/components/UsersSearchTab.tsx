import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useSearchUsers } from '../hooks/useSearchUsers';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { SearchBar } from './SearchBar';
import { UserSearchCard } from './UserSearchCard';
import { Loader } from './Loader';

/**
 * Users search tab. Self-contained scene for the search SwipeTabs: owns its
 * own search bar and result list so it can live inside a swipeable TabView.
 */
export function UsersSearchTab() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { users, loading, error, searched, search } = useSearchUsers();
  const { history, addToHistory, removeFromHistory } = useSearchHistory();

  const handleSearch = (query: string) => {
    addToHistory(query);
    search(query);
  };

  const header = (
    <SearchBar
      onSearch={handleSearch}
      placeholder={t('search.usersPlaceholder')}
      history={history}
      onRemoveHistory={removeFromHistory}
    />
  );

  const renderEmpty = () => {
    if (error) return <Text style={[styles.message, { color: colors.error }]}>{error}</Text>;
    if (loading) return <Loader />;
    if (!searched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('search.usersEmpty')}</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('search.usersNoResults')}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={users}
      keyExtractor={(user) => user.id}
      renderItem={({ item }) => <UserSearchCard user={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 24, paddingTop: 8, flexGrow: 1 },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
});
