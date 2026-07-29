import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { MotiText, MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { Typography } from "../components/Typography";

const { width } = Dimensions.get("window");
const ONBOARDING_SEEN_KEY = "onboarding-seen";

export default function Onboarding() {
  const { t } = useTranslation();
  const pagerRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY)
      .then((hasSeenOnboarding) => {
        if (hasSeenOnboarding === "true") {
          router.replace("/login/login");
        }
      })
      .catch(() => undefined);
  }, [router]);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    router.replace("/login/login");
  };

  const ONBOARDING_DATA = [
    {
      id: "1",
      title: t("onboarding.slide1.title"),
      description: t("onboarding.slide1.description"),
      image: require("../assets/onboard/1.png"),
      background: require("../assets/onboard/back1.png"),
    },
    {
      id: "2",
      title: t("onboarding.slide2.title"),
      description: t("onboarding.slide2.description"),
      image: require("../assets/onboard/2.png"),
      background: require("../assets/onboard/back2.png"),
    },
    {
      id: "3",
      title: t("onboarding.slide3.title"),
      description: t("onboarding.slide3.description"),
      image: require("../assets/onboard/3.png"),
      background: require("../assets/onboard/back3.png"),
    },
    {
      id: "4",
      title: t("onboarding.slide4.title"),
      description: t("onboarding.slide4.description"),
      image: require("../assets/onboard/4.png"),
      background: require("../assets/onboard/back4.png"),
    },
  ];

  const handleNext = () => {
    if (page < ONBOARDING_DATA.length - 1) {
      pagerRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
    } else {
      void finishOnboarding();
    }
  };

  const handleSkip = () => {
    void finishOnboarding();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        style={{ flex: 1 }}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setPage(Math.round(event.nativeEvent.contentOffset.x / width))
        }
      >
        {ONBOARDING_DATA.map((item, index) => (
          <View key={item.id} style={{ width }}>
            <Image
              source={item.background}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
            <SafeAreaView style={{ flex: 1 }}>
              {/* Header */}
              <View className="flex-row justify-between items-center px-6 pt-4">
                <Image
                  source={require("../assets/images/logo.png")}
                  style={{ width: 128, height: 64 }}
                  contentFit="contain"
                />
                <TouchableOpacity onPress={handleSkip}>
                  <Typography font="noto" weight="med" className="text-secondary">
                    {t("onboarding.skip")}
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View className="flex-1 justify-center items-center px-10">
                <MotiView
                  from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                  animate={{
                    opacity: page === index ? 1 : 0,
                    scale: page === index ? 1 : 0.8,
                    translateY: page === index ? 0 : 20
                  }}
                  transition={{ type: 'timing', duration: 700 }}
                >
                  <Image
                    source={item.image}
                    style={{ width: width * 0.8, height: width * 0.7 }}
                    contentFit="contain"
                  />
                </MotiView>

                <View className="mt-8 items-center">
                  <MotiText
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{
                      opacity: page === index ? 1 : 0,
                      translateY: page === index ? 0 : 10
                    }}
                    transition={{ type: 'timing', duration: 500, delay: 300 }}
                    className="text-center"
                  >
                    <Typography variant="h1" font="maven" weight="bold" className="text-secondary text-center">
                      {item.title}
                    </Typography>
                  </MotiText>

                  <MotiText
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{
                      opacity: page === index ? 1 : 0,
                      translateY: page === index ? 0 : 10
                    }}
                    transition={{ type: 'timing', duration: 500, delay: 500 }}
                    className="text-center mt-4"
                  >
                    <Typography variant="body" font="noto" weight="reg" className="text-gray-600 text-center">
                      {item.description}
                    </Typography>
                  </MotiText>
                </View>
              </View>
            </SafeAreaView>
          </View>
        ))}
      </ScrollView>

      {/* Footer / Controls */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
        }}
      >
        <View style={{ paddingHorizontal: 40, paddingBottom: 24 }}>
          <View className="flex-row justify-between items-center">
            {/* Progress Indicators */}
            <View className="flex-row gap-2">
              {ONBOARDING_DATA.map((_, i) => (
                <MotiView
                  key={i}
                  animate={{
                    width: i === page ? 24 : 8,
                    opacity: i === page ? 1 : 0.3,
                    backgroundColor: '#044EB8',
                  }}
                  className="h-2 rounded-full"
                />
              ))}
            </View>

            {/* Action Button */}
            <View style={{ width: 160 }}>
              {page === ONBOARDING_DATA.length - 1 ? (
                <Button
                  title={t("onboarding.start")}
                  variant="gradient"
                  onPress={handleNext}
                  className=""
                />
              ) : (
                <TouchableOpacity
                  onPress={handleNext}
                  className="bg-primary h-14 w-14 rounded-full items-center justify-center self-end"
                >
                  <ChevronRight color="white" size={28} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
