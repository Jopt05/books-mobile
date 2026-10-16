import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps {
  /** Page title. Mirrors the web MainLayout header. */
  title?: string;
  /** Optional secondary line under the title (e.g. a book's author). */
  subtitle?: string;
  /**
   * Left action style:
   * - 'menu' (default): hamburger that opens the drawer. For top-level pages.
   * - 'back': back arrow that pops the stack. For detail pages.
   */
  variant?: 'menu' | 'back';
  /** Custom handler for the back arrow (defaults to router.back()). */
  onBack?: () => void;
  /** Show the user avatar on the right (defaults to true). */
  showAvatar?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  variant = 'menu',
  onBack,
  showAvatar = true,
}: AppHeaderProps) {
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  const isBack = variant === 'back';
  const hasSubtitle = !!subtitle;

  const handleLeftPress = () => {
    if (isBack) {
      if (onBack) onBack();
      else router.back();
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={handleLeftPress} style={styles.leftBtn} hitSlop={8}>
        <Ionicons name={isBack ? 'arrow-back' : 'menu-outline'} size={26} color={colors.text} />
      </TouchableOpacity>

      {title ? (
        isBack ? (
          // Detail pages: title (+ optional subtitle) aligned next to the back
          // arrow, leaving room for the avatar on the right.
          <View style={styles.backTitleWrap} pointerEvents="none">
            <Text style={[styles.backTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            {hasSubtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
                {subtitle}
              </Text>
            )}
          </View>
        ) : (
          // Top-level pages: centered title, matching the previous behavior.
          <View style={styles.centerTitleWrap} pointerEvents="none">
            <Text style={[styles.centerTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>
        )
      ) : null}

      {showAvatar ? (
        <TouchableOpacity onPress={() => router.push('/(main)/(profile)')}>
          <UserAvatar uri={user?.avatar || null} size={32} />
        </TouchableOpacity>
      ) : (
        // Keep the title centered/spaced even without an avatar.
        <View style={styles.avatarPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  leftBtn: {
    // Fixed width so centered titles stay visually centered.
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  // Centered title (menu variant)
  centerTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginHorizontal: 56,
  },
  // Left-aligned title + subtitle (back variant)
  backTitleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  backTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 1,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
  },
});
