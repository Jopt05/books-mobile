import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { BookStatus } from '../types/domain';

interface StatusActionSheetProps {
  visible: boolean;
  bookTitle: string;
  currentStatus: BookStatus | null;
  onSelectStatus: (status: BookStatus) => void;
  onRemove?: () => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { status: BookStatus; icon: keyof typeof Ionicons.glyphMap; labelKey: string }[] = [
  { status: 'WANT_TO_READ', icon: 'bookmark-outline', labelKey: 'shelf.wantToRead' },
  { status: 'READING', icon: 'book-outline', labelKey: 'shelf.reading' },
  { status: 'READ', icon: 'checkmark-circle-outline', labelKey: 'shelf.read' },
  { status: 'DID_NOT_FINISH', icon: 'close-circle-outline', labelKey: 'shelf.didNotFinish' },
];

export function StatusActionSheet({
  visible,
  bookTitle,
  currentStatus,
  onSelectStatus,
  onRemove,
  onClose,
}: StatusActionSheetProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {/* Book title */}
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {bookTitle}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Status options */}
          {STATUS_OPTIONS.map((option) => {
            const isActive = currentStatus === option.status;
            return (
              <TouchableOpacity
                key={option.status}
                style={[styles.option, isActive && { backgroundColor: colors.primary + '15' }]}
                onPress={() => onSelectStatus(option.status)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: isActive ? colors.primary : colors.text },
                    isActive && styles.optionTextActive,
                  ]}
                >
                  {t(option.labelKey)}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} style={styles.checkmark} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Remove option */}
          {onRemove && currentStatus && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <TouchableOpacity style={styles.option} onPress={onRemove}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.optionText, { color: colors.error }]}>
                  {t('shelf.remove')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    flex: 1,
  },
  optionTextActive: {
    fontFamily: fonts.bold,
  },
  checkmark: {
    marginLeft: 'auto',
  },
});
