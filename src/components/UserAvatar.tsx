import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
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
      <Text style={{ fontSize: size * 0.4 }}>👤</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
