import { useLocalSearchParams, useRouter } from "expo-router";
import { Briefcase, CalendarX2, ChevronLeft, Clock, DollarSign, MapPin, Users } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useTranslation } from "react-i18next";
import { apiRequest } from "../../api/client";
import { Button } from "../../components/Button";
import { StateView } from "../../components/StateView";
import { Typography } from "../../components/Typography";
import { useAuth } from "../../context/AuthContext";
import { formatDate, isDeadlinePassed, timeAgo } from "../../utils/dateUtils";

type OfferDetails = {
  id: number;
  nombre_candidats: number;
  plan_entreprise: number | string | null;
  title: string;
  type_contrat: string;
  remuneration: number | null;
  duration: string;
  description: string;
  localisation: string;
  niveau_requis: string;
  start_date: string;
  end_date?: string | null;
  published_at?: string;
  nom_entreprise: string;
};

export default function DetailOffre() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOffer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      setOffer(await apiRequest<OfferDetails>(`offres-stage/${id}/`));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void fetchOffer();
  }, [fetchOffer]);

  const isExpired = isDeadlinePassed(offer?.end_date);
  const isFreePlan = Number(offer?.plan_entreprise) === 0;
  const candidateCount = Number(offer?.nombre_candidats ?? 0);
  const hasReachedFreeLimit =
    isFreePlan && candidateCount >= 5;

  const handlePostuler = async () => {
    if (!offer) {
      Toast.show({
        type: "error",
        text1: t("common.error_title"),
        text2: t("offres.offerUnavailable"),
      });
      return;
    }

    const studentId = user?.student?.id_student;
    if (!studentId) {
      Toast.show({
        type: "error",
        text1: t("common.error_title"),
        text2: t("offres.studentProfileMissing"),
      });
      return;
    }

    if (applied) return;
    if (isExpired || hasReachedFreeLimit) return;
    if (!motivation.trim()) {
      Toast.show({
        type: "error",
        text1: t("common.error_title"),
        text2: t("offres.motivationRequired"),
      });
      return;
    }

    try {
      setApplying(true);
      await apiRequest("candidatures/", {
        method: "POST",
        body: JSON.stringify({
          offre_stage: offer.id,
          motivation: motivation.trim(),
        }),
      });
      setApplied(true);
      setApplicationModalVisible(false);
      setMotivation("");
      setOffer((current) =>
        current
          ? {
              ...current,
              nombre_candidats: Number(current.nombre_candidats) + 1,
            }
          : current,
      );
      Toast.show({ type: "success", text1: t('common.success_title'), text2: t('offres.applySuccess') });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t('common.error_title'),
        text2: error instanceof Error ? error.message : t('offres.applyError'),
      });
    } finally {
      setApplying(false);
    }
  };

  const openApplicationModal = () => {
    if (!user?.student?.id_student) {
      Toast.show({
        type: "error",
        text1: t("common.error_title"),
        text2: t("offres.studentProfileMissing"),
      });
      return;
    }
    setApplicationModalVisible(true);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#044EB8" />
        <Typography className="mt-3 text-gray-500">{t("common.loading")}</Typography>
      </View>
    );
  }

  if (!offer) {
    return (
      <View className="flex-1 bg-white">
        <StateView message={errorMessage ?? undefined} onRetry={() => void fetchOffer()} />
      </View>
    );
  }

  const infoItems = [
    { icon: MapPin, label: t('offres.localisation'), value: offer.localisation },
    { icon: Clock, label: t('offres.duration'), value: offer.duration },
    { icon: Briefcase, label: t('offres.type'), value: offer.type_contrat },
    { icon: DollarSign, label: t('offres.remuneration'), value: offer.remuneration ? `${offer.remuneration}` : t('offres.notRemunerated') },
  ];

  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm border border-gray-100"
          >
            <ChevronLeft size={24} color="#1D2633" />
          </TouchableOpacity>
          <Typography variant="h3" font="maven" weight="bold" className="ml-4 text-secondary">
            {t('offres.details')}
          </Typography>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-8 pt-4 pb-24">
            {/* Main Info */}
            <Typography variant="h1" font="maven" weight="bold" className="text-secondary">
              {offer.title}
            </Typography>
            <Typography variant="body" font="noto" weight="bold" className="text-primary mt-1">
              {offer.nom_entreprise}
            </Typography>

            <View className="flex-row items-center mt-3 gap-x-4">
              <View className="flex-row items-center">
                <Users size={14} color="#10B981" />
                <Typography variant="caption" className="text-green-600 ml-1">
                  {isFreePlan
                    ? t("offres.candidateLimit", {
                        count: Math.min(candidateCount, 5),
                      })
                    : `${candidateCount} ${t("offres.candidates")}`}
                </Typography>
              </View>
              <Typography variant="caption" className="text-gray-400">
                {t('offres.published')} {timeAgo(offer.published_at ?? offer.start_date, i18n.language)}
              </Typography>
            </View>

            {/* Info Grid */}
            <View className="flex-row flex-wrap gap-4 mt-8">
              {infoItems.map((item, i) => (
                <View key={i} className="w-[47%] bg-white/50 border border-gray-100 p-4 rounded-2xl">
                  <item.icon size={20} color="#044EB8" />
                  <Typography variant="label" className="text-gray-400 mt-2">{item.label}</Typography>
                  <Typography variant="caption" weight="bold" className="text-secondary mt-0.5" numberOfLines={1}>
                    {item.value || "N/A"}
                  </Typography>
                </View>
              ))}
            </View>

            {/* Description */}
            <View className="mt-8">
              <Typography variant="h3" font="maven" weight="bold" className="text-secondary mb-4">
                {t('offres.description')}
              </Typography>
              <Typography variant="body" font="noto" className="text-gray-600 leading-6 text-justify">
                {offer.description}
              </Typography>
            </View>

            <View className="mt-8">
              <Typography variant="h3" font="maven" weight="bold" className="text-secondary mb-2">
                {t('offres.levelRequired')}
              </Typography>
              <Typography variant="body" font="noto" className="text-gray-600">
                {offer.niveau_requis}
              </Typography>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Sticky Bottom Button */}
      <View className="absolute bottom-0 w-full bg-white/80 p-6 border-t border-gray-100">
        {isExpired ? (
          <View className="flex-row items-center justify-center rounded-xl bg-gray-200 px-5 py-4">
            <CalendarX2 size={20} color="#6B7280" />
            <View className="ml-3">
              <Typography weight="bold" className="text-gray-600">
                {t("offres.deadlinePassed")}
              </Typography>
              {offer.end_date && (
                <Typography variant="caption" className="text-gray-500">
                  {t("offres.deadlineDate", {
                    date: formatDate(offer.end_date),
                  })}
                </Typography>
              )}
            </View>
          </View>
        ) : applied ? (
          <Button
            title={t("offres.alreadyApplied")}
            variant="gradient"
            onPress={handlePostuler}
            disabled
          />
        ) : hasReachedFreeLimit ? (
          <View className="items-center rounded-xl bg-gray-200 px-5 py-4">
            <Typography weight="bold" className="text-center text-gray-600">
              {t("offres.candidateLimitReached")}
            </Typography>
          </View>
        ) : (
          <Button
            title={t("offres.applyNow")}
            variant="gradient"
            onPress={openApplicationModal}
            loading={applying}
          />
        )}
      </View>

      <Modal
        visible={applicationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !applying && setApplicationModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="rounded-t-3xl bg-white px-6 pb-8 pt-6">
            <Typography variant="h2" font="maven" weight="bold" className="text-secondary">
              {t("offres.applicationTitle")}
            </Typography>
            <Typography variant="caption" font="noto" className="mt-1 text-gray-500">
              {offer.title} · {offer.nom_entreprise}
            </Typography>

            <Typography variant="body" font="noto" weight="semi" className="mb-2 mt-6 text-gray-700">
              {t("offres.motivationLabel")}
            </Typography>
            <TextInput
              value={motivation}
              onChangeText={setMotivation}
              placeholder={t("offres.motivationPlaceholder")}
              placeholderTextColor="#98A2B3"
              multiline
              maxLength={1000}
              editable={!applying}
              textAlignVertical="top"
              className="min-h-36 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 font-noto-reg text-base text-gray-800"
            />
            <View className="mt-2 flex-row justify-between">
              <Typography variant="label" font="noto" className="flex-1 pr-3 text-gray-500">
                {t("offres.motivationHelper")}
              </Typography>
              <Typography variant="label" font="noto" className="text-gray-400">
                {motivation.length}/1000
              </Typography>
            </View>

            <Button
              title={t("offres.sendApplication")}
              variant="gradient"
              onPress={() => void handlePostuler()}
              loading={applying}
              disabled={!motivation.trim()}
              className="mt-6"
            />
            <TouchableOpacity
              onPress={() => setApplicationModalVisible(false)}
              disabled={applying}
              className="mt-3 rounded-xl bg-gray-100 py-3"
            >
              <Typography weight="semi" className="text-center text-gray-600">
                {t("common.cancel")}
              </Typography>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
