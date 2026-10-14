import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Activity, BookStatus } from '../types/domain';
import { Book } from '../types/book';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useShelfButton } from '../hooks/useShelfButton';
import { UserAvatar } from './UserAvatar';
import { StarRating } from './StarRating';
import { StatusActionSheet } from './StatusActionSheet';
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

const STATUS_LABEL_KEYS: Record<BookStatus, string> = {
  WANT_TO_READ: 'shelf.wantToRead',
  READING: 'shelf.reading',
  READ: 'shelf.read',
  DID_NOT_FINISH: 'shelf.didNotFinish',
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
  const navigation = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);

  // Seed shelf state from the feed payload so we don't fire one request per card.
  const shelf = useShelfButton(null, {
    initialStatus: activity.shelfStatus,
    bookId: activity.bookId,
  });

  const isDiscussion = activity.type === 'STARTED_DISCUSSION';
  const showShelfButton = !isDiscussion && !!activity.bookId;
  const currentStatus = shelf.userBook?.status ?? null;

  const goToUser = () => navigation.push(`/(main)/user/${activity.user.username}`);
  const goToTarget = () => {
    if (isDiscussion && activity.metadata?.discussionId) {
      navigation.push(`/(main)/discussion/${activity.metadata.discussionId}`);
    } else {
      navigation.push(`/(main)/book/${activity.bookId}`);
    }
  };

  const handleSelectStatus = async (status: BookStatus) => {
    setSheetVisible(false);
    if (currentStatus) {
      await shelf.updateStatus(status);
    } else {
      const book: Book = {
        id: activity.bookId,
        title: activity.bookTitle,
        authors: activity.bookAuthor ? [activity.bookAuthor] : [],
        coverUrl: activity.bookCover ?? undefined,
      };
      await shelf.addToShelf(book, status);
    }
  };

  const handleRemove = async () => {
    setSheetVisible(false);
    await shelf.remove();
  };

  const shelfLabel = currentStatus ? t(STATUS_LABEL_KEYS[currentStatus]) : t('shelf.wantToRead');

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header: avatar + user + action + time */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToUser}>
          <UserAvatar uri={activity.user.avatar} size={40} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
            <Text style={styles.username} onPress={goToUser}>
              {activity.user.username}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {' '}{t(ACTIVITY_KEYS[activity.type] || activity.type)}
            </Text>
          </Text>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            {getTimeAgo(activity.createdAt)}
          </Text>
        </View>
      </View>

      {/* Body: cover + book info + shelf action */}
      <View style={styles.body}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={goToTarget}
          style={[styles.coverWrap, { backgroundColor: colors.border }]}
        >
          {activity.bookCover ? (
            <Image source={{ uri: secureUrl(activity.bookCover) }} style={styles.cover} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="book-outline" size={28} color={colors.textSecondary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.info}>
          <TouchableOpacity activeOpacity={0.7} onPress={goToTarget}>
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
              {activity.bookTitle}
            </Text>
          </TouchableOpacity>

          {activity.bookAuthor && (
            <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
              {t('activity.by')} {activity.bookAuthor}
            </Text>
          )}

          {/* Rating for reviews */}
          {activity.type === 'REVIEWED' && activity.metadata?.rating && (
            <View style={styles.ratingRow}>
              <StarRating rating={activity.metadata.rating} size={14} />
            </View>
          )}

          {showShelfButton && (
            <TouchableOpacity
              style={[
                styles.shelfButton,
                currentStatus
                  ? { backgroundColor: colors.primary + '20' }
                  : { backgroundColor: colors.primary },
              ]}
              onPress={() => setSheetVisible(true)}
              disabled={shelf.loading}
            >
              <Ionicons
                name="add"
                size={16}
                color={currentStatus ? colors.primary : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.shelfButtonText,
                  { color: currentStatus ? colors.primary : '#FFFFFF' },
                ]}
                numberOfLines={1}
              >
                {shelf.loading ? '...' : shelfLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showShelfButton && (
        <StatusActionSheet
          visible={sheetVisible}
          bookTitle={activity.bookTitle}
          currentStatus={currentStatus}
          onSelectStatus={handleSelectStatus}
          onRemove={currentStatus ? handleRemove : undefined}
          onClose={() => setSheetVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  text: { fontSize: 14, lineHeight: 20 },
  username: { fontFamily: fonts.bold },
  timeAgo: { fontSize: 14, marginTop: 2 },
  body: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  coverWrap: {
    width: 72,
    height: 104,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  bookTitle: { fontSize: 16, fontFamily: fonts.bold, lineHeight: 20 },
  author: { fontSize: 14, marginTop: 2 },
  ratingRow: { marginTop: 6 },
  shelfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  shelfButtonText: { fontSize: 14, fontFamily: fonts.bold },
});
