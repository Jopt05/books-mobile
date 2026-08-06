import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export function Loader() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('../../assets/loader.gif')} style={styles.gif} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  gif: { width: 60, height: 60 }
});
