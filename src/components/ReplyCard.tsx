import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { fonts } from '../theme/typography';
import { ConfirmModal } from './ConfirmModal';
import type { DiscussionReply } from '../api/discussions';

interface Props {
  reply: DiscussionReply;
  isOwn: boolean;
  onLike: () => void;
  onDelete: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ReplyCard({ reply, isOwn, onLike, onDelete }: Props) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            onPress={() => (navigation as any).push('UserProfile', { username: reply.user.username })}
          >
            {reply.user.avatar ? (
              <Image source={{ uri: reply.user.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>
                {reply.user.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.username, { color: colors.text }]}>
            {reply.user.username}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(reply.createdAt)}
          </Text>
        </View>
        {isOwn && (
          <TouchableOpacity onPress={() => setShowDeleteModal(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: colors.text }]}>{reply.content}</Text>

      {/* Attached book */}
      {reply.bookCover && reply.bookTitle ? (
        <TouchableOpacity
          style={[styles.bookRow, { backgroundColor: colors.background }]}
          onPress={() => (navigation as any).push('BookDetail', { bookId: reply.bookId })}
        >
          <Image source={{ uri: reply.bookCover }} style={styles.bookCover} />
          <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
            {reply.bookTitle}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Like */}
      <TouchableOpacity style={styles.likeBtn} onPress={onLike} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons
          name={reply.isLiked ? 'heart' : 'heart-outline'}
          size={16}
          color={reply.isLiked ? colors.primary : colors.textSecondary}
        />
        <Text style={[styles.likeText, { color: reply.isLiked ? colors.primary : colors.textSecondary }]}>
          {reply._count.likes}
        </Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={showDeleteModal}
        title={t('discussions.deleteReplyTitle')}
        message={t('discussions.deleteReplyMessage')}
        onConfirm={() => { setShowDeleteModal(false); onDelete(); }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 24,
    height: 24,
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
  content: {
    fontSize: 16,
    fontFamily: fonts.regular,
    marginBottom: 8,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookCover: {
    width: 30,
    height: 44,
    borderRadius: 4,
  },
  bookTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
});
