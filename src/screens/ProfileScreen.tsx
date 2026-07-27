import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../hooks/useFollow';
import { getUserBooks } from '../api/userBooks';
import { getUserReviews } from '../api/reviews';
import { UserAvatar } from '../components/UserAvatar';
import { Loader } from '../components/Loader';
import { UserBook, Review } from '../types/domain';
import { ProfileStackParamList } from '../navigation/MainTabs';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export function ProfileScreen() {
  const nav = useNavigation<NavProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { stats, refreshStats } = useFollow(user?.username || '');
  const [tab, setTab] = useState<'books' | 'reviews'>('books');
  const [books, setBooks] = useState<UserBook[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (user?.username) {
      refreshStats();
      getUserBooks().then(setBooks).catch(() => {});
      getUserReviews(user.username).then((r) => setReviews(r.data)).catch(() => {});
    }
  }, [user?.username, refreshStats]);

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <UserAvatar uri={profile?.avatar || null} size={64} />
        <Text style={[styles.username, { color: colors.text }]}>{profile?.username}</Text>
        <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile?.bio || t('profile.noBio')}</Text>
        <View style={styles.counters}>
          <TouchableOpacity onPress={() => nav.navigate('Network', { username: user?.username || '' })}>
            <Text style={[styles.counter, { color: colors.text }]}>{stats?.followersCount || 0} {t('profile.followers')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.navigate('Network', { username: user?.username || '' })}>
            <Text style={[styles.counter, { color: colors.text }]}>{stats?.followingCount || 0} {t('profile.following')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => nav.navigate('Settings')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="settings-outline" size={18} color={colors.primary} />
          <Text style={[styles.settingsLink, { color: colors.primary }]}>{t('settings.title')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'books' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setTab('books')}>
          <Text style={[styles.tabText, { color: tab === 'books' ? colors.primary : colors.textSecondary }]}>{t('profile.books')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'reviews' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setTab('reviews')}>
          <Text style={[styles.tabText, { color: tab === 'reviews' ? colors.primary : colors.textSecondary }]}>{t('profile.reviews')}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'books' ? (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bookItem, { borderColor: colors.border }]}>
              <Text style={[styles.bookTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.bookStatus, { color: colors.textSecondary }]}>{item.status}</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bookItem, { borderColor: colors.border }]}>
              <Text style={[styles.bookTitle, { color: colors.text }]}>{'★'.repeat(item.rating)} {item.content || ''}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', padding: 20 },
  username: { fontSize: 20, fontWeight: '600', marginTop: 8 },
  bio: { fontSize: 16, marginTop: 4, textAlign: 'center' },
  counters: { flexDirection: 'row', gap: 20, marginTop: 12 },
  counter: { fontSize: 14 },
  settingsLink: { fontSize: 14, marginTop: 12 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '600' },
  bookItem: { padding: 12, borderBottomWidth: 1 },
  bookTitle: { fontSize: 16 },
  bookStatus: { fontSize: 14, marginTop: 2 },
});
