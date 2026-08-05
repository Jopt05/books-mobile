import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Activity } from '../types/domain';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { UserAvatar } from './UserAvatar';
import { StarRating } from './StarRating';
import { secureUrl } from '../utils/secureUrl';

interface ActivityCardProps {
  activity: Activity;
}

const ACTIVITY_KEYS: Record<string, string> = {
  ADDED_TO_SHELF: 'activity.addedToShelf',
  STARTED_READING: 'activity.startedReading',
  FINISHED_READING: 'activity.finishedReading',
  REVIEWED: 'activity.reviewed',
  STARTED_DISCUSSION: 'activity.startedDiscussion'
};

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(dateStr).toLocaleDateString();
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Avatar - navigates to profile */}
      <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { username: activity.user.username })}>
        <UserAvatar uri={activity.user.avatar} size={40} />
      </TouchableOpacity>

      {/* Content */}
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.7}
        onPress={() => {
          if (activity.type === 'STARTED_DISCUSSION' && activity.metadata?.discussionId) {
            navigation.navigate('DiscussionDetail', { discussionId: activity.metadata.discussionId });
          } else {
            navigation.navigate('BookDetail', { bookId: activity.bookId });
          }
        }}
      >
        <Text style={[styles.text, { color: colors.text }]}>
          <Text
            style={styles.username}
            onPress={() => navigation.navigate('UserProfile', { username: activity.user.username })}
          >
            {activity.user.username}
          </Text>
          {' '}{t(ACTIVITY_KEYS[activity.type] || activity.type)}{' '}
          <Text style={[styles.bookTitleText, { color: colors.text }]}>
            {activity.bookTitle}
          </Text>
        </Text>

        {/* Rating for reviews */}
        {activity.type === 'REVIEWED' && activity.metadata?.rating && (
          <View style={styles.ratingRow}>
            <StarRating rating={activity.metadata.rating} size={14} />
          </View>
        )}

        {/* Time ago */}
        <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
          {getTimeAgo(activity.createdAt)}
        </Text>
      </TouchableOpacity>

      {/* Book cover */}
      {activity.bookCover && (
        <TouchableOpacity
          onPress={() => {
            if (activity.type === 'STARTED_DISCUSSION' && activity.metadata?.discussionId) {
              navigation.navigate('DiscussionDetail', { discussionId: activity.metadata.discussionId });
            } else {
              navigation.navigate('BookDetail', { bookId: activity.bookId });
            }
          }}
          style={[styles.coverWrap, { backgroundColor: colors.border }]}
        >
          <Image source={{ uri: secureUrl(activity.bookCover) }} style={styles.cover} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    gap: 10
  },
  content: { flex: 1 },
  text: { fontSize: 14, lineHeight: 20 },
  username: { fontFamily: fonts.bold },
  bookTitleText: { fontFamily: fonts.bold },
  ratingRow: { marginTop: 4 },
  timeAgo: { fontSize: 14, marginTop: 4 },
  coverWrap: { width: 44, height: 64, borderRadius: 6, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' }
});
