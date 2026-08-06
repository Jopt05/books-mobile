import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../context/AuthContext';

export function AppHeader() {
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Ionicons name="menu-outline" size={26} color={colors.text} />
      </TouchableOpacity>
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
  }
});
