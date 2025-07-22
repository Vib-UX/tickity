import { ViroARSceneNavigator } from "@viro-community/react-viro";
import React from "react";
import { StyleSheet } from "react-native";
import MainScene from "./ARActivity";

function ARApp() {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: MainScene,
      }}
      style={styles.f1}
    />
  );
}

const styles = StyleSheet.create({
  f1: { flex: 1 },
});

export default ARApp;
