import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabView, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useFeed } from '../hooks/useFeed';
import { ActivityCard } from '../components/ActivityCard';
import { AppHeader } from '../components/AppHeader';
import { Loader } from '../components/Loader';

type FeedTab = 'personal' | 'global';

function FeedList({ type }: { type: FeedTab }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { activities, loading, loadingMore, error, hasMore, loadMore, refresh } = useFeed(type);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { refresh(); }, [refresh]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (loading) return <Loader />;

  if (error) {
    return <Text style={[styles.message, { color: colors.error }]}>{error}</Text>;
  }

  if (activities.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="newspaper-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('feed.empty')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ActivityCard activity={item} />}
      onEndReached={() => { if (hasMore && !loadingMore) loadMore(); }}
      onEndReachedThreshold={0.3}
      ListFooterComponent={loadingMore ? <Loader /> : null}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      }
    />
  );
}

export function FeedScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const routes = [
    { key: 'personal', title: t('feed.following') },
    { key: 'global', title: t('feed.global') },
  ];

  const renderScene = ({ route }: SceneRendererProps & { route: { key: string } }) => {
    return <FeedList type={route.key as FeedTab} />;
  };

  const renderTabBar = (props: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string }> }) => (
    <TabBar
      {...props}
      style={{ backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }}
      indicatorStyle={{ backgroundColor: colors.primary, height: 3, borderRadius: 2 }}
      renderLabel={({ route, focused }) => (
        <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.textSecondary }]}>
          {route.title}
        </Text>
      )}
      pressColor={colors.border}
    />
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <Text style={[styles.title, { color: colors.text }]}>Feed</Text>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={renderTabBar}
        lazy
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 28, fontFamily: fonts.bold, paddingHorizontal: 16, marginTop: 8, marginBottom: 4 },
  tabBar: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
  indicator: { height: 3, borderRadius: 2 },
  tabLabel: { fontSize: 14, fontFamily: fonts.bold, textTransform: 'none' },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, marginTop: 12 },
  listContent: { paddingTop: 8, paddingBottom: 20 }
});
