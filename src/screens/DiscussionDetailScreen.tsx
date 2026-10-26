import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDiscussionDetail } from '../hooks/useDiscussionDetail';
import { ReplyCard } from '../components/ReplyCard';
import { ReplySheet, ReplySheetHandle } from '../components/ReplySheet';
import { ConfirmModal } from '../components/ConfirmModal';
import { AppHeader } from '../components/AppHeader';
import { Loader } from '../components/Loader';
import { fonts } from '../theme/typography';
import type { Book } from '../types/book';

export function DiscussionDetailScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { discussionId } = useLocalSearchParams<{ discussionId: string }>();

  const {
    discussion,
    replies,
    loading,
    loadingReplies,
    loadingMore,
    refreshing,
    error,
    hasMoreReplies,
    replySort,
    setReplySort,
    loadMoreReplies,
    refresh,
    addReply,
    removeReply,
    toggleLike,
    likeReply,
    removeDiscussion,
  } = useDiscussionDetail(discussionId);

  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const replySheetRef = useRef<ReplySheetHandle>(null);

  const handleSubmitReply = async ({ content, book }: { content: string; book: Book | null }): Promise<boolean> => {
    setSubmitting(true);
    try {
      await addReply({
        content,
        bookId: book?.id,
        bookTitle: book?.title,
        bookCover: book?.coverUrl,
      });
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    await removeDiscussion();
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (error || !discussion) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.errorText, { color: colors.error }]}>{error || 'Not found'}</Text>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === discussion.userId;

  const headerComponent = (
    <View>
      {/* Discussion card */}
      <View style={[styles.discussionCard, { backgroundColor: colors.card }]}>
        {/* Author row */}
        <View style={styles.authorRow}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/(main)/user/${discussion.user.username}`)}
          >
            {discussion.user.avatar ? (
              <Image source={{ uri: discussion.user.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{discussion.user.username.charAt(0).toUpperCase()}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.authorInfo}>
            <Text style={[styles.username, { color: colors.text }]}>{discussion.user.username}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(discussion.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          {isOwner && (
            <TouchableOpacity onPress={() => setShowDeleteModal(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Title & content */}
        <Text style={[styles.discussionTitle, { color: colors.text }]}>{discussion.title}</Text>
        {discussion.content ? (
          <Text style={[styles.discussionContent, { color: colors.text }]}>{discussion.content}</Text>
        ) : null}

        {/* Linked book */}
        {discussion.bookCover && discussion.bookTitle ? (
          <TouchableOpacity
            style={[styles.bookRow, { backgroundColor: colors.surface }]}
            onPress={() => router.push(`/(main)/book/${discussion.bookId}`)}
          >
            <Image source={{ uri: discussion.bookCover }} style={styles.bookCover} />
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{discussion.bookTitle}</Text>
          </TouchableOpacity>
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

        {/* Like button */}
        <TouchableOpacity
          style={[styles.likeBtn, { backgroundColor: discussion.isLiked ? colors.primary + '1A' : colors.surface }]}
          onPress={toggleLike}
        >
          <Ionicons
            name={discussion.isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={discussion.isLiked ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.likeText, { color: discussion.isLiked ? colors.primary : colors.textSecondary }]}>
            {discussion._count.likes} {t('discussions.likes')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Replies header */}
      <View style={styles.repliesHeader}>
        <Text style={[styles.repliesTitle, { color: colors.text }]}>
          {discussion._count.replies} {t('discussions.replies')}
        </Text>
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortBtn, replySort === 'recent' && { backgroundColor: colors.primary }]}
            onPress={() => setReplySort('recent')}
          >
            <Text style={[styles.sortText, { color: replySort === 'recent' ? '#FFFFFF' : colors.textSecondary }]}>
              {t('discussions.sortRecent')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, replySort === 'popular' && { backgroundColor: colors.primary }]}
            onPress={() => setReplySort('popular')}
          >
            <Text style={[styles.sortText, { color: replySort === 'popular' ? '#FFFFFF' : colors.textSecondary }]}>
              {t('discussions.sortPopular')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Write reply button, placed before the replies list */}
      {user && (
        <TouchableOpacity
          style={[styles.replyBtn, { backgroundColor: colors.primary }]}
          onPress={() => replySheetRef.current?.present()}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
          <Text style={styles.replyBtnText}>{t('discussions.writeReply')}</Text>
        </TouchableOpacity>
      )}

      {loadingReplies ? <Loader /> : null}
    </View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader variant="back" title={discussion.title} />

      <FlatList
        data={replies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.replyWrapper}>
            <ReplyCard
              reply={item}
              isOwn={item.userId === user?.id}
              onLike={() => likeReply(item.id)}
              onDelete={() => removeReply(item.id)}
            />
          </View>
        )}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={loadingMore ? <Loader /> : null}
        onEndReached={() => { if (hasMoreReplies && !loadingMore) loadMoreReplies(); }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Reply bottom sheet */}
      {user && (
        <ReplySheet
          ref={replySheetRef}
          discussionTitle={discussion.title}
          discussionAuthor={discussion.user.username}
          submitting={submitting}
          onSubmit={handleSubmitReply}
        />
      )}

      <ConfirmModal
        visible={showDeleteModal}
        title={t('discussions.deleteTitle')}
        message={t('discussions.deleteMessage')}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  discussionCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 36,
    height: 36,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  date: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  discussionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    marginBottom: 8,
  },
  discussionContent: {
    fontSize: 16,
    fontFamily: fonts.regular,
    marginBottom: 12,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookCover: {
    width: 36,
    height: 52,
    borderRadius: 4,
  },
  bookTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
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
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  likeText: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  repliesTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  replyWrapper: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  replyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
