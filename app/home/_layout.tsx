import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image } from "react-native";
import '../global.css';

export default function LoginLayout() {
  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
            headerShown: true, // ✅ active l'app bar
            headerStyle: {
            // backgroundColor: "#044EB8", // couleur de la barre
            },
            headerTintColor: "#1D2633", // couleur du texte et des icônes
            headerTitleStyle: {
            fontFamily: "MavenPro-SemiBold", // police personnalisée
            fontSize: 20,
            },
            headerTitleAlign: 'left',


            tabBarShowLabel: true,
            tabBarActiveTintColor: "#044EB8",
            tabBarInactiveTintColor: "#1D2633",
            tabBarStyle: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            
            borderTopWidth: 0.2,
            borderTopColor: "#1D263380",
            elevation: 5,
            height: 80,
          },
        
        tabBarLabelStyle: {
            fontFamily: "NotoSans-Regular", // ✅ police personnalisée
            fontSize: 12,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
        },
       }}
      >
        {/* Page Accueil */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Accueil",
            headerTitle: "Accueil 🔥",
             headerRight: () => (
                <Image
                source={require("../../assets/icons/notification.png")}
                style={{ width: 22, height: 22, marginRight: 15, tintColor: "#1D2633" }}
                />
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("../../assets/icons/home.png")
                    : require("../../assets/icons/home.png")
                }
                style={{
                  width: 25,
                  height: 25,
                  
                  tintColor: focused ? "#044EB8" : "#1D2633",
                }}
              />
            ),
          }}
        />
        {/* Page Offres */}
        <Tabs.Screen
          name="offres"
          options={{
            title: "Offres",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("../../assets/icons/case.png")}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? "#044EB8" : "#1D2633",
                }}
              />
            ),
          }}
        />

        {/* Page Entreprises */}
        <Tabs.Screen
          name="entreprises"
          options={{
            title: "Entreprises",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("../../assets/icons/building.png")}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? "#044EB8" : "#1D2633",
                }}
              />
            ),
          }}
        />

        {/* Page Profils */}
        <Tabs.Screen
          name="profils"
          options={{
            title: "Profils",
            tabBarIcon: ({ focused }) => (
              <Image
                source={require("../../assets/icons/user.png")}
                style={{
                  width: 25,
                  height: 25,
                  tintColor: focused ? "#044EB8" : "#1D2633",
                }}
              />
            ),
          }}
        />
        
      </Tabs>
    </React.Fragment>
  );
}
