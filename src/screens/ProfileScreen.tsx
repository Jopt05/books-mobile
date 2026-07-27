import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, ScrollView, StyleSheet, RefreshControl } from 'react-native';
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
import { getUserBooks } from '../api/userBooks';
import { getUserReviews, UserReview } from '../api/reviews';
import { UserAvatar } from '../components/UserAvatar';
import { StarRating } from '../components/StarRating';
import { AppHeader } from '../components/AppHeader';
import { Loader } from '../components/Loader';
import { UserBook } from '../types/domain';
import { BookStatus } from '../types/domain';
import { ProfileStackParamList } from '../navigation/MainTabs';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

const STATUSES: BookStatus[] = ['READING', 'WANT_TO_READ', 'READ', 'DID_NOT_FINISH'];

// Inline review card for profile tab (with book cover + spoiler)
function ReviewCardProfile({ review, colors, t, nav }: { review: UserReview; colors: any; t: (k: string) => string; nav: any }) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const date = new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <View style={[profileReviewStyles.card, { backgroundColor: colors.card }]}>
      <View style={profileReviewStyles.row}>
        {/* Book cover */}
        {review.book?.cover && (
          <TouchableOpacity
            onPress={() => nav.navigate('BookDetailProfile', { bookId: review.bookId })}
            style={[profileReviewStyles.coverWrap, { backgroundColor: colors.border }]}
          >
            <Image source={{ uri: review.book.cover }} style={profileReviewStyles.cover} />
          </TouchableOpacity>
        )}

        <View style={profileReviewStyles.info}>
          {/* Book title */}
          {review.book?.title && (
            <TouchableOpacity onPress={() => nav.navigate('BookDetailProfile', { bookId: review.bookId })}>
              <Text style={[profileReviewStyles.bookTitle, { color: colors.text }]}>{review.book.title}</Text>
            </TouchableOpacity>
          )}

          {/* Stars + date */}
          <View style={profileReviewStyles.ratingRow}>
            <StarRating rating={review.rating} size={16} />
            <Text style={[profileReviewStyles.date, { color: colors.textSecondary }]}>{date}</Text>
          </View>

          {/* Content / Spoiler */}
          {review.content && (
            review.hasSpoilers && !spoilerRevealed ? (
              <TouchableOpacity
                onPress={() => setSpoilerRevealed(true)}
                style={[profileReviewStyles.spoiler, { backgroundColor: colors.background + 'DD' }]}
              >
                <Text style={[profileReviewStyles.spoilerText, { color: colors.primary }]}>{t('reviews.spoilers')}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[profileReviewStyles.content, { color: colors.text }]}>{review.content}</Text>
            )
          )}
        </View>
      </View>
    </View>
  );
}

const profileReviewStyles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  row: { flexDirection: 'row', gap: 12 },
  coverWrap: { width: 56, height: 80, borderRadius: 6, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  info: { flex: 1 },
  bookTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  date: { fontSize: 14 },
  content: { fontSize: 14, marginTop: 4 },
  spoiler: { padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  spoilerText: { fontSize: 14, fontWeight: '600' },
});

interface ShelfSection {
  status: BookStatus;
  label: string;
  books: UserBook[];
}

export function ProfileScreen() {
  const nav = useNavigation<NavProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile, loading, updating, updateBio, updateAvatar, refresh: refreshProfile } = useProfile();
  const { stats, refreshStats } = useFollow(user?.username || '');
  const [tab, setTab] = useState<'books' | 'reviews'>('books');
  const [sections, setSections] = useState<ShelfSection[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [shelfLoading, setShelfLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [refreshing, setRefreshing] = useState(false);

  const statusLabels: Record<BookStatus, string> = {
    READING: t('shelf.reading'),
    WANT_TO_READ: t('shelf.wantToRead'),
    READ: t('shelf.read'),
    DID_NOT_FINISH: t('shelf.didNotFinish'),
  };

  const fetchBooks = useCallback(async () => {
    setShelfLoading(true);
    try {
      const results = await Promise.all(
        STATUSES.map((status) => getUserBooks(status))
      );
      const grouped: ShelfSection[] = STATUSES
        .map((status, i) => ({ status, label: statusLabels[status], books: results[i] }))
        .filter((s) => s.books.length > 0);
      setSections(grouped);
    } catch { /* ignore */ }
    finally { setShelfLoading(false); }
  }, [t]);

  const fetchReviews = useCallback(async (page: number) => {
    if (!user?.username) return;
    setReviewsLoading(true);
    try {
      const res = await getUserReviews(user.username, page, 5, true);
      setReviews(res.data);
      setReviewTotal(res.meta.totalPages);
      setReviewPage(page);
    } catch { /* ignore */ }
    finally { setReviewsLoading(false); }
  }, [user?.username]);

  useEffect(() => {
    refreshStats();
    fetchBooks();
  }, [user?.username, refreshStats, fetchBooks]);

  useEffect(() => {
    if (profile) setBio(profile.bio || '');
  }, [profile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshStats(), fetchBooks()]);
    setRefreshing(false);
  }, [refreshProfile, refreshStats, fetchBooks]);

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

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <ScrollView
        style={styles.flex}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          {/* Avatar (large, tappable to change) */}
          <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarContainer}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitial}>
                  {profile?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Username */}
          <Text style={[styles.username, { color: colors.text }]}>{profile?.username}</Text>

          {/* Followers / Following */}
          <View style={styles.counters}>
            <TouchableOpacity onPress={() => nav.navigate('Network', { username: user?.username || '' })}>
              <Text style={[styles.counter, { color: colors.text }]}>
                <Text style={styles.counterBold}>{stats?.followersCount || 0}</Text> {t('profile.followers')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.counterDot, { color: colors.textSecondary }]}>·</Text>
            <TouchableOpacity onPress={() => nav.navigate('Network', { username: user?.username || '' })}>
              <Text style={[styles.counter, { color: colors.text }]}>
                <Text style={styles.counterBold}>{stats?.followingCount || 0}</Text> {t('profile.following')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Section */}
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
                numberOfLines={4}
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
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              {profile?.bio || t('profile.noBio')}
            </Text>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, tab === 'books' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab('books')}
          >
            <Text style={[styles.tabText, { color: tab === 'books' ? colors.primary : colors.textSecondary }]}>{t('profile.books')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'reviews' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => { setTab('reviews'); if (reviews.length === 0) fetchReviews(1); }}
          >
            <Text style={[styles.tabText, { color: tab === 'reviews' ? colors.primary : colors.textSecondary }]}>{t('profile.reviews')}</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {tab === 'books' ? (
          shelfLoading ? <Loader /> : (
            sections.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('search.noResults')}</Text>
            ) : (
              sections.map((section) => (
                <View key={section.status} style={styles.shelfSection}>
                  <Text style={[styles.shelfTitle, { color: colors.text }]}>{section.label}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfScroll}>
                    {section.books.map((book) => (
                      <TouchableOpacity
                        key={book.id}
                        style={styles.shelfCard}
                        onPress={() => nav.navigate('BookDetailProfile' as any, { bookId: book.bookId })}
                      >
                        <View style={[styles.shelfCover, { backgroundColor: colors.border }]}>
                          {book.coverUrl ? (
                            <Image source={{ uri: book.coverUrl }} style={styles.shelfCoverImg} />
                          ) : (
                            <Ionicons name="book-outline" size={20} color={colors.textSecondary} />
                          )}
                        </View>
                        <Text style={[styles.shelfBookTitle, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
                        <Text style={[styles.shelfBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>{book.author}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))
            )
          )
        ) : (
          reviewsLoading ? <Loader /> : (
            reviews.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('reviews.noReviews')}</Text>
            ) : (
              <View style={styles.reviewsList}>
                {reviews.map((review) => (
                  <ReviewCardProfile key={review.id} review={review} colors={colors} t={t} nav={nav} />
                ))}

                {/* Pagination */}
                {reviewTotal > 1 && (
                  <View style={styles.pagination}>
                    <TouchableOpacity
                      onPress={() => fetchReviews(reviewPage - 1)}
                      disabled={reviewPage <= 1}
                      style={{ opacity: reviewPage <= 1 ? 0.4 : 1 }}
                    >
                      <Ionicons name="chevron-back" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.pageText, { color: colors.textSecondary }]}>{reviewPage} / {reviewTotal}</Text>
                    <TouchableOpacity
                      onPress={() => fetchReviews(reviewPage + 1)}
                      disabled={reviewPage >= reviewTotal}
                      style={{ opacity: reviewPage >= reviewTotal ? 0.4 : 1 }}
                    >
                      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // Header
  header: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold' },
  avatarBadge: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  username: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  counters: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  counter: { fontSize: 14 },
  counterBold: { fontWeight: '700' },
  counterDot: { fontSize: 14 },

  // Bio
  bioSection: { paddingHorizontal: 16, marginBottom: 16 },
  bioHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  bioTitle: { fontSize: 20, fontWeight: 'bold' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 14, fontWeight: '500' },
  bioText: { fontSize: 16, lineHeight: 22 },
  bioInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 10 },
  bioActions: { flexDirection: 'row', gap: 10 },
  saveBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtnText: { fontSize: 14, fontWeight: '500' },

  // Tabs
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '600' },

  // Shelf sections
  shelfSection: { marginBottom: 20, paddingLeft: 16 },
  shelfTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  shelfScroll: { gap: 12, paddingRight: 16 },
  shelfCard: { width: 110 },
  shelfCover: { width: 110, height: 160, borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  shelfCoverImg: { width: '100%', height: '100%' },
  shelfBookTitle: { fontSize: 14, fontWeight: '600', marginTop: 6 },
  shelfBookAuthor: { fontSize: 14, marginTop: 2 },

  // Reviews
  reviewsList: { paddingHorizontal: 16 },
  reviewCard: { borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  reviewDate: { fontSize: 14, marginTop: 4 },
  reviewContent: { fontSize: 14, marginTop: 6 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 12 },
  pageText: { fontSize: 14 },

  emptyText: { fontSize: 16, textAlign: 'center', paddingVertical: 20 },
});
