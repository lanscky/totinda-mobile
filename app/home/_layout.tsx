import { Tabs } from "expo-router";
import { ClipboardCheck } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";
import '../global.css';

export default function HomeLayout() {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: "#044EB8",
          tabBarInactiveTintColor: "#1D2633",
          tabBarStyle: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",

            borderTopWidth: 0.2,
            borderTopColor: "#1D263380",
            elevation: 5,
            height: 80,
            paddingTop: 8,
            paddingBottom: 8,
          },

          tabBarLabelStyle: {
            fontFamily: "NotoSans-Regular",
            fontSize: 10,
          },
        }}
      >
        {/* Page Accueil */}
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home"),
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
            title: t("tabs.offers"),
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
            title: t("tabs.companies"),
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

        {/* Page Candidatures */}
        <Tabs.Screen
          name="candidatures"
          options={{
            title: t("tabs.applications"),
            tabBarIcon: ({ focused }) => (
              <ClipboardCheck
                size={25}
                color={focused ? "#044EB8" : "#1D2633"}
              />
            ),
          }}
        />

        {/* Page Profils */}
        <Tabs.Screen
          name="profils"
          options={{
            title: t("tabs.profile"),
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
