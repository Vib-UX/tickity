import { CameraView, useCameraPermissions } from "expo-camera";
import { GLView } from "expo-gl";
import * as MediaLibrary from "expo-media-library";
import { Renderer } from "expo-three";
import { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function GlbSelfie() {
  /* 1 · permissions ------------------------------------------------------- */
  const [perm, askPerm] = useCameraPermissions();

  /* 2 · refs -------------------------------------------------------------- */
  const glRef = useRef<any>(null);

  /* 3 · early returns after hooks ----------------------------------------- */
  if (!perm) return null;
  if (!perm.granted)
    return (
      <View style={styles.center}>
        <TouchableOpacity onPress={askPerm}>
          <Text>Grant camera permission</Text>
        </TouchableOpacity>
      </View>
    );

  /* 3 · take screenshot --------------------------------------------------- */
  const snap = async () => {
    const file = await GLView.takeSnapshotAsync(glRef.current, {
      format: "png",
      flip: false,
    });
    await MediaLibrary.saveToLibraryAsync(file.uri);
    alert("Saved!");
  };

  /* 4 · GLView ------------------------------------------------------------ */
  let rendererRef: Renderer;
  let sceneRef: THREE.Scene;

  return (
    <View style={styles.fill}>
      {/* Camera background */}
      <CameraView
        style={styles.camera}
        facing="front"
        enableTorch={false}
        pointerEvents="none"
      />

      {/* 3D Scene */}
      <GLView
        style={styles.overlay}
        onContextCreate={async (gl) => {
          glRef.current = gl;

          /* Three boilerplate */
          rendererRef = new Renderer({
            gl,
            alpha: true, // Enable transparency
            antialias: true,
          });
          rendererRef.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
          rendererRef.setClearColor(0x000000, 0); // Transparent background

          sceneRef = new THREE.Scene();
          const cam = new THREE.PerspectiveCamera(
            70,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.01,
            1000
          );

          /* GLB model */
          const { scene: model } = await new GLTFLoader().loadAsync(
            require("../assets/res/small.glb")
          );
          model.position.set(0, 0, -1);
          model.scale.setScalar(0.3);
          sceneRef.add(model);
          sceneRef.add(new THREE.AmbientLight(0xffffff, 1));

          /* render loop */
          const loop = () => {
            requestAnimationFrame(loop);
            model.rotation.y += 0.01;
            rendererRef.render(sceneRef, cam);
            gl.endFrameEXP();
          };
          loop();
        }}
      />

      {/* capture button */}
      <TouchableOpacity style={styles.snap} onPress={snap}>
        <Text style={styles.snapTxt}>📸</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ----------------------------------------------------------------------- */
const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  snap: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 18,
    borderRadius: 38,
  },
  snapTxt: { fontSize: 26, color: "#fff" },
});
