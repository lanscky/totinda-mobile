import { Href, useFocusEffect, useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { notificationService } from "../api/notifications";
import { Typography } from "./Typography";

export function NotificationButton() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    void notificationService.unreadCount()
      .then((result) => { if (active) setCount(result.count); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []));

  return (
    <TouchableOpacity
      onPress={() => router.push("/notifications" as unknown as Href)}
      className="relative h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white"
    >
      <Bell size={21} color="#1D2633" />
      {count > 0 ? (
        <View className="absolute -right-1 -top-1 min-w-5 items-center rounded-full bg-red-500 px-1 py-0.5">
          <Typography variant="label" weight="bold" color="#FFFFFF" className="text-white">
            {count > 99 ? "99+" : count}
          </Typography>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
