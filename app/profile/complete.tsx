import { Href, useLocalSearchParams, useRouter } from "expo-router";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  GraduationCap,
  Phone,
  User,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
import Toast from "react-native-toast-message";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Typography } from "../../components/Typography";
import { STUDY_LEVEL_GROUPS } from "../../constants/studyLevels";
import { useAuth } from "../../context/AuthContext";

type FieldName = "username" | "postnom" | "prenom" | "telephone" | "filiere" | "niveau";

export default function CompleteProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { user, completeStudentProfile } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [postnom, setPostnom] = useState(user?.postnom ?? "");
  const [prenom, setPrenom] = useState(user?.prenom ?? "");
  const [telephone, setTelephone] = useState(user?.telephone ?? "");
  const [filiere, setFiliere] = useState(user?.student?.filiere ?? "");
  const [niveau, setNiveau] = useState(user?.student?.niveau ?? "");
  const [saving, setSaving] = useState(false);
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const values = useMemo(
    () => ({ username, postnom, prenom, telephone, filiere, niveau }),
    [filiere, niveau, postnom, prenom, telephone, username],
  );

  const completion = useMemo(() => {
    const completed = Object.values(values).filter((value) => value.trim()).length;
    return Math.round((completed / Object.keys(values).length) * 100);
  }, [values]);

  const clearError = (field: FieldName) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSave = async () => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    (Object.entries(values) as [FieldName, string][]).forEach(([field, value]) => {
      if (!value.trim()) nextErrors[field] = t("profileCompletion.required");
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await completeStudentProfile({
        username: username.trim(),
        postnom: postnom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        filiere: filiere.trim(),
        niveau: niveau.trim(),
      });
      Toast.show({
        type: "success",
        text1: t("common.success"),
        text2: t("profileCompletion.saved"),
      });
      const safeReturnTo =
        returnTo?.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/home/profils";
      router.replace(safeReturnTo as Href);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: error instanceof Error ? error.message : t("common.networkError"),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-row items-center px-5 pb-4 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-gray-100"
          >
            <ChevronLeft size={24} color="#1D2633" />
          </TouchableOpacity>
          <Typography variant="h3" weight="bold" className="ml-4 text-secondary">
            {t("profileCompletion.screenTitle")}
          </Typography>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View className="rounded-2xl bg-blue-50 p-5">
              <View className="flex-row items-center justify-between">
                <Typography weight="bold" className="text-secondary">
                  {t("profileCompletion.title", { percentage: completion })}
                </Typography>
                <Typography weight="bold" className="text-primary">
                  {completion}%
                </Typography>
              </View>
              <View className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <View className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
              </View>
              <Typography variant="caption" font="noto" className="mt-3 leading-5 text-gray-600">
                {t("profileCompletion.screenSubtitle")}
              </Typography>
            </View>

            <Typography variant="h3" weight="bold" className="mb-4 mt-8 text-secondary">
              {t("profileCompletion.identitySection")}
            </Typography>
            <Input
              label={t("login.nameLabel")}
              placeholder={t("login.nameLabel")}
              value={username}
              onChangeText={(value) => { setUsername(value); clearError("username"); }}
              icon={User}
              error={errors.username}
              autoCapitalize="words"
            />
            <Input
              label={t("login.postnomLabel")}
              placeholder={t("login.postnomLabel")}
              value={postnom}
              onChangeText={(value) => { setPostnom(value); clearError("postnom"); }}
              icon={User}
              error={errors.postnom}
              autoCapitalize="words"
            />
            <Input
              label={t("login.prenomLabel")}
              placeholder={t("login.prenomLabel")}
              value={prenom}
              onChangeText={(value) => { setPrenom(value); clearError("prenom"); }}
              icon={User}
              error={errors.prenom}
              autoCapitalize="words"
            />
            <Input
              label={t("login.telephone")}
              placeholder={t("login.telephone")}
              value={telephone}
              onChangeText={(value) => { setTelephone(value); clearError("telephone"); }}
              icon={Phone}
              error={errors.telephone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />

            <Typography variant="h3" weight="bold" className="mb-4 mt-5 text-secondary">
              {t("profileCompletion.studySection")}
            </Typography>
            <Input
              label={t("login.filiereLabel")}
              placeholder={t("login.filiereLabel")}
              value={filiere}
              onChangeText={(value) => { setFiliere(value); clearError("filiere"); }}
              icon={BookOpen}
              error={errors.filiere}
              autoCapitalize="sentences"
            />

            <View className="mb-4">
              <Typography variant="caption" weight="med" className="mb-2 ml-1 text-secondary">
                {t("login.niveauLabel")}
              </Typography>
              <TouchableOpacity
                onPress={() => setLevelModalVisible(true)}
                className={`min-h-[54px] flex-row items-center rounded-xl border bg-white px-4 py-3 ${
                  errors.niveau ? "border-red-500" : "border-gray-200"
                }`}
              >
                <GraduationCap size={20} color="#9CA3AF" />
                <Text className={`ml-3 flex-1 font-noto-reg text-base ${niveau ? "text-secondary" : "text-gray-400"}`}>
                  {niveau || t("login.selectNiveau")}
                </Text>
                <ChevronDown size={20} color="#044EB8" />
              </TouchableOpacity>
              {errors.niveau && (
                <Text className="ml-1 mt-1 font-noto-reg text-xs text-red-500">{errors.niveau}</Text>
              )}
            </View>

            <Button
              title={t("profileCompletion.save")}
              variant="gradient"
              onPress={() => void handleSave()}
              loading={saving}
              className="mb-4 mt-5"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={levelModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLevelModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[82%] rounded-t-[30px] bg-white px-5 pb-8 pt-5">
            <View className="mb-5 h-1.5 w-11 self-center rounded-full bg-gray-300" />
            <Typography variant="h2" weight="bold" className="text-secondary">
              {t("login.selectNiveauTitle")}
            </Typography>
            <Typography variant="caption" font="noto" className="mb-3 mt-1 text-gray-500">
              {t("login.selectNiveauDescription")}
            </Typography>
            <ScrollView showsVerticalScrollIndicator={false}>
              {STUDY_LEVEL_GROUPS.map((group) => (
                <View key={group.title} className="mt-4">
                  <Typography weight="semi" className="mb-2 text-primary">
                    {group.title}
                  </Typography>
                  {group.options.map((option) => {
                    const selected = niveau === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          setNiveau(option);
                          clearError("niveau");
                          setLevelModalVisible(false);
                        }}
                        className={`mb-2 min-h-[52px] flex-row items-center rounded-xl border px-4 py-3 ${
                          selected ? "border-primary bg-blue-50" : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <Text className={`flex-1 font-noto-reg ${selected ? "text-primary" : "text-gray-700"}`}>
                          {option}
                        </Text>
                        {selected && <Check size={20} color="#044EB8" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setLevelModalVisible(false)}
              className="mt-4 rounded-xl bg-gray-100 py-3"
            >
              <Text className="text-center font-noto-reg text-gray-700">{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
