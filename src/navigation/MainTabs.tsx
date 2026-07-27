import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { HomeScreen } from '../screens/HomeScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PublicProfileScreen } from '../screens/PublicProfileScreen';
import { NetworkScreen } from '../screens/NetworkScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ImportScreen } from '../screens/ImportScreen';

// Param lists
export type HomeStackParamList = {
  Home: undefined;
  BookDetail: { bookId: string };
};

export type FeedStackParamList = {
  Feed: undefined;
  PublicProfile: { username: string };
  BookDetailFeed: { bookId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Network: { username: string };
  Settings: undefined;
  Import: undefined;
  PublicProfileFromProfile: { username: string };
  BookDetailProfile: { bookId: string };
};

// Stacks
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} />
      <HomeStackNav.Screen name="BookDetail" component={BookDetailScreen} />
    </HomeStackNav.Navigator>
  );
}

const FeedStackNav = createNativeStackNavigator<FeedStackParamList>();
function FeedStack() {
  return (
    <FeedStackNav.Navigator screenOptions={{ headerShown: false }}>
      <FeedStackNav.Screen name="Feed" component={FeedScreen} />
      <FeedStackNav.Screen name="PublicProfile" component={PublicProfileScreen} />
      <FeedStackNav.Screen name="BookDetailFeed" component={BookDetailScreen} />
    </FeedStackNav.Navigator>
  );
}

const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} />
      <ProfileStackNav.Screen name="Network" component={NetworkScreen} />
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
      <ProfileStackNav.Screen name="Import" component={ImportScreen} />
      <ProfileStackNav.Screen name="PublicProfileFromProfile" component={PublicProfileScreen} />
      <ProfileStackNav.Screen name="BookDetailProfile" component={BookDetailScreen} />
    </ProfileStackNav.Navigator>
  );
}

// Tabs
const Tab = createBottomTabNavigator();

export function MainTabs() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="FeedTab"
        component={FeedStack}
        options={{
          tabBarLabel: t('tabs.feed'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📰</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
