// app/profile/layout.js
import { Stack } from "expo-router";
import '../global.css';

export default function OffreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // header visible pour les pages profile
        // headerStyle: { backgroundColor: "purple" },
        // headerTintColor: "white",
      }}
    />
  );
}
