import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useQuickJournal } from '../hooks/useQuickJournal';
import { ReadingProgress } from '../api/userBooks';

interface QuickJournalCardProps {
  onEntryCreated?: () => void;
}

export function QuickJournalCard({ onEntryCreated }: QuickJournalCardProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const {
    visible,
    books,
    selectedBook,
    setSelectedBook,
    content,
    setContent,
    saving,
    error,
    submit
  } = useQuickJournal();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    await submit();
    onEntryCreated?.();
  };

  const errorMessage = error === 'selectBook'
    ? t('journal.quickEntry')
    : error === 'emptyContent'
      ? t('journal.content')
      : error === 'saveFailed'
        ? t('common.error')
        : '';

  const handleSelectBook = (book: ReadingProgress) => {
    setSelectedBook(book);
    setPickerOpen(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.primary + '33' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="create-outline" size={22} color={colors.primary} />
        <Text style={[styles.headerText, { color: colors.text }]}>{t('journal.quickEntry')}</Text>
      </View>

      {/* Book selector (dropdown style) */}
      {books.length > 1 ? (
        <TouchableOpacity
          style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.background }]}
          onPress={() => setPickerOpen(true)}
        >
          <Text style={[styles.selectorText, { color: colors.text }]} numberOfLines={1}>
            {selectedBook ? `${selectedBook.title} — ${selectedBook.author}` : t('journal.quickEntry')}
          </Text>
          <Ionicons name="chevron-down-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : selectedBook ? (
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          {selectedBook.title} — {selectedBook.author}
        </Text>
      ) : null}

      {/* Content textarea */}
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
        placeholder={t('journal.content')}
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={3}
      />

      {/* Error */}
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text> : null}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: saving ? 0.5 : 1 }]}
        onPress={handleSubmit}
        disabled={saving}
      >
        <Text style={styles.submitText}>{saving ? '...' : t('journal.submit')}</Text>
      </TouchableOpacity>

      {/* Picker Modal */}
      <Modal visible={pickerOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
            <FlatList
              data={books}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    item.id === selectedBook?.id && { backgroundColor: colors.primary + '1A' },
                  ]}
                  onPress={() => handleSelectBook(item)}
                >
                  <Text style={[styles.pickerItemText, { color: item.id === selectedBook?.id ? colors.primary : colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.pickerItemAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.author}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  headerText: {
    fontSize: 18,
    fontFamily: fonts.bold
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10
  },
  selectorText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 10
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8
  },
  submitBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bold
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pickerModal: {
    width: '85%',
    maxHeight: 300,
    borderRadius: 12,
    padding: 8
  },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8
  },
  pickerItemText: {
    fontSize: 14,
    fontFamily: fonts.bold
  },
  pickerItemAuthor: {
    fontSize: 14,
    marginTop: 2
  }
});
