declare module 'react-native-tab-view' {
  import { Component, ReactNode } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface Route {
    key: string;
    title?: string;
  }

  export interface NavigationState<T extends Route = Route> {
    index: number;
    routes: T[];
  }

  export interface SceneRendererProps {
    layout: { width: number; height: number };
    position: any;
    jumpTo: (key: string) => void;
  }

  export interface TabViewProps<T extends Route = Route> {
    navigationState: NavigationState<T>;
    renderScene: (props: SceneRendererProps & { route: T }) => ReactNode;
    onIndexChange: (index: number) => void;
    initialLayout?: { width?: number; height?: number };
    renderTabBar?: (props: SceneRendererProps & { navigationState: NavigationState<T> }) => ReactNode;
    lazy?: boolean;
    swipeEnabled?: boolean;
    style?: ViewStyle;
  }

  export class TabView<T extends Route = Route> extends Component<TabViewProps<T>> {}

  export interface TabBarProps<T extends Route = Route> {
    navigationState: NavigationState<T>;
    style?: ViewStyle;
    indicatorStyle?: ViewStyle;
    labelStyle?: TextStyle;
    renderLabel?: (props: { route: T; focused: boolean; color: string }) => ReactNode;
    pressColor?: string;
    scrollEnabled?: boolean;
  }

  export class TabBar<T extends Route = Route> extends Component<TabBarProps<T>> {}
}

declare module 'react-native-pager-view' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  interface PagerViewProps extends ViewProps {
    initialPage?: number;
    onPageSelected?: (e: { nativeEvent: { position: number } }) => void;
  }

  export default class PagerView extends Component<PagerViewProps> {}
}
