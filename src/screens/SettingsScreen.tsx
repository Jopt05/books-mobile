import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useImport } from '../hooks/useImport';
import { FadeIn } from '../components/FadeIn';
import { Loader } from '../components/Loader';
import { ConfirmModal } from '../components/ConfirmModal';
import { ReportModal } from '../components/ReportModal';
import { deactivateAccount } from '../api/users';
import type { ImportSource } from '../api/importBooks';

export function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { source, setSource, result, loading, error, importFile, reset } = useImport();
  const { logout } = useAuth();
  const [fileName, setFileName] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const sources: { key: ImportSource; label: string }[] = [
    { key: 'goodreads', label: 'Goodreads' },
    { key: 'hardcover', label: 'Hardcover' },
  ];

  const handlePickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
    if (res.canceled || !res.assets?.[0]) return;

    const file = res.assets[0];
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'text/csv'
    } as any);

    await importFile(formData);
  };

  const handleReset = () => {
    reset();
    setFileName(null);
  };

  const handleSourceChange = (s: ImportSource) => {
    setSource(s);
    handleReset();
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
      </View>

      <View style={styles.content}>
        {/* Import Section Card */}
        <FadeIn direction="up">
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('import.title')}</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            {t('settings.import')}
          </Text>

          {/* Source tabs */}
          {!result && !loading && (
            <View style={styles.tabs}>
              {sources.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.tab,
                    { backgroundColor: source === s.key ? colors.primary : colors.border },
                  ]}
                  onPress={() => handleSourceChange(s.key)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: source === s.key ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!result && !loading && (
            <>
              {/* Dropzone */}
              <TouchableOpacity
                style={[styles.dropzone, { borderColor: colors.border }]}
                onPress={handlePickFile}
              >
                <Ionicons name="cloud-upload-outline" size={36} color={colors.primary} />
                <Text style={[styles.dropzoneText, { color: colors.text }]}>
                  {fileName || t('import.selectFile')}
                </Text>
                <Text style={[styles.dropzoneHint, { color: colors.textSecondary }]}>
                  {source === 'hardcover' ? 'Hardcover CSV' : 'Goodreads CSV'}
                </Text>
              </TouchableOpacity>

              {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
            </>
          )}

          {/* Loading */}
          {loading && (
            <View style={styles.loadingState}>
              <Loader />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('import.importing')}</Text>
            </View>
          )}

          {/* Results */}
          {result && (
            <View>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: colors.background }]}>
                  <Text style={[styles.statNumber, { color: '#16A34A' }]}>{result.imported}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('import.imported')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.background }]}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>{result.skipped}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('import.skipped')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.background }]}>
                  <Text style={[styles.statNumber, { color: colors.error }]}>{result.failed}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('import.failed')}</Text>
                </View>
              </View>

              {result.details.length > 0 && (
                <FlatList
                  data={result.details}
                  keyExtractor={(_, i) => String(i)}
                  style={styles.detailsList}
                  renderItem={({ item }) => (
                    <View style={[styles.detailRow, { borderColor: colors.border }]}>
                      <Text style={[styles.detailTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.detailStatus, {
                        color: item.status === 'imported' ? '#16A34A' : item.status === 'failed' ? colors.error : colors.textSecondary
                      }]}>
                        {item.status}
                      </Text>
                    </View>
                  )}
                />
              )}

              <TouchableOpacity style={[styles.resetBtn, { backgroundColor: colors.border }]} onPress={handleReset}>
                <Text style={[styles.resetText, { color: colors.textSecondary }]}>{t('common.retry')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        </FadeIn>

        {/* Report a problem */}
        <FadeIn delay={50} direction="up">
          <View style={[styles.card, styles.reportCard, { backgroundColor: colors.card }]}>
            <View style={styles.reportRow}>
              <Ionicons name="bug-outline" size={22} color={colors.primary} style={{ marginTop: 2 }} />
              <View style={styles.reportContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('report.title')}</Text>
                <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{t('report.description')}</Text>
                <TouchableOpacity
                  style={[styles.reportBtn, { backgroundColor: colors.border }]}
                  onPress={() => setShowReportModal(true)}
                >
                  <Text style={[styles.reportBtnText, { color: colors.textSecondary }]}>{t('report.button')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </FadeIn>

        <ReportModal visible={showReportModal} onClose={() => setShowReportModal(false)} />

        {/* Deactivate account */}
        <FadeIn delay={100} direction="up">
          <View style={[styles.card, styles.deactivateCard, { backgroundColor: colors.card, borderColor: colors.error + '40' }]}>
            <Text style={[styles.cardTitle, { color: colors.error }]}>{t('settings.deactivateTitle')}</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {t('settings.deactivateDesc')}
            </Text>
            <TouchableOpacity
              style={[styles.deactivateBtn, { backgroundColor: colors.error + '1A' }]}
              onPress={() => setShowDeactivateModal(true)}
            >
              <Text style={[styles.deactivateBtnText, { color: colors.error }]}>
                {t('settings.deactivateBtn')}
              </Text>
            </TouchableOpacity>
          </View>
        </FadeIn>
      </View>

      <ConfirmModal
        visible={showDeactivateModal}
        title={t('settings.deactivateTitle')}
        message={t('settings.deactivateConfirm')}
        onConfirm={async () => {
          setShowDeactivateModal(false);
          setDeactivating(true);
          try {
            await deactivateAccount();
            logout();
          } catch {
            setDeactivating(false);
          }
        }}
        onCancel={() => setShowDeactivateModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontFamily: fonts.bold },
  content: { flex: 1, paddingHorizontal: 16 },
  card: { borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardTitle: { fontSize: 20, fontFamily: fonts.bold, marginBottom: 4 },
  cardDescription: { fontSize: 14, marginBottom: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  tabText: { fontSize: 14, fontFamily: fonts.bold },
  dropzone: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, padding: 30, alignItems: 'center', gap: 8 },
  dropzoneText: { fontSize: 14, fontFamily: fonts.bold, textAlign: 'center' },
  dropzoneHint: { fontSize: 14 },
  errorText: { fontSize: 14, marginTop: 10 },
  loadingState: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  loadingText: { fontSize: 14 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 8, padding: 12, alignItems: 'center' },
  statNumber: { fontSize: 24, fontFamily: fonts.bold },
  statLabel: { fontSize: 14, marginTop: 4 },
  detailsList: { maxHeight: 200 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  detailTitle: { fontSize: 14, flex: 1, marginRight: 8 },
  detailStatus: { fontSize: 14 },
  resetBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  resetText: { fontSize: 14, fontFamily: fonts.bold },
  deactivateCard: { marginTop: 16, borderWidth: 1 },
  deactivateBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  deactivateBtnText: { fontSize: 14, fontFamily: fonts.bold },
  reportCard: { marginTop: 16 },
  reportRow: { flexDirection: 'row', gap: 12 },
  reportContent: { flex: 1 },
  reportBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  reportBtnText: { fontSize: 14, fontFamily: fonts.bold },
});
