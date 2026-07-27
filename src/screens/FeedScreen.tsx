import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useFeed } from '../hooks/useFeed';
import { ActivityCard } from '../components/ActivityCard';
import { AppHeader } from '../components/AppHeader';
import { Loader } from '../components/Loader';

export function FeedScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [tab, setTab] = useState<'personal' | 'global'>('personal');
  const { activities, loading, loadingMore, error, hasMore, loadMore, refresh } = useFeed(tab);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'personal' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setTab('personal')}>
          <Text style={[styles.tabText, { color: tab === 'personal' ? colors.primary : colors.textSecondary }]}>{t('feed.following')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'global' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setTab('global')}>
          <Text style={[styles.tabText, { color: tab === 'global' ? colors.primary : colors.textSecondary }]}>{t('feed.global')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? <Loader /> : error ? (
        <Text style={[styles.message, { color: colors.error }]}>{error}</Text>
      ) : activities.length === 0 ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{t('feed.empty')}</Text>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityCard activity={item} />}
          onEndReached={() => { if (hasMore) loadMore(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <Loader /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '600' },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20 },
});
