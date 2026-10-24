import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetTextInput,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { Book } from '../types/book';
import { Review } from '../types/domain';
import { StarRating } from './StarRating';

const MAX_CONTENT_LENGTH = 1000;

export interface ReviewSheetHandle {
  present: () => void;
  dismiss: () => void;
}

interface ReviewSheetProps {
  book: Book;
  /** Existing review to edit, if any. The form is pre-filled when present. */
  existingReview?: Review | null;
  submitting: boolean;
  validationError: string;
  /** Returns true when the review was saved, so the sheet can close. */
  onSubmit: (payload: { rating: number; content?: string; hasSpoilers: boolean }) => Promise<boolean>;
  onClearError: () => void;
}

export const ReviewSheet = React.forwardRef<ReviewSheetHandle, ReviewSheetProps>(function ReviewSheet(
  { book, existingReview, submitting, validationError, onSubmit, onClearError },
  ref,
) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);

  const snapPoints = useMemo(() => ['85%'], []);

  // Pre-fill the form each time the sheet is opened, reflecting the current
  // review (edit) or a blank form (create).
  const resetForm = useCallback(() => {
    setRating(existingReview?.rating ?? 0);
    setContent(existingReview?.content ?? '');
    setHasSpoilers(existingReview?.hasSpoilers ?? false);
    onClearError();
  }, [existingReview, onClearError]);

  React.useImperativeHandle(ref, () => ({
    present: () => {
      resetForm();
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }), [resetForm]);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    const ok = await onSubmit({
      rating,
      content: content.trim() || undefined,
      hasSpoilers,
    });
    if (ok) sheetRef.current?.dismiss();
  }, [rating, content, hasSpoilers, onSubmit]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  const over = content.length > MAX_CONTENT_LENGTH;
  const isEdit = !!existingReview;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEdit ? t('reviews.editReview') : t('reviews.write')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Book summary */}
        <View style={styles.bookRow}>
          <View style={[styles.cover, { backgroundColor: colors.border }]}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.coverImg} />
            ) : (
              <Ionicons name="book-outline" size={20} color={colors.textSecondary} />
            )}
          </View>
          <View style={styles.bookInfo}>
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
              {book.authors.join(', ') || t('bookDetail.unknownAuthor')}
            </Text>
            <Text style={[styles.prompt, { color: colors.textSecondary }]}>{t('reviews.prompt')}</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <StarRating rating={rating} onRate={setRating} size={36} />
        </View>

        {/* Content */}
        <View style={styles.inputWrap}>
          <BottomSheetTextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder={t('reviews.content')}
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
          />
          <Text style={[styles.counter, { color: over ? colors.error : colors.textSecondary }]}>
            {content.length} / {MAX_CONTENT_LENGTH}
          </Text>
        </View>

        {/* Spoiler toggle */}
        <TouchableOpacity style={styles.spoilerToggle} onPress={() => setHasSpoilers((v) => !v)}>
          <Ionicons name={hasSpoilers ? 'checkbox' : 'square-outline'} size={20} color={colors.textSecondary} />
          <Text style={[styles.spoilerText, { color: colors.textSecondary }]}> {t('reviews.spoilers')}</Text>
        </TouchableOpacity>

        {validationError ? (
          <Text style={[styles.valError, { color: colors.error }]}>{validationError}</Text>
        ) : null}

        {/* Publish button */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: submitting || over ? 0.5 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting || over}
        >
          <Text style={styles.submitText}>{t('reviews.submit')}</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold },

  bookRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  cover: { width: 48, height: 68, borderRadius: 6, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  coverImg: { width: '100%', height: '100%' },
  bookInfo: { flex: 1, justifyContent: 'center' },
  bookTitle: { fontSize: 16, fontFamily: fonts.bold },
  bookAuthor: { fontSize: 14, marginTop: 2 },
  prompt: { fontSize: 14, marginTop: 6 },

  ratingRow: { alignItems: 'center', marginBottom: 16 },

  inputWrap: { flex: 1, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    paddingBottom: 28,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: fonts.regular,
  },
  counter: { position: 'absolute', bottom: 8, right: 12, fontSize: 14 },

  spoilerToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  spoilerText: { fontSize: 14 },
  valError: { fontSize: 14, marginBottom: 8 },

  submitBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontFamily: fonts.bold },
});
