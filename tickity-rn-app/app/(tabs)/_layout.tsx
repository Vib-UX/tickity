import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <Tabs
        screenOptions={{
          tabBarPosition: "bottom",
          tabBarStyle: {
            height: 55,
            backgroundColor: "#1a1a1a",
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "#808080",
          tabBarItemStyle: {
            paddingVertical: Platform.OS === "android" ? 8 : 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name="home-outline"
                size={30}
                color={focused ? "#ffffff" : "#808080"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name="compass-outline"
                size={30}
                color={focused ? "#ffffff" : "#808080"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add-event"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name="add-circle-outline"
                size={30}
                color={focused ? "#ffffff" : "#808080"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="favourites"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name="heart-outline"
                size={30}
                color={focused ? "#ffffff" : "#808080"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name="person-circle"
                size={30}
                color={focused ? "#ffffff" : "#808080"}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
