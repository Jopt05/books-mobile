import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useQuickFeed } from '../hooks/useQuickFeed';
import { ActivityCard } from './ActivityCard';
import { Loader } from './Loader';
import { fonts } from '../theme/typography';

export function QuickFeed() {
  const { activities, loading, refresh } = useQuickFeed();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) return <Loader />;
  if (activities.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('home.quickFeed')}</Text>
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('FeedStack')}
      >
        <Text style={styles.buttonText}>{t('home.goToFeed')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, marginBottom: 16 },
  title: { fontSize: 20, fontFamily: fonts.bold, marginBottom: 12, paddingHorizontal: 16 },
  button: { marginHorizontal: 16, marginTop: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
});
