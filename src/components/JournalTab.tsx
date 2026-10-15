import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types/book';
import { JournalEntry, BookStatus } from '../types/domain';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useShelfButton } from '../hooks/useShelfButton';
import { useJournal } from '../hooks/useJournal';
import { EditableDate } from './EditableDate';
import { JournalEntryModal } from './JournalEntryModal';
import { ProgressRing } from './ProgressRing';
import { deriveReadingProgress } from '../utils/readingProgress';

const STATUS_LABEL_KEY: Record<BookStatus, string> = {
  WANT_TO_READ: 'shelf.wantToRead',
  READING: 'shelf.reading',
  READ: 'shelf.read',
  DID_NOT_FINISH: 'shelf.didNotFinish',
};

interface JournalTabProps {
  book: Book;
  shelf: ReturnType<typeof useShelfButton>;
  journal: ReturnType<typeof useJournal>;
}

export function JournalTab({ book, shelf, journal }: JournalTabProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const loadedRef = useRef(false);

  const currentStatus = shelf.userBook?.status;
  const journalable = !!shelf.userBook && currentStatus !== 'WANT_TO_READ';

  // Load page 1 once when journalable (mirrors web's effect).
  useEffect(() => {
    if (journalable && !loadedRef.current && journal.entries.length === 0 && !journal.expanded) {
      loadedRef.current = true;
      journal.toggleExpanded();
    }
  }, [journalable, journal]);

  const progress = deriveReadingProgress(journal.entries, book.pageCount, currentStatus);
  const entryCountValue = journal.entryCount ?? journal.entries.length;

  const renderProgressSummary = () => {
    const pageOfText =
      progress.hasProgress && progress.currentPage != null && book.pageCount
        ? t('journal.pageOf')
            .replace('{page}', String(progress.currentPage))
            .replace('{total}', String(book.pageCount))
        : null;

    const statusLabel = currentStatus ? t(STATUS_LABEL_KEY[currentStatus]) : '';

    return (
      <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.progressTopRow}>
          <ProgressRing
            percent={progress.percent}
            size={76}
            thickness={8}
            label={`${progress.percent}%`}
          />

          <View style={styles.progressInfo}>
            {progress.hasProgress ? (
              <>
                {!!statusLabel && (
                  <Text style={[styles.progressStatus, { color: colors.primary }]}>{statusLabel}</Text>
                )}
                {pageOfText && (
                  <Text style={[styles.progressPageOf, { color: colors.text }]}>{pageOfText}</Text>
                )}
              </>
            ) : (
              <Text style={[styles.progressNoData, { color: colors.textSecondary }]}>
                {t('journal.noProgressYet')}
              </Text>
            )}
          </View>
        </View>

        {/* Dates + entry count */}
        <View style={styles.progressMetaRow}>
          {shelf.userBook?.startedAt && (
            <EditableDate
              icon="calendar-outline"
              label={t('reading.startedOn')}
              value={shelf.userBook.startedAt}
              onSave={(date) => shelf.updateDates({ startedAt: date })}
            />
          )}
          {currentStatus === 'READ' && shelf.userBook?.finishedAt && (
            <EditableDate
              icon="checkmark-circle-outline"
              label={t('reading.finishedOn')}
              value={shelf.userBook.finishedAt}
              onSave={(date) => shelf.updateDates({ finishedAt: date })}
            />
          )}
          <View style={styles.entryCountRow}>
            <Ionicons name="create-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.entryCount, { color: colors.textSecondary }]}>
              {entryCountValue} {t('journal.entriesCount')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {renderProgressSummary()}

      <TouchableOpacity
        style={[styles.newEntryBtn, { backgroundColor: colors.primary }]}
        onPress={() => setModalOpen(true)}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.newEntryText}>{t('journal.newEntry')}</Text>
      </TouchableOpacity>

      <Text style={[styles.myJournalTitle, { color: colors.text }]}>{t('journal.myJournal')}</Text>
    </View>
  );

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={[styles.entry, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </Text>
        <TouchableOpacity onPress={() => journal.removeEntry(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={15} color={colors.error} />
        </TouchableOpacity>
      </View>

      {(item.page != null || item.percentage != null) && (
        <View style={styles.entryMetaRow}>
          <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
          {item.page != null && (
            <Text style={[styles.entryMeta, { color: colors.textSecondary }]}>p. {item.page}</Text>
          )}
          {item.percentage != null && (
            <View style={[styles.chip, { backgroundColor: colors.primary + '26' }]}>
              <Text style={[styles.chipText, { color: colors.primary }]}>{item.percentage}%</Text>
            </View>
          )}
        </View>
      )}

      {item.content && (
        <Text style={[styles.entryContent, { color: colors.text }]}>{item.content}</Text>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!journalable || !journal.loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('journal.loadingMore')}</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (!journalable) return null;
    if (journal.loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    return (
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('journal.noEntries')}</Text>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={journalable ? journal.entries : []}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (journalable && journal.hasMore && !journal.loadingMore) journal.loadMore();
        }}
        onEndReachedThreshold={0.4}
      />

      <JournalEntryModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        journal={journal}
        pageCount={book.pageCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },

  progressCard: { borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 16 },
  progressTopRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  progressInfo: { flex: 1 },
  progressStatus: { fontSize: 14, fontFamily: fonts.bold },
  progressPageOf: { fontSize: 16, fontFamily: fonts.bold, marginTop: 2 },
  progressNoData: { fontSize: 14 },
  progressMetaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 12 },
  entryCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryCount: { fontSize: 14 },

  newEntryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginTop: 16 },
  newEntryText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },

  myJournalTitle: { fontSize: 20, fontFamily: fonts.bold, marginTop: 20, marginBottom: 8 },

  entry: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryDate: { fontSize: 14 },
  deleteBtn: { padding: 4 },
  entryContent: { fontSize: 16, marginTop: 6 },
  entryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  entryMeta: { fontSize: 14 },
  chip: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  chipText: { fontSize: 14, fontFamily: fonts.bold },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  footerText: { fontSize: 14 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 16 },
});
