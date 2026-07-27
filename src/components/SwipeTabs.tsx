import React, { useState } from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { TabView, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';

export interface SwipeTab {
  key: string;
  title: string;
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

  const renderTabBar = (props: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string }> }) => (
    <TabBar
      {...props}
      style={{ backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }}
      indicatorStyle={{ backgroundColor: colors.primary, height: 3, borderRadius: 2 }}
      renderLabel={({ route, focused }) => (
        <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.textSecondary }]}>
          {route.title}
        </Text>
      )}
      pressColor={colors.border}
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
  tabLabel: { fontSize: 14, fontFamily: fonts.bold, textTransform: 'none' }
});
