import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useFollow } from '../hooks/useFollow';
import { ConfirmModal } from '../components/ConfirmModal';
import { Loader } from '../components/Loader';
import { SwipeTabs, SwipeTab } from '../components/SwipeTabs';
import { ProfileBooksTab } from '../components/ProfileBooksTab';
import { ProfileReviewsTab } from '../components/ProfileReviewsTab';
import { FeedStackParamList } from '../navigation/MainTabs';

type RouteParams = RouteProp<FeedStackParamList, 'PublicProfile'>;

export function PublicProfileScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<any>();
  const { username } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile, followStats, loading, refresh: refreshProfile } = usePublicProfile(username);
  const { stats, follow, unfollow, toggling, refreshStats } = useFollow(username, followStats);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isOwnProfile = user?.username === username;

  useEffect(() => { if (followStats) refreshStats(); }, [followStats, refreshStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshStats()]);
    setRefreshing(false);
  }, [refreshProfile, refreshStats]);

  if (loading) return <Loader />;

  const handleUnfollow = async () => {
    setShowUnfollowModal(false);
    await unfollow();
  };

  const tabs: SwipeTab[] = [
    { key: 'books', title: t('profile.books'), component: ProfileBooksTab, props: { username, isOwn: false } },
    { key: 'reviews', title: t('profile.reviews'), component: ProfileReviewsTab, props: { username } },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header (scrollable for refresh) */}
      <View style={styles.headerWrapper}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          contentContainerStyle={styles.headerContent}
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
            <Text style={[styles.backText, { color: colors.textSecondary }]}>Atrás</Text>
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.profileCenter}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitial}>{profile?.username?.charAt(0).toUpperCase()}</Text>
              </View>
            )}

            <Text style={[styles.username, { color: colors.text }]}>{profile?.username}</Text>

            {/* Counters */}
            <View style={styles.counters}>
              <TouchableOpacity onPress={() => navigation.navigate('Network', { username })}>
                <Text style={[styles.counter, { color: colors.text }]}><Text style={styles.counterBold}>{stats?.followersCount || 0}</Text> {t('profile.followers')}</Text>
              </TouchableOpacity>
              <Text style={[styles.dot, { color: colors.textSecondary }]}>·</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Network', { username })}>
                <Text style={[styles.counter, { color: colors.text }]}><Text style={styles.counterBold}>{stats?.followingCount || 0}</Text> {t('profile.following')}</Text>
              </TouchableOpacity>
            </View>

            {/* Follow button */}
            {user && !isOwnProfile && (
              <TouchableOpacity
                style={[styles.followBtn, { backgroundColor: stats?.isFollowing ? colors.border : colors.primary }]}
                onPress={() => stats?.isFollowing ? setShowUnfollowModal(true) : follow()}
                disabled={toggling}
              >
                <Text style={[styles.followText, { color: stats?.isFollowing ? colors.textSecondary : '#FFFFFF' }]}>
                  {stats?.isFollowing ? t('follow.unfollow') : t('follow.follow')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bio */}
          <View style={styles.bioSection}>
            <Text style={[styles.bioTitle, { color: colors.text }]}>{t('profile.bio')}</Text>
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{profile?.bio || t('profile.noBio')}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Swipeable Tabs */}
      <SwipeTabs tabs={tabs} />

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
  headerWrapper: { maxHeight: '45%' },
  headerContent: { paddingBottom: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingTop: 8, marginBottom: 8 },
  backText: { fontSize: 14 },
  profileCenter: { alignItems: 'center', paddingHorizontal: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold' },
  username: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  counters: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  counter: { fontSize: 14 },
  counterBold: { fontWeight: '700' },
  dot: { fontSize: 14 },
  followBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  followText: { fontSize: 14, fontWeight: '600' },
  bioSection: { paddingHorizontal: 16, marginTop: 16 },
  bioTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  bioText: { fontSize: 16, lineHeight: 22 },
});
