
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Camera,
  Edit3,
  Languages,
  ExternalLink,
  LogOut,
  Mail,
  PhoneCall,
  Upload,
  Trash2,
  User
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { User as AuthUser } from "../../api/auth";
import { apiRequest } from "../../api/client";
import { Button } from "../../components/Button";
import { ProfileCompletionCard } from "../../components/ProfileCompletionCard";
import { useAuth } from "../../context/AuthContext";

type PendingPhoto = {
  uri: string;
  name: string;
  type: string;
};

export default function Profil() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout, deleteAccount, updateUser, refreshUser, loading } = useAuth();
  const [userInfo, setUserInfo] = useState<AuthUser | null>(user);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [cvName, setCvName] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PendingPhoto | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    setUserInfo(user);
  }, [user]);

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: () => void logout(),
      },
    ]);
  };

  const closeDeleteModal = () => {
    if (deletingAccount) return;
    setDeletePassword("");
    setDeleteModalVisible(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeletingAccount(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteModalVisible(false);
      Toast.show({
        type: "success",
        text1: t("profile.accountDeleted"),
        text2: t("profile.accountDeletedDescription"),
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: error instanceof Error ? error.message : t("common.networkError"),
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  // === GESTION DE L'IMAGE ===
  const pickImage = async (fromCamera: boolean) => {
    try {
      const permissionResult = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t("common.error"), t("profile.permissionDenied"));
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            preferredAssetRepresentationMode:
              ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
          });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Toast.show({
            type: "error",
            text1: t("common.error"),
            text2: t("profile.photoTooLarge"),
          });
          return;
        }
        const mimeType = asset.mimeType ?? "image/jpeg";
        const extension = mimeType === "image/png" ? "png" : "jpg";
        setSelectedPhoto({
          uri: asset.uri,
          name: asset.fileName ?? `profile-${Date.now()}.${extension}`,
          type: mimeType,
        });
      }
    } catch {
      Toast.show({ type: "error", text1: t("common.error"), text2: t("profile.imageError") });
    }
  };

  const closePhotoModal = () => {
    if (uploading) return;
    setSelectedPhoto(null);
    setModalVisible(false);
  };

  const uploadProfilePicture = async (photo: PendingPhoto) => {
    setUploading(true);
    if (!userInfo?.id) {
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("profile_picture", {
      uri: photo.uri,
      name: photo.name,
      type: photo.type,
    } as any);

    try {
      const updatedUser = await apiRequest<AuthUser>(`users/${userInfo.id}/`, {
        method: "PATCH",
        body: formData,
      });

      const mergedUser: AuthUser = {
        ...userInfo,
        ...updatedUser,
        student: updatedUser.student ?? userInfo.student,
      };
      setUserInfo(mergedUser);
      await updateUser(mergedUser);
      const freshUser = await refreshUser().catch(() => mergedUser);
      setUserInfo(freshUser);
      setSelectedPhoto(null);
      setModalVisible(false);
      Toast.show({ type: "success", text1: t("common.success"), text2: t("profile.photoUpdated") });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: error instanceof Error ? error.message : t("common.networkError"),
      });
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
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: error instanceof Error ? error.message : t("common.networkError"),
      });
    }
  };

  const uploadCV = async (uri: string, name: string, type: string) => {
    setUploadingCV(true);
    const studentId = userInfo?.student?.id_student;
    if (!studentId) {
      setUploadingCV(false);
      Toast.show({ type: "error", text1: t("common.error"), text2: t("offres.incompleteProfile") });
      return;
    }

    const formData = new FormData();
    formData.append("cv", { uri, name, type } as any);

    try {
      const updatedStudent = await apiRequest<{ cv?: string }>(`students/${studentId}/`, {
        method: "PATCH",
        body: formData,
      });

      const updated: AuthUser = {
        ...userInfo,
        student: { ...userInfo.student!, cv: updatedStudent.cv },
      };
      setUserInfo(updated);
      await updateUser(updated);
      const freshUser = await refreshUser().catch(() => updated);
      setUserInfo(freshUser);
      Toast.show({ type: "success", text1: t("common.success"), text2: t("profile.cvUpdated") });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: error instanceof Error ? error.message : t("common.networkError"),
      });
    } finally {
      setUploadingCV(false);
    }
  };

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
    setLanguageModalVisible(false);
  };

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#044EB8" />
        <Text className="mt-2 text-gray-700">{t('common.loading')}</Text>
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
            onPress={() => {
              setSelectedPhoto(null);
              setModalVisible(true);
            }}
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
          {userInfo?.username || t('profile.unspecified')} {userInfo?.prenom || ""}
        </Text>
        <Text
          className="text-center text-gray-500 mt-1"
          style={{ fontFamily: "NotoSans-Regular", fontSize: 14 }}
        >
          {t('profile.student')} - {userInfo?.student?.niveau || t('profile.unknownLevel')}
        </Text>

        <View className="mt-6">
          <ProfileCompletionCard
            completion={userInfo?.profile_completion}
            onPress={() => router.push("/profile/complete")}
          />
        </View>

        {/* Détails */}
        <View className="mt-8 space-y-4">
          {[
            { icon: <User color="#044EB8" size={22} />, text: userInfo?.postnom || t('profile.unspecified') },
            { icon: <Mail color="#044EB8" size={22} />, text: userInfo?.email || t('profile.noEmail') },
            { icon: <PhoneCall color="#044EB8" size={22} />, text: userInfo?.telephone || t('profile.noPhone') },
            { icon: <Briefcase color="#044EB8" size={22} />, text: userInfo?.student?.filiere || userInfo?.student?.formation || t('profile.noFormation') },
          ].map((item, index) => (
            <View key={index} className="flex-row items-center bg-gray-50 p-4 rounded-xl shadow-sm mb-4">
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

        {/* LANGUE */}
        <View className="mt-6">
          <Text
            className="text-gray-700 mb-2"
            style={{ fontFamily: "MavenPro-SemiBold", fontSize: 16 }}
          >
            {t('profile.language')} :
          </Text>
          <TouchableOpacity
            onPress={() => setLanguageModalVisible(true)}
            className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm"
          >
            <View className="flex-row items-center">
              <Languages color="#044EB8" size={22} />
              <Text className="ml-3 text-gray-800" style={{ fontFamily: "NotoSans-Regular", fontSize: 15 }}>
                {i18n.language === 'fr' ? 'Français' : (i18n.language === 'en' ? 'English' : 'Lingala')}
              </Text>
            </View>
            <Edit3 color="#044EB8" size={18} />
          </TouchableOpacity>
        </View>

        {/* UPLOAD CV */}
        <View className="mt-10 mb-4">
          <Text
            className="text-gray-700 mb-2"
            style={{ fontFamily: "MavenPro-SemiBold", fontSize: 16 }}
          >
            {t('profile.myCV')}
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
                  {cvName ? cvName : userInfo?.student?.cv ? t('profile.changeCV') : t('profile.addCV')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {userInfo?.student?.cv && (
            <Text className="mt-2 text-center text-gray-500 text-sm">
              📄 {t('profile.currentCV')} {userInfo.student.cv.split("/").pop()}
            </Text>
          )}
        </View>

        {/* SUPPRESSION DU COMPTE */}
        <View className="mt-8 border border-red-200 bg-red-50 rounded-xl p-4">
          <Text className="text-red-800 text-[16px]" style={{ fontFamily: "MavenPro-SemiBold" }}>
            {t("profile.deleteAccount")}
          </Text>
          <Text className="text-red-700 mt-2 text-[14px]" style={{ fontFamily: "NotoSans-Regular" }}>
            {t("profile.deleteAccountDescription")}
          </Text>
          <TouchableOpacity
            onPress={() => setDeleteModalVisible(true)}
            className="mt-4 border border-red-600 py-3 rounded-xl flex-row justify-center items-center"
          >
            <Trash2 color="#dc2626" size={19} />
            <Text className="text-red-600 ml-2" style={{ fontFamily: "NotoSans-SemiBold", fontSize: 15 }}>
              {t("profile.deleteMyAccount")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => void Linking.openURL("https://totinda.com/suppression-compte")}
            className="mt-4 flex-row justify-center items-center"
          >
            <ExternalLink color="#044EB8" size={16} />
            <Text className="text-[#044EB8] ml-2 text-[13px] underline">
              {t("profile.externalDeletion")}
            </Text>
          </TouchableOpacity>
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
            {t('profile.logout')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PHOTO */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closePhotoModal}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text
              className="text-center text-gray-800 mb-4"
              style={{ fontFamily: "MavenPro-SemiBold", fontSize: 18 }}
            >
              {t('profile.editPhoto')}
            </Text>

            {selectedPhoto && (
              <View className="items-center mb-5">
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  className="w-32 h-32 rounded-full"
                  resizeMode="cover"
                />
                <Text className="mt-2 text-sm text-gray-500">
                  {t("profile.photoPreview")}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => pickImage(false)}
              disabled={uploading}
              className="flex-row items-center bg-gray-100 p-4 rounded-xl mb-3"
            >
              <User color="#044EB8" size={22} />
              <Text className="ml-3 text-gray-800 text-[15px]">{t('profile.gallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickImage(true)}
              disabled={uploading}
              className="flex-row items-center bg-gray-100 p-4 rounded-xl mb-3"
            >
              <Camera color="#044EB8" size={22} />
              <Text className="ml-3 text-gray-800 text-[15px]">{t('profile.camera')}</Text>
            </TouchableOpacity>

            {selectedPhoto && (
              <Button
                title={t("profile.savePhoto")}
                variant="gradient"
                onPress={() => void uploadProfilePicture(selectedPhoto)}
                loading={uploading}
                className="mt-2"
              />
            )}

            <TouchableOpacity
              onPress={closePhotoModal}
              disabled={uploading}
              className="bg-gray-200 p-3 rounded-xl mt-2"
            >
              <Text className="text-center text-gray-700">{t('common.cancel')}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      {/* MODAL SUPPRESSION DU COMPTE */}
      <Modal visible={deleteModalVisible} transparent animationType="slide" onRequestClose={closeDeleteModal}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="items-center">
              <View className="bg-red-100 p-3 rounded-full">
                <Trash2 color="#dc2626" size={28} />
              </View>
              <Text className="text-red-700 mt-4 text-center" style={{ fontFamily: "MavenPro-SemiBold", fontSize: 19 }}>
                {t("profile.deleteAccountConfirmTitle")}
              </Text>
            </View>
            <Text className="text-gray-600 mt-3 text-center text-[14px]">
              {t("profile.deleteAccountConfirmDescription")}
            </Text>
            <TextInput
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder={t("profile.currentPassword")}
              secureTextEntry
              autoCapitalize="none"
              editable={!deletingAccount}
              className="mt-5 border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
            />
            <TouchableOpacity
              onPress={() => void handleDeleteAccount()}
              disabled={!deletePassword || deletingAccount}
              className={`mt-4 py-4 rounded-xl flex-row justify-center items-center ${!deletePassword || deletingAccount ? "bg-red-300" : "bg-red-600"}`}
            >
              {deletingAccount ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Trash2 color="#fff" size={19} />
                  <Text className="text-white ml-2" style={{ fontFamily: "NotoSans-SemiBold", fontSize: 15 }}>
                    {t("profile.confirmPermanentDeletion")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={closeDeleteModal}
              disabled={deletingAccount}
              className="bg-gray-200 p-3 rounded-xl mt-3"
            >
              <Text className="text-center text-gray-700">{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* MODAL LANGUE */}
      <Modal visible={languageModalVisible} transparent animationType="slide" onRequestClose={() => setLanguageModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text
              className="text-center text-gray-800 mb-6"
              style={{ fontFamily: "MavenPro-SemiBold", fontSize: 18 }}
            >
              Sélectionnez votre langue
            </Text>

            {[
              { code: 'fr', label: 'Français' },
              { code: 'en', label: 'English' },
              { code: 'ln', label: 'Lingala' }
            ].map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                className={`flex-row items-center p-4 rounded-xl mb-3 border ${i18n.language === lang.code ? 'border-[#044EB8] bg-blue-50' : 'border-gray-100 bg-gray-100'}`}
              >
                <Text className={`text-[15px] ${i18n.language === lang.code ? 'text-[#044EB8] font-bold' : 'text-gray-800'}`}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setLanguageModalVisible(false)}
              className="bg-gray-200 p-3 rounded-xl mt-2"
            >
              <Text className="text-center text-gray-700">{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
