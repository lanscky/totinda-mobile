import { apiRequest, clearSession } from "./client";
import { secureStorage, SESSION_KEYS } from "./secureStorage";

export interface User {
  id: number;
  email: string;
  role_user: string;
  is_active_user: boolean;
  username?: string;
  prenom?: string;
  postnom?: string;
  telephone?: string;
  profile_picture?: string | null;
  profile_picture_url?: string | null;
  auth_providers?: string[];
  has_usable_password?: boolean;
  profile_completion?: ProfileCompletion;
  student?: {
    id_student: number;
    niveau?: string;
    filiere?: string;
    formation?: string;
    cv?: string;
    school?: unknown | null;
  };
}

export interface ProfileCompletion {
  percentage: number;
  can_apply: boolean;
  missing_fields: string[];
  completed_fields: string[];
  total_fields: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface StudentProfilePayload {
  username: string;
  postnom: string;
  prenom: string;
  telephone: string;
  filiere: string;
  niveau: string;
}

const persistSession = async (data: LoginResponse) => {
  if (!data.access || !data.refresh || !data.user) {
    throw new Error("Réponse d’authentification invalide.");
  }
  if (data.user.role_user !== "student") {
    throw new Error("Accès réservé uniquement aux étudiants.");
  }
  if (!data.user.is_active_user) {
    throw new Error("Compte inactif. Veuillez contacter l'administrateur.");
  }

  await Promise.all([
    secureStorage.set(SESSION_KEYS.accessToken, data.access),
    secureStorage.set(SESSION_KEYS.refreshToken, data.refresh),
    secureStorage.set(SESSION_KEYS.userInfo, JSON.stringify(data.user)),
  ]);
  return data;
};

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
      await clearSession();
      const data = await apiRequest<LoginResponse>("token/", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      return persistSession(data);
  },

  googleLogin: async (idToken: string, password?: string): Promise<LoginResponse> => {
    const data = await apiRequest<LoginResponse>("auth/google/", {
      method: "POST",
      authenticated: false,
      body: JSON.stringify({
        id_token: idToken,
        ...(password ? { password } : {}),
      }),
    });
    return persistSession(data);
  },

  refreshUser: () => apiRequest<User>("users/me/"),

  completeStudentProfile: (payload: StudentProfilePayload) =>
    apiRequest<User>("users/complete-student-profile/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  logout: clearSession,

  deleteAccount: async (password: string): Promise<void> => {
    await apiRequest<void>("users/delete-account/", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    await clearSession();
  },

  getAccessToken: async () => {
    await secureStorage.clearLegacySession();
    return await secureStorage.get(SESSION_KEYS.accessToken);
  },

  getUserInfo: async (): Promise<User | null> => {
    const info = await secureStorage.get(SESSION_KEYS.userInfo);
    if (!info) return null;

    try {
      return JSON.parse(info) as User;
    } catch {
      await clearSession();
      return null;
    }
  },
};
