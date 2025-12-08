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

type Entreprise = {
  id: number;
  name: string;
  description: string;
  secteur: string;
  logo:string;
};

export default function Entreprises() {
  const router = useRouter();
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntreprises = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        console.warn("⚠️ Aucun token trouvé !");
        return;
      }

      const response = await fetch("https://backend.totinda.com/api/companies/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur Entreprises :", response.status, errorText);
        return;
      }

      const data = await response.json();
      console.log("🏢 Entreprises :", data);

      setEntreprises(data.results || []);
    } catch (error) {
      console.error("❌ Erreur fetchEntreprises :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntreprises();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#044EB8" />
        <Text className="mt-2 text-gray-700">Chargement des entreprises...</Text>
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

      <ScrollView className="flex-1 mt-14">
        {/* Titre principal */}
        {/* <View className="flex-row justify-between items-center mb-6 px-5">
          <Text
            style={{ fontFamily: "MavenPro-SemiBold", fontSize: 22 }}
            className="text-[#000]"
          >
            Les entreprises
          </Text>
        </View> */}

        {/* Liste horizontale des entreprises */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {entreprises.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/entreprises/[id]",
                  params: { id: String(item.id), name: item.name, description: item.description, secteur: item.secteur},
                })
              }
              style={{
                width: 150,
                height: 180,
                marginRight: 16,
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",

                // 🌫 Ombres pour iOS et Android
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: "#ffffff", // bg-slate-300
                  borderRadius: 32,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <Image
                  source={{uri:item.logo}}
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
              </View>

              <Text
                className="text-[#1D2633]"
                style={{
                  fontFamily: "NotoSans-Bold",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {item.name}
              </Text>

              <Text
                className="text-gray-600 text-center mt-1"
                style={{
                  fontFamily: "NotoSans-Regular",
                  fontSize: 10,
                  marginTop: 4,
                }}
                numberOfLines={2}
              >
                {item.description || "Aucune description disponible."}
              </Text>

              <Text
                className="text-gray-500 mt-2"
                style={{
                  fontFamily: "NotoSans-Regular",
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                {item.secteur || "Secteur non précisé"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}
