import { useRouter } from "expo-router";
import {
  BookOpen,
  Check,
  ChevronDown,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiRequest } from "../../api/client";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Typography } from "../../components/Typography";
import { STUDY_LEVEL_GROUPS } from "../../constants/studyLevels";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { t } = useTranslation();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [postnom, setPostnom] = useState("");
  const [filiere, setFiliere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // Vérification simple
    if (
      !nom.trim() ||
      !email.trim() ||
      !password ||
      !password2 ||
      !prenom.trim() ||
      !postnom.trim() ||
      !telephone.trim() ||
      !filiere.trim() ||
      !niveau.trim()
    ) {
      Alert.alert(t("common.error"), t("login.fillAllFields"));
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      Alert.alert(t("common.error"), t("login.invalidEmail"));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t("common.error"), t("login.passwordTooShort"));
      return;
    }

    // Vérification correspondance des mots de passe
    if (password !== password2) {
      Alert.alert(t("common.error"), t("login.passwordMismatch"));
      return;
    }

    setLoading(true);

    // Préparation des données
    const payload = {
      filiere: filiere.trim(),
      niveau: niveau.trim(),
      user: {
        email: email.trim().toLowerCase(),
        password: password,
        postnom: postnom.trim(),
        prenom: prenom.trim(),
        role: "student",
        telephone: telephone.trim(),
        username: nom.trim(),
      },
    };

    try {
      await apiRequest("students/", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify(payload),
      });

      Alert.alert(
        t("login.registerSuccess"),
        t("login.registerSuccessMessage"),
        [{ text: "OK", onPress: () => router.replace("/login/login") }],
      );
    } catch (error) {
      // ✅ On vérifie d’abord le type de l’erreur
      if (error instanceof Error) {
        Alert.alert(t("common.error"), error.message);
      } else {
        Alert.alert(t("common.error"), t("login.unknownError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require("../../assets/onboard/backlogin.png")}
        className="h-56 justify-center"
        resizeMode="cover"
      >
        <SafeAreaView>
          <View className="px-6">
            <Image
              source={require("../../assets/images/logo.png")}
              className="h-16 w-32"
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? -48 : 0}
      >
        <ScrollView
          className="-mt-8 flex-1 rounded-t-[36px] bg-white"
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
          >
            <Typography
              variant="h1"
              font="maven"
              weight="bold"
              className="text-secondary"
            >
              {t("login.welcomeRegister")}
            </Typography>
            <Typography
              variant="body"
              font="noto"
              className="mt-2 text-gray-500"
            >
              {t("login.subtitleRegister")}
            </Typography>

            <View className="mt-8">
              <Input
                label={t("login.nameLabel")}
                placeholder={t("login.nameLabel")}
                value={nom}
                onChangeText={setNom}
                icon={User}
                autoCapitalize="words"
                autoComplete="family-name"
                textContentType="familyName"
              />
              <Input
                label={t("login.postnomLabel")}
                placeholder={t("login.postnomLabel")}
                value={postnom}
                onChangeText={setPostnom}
                icon={User}
                autoCapitalize="words"
              />
              <Input
                label={t("login.prenomLabel")}
                placeholder={t("login.prenomLabel")}
                value={prenom}
                onChangeText={setPrenom}
                icon={User}
                autoCapitalize="words"
                autoComplete="given-name"
                textContentType="givenName"
              />
              <Input
                label={t("login.filiereLabel")}
                placeholder={t("login.filiereLabel")}
                value={filiere}
                onChangeText={setFiliere}
                icon={BookOpen}
                autoCapitalize="sentences"
              />

              <View className="mb-4 w-full">
                <Typography
                  variant="caption"
                  font="maven"
                  weight="med"
                  className="mb-2 ml-1 text-secondary"
                >
                  {t("login.niveauLabel")}
                </Typography>
                <TouchableOpacity
                  className="min-h-[54px] flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-3"
                  onPress={() => setLevelModalVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t("login.selectNiveau")}
                  activeOpacity={0.7}
                >
                  <GraduationCap size={20} color="#9CA3AF" />
                  <Text
                    className={`ml-3 flex-1 font-noto-reg text-base ${
                      niveau ? "text-secondary" : "text-gray-400"
                    }`}
                    numberOfLines={2}
                  >
                    {niveau || t("login.selectNiveau")}
                  </Text>
                  <ChevronDown size={20} color="#044EB8" />
                </TouchableOpacity>
              </View>

              <Input
                label={t("login.emailLabel")}
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChangeText={setEmail}
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
              />
              <Input
                label={t("login.telephone")}
                placeholder={t("login.telephone")}
                value={telephone}
                onChangeText={setTelephone}
                icon={Phone}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
              <Input
                label={t("login.passwordLabel")}
                placeholder={t("login.passwordPlaceholder")}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                icon={Lock}
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <Input
                label={t("login.confirmPasswordLabel")}
                placeholder={t("login.confirmPasswordLabel")}
                secureTextEntry
                value={password2}
                onChangeText={setPassword2}
                icon={Lock}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              <Button
                title={t("login.registerButton")}
                variant="gradient"
                onPress={handleRegister}
                loading={loading}
                className="mt-4"
              />
            </View>

            <View className="mb-4 mt-8 flex-row flex-wrap justify-center">
              <Typography variant="body" font="noto" className="text-gray-600">
                {t("login.alreadyAccount")}{" "}
              </Typography>
              <TouchableOpacity
                onPress={() => router.replace("/login/login")}
                accessibilityRole="link"
              >
                <Typography
                  variant="body"
                  font="noto"
                  weight="bold"
                  className="text-primary"
                >
                  {t("login.loginLink")}
                </Typography>
              </TouchableOpacity>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={levelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setLevelModalVisible(false)}
            accessibilityLabel={t("common.cancel")}
          />
          <SafeAreaView edges={["bottom"]} style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t("login.selectNiveauTitle")}</Text>
            <Text style={styles.modalSubtitle}>{t("login.selectNiveauDescription")}</Text>

            <ScrollView
              style={styles.levelList}
              contentContainerStyle={styles.levelListContent}
              showsVerticalScrollIndicator={false}
            >
              {STUDY_LEVEL_GROUPS.map((group) => (
                <View key={group.title} style={styles.levelGroup}>
                  <Text style={styles.levelGroupTitle}>{group.title}</Text>
                  {group.options.map((option) => {
                    const selected = niveau === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.levelOption, selected && styles.levelOptionSelected]}
                        onPress={() => {
                          setNiveau(option);
                          setLevelModalVisible(false);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                      >
                        <Text style={[styles.levelOptionText, selected && styles.levelOptionTextSelected]}>
                          {option}
                        </Text>
                        <View style={[styles.radio, selected && styles.radioSelected]}>
                          {selected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setLevelModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  formContent: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  modalContent: {
    width: "100%",
    maxHeight: "84%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    backgroundColor: "#D0D5DD",
    marginBottom: 18,
  },
  modalTitle: {
    color: "#1D2633",
    fontFamily: "MavenPro-Bold",
    fontSize: 21,
  },
  modalSubtitle: {
    color: "#667085",
    fontFamily: "NotoSans-Regular",
    fontSize: 13,
    marginTop: 5,
    marginBottom: 12,
  },
  levelList: {
    flexShrink: 1,
  },
  levelListContent: {
    paddingBottom: 4,
  },
  levelGroup: {
    marginTop: 12,
  },
  levelGroupTitle: {
    color: "#044EB8",
    fontFamily: "MavenPro-SemiBold",
    fontSize: 15,
    marginBottom: 7,
  },
  levelOption: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelOptionSelected: {
    borderColor: "#044EB8",
    backgroundColor: "#EFF6FF",
  },
  levelOptionText: {
    flex: 1,
    color: "#344054",
    fontFamily: "NotoSans-Regular",
    fontSize: 13,
    paddingRight: 10,
  },
  levelOptionTextSelected: {
    color: "#044EB8",
    fontFamily: "NotoSans-Bold",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#98A2B3",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#044EB8",
    backgroundColor: "#044EB8",
  },
  modalCancelButton: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: "#EAECF0",
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#344054",
    fontFamily: "NotoSans-Bold",
    fontSize: 14,
  },
});
