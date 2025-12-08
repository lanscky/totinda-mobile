import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

export default function Onboarding() {
  const pagerRef = useRef<PagerView>(null); // 👈 Typage explicite
  const [page, setPage] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (page < 3) {
      pagerRef.current?.setPage(page + 1);
    } else {
      console.log("Onboarding terminé !");
     router.replace("/login/login");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {/* Page 1 */}
        <View key="1">
          <ImageBackground
            source={require("../assets/onboard/back1.png")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.header}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
              {/* Bouton "Ignorer" */}
          <TouchableOpacity onPress={() => router.replace("/login/login")}>
            <Text
              style={{
                marginTop: 20,
                fontFamily: "NotoSans-Regular",
                color: "#1D2633", // tu peux changer la couleur pour ressembler à un bouton
              }}
            >
              Ignorer
            </Text>
          </TouchableOpacity>
            </View>

            <View style={styles.container}>
              <Image
                source={require("../assets/onboard/1.png")}
                style={styles.image}
              />
              <Text style={styles.textgrand}>
                Trouvez le stage qui vous lance
              </Text>
              <Text style={styles.textpetit}>
                Découvrez des offres de stage adaptées à votre profil et à vos
                ambitions, en quelques clics.
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Page 2 */}
        <View key="2">
          <ImageBackground
            source={require("../assets/onboard/back2.png")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.header}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
              {/* Bouton "Ignorer" */}
            <TouchableOpacity onPress={() => router.replace("/login/login")}>
              <Text
                style={{
                  marginTop: 20,
                  fontFamily: "NotoSans-Regular",
                  color: "#1D2633", // tu peux changer la couleur pour ressembler à un bouton
                }}
              >
                Ignorer
              </Text>
            </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <Image
                source={require("../assets/onboard/2.png")}
                style={styles.image}
              />
              <Text style={styles.textgrand}>
                Postulez sans galérer
              </Text>
              <Text style={styles.textpetit}>
                Un seul profil, une multitude d’opportunités. Fini les candidatures répétitives.
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Page 3 */}
        <View key="3">
          <ImageBackground
            source={require("../assets/onboard/back3.png")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.header}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
              {/* Bouton "Ignorer" */}
      <TouchableOpacity onPress={() => router.replace("/login/login")}>
        <Text
          style={{
            marginTop: 20,
            fontFamily: "NotoSans-Regular",
            color: "#1D2633", // tu peux changer la couleur pour ressembler à un bouton
          }}
        >
          Ignorer
        </Text>
      </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <Image
                source={require("../assets/onboard/3.png")}
                style={styles.image}
              />
              <Text style={styles.textgrand}>
                Suivez l’avancement de vos candidatures
              </Text>
              <Text style={styles.textpetit}>
                Restez informé à chaque étape. Plus de stress, vous savez où vous en êtes.
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Page 4 */}
        <View key="4">
          <ImageBackground
            source={require("../assets/onboard/back4.png")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.header}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
              {/* Bouton "Ignorer" */}
      <TouchableOpacity onPress={() => router.replace("/login/login")}>
        <Text
          style={{
            marginTop: 20,
            fontFamily: "NotoSans-Regular",
            color: "#1D2633", // tu peux changer la couleur pour ressembler à un bouton
          }}
        >
          Ignorer
        </Text>
      </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <Image
                source={require("../assets/onboard/4.png")}
                style={styles.image}
              />
              <Text style={styles.textgrand}>
                Donnez un vrai départ à votre vie pro
              </Text>
              <Text style={styles.textpetit}>
                Un stage peut tout changer. Commencez maintenant à bâtir votre avenir.
              </Text>
            </View>
          </ImageBackground>
        </View>
      </PagerView>

      {/* Boutons & indicateurs en bas */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { opacity: i === page ? 1 : 0.3 },
              ]}
            />
          ))}
        </View>

        {page === 3 ? <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText} >Commencer</Text>
        </TouchableOpacity> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 15,
    alignItems: "center",
  },
  logo: {
    width: 130,
    height: 100,
    resizeMode: "contain",
    marginTop: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal:30,
    paddingInlineStart:20,

    paddingInlineEnd:20,
    alignItems: "center",
   
   
  },
  image: {
    width: 325,
    height: 300,
    resizeMode: "contain",
  },
  textgrand: {
    fontSize: 28,
    fontFamily: "MavenPro-Bold",
    color: "#1D2633",
   
    marginTop: 20,
  },
  textpetit: {
    fontSize: 15,
    marginTop: 15,
    fontFamily: "NotoSans-Regular",
    color: "#1D2633",
    textAlign: "justify",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#044EB8",
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: "#044EB8",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "MavenPro-Medium",
  },
});
