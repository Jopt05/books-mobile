import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { AppHeader } from '../components/AppHeader';
import { SwipeTabs, SwipeTab } from '../components/SwipeTabs';
import { DiscussionsList } from '../components/DiscussionsList';
import { fonts } from '../theme/typography';

export function DiscussionsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  // The search query is shared across both sort tabs; each tab owns its own
  // discussions list (and scroll) so it can live inside SwipeTabs.
  const tabs: SwipeTab[] = [
    {
      key: 'recent',
      title: t('discussions.sortRecent'),
      icon: 'time-outline',
      component: DiscussionsList,
      props: { search, sort: 'recent' },
    },
    {
      key: 'popular',
      title: t('discussions.sortPopular'),
      icon: 'flame-outline',
      component: DiscussionsList,
      props: { search, sort: 'popular' },
    },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader title={t('discussions.title')} />

      {/* New discussion */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(main)/(discussions)/create')}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newBtnText}>{t('discussions.new')}</Text>
        </TouchableOpacity>
      </View>

      {/* Shared search */}
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

      {/* Sort tabs (swipeable) */}
      <SwipeTabs tabs={tabs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
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
});
