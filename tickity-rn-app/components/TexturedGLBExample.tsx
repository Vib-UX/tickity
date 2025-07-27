import React from "react";
import { StyleSheet, Text, View } from "react-native";
import TexturedGLBViewer from "./TexturedGLBViewer";

export default function TexturedGLBExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Textured GLB Viewer Examples</Text>

      {/* Example 1: Just texture (shows textured cube as fallback) */}
      <View style={styles.viewerContainer}>
        <Text style={styles.subtitle}>Basic Textured Cube</Text>
        <TexturedGLBViewer
          // No modelPath provided, so it shows a textured cube
          texturePath={require("../assets/res/texture_S3.webp")}
          scale={1.5}
          position={[0, 0, -3]}
          enableRotation={true}
          backgroundColor={0x1a1a1a}
        />
      </View>

      {/* Example 2: With different texture */}
      <View style={styles.viewerContainer}>
        <Text style={styles.subtitle}>Heart Texture</Text>
        <TexturedGLBViewer
          texturePath={require("../assets/res/texture_S3.webp")}
          scale={1.2}
          position={[0, 0, -2.5]}
          enableRotation={true}
          backgroundColor={0x2a2a2a}
        />
      </View>

      {/* Example 3: If you have a GLB file, uncomment this */}
      {/*
      <View style={styles.viewerContainer}>
        <Text style={styles.subtitle}>GLB Model with Custom Texture</Text>
        <TexturedGLBViewer
          modelPath={require("../assets/res/your-model.glb")}
          texturePath={require("../assets/res/texture.webp")}
          scale={2}
          position={[0, 0, -4]}
          enableRotation={true}
          backgroundColor={0x333333}
        />
      </View>
      */}
    </View>
  );
}

// Alternative usage examples for different scenarios:

// Example with custom texture on existing GLB
export function CustomTexturedGLB() {
  return (
    <TexturedGLBViewer
      // modelPath={require("../assets/res/model.glb")} // Uncomment if you have a GLB
      texturePath={require("../assets/res/texture_S2.png")}
      scale={1}
      position={[0, 0, -2]}
      rotation={[0, 0, 0]}
      enableRotation={true}
      backgroundColor={0x000000}
    />
  );
}

// Example with heart texture
export function HeartTexturedModel() {
  return (
    <TexturedGLBViewer
      texturePath={require("../assets/res/texture_S3.webp")}
      scale={0.8}
      position={[0, 0, -2]}
      enableRotation={false}
      backgroundColor={0x333333}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
  },
  subtitle: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 5,
  },
  viewerContainer: {
    flex: 1,
    marginVertical: 5,
  },
});
