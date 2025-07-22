"use strict";

import React from "react";
import { StyleSheet } from "react-native";

import {
  Viro3DObject,
  ViroAmbientLight,
  ViroAnimations,
  ViroARScene,
  ViroDirectionalLight,
  ViroMaterials,
  ViroNode,
  ViroOrbitCamera,
} from "@viro-community/react-viro";

// Create custom rotation animation
ViroAnimations.registerAnimations({
  heartRotate: {
    properties: {
      rotateY: "+=360",
    },
    duration: 4000,
  },
});

// Create materials with the original textures
ViroMaterials.createMaterials({
  heart: {
    lightingModel: "PBR",
    diffuseTexture: require("./res/texture.webp"),
    specularTexture: require("./res/texture.webp"),
    writesToDepthBuffer: true,
    readsFromDepthBuffer: true,
  },
});

// Scene function that ViroARSceneNavigator expects
function MainScene() {
  return (
    <ViroARScene style={styles.container}>
      {/* <ViroSkyBox
        source={{
          nx: require("./res/grid_bg.jpg"),
          px: require("./res/grid_bg.jpg"),
          ny: require("./res/grid_bg.jpg"),
          py: require("./res/grid_bg.jpg"),
          nz: require("./res/grid_bg.jpg"),
          pz: require("./res/grid_bg.jpg"),
        }}
      /> */}

      <ViroOrbitCamera
        position={[0, 0, 0]}
        active={true}
        focalPoint={[0, 0, -1]}
      />
      <ViroDirectionalLight direction={[0, 0, -1]} color="#ffffff" />
      <ViroAmbientLight color="#aaaaaa" />

      {/* Large heart object with automatic rotation using animation property */}
      <ViroNode position={[0, 0, -1]}>
        <Viro3DObject
          source={require("./res/asset.obj")}
          materials={["heart"]}
          type="OBJ"
          scale={[0.3, 0.3, 0.3]}
          animation={{
            name: "heartRotate",
            run: true,
            loop: true,
          }}
        />
      </ViroNode>

      {/* Simple text */}
      {/* <ViroText
        text="AR Heart Model - Auto Rotating!"
        position={[0, 2, -3]}
        style={styles.textStyle}
        transformBehaviors={["billboardY"]}
        width={4}
        height={1}
      /> */}
    </ViroARScene>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textStyle: {
    fontFamily: "HelveticaNeue-Medium",
    fontSize: 18,
    color: "#FFFFFF",
  },
});

export default MainScene;
