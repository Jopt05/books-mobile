import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';

interface ProgressRingProps {
  /** Progress percentage, 0-100. */
  percent: number;
  /** Outer diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  thickness?: number;
  /** Centered label (e.g. "28%"). */
  label?: string;
}

/**
 * Dependency-free circular progress ring (no react-native-svg).
 *
 * Classic two-half-circle technique:
 * - The circle is split into left and right halves, each clipped with
 *   overflow:hidden.
 * - Inside each half sits a full-diameter "pie" element whose visible portion
 *   is a half-circle of the progress color, rotated from the vertical center
 *   line to sweep the arc.
 * - For 0-50% only the right half rotates (0deg -> 180deg). Past 50% the right
 *   half is fully filled and the left half rotates (0deg -> 180deg).
 * - An inner circle in the card color punches the donut hole and holds the
 *   centered label.
 */
export function ProgressRing({ percent, size = 76, thickness = 8, label }: ProgressRingProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, percent));
  const half = size / 2;
  const innerSize = size - thickness * 2;

  const rightDeg = clamped <= 50 ? (clamped / 50) * 180 : 180;
  const leftDeg = clamped <= 50 ? 0 : ((clamped - 50) / 50) * 180;

  const halfClip = { width: half, height: size, overflow: 'hidden' as const };
  // A full-diameter colored block clipped to a half via its parent, with a
  // rounded outer edge so the sweeping edge is a true semicircle.
  const pieBase = {
    width: half,
    height: size,
    backgroundColor: colors.primary,
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          backgroundColor: colors.border,
        }}
      />

      {/* RIGHT half */}
      <View style={[styles.rightWrap, halfClip]}>
        <View
          style={{
            width: half,
            height: size,
            transform: [{ rotate: `${rightDeg}deg` }],
            transformOrigin: 'left center',
          }}
        >
          <View
            style={[
              pieBase,
              { borderTopRightRadius: half, borderBottomRightRadius: half },
            ]}
          />
        </View>
      </View>

      {/* LEFT half */}
      <View style={[styles.leftWrap, halfClip]}>
        <View
          style={{
            width: half,
            height: size,
            transform: [{ rotate: `${leftDeg}deg` }],
            transformOrigin: 'right center',
          }}
        >
          <View
            style={[
              pieBase,
              { borderTopLeftRadius: half, borderBottomLeftRadius: half },
            ]}
          />
        </View>
      </View>

      {/* Donut hole + label */}
      <View
        style={{
          position: 'absolute',
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label != null && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  rightWrap: { position: 'absolute', right: 0, top: 0 },
  leftWrap: { position: 'absolute', left: 0, top: 0 },
  label: { fontSize: 16, fontFamily: fonts.bold },
});
