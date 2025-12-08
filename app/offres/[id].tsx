import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock5, Handshake, MapPin } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { timeAgo } from "../utils/dateUtils";

export default function DetailOffre() {
  
  const router = useRouter();
  const {
    id,
    title,
    entreprise,
    end_date,
    start_date,
    remuneration,
    duration,
    description,
    localisation,
    type_contrat,
    niveau_requis,
    nombre_candidats,
  } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  const handlePostuler = async () => {
    try {
      setLoading(true);

      // 🔹 Récupération des infos utilisateur
      const userData = await AsyncStorage.getItem("user_info");
      if (!userData) {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Veuillez vous reconnecter avant de postuler.",
        });
        return;
      }

      const userInfo = JSON.parse(userData);

      // 🔹 Appel API
      const response = await fetch(`https://backend.totinda.com/api/candidatures/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          offre_stage: id,
          student: userInfo.student.id_student,
        }),
      });

      const data = await response.json();
      console.log("✅ Réponse API :", data);

      if (response.ok) {
        // 🔹 Succès
        Toast.show({
          type: "success",
          text1: "Succès",
          text2: "Votre candidature a été envoyée avec succès !",
          position: "bottom",
        });
      } else if (data.non_field_errors) {
        // 🔹 Cas où l’utilisateur a déjà postulé
        Toast.show({
          type: "info",
          text1: "Information",
          text2: data.non_field_errors[0],
          position: "bottom",
        });
      } else {
        // 🔹 Autre erreur
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: data.message || "Une erreur est survenue.",
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors de la postulation :", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible d’envoyer votre candidature. Réessayez plus tard.",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <ScrollView className="flex-1 px-8 mt-16">
          {/* Bouton retour */}
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

          {/* Informations principales */}
          <Text style={{ fontFamily: "MavenPro-SemiBold", fontSize: 20, marginBottom: 4, marginTop:10 }}>
            {title}
          </Text>
          <Text style={{ fontFamily: "NotoSans-Regular", color: "#044EB8", fontSize: 15, marginBottom: 2 }}>
            {entreprise}
          </Text>
          <Text style={{ fontFamily: "NotoSans-Regular", color: "gray", fontSize: 15, marginBottom: 2 }}>
            {timeAgo(start_date)}
          </Text>
          <Text style={{ fontFamily: "NotoSans-Regular", color: "green", fontSize: 15, marginBottom: 16 }}>
            Candidats : {nombre_candidats} déjà
          </Text>

          {/* Informations secondaires */}
          <View className="mt-5">
            <View className="flex-row justify-between mb-1">
              <Text style={{ fontFamily: "NotoSans-Bold", fontSize: 13 }}>Location</Text>
              <Text style={{ fontFamily: "NotoSans-Bold", fontSize: 13 }}>Durée</Text>
              <Text style={{ fontFamily: "NotoSans-Bold", fontSize: 13 }}>Type</Text>
            </View>

            <View className="flex-row justify-between mb-5">
              <View className="flex-row items-center">
                <MapPin color="#1D2633" size={18} />
                <Text style={{ fontFamily: "NotoSans-Regular", fontSize: 15 }}> {localisation}</Text>
              </View>
              <View className="flex-row items-center">
                <Clock5 color="#1D2633" size={18} />
                <Text style={{ fontFamily: "NotoSans-Regular", fontSize: 15 }}> {duration}</Text>
              </View>
              <View className="flex-row items-center">
                <Handshake color="#1D2633" size={18} />
                <Text style={{ fontFamily: "NotoSans-Regular", fontSize: 15 }}> {type_contrat}</Text>
              </View>
            </View>
          </View>

          <Text style={{ fontFamily: "NotoSans-Regular", color: "gray", fontSize: 15 }}>
            {remuneration ? `Salaire : ${remuneration}` : "Non rémunéré"}
          </Text>
          <Text style={{ fontFamily: "NotoSans-Regular", color: "gray", fontSize: 15 }}>
            Durée : {duration}
          </Text>
          <Text style={{ fontFamily: "NotoSans-Regular", color: "gray", fontSize: 15, marginBottom: 30 }}>
            Niveau : {niveau_requis}
          </Text>

          <Text style={{ fontFamily: "NotoSans-Bold", fontSize: 16 }}>Description</Text>
          <Text style={{ fontFamily: "NotoSans-Regular", fontSize: 15,  marginTop: 15 }}>
            {description}
          </Text>

          <View className="w-full mt-10">
            <TouchableOpacity
              style={{ overflow: "hidden", marginBottom: 10 }}
              onPress={handlePostuler}
              disabled={loading}
            >
              <LinearGradient
                colors={["#044EB8", "#1B81CA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 15,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ fontFamily: "NotoSans-SemiBold", color: "#fff", fontSize: 15 }}>
                    Postuler
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 🔹 Affichage des toasts */}
        <Toast />
      </ImageBackground>
    </View>
  );
}
