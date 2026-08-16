import { useFonts } from "expo-font";
import { Href, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreenNative from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import React, { useCallback, useEffect } from "react";
import Toast from 'react-native-toast-message';
import { SplashScreen } from '../components/SplashScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import '../i18n';
import './global.css';
import { notificationService } from '../api/notifications';

void SplashScreenNative.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const openPushNotification = useCallback((response: Notifications.NotificationResponse) => {
    if (!isAuthenticated) return;
    const data = response.notification.request.content.data as {
      notification_id?: number;
      notification_type?: string;
      stage_id?: number;
    };
    if (data.notification_id) {
      void notificationService.markRead(data.notification_id).catch(() => undefined);
    }
    if (data.stage_id) {
      router.push({ pathname: "/stages/[id]", params: { id: String(data.stage_id) } });
    } else if (data.notification_type === "application_decision") {
      router.push("/home/candidatures" as Href);
    } else {
      router.push("/notifications" as Href);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (loading) return;

    const rootSegment = segments[0];
    const isProtectedRoute = ["home", "offres", "entreprises", "stages", "notifications", "profile"].includes(rootSegment);
    const isLoginRoute = rootSegment === "login";

    if (isAuthenticated && (isLoginRoute || !rootSegment)) {
      router.replace('/home');
    } else if (!isAuthenticated && isProtectedRoute) {
      router.replace('/login/login');
    }
  }, [isAuthenticated, loading, router, segments]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(openPushNotification);
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        openPushNotification(response);
        void Notifications.clearLastNotificationResponseAsync();
      }
    });
    return () => subscription.remove();
  }, [openPushNotification]);

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
