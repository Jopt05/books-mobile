import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import type { SearchUserResult } from '../api/users';

interface Props {
  user: SearchUserResult;
}

export function UserSearchCard({ user }: Props) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/(main)/user/${user.username}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
          {user.username}
        </Text>
        {user.bio && (
          <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={1}>
            {user.bio}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  bio: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
});
