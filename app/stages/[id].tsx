import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ChartNoAxesColumnIncreasing,
  Mail,
  Target,
  Star,
  UserRound,
  XCircle,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FinalEvaluation, StageAssignment, StageStatus, stageService } from "../../api/stages";
import { StateView } from "../../components/StateView";
import { Typography } from "../../components/Typography";
import { WeeklyJournal } from "../../components/stages/WeeklyJournal";
import { formatDate } from "../../utils/dateUtils";

const statusStyles: Record<StageStatus, { color: string; background: string; icon: typeof Clock3 }> = {
  upcoming: { color: "#D97706", background: "bg-amber-50", icon: Clock3 },
  in_progress: { color: "#044EB8", background: "bg-blue-50", icon: BriefcaseBusiness },
  completed: { color: "#059669", background: "bg-emerald-50", icon: CheckCircle2 },
  cancelled: { color: "#DC2626", background: "bg-red-50", icon: XCircle },
};

export default function StageDetails() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const stageId = Number(id);
  const [stage, setStage] = useState<StageAssignment | null>(null);
  const [evaluation, setEvaluation] = useState<FinalEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStage = useCallback(async (refresh = false) => {
    if (!Number.isFinite(stageId)) {
      setErrorMessage(t("stage.invalid"));
      setLoading(false);
      return;
    }
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);
    try {
      const nextStage = await stageService.getById(stageId);
      setStage(nextStage);
      setEvaluation(await stageService.getEvaluation(nextStage.candidature));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("common.networkError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stageId, t]);

  useFocusEffect(useCallback(() => {
    void fetchStage();
  }, [fetchStage]));

  const openConvention = async () => {
    if (stage?.convention_pdf) await Linking.openURL(stage.convention_pdf);
  };

  const downloadCertificate = async () => {
    if (!stage) return;
    setDownloadingCertificate(true);
    try {
      await stageService.downloadCertificate(stage.id);
    } catch (error) {
      Alert.alert(
        t("stage.evaluation.certificateError"),
        error instanceof Error ? error.message : t("common.networkError"),
      );
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const status = stage ? statusStyles[stage.status] : null;
  const StatusIcon = status?.icon ?? Clock3;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-5 pb-3 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
          >
            <ArrowLeft size={22} color="#1D2633" />
          </TouchableOpacity>
          <View className="ml-3 flex-1">
            <Typography variant="h3" weight="bold" className="text-secondary">
              {t("stage.title")}
            </Typography>
            <Typography variant="label" className="text-gray-500">
              {t("stage.subtitle")}
            </Typography>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#044EB8" />
          </View>
        ) : errorMessage || !stage || !status ? (
          <StateView message={errorMessage ?? t("stage.notFound")} onRetry={() => void fetchStage()} />
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void fetchStage(true)} colors={["#044EB8"]} />
            }
          >
            <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <View className="flex-row items-start">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <BriefcaseBusiness size={23} color="#044EB8" />
                </View>
                <View className="ml-3 flex-1">
                  <Typography variant="body" weight="bold" className="text-secondary">
                    {stage.offre_title}
                  </Typography>
                  <Typography variant="caption" weight="semi" className="mt-1 text-primary">
                    {stage.company_name}
                  </Typography>
                </View>
              </View>

              <View className={`mt-4 flex-row items-center rounded-2xl p-3 ${status.background}`}>
                <StatusIcon size={19} color={status.color} />
                <Typography variant="caption" weight="bold" className="ml-2" style={{ color: status.color }}>
                  {t(`stage.status.${stage.status}`)}
                </Typography>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-gray-100 bg-white p-5">
              <Typography variant="caption" weight="bold" className="text-secondary">
                {t("stage.period")}
              </Typography>
              <View className="mt-3 flex-row items-center">
                <CalendarDays size={18} color="#667085" />
                <Typography variant="caption" className="ml-2 text-gray-600">
                  {stage.start_date ? formatDate(stage.start_date) : t("stage.toDefine")} — {stage.end_date ? formatDate(stage.end_date) : t("stage.toDefine")}
                </Typography>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-gray-100 bg-white p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <ChartNoAxesColumnIncreasing size={19} color="#044EB8" />
                  <Typography variant="caption" weight="bold" className="ml-2 text-secondary">
                    {t("stage.progress.title")}
                  </Typography>
                </View>
                <Typography variant="h3" weight="bold" className="text-primary">{stage.progress.percentage}%</Typography>
              </View>
              <View className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                <View className="h-full rounded-full bg-primary" style={{ width: `${stage.progress.percentage}%` }} />
              </View>
              <View className="mt-4 flex-row gap-2">
                <ProgressBox label={t("stage.progress.validated")} value={stage.progress.validated_weeks} />
                <ProgressBox label={t("stage.progress.pending")} value={stage.progress.pending_reports} color="#D97706" />
                <ProgressBox label={t("stage.progress.missing")} value={stage.progress.missing_weeks} color="#DC2626" />
              </View>
              <Typography variant="label" className="mt-3 text-center text-gray-400">{t("stage.progress.informative")}</Typography>
            </View>

            <View className={`mt-4 rounded-3xl border p-5 ${evaluation ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white"}`}>
                <View className="flex-row items-center">
                  <Star size={20} color={evaluation ? "#D97706" : "#98A2B3"} fill={evaluation ? "#FBBF24" : "transparent"} />
                  <Typography variant="caption" weight="bold" className={`ml-2 ${evaluation ? "text-amber-800" : "text-secondary"}`}>
                    {t("stage.evaluation.title")}
                  </Typography>
                </View>
                {evaluation ? (
                  <>
                    <Typography variant="h2" weight="bold" className="mt-3 text-amber-700">
                      {evaluation.score}<Typography variant="caption" className="text-gray-500"> / 10</Typography>
                    </Typography>
                    <Typography variant="caption" className="mt-3 leading-5 text-gray-700">
                      {evaluation.comments}
                    </Typography>
                    <TouchableOpacity
                      onPress={() => void downloadCertificate()}
                      disabled={downloadingCertificate}
                      className="mt-4 flex-row items-center justify-center rounded-2xl border border-amber-300 bg-white px-4 py-3"
                    >
                      {downloadingCertificate ? (
                        <ActivityIndicator color="#D97706" />
                      ) : (
                        <>
                          <FileText size={18} color="#D97706" />
                          <Typography variant="caption" weight="bold" className="ml-2 text-amber-700">
                            {t("stage.evaluation.downloadCertificate")}
                          </Typography>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <Typography variant="caption" className="mt-3 leading-5 text-gray-500">
                    {t(stage.status === "completed" ? "stage.evaluation.pending" : "stage.evaluation.afterCompletion")}
                  </Typography>
                )}
              </View>

            <View className="mt-4 rounded-3xl border border-gray-100 bg-white p-5">
              <View className="flex-row items-center">
                <Target size={19} color="#044EB8" />
                <Typography variant="caption" weight="bold" className="ml-2 text-secondary">
                  {t("stage.objectives")}
                </Typography>
              </View>
              <Typography variant="caption" className="mt-3 leading-5 text-gray-600">
                {stage.objectives || t("stage.noObjectives")}
              </Typography>
            </View>

            <View className="mt-4 rounded-3xl border border-gray-100 bg-white p-5">
              <View className="flex-row items-center">
                <UserRound size={19} color="#044EB8" />
                <Typography variant="caption" weight="bold" className="ml-2 text-secondary">
                  {t("stage.supervisor")}
                </Typography>
              </View>
              <Typography variant="caption" className="mt-3 text-gray-700">
                {stage.supervisor_name || t("stage.noSupervisor")}
              </Typography>
              {stage.supervisor_email ? (
                <TouchableOpacity
                  className="mt-2 flex-row items-center"
                  onPress={() => void Linking.openURL(`mailto:${stage.supervisor_email}`)}
                >
                  <Mail size={16} color="#044EB8" />
                  <Typography variant="caption" className="ml-2 text-primary">
                    {stage.supervisor_email}
                  </Typography>
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              disabled={!stage.convention_pdf}
              onPress={() => void openConvention()}
              className={`mt-4 flex-row items-center justify-center rounded-2xl px-4 py-4 ${stage.convention_pdf ? "bg-primary" : "bg-gray-200"}`}
            >
              <FileText size={19} color={stage.convention_pdf ? "#FFFFFF" : "#98A2B3"} />
              <Typography variant="caption" weight="bold" className={`ml-2 ${stage.convention_pdf ? "text-white" : "text-gray-500"}`}>
                {stage.convention_pdf ? t("stage.viewConvention") : t("stage.noConvention")}
              </Typography>
            </TouchableOpacity>

            <WeeklyJournal stageId={stage.id} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function ProgressBox({ label, value, color = "#1D2633" }: { label: string; value: number; color?: string }) {
  return <View className="flex-1 items-center rounded-2xl bg-gray-50 p-3"><Typography variant="h3" weight="bold" style={{ color }}>{value}</Typography><Typography variant="label" className="mt-1 text-center text-gray-500">{label}</Typography></View>;
}
