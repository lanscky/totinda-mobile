import { useLocalSearchParams, useRouter } from "expo-router";
import { Briefcase, ChevronLeft, Globe, Mail, MapPin, Phone } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";
import { Company, companyService } from "../../api/companies";
import { StateView } from "../../components/StateView";
import { Typography } from "../../components/Typography";

export default function EntrepriseDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [entreprise, setEntreprise] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEntreprise = useCallback(async () => {
    if (!id || Array.isArray(id)) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      setEntreprise(await companyService.getById(Number(id)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void fetchEntreprise();
  }, [fetchEntreprise]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#044EB8" />
        <Typography variant="body" className="mt-2 text-gray-500">{t('common.loading')}</Typography>
      </View>
    );
  }

  if (!entreprise) {
    return (
      <View className="flex-1 bg-white">
        <StateView message={errorMessage ?? undefined} onRetry={() => void fetchEntreprise()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm border border-gray-100"
          >
            <ChevronLeft size={24} color="#1D2633" />
          </TouchableOpacity>
          <Typography variant="h3" font="maven" weight="bold" className="ml-4 text-secondary">
            {t('entreprises.profile')}
          </Typography>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center px-8 pt-6">
            <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center border border-gray-100 shadow-sm mb-4 overflow-hidden">
              <Image
                source={entreprise.logo ? { uri: entreprise.logo } : require("../../assets/images/logo.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
            <Typography variant="h2" font="maven" weight="bold" className="text-secondary text-center">
              {entreprise.name}
            </Typography>
            <View className="flex-row items-center mt-1">
              <Briefcase size={14} color="#1B81CA" />
              <Typography variant="body" className="text-primary ml-2">
                {entreprise.secteur}
              </Typography>
            </View>
          </View>

          <View className="px-8 mt-10">
            {/* About */}
            <Typography variant="h3" font="maven" weight="bold" className="text-secondary mb-4">
              {t('entreprises.about')}
            </Typography>
            <Typography variant="body" font="noto" className="text-gray-600 leading-6 text-justify">
              {entreprise.description || t('entreprises.noDescription')}
            </Typography>

            {/* Contact Info */}
            <Typography variant="h3" font="maven" weight="bold" className="text-secondary mt-10 mb-4">
              {t('entreprises.contact')}
            </Typography>

            <View className="bg-white/50 border border-gray-100 rounded-3xl p-6 gap-y-5">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  <MapPin size={18} color="#044EB8" />
                </View>
                <Typography variant="body" className="text-gray-600 ml-4 flex-1">
                  {entreprise.adresse || t('entreprises.addressNotSet')}
                </Typography>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  <Phone size={18} color="#044EB8" />
                </View>
                <Typography variant="body" className="text-gray-600 ml-4">
                  {entreprise.telephone || t('entreprises.notAvailable')}
                </Typography>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  <Mail size={18} color="#044EB8" />
                </View>
                <Typography variant="body" className="text-gray-600 ml-4">
                  {entreprise.email || t('entreprises.notAvailable')}
                </Typography>
              </View>

              {entreprise.site_web && (
                <TouchableOpacity
                  onPress={() => {
                    const website = /^https?:\/\//i.test(entreprise.site_web!)
                      ? entreprise.site_web!
                      : `https://${entreprise.site_web}`;
                    void Linking.openURL(website);
                  }}
                  className="flex-row items-center"
                >
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                    <Globe size={18} color="#044EB8" />
                  </View>
                  <Typography variant="body" weight="med" className="text-primary ml-4">
                    {t('entreprises.visitWebsite')}
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
