import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface StarRatingProps {
  rating: number;
  onRate?: (n: number) => void;
  size?: number;
}

export function StarRating({ rating, onRate, size = 20 }: StarRatingProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          disabled={!onRate}
          onPress={() => onRate?.(n)}
          style={{ padding: 2 }}
        >
          <Text style={{ fontSize: size, color: n <= rating ? '#F59E0B' : colors.border }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
});
