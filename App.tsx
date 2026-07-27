import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, View, Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, RobotoCondensed_400Regular, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider, useThemeContext } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { fonts } from './src/theme/typography';

// Apply Roboto Condensed globally to all Text and TextInput components
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: fonts.regular };
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = { fontFamily: fonts.regular };

export default function App() {
  const [fontsLoaded] = useFonts({
    RobotoCondensed_400Regular,
    RobotoCondensed_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { isDark } = useThemeContext();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LanguageProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </LanguageProvider>
    </>
  );
}
