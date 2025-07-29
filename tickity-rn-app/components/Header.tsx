import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const router = useRouter();

  const handleAccountPress = () => {
    router.push("/(tabs)/account");
  };

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.title}>Tickity</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.accountButton}
        onPress={handleAccountPress}
        activeOpacity={0.7}
      >
        <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  accountButton: {
    padding: 4,
  },
});
