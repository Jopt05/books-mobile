import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthForm } from '../../src/hooks/useAuthForm';
import { useTheme } from '../../src/hooks/useTheme';
import { fonts } from '../../src/theme/typography';
import { useLanguage } from '../../src/context/LanguageContext';

export default function AuthScreen() {
  const router = useRouter();
  const { isDark, colors, toggle: toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const {
    isLogin, email, setEmail, username, setUsername, password, setPassword,
    showPassword, togglePassword, errors, generalError, loading, handleSubmit, toggleMode
  } = useAuthForm();

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
        <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.langBtn} onPress={() => setLocale(locale === 'es' ? 'en' : 'es')}>
        <Text style={[styles.langText, { color: colors.text }]}>{locale === 'es' ? 'EN' : 'ES'}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>{t('app.name')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isLogin ? t('auth.login') : t('auth.register')}
        </Text>

        {generalError ? <Text style={[styles.generalError, { color: colors.error }]}>{generalError}</Text> : null}

        <View style={styles.field}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: errors.email ? colors.error : colors.border }]}
            placeholder={t('auth.email')}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}
        </View>

        {!isLogin && (
          <View style={styles.field}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: errors.username ? colors.error : colors.border }]}
              placeholder={t('auth.username')}
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            {errors.username && <Text style={[styles.errorText, { color: colors.error }]}>{errors.username}</Text>}
          </View>
        )}

        <View style={styles.field}>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: errors.password ? colors.error : colors.border }]}
              placeholder={t('auth.password')}
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={togglePassword}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? t('common.loading') : (isLogin ? t('auth.login') : t('auth.register'))}</Text>
        </TouchableOpacity>

        {isLogin && (
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={[styles.link, { color: colors.primary }]}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={toggleMode}>
          <Text style={[styles.link, { color: colors.primary }]}>
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontFamily: fonts.bold, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 20, textAlign: 'center', marginBottom: 24 },
  field: { marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 16 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  errorText: { fontSize: 14, marginTop: 4 },
  generalError: { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  submitBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontFamily: fonts.bold },
  link: { fontSize: 14, textAlign: 'center', marginTop: 16 },
  themeBtn: { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  langBtn: { position: 'absolute', top: 52, right: 60, zIndex: 10, padding: 8 },
  langText: { fontSize: 15, fontFamily: fonts.bold }
});
