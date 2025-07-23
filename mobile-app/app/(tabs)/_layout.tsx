import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 55, // Increased from default ~50px to 80px
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name="compass-outline" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-event"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="add-circle-outline" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="heart-outline" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
