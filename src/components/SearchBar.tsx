import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';

const LIVE_DEBOUNCE_MS = 300;

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  history?: string[];
  onRemoveHistory?: (query: string) => void;
  /**
   * When provided, the query is propagated live as the user types (debounced),
   * including when the field is cleared — so the list resets on empty. Used for
   * in-memory filters like the book history screen.
   */
  onLiveChange?: (query: string) => void;
}

export function SearchBar({ onSearch, placeholder, history = [], onRemoveHistory, onLiveChange }: SearchBarProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const handleChangeText = (value: string) => {
    setText(value);
    if (!onLiveChange) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => onLiveChange(value.trim()), LIVE_DEBOUNCE_MS);
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSearch(text.trim());
      setFocused(false);
    }
  };

  const handleHistoryPress = (query: string) => {
    setText(query);
    onSearch(query);
    setFocused(false);
  };

  const showHistory = focused && history.length > 0 && !text.trim();

  return (
    <View>
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder || t('search.placeholder')}
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          returnKeyType="search"
        />
      </View>

      {showHistory && (
        <View style={[styles.historyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>
            {t('search.history')}
          </Text>
          {history.map((item) => (
            <View key={item} style={styles.historyItem}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => handleHistoryPress(item)}
              >
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.historyText, { color: colors.text }]}>{item}</Text>
              </TouchableOpacity>
              {onRemoveHistory && (
                <TouchableOpacity
                  onPress={() => onRemoveHistory(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={`${t('search.historyRemove')} ${item}`}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 12, borderRadius: 8, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  icon: { marginLeft: 12 },
  input: { flex: 1, padding: 12, fontSize: 16 },
  historyContainer: { marginHorizontal: 16, borderRadius: 8, borderWidth: 1, marginBottom: 12, paddingVertical: 4 },
  historyTitle: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14, fontWeight: '500' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  historyButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyText: { fontSize: 15 },
});
