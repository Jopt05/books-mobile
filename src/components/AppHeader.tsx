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
  /** Page title shown centered in the header. Mirrors the web MainLayout mobile header. */
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Ionicons name="menu-outline" size={26} color={colors.text} />
      </TouchableOpacity>
      {title ? (
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
          pointerEvents="none"
        >
          {title}
        </Text>
      ) : null}
      <TouchableOpacity onPress={() => router.push('/(main)/(profile)')}>
        <UserAvatar uri={user?.avatar || null} size={32} />
      </TouchableOpacity>
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
    borderBottomWidth: 1
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: fonts.bold,
    // Keep clear of the menu button (left) and avatar (right)
    marginHorizontal: 56,
  }
});
