import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookStatus } from '../types/domain';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
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
  { status: 'DID_NOT_FINISH', key: 'shelf.didNotFinish' },
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
      case 'DID_NOT_FINISH': return t('shelf.didNotFinish');
      default: return t('shelf.addToShelf');
    }
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => setVisible(true)}
        disabled={loading}
      >
        <Ionicons name="book-outline" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>{getStatusLabel()}</Text>
        <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
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
  root: { width: '100%' },
  button: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menu: { width: '80%', borderRadius: 12, padding: 8 },
  option: { padding: 14, borderRadius: 8 },
  optionText: { fontSize: 16 }
});
