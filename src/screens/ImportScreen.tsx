import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useImport } from '../hooks/useImport';
import { Loader } from '../components/Loader';

export function ImportScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { result, loading, error, importFile } = useImport();

  const handlePick = () => {
    // In a real implementation, use expo-document-picker
    // For now just create FormData placeholder
    const formData = new FormData();
    importFile(formData);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('import.title')}</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handlePick} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t('import.importing') : t('import.selectFile')}</Text>
      </TouchableOpacity>

      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

      {result && (
        <View style={styles.results}>
          <Text style={[styles.subtitle, { color: colors.text }]}>{t('import.results')}</Text>
          <View style={styles.counterRow}>
            <Text style={[styles.counter, { color: colors.primary }]}>{result.imported} {t('import.imported')}</Text>
            <Text style={[styles.counter, { color: colors.textSecondary }]}>{result.skipped} {t('import.skipped')}</Text>
            <Text style={[styles.counter, { color: colors.error }]}>{result.failed} {t('import.failed')}</Text>
          </View>
          {result.details.length > 0 && (
            <FlatList
              data={result.details}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <View style={[styles.detailRow, { borderColor: colors.border }]}>
                  <Text style={[styles.detailTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.detailStatus, { color: item.status === 'imported' ? colors.primary : item.status === 'failed' ? colors.error : colors.textSecondary }]}>{item.status}</Text>
                </View>
              )}
            />
          )}
        </View>
      )}

      {loading && <Loader />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  errorText: { fontSize: 14, marginTop: 12 },
  results: { marginTop: 20 },
  subtitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  counter: { fontSize: 16, fontWeight: '600' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 },
  detailTitle: { fontSize: 14, flex: 1 },
  detailStatus: { fontSize: 14 },
});
