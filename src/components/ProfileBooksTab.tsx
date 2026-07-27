import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { getUserBooks, getPublicUserBooks } from '../api/userBooks';
import { Loader } from './Loader';
import { UserBook, BookStatus } from '../types/domain';
import { secureUrl } from '../utils/secureUrl';
import { StatusActionSheet } from './StatusActionSheet';
import { useStatusSheet } from '../hooks/useStatusSheet';

const STATUSES: BookStatus[] = ['READING', 'WANT_TO_READ', 'READ', 'DID_NOT_FINISH'];
const HINT_STORAGE_KEY = 'hint_long_press_shown';

interface ProfileBooksTabProps {
  username: string;
  isOwn?: boolean;
}

interface ShelfSection {
  status: BookStatus;
  label: string;
  books: UserBook[];
}

export function ProfileBooksTab({ username, isOwn = false }: ProfileBooksTabProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<ShelfSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const { sheetVisible, sheetTarget, open, close, changeStatus, remove } = useStatusSheet();

  const statusLabels: Record<BookStatus, string> = {
    READING: t('shelf.reading'),
    WANT_TO_READ: t('shelf.wantToRead'),
    READ: t('shelf.read'),
    DID_NOT_FINISH: t('shelf.didNotFinish')
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        STATUSES.map((status) => isOwn ? getUserBooks(status) : getPublicUserBooks(username, status))
      );
      const grouped: ShelfSection[] = STATUSES
        .map((status, i) => ({ status, label: statusLabels[status], books: results[i] }))
        .filter((s) => s.books.length > 0);
      setSections(grouped);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [username, isOwn]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // Show one-time hint when user has books
  useEffect(() => {
    if (!isOwn || sections.length === 0) return;
    (async () => {
      const alreadyShown = await AsyncStorage.getItem(HINT_STORAGE_KEY);
      if (alreadyShown) return;
      setShowHint(true);
      Animated.timing(hintOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      await AsyncStorage.setItem(HINT_STORAGE_KEY, '1');
      // Auto-dismiss after 5 seconds
      setTimeout(() => dismissHint(), 5000);
    })();
  }, [isOwn, sections.length]);

  const dismissHint = () => {
    Animated.timing(hintOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowHint(false);
    });
  };

  const handleStatusChange = async (status: BookStatus) => {
    const success = await changeStatus(status);
    if (success) fetchBooks();
  };

  const handleRemove = async () => {
    const success = await remove();
    if (success) fetchBooks();
  };

  if (loading) return <Loader />;

  if (sections.length === 0) {
    return <Text style={[styles.empty, { color: colors.textSecondary }]}>{t('search.noResults')}</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* One-time hint */}
      {showHint && (
        <TouchableOpacity activeOpacity={0.8} onPress={dismissHint}>
          <Animated.View style={[styles.hint, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40', opacity: hintOpacity }]}>
            <Ionicons name="finger-print-outline" size={18} color={colors.primary} />
            <Text style={[styles.hintText, { color: colors.primary }]}>{t('hint.longPress')}</Text>
          </Animated.View>
        </TouchableOpacity>
      )}

      {sections.map((section) => (
        <View key={section.status as string} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {section.books.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.card}
                onPress={() => navigation.navigate('BookDetail', { bookId: book.bookId })}
                onLongPress={isOwn ? () => open({ id: book.id, title: book.title, status: book.status }) : undefined}
                delayLongPress={400}
              >
                <View style={[styles.cover, { backgroundColor: colors.border }]}>
                  {book.coverUrl ? (
                    <Image source={{ uri: secureUrl(book.coverUrl) }} style={styles.coverImg} />
                  ) : (
                    <Ionicons name="book-outline" size={20} color={colors.textSecondary} />
                  )}
                </View>
                <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
                <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>{book.author}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      {isOwn && (
        <StatusActionSheet
          visible={sheetVisible}
          bookTitle={sheetTarget?.title || ''}
          currentStatus={sheetTarget?.status || null}
          onSelectStatus={handleStatusChange}
          onRemove={handleRemove}
          onClose={close}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 20 },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1
  },
  hintText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    flex: 1
  },
  section: { marginBottom: 20, paddingLeft: 16 },
  sectionTitle: { fontSize: 18, fontFamily: fonts.bold, marginBottom: 10 },
  scroll: { gap: 12, paddingRight: 16 },
  card: { width: 110 },
  cover: { width: 110, height: 160, borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  coverImg: { width: '100%', height: '100%' },
  bookTitle: { fontSize: 14, fontFamily: fonts.bold, marginTop: 6 },
  bookAuthor: { fontSize: 14, marginTop: 2 },
  empty: { fontSize: 16, textAlign: 'center', paddingVertical: 30 }
});
