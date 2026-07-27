import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../hooks/useFollow';
import { AppHeader } from '../components/AppHeader';
import { Loader } from '../components/Loader';
import { SwipeTabs, SwipeTab } from '../components/SwipeTabs';
import { ProfileBooksTab } from '../components/ProfileBooksTab';
import { ProfileReviewsTab } from '../components/ProfileReviewsTab';
import { ProfileStackParamList } from '../navigation/MainTabs';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export function ProfileScreen() {
  const nav = useNavigation<NavProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile, loading, updating, updateBio, updateAvatar, refresh: refreshProfile } = useProfile();
  const { stats, refreshStats } = useFollow(user?.username || '');
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { refreshStats(); }, [user?.username, refreshStats]);
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

  if (loading) return <Loader />;

  const tabs: SwipeTab[] = [
    { key: 'books', title: t('profile.books'), component: ProfileBooksTab, props: { username: user?.username || '', isOwn: true } },
    { key: 'reviews', title: t('profile.reviews'), component: ProfileReviewsTab, props: { username: user?.username || '' } },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />

      {/* Header (scrollable for refresh) */}
      <View style={styles.headerWrapper}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          style={styles.headerScroll}
          contentContainerStyle={styles.headerContent}
          scrollEnabled={!editing}
          nestedScrollEnabled
        >
          {/* Avatar */}
          <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarContainer}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitial}>{profile?.username?.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Username */}
          <Text style={[styles.username, { color: colors.text }]}>{profile?.username}</Text>

          {/* Followers */}
          <View style={styles.counters}>
            <TouchableOpacity onPress={() => nav.navigate('Network', { username: user?.username || '' })}>
              <Text style={[styles.counter, { color: colors.text }]}><Text style={styles.counterBold}>{stats?.followersCount || 0}</Text> {t('profile.followers')}</Text>
            </TouchableOpacity>
            <Text style={[styles.dot, { color: colors.textSecondary }]}>·</Text>
            <TouchableOpacity onPress={() => nav.navigate('Network', { username: user?.username || '' })}>
              <Text style={[styles.counter, { color: colors.text }]}><Text style={styles.counterBold}>{stats?.followingCount || 0}</Text> {t('profile.following')}</Text>
            </TouchableOpacity>
          </View>

          {/* Bio */}
          <View style={styles.bioSection}>
            <View style={styles.bioHeader}>
              <Text style={[styles.bioTitle, { color: colors.text }]}>{t('profile.bio')}</Text>
              {!editing && (
                <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
                  <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  <Text style={[styles.editBtnText, { color: colors.primary }]}>{t('profile.edit')}</Text>
                </TouchableOpacity>
              )}
            </View>
            {editing ? (
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
                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: updating ? 0.5 : 1 }]} onPress={handleSaveBio} disabled={updating}>
                    <Text style={styles.saveBtnText}>{updating ? '...' : t('common.save')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.border }]} onPress={() => { setEditing(false); setBio(profile?.bio || ''); }}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerWrapper: { maxHeight: '45%' },
  headerScroll: {},
  headerContent: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },

  // Avatar
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold' },
  avatarBadge: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  username: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  counters: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  counter: { fontSize: 14 },
  counterBold: { fontWeight: '700' },
  dot: { fontSize: 14 },

  // Bio
  bioSection: { width: '100%', marginTop: 16 },
  bioHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  bioTitle: { fontSize: 20, fontWeight: 'bold' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 14, fontWeight: '500' },
  bioText: { fontSize: 16, lineHeight: 22 },
  bioInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 70, textAlignVertical: 'top', marginBottom: 10 },
  bioActions: { flexDirection: 'row', gap: 10 },
  saveBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtnText: { fontSize: 14, fontWeight: '500' },
});
