import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../hooks/useNetwork';
import { UserAvatar } from '../components/UserAvatar';
import { Loader } from '../components/Loader';
import { SwipeTabs, SwipeTab } from '../components/SwipeTabs';
import { FollowUser } from '../api/follows';
import { ProfileStackParamList } from '../navigation/MainTabs';

type RouteParams = RouteProp<ProfileStackParamList, 'Network'>;

// Reusable user list component for each tab
function UserList({ users, emptyMessage }: { users: FollowUser[]; emptyMessage: string }) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

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
          onPress={() => navigation.navigate('PublicProfile', { username: item.username })}
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
  username: { fontSize: 16, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16, marginTop: 10 },
});

// Tab wrapper components
function FollowersTab({ followers, t }: { followers: FollowUser[]; t: (k: string) => string }) {
  return <UserList users={followers} emptyMessage={t('feed.empty')} />;
}

function FollowingTab({ following, t }: { following: FollowUser[]; t: (k: string) => string }) {
  return <UserList users={following} emptyMessage={t('feed.empty')} />;
}

export function NetworkScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { username } = route.params;
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
      {/* Header with back + title + username */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('network.followers')}</Text>
        <Text style={[styles.usernameTag, { color: colors.textSecondary }]}>@{username}</Text>
      </View>

      {/* Swipeable tabs */}
      <SwipeTabs tabs={tabs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: 'bold' },
  usernameTag: { fontSize: 16 },
});
