import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { apiRequest } from "./client";

let registeredToken: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getProjectId = () =>
  Constants.easConfig?.projectId
  ?? Constants.expoConfig?.extra?.eas?.projectId;

export async function syncPushDevice(): Promise<string | null> {
  if (Platform.OS === "web" || !Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("totinda-default", {
      name: "Notifications Totinda",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#044EB8",
      sound: "default",
    });
  }

  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (permission.status !== "granted") return null;

  const projectId = getProjectId();
  if (!projectId) return null;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await apiRequest("push-devices/", {
    method: "POST",
    body: JSON.stringify({
      expo_push_token: token,
      platform: Platform.OS,
    }),
  });
  registeredToken = token;
  return token;
}

export async function deactivatePushDevice(): Promise<void> {
  if (!registeredToken) return;
  try {
    await apiRequest("push-devices/deactivate/", {
      method: "POST",
      body: JSON.stringify({ expo_push_token: registeredToken }),
    });
  } finally {
    registeredToken = null;
  }
}
