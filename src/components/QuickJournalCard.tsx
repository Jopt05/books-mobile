import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { ReadingProgress } from '../api/userBooks';

interface QuickJournalCardProps {
  books: ReadingProgress[];
  onSubmit: (userBookId: string, content: string) => void;
  submitting?: boolean;
}

export function QuickJournalCard({ books, onSubmit, submitting }: QuickJournalCardProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [selectedBook] = useState(books[0]?.userBookId || '');

  if (books.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('journal.quickEntry')}</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder={t('journal.content')}
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => { onSubmit(selectedBook, content); setContent(''); }}
        disabled={submitting || !content.trim()}
      >
        <Text style={styles.buttonText}>{t('journal.submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, borderRadius: 8, borderWidth: 1, marginHorizontal: 16, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 60, marginBottom: 8, textAlignVertical: 'top' },
  button: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
