import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Review } from '../types/domain';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { StarRating } from './StarRating';
import { UserAvatar } from './UserAvatar';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_LINES = 3;
const CHAR_THRESHOLD = 120;

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onDelete?: () => void;
}

export function ReviewCard({ review, isOwn = false, onDelete }: ReviewCardProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const shouldShowToggle = !!(review.content && review.content.length > CHAR_THRESHOLD);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const date = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {/* Header: avatar + username + date + delete */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userRow}
          onPress={() => navigation.navigate('PublicProfile', { username: review.user.username })}
        >
          <UserAvatar uri={review.user.avatar} size={32} />
          <Text style={[styles.username, { color: colors.text }]}>{review.user.username}</Text>
        </TouchableOpacity>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{date}</Text>
        {isOwn && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Rating */}
      <StarRating rating={review.rating} size={16} />

      {/* Content with spoiler handling */}
      {review.content && (
        <View style={styles.contentArea}>
          {review.hasSpoilers && !spoilerRevealed ? (
            <TouchableOpacity
              style={[styles.spoilerOverlay, { backgroundColor: colors.background + 'DD' }]}
              onPress={() => setSpoilerRevealed(true)}
            >
              <Text style={[styles.spoilerBtn, { color: colors.primary }]}>{t('reviews.spoilers')}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text
                style={[styles.content, { color: colors.text }]}
                numberOfLines={expanded ? undefined : MAX_LINES}
              >
                {review.content}
              </Text>
              {shouldShowToggle && (
                <TouchableOpacity onPress={toggleExpanded} style={styles.toggleBtn}>
                  <Text style={[styles.toggleText, { color: colors.primary }]}>
                    {expanded ? t('reviews.showLess') : t('reviews.showMore')}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  username: { fontSize: 14, fontFamily: fonts.bold },
  date: { fontSize: 14, marginRight: 8 },
  deleteBtn: { padding: 4 },
  contentArea: { marginTop: 8 },
  spoilerOverlay: { padding: 12, borderRadius: 8, alignItems: 'center' },
  spoilerBtn: { fontSize: 14, fontFamily: fonts.bold },
  content: { fontSize: 16 },
  toggleBtn: { marginTop: 4 },
  toggleText: { fontSize: 14, fontFamily: fonts.bold },
});
