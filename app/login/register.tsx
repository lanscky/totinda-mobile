import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function Register() {
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
    if (!email || !password || !prenom || !postnom || !telephone) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Vérification correspondance des mots de passe
    if (password !== password2) {
      Alert.alert("Erreur", "Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    // Préparation des données
    const payload = {
      filiere: filiere,
      niveau: niveau,
      user: {
        email: email,
        is_staff: true,
        is_superuser: true,
        password: password,
        postnom: postnom,
        prenom: prenom,
        role: "student",
        telephone: telephone,
        username: nom,
      },
    };

    try {
      const response = await fetch("https://backend.totinda.com/api/students/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur:", data);
        Alert.alert("Échec", "Inscription échouée : " + JSON.stringify(data));
        return;
      }

      Alert.alert(
        "Inscription réussie ✅",
        "Veuillez vérifier votre e-mail pour activer votre compte avant de vous connecter."
      );

      // Attendre un peu puis rediriger
      setTimeout(() => {
        router.push("/login/login");
      }, 3000);
    } catch (error) {
     // ✅ On vérifie d’abord le type de l’erreur
      if (error instanceof Error) {
        Alert.alert("Erreur", error.message);
      } else {
        Alert.alert("Erreur", "Une erreur inconnue est survenue.");
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
            <Text style={styles.textgrand}> Bienvenue chez nous !</Text>
            <Text style={[styles.textpetit, { paddingLeft: 7 }]}>
              Créez un compte gratuitement !
            </Text>

            {/* Champ nom */}
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={nom}
              onChangeText={setNom}
              keyboardType="default"
            />
            {/* Champ postnom */}
            <TextInput
              style={styles.input}
              placeholder="Postnom"
              value={postnom}
              onChangeText={setPostnom}
              keyboardType="default"
            />
            {/* Champ prenom */}
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={prenom}
              onChangeText={setPrenom}
              keyboardType="default"
            />
            {/* Champ filiere */}
            <TextInput
              style={styles.input}
              placeholder="Filière"
              value={filiere}
              onChangeText={setFiliere}
              keyboardType="default"
            />
            {/* Champ niveau */}
            <TextInput
              style={styles.input}
              placeholder="Niveau"
              value={niveau}
              onChangeText={setNiveau}
              keyboardType="default"
            />
            {/* Champ Email */}
            <TextInput
              style={styles.input}
              placeholder="Adresse e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {/* Champ téléphone */}
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
            />

            {/* Champ Mot de passe */}
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Champ Confirmation mot de passe */}
            <TextInput
              style={styles.input}
              placeholder="Confirmer mot de passe"
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
                  <Text style={styles.buttonText}>S’enregistrer</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Lien vers connexion */}
            <Text className="text-base ml-4 text-slate-900">
              Vous avez déjà un compte ?{" "}
              <Text className="font-black">
                <Link href="/login/login">Connectez-vous</Link>
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
