import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '../../src/components/DrawerContent';
import { useTheme } from '../../src/hooks/useTheme';

export default function MainLayout() {
  const { colors } = useTheme();

  return (
    <Drawer
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
      <Drawer.Screen name="(home)" options={{ drawerLabel: 'Home' }} />
      <Drawer.Screen name="(search)" options={{ drawerLabel: 'Search' }} />
      <Drawer.Screen name="(feed)" options={{ drawerLabel: 'Feed' }} />
      <Drawer.Screen name="(recommendations)" options={{ drawerLabel: 'Recommendations' }} />
      <Drawer.Screen name="(discussions)" options={{ drawerLabel: 'Discussions' }} />
      <Drawer.Screen name="(settings)" options={{ drawerLabel: 'Settings' }} />
      <Drawer.Screen name="(profile)" options={{ drawerLabel: 'Profile' }} />
      <Drawer.Screen name="book" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="user" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="discussion" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="network" options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}
