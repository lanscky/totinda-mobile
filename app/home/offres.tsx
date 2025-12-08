import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  logo_entreprise:string;
};

export default function Offres() {
  const router = useRouter();
  const [offrestages, setOffrestages] = useState<OffresStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les offres
  const fetchOffresStages = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        console.warn("⚠️ Aucun token trouvé !");
        return;
      }

      const response = await fetch(
        "https://backend.totinda.com/api/offres-stage/offresactives/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur Offres :", response.status, errorText);
        return;
      }

      const data = await response.json();
      console.log("🎯 Offres :", data);
      setOffrestages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Erreur fetchOffresStages :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffresStages();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#044EB8" />
        <Text className="mt-2 text-gray-700">Chargement des offres...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ImageBackground
        className="absolute w-full h-full"
        source={require("../../assets/onboard/background_page.png")}
        resizeMode="cover"
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          className="text-gray-500 mb-6"
          style={{
            fontFamily: "MavenPro-Bold",
            fontSize: 20,
          }}
        >
          Toutes les offres
        </Text>

        {offrestages.length === 0 ? (
          <Text className="text-gray-600 text-center mt-10">
            Aucune offre disponible pour le moment.
          </Text>
        ) : (
          offrestages.map((offre) => (
            <TouchableOpacity
              key={offre.id}
              className="flex-row items-center bg-white rounded-2xl p-3 mb-3 shadow-sm"
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/offres/[id]",
                  params: {
                    id: String(offre.id),
                    title: offre.title,
                    entreprise: offre.nom_entreprise,
                    end_date: offre.end_date,
                    remuneration: offre.remuneration,
                    duration: offre.duration,
                    description: offre.description,
                    start_date: offre.start_date,
                    localisation: offre.localisation,
                    niveau_requis: offre.niveau_requis,
                    type_contrat: offre.type_contrat,
                    nombre_candidats: offre.nombre_candidats,
                    logo_entreprise:offre.logo_entreprise
                  },
                })
              }
            >
              <Image
                source={{uri:offre.logo_entreprise }}
                className="w-14 h-14 rounded-full mr-4"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text
                  className="text-[#044EB8]"
                  style={{ fontFamily: "NotoSans-Bold", fontSize: 16 }}
                >
                  {offre.title}
                </Text>
                <Text
                  className="text-gray-700"
                  style={{ fontFamily: "NotoSans-Regular", fontSize: 13 }}
                >
                  {offre.nom_entreprise}
                </Text>

                <Text
                  className="text-gray-500 mt-1"
                  style={{ fontFamily: "NotoSans-Regular", fontSize: 12 }}
                >
                  📍 {offre.localisation} • {offre.duration}
                </Text>

                <Text
                  className="text-gray-600 mt-1"
                  style={{ fontFamily: "NotoSans-Regular", fontSize: 12 }}
                >
                  {offre.remuneration
                    ? `💰 ${offre.remuneration}`
                    : "Non rémunéré"}
                </Text>

                <Text
                  className="text-gray-500 mt-1"
                  style={{ fontFamily: "NotoSans-Regular", fontSize: 11 }}
                >
                  {offre.nombre_candidats} candidats déjà
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
