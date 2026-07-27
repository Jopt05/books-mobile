import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types/book';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

export function BookCard({ book, onPress }: BookCardProps) {
  const { colors } = useTheme();
  const genre = book.categories?.[0] || 'General';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Cover */}
      <View style={[styles.coverContainer, { backgroundColor: colors.border }]}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book-outline" size={24} color={colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[styles.authors, { color: colors.textSecondary }]} numberOfLines={1}>
            {book.authors.join(', ') || 'Autor desconocido'}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: colors.border }]}>
          <Text style={[styles.tagText, { color: colors.textSecondary }]}>{genre}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  coverContainer: {
    width: 72,
    height: 100,
    borderRadius: 6,
    overflow: 'hidden'
  },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.bold
  },
  authors: {
    fontSize: 14,
    marginTop: 2
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6
  },
  tagText: {
    fontSize: 14
  }
});
