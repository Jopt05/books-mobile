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
 * Two-half technique with a rotating "cover":
 * - The whole circle starts painted in the progress color.
 * - Each half (right, then left) has a half-disc painted in the TRACK color
 *   that rotates to COVER the progress color. At 0% the cover sits flat over
 *   its half (so the half shows track); as progress grows the cover rotates
 *   away, revealing the progress arc underneath.
 * - Right half uncovers over 0-50%, left half over 50-100%. The arc grows
 *   clockwise from the top (12 o'clock), so a small percentage = a small arc.
 * - A center disc in the card color punches the donut hole and holds the label.
 */
export function ProgressRing({ percent, size = 76, thickness = 8, label }: ProgressRingProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, percent));
  const half = size / 2;
  const innerSize = size - thickness * 2;

  // Cover rotation. 0deg = fully covering its half (shows track),
  // 180deg = fully rotated away (reveals the progress color).
  const rightCoverDeg = clamped <= 50 ? (clamped / 50) * 180 : 180;
  const leftCoverDeg = clamped <= 50 ? 0 : ((clamped - 50) / 50) * 180;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Full progress-colored disc underneath */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          backgroundColor: colors.primary,
        }}
      />

      {/* RIGHT half window */}
      <View style={[styles.rightWindow, { width: half, height: size }]}>
        {/* Track-colored cover, anchored on the vertical center line */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: half,
            height: size,
            borderTopRightRadius: half,
            borderBottomRightRadius: half,
            backgroundColor: colors.border,
            transformOrigin: 'left center',
            transform: [{ rotate: `${rightCoverDeg}deg` }],
          }}
        />
      </View>

      {/* LEFT half window */}
      <View style={[styles.leftWindow, { width: half, height: size }]}>
        <View
          style={{
            position: 'absolute',
            right: 0,
            width: half,
            height: size,
            borderTopLeftRadius: half,
            borderBottomLeftRadius: half,
            backgroundColor: colors.border,
            transformOrigin: 'right center',
            transform: [{ rotate: `${leftCoverDeg}deg` }],
          }}
        />
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
  rightWindow: { position: 'absolute', right: 0, top: 0, overflow: 'hidden' },
  leftWindow: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
  label: { fontSize: 16, fontFamily: fonts.bold },
});
