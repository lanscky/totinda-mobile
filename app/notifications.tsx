import { Stack, useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, Bell, CheckCheck, CheckCircle2, Clock3, FileCheck2, Star } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ImageBackground, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppNotification, NotificationType, notificationService } from "../api/notifications";
import { StateView } from "../components/StateView";
import { Typography } from "../components/Typography";

const icons: Record<NotificationType, typeof Bell> = {
  application_decision: CheckCircle2,
  report_submitted: FileCheck2,
  report_validated: CheckCircle2,
  evaluation_published: Star,
  weekly_reminder: Clock3,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try { setItems(await notificationService.list()); }
    catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Impossible de charger les notifications."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const openItem = async (item: AppNotification) => {
    if (!item.is_read) {
      await notificationService.markRead(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry));
    }
    if (item.data.stage_id) router.push({ pathname: "/stages/[id]", params: { id: String(item.data.stage_id) } });
    else if (item.notification_type === "application_decision") router.push("/home/candidatures");
  };

  const markAll = async () => {
    await notificationService.markAllRead();
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground source={require("../assets/onboard/background_page.png")} className="absolute h-full w-full" resizeMode="cover" />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-5 pb-3 pt-4">
          <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-2xl bg-white"><ArrowLeft size={22} color="#1D2633" /></TouchableOpacity>
          <View className="ml-3 flex-1"><Typography variant="h3" weight="bold" className="text-secondary">Notifications</Typography><Typography variant="label" className="text-gray-500">Événements importants de votre stage</Typography></View>
          {items.some((item) => !item.is_read) ? <TouchableOpacity onPress={() => void markAll()} className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-50"><CheckCheck size={21} color="#044EB8" /></TouchableOpacity> : null}
        </View>
        {loading ? <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#044EB8" /></View> : error ? <StateView message={error} onRetry={() => void load()} /> : (
          <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} colors={["#044EB8"]} />}>
            {items.length === 0 ? <View className="flex-1 items-center justify-center py-20"><Bell size={42} color="#98A2B3" /><Typography className="mt-3 text-gray-500">Aucune notification pour le moment.</Typography></View> : items.map((item) => {
              const Icon = icons[item.notification_type];
              return <TouchableOpacity key={item.id} onPress={() => void openItem(item)} className={`mb-3 rounded-2xl border p-4 ${item.is_read ? "border-gray-100 bg-white" : "border-blue-100 bg-blue-50"}`}><View className="flex-row items-start"><View className="h-10 w-10 items-center justify-center rounded-xl bg-white"><Icon size={19} color="#044EB8" /></View><View className="ml-3 flex-1"><View className="flex-row items-start"><Typography variant="caption" weight="bold" className="flex-1 text-secondary">{item.title}</Typography>{!item.is_read ? <View className="ml-2 mt-1 h-2 w-2 rounded-full bg-primary" /> : null}</View><Typography variant="caption" className="mt-1 leading-5 text-gray-600">{item.message}</Typography><Typography variant="label" className="mt-2 text-gray-400">{new Date(item.created_at).toLocaleString("fr-FR")}</Typography></View></View></TouchableOpacity>;
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
