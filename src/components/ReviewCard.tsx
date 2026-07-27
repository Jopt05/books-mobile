import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Review } from '../types/domain';
import { useTheme } from '../hooks/useTheme';
import { StarRating } from './StarRating';
import { UserAvatar } from './UserAvatar';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { colors } = useTheme();
  const date = new Date(review.createdAt).toLocaleDateString();

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.header}>
        <UserAvatar uri={review.user.avatar} size={32} />
        <View style={styles.headerInfo}>
          <Text style={[styles.username, { color: colors.text }]}>{review.user.username}</Text>
          <StarRating rating={review.rating} size={14} />
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{date}</Text>
      </View>
      {review.hasSpoilers ? (
        <Text style={[styles.spoiler, { color: colors.textSecondary }]}>⚠️ Contiene spoilers</Text>
      ) : review.content ? (
        <Text style={[styles.content, { color: colors.text }]}>{review.content}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, borderBottomWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerInfo: { flex: 1, marginLeft: 8 },
  username: { fontSize: 14, fontWeight: '600' },
  date: { fontSize: 14 },
  content: { fontSize: 16 },
  spoiler: { fontSize: 14, fontStyle: 'italic' },
});
