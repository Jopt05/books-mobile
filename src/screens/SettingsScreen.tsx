import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        <View style={styles.rowLeft}>
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.text} />
          <Text style={[styles.rowText, { color: colors.text }]}>{t('settings.theme')}</Text>
        </View>
        <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{isDark ? t('settings.darkMode') : t('settings.lightMode')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={() => setLocale(locale === 'es' ? 'en' : 'es')}>
        <View style={styles.rowLeft}>
          <Ionicons name="language-outline" size={20} color={colors.text} />
          <Text style={[styles.rowText, { color: colors.text }]}>{t('settings.language')}</Text>
        </View>
        <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{locale.toUpperCase()}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={() => nav.navigate('Import')}>
        <View style={styles.rowLeft}>
          <Ionicons name="cloud-upload-outline" size={20} color={colors.text} />
          <Text style={[styles.rowText, { color: colors.text }]}>{t('settings.import')}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={logout}>
        <View style={styles.rowLeft}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.rowText, { color: colors.error }]}>{t('settings.logout')}</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { fontSize: 16 },
  rowValue: { fontSize: 14 },
});
