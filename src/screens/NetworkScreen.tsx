import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../hooks/useNetwork';
import { UserAvatar } from '../components/UserAvatar';
import { AppHeader } from '../components/AppHeader';
import { Loader } from '../components/Loader';
import { SwipeTabs, SwipeTab } from '../components/SwipeTabs';
import { FollowUser } from '../api/follows';

// Reusable user list component for each tab
function UserList({ users, emptyMessage }: { users: FollowUser[]; emptyMessage: string }) {
  const { colors } = useTheme();
  const router = useRouter();

  if (users.length === 0) {
    return (
      <View style={listStyles.emptyContainer}>
        <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
        <Text style={[listStyles.emptyText, { color: colors.textSecondary }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      contentContainerStyle={listStyles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[listStyles.card, { backgroundColor: colors.surface }]}
          onPress={() => router.push(`/(main)/user/${item.username}`)}
          activeOpacity={0.7}
        >
          <UserAvatar uri={item.avatar} size={48} />
          <Text style={[listStyles.username, { color: colors.text }]}>{item.username}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const listStyles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8, gap: 14 },
  username: { fontSize: 16, fontFamily: fonts.bold },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16, marginTop: 10 }
});

// Tab wrapper components
function FollowersTab({ followers, t }: { followers: FollowUser[]; t: (k: string) => string }) {
  return <UserList users={followers} emptyMessage={t('feed.empty')} />;
}

function FollowingTab({ following, t }: { following: FollowUser[]; t: (k: string) => string }) {
  return <UserList users={following} emptyMessage={t('feed.empty')} />;
}

export function NetworkScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { followers, following, loading } = useNetwork(username);

  if (loading) return <Loader />;

  const tabs: SwipeTab[] = [
    { key: 'followers', title: `${t('network.followers')} (${followers.length})`, component: FollowersTab, props: { followers, t } },
    { key: 'following', title: `${t('network.following')} (${following.length})`, component: FollowingTab, props: { following, t } },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader variant="back" title={t('network.followers')} subtitle={`@${username}`} />

      {/* Swipeable tabs */}
      <SwipeTabs tabs={tabs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
