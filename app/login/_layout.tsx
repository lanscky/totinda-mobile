// app/profile/layout.js
import { Stack } from "expo-router";
import '../global.css';

export default function LoginLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // header visible pour les pages profile
        // headerStyle: { backgroundColor: "purple" },
        headerTintColor: "white",
      }}
    />
  );
}
