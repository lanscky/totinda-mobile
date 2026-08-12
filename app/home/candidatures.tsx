import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, useFocusEffect, useRouter } from "expo-router";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  GraduationCap,
  MapPin,
  XCircle,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiRequest } from "../../api/client";
import { StateView } from "../../components/StateView";
import { Typography } from "../../components/Typography";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/dateUtils";

type ApplicationStatus = "pending" | "accepted" | "rejected";
type StatusFilter = "all" | ApplicationStatus;

type Application = {
  id: number;
  status: ApplicationStatus;
  created_at: string;
  offre_stage: number;
  offre_title: string;
  company_name: string;
  localisation: string;
  type_contrat: string;
  duration: string;
  company_message?: string | null;
  affectation_id?: number | null;
};

type PaginatedApplications = {
  results?: Application[];
};

const SEEN_ACCEPTANCES_KEY = "totinda_seen_acceptances";

export default function Candidatures() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const notificationVisible = useRef(false);

  const seenStorageKey = `${SEEN_ACCEPTANCES_KEY}:${user?.id ?? "anonymous"}`;

  const showNewAcceptance = useCallback(async (items: Application[]) => {
    if (!user?.id || notificationVisible.current) return;

    let seenIds: number[] = [];
    try {
      const stored = await AsyncStorage.getItem(seenStorageKey);
      if (stored) seenIds = JSON.parse(stored) as number[];
    } catch {
      seenIds = [];
    }

    const accepted = items.filter((item) => item.status === "accepted");
    const unseen = accepted.filter((item) => !seenIds.includes(item.id));
    if (unseen.length === 0) return;

    notificationVisible.current = true;
    const first = unseen[0];
    const updatedSeenIds = [...new Set([...seenIds, ...unseen.map((item) => item.id)])];

    const acknowledge = async (openOffer: boolean) => {
      await AsyncStorage.setItem(seenStorageKey, JSON.stringify(updatedSeenIds));
      notificationVisible.current = false;
      if (openOffer) {
        router.push({
          pathname: "/offres/[id]",
          params: { id: String(first.offre_stage) },
        });
      }
    };

    Alert.alert(
      t("applications.newAcceptanceTitle"),
      unseen.length > 1
        ? t("applications.newAcceptanceMultiple", { count: unseen.length })
        : t("applications.newAcceptanceMessage", {
            offer: first.offre_title,
            company: first.company_name,
          }),
      [
        {
          text: t("applications.understood"),
          onPress: () => void acknowledge(false),
        },
        {
          text: t("applications.viewOffer"),
          onPress: () => void acknowledge(true),
        },
      ],
      { cancelable: false },
    );
  }, [router, seenStorageKey, t, user?.id]);

  const fetchApplications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiRequest<Application[] | PaginatedApplications>(
        "candidatures/?limit=100",
      );
      const items = Array.isArray(data) ? data : data.results ?? [];
      setApplications(items);
      await showNewAcceptance(items);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("common.networkError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNewAcceptance, t]);

  useFocusEffect(
    useCallback(() => {
      void fetchApplications();
    }, [fetchApplications]),
  );

  const counts: Record<StatusFilter, number> = {
    all: applications.length,
    pending: applications.filter((item) => item.status === "pending").length,
    accepted: applications.filter((item) => item.status === "accepted").length,
    rejected: applications.filter((item) => item.status === "rejected").length,
  };

  const filteredApplications = filter === "all"
    ? applications
    : applications.filter((item) => item.status === filter);

  const statusConfig = {
    pending: {
      label: t("applications.pending"),
      description: t("applications.pendingDescription"),
      icon: Clock3,
      color: "#D97706",
      badgeClass: "bg-amber-50 border-amber-200",
      textClass: "text-amber-700",
    },
    accepted: {
      label: t("applications.accepted"),
      description: t("applications.acceptedDescription"),
      icon: CheckCircle2,
      color: "#059669",
      badgeClass: "bg-emerald-50 border-emerald-200",
      textClass: "text-emerald-700",
    },
    rejected: {
      label: t("applications.rejected"),
      description: t("applications.rejectedDescription"),
      icon: XCircle,
      color: "#DC2626",
      badgeClass: "bg-red-50 border-red-200",
      textClass: "text-red-700",
    },
  };

  const filters: StatusFilter[] = ["all", "pending", "accepted", "rejected"];

  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <SafeAreaView className="flex-1">
        <View className="px-6 pb-3 pt-4">
          <Typography variant="h2" font="maven" weight="bold" className="text-secondary">
            {t("applications.title")}
          </Typography>
          <Typography variant="caption" font="noto" className="mt-1 text-gray-500">
            {t("applications.subtitle")}
          </Typography>
        </View>

        <View className="mb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            {filters.map((item) => {
              const selected = filter === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setFilter(item)}
                  className={`flex-row items-center rounded-full border px-4 py-2 ${
                    selected ? "border-primary bg-primary" : "border-gray-200 bg-white"
                  }`}
                >
                  <Typography
                    variant="caption"
                    weight="bold"
                    color={selected ? "#FFFFFF" : undefined}
                    className={selected ? "text-white" : "text-gray-600"}
                  >
                    {t(`applications.filters.${item}`)}
                  </Typography>
                  <View className={`ml-2 rounded-full px-2 py-0.5 ${selected ? "bg-white/30" : "bg-gray-100"}`}>
                    <Typography
                      variant="label"
                      weight="bold"
                      color={selected ? "#FFFFFF" : undefined}
                      className={selected ? "text-white" : "text-gray-500"}
                    >
                      {counts[item]}
                    </Typography>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#044EB8" />
            <Typography className="mt-3 text-gray-500">{t("common.loading")}</Typography>
          </View>
        ) : errorMessage && applications.length === 0 ? (
          <StateView message={errorMessage} onRetry={() => void fetchApplications()} />
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void fetchApplications(true)}
                colors={["#044EB8"]}
              />
            }
          >
            {filteredApplications.length === 0 ? (
              <View className="items-center px-8 py-20">
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <FileSearch size={28} color="#044EB8" />
                </View>
                <Typography variant="body" font="noto" className="mt-4 text-center text-gray-500">
                  {filter === "all" ? t("applications.empty") : t("applications.emptyFilter")}
                </Typography>
              </View>
            ) : (
              filteredApplications.map((application) => {
                const config = statusConfig[application.status];
                const StatusIcon = config.icon;
                return (
                  <TouchableOpacity
                    key={application.id}
                    activeOpacity={0.75}
                    onPress={() =>
                      router.push({
                        pathname: "/offres/[id]",
                        params: { id: String(application.offre_stage) },
                      })
                    }
                    className="mb-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <View className="flex-row items-start">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                        <BriefcaseBusiness size={23} color="#044EB8" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Typography variant="body" font="maven" weight="bold" className="text-secondary" numberOfLines={2}>
                          {application.offre_title}
                        </Typography>
                        <Typography variant="caption" font="noto" weight="semi" className="mt-0.5 text-primary">
                          {application.company_name}
                        </Typography>
                      </View>
                      <ChevronRight size={20} color="#98A2B3" />
                    </View>

                    <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2">
                      <View className="flex-row items-center">
                        <MapPin size={14} color="#98A2B3" />
                        <Typography variant="label" font="noto" className="ml-1 text-gray-500">
                          {application.localisation}
                        </Typography>
                      </View>
                      <View className="flex-row items-center">
                        <CalendarDays size={14} color="#98A2B3" />
                        <Typography variant="label" font="noto" className="ml-1 text-gray-500">
                          {t("applications.appliedOn", { date: formatDate(application.created_at) })}
                        </Typography>
                      </View>
                    </View>

                    <View className={`mt-4 rounded-2xl border p-3 ${config.badgeClass}`}>
                      <View className="flex-row items-center">
                        <StatusIcon size={18} color={config.color} />
                        <Typography variant="caption" weight="bold" className={`ml-2 ${config.textClass}`}>
                          {config.label}
                        </Typography>
                      </View>
                      <Typography variant="label" font="noto" className={`mt-1.5 ${config.textClass}`}>
                        {config.description}
                      </Typography>
                    </View>
                    {application.company_message ? (
                      <View className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
                        <Typography variant="label" font="noto" weight="bold" className="text-primary">
                          {t("applications.companyMessage")}
                        </Typography>
                        <Typography variant="caption" font="noto" className="mt-1 text-gray-700">
                          {application.company_message}
                        </Typography>
                      </View>
                    ) : null}
                    {application.status === "accepted" && application.affectation_id ? (
                      <TouchableOpacity
                        className="mt-3 flex-row items-center justify-center rounded-2xl bg-primary px-4 py-3"
                        onPress={(event) => {
                          event.stopPropagation();
                          router.push({
                            pathname: "/stages/[id]",
                            params: { id: String(application.affectation_id) },
                          } as unknown as Href);
                        }}
                      >
                        <GraduationCap size={18} color="#FFFFFF" />
                        <Typography
                          variant="caption"
                          weight="bold"
                          color="#FFFFFF"
                          className="ml-2 text-white"
                        >
                          {t("applications.viewStage")}
                        </Typography>
                      </TouchableOpacity>
                    ) : null}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
