import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface EditableDateProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null;
  onSave: (isoDate: string) => Promise<void>;
}

function formatDisplay(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function EditableDate({ icon, label, value, onSave }: EditableDateProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentDate = value ? new Date(value) : new Date();

  const handleChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android the picker dismisses automatically
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (selectedDate) {
      setShowPicker(false);
      setSaving(true);
      try {
        await onSave(selectedDate.toISOString());
      } catch {
        /* ignore */
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.displayRow}
        onPress={() => setShowPicker(true)}
        disabled={saving}
      >
        <Ionicons name={icon as any} size={14} color={colors.textSecondary} />
        <Text style={[styles.displayText, { color: colors.textSecondary }]}>
          {label} {formatDisplay(value)}
        </Text>
        <Ionicons name="pencil-outline" size={12} color={colors.textSecondary} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  displayRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  displayText: { fontSize: 14 },
});
