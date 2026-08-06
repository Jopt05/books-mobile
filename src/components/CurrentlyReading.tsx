import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { ReadingProgress } from '../api/userBooks';
import { secureUrl } from '../utils/secureUrl';
import { StatusActionSheet } from './StatusActionSheet';
import { useStatusSheet } from '../hooks/useStatusSheet';

interface CurrentlyReadingProps {
  books: ReadingProgress[];
}

export function CurrentlyReading({ books }: CurrentlyReadingProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useRouter();
  const { sheetVisible, sheetTarget, open, close, changeStatus, remove } = useStatusSheet();

  if (books.length === 0) return null;

  const handleStatusChange = async (status: any) => {
    await changeStatus(status);
  };

  const handleRemove = async () => {
    await remove();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('currentlyReading.title')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {books.map((book) => {
          const percentage = book.lastProgress?.percentage ?? 0;
          return (
            <TouchableOpacity
              key={book.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.push(`/(main)/book/${book.bookId}`)}
              onLongPress={() => open({ id: book.id, title: book.title, status: 'READING' })}
              delayLongPress={400}
            >
              {/* Cover */}
              <View style={[styles.coverContainer, { backgroundColor: colors.border }]}>
                {book.coverUrl ? (
                  <Image source={{ uri: secureUrl(book.coverUrl) }} style={styles.cover} />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Ionicons name="book-outline" size={24} color={colors.textSecondary} />
                  </View>
                )}
              </View>
              {/* Title + Author */}
              <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
                {book.title}
              </Text>
              <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                {book.author}
              </Text>
              {/* Progress Bar */}
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {percentage}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <StatusActionSheet
        visible={sheetVisible}
        bookTitle={sheetTarget?.title || ''}
        currentStatus={sheetTarget?.status || null}
        onSelectStatus={handleStatusChange}
        onRemove={handleRemove}
        onClose={close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  title: { fontSize: 18, fontFamily: fonts.bold, marginBottom: 12 },
  scrollContent: { gap: 12 },
  card: { width: 130 },
  coverContainer: {
    width: 130,
    height: 185,
    borderRadius: 8,
    overflow: 'hidden'
  },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bookTitle: { fontSize: 14, fontFamily: fonts.bold, marginTop: 8 },
  bookAuthor: { fontSize: 14, marginTop: 2 },
  progressBar: {
    height: 5,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  progressText: { fontSize: 14, marginTop: 3 }
});
