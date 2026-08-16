const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

export const isGoogleSignInConfigured = Boolean(WEB_CLIENT_ID);

const loadGoogleSignIn = async () => {
  if (!WEB_CLIENT_ID) {
    throw new Error(
      "La connexion Google n’est pas encore configurée pour cette version de l’application.",
    );
  }

  const google = await import("react-native-nitro-google-signin");
  google.GoogleOneTapSignIn.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID || null,
    offlineAccess: false,
    autoSelectOnSignIn: false,
  });
  return google;
};

export const requestGoogleIdToken = async (): Promise<string | null> => {
  const google = await loadGoogleSignIn();
  await google.GoogleOneTapSignIn.checkPlayServices(true);
  const response = await google.GoogleOneTapSignIn.presentExplicitSignIn();

  if (google.isCancelledResponse(response)) return null;
  if (!google.isSuccessResponse(response) || !response.data.idToken) {
    throw new Error("Google n’a pas pu confirmer votre identité.");
  }
  return response.data.idToken;
};

export const signOutFromGoogle = async () => {
  if (!WEB_CLIENT_ID) return;
  const google = await loadGoogleSignIn();
  await google.GoogleOneTapSignIn.signOut();
};
