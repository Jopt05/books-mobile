import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { AppHeader } from '../components/AppHeader';
import { SwipeTabs, SwipeTab } from '../components/SwipeTabs';
import { BooksSearchTab } from '../components/BooksSearchTab';
import { UsersSearchTab } from '../components/UsersSearchTab';

export function SearchScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Each tab is a self-contained scene (own search bar + scrolling list) so
  // the search screen can use the shared swipeable SwipeTabs.
  const tabs: SwipeTab[] = [
    { key: 'books', title: t('search.tabBooks'), icon: 'book-outline', component: BooksSearchTab },
    { key: 'users', title: t('search.tabUsers'), icon: 'people-outline', component: UsersSearchTab },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader title={t('search.title')} />
      <SwipeTabs tabs={tabs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
