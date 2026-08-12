import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "../../api/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STUDY_LEVEL_GROUPS = [
  {
    title: "Enseignement Secondaire",
    options: ["Humanités (Diplôme d'État / Baccalauréat RDC)"],
  },
  {
    title: "Enseignement Supérieur – Système LMD (actuel)",
    options: [
      "Licence LMD (Bac +3)",
      "Master LMD (Bac +5)",
      "Doctorat LMD (Bac +8)",
    ],
  },
  {
    title: "Enseignement Supérieur – Système classique (ancien)",
    options: [
      "Graduat (Ancien système - Bac +3)",
      "Licence (Ancien système - Bac +5)",
    ],
  },
  {
    title: "Enseignement Technique et Professionnel",
    options: [
      "Brevet d'Aptitude Professionnelle (BAP)",
      "Brevet de Technicien (BT)",
    ],
  },
] as const;

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
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.background}>
          {/* Image de fond */}
          <ImageBackground
            source={require("../../assets/onboard/backlogin.png")}
            style={styles.backlogin}
            resizeMode="cover"
          >
            <View style={styles.header}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
              />
            </View>
          </ImageBackground>

          {/* Contenu principal */}
          <View
            style={{
              width: "100%",
              marginTop: 20,
              paddingHorizontal: 30,
            }}
          >
            <Text style={styles.textgrand}> {t("login.welcomeRegister")}</Text>
            <Text style={[styles.textpetit, { paddingLeft: 7 }]}>
              {t("login.subtitleRegister")}
            </Text>

            {/* Champ nom */}
            <TextInput
              style={styles.input}
              placeholder={t("login.nameLabel")}
              value={nom}
              onChangeText={setNom}
              keyboardType="default"
            />
            {/* Champ postnom */}
            <TextInput
              style={styles.input}
              placeholder={t("login.postnomLabel")}
              value={postnom}
              onChangeText={setPostnom}
              keyboardType="default"
            />
            {/* Champ prenom */}
            <TextInput
              style={styles.input}
              placeholder={t("login.prenomLabel")}
              value={prenom}
              onChangeText={setPrenom}
              keyboardType="default"
            />
            {/* Champ filiere */}
            <TextInput
              style={styles.input}
              placeholder={t("login.filiereLabel")}
              value={filiere}
              onChangeText={setFiliere}
              keyboardType="default"
            />
            {/* Sélection du niveau d'études */}
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setLevelModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={t("login.selectNiveau")}
            >
              <Text
                style={niveau ? styles.selectValue : styles.selectPlaceholder}
                numberOfLines={2}
              >
                {niveau || t("login.selectNiveau")}
              </Text>
              <Text style={styles.selectChevron}>⌄</Text>
            </TouchableOpacity>
            {/* Champ Email */}
            <TextInput
              style={styles.input}
              placeholder={t("login.emailLabel")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {/* Champ téléphone */}
            <TextInput
              style={styles.input}
              placeholder={t("login.telephone")}
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
            />

            {/* Champ Mot de passe */}
            <TextInput
              style={styles.input}
              placeholder={t("login.passwordLabel")}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Champ Confirmation mot de passe */}
            <TextInput
              style={styles.input}
              placeholder={t("login.confirmPasswordLabel")}
              secureTextEntry
              value={password2}
              onChangeText={setPassword2}
            />

            {/* Bouton d’enregistrement */}
            <TouchableOpacity
              style={{ overflow: "hidden", marginBottom: 0 }}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={["#044EB8", "#1B81CA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t("login.registerButton")}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Lien vers connexion */}
            <Text className="text-base ml-4 text-slate-900">
              {t("login.alreadyAccount")}{" "}
              <Text className="font-black">
                <Link href="/login/login">{t("login.loginLink")}</Link>
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

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
          <View style={styles.modalContent}>
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
                          {selected && <View style={styles.radioDot} />}
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: 20,
  },
  backlogin: {
    width: "100%",
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    alignItems: "center",
  },
  logo: {
    width: 130,
    height: 100,
    resizeMode: "contain",
    marginTop: 1,
  },
  textgrand: {
    fontSize: 26,
    fontFamily: "MavenPro-Bold",
    color: "#1D2633",
  },
  textpetit: {
    fontSize: 15,
    marginTop: 15,
    fontFamily: "NotoSans-Regular",
    color: "#1D2633",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontFamily: "NotoSans-Regular",
  },
  selectInput: {
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectValue: {
    flex: 1,
    color: "#1D2633",
    fontFamily: "NotoSans-Regular",
    fontSize: 14,
    paddingRight: 10,
  },
  selectPlaceholder: {
    flex: 1,
    color: "#8E8E93",
    fontFamily: "NotoSans-Regular",
    fontSize: 14,
    paddingRight: 10,
  },
  selectChevron: {
    color: "#044EB8",
    fontSize: 24,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  modalContent: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 16,
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
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    fontFamily: "NotoSans-SemiBold",
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    textTransform: "uppercase",
    fontFamily: "NotoSans-Bold",
  },
});
