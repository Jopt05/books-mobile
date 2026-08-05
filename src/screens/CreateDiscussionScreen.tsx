import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  FlatList, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { createDiscussion } from '../api/discussions';
import { searchBooks } from '../api/books';
import { mapBookVolume } from '../utils/mapBook';
import { Loader } from '../components/Loader';
import { fonts } from '../theme/typography';
import type { Book } from '../types/book';

export function CreateDiscussionScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleBookSearch = async (query: string) => {
    setBookSearch(query);
    if (query.trim().length < 2) {
      setBookResults([]);
      return;
    }
    setSearchingBooks(true);
    try {
      const res = await searchBooks(query, 5);
      setBookResults((res.items || []).map(mapBookVolume));
    } catch {
      setBookResults([]);
    } finally {
      setSearchingBooks(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) newErrors.title = t('discussions.errorTitleRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await createDiscussion({
        title: title.trim(),
        content: content.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        bookId: selectedBook?.id,
        bookTitle: selectedBook?.title,
        bookCover: selectedBook?.coverUrl,
      });
      (navigation as any).replace('DiscussionDetail', { discussionId: res.id });
    } catch {
      setErrors({ title: t('discussions.errorCreate') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.textSecondary }]}>{t('discussions.back')}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={[styles.pageTitle, { color: colors.text }]}>{t('discussions.new')}</Text>

          {/* Title */}
          <Text style={[styles.label, { color: colors.text }]}>{t('discussions.titleLabel')}</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholder={t('discussions.titlePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          {errors.title ? <Text style={[styles.errorMsg, { color: colors.error }]}>{errors.title}</Text> : null}

          {/* Content */}
          <Text style={[styles.label, { color: colors.text }]}>{t('discussions.contentLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholder={t('discussions.contentPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Tags */}
          <Text style={[styles.label, { color: colors.text }]}>{t('discussions.tagsLabel')}</Text>
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <View key={tag} style={[styles.tagChip, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.tagChipText, { color: colors.text }]}>{tag}</Text>
                  <TouchableOpacity onPress={() => setTags(tags.filter((t) => t !== tag))}>
                    <Ionicons name="close" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {tags.length < 5 && (
            <View style={styles.tagInputRow}>
              <TextInput
                style={[styles.input, styles.tagInput, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
                placeholder={t('discussions.tagsPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
            </View>
          )}

          {/* Book (optional) */}
          <Text style={[styles.label, { color: colors.text }]}>{t('discussions.bookOptional')}</Text>
          {selectedBook ? (
            <View style={[styles.selectedBook, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {selectedBook.coverUrl && (
                <Image source={{ uri: selectedBook.coverUrl }} style={styles.selectedBookCover} />
              )}
              <View style={styles.selectedBookInfo}>
                <Text style={[styles.selectedBookTitle, { color: colors.text }]} numberOfLines={1}>{selectedBook.title}</Text>
                <Text style={[styles.selectedBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                  {selectedBook.authors.join(', ')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedBook(null)}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : showBookSearch ? (
            <View>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
                placeholder={t('discussions.searchBook')}
                placeholderTextColor={colors.textSecondary}
                value={bookSearch}
                onChangeText={handleBookSearch}
                autoFocus
              />
              {searchingBooks && <Loader />}
              {bookResults.length > 0 && (
                <View style={[styles.bookResults, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {bookResults.map((book) => (
                    <TouchableOpacity
                      key={book.id}
                      style={styles.bookResultItem}
                      onPress={() => {
                        setSelectedBook(book);
                        setShowBookSearch(false);
                        setBookSearch('');
                        setBookResults([]);
                      }}
                    >
                      {book.coverUrl && <Image source={{ uri: book.coverUrl }} style={styles.bookResultCover} />}
                      <View style={styles.bookResultInfo}>
                        <Text style={[styles.bookResultTitle, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
                        <Text style={[styles.bookResultAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                          {book.authors.join(', ')}
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

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: submitting ? 0.5 : 1 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting ? t('discussions.creating') : t('discussions.submit')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: fonts.bold,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.bold,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  textArea: {
    height: 120,
  },
  errorMsg: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  tagChipText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  tagInputRow: {
    marginTop: 4,
  },
  tagInput: {},
  selectedBook: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedBookCover: {
    width: 36,
    height: 52,
    borderRadius: 4,
  },
  selectedBookInfo: {
    flex: 1,
  },
  selectedBookTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  selectedBookAuthor: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
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
  addBookText: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  bookResults: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  bookResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  bookResultCover: {
    width: 28,
    height: 40,
    borderRadius: 4,
  },
  bookResultInfo: {
    flex: 1,
  },
  bookResultTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  bookResultAuthor: {
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  submitBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
