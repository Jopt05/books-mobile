import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { StarRating } from './StarRating';
import { secureUrl } from '../utils/secureUrl';
import { UserBook } from '../types/domain';

interface TimelineBookCardProps {
  book: UserBook;
  /** Pre-resolved metadata label, e.g. "Leído el 12 oct 2026". */
  dateLabel: string | null;
}

export function TimelineBookCard({ book, dateLabel }: TimelineBookCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      activeOpacity={0.7}
      onPress={() => router.push(`/(main)/book/${book.bookId}`)}
    >
      {/* Cover */}
      <View style={[styles.cover, { backgroundColor: colors.border }]}>
        {book.coverUrl ? (
          <Image source={{ uri: secureUrl(book.coverUrl) }} style={styles.coverImg} />
        ) : (
          <Ionicons name="book-outline" size={22} color={colors.textSecondary} />
        )}
      </View>

      {/* Center: title / author / rating */}
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
          {book.author}
        </Text>
        {book.rating ? (
          <View style={styles.rating}>
            <StarRating rating={book.rating} size={14} />
          </View>
        ) : null}
      </View>

      {/* Right: date metadata */}
      {dateLabel ? (
        <Text style={[styles.date, { color: colors.textSecondary }]}>{dateLabel}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  cover: {
    width: 52,
    height: 78,
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImg: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontFamily: fonts.bold },
  author: { fontSize: 14, marginTop: 2 },
  rating: { marginTop: 6 },
  date: {
    fontSize: 14,
    textAlign: 'right',
    maxWidth: 96,
    marginLeft: 4,
  },
});
