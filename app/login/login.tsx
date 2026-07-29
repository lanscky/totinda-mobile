import { useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Typography } from "../../components/Typography";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Toast.show({
        type: "error",
        text1: t('login.missingFields'),
        text2: t('login.fillAllFields'),
      });
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.error');
      Toast.show({
        type: "error",
        text1: t('login.loginFailed'),
        text2: message,
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require("../../assets/onboard/backlogin.png")}
        className="h-64 justify-center"
        resizeMode="cover"
      >
        <SafeAreaView>
          <View className="px-6">
            <Image
              source={require("../../assets/images/logo.png")}
              className="w-32 h-16"
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
      >
        <ScrollView
          className="flex-1 -mt-10 bg-white rounded-t-[40px] px-8 pt-10"
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            <Typography variant="h1" font="maven" weight="bold" className="text-secondary">
              {t('login.welcome')}
            </Typography>
            <Typography variant="body" font="noto" weight="reg" className="text-gray-500 mt-2">
              {t('login.subtitle')}
            </Typography>

            <View className="mt-10">
              <Input
                label={t('login.emailLabel')}
                placeholder={t('login.emailPlaceholder')}
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
                label={t('login.passwordLabel')}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                icon={Lock}
                secureTextEntry
                autoComplete="current-password"
                textContentType="password"
              />

              <Button
                title={t('login.loginButton')}
                variant="gradient"
                onPress={handleLogin}
                loading={loading}
                className="mt-8"
              />
            </View>

            <View className="flex-row justify-center mt-10 mb-10">
              <Typography variant="body" font="noto" className="text-gray-600">
                {t('login.noAccount')}{" "}
              </Typography>
              <TouchableOpacity
                onPress={() => router.push("/login/register")}
                accessibilityRole="link"
              >
                <Typography variant="body" font="noto" weight="bold" className="text-primary">
                  {t('login.register')}
                </Typography>
              </TouchableOpacity>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
