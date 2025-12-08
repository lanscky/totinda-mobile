import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter } from "expo-router";
import { timeAgo } from "../utils/dateUtils";
export default function Home() {
    const navigation = useNavigation();
    const router = useRouter();

type Entreprise = {
  id: number;
  name: string;
  description: string;
  secteur: string;
  logo: string;
};

type OffresStage = {
        id: number,
        nombre_candidats: number,
        plan_entreprise: number,
        title: string,
        type_contrat: string,
        remuneration: 500.00,
        duration: string,
        description: string
        localisation: string,
        niveau_requis: string,
        start_date: string,
        end_date: string,
        published_at: string,
        is_active: boolean,
        company: number
        nom_entreprise: string,
        logo_entreprise:string
    };
const [offrestages, setOffrestages] = useState<OffresStage[]>([]);

    
const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
const [loading, setLoading] = useState(true);

const fetchEntreprises = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    const response = await fetch("https://backend.totinda.com/api/companies/", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log(data);
    setEntreprises(data.results || []);
  } catch (error) {
    console.error(error);
  } 
};

// Fetch des offres de stage

const fetchOffresStages = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");

    if (!token) {
      console.warn("⚠️ Aucun token trouvé !");
      return;
    }

    const response = await fetch("https://backend.totinda.com/api/offres-stage/offresactives/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur Offres :", response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log("🎯 Offres :", data);
    // 👉 On limite aux 10 premiers résultats
    const limitedData = Array.isArray(data) ? data.slice(0, 10) : [];
    setOffrestages(limitedData);
  } catch (error) {
    console.error("❌ Erreur fetchOffresStages :", error);
  }
};


useEffect(() => {
  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchEntreprises(), fetchOffresStages()]);
    setLoading(false);
  };

  fetchAll();
}, []);


  if (loading) {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#044EB8" />
      <Text className="mt-2 text-gray-700">Chargement des données...</Text>
    </View>
  );
}

  return (
    <View className="flex-1">
         <ImageBackground className="absolute w-full h-full"
                 source={require("../../assets/onboard/background_page.png")}
                 resizeMode="cover"
               ></ImageBackground>
        <ScrollView contentContainerStyle={{ padding: 0 }}> 
        
        <View className="flex-row justify-between items-center mb-6 mt-10 mx-5">
            <Text style={{ fontFamily: "MavenPro-SemiBold"}} className="text-[20px] leading-[20px] tracking-[0px] text-[#1D2633] mb-4 ">Les entreprises tendance</Text>
            {/* 👉 flèche cliquable */}
            <TouchableOpacity
            onPress={() => router.push("./entreprises")}
            style={{
              backgroundColor: "#fff",
              width: 30,
              height: 30,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              marginBottom: 16,
              marginTop: 15,
            }}
          >
          <Image
            source={require("../../assets/icons/arrowRight.png")}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        </View>
        <View className="h-auto mb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {entreprises.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => router.push({
                  pathname: "/entreprises/[id]",
                  params: { id: String(item.id), name: item.name, description: item.description, secteur: item.secteur, logo: item.logo},
                })}
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
                elevation: 2,
              }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: "#ffffff", 
                    borderRadius: 32,
                    
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 16,
                    marginBottom: 16,
                    borderWidth: 1,       // épaisseur du bord
                    borderColor: "#E5E7EB", 
                  }}
                >
                  <Image
                    source={{ uri: item.logo }}
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
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


       <View className="flex-row justify-between items-center mx-5">
            <Text style={{ fontFamily: "MavenPro-SemiBold", fontSize:20 }} className="text-[#000] mb-4 ">Offres tendance</Text>
            {/* 👉 flèche cliquable */}
          <TouchableOpacity
            onPress={() => router.push("./offres")}
            style={{
              backgroundColor: "#fff",
              width: 30,
              height: 30,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              marginBottom: 16,
              marginTop: 15,
            }}
          >
          <Image
            source={require("../../assets/icons/arrowRight.png")}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>

        </View>
        <View className="h-auto mb-6 mt-1">
            <ScrollView
                
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingVertical: 16 }}
            >

                <View className="w-full px-4 h-auto ">
            {offrestages.map((offre) => (
                <TouchableOpacity
                key={offre.id}
                className=" flex-row items-center bg-white rounded-2xl p-3 mb-3 shadow-sm"
                onPress={() =>
            router.push({
            pathname: "/offres/[id]",
            params: {
                id: String(offre.id), // toujours une string ici
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
                logo_entreprise: offre.logo_entreprise

               
               
            },
            })

          }
                >
                 <View className="w-20 h-20 bg-write rounded-full justify-center items-center mr-4">
                    <Image
                      source={{uri:offre.logo_entreprise}}
                       style={{ width: 60, height: 60 }} resizeMode="contain"
                      />
                  </View>
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-[#044EB8]" style={{ fontFamily: "NotoSans-Bold" }}>
                    {offre.title}
                    </Text>
                    <Text className="text-gray-600 text-sm" style={{ fontFamily: "NotoSans-Regular" }}>
                    {offre.nom_entreprise}
                    </Text>
                   
                    <Text className="text-gray-500 text-xs mt-1" style={{ fontFamily: "NotoSans-Regular" }}>
                    {timeAgo(offre.start_date)}
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
                </View>
                </TouchableOpacity>
            ))}
        </View>


            </ScrollView>
        </View>
    </ScrollView>
        
    </View>
  );
}
