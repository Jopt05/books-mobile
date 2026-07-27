import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../hooks/useNetwork';
import { UserAvatar } from '../components/UserAvatar';
import { Loader } from '../components/Loader';
import { ProfileStackParamList } from '../navigation/MainTabs';

type RouteParams = RouteProp<ProfileStackParamList, 'Network'>;
type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'Network'>;

export function NetworkScreen() {
  const route = useRoute<RouteParams>();
  const nav = useNavigation<NavProp>();
  const { username } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { followers, following, loading } = useNetwork(username);
  const [tab, setTab] = useState<'followers' | 'following'>('followers');

  if (loading) return <Loader />;

  const data = tab === 'followers' ? followers : following;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'followers' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setTab('followers')}>
          <Text style={[styles.tabText, { color: tab === 'followers' ? colors.primary : colors.textSecondary }]}>{t('network.followers')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'following' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setTab('following')}>
          <Text style={[styles.tabText, { color: tab === 'following' ? colors.primary : colors.textSecondary }]}>{t('network.following')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.userRow, { borderColor: colors.border }]} onPress={() => nav.navigate('PublicProfileFromProfile', { username: item.username })}>
            <UserAvatar uri={item.avatar} size={40} />
            <Text style={[styles.userName, { color: colors.text }]}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '600' },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  userName: { fontSize: 16, marginLeft: 12 },
});
