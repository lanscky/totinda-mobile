import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Totinda",
  slug: config.slug ?? "archive",
  ios: {
    ...config.ios,
    bundleIdentifier:
      process.env.IOS_BUNDLE_IDENTIFIER ?? "com.lanscky.archive",
    supportsTablet: false,
    config: {
      ...config.ios?.config,
      usesNonExemptEncryption: false,
    },
  },
  web: {
    ...config.web,
    output: "single",
  },
  plugins: [
    ...(config.plugins ?? []),
    [
      "expo-image-picker",
      {
        photosPermission:
          "Totinda utilise vos photos uniquement pour mettre à jour votre photo de profil.",
        cameraPermission:
          "Totinda utilise l’appareil photo uniquement pour créer votre photo de profil.",
        microphonePermission: false,
      },
    ],
  ],
});
