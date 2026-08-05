import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export function Loader() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/loader.gif')} style={styles.gif} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  gif: { width: 60, height: 60 }
});
