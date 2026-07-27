import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useProfilePage } from '../hooks/useProfilePage';
import { useFollow } from '../hooks/useFollow';
import { ConfirmModal } from '../components/ConfirmModal';
import { Loader } from '../components/Loader';
import { AppHeader } from '../components/AppHeader';
import { SwipeTabs, SwipeTab } from '../components/SwipeTabs';
import { ProfileBooksTab } from '../components/ProfileBooksTab';
import { ProfileReviewsTab } from '../components/ProfileReviewsTab';

type RouteParams = RouteProp<{ UserProfile: { username: string } }, 'UserProfile'>;

export function UserProfileScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<any>();
  const { username } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const {
    profile,
    isOwner,
    loading,
    error,
    updating,
    refresh: refreshProfile,
    updateBio,
    updateAvatar,
  } = useProfilePage(username);

  const { stats, follow, unfollow, toggling, refreshStats } = useFollow(username);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { refreshStats(); }, [username, refreshStats]);
  useEffect(() => { if (profile) setBio(profile.bio || ''); }, [profile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshStats()]);
    setRefreshing(false);
  }, [refreshProfile, refreshStats]);

  const handleSaveBio = async () => {
    await updateBio(bio);
    setEditing(false);
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      await updateAvatar(result.assets[0].uri);
    }
  };

  const handleUnfollow = async () => {
    setShowUnfollowModal(false);
    await unfollow();
  };

  if (loading) return <Loader />;

  const tabs: SwipeTab[] = [
    { key: 'books', title: t('profile.books'), component: ProfileBooksTab, props: { username, isOwn: isOwner } },
    { key: 'reviews', title: t('profile.reviews'), component: ProfileReviewsTab, props: { username } },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {isOwner ? <AppHeader /> : null}

      <View style={styles.headerWrapper}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          contentContainerStyle={styles.headerContent}
          scrollEnabled={!editing}
          nestedScrollEnabled
        >
          {/* Back button (non-owner only) */}
          {!isOwner && (
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
              <Text style={[styles.backText, { color: colors.textSecondary }]}>Atrás</Text>
            </TouchableOpacity>
          )}

          {/* Avatar */}
          <View style={styles.profileCenter}>
            <TouchableOpacity onPress={isOwner ? handlePickAvatar : undefined} disabled={!isOwner}>
              {profile?.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarInitial}>{profile?.username?.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              {isOwner && (
                <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={[styles.username, { color: colors.text }]}>{profile?.username}</Text>

            {/* Counters */}
            <View style={styles.counters}>
              <TouchableOpacity onPress={() => navigation.navigate('Network', { username })}>
                <Text style={[styles.counter, { color: colors.text }]}>
                  <Text style={styles.counterBold}>{stats?.followersCount || 0}</Text> {t('profile.followers')}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.dot, { color: colors.textSecondary }]}>·</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Network', { username })}>
                <Text style={[styles.counter, { color: colors.text }]}>
                  <Text style={styles.counterBold}>{stats?.followingCount || 0}</Text> {t('profile.following')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Follow button (non-owner only) */}
            {user && !isOwner && (
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
            <View style={styles.bioHeader}>
              <Text style={[styles.bioTitle, { color: colors.text }]}>{t('profile.bio')}</Text>
              {isOwner && !editing && (
                <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
                  <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  <Text style={[styles.editBtnText, { color: colors.primary }]}>{t('profile.edit')}</Text>
                </TouchableOpacity>
              )}
            </View>
            {isOwner && editing ? (
              <View>
                <TextInput
                  style={[styles.bioInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder={t('profile.noBio')}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                <View style={styles.bioActions}>
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: updating ? 0.5 : 1 }]}
                    onPress={handleSaveBio}
                    disabled={updating}
                  >
                    <Text style={styles.saveBtnText}>{updating ? '...' : t('common.save')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { backgroundColor: colors.border }]}
                    onPress={() => { setEditing(false); setBio(profile?.bio || ''); }}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>{profile?.bio || t('profile.noBio')}</Text>
            )}
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
  headerWrapper: { maxHeight: '50%' },
  headerContent: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: 8 },
  backText: { fontSize: 14 },
  profileCenter: { alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#FFFFFF', fontSize: 36, fontFamily: fonts.bold },
  avatarBadge: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  username: { fontSize: 24, fontFamily: fonts.bold, marginTop: 12 },
  counters: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  counter: { fontSize: 14 },
  counterBold: { fontFamily: fonts.bold },
  dot: { fontSize: 14 },
  followBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  followText: { fontSize: 14, fontFamily: fonts.bold },
  bioSection: { width: '100%', marginTop: 16 },
  bioHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  bioTitle: { fontSize: 20, fontFamily: fonts.bold },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 14, fontFamily: fonts.bold },
  bioText: { fontSize: 16, lineHeight: 22, fontFamily: fonts.regular },
  bioInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 70, textAlignVertical: 'top', marginBottom: 10, fontFamily: fonts.regular },
  bioActions: { flexDirection: 'row', gap: 10 },
  saveBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtnText: { fontSize: 14, fontFamily: fonts.bold },
});
