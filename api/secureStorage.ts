import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SESSION_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  userInfo: "user_info",
} as const;

const webSession = new Map<string, string>();

export const secureStorage = {
  get: (key: string) =>
    Platform.OS === "web" ? Promise.resolve(webSession.get(key) ?? null) : SecureStore.getItemAsync(key),
  set: (key: string, value: string) => {
    if (Platform.OS === "web") {
      webSession.set(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  remove: (key: string) => {
    if (Platform.OS === "web") {
      webSession.delete(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
  removeSession: () =>
    Promise.all([
      ...Object.values(SESSION_KEYS).map((key) => {
        if (Platform.OS === "web") {
          webSession.delete(key);
          return Promise.resolve();
        }
        return SecureStore.deleteItemAsync(key);
      }),
      AsyncStorage.multiRemove(Object.values(SESSION_KEYS)),
    ]),
  clearLegacySession: () => AsyncStorage.multiRemove(Object.values(SESSION_KEYS)),
};
