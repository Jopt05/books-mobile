import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Linking } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ConfirmModal';

const NAV_ITEMS: { icon: keyof typeof Ionicons.glyphMap; labelKey: string; route: string; segment: string }[] = [
  { icon: 'home-outline', labelKey: 'sidebar.home', route: '/(main)/(home)', segment: '(home)' },
  { icon: 'search-outline', labelKey: 'sidebar.search', route: '/(main)/(search)', segment: '(search)' },
  { icon: 'newspaper-outline', labelKey: 'sidebar.feed', route: '/(main)/(feed)', segment: '(feed)' },
  { icon: 'bulb-outline', labelKey: 'sidebar.recommendations', route: '/(main)/(recommendations)', segment: '(recommendations)' },
  { icon: 'chatbubbles-outline', labelKey: 'sidebar.discussions', route: '/(main)/(discussions)', segment: '(discussions)' },
  { icon: 'settings-outline', labelKey: 'sidebar.settings', route: '/(main)/(settings)', segment: '(settings)' },
];

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const { colors, isDark, toggle } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const segments = useSegments() as string[];

  const insets = useSafeAreaInsets();

  // Determine active segment from current route
  const activeSegment = segments.length > 1 ? segments[1] : '';

  return (
    <SafeAreaView style={[
      styles.container, 
      { 
        backgroundColor: colors.surface, 
        borderRightColor: colors.border,
        paddingTop: insets.top,
        paddingBottom: 10
      }
    ]}>
      {/* Header - Logo */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={isDark ? require('../../assets/Modo Oscuro.png') : require('../../assets/Modo Claro.png')} style={styles.logo} />
          <Text style={[styles.appName, { color: colors.text }]}>Librerio</Text>
        </View>
      </View>

      {/* Nav Items */}
      <View style={styles.nav}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {t('sidebar.sections')}
        </Text>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSegment === item.segment;
          return (
            <TouchableOpacity
              key={item.segment}
              style={[
                styles.navItem,
                isActive && { backgroundColor: colors.primary + '1A' },
              ]}
              onPress={() => {
                router.push(item.route as any);
                navigation.closeDrawer();
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: isActive ? colors.primary : colors.textSecondary },
                  isActive && styles.navLabelActive,
                ]}
              >
                {t(item.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerTop}>
          <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
            {user?.username}
          </Text>
          <View style={styles.footerActions}>
            <TouchableOpacity onPress={() => setLocale(locale === 'es' ? 'en' : 'es')}>
              <Text style={[styles.langToggle, { color: colors.textSecondary }]}>
                {locale === 'en' ? 'ES' : 'EN'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggle}>
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
          <Text style={styles.logoutText}>{t('sidebar.logOut')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL('https://jopt05-amber.vercel.app/')}>
          <Text style={[styles.devCredit, { color: colors.textSecondary }]}>
            Developed by <Text style={{ color: colors.primary }}>Jesús Puentes</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={showLogoutModal}
        title={t('sidebar.logOutConfirmTitle')}
        message={t('sidebar.logOutConfirmMessage')}
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    borderRightWidth: 1
  },
  header: {
    marginBottom: 28
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 4
  },
  appName: {
    fontSize: 18,
    fontFamily: fonts.bold
  },
  nav: {
    flex: 1
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 2
  },
  navLabel: {
    fontSize: 14,
    fontFamily: fonts.regular
  },
  navLabelActive: {
    fontFamily: fonts.bold
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16
  },
  footerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  username: {
    fontSize: 14,
    fontFamily: fonts.bold,
    flex: 1
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  langToggle: {
    fontSize: 14,
    fontFamily: fonts.bold
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bold
  },
  devCredit: {
    fontSize: 12,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 8
  }
});
