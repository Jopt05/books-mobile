import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useFollow } from '../hooks/useFollow';
import { UserAvatar } from '../components/UserAvatar';
import { ConfirmModal } from '../components/ConfirmModal';
import { Loader } from '../components/Loader';
import { FeedStackParamList } from '../navigation/MainTabs';

type RouteParams = RouteProp<FeedStackParamList, 'PublicProfile'>;

export function PublicProfileScreen() {
  const route = useRoute<RouteParams>();
  const { username } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { profile, followStats, shelves, loading } = usePublicProfile(username);
  const { stats, follow, unfollow, toggling, refreshStats } = useFollow(username, followStats);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  useEffect(() => { if (followStats) refreshStats(); }, [followStats, refreshStats]);

  if (loading) return <Loader />;

  const handleUnfollow = async () => {
    setShowUnfollowModal(false);
    await unfollow();
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <UserAvatar uri={profile?.avatar || null} size={64} />
        <Text style={[styles.username, { color: colors.text }]}>{profile?.username}</Text>
        <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile?.bio || t('profile.noBio')}</Text>
        <Text style={[styles.counters, { color: colors.textSecondary }]}>
          {stats?.followersCount || 0} {t('profile.followers')} · {stats?.followingCount || 0} {t('profile.following')}
        </Text>
        <TouchableOpacity
          style={[styles.followBtn, { backgroundColor: stats?.isFollowing ? colors.surface : colors.primary }]}
          onPress={() => stats?.isFollowing ? setShowUnfollowModal(true) : follow()}
          disabled={toggling}
        >
          <Text style={[styles.followText, { color: stats?.isFollowing ? colors.text : '#FFF' }]}>
            {stats?.isFollowing ? t('follow.unfollow') : t('follow.follow')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...shelves.READING, ...shelves.WANT_TO_READ, ...shelves.READ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bookItem, { borderColor: colors.border }]}>
            <Text style={[styles.bookTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{item.author}</Text>
          </View>
        )}
      />

      <ConfirmModal
        visible={showUnfollowModal}
        title={t('follow.unfollow')}
        message={t('follow.confirmUnfollow')}
        onConfirm={handleUnfollow}
        onCancel={() => setShowUnfollowModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', padding: 20 },
  username: { fontSize: 20, fontWeight: '600', marginTop: 8 },
  bio: { fontSize: 16, marginTop: 4, textAlign: 'center' },
  counters: { fontSize: 14, marginTop: 8 },
  followBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  followText: { fontSize: 14, fontWeight: '600' },
  bookItem: { padding: 12, borderBottomWidth: 1 },
  bookTitle: { fontSize: 16 },
  bookAuthor: { fontSize: 14, marginTop: 2 },
});
