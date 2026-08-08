import React, { useEffect, useCallback } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useRecommendationsPage } from '../hooks/useRecommendationsPage';
import { fonts } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';

function BookCard({
  bookId,
  title,
  subtitle,
  coverUrl,
  badge,
}: {
  bookId: string;
  title: string;
  subtitle: string;
  coverUrl: string | null;
  badge?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const secureUrl = coverUrl?.replace('http://', 'https://') || null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/(main)/book/${bookId}`)}
    >
      <View style={[styles.coverContainer, { backgroundColor: colors.border }]}>
        {secureUrl ? (
          <Image source={{ uri: secureUrl }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book-outline" size={24} color={colors.textSecondary} />
          </View>
        )}
        {badge}
      </View>
      <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.bookSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export function RecommendationsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { social, trending, authors } = useRecommendationsPage();

  useEffect(() => {
    social.refresh();
    trending.refresh();
    authors.refresh();
  }, []);

  const renderFooter = useCallback((loading: boolean) => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }, [colors.primary]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          {t('recommendations.pageTitle')}
        </Text>

        {/* Social */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('recommendations.socialTitle')}
          </Text>
          {social.items.length === 0 && !social.loading && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('recommendations.emptySocial')}
            </Text>
          )}
          <FlatList
            horizontal
            data={social.items}
            keyExtractor={(item) => item.bookId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={social.loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter(social.loading)}
            renderItem={({ item }) => (
              <BookCard
                bookId={item.bookId}
                title={item.title}
                subtitle={item.author}
                coverUrl={item.coverUrl}
              />
            )}
          />
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('recommendations.trendingTitle')}
          </Text>
          {trending.items.length === 0 && !trending.loading && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('recommendations.emptyTrending')}
            </Text>
          )}
          <FlatList
            horizontal
            data={trending.items}
            keyExtractor={(item) => item.bookId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={trending.loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter(trending.loading)}
            renderItem={({ item }) => (
              <BookCard
                bookId={item.bookId}
                title={item.title}
                subtitle={item.author}
                coverUrl={item.coverUrl}
                badge={
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{item.count}</Text>
                  </View>
                }
              />
            )}
          />
        </View>

        {/* Favorite Authors */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('recommendations.favoriteAuthorsTitle')}
          </Text>
          {authors.items.length === 0 && !authors.loading && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('recommendations.emptyAuthors')}
            </Text>
          )}
          {authors.items.map((group) => (
            <View key={group.author} style={styles.authorGroup}>
              <Text style={[styles.authorName, { color: colors.text }]}>{group.author}</Text>
              <FlatList
                horizontal
                data={group.books}
                keyExtractor={(item) => item.bookId}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <BookCard
                    bookId={item.bookId}
                    title={item.title}
                    subtitle={item.authors.join(', ')}
                    coverUrl={item.coverUrl}
                  />
                )}
              />
            </View>
          ))}
          {authors.hasMore && !authors.loading && (
            <TouchableOpacity onPress={authors.loadMore} style={styles.loadMoreBtn}>
              <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                {t('recommendations.loadMoreAuthors')}
              </Text>
            </TouchableOpacity>
          )}
          {authors.loading && <ActivityIndicator color={colors.primary} style={styles.loader} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  pageTitle: { fontSize: 28, fontFamily: fonts.bold, paddingHorizontal: 16, marginTop: 16, marginBottom: 24 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 20, fontFamily: fonts.bold, paddingHorizontal: 16, marginBottom: 12 },
  emptyText: { fontSize: 14, paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, gap: 12 },
  card: { width: 130 },
  coverContainer: { width: 130, height: 185, borderRadius: 8, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  bookTitle: { fontSize: 14, fontFamily: fonts.bold, marginTop: 6 },
  bookSubtitle: { fontSize: 14, marginTop: 2 },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
  authorGroup: { marginBottom: 16 },
  authorName: { fontSize: 16, fontFamily: fonts.bold, paddingHorizontal: 16, marginBottom: 8 },
  loadMoreBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  loadMoreText: { fontSize: 14, fontFamily: fonts.bold },
  loader: { marginTop: 8 },
  loadingFooter: { width: 60, justifyContent: 'center', alignItems: 'center' },
});
