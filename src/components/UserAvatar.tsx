import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface UserAvatarProps {
  uri: string | null;
  size: number;
}

export function UserAvatar({ uri, size }: UserAvatarProps) {
  const { colors } = useTheme();

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface }]}>
      <Ionicons name="person-outline" size={size * 0.5} color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  placeholder: { alignItems: 'center', justifyContent: 'center' }
});
