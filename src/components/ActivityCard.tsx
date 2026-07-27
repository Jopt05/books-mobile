import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Activity } from '../types/domain';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { UserAvatar } from './UserAvatar';

interface ActivityCardProps {
  activity: Activity;
}

const ACTIVITY_KEYS: Record<string, string> = {
  ADDED_TO_SHELF: 'activity.addedToShelf',
  STARTED_READING: 'activity.startedReading',
  FINISHED_READING: 'activity.finishedReading',
  REVIEWED: 'activity.reviewed',
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <UserAvatar uri={activity.user.avatar} size={36} />
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.text }]}>
          <Text style={styles.username}>{activity.user.username}</Text>
          {' '}{t(ACTIVITY_KEYS[activity.type] || activity.type)}
        </Text>
        <View style={styles.bookRow}>
          {activity.bookCover && (
            <Image source={{ uri: activity.bookCover }} style={styles.bookCover} />
          )}
          <Text style={[styles.bookTitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {activity.bookTitle}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 12, borderBottomWidth: 1 },
  content: { flex: 1, marginLeft: 10 },
  text: { fontSize: 14 },
  username: { fontWeight: '600' },
  bookRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  bookCover: { width: 30, height: 45, borderRadius: 2, marginRight: 8 },
  bookTitle: { fontSize: 14, flex: 1 },
});
