import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ProfileStackParamList } from '../navigation/MainTabs';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

export function SettingsScreen() {
  const nav = useNavigation<NavProp>();
  const { colors, isDark, toggle } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>

      <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={toggle}>
        <Text style={[styles.rowText, { color: colors.text }]}>{t('settings.theme')}</Text>
        <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{isDark ? t('settings.darkMode') : t('settings.lightMode')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={() => setLocale(locale === 'es' ? 'en' : 'es')}>
        <Text style={[styles.rowText, { color: colors.text }]}>{t('settings.language')}</Text>
        <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{locale.toUpperCase()}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={() => nav.navigate('Import')}>
        <Text style={[styles.rowText, { color: colors.text }]}>{t('settings.import')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={logout}>
        <Text style={[styles.rowText, { color: colors.error }]}>{t('settings.logout')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  rowText: { fontSize: 16 },
  rowValue: { fontSize: 14 },
});
