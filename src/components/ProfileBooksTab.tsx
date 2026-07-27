import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { getUserBooks, getPublicUserBooks } from '../api/userBooks';
import { Loader } from './Loader';
import { UserBook, BookStatus } from '../types/domain';

const STATUSES: BookStatus[] = ['READING', 'WANT_TO_READ', 'READ', 'DID_NOT_FINISH'];

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

  if (loading) return <Loader />;

  if (sections.length === 0) {
    return <Text style={[styles.empty, { color: colors.textSecondary }]}>{t('search.noResults')}</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {sections.map((section) => (
        <View key={section.status as string} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {section.books.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.card}
                onPress={() => navigation.navigate('BookDetail', { bookId: book.bookId })}
              >
                <View style={[styles.cover, { backgroundColor: colors.border }]}>
                  {book.coverUrl ? (
                    <Image source={{ uri: book.coverUrl }} style={styles.coverImg} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 20 },
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
