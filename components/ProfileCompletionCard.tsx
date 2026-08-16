import { ArrowRight, CheckCircle2, UserRoundCheck } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { ProfileCompletion } from "../api/auth";
import { Typography } from "./Typography";

type Props = {
  completion?: ProfileCompletion;
  onPress: () => void;
  compact?: boolean;
};

export function ProfileCompletionCard({ completion, onPress, compact = false }: Props) {
  const { t } = useTranslation();
  if (!completion) return null;

  const complete = completion.can_apply;
  const percentage = Math.max(0, Math.min(100, completion.percentage));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={t("profileCompletion.open")}
      className={`overflow-hidden rounded-2xl border p-4 ${
        complete ? "border-emerald-200 bg-emerald-50" : "border-blue-100 bg-blue-50"
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`h-11 w-11 items-center justify-center rounded-xl ${
            complete ? "bg-emerald-100" : "bg-blue-100"
          }`}
        >
          {complete ? (
            <CheckCircle2 size={23} color="#059669" />
          ) : (
            <UserRoundCheck size={23} color="#044EB8" />
          )}
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Typography weight="bold" className={complete ? "text-emerald-800" : "text-secondary"}>
              {complete
                ? t("profileCompletion.ready")
                : t("profileCompletion.title", { percentage })}
            </Typography>
            {!complete && <ArrowRight size={19} color="#044EB8" />}
          </View>
          {!compact && (
            <Typography variant="caption" font="noto" className="mt-1 text-gray-600">
              {complete
                ? t("profileCompletion.readyDescription")
                : t("profileCompletion.missingCount", {
                    count: completion.missing_fields.length,
                  })}
            </Typography>
          )}
        </View>
      </View>

      {!complete && (
        <View className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}
