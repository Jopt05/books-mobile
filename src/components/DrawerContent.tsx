import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ConfirmModal';

const NAV_ITEMS: { icon: keyof typeof Ionicons.glyphMap; labelKey: string; route: string }[] = [
  { icon: 'home-outline', labelKey: 'sidebar.home', route: 'HomeStack' },
  { icon: 'search-outline', labelKey: 'sidebar.search', route: 'SearchStack' },
  { icon: 'newspaper-outline', labelKey: 'sidebar.feed', route: 'FeedStack' },
  { icon: 'settings-outline', labelKey: 'sidebar.settings', route: 'SettingsStack' },
];

export function DrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const { colors, isDark, toggle } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const activeRoute = state.routes[state.index]?.name;

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[
      styles.container, 
      { 
        backgroundColor: colors.surface, 
        borderRightColor: colors.border ,
        paddingTop: insets.top + 15,
        paddingBottom: insets.bottom
      }
    ]}>
      {/* Header - Logo */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/icono.png')} style={styles.logo} />
          <Text style={[styles.appName, { color: colors.text }]}>Anaquel</Text>
        </View>
      </View>

      {/* Nav Items */}
      <View style={styles.nav}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {t('sidebar.sections')}
        </Text>
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.navItem,
                isActive && { backgroundColor: colors.primary + '1A' },
              ]}
              onPress={() => navigation.navigate(item.route)}
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
  }
});
