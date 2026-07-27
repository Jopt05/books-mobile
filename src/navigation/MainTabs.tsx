import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PublicProfileScreen } from '../screens/PublicProfileScreen';
import { NetworkScreen } from '../screens/NetworkScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ImportScreen } from '../screens/ImportScreen';
import { DrawerContent } from '../components/DrawerContent';
import { useTheme } from '../hooks/useTheme';

// Param lists
export type HomeStackParamList = {
  Home: undefined;
  BookDetail: { bookId: string };
  PublicProfile: { username: string };
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

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Import: undefined;
};

// Stacks
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} />
      <HomeStackNav.Screen name="BookDetail" component={BookDetailScreen} />
      <HomeStackNav.Screen name="PublicProfile" component={PublicProfileScreen} />
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

const SettingsStackNav = createNativeStackNavigator<SettingsStackParamList>();
function SettingsStack() {
  return (
    <SettingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStackNav.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStackNav.Screen name="Import" component={ImportScreen} />
    </SettingsStackNav.Navigator>
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

// Drawer
const Drawer = createDrawerNavigator();

export function MainTabs() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 240,
          backgroundColor: colors.surface,
        },
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen name="HomeStack" component={HomeStack} />
      <Drawer.Screen name="FeedStack" component={FeedStack} />
      <Drawer.Screen name="SettingsStack" component={SettingsStack} />
      <Drawer.Screen name="ProfileStack" component={ProfileStack} />
    </Drawer.Navigator>
  );
}
