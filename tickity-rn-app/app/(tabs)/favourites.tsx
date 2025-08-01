import { router } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const Favourites = () => {
  const [showAR, setShowAR] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favourites</Text>
      <Text style={styles.subtitle}>
        Here you'll find all your favourite events in one place
      </Text>
      <Text style={styles.description}>
        Save events you love and access them quickly whenever you need them
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Discover Events"
          onPress={() => {
            router.push("/(tabs)/");
          }}
        />
        <View style={styles.buttonSpacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSpacer: {
    width: 20,
  },
});

export default Favourites;
