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

Les jetons sont actuellement conservés dans AsyncStorage. Pour la publication,
installer `expo-secure-store`, migrer les jetons d’accès/rafraîchissement vers ce
stockage chiffré et conserver uniquement le profil non sensible dans AsyncStorage.
