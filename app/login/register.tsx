import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "../../api/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { t } = useTranslation();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [postnom, setPostnom] = useState("");
  const [filiere, setFiliere] = useState("");
  const [niveau, setNiveau] = useState("");
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
            {/* Champ niveau */}
            <TextInput
              style={styles.input}
              placeholder={t("login.niveauLabel")}
              value={niveau}
              onChangeText={setNiveau}
              keyboardType="default"
            />
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
