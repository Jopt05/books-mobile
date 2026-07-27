import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { ReadingProgress } from '../api/userBooks';

interface CurrentlyReadingProps {
  books: ReadingProgress[];
}

export function CurrentlyReading({ books }: CurrentlyReadingProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  if (books.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('currentlyReading.title')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {books.map((book) => (
          <View key={book.userBookId} style={[styles.card, { backgroundColor: colors.surface }]}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.cover} />
            ) : (
              <View style={[styles.coverPlaceholder, { backgroundColor: colors.border }]}>
                <Ionicons name="book-outline" size={20} color={colors.textSecondary} />
              </View>
            )}
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
              {book.title}
            </Text>
            <Text style={[styles.progress, { color: colors.textSecondary }]}>
              {book.latestPercentage != null ? `${book.latestPercentage}%` : book.latestPage != null ? `p.${book.latestPage}` : '—'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 10, paddingHorizontal: 16 },
  card: { width: 100, marginLeft: 16, borderRadius: 8, padding: 8, alignItems: 'center' },
  cover: { width: 60, height: 90, borderRadius: 4 },
  coverPlaceholder: { width: 60, height: 90, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  bookTitle: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  progress: { fontSize: 14, marginTop: 2 },
});
