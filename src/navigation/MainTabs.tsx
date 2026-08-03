import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { DiscussionsScreen } from '../screens/DiscussionsScreen';
import { DiscussionDetailScreen } from '../screens/DiscussionDetailScreen';
import { CreateDiscussionScreen } from '../screens/CreateDiscussionScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { NetworkScreen } from '../screens/NetworkScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ImportScreen } from '../screens/ImportScreen';
import { DrawerContent } from '../components/DrawerContent';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

// Param lists
export type HomeStackParamList = {
  Home: undefined;
  BookDetail: { bookId: string };
  UserProfile: { username: string };
};

export type SearchStackParamList = {
  Search: undefined;
  BookDetail: { bookId: string };
  UserProfile: { username: string };
};

export type FeedStackParamList = {
  Feed: undefined;
  UserProfile: { username: string };
  BookDetail: { bookId: string };
  Network: { username: string };
};

export type DiscussionsStackParamList = {
  Discussions: undefined;
  DiscussionDetail: { discussionId: string };
  CreateDiscussion: undefined;
  UserProfile: { username: string };
  BookDetail: { bookId: string };
};

export type ProfileStackParamList = {
  UserProfile: { username: string };
  Network: { username: string };
  Settings: undefined;
  Import: undefined;
  BookDetail: { bookId: string };
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
      <HomeStackNav.Screen name="UserProfile" component={UserProfileScreen} />
    </HomeStackNav.Navigator>
  );
}

const SearchStackNav = createNativeStackNavigator<SearchStackParamList>();
function SearchStack() {
  return (
    <SearchStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SearchStackNav.Screen name="Search" component={SearchScreen} />
      <SearchStackNav.Screen name="BookDetail" component={BookDetailScreen} />
      <SearchStackNav.Screen name="UserProfile" component={UserProfileScreen} />
    </SearchStackNav.Navigator>
  );
}

const FeedStackNav = createNativeStackNavigator<FeedStackParamList>();
function FeedStack() {
  return (
    <FeedStackNav.Navigator screenOptions={{ headerShown: false }}>
      <FeedStackNav.Screen name="Feed" component={FeedScreen} />
      <FeedStackNav.Screen name="UserProfile" component={UserProfileScreen} />
      <FeedStackNav.Screen name="BookDetail" component={BookDetailScreen} />
      <FeedStackNav.Screen name="Network" component={NetworkScreen} />
    </FeedStackNav.Navigator>
  );
}

const DiscussionsStackNav = createNativeStackNavigator<DiscussionsStackParamList>();
function DiscussionsStack() {
  return (
    <DiscussionsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <DiscussionsStackNav.Screen name="Discussions" component={DiscussionsScreen} />
      <DiscussionsStackNav.Screen name="DiscussionDetail" component={DiscussionDetailScreen} />
      <DiscussionsStackNav.Screen name="CreateDiscussion" component={CreateDiscussionScreen} />
      <DiscussionsStackNav.Screen name="UserProfile" component={UserProfileScreen} />
      <DiscussionsStackNav.Screen name="BookDetail" component={BookDetailScreen} />
    </DiscussionsStackNav.Navigator>
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
  const { user } = useAuth();
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen
        name="UserProfile"
        component={UserProfileScreen}
        initialParams={{ username: user?.username || '' }}
      />
      <ProfileStackNav.Screen name="Network" component={NetworkScreen} />
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
      <ProfileStackNav.Screen name="Import" component={ImportScreen} />
      <ProfileStackNav.Screen name="BookDetail" component={BookDetailScreen} />
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
      <Drawer.Screen name="SearchStack" component={SearchStack} />
      <Drawer.Screen name="FeedStack" component={FeedStack} />
      <Drawer.Screen name="DiscussionsStack" component={DiscussionsStack} />
      <Drawer.Screen name="SettingsStack" component={SettingsStack} />
      <Drawer.Screen name="ProfileStack" component={ProfileStack} />
    </Drawer.Navigator>
  );
}
