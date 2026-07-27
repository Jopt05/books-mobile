import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthForm } from '../hooks/useAuthForm';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { AuthStackParamList } from '../navigation/AuthStack';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Auth'>;

export function AuthScreen() {
  const nav = useNavigation<NavProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const {
    isLogin, email, setEmail, username, setUsername, password, setPassword,
    showPassword, togglePassword, errors, generalError, loading, handleSubmit, toggleMode,
  } = useAuthForm();

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          <TouchableOpacity onPress={() => nav.navigate('ForgotPassword')}>
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
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 20, textAlign: 'center', marginBottom: 24 },
  field: { marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 16 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  errorText: { fontSize: 14, marginTop: 4 },
  generalError: { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  submitBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  link: { fontSize: 14, textAlign: 'center', marginTop: 16 },
});
