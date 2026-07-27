import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { BookStatus } from '../types/domain';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';

interface ShelfButtonProps {
  currentStatus: BookStatus | null;
  onSelect: (status: BookStatus) => void;
  onRemove?: () => void;
  loading?: boolean;
}

const STATUS_KEYS: { status: BookStatus; key: string }[] = [
  { status: 'WANT_TO_READ', key: 'shelf.wantToRead' },
  { status: 'READING', key: 'shelf.reading' },
  { status: 'READ', key: 'shelf.read' },
];

export function ShelfButton({ currentStatus, onSelect, onRemove, loading }: ShelfButtonProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  const getStatusLabel = (): string => {
    if (!currentStatus) return t('shelf.addToShelf');
    switch (currentStatus) {
      case 'WANT_TO_READ': return t('shelf.wantToRead');
      case 'READING': return t('shelf.reading');
      case 'READ': return t('shelf.read');
      default: return t('shelf.addToShelf');
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => setVisible(true)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{getStatusLabel()}</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.menu, { backgroundColor: colors.card }]}>
            {STATUS_KEYS.map(({ status, key }) => (
              <TouchableOpacity
                key={status}
                style={[styles.option, status === currentStatus && { backgroundColor: colors.surface }]}
                onPress={() => { onSelect(status); setVisible(false); }}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{t(key)}</Text>
              </TouchableOpacity>
            ))}
            {currentStatus && onRemove && (
              <TouchableOpacity style={styles.option} onPress={() => { onRemove(); setVisible(false); }}>
                <Text style={[styles.optionText, { color: colors.error }]}>{t('shelf.remove')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menu: { width: '80%', borderRadius: 12, padding: 8 },
  option: { padding: 14, borderRadius: 8 },
  optionText: { fontSize: 16 },
});
