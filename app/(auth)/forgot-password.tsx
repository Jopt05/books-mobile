import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { fonts } from '../../src/theme/typography';
import { useLanguage } from '../../src/context/LanguageContext';
import { forgotPassword } from '../../src/api/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError(t('auth.errors.emailRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('auth.errors.emailInvalid'));
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSuccess(t('auth.resetSent'));
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('auth.forgotPassword')}</Text>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: error ? colors.error : colors.border }]}
        placeholder={t('auth.email')}
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
      {success ? <Text style={[styles.successText, { color: colors.primary }]}>{success}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? t('common.loading') : t('auth.sendReset')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.link, { color: colors.primary }]}>← {t('auth.login')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontFamily: fonts.bold, marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 4 },
  errorText: { fontSize: 14, marginBottom: 12 },
  successText: { fontSize: 14, marginBottom: 12 },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontFamily: fonts.bold },
  link: { fontSize: 14, textAlign: 'center', marginTop: 20 }
});
