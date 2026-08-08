import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useReport } from '../hooks/useReport';
import type { ReportType } from '../api/reports';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ReportModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { type, setType, description, setDescription, loading, success, errors, submit, reset } = useReport();

  const handleClose = () => {
    reset();
    onClose();
  };

  const typeOptions: { key: ReportType; label: string }[] = [
    { key: 'BUG', label: t('report.typeBug') },
    { key: 'SUGGESTION', label: t('report.typeSuggestion') },
    { key: 'WRONG_CONTENT', label: t('report.typeWrongContent') },
    { key: 'OTHER', label: t('report.typeOther') },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          {success ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
              <Text style={[styles.successTitle, { color: colors.text }]}>{t('report.successTitle')}</Text>
              <Text style={[styles.successMessage, { color: colors.textSecondary }]}>{t('report.successMessage')}</Text>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleClose}>
                <Text style={styles.primaryBtnText}>{t('common.confirm')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView>
              <Text style={[styles.title, { color: colors.text }]}>{t('report.modalTitle')}</Text>

              <Text style={[styles.label, { color: colors.text }]}>{t('report.typeLabel')}</Text>
              <View style={styles.typeGrid}>
                {typeOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.typeChip,
                      { backgroundColor: type === opt.key ? colors.primary : colors.surface },
                    ]}
                    onPress={() => setType(opt.key)}
                  >
                    <Text style={[styles.typeChipText, { color: type === opt.key ? '#FFFFFF' : colors.textSecondary }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>{t('report.descriptionLabel')}</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder={t('report.descriptionPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              />
              {errors.description && <Text style={[styles.errorText, { color: colors.error }]}>{errors.description}</Text>}

              <View style={styles.buttons}>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.surface }]} onPress={handleClose}>
                  <Text style={[styles.cancelBtnText, { color: colors.text }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.5 : 1 }]}
                  onPress={submit}
                  disabled={loading}
                >
                  <Text style={styles.primaryBtnText}>{loading ? '...' : t('report.submit')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { width: '100%', borderRadius: 12, padding: 20, maxHeight: '80%' },
  title: { fontSize: 20, fontFamily: fonts.bold, marginBottom: 16 },
  label: { fontSize: 14, fontFamily: fonts.bold, marginBottom: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  typeChipText: { fontSize: 14, fontFamily: fonts.bold },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 100, marginBottom: 4 },
  errorText: { fontSize: 14, marginTop: 4, marginBottom: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtnText: { fontSize: 14, fontFamily: fonts.bold },
  primaryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  primaryBtnText: { fontSize: 14, fontFamily: fonts.bold, color: '#FFFFFF' },
  successContainer: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  successTitle: { fontSize: 20, fontFamily: fonts.bold, marginTop: 8 },
  successMessage: { fontSize: 16, textAlign: 'center', marginBottom: 12 },
});
