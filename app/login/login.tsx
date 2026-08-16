import { useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Typography } from "../../components/Typography";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import { requestGoogleIdToken } from "../../api/googleAuth";

export default function Login() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [linkPassword, setLinkPassword] = useState("");
  const { login, googleLogin, loading } = useAuth();
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

  const requiresAccountLink = (error: unknown) => {
    if (!(error instanceof ApiError) || !error.data || typeof error.data !== "object") {
      return false;
    }
    return (error.data as Record<string, unknown>).code === "account_link_required";
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const idToken = await requestGoogleIdToken();
      if (!idToken) return;
      try {
        await googleLogin(idToken);
      } catch (error) {
        if (requiresAccountLink(error)) {
          setPendingGoogleToken(idToken);
          setLinkPassword("");
          return;
        }
        throw error;
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("login.googleLoginFailed"),
        text2: error instanceof Error ? error.message : t("common.error"),
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAccountLink = async () => {
    if (!pendingGoogleToken || !linkPassword) return;
    setGoogleLoading(true);
    try {
      await googleLogin(pendingGoogleToken, linkPassword);
      setPendingGoogleToken(null);
      setLinkPassword("");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("login.accountLinkFailed"),
        text2: error instanceof Error ? error.message : t("common.error"),
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const closeAccountLink = () => {
    if (googleLoading) return;
    setPendingGoogleToken(null);
    setLinkPassword("");
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
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          keyboardShouldPersistTaps="handled"
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

              <View className="my-6 flex-row items-center">
                <View className="h-px flex-1 bg-gray-200" />
                <Typography variant="caption" font="noto" className="mx-4 text-gray-400">
                  {t("login.orContinue")}
                </Typography>
                <View className="h-px flex-1 bg-gray-200" />
              </View>

              <TouchableOpacity
                onPress={() => void handleGoogleLogin()}
                disabled={loading || googleLoading}
                accessibilityRole="button"
                accessibilityLabel={t("login.continueWithGoogle")}
                className={`h-14 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white px-5 ${
                  loading || googleLoading ? "opacity-60" : ""
                }`}
              >
                <Image
                  source={require("../../assets/icons/google.png")}
                  className="h-6 w-6"
                  resizeMode="contain"
                />
                <Typography font="noto" weight="bold" className="ml-3 text-secondary">
                  {googleLoading ? t("common.loading") : t("login.continueWithGoogle")}
                </Typography>
              </TouchableOpacity>
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

      <Modal
        visible={Boolean(pendingGoogleToken)}
        transparent
        animationType="slide"
        onRequestClose={closeAccountLink}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="rounded-t-[32px] bg-white p-7 pb-10">
            <Typography variant="h2" weight="bold" className="text-secondary">
              {t("login.linkExistingAccount")}
            </Typography>
            <Typography font="noto" className="mb-6 mt-2 leading-6 text-gray-500">
              {t("login.linkExistingAccountDescription")}
            </Typography>
            <Input
              label={t("login.passwordLabel")}
              placeholder={t("login.passwordPlaceholder")}
              value={linkPassword}
              onChangeText={setLinkPassword}
              icon={Lock}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              editable={!googleLoading}
              onSubmitEditing={() => void handleAccountLink()}
            />
            <Button
              title={t("login.linkAccount")}
              variant="gradient"
              onPress={() => void handleAccountLink()}
              loading={googleLoading}
              disabled={!linkPassword}
              className="mt-2"
            />
            <TouchableOpacity
              onPress={closeAccountLink}
              disabled={googleLoading}
              className="mt-3 rounded-xl bg-gray-100 py-3"
            >
              <Text className="text-center font-noto-reg text-gray-600">
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
