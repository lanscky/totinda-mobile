import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { loginUser } from "./services/auth";
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleLogin = async () => {
  try {
    setLoading(true); // démarre le loader
    const token = await loginUser(email, password);
    console.log("Token :", token);
    router.replace("/home/home");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    Toast.show({
      type: "error",
      text1: "Échec de la connexion",
      text2: message,
      position: "top",
    });
  } finally {
    setLoading(false); // arrête le loader
  }
};

  return (
    <View style={{ flex: 1 }}>
        <ScrollView>
            <View style={styles.background}>
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
            <View style={{ width: "100%",marginTop: 40,paddingHorizontal: 30, }} >
                <Text style={styles.textgrand}>Heureux de vous revoir !</Text>  
                <Text style={styles.textpetit}>Connectez-vous et commencez votre vie professionnelle !</Text>

                {/* Champ Email */}
        <View style={styles.inputContainer} className="mt-10">
          <Ionicons name="mail-outline" size={20} color="#044EB8" />
          <TextInput
            style={styles.input}
            placeholder="Adresse e-mail"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Champ Mot de passe */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#044EB8" />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{marginLeft: 5}}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#044EB8"
            />
          </TouchableOpacity>
        </View>

        
            <TouchableOpacity
                style={{ overflow: "hidden", marginBottom: 10 }}
                onPress={handleLogin}
                disabled={loading} // désactive le bouton pendant le chargement
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
                    <Text style={styles.buttonText}>Se connecter</Text>
                    )}
                </LinearGradient>
                </TouchableOpacity>
                <Toast />

            <Text style={styles.or}>Ou</Text>

            {/* Boutons de réseaux sociaux */}
            <View style={styles.socialContainer}>
                
               
                <TouchableOpacity style={[styles.socialButton, ]}>
                    <Image
                    source={require("../../assets/icons/google.png")}
                    style={[styles.icon]}
                />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.socialButton, ]}>
                    <Image
                        source={require("../../assets/icons/facebook.png")}
                        style={[styles.icon]}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.socialButton, ]}>
                    <Image
                        source={require("../../assets/icons/apple.png")}
                        style={[styles.icon]}
                    />
                </TouchableOpacity>
                
            </View>

            {/* <Text className="text-base mt-12 ml-4 text-slate-900">
              Vous n’avez pas de compte ?{" "}
              <Text className="font-black">
                <Link href="/login/register">Inscrivez-vous</Link>
              </Text>
            </Text> */}
            <Text className="text-base mt-12 ml-4 text-slate-900">
              Vous n’avez pas de compte ?{" "}
              <Text
                className="font-black text-blue-600"
                onPress={() => WebBrowser.openBrowserAsync("https://www.totinda.com/register")}
              >
                Inscrivez-vous
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
    marginTop:20
  },
  backlogin: {
    width: "100%",
    marginTop:20
  
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

    marginBottom:30
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
  color: "#fff",             // ✅ texte blanc
  textTransform: "uppercase", // ✅ met le texte en majuscules
  fontFamily: "NotoSans-Bold",
  
},
or: {

    textAlign: "center",
    color: "#888",
    marginBottom: 30,
    marginTop:20,
    fontFamily: "NotoSans-Regular",
    fontSize: 14,
  },
  socialContainer: {
  flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
    width: "100%",
    marginTop: 10,
   
  },
  socialButton: {
  
    marginHorizontal: 5,
    paddingTop: 15,
    alignItems: "center",
  },
    icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginBottom: 20,
    width: "100%",
    backgroundColor: "#f9f9f9",
  },
 input: {
    flex: 1,
    marginLeft: 10,
    color: "#000",
    fontFamily: "NotoSans-Regular",
  },
});
