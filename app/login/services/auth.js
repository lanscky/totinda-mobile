// services/auth.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginUser = async (email, password) => {
  try {
    // Supprimer les anciens tokens
    await AsyncStorage.multiRemove(["access_token", "refresh_token", "user_info"]);
    const response = await fetch("https://backend.totinda.com/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Email ou mot de passe incorrect");
    }

    const data = await response.json();

    // Vérifications sur le rôle et le statut du compte
    if (data.user.role_user !== "student") {
      throw new Error("Accès réservé uniquement aux étudiants.");
    }

    if (!data.user.is_active_user) {
      throw new Error("Compte inactif. Veuillez contacter l'administrateur.");
    }

    // Sauvegarder les tokens
    await AsyncStorage.multiSet([
      ["access_token", data.access],
      ["refresh_token", data.refresh],
      ["user_info", JSON.stringify(data.user)],
    ]);

    return data; // retourne toutes les infos si tu veux les utiliser
  } catch (error) {
    console.error("Erreur login :", error.message);
    throw error;
  }
};




//await AsyncStorage.setItem("token", data.access);
// export const logoutUser = async () => {
//   await AsyncStorage.multiRemove(["access_token", "refresh_token", "user_info"]);
// };

// 💡 Bonus : comment le récupérer après connexion
// const accessToken = await AsyncStorage.getItem("access_token");
// const userInfo = JSON.parse(await AsyncStorage.getItem("user_info"));