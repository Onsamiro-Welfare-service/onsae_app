import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import UserService from '@/services/userService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await UserService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Login status check error:', error);
      setIsLoggedIn(false);
    }
  };

  // Redirect based on login status
  useEffect(() => {
    if (isLoggedIn === null) return;
    router.replace(isLoggedIn ? '/' : '/login');
  }, [isLoggedIn]);

  // 로딩 중일 때는 아무것도 렌더링하지 않음
  if (isLoggedIn === null) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        initialRouteName={isLoggedIn ? 'index' : 'login'}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="survey" options={{ headerShown: false }} />
        <Stack.Screen name="complete" options={{ headerShown: false }} />
        <Stack.Screen name="inquiry" options={{ headerShown: false }} />
        <Stack.Screen name="inquiry-complete" options={{ headerShown: false }} />
        <Stack.Screen name="my-answers" options={{ headerShown: false }} />
        <Stack.Screen name="answer-detail" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
