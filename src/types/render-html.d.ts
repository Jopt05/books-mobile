declare module 'react-native-render-html' {
  import { Component } from 'react';
  import { TextStyle } from 'react-native';

  interface RenderHtmlProps {
    contentWidth: number;
    source: { html: string };
    baseStyle?: TextStyle;
    tagsStyles?: Record<string, TextStyle>;
  }

  export default class RenderHtml extends Component<RenderHtmlProps> {}
}
