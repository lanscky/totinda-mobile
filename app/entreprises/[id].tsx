import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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

type EntrepriseDetails = {
  id: number;
  name: string;
  description: string;
  secteur: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  logo?: string;
};

export default function EntrepriseDetail() {
  const { id, name, description, secteur } = useLocalSearchParams();
  const router = useRouter();
  const [entreprise, setEntreprise] = useState<EntrepriseDetails | null>(null);
  const [loading, setLoading] = useState(true);

const fetchEntreprise = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.warn("⚠️ Aucun token trouvé !");
        return;
      }

      const response = await fetch(`https://backend.totinda.com/api/companies/${id}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur Entreprise :", response.status, errorText);
        return;
      }

      const data = await response.json();
      setEntreprise(data);
    } catch (error) {
      console.error("❌ Erreur fetchEntreprise :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntreprise();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#044EB8" />
        <Text className="mt-2 text-gray-700">Chargement de {name}...</Text>
      </View>
    );
  }

  if (!entreprise) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-700 text-lg">Aucune donnée trouvée pour cette entreprise.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* 🌄 Image de fond */}
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        resizeMode="cover"
        className="absolute w-full h-full"
      />

      {/* Contenu principal */}
      <ScrollView className="flex-1 mt-14 px-5">
        {/* 🔙 Bouton retour */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#fff",
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
            marginBottom: 16,
            marginTop: 15,
          }}
        >
          <Image
            source={require("../../assets/icons/arrowLeft.png")}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>

        {/* 🏢 Logo & titre */}
        <View className="items-center mb-6">
          <View
            style={{
              width: 90,
              height: 90,
              backgroundColor: "#ffffff",
              borderRadius: 45,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Image
              source={
                entreprise.logo
                  ? { uri: entreprise.logo }
                  : require("../../assets/images/logo.png")
              }
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </View>

          <Text
            className="text-[#044EB8]"
            style={{ fontFamily: "NotoSans-Bold", fontSize: 20 }}
          >
            {entreprise.name}
          </Text>

          <Text
            className="text-gray-600 text-center mt-1"
            style={{ fontFamily: "NotoSans-Regular", fontSize: 13 }}
          >
            {entreprise.secteur || "Secteur non précisé"}
          </Text>
        </View>

        {/* 📝 Description */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text
            style={{
              fontFamily: "NotoSans-Bold",
              fontSize: 16,
              color: "#1D2633",
              marginBottom: 8,
            }}
          >
            À propos
          </Text>
          <Text
            style={{
              fontFamily: "NotoSans-Regular",
              fontSize: 14,
              color: "#4B5563",
              lineHeight: 22,
            }}
          >
            {entreprise.description || "Aucune description disponible."}
          </Text>
        </View>

        {/* 📞 Informations de contact */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text
            style={{
              fontFamily: "NotoSans-Bold",
              fontSize: 16,
              color: "#1D2633",
              marginBottom: 8,
            }}
          >
            Coordonnées
          </Text>

          <Text style={{ fontFamily: "NotoSans-Regular", fontSize: 14, color: "#4B5563" }}>
            📍 {entreprise.adresse || "Adresse non disponible"}
          </Text>
          <Text style={{ fontFamily: "NotoSans-Regular", fontSize: 14, color: "#4B5563" }}>
            📞 {entreprise.telephone || "Téléphone non disponible"}
          </Text>
          <Text style={{ fontFamily: "NotoSans-Regular", fontSize: 14, color: "#4B5563" }}>
            ✉️ {entreprise.email || "Email non disponible"}
          </Text>
          {entreprise.site_web && (
            <Text
              style={{
                fontFamily: "NotoSans-Regular",
                fontSize: 14,
                color: "#044EB8",
                textDecorationLine: "underline",
                marginTop: 4,
              }}
            >
              🌐 {entreprise.site_web || "Site web non dispo"}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
