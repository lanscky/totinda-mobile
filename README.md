# Totinda Mobile

Application mobile Expo/React Native destinée aux étudiants : découverte d’offres
de stage, consultation des entreprises, candidature, gestion du profil et du CV.

## Prérequis

- Node.js LTS
- npm
- un compte Expo/EAS autorisé sur le projet `lanscky/archive`

## Installation

```bash
cp .env.example .env
npm install
npm start
```

L’URL de l’API est configurable avec `EXPO_PUBLIC_API_URL`. Elle doit utiliser
HTTPS en production.

## Connexion Google

La connexion Google utilise le module natif `react-native-nitro-google-signin`.
Elle nécessite un development build ou un build EAS et ne fonctionne pas dans
Expo Go.

Créer dans le même projet Google Cloud :

- un client OAuth Web, utilisé comme audience des jetons côté mobile et backend ;
- un client Android avec le package réel du build et son empreinte SHA-1 ;
- un client iOS avec le bundle identifier réel du build.

Configurer ensuite `.env` :

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=yyy.apps.googleusercontent.com
GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.yyy
```

La valeur `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` doit également figurer dans
`GOOGLE_OAUTH_CLIENT_IDS` sur le backend. Après toute modification de cette
configuration native, régénérer puis reconstruire l’application :

```bash
npx expo prebuild
npx expo run:android
# ou npx expo run:ios
```

## Contrôles qualité

```bash
npm run check
```

Ce contrôle exécute TypeScript en mode strict puis ESLint.

## Builds

```bash
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform all
```

Avant un build Store, vérifier dans `app.json` :

- les identifiants Android et iOS définitifs ;
- les icônes et le splash ;
- les textes de permissions caméra et galerie ;
- la version publique de l’application.

Le profil `production` d’`eas.json` incrémente automatiquement le numéro de build.

## Architecture

- `app/` : routes et écrans Expo Router
- `api/` : authentification et client HTTP centralisé
- `context/` : session utilisateur
- `components/` : composants UI partagés
- `assets/locales/` : traductions français, anglais et lingala

Les jetons d’accès et de rafraîchissement sont conservés dans `expo-secure-store`
sur Android et iOS. `AsyncStorage` est uniquement nettoyé pour supprimer les
anciennes sessions créées par les versions précédentes.
