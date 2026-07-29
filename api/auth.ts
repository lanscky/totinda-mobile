import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, clearSession } from "./client";

export interface User {
  id: number;
  email: string;
  role_user: string;
  is_active_user: boolean;
  username?: string;
  prenom?: string;
  postnom?: string;
  telephone?: string;
  profile_picture?: string;
  student?: {
    id_student: number;
    niveau?: string;
    filiere?: string;
    formation?: string;
    cv?: string;
    school?: unknown | null;
  };
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
      await clearSession();
      const data = await apiRequest<LoginResponse>("token/", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!data.access || !data.refresh || !data.user) {
        throw new Error("Réponse d’authentification invalide.");
      }

      if (data.user.role_user !== "student") {
        throw new Error("Accès réservé uniquement aux étudiants.");
      }

      if (!data.user.is_active_user) {
        throw new Error("Compte inactif. Veuillez contacter l'administrateur.");
      }

      await AsyncStorage.multiSet([
        ["access_token", data.access],
        ["refresh_token", data.refresh],
        ["user_info", JSON.stringify(data.user)],
      ]);

      return data;
  },

  logout: clearSession,

  getAccessToken: async () => {
    return await AsyncStorage.getItem("access_token");
  },

  getUserInfo: async (): Promise<User | null> => {
    const info = await AsyncStorage.getItem("user_info");
    if (!info) return null;

    try {
      return JSON.parse(info) as User;
    } catch {
      await clearSession();
      return null;
    }
  },
};
