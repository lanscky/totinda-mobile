import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { apiRequest } from "../../api/client";
import { JobOfferCard } from "../../components/Card";
import { OfferSkeleton } from "../../components/Skeleton";
import { StateView } from "../../components/StateView";
import { Typography } from "../../components/Typography";

type OffresStage = {
  id: number;
  nombre_candidats: number;
  plan_entreprise: number;
  title: string;
  type_contrat: string;
  remuneration: number;
  duration: string;
  description: string;
  localisation: string;
  niveau_requis: string;
  start_date: string;
  end_date: string;
  published_at: string;
  is_active: boolean;
  company: number;
  nom_entreprise: string;
  logo_entreprise: string;
};

export default function Offres() {
  const { t } = useTranslation();
  const router = useRouter();
  const [offrestages, setOffrestages] = useState<OffresStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOffresStages = useCallback(async () => {
    setErrorMessage(null);
    try {
      const data = await apiRequest<OffresStage[] | { results?: OffresStage[] }>(
        "offres-stage/offresactives/",
      );
      setOffrestages(Array.isArray(data) ? data : data.results ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("common.networkError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchOffresStages();
  }, [fetchOffresStages]);

  const filteredOffres = offrestages.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nom_entreprise.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.localisation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Typography variant="h3" font="maven" weight="bold" className="ml-4 text-secondary">
              {t("home.recentOffers")}
            </Typography>
          </View>
        </View>

        {/* Search */}
        <View className="px-6 mt-2 mb-6">
          <View className="h-12 bg-white rounded-xl flex-row items-center px-4 border border-gray-100 shadow-sm">
            <Search size={18} color="#9CA3AF" />
            <TextInput
              placeholder={t("home.searchPlaceholderList")}
              className="ml-3 flex-1 font-noto-reg"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void fetchOffresStages();
              }}
              colors={["#044EB8"]}
            />
          }
        >
          {!loading && errorMessage && offrestages.length === 0 ? (
            <StateView message={errorMessage} onRetry={() => void fetchOffresStages()} compact />
          ) : null}
          {loading
            ? [1, 2, 3, 4, 5].map((i) => <OfferSkeleton key={i} />)
            : filteredOffres.map((offre, index) => (
              <JobOfferCard
                key={offre.id}
                id={offre.id}
                title={offre.title}
                companyName={offre.nom_entreprise}
                logo={offre.logo_entreprise}
                location={offre.localisation}
                duration={offre.duration}
                salary={offre.remuneration}
                index={index}
                onPress={() =>
                  router.push({
                    pathname: "/offres/[id]",
                    params: { id: String(offre.id) },
                  })
                }
              />
            ))}

          {!loading && filteredOffres.length === 0 && (
            <View className="items-center mt-20">
              <Typography className="text-gray-400">{t("home.noOffers")}</Typography>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
