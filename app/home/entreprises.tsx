import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ImageBackground,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Company, companyService } from "../../api/companies";
import { CompanyCard } from "../../components/Card";
import { CompanySkeleton } from "../../components/Skeleton";
import { StateView } from "../../components/StateView";
import { Typography } from "../../components/Typography";

export default function Entreprises() {
  const { t } = useTranslation();
  const router = useRouter();
  const [entreprises, setEntreprises] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEntreprises = useCallback(async () => {
    setErrorMessage(null);
    try {
      setEntreprises(await companyService.getAll());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("common.networkError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchEntreprises();
  }, [fetchEntreprises]);

  const filteredEntreprises = entreprises.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.secteur ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 pb-3 pt-4">
          <Typography variant="h2" font="maven" weight="bold" className="text-secondary">
            {t("companies.title")}
          </Typography>
        </View>

        {/* Search */}
        <View className="mb-4 mt-2 px-6">
          <View className="h-12 flex-row items-center rounded-xl border border-gray-100 bg-white px-4 shadow-sm">
            <Search size={18} color="#9CA3AF" />
            <TextInput
              placeholder={t("companies.searchPlaceholder")}
              className="ml-3 flex-1 font-noto-reg"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void fetchEntreprises();
              }}
              colors={["#044EB8"]}
            />
          }
        >
          {!loading && errorMessage && entreprises.length === 0 ? (
            <StateView message={errorMessage} onRetry={() => void fetchEntreprises()} compact />
          ) : null}
          <View className="flex-row flex-wrap justify-between">
            {loading
              ? [1, 2, 3, 4].map((i) => (
                <View key={i} className="mb-4 w-[48%]">
                  <CompanySkeleton grid />
                </View>
              ))
              : filteredEntreprises.map((item, index) => (
                <View key={item.id} className="mb-4 w-[48%]">
                  <CompanyCard
                    id={item.id}
                    name={item.name}
                    logo={item.logo ?? ""}
                    industry={item.secteur || t("profile.unspecified")}
                    index={index}
                    grid
                    onPress={() =>
                      router.push({
                        pathname: "/entreprises/[id]",
                        params: { id: String(item.id) },
                      })
                    }
                  />
                </View>
              ))}

            {!loading && filteredEntreprises.length === 0 && (
              <View className="items-center w-full mt-20">
                <Typography className="text-gray-400">{t("companies.noResults")}</Typography>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
