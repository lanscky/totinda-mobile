
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  Briefcase,
  Camera,
  Edit3,
  LogOut,
  Mail,
  PhoneCall,
  Upload,
  User
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profil() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [cvName, setCvName] = useState<string | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      const data = await AsyncStorage.getItem("user_info");
      if (data) {
        setUserInfo(JSON.parse(data));
      }
      setLoading(false);
    };
    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["access_token", "refresh_token", "user_info"]);
    router.replace("/login/login");
  };

  // === GESTION DE L'IMAGE ===
  const pickImage = async (fromCamera: boolean) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission refusée !");
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await uploadProfilePicture(uri);
      }
    } catch (err) {
      console.error("Erreur image picker :", err);
    } finally {
      setModalVisible(false);
    }
  };

  const uploadProfilePicture = async (uri: string) => {
    setUploading(true);
    const token = await AsyncStorage.getItem("access_token");
    if (!token) return alert("Token manquant");

    const formData = new FormData();
    formData.append("profile_picture", {
      uri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch(`https://backend.totinda.com/api/users/${userInfo?.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserInfo(updatedUser);
        await AsyncStorage.setItem("user_info", JSON.stringify(updatedUser));
        alert("✅ Photo mise à jour !");
      } else {
        alert("❌ Erreur lors de la mise à jour de la photo");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Erreur de connexion au serveur");
    } finally {
      setUploading(false);
    }
  };

  // === GESTION DU CV ===
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const file = result.assets[0];
      setCvName(file.name);
      await uploadCV(file.uri, file.name, file.mimeType || "application/pdf");
    } catch (error) {
      console.error("Erreur sélection CV :", error);
    }
  };

  const uploadCV = async (uri: string, name: string, type: string) => {
    setUploadingCV(true);
    const token = await AsyncStorage.getItem("access_token");
    if (!token) return alert("Token manquant");

    const studentId = userInfo?.student?.id_student;

    const formData = new FormData();
    formData.append("cv", { uri, name, type } as any);

    try {
      const response = await fetch(`https://backend.totinda.com/api/students/${studentId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        // Mettre à jour l’objet user_info localement
        const updated = {
          ...userInfo,
          student: { ...userInfo.student, cv: updatedStudent.cv },
        };
        setUserInfo(updated);
        await AsyncStorage.setItem("user_info", JSON.stringify(updated));
        alert("✅ CV mis à jour avec succès !");
      } else {
        const errTxt = await response.text();
        console.log("Erreur upload CV:", errTxt);
        alert("❌ Erreur lors de la mise à jour du CV");
      }
    } catch (error) {
      console.error("Erreur réseau CV:", error);
      alert("Erreur de connexion au serveur");
    } finally {
      setUploadingCV(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#044EB8" />
        <Text className="mt-2 text-gray-700">Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* HEADER */}
      <ImageBackground
        source={require("../../assets/onboard/background_page.png")}
        className="w-full h-48 justify-center items-center"
        resizeMode="cover"
      >
        <View
          className="relative w-28 h-28 rounded-full bg-white justify-center items-center shadow-md"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Image
            source={
              userInfo?.profile_picture
                ? { uri: userInfo.profile_picture }
                : require("../../assets/images/avatar.png")
            }
            className="w-24 h-24 rounded-full"
          />
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="absolute bottom-0 right-0 bg-[#044EB8] p-2 rounded-full"
          >
            <Edit3 color="white" size={18} />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* INFOS UTILISATEUR */}
      <View className="px-6 mt-6">
        <Text
          className="text-center text-[#044EB8]"
          style={{ fontFamily: "MavenPro-SemiBold", fontSize: 20 }}
        >
          {userInfo?.username || "Nom inconnu"} {userInfo?.prenom || ""}
        </Text>
        <Text
          className="text-center text-gray-500 mt-1"
          style={{ fontFamily: "NotoSans-Regular", fontSize: 14 }}
        >
          Étudiant - {userInfo?.student?.niveau || "niveau inconnu"}
        </Text>

        {/* Détails */}
        <View className="mt-8 space-y-4">
          {[
            { icon: <User color="#044EB8" size={22} />, text: userInfo?.postnom || "Non précisé" },
            { icon: <Mail color="#044EB8" size={22} />, text: userInfo?.email || "Email non disponible" },
            { icon: <PhoneCall color="#044EB8" size={22} />, text: userInfo?.telephone || "Téléphone non disponible" },
            { icon: <Briefcase color="#044EB8" size={22} />, text: userInfo?.student?.formation || "Formation non spécifiée" },
          ].map((item, index) => (
            <View key={index} className="flex-row items-center bg-gray-50 p-4 rounded-xl shadow-sm">
              {item.icon}
              <Text
                className="ml-3 text-gray-800"
                style={{ fontFamily: "NotoSans-Regular", fontSize: 15 }}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {/* UPLOAD CV */}
        <View className="mt-10 mb-4">
          <Text
            className="text-gray-700 mb-2"
            style={{ fontFamily: "MavenPro-SemiBold", fontSize: 16 }}
          >
            Mon CV :
          </Text>

          <TouchableOpacity
            onPress={pickDocument}
            disabled={uploadingCV}
            className="flex-row items-center justify-center bg-gray-100 border border-gray-300 rounded-xl py-4"
          >
            {uploadingCV ? (
              <ActivityIndicator color="#044EB8" />
            ) : (
              <>
                <Upload color="#044EB8" size={20} />
                <Text className="ml-2 text-[#044EB8] text-[15px]">
                  {cvName ? cvName : userInfo?.student?.cv ? "Changer mon CV" : "Ajouter mon CV"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {userInfo?.student?.cv && (
            <Text className="mt-2 text-center text-gray-500 text-sm">
              📄 CV actuel : {userInfo.student.cv.split("/").pop()}
            </Text>
          )}
        </View>

        {/* DECONNEXION */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-6 bg-red-500 py-4 rounded-xl flex-row justify-center items-center shadow-sm mb-8"
        >
          <LogOut color="#fff" size={20} />
          <Text
            className="text-white ml-2"
            style={{ fontFamily: "NotoSans-SemiBold", fontSize: 16 }}
          >
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PHOTO */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text
              className="text-center text-gray-800 mb-4"
              style={{ fontFamily: "MavenPro-SemiBold", fontSize: 18 }}
            >
              Modifier la photo de profil
            </Text>

            <TouchableOpacity
              onPress={() => pickImage(false)}
              className="flex-row items-center bg-gray-100 p-4 rounded-xl mb-3"
            >
              <User color="#044EB8" size={22} />
              <Text className="ml-3 text-gray-800 text-[15px]">Choisir depuis la galerie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickImage(true)}
              className="flex-row items-center bg-gray-100 p-4 rounded-xl mb-3"
            >
              <Camera color="#044EB8" size={22} />
              <Text className="ml-3 text-gray-800 text-[15px]">Prendre une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-gray-200 p-3 rounded-xl mt-2"
            >
              <Text className="text-center text-gray-700">Annuler</Text>
            </TouchableOpacity>

            {uploading && (
              <View className="mt-4 flex-row justify-center items-center">
                <ActivityIndicator color="#044EB8" />
                <Text className="ml-2 text-gray-600">Mise à jour...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
