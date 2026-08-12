import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreenNative from "expo-splash-screen";
import React, { useEffect } from "react";
import Toast from 'react-native-toast-message';
import { SplashScreen } from '../components/SplashScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import '../i18n';
import './global.css';

void SplashScreenNative.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const rootSegment = segments[0];
    const isProtectedRoute = ["home", "offres", "entreprises", "stages"].includes(rootSegment);
    const isLoginRoute = rootSegment === "login";

    if (isAuthenticated && (isLoginRoute || !rootSegment)) {
      router.replace('/home');
    } else if (!isAuthenticated && isProtectedRoute) {
      router.replace('/login/login');
    }
  }, [isAuthenticated, loading, router, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "MavenPro-Regular": require("../assets/fonts/MavenPro-Regular.ttf"),
    "MavenPro-Medium": require("../assets/fonts/MavenPro-Medium.ttf"),
    "MavenPro-SemiBold": require("../assets/fonts/MavenPro-SemiBold.ttf"),
    "MavenPro-Bold": require("../assets/fonts/MavenPro-Bold.ttf"),
    "MavenPro-Black": require("../assets/fonts/MavenPro-Black.ttf"),
    "NotoSans-Bold": require("../assets/fonts/NotoSans-Bold.ttf"),
    "NotoSans-Regular": require("../assets/fonts/NotoSans-Regular.ttf"),
  });

  const [appReady, setAppReady] = React.useState(false);
  const [animationComplete, setAnimationComplete] = React.useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
    }
  }, [fontError, fontsLoaded]);

  if (!appReady) {
    return null;
  }

  if (!animationComplete) {
    return (
      <SplashScreen
        onAnimationComplete={() => {
          setAnimationComplete(true);
          void SplashScreenNative.hideAsync();
        }}
      />
    );
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
      <Toast />
    </AuthProvider>
  );
}
