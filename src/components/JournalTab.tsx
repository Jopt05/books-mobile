import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Pressable, TextInput, Keyboard, Platform, RefreshControl } from 'react-native';
import * as Haptics from 'expo-haptics';
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
import { ConfirmModal } from './ConfirmModal';
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
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // Inline edit state: which entry is in edit mode and its draft text.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const listRef = useRef<FlatList<JournalEntry>>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track the keyboard height so the list reserves space for it while editing,
  // letting even the last entry scroll above the keyboard.
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Long-press enters edit mode on an entry, with a haptic cue so the
  // gesture is felt even though it has no persistent visual control.
  const startEdit = (id: string, current: string | null, index: number) => {
    Haptics.selectionAsync().catch(() => {});
    setEditingId(id);
    setDraft(current ?? '');
    setEditError('');
    // Bring the edited entry into view once the keyboard/layout settles.
    setTimeout(() => {
      listRef.current?.scrollToIndex({ index, viewPosition: 0, animated: true });
    }, 250);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft('');
    setEditError('');
    Keyboard.dismiss();
  };

  const saveEdit = async (id: string) => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setEditError(t('journal.editEmptyError'));
      return;
    }
    setSavingEdit(true);
    const ok = await journal.updateEntryContent(id, trimmed);
    setSavingEdit(false);
    if (ok) {
      cancelEdit();
    } else {
      setEditError(t('journal.editError'));
    }
  };

  const currentStatus = shelf.userBook?.status;
  const journalable = !!shelf.userBook && currentStatus !== 'WANT_TO_READ';

  // Load page 1 once when journalable (mirrors web's effect).
  useEffect(() => {
    if (journalable && !loadedRef.current && journal.entries.length === 0 && !journal.expanded) {
      loadedRef.current = true;
      journal.toggleExpanded();
    }
  }, [journalable, journal]);

  // Pull-to-refresh: reloads entries + count (and therefore the progress ring,
  // which is derived from the entries), so a book opened earlier picks up
  // entries created elsewhere (e.g. the Home quick-journal).
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await journal.refresh();
    } finally {
      setRefreshing(false);
    }
  };

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
      {journal.entries.length > 0 && (
        <View style={styles.hintRow}>
          <Ionicons name="create-outline" size={13} color={colors.textSecondary} />
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>{t('journal.editHint')}</Text>
        </View>
      )}
    </View>
  );

  const renderEntry = ({ item, index }: { item: JournalEntry; index: number }) => {
    const isEditing = editingId === item.id;
    return (
      <Pressable
        onLongPress={() => !isEditing && startEdit(item.id, item.content, index)}
        delayLongPress={350}
        style={({ pressed }) => [
          styles.entry,
          { backgroundColor: colors.card, borderColor: isEditing ? colors.primary : colors.border },
          isEditing && { borderWidth: 1.5 },
          pressed && !isEditing && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        ]}
      >
        <View style={styles.entryHeader}>
          <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setDeleteId(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={15} color={colors.error} />
            </TouchableOpacity>
          )}
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

        {isEditing ? (
          <View style={styles.editWrap}>
            <TextInput
              style={[styles.editInput, { color: colors.text, borderColor: colors.primary, backgroundColor: colors.background }]}
              value={draft}
              onChangeText={setDraft}
              placeholder={t('journal.placeholder')}
              placeholderTextColor={colors.textSecondary}
              multiline
              autoFocus
            />
            {editError ? (
              <Text style={[styles.editError, { color: colors.error }]}>{editError}</Text>
            ) : null}
            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.surface }]} onPress={cancelEdit}>
                <Text style={[styles.editBtnText, { color: colors.text }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: colors.primary, opacity: savingEdit ? 0.5 : 1 }]}
                onPress={() => saveEdit(item.id)}
                disabled={savingEdit}
              >
                <Text style={[styles.editBtnText, { color: '#FFFFFF' }]}>{savingEdit ? '...' : t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          item.content && (
            <Text style={[styles.entryContent, { color: colors.text }]}>{item.content}</Text>
          )
        )}
      </Pressable>
    );
  };

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
        ref={listRef}
        data={journalable ? journal.entries : []}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          editingId != null && keyboardHeight > 0 && { paddingBottom: keyboardHeight + 24 },
        ]}
        refreshControl={
          journalable ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          listRef.current?.scrollToOffset({ offset: index * averageItemLength, animated: true });
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index, viewPosition: 0, animated: true });
          }, 150);
        }}
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

      <ConfirmModal
        visible={deleteId != null}
        title={t('journal.delete')}
        message={t('journal.deleteConfirm')}
        onConfirm={() => {
          if (deleteId) journal.removeEntry(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
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
  progressNoData: { fontSize: 14, fontFamily: fonts.regular },
  progressMetaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 12 },
  entryCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryCount: { fontSize: 14, fontFamily: fonts.regular },

  newEntryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginTop: 16 },
  newEntryText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },

  myJournalTitle: { fontSize: 20, fontFamily: fonts.bold, marginTop: 20, marginBottom: 4 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  hintText: { fontSize: 14, fontFamily: fonts.regular },

  entry: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryDate: { fontSize: 14, fontFamily: fonts.regular },
  deleteBtn: { padding: 4 },
  entryContent: { fontSize: 16, marginTop: 6, fontFamily: fonts.regular },
  editWrap: { marginTop: 8 },
  editInput: { borderWidth: 1.5, borderRadius: 8, padding: 10, fontSize: 16, minHeight: 72, textAlignVertical: 'top', fontFamily: fonts.regular },
  editError: { fontSize: 14, marginTop: 6, fontFamily: fonts.regular },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  editBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  editBtnText: { fontSize: 14, fontFamily: fonts.bold },
  entryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  entryMeta: { fontSize: 14, fontFamily: fonts.regular },
  chip: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  chipText: { fontSize: 14, fontFamily: fonts.bold },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  footerText: { fontSize: 14, fontFamily: fonts.regular },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 16, fontFamily: fonts.regular },
});
