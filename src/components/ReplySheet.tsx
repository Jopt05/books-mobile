import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { Book } from '../types/book';
import { searchBooks } from '../api/books';
import { mapBookVolume } from '../utils/mapBook';
import { Loader } from './Loader';

const SEARCH_DEBOUNCE_MS = 400;

export interface ReplySheetHandle {
  present: () => void;
  dismiss: () => void;
}

interface ReplySheetProps {
  discussionTitle: string;
  discussionAuthor: string;
  submitting: boolean;
  /** Returns true when the reply was saved, so the sheet can close. */
  onSubmit: (payload: { content: string; book: Book | null }) => Promise<boolean>;
}

export const ReplySheet = React.forwardRef<ReplySheetHandle, ReplySheetProps>(function ReplySheet(
  { discussionTitle, discussionAuthor, submitting, onSubmit },
  ref,
) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [content, setContent] = useState('');
  const [book, setBook] = useState<Book | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [showBookSearch, setShowBookSearch] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snapPoints = useMemo(() => ['85%'], []);

  const resetForm = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setContent('');
    setBook(null);
    setBookSearch('');
    setBookResults([]);
    setSearching(false);
    setShowBookSearch(false);
  }, []);

  React.useImperativeHandle(ref, () => ({
    present: () => {
      resetForm();
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }), [resetForm]);

  const runBookSearch = useCallback(async (query: string) => {
    setSearching(true);
    try {
      const res = await searchBooks(query, 5);
      setBookResults((res.items || []).map(mapBookVolume));
    } catch {
      setBookResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce the book search so we only hit the API after the user pauses
  // typing, instead of firing a request on every keystroke.
  const handleBookSearch = useCallback((query: string) => {
    setBookSearch(query);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setBookResults([]);
      return;
    }
    debounceTimer.current = setTimeout(() => runBookSearch(trimmed), SEARCH_DEBOUNCE_MS);
  }, [runBookSearch]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;
    Keyboard.dismiss();
    const ok = await onSubmit({ content: content.trim(), book });
    if (ok) sheetRef.current?.dismiss();
  }, [content, book, onSubmit]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  const canSubmit = !!content.trim() && !submitting;

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
      <BottomSheetScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('discussions.reply')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Replying-to context */}
        <View style={styles.context}>
          <Text style={[styles.contextLine, { color: colors.textSecondary }]}>
            {t('discussions.replyingTo')} <Text style={{ color: colors.text, fontFamily: fonts.bold }}>{discussionAuthor}</Text>
          </Text>
          <Text style={[styles.contextLine, { color: colors.textSecondary }]} numberOfLines={1}>
            {t('discussions.topic')}: <Text style={{ color: colors.text }}>{discussionTitle}</Text>
          </Text>
        </View>

        {/* Content */}
        <BottomSheetTextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder={t('discussions.replyPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
        />

        {/* Attach book */}
        <Text style={[styles.label, { color: colors.text }]}>{t('discussions.attachBook')}</Text>
        {book ? (
          <View style={[styles.selectedBook, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {book.coverUrl && <Image source={{ uri: book.coverUrl }} style={styles.selectedBookCover} />}
            <View style={styles.selectedBookInfo}>
              <Text style={[styles.selectedBookTitle, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
              <Text style={[styles.selectedBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                {book.authors.join(', ')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setBook(null)} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : showBookSearch ? (
          <View>
            <BottomSheetTextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, minHeight: 0 }]}
              placeholder={t('discussions.searchBook')}
              placeholderTextColor={colors.textSecondary}
              value={bookSearch}
              onChangeText={handleBookSearch}
            />
            {searching && <Loader />}
            {bookResults.length > 0 && (
              <View style={[styles.bookResults, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {bookResults.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={styles.bookResultItem}
                    onPress={() => {
                      setBook(b);
                      setShowBookSearch(false);
                      setBookSearch('');
                      setBookResults([]);
                    }}
                  >
                    {b.coverUrl && <Image source={{ uri: b.coverUrl }} style={styles.bookResultCover} />}
                    <View style={styles.bookResultInfo}>
                      <Text style={[styles.bookResultTitle, { color: colors.text }]} numberOfLines={1}>{b.title}</Text>
                      <Text style={[styles.bookResultAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                        {b.authors.join(', ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addBookBtn, { borderColor: colors.border }]}
            onPress={() => setShowBookSearch(true)}
          >
            <Ionicons name="book-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.addBookText, { color: colors.textSecondary }]}>{t('discussions.searchBook')}</Text>
          </TouchableOpacity>
        )}

        {/* Publish button */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: canSubmit ? 1 : 0.5 }]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitText}>{t('discussions.submitReply')}</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: fonts.bold },

  context: { marginBottom: 16 },
  contextLine: { fontSize: 14, marginBottom: 2 },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: fonts.regular,
  },

  label: { fontSize: 14, fontFamily: fonts.bold, marginTop: 16, marginBottom: 6 },

  selectedBook: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedBookCover: { width: 36, height: 52, borderRadius: 4 },
  selectedBookInfo: { flex: 1 },
  selectedBookTitle: { fontSize: 14, fontFamily: fonts.bold },
  selectedBookAuthor: { fontSize: 14, fontFamily: fonts.regular },

  addBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  addBookText: { fontSize: 14, fontFamily: fonts.regular },

  bookResults: { borderWidth: 1, borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  bookResultItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  bookResultCover: { width: 28, height: 40, borderRadius: 4 },
  bookResultInfo: { flex: 1 },
  bookResultTitle: { fontSize: 14, fontFamily: fonts.bold },
  bookResultAuthor: { fontSize: 14, fontFamily: fonts.regular },

  submitBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontFamily: fonts.bold },
});
