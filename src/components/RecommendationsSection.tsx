import React, { useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useRecommendations } from '../hooks/useRecommendations';
import { fonts } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

export function RecommendationsSection() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useRouter();
  const { social, trending, loading, refresh } = useRecommendations();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading || (social.length === 0 && trending.length === 0)) return null;

  const renderCover = (coverUrl: string | null) => (
    <View style={[styles.coverContainer, { backgroundColor: colors.border }]}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons name="book-outline" size={24} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {social.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('recommendations.socialTitle')}
          </Text>
          <FlatList
            horizontal
            data={social}
            keyExtractor={(item) => item.bookId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.push(`/(main)/book/${item.bookId}`)}
              >
                {renderCover(item.coverUrl)}
                <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.author}
                </Text>
                <Text style={[styles.readBy, { color: colors.primary }]} numberOfLines={1}>
                  {item.count === 1
                    ? t('recommendations.readBy').replace('{user}', `@${item.recommendedBy[0]?.username}`)
                    : t('recommendations.readByMultiple')
                        .replace('{user}', `@${item.recommendedBy[0]?.username}`)
                        .replace('{count}', String(item.count - 1))}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {trending.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('recommendations.trendingTitle')}
          </Text>
          <FlatList
            horizontal
            data={trending}
            keyExtractor={(item) => item.bookId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => navigation.push(`/(main)/book/${item.bookId}`)}
              >
                <View>
                  {renderCover(item.coverUrl)}
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{item.count}</Text>
                  </View>
                </View>
                <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.author}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontFamily: fonts.bold, paddingHorizontal: 16, marginBottom: 12 },
  scrollContent: { paddingHorizontal: 16, gap: 12 },
  card: { width: 130 },
  coverContainer: { width: 130, height: 185, borderRadius: 8, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  bookTitle: { fontSize: 14, fontFamily: fonts.bold, marginTop: 6 },
  bookAuthor: { fontSize: 14, marginTop: 2 },
  readBy: { fontSize: 14, marginTop: 4 },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
});
