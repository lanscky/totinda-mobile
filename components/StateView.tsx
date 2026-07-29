import { RefreshCw, WifiOff } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Typography } from "./Typography";

interface StateViewProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function StateView({ message, onRetry, compact = false }: StateViewProps) {
  const { t } = useTranslation();

  return (
    <View className={`items-center justify-center px-8 ${compact ? "py-8" : "flex-1 py-16"}`}>
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
        <WifiOff size={25} color="#044EB8" />
      </View>
      <Typography
        variant="body"
        font="noto"
        className="mt-4 text-center text-gray-500"
      >
        {message || t("common.networkError")}
      </Typography>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          accessibilityRole="button"
          className="mt-5 flex-row items-center rounded-xl bg-primary px-5 py-3"
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Typography weight="bold" className="ml-2 text-white">
            {t("common.retry")}
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}
