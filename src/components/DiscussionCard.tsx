import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { fonts } from '../theme/typography';
import type { Discussion } from '../api/discussions';

interface Props {
  discussion: Discussion;
  onLike?: () => void;
  onPress?: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DiscussionCard({ discussion, onLike, onPress }: Props) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          {/* Author */}
          <View style={styles.authorRow}>
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: colors.primary }]}
              onPress={() => (navigation as any).push('UserProfile', { username: discussion.user.username })}
            >
              {discussion.user.avatar ? (
                <Image source={{ uri: discussion.user.avatar }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>
                  {discussion.user.username.charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={[styles.username, { color: colors.text }]}>
              {discussion.user.username}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatDate(discussion.createdAt)}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {discussion.title}
          </Text>

          {/* Content preview */}
          {discussion.content ? (
            <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
              {discussion.content}
            </Text>
          ) : null}

          {/* Tags */}
          {discussion.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {discussion.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statBtn}
              onPress={(e) => { e.stopPropagation; onLike?.(); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={discussion.isLiked ? 'heart' : 'heart-outline'}
                size={16}
                color={discussion.isLiked ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.statText, { color: discussion.isLiked ? colors.primary : colors.textSecondary }]}>
                {discussion._count.likes}
              </Text>
            </TouchableOpacity>
            <View style={styles.statBtn}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {discussion._count.replies}
              </Text>
            </View>
          </View>
        </View>

        {/* Book cover */}
        {discussion.bookCover ? (
          <Image
            source={{ uri: discussion.bookCover }}
            style={[styles.bookCover, { backgroundColor: colors.surface }]}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 28,
    height: 28,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  username: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  date: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  bookCover: {
    width: 50,
    height: 72,
    borderRadius: 6,
  },
});
