import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useJournal } from '../hooks/useJournal';

interface JournalEntryModalProps {
  visible: boolean;
  onClose: () => void;
  journal: ReturnType<typeof useJournal>;
  pageCount?: number;
}

export function JournalEntryModal({ visible, onClose, journal, pageCount }: JournalEntryModalProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const {
    content, setContent,
    progressValue, setProgressValue,
    progressMode, setProgressMode,
    saving, error, submit,
  } = journal;

  // Live computed hint, mirroring the hook's submit arithmetic.
  let hint = '';
  const numVal = progressValue ? parseInt(progressValue, 10) : NaN;
  if (progressValue && !isNaN(numVal) && pageCount) {
    if (progressMode === 'page') {
      hint = `(${Math.round((numVal / pageCount) * 100)}%)`;
    } else {
      hint = `(p. ${Math.round((numVal / 100) * pageCount)})`;
    }
  }

  const handleSubmit = async () => {
    const ok = await submit();
    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('journal.newEntryTitle')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content input */}
          <TextInput
            style={[styles.contentInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder={t('journal.placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
          />

          {/* Progress row */}
          <View style={styles.progressRow}>
            <View style={[styles.modeToggle, { borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modeBtn, progressMode === 'page' && { backgroundColor: colors.primary }]}
                onPress={() => { setProgressMode('page'); setProgressValue(''); }}
              >
                <Text style={[styles.modeBtnText, { color: progressMode === 'page' ? '#FFFFFF' : colors.textSecondary }]}>
                  {t('journal.page')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, progressMode === 'percentage' && { backgroundColor: colors.primary }]}
                onPress={() => { setProgressMode('percentage'); setProgressValue(''); }}
              >
                <Text style={[styles.modeBtnText, { color: progressMode === 'percentage' ? '#FFFFFF' : colors.textSecondary }]}>
                  %
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.progressInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder={progressMode === 'page' ? t('journal.page') : '%'}
              placeholderTextColor={colors.textSecondary}
              value={progressValue}
              onChangeText={setProgressValue}
              keyboardType="numeric"
            />

            {hint ? (
              <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
            ) : null}
          </View>

          {/* Validation error */}
          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.surface }]} onPress={onClose}>
              <Text style={[styles.btnText, { color: colors.text }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, opacity: saving ? 0.5 : 1 }]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{saving ? '...' : t('journal.submit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 480, borderRadius: 12, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontFamily: fonts.bold, flex: 1 },
  closeBtn: { padding: 4 },
  contentInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  modeToggle: { flexDirection: 'row', borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  modeBtnText: { fontSize: 14, fontFamily: fonts.bold },
  progressInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, width: 70 },
  hint: { fontSize: 14 },
  error: { fontSize: 14, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnText: { fontSize: 14, fontFamily: fonts.bold },
});
