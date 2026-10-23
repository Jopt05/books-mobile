import React, { useState } from 'react';
import { useWindowDimensions, StyleSheet, Text } from 'react-native';
import { TabView, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';

export interface SwipeTab {
  key: string;
  title: string;
  /**
   * Optional Ionicons glyph rendered to the left of the tab title. Mirrors the
   * icons used by the web app's tabs (e.g. info-circle / pencil), mapped to the
   * closest Ionicons equivalent so no extra icon font is needed.
   */
  icon?: keyof typeof Ionicons.glyphMap;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

interface SwipeTabsProps {
  tabs: SwipeTab[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function SwipeTabs({ tabs, initialIndex = 0, onIndexChange }: SwipeTabsProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  const routes = tabs.map((t) => ({ key: t.key, title: t.title }));

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const renderScene = ({ route }: SceneRendererProps & { route: { key: string } }) => {
    const tab = tabs.find((t) => t.key === route.key);
    if (!tab) return null;
    const Component = tab.component;
    return <Component {...(tab.props || {})} />;
  };

  // Per-route descriptors render the label (with the project font) and an
  // optional leading icon. Using `options` keeps the TabBar's built-in
  // indicator and press feedback while giving us full control of the content.
  const options = tabs.reduce<Record<string, {
    label: (p: { color: string }) => React.ReactNode;
    icon?: (p: { color: string }) => React.ReactNode;
  }>>((acc, tab) => {
    acc[tab.key] = {
      icon: tab.icon
        ? ({ color }) => <Ionicons name={tab.icon!} size={16} color={color} />
        : undefined,
      label: ({ color }) => (
        <Text style={[styles.tabLabel, { color }]}>{tab.title}</Text>
      ),
    };
    return acc;
  }, {});

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string }> },
  ) => (
    <TabBar
      {...props}
      options={options}
      style={{ backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }}
      indicatorStyle={{ backgroundColor: colors.primary, height: 3, borderRadius: 2 }}
      activeColor={colors.primary}
      inactiveColor={colors.textSecondary}
      pressColor={colors.border}
      gap={8}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={handleIndexChange}
      initialLayout={{ width }}
      renderTabBar={renderTabBar}
      lazy
    />
  );
}

const styles = StyleSheet.create({
  tabLabel: { fontSize: 14, fontFamily: fonts.bold, textTransform: 'none' },
});
