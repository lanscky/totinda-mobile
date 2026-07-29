import { Stack, useRouter } from "expo-router";
import { ChevronRight, Filter, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Company, companyService } from "../../api/companies";
import { apiRequest } from "../../api/client";
import { CompanyCard, JobOfferCard } from "../../components/Card";
import { FilterModal, FilterValues } from "../../components/FilterModal";
import { CompanySkeleton, OfferSkeleton } from "../../components/Skeleton";
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

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [offrestages, setOffrestages] = useState<OffresStage[]>([]);
  const [entreprises, setEntreprises] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [offersError, setOffersError] = useState<string | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    sector: [],
    contract: [],
    location: [],
  });

  const fetchData = useCallback(async () => {
    setCompaniesError(null);
    setOffersError(null);

    try {
      const [companiesResult, offersResult] = await Promise.allSettled([
        companyService.getAll(),
        apiRequest<OffresStage[] | { results?: OffresStage[] }>(
          "offres-stage/offresactives/",
        ),
      ]);

      if (companiesResult.status === "fulfilled") {
        setEntreprises(companiesResult.value);
      } else {
        setCompaniesError(
          companiesResult.reason instanceof Error
            ? companiesResult.reason.message
            : t("common.networkError"),
        );
      }

      if (offersResult.status === "fulfilled") {
        const offersData = offersResult.value;
        const offers = Array.isArray(offersData)
          ? offersData
          : offersData.results ?? [];
        setOffrestages(offers.slice(0, 10));
      } else {
        setOffersError(
          offersResult.reason instanceof Error
            ? offersResult.reason.message
            : t("common.networkError"),
        );
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchData();
  };

  const applyFilters = (filters: FilterValues) => {
    setActiveFilters(filters);
    setIsFilterModalVisible(false);
  };

  const filteredEntreprises = entreprises.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.secteur ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = activeFilters.sector.length === 0 || activeFilters.sector.includes(item.secteur);
    return matchesSearch && matchesSector;
  });

  const filteredOffres = offrestages.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nom_entreprise.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContract = activeFilters.contract.length === 0 || activeFilters.contract.includes(item.type_contrat);
    const matchesLocation = activeFilters.location.length === 0 || activeFilters.location.includes(item.localisation);
    return matchesSearch && matchesContract && matchesLocation;
  });

  const hasActiveFilters = Object.values(activeFilters).some(v => v.length > 0);

  return (

    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4">
          <View>
            <Typography variant="body" className="text-gray-500">
              {t('home.greeting')}
            </Typography>
            <Typography variant="h2" font="maven" weight="bold" className="text-secondary">
              {t('home.title')}
            </Typography>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#044EB8"]} />
          }
        >
          {/* Search Bar */}
          <View className="px-6 mt-4">
            <View className="flex-row gap-3">
              <View className="flex-1 h-14 bg-white rounded-2xl flex-row items-center px-4 border border-gray-100 shadow-sm">
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  placeholder={t('home.searchPlaceholder')}
                  className="ml-3 text-gray-800 flex-1 font-noto-reg"
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(true)}
                className={`w-14 h-14 rounded-2xl items-center justify-center shadow-md ${hasActiveFilters ? "bg-secondary" : "bg-primary"}`}
              >
                <Filter size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Companies Section */}
          <View className="mt-8">
            <View className="px-6 flex-row justify-between items-center mb-4">
              <Typography variant="h3" font="maven" weight="bold" className="text-secondary">
                {t('home.trendingCompanies')}
              </Typography>
              <TouchableOpacity onPress={() => router.push("/home/entreprises")} className="flex-row items-center">
                <Typography variant="caption" weight="med" className="text-primary mr-1">
                  {t('common.seeAll')}
                </Typography>
                <ChevronRight size={16} color="#044EB8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {loading
                ? [1, 2, 3].map((i) => <CompanySkeleton key={i} />)
                : companiesError && entreprises.length === 0
                  ? <StateView message={companiesError} onRetry={() => void fetchData()} compact />
                : filteredEntreprises.length > 0
                  ? filteredEntreprises.map((item, index) => (
                    <CompanyCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      logo={item.logo ?? ""}
                      industry={item.secteur || t("profile.unspecified")}
                      index={index}
                      onPress={() =>
                        router.push({
                          pathname: "/entreprises/[id]",
                          params: { id: String(item.id) },
                        })
                      }
                    />
                  ))
                  : (
                    <View className="px-6 py-4">
                      <Typography className="text-gray-400 italic">{t('home.noCompanies')}</Typography>
                    </View>
                  )
              }
            </ScrollView>
          </View>

          {/* Offers Section */}
          <View className="mt-10 px-6 pb-20">
            <View className="flex-row justify-between items-center mb-6">
              <Typography variant="h3" font="maven" weight="bold" className="text-secondary">
                {t('home.recentOffers')}
              </Typography>
              <TouchableOpacity onPress={() => router.push("/home/offres")} className="flex-row items-center">
                <Typography variant="caption" weight="med" className="text-primary mr-1">
                  {t('common.seeAll')}
                </Typography>
                <ChevronRight size={16} color="#044EB8" />
              </TouchableOpacity>
            </View>

            {loading
              ? [1, 2, 3].map((i) => <OfferSkeleton key={i} />)
              : offersError && offrestages.length === 0
                ? <StateView message={offersError} onRetry={() => void fetchData()} compact />
              : filteredOffres.length > 0
                ? filteredOffres.map((offre, index) => (
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
                ))
                : (
                  <View className="items-center py-10">
                    <Typography className="text-gray-400 italic font-noto-reg">{t('home.noOffers')}</Typography>
                  </View>
                )
            }
          </View>
        </ScrollView>
      </SafeAreaView>

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={applyFilters}
        initialFilters={activeFilters}
        options={{
          sector: [...new Set(entreprises.map((item) => item.secteur).filter(Boolean))],
          contract: [...new Set(offrestages.map((item) => item.type_contrat).filter(Boolean))],
          location: [...new Set(offrestages.map((item) => item.localisation).filter(Boolean))],
        }}
      />
    </View>
  );
}
