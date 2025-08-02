// Fast refresh doesn't work very well with GLViews.
// Always reload the entire component when the file changes:
// https://reactnative.dev/docs/fast-refresh#fast-refresh-and-hooks
// @refresh reset

import { Camera } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { loadAsync, Renderer, THREE } from "expo-three";
import OrbitControlsView from "expo-three-orbit-controls";

export default function Robot({ onComplete }: { onComplete: () => void }) {
  const [show3DModel, setShow3DModel] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraSwitching, setIsCameraSwitching] = useState(false);
  const [isAssetOpening, setIsAssetOpening] = useState(false);
  const [assetLoadProgress, setAssetLoadProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const cameraRef = useRef<THREE.Camera>(null);
  const containerRef = useRef<View>(null);
  const glViewRef = useRef<GLView>(null);
  const scanAnimationRef = useRef(new Animated.Value(0)).current;
  const fadeAnimationRef = useRef(new Animated.Value(0)).current;

  const timeoutRef = useRef<number>(0);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => {
      clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Start scanning animation immediately when component mounts
  useEffect(() => {
    // Start scanning after a short delay to ensure component is ready
    const timer = setTimeout(() => {
      if (!show3DModel) {
        startScanAnimation();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [show3DModel]);

  const startScanAnimation = () => {
    scanAnimationRef.setValue(0);
    setScanProgress(0);
    setAssetLoadProgress(0);

    Animated.timing(scanAnimationRef, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Update scan progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          // Start asset opening process
          setIsAssetOpening(true);
          startAssetOpening();
        }
        return newProgress;
      });
    }, 30);
  };

  const startAssetOpening = () => {
    // Simulate asset loading progress
    const assetInterval = setInterval(() => {
      setAssetLoadProgress((prev) => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(assetInterval);
          // Show 3D model after asset opens
          setTimeout(() => {
            setShow3DModel(true);
            setIsAssetOpening(false);
            Animated.timing(fadeAnimationRef, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            }).start();
          }, 500);
        }
        return newProgress;
      });
    }, 50);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const pixelStorei = gl.pixelStorei.bind(gl);
    gl.pixelStorei = function (...args) {
      const [parameter] = args;
      switch (parameter) {
        case gl.UNPACK_FLIP_Y_WEBGL:
          return pixelStorei(...args);
      }
    };

    const renderer = new Renderer({
      gl,
      alpha: true, // Enable transparency
      antialias: true,
    });
    (renderer as any).setClearColor?.(0x000000, 0); // Fully transparent background
    let cam = new THREE.PerspectiveCamera(
      60,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.25,
      100
    );
    // Position camera to show model at top center
    cam.position.set(0, 8, 12);
    cam.lookAt(0, 0, 0);
    cameraRef.current = cam;

    const scene = new THREE.Scene();
    scene.background = null; // Make background transparent
    scene.fog = null; // Remove fog for transparency

    const clock = new THREE.Clock();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const { scene: modelScene } = await loadAsync(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb"
    );
    modelScene.scale.setScalar(1);
    modelScene.position.set(0, 2, 0); // Position model higher up
    scene.add(modelScene);

    const initialY = 2;
    const initialX = 0;

    function animate() {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Add floating/bobbing motion
      modelScene.position.y = initialY + Math.sin(time * 1.5) * 0.3;

      // Add slight side-to-side movement
      modelScene.position.x = initialX + Math.sin(time * 0.8) * 0.5;

      timeoutRef.current = requestAnimationFrame(animate);
      cameraRef.current && renderer.render(scene, cameraRef.current);
      gl.endFrameEXP();
    }
    animate();
    // Call onComplete when the model is loaded and animation starts
    onComplete();
  };

  return (
    <View ref={containerRef} style={styles.container}>
      {isCameraSwitching && (
        <View style={styles.cameraSwitchingOverlay}>
          <Text style={styles.cameraSwitchingText}>Switching camera...</Text>
        </View>
      )}
      <View style={styles.overlayContainer}>
        {!show3DModel ? (
          <>
            {/* Scanning overlay - show before 3D model */}
            <View style={styles.scanOverlay}>
              <View style={styles.scanContainer}>
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanAnimationRef.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 100],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Text style={styles.scanText}>
                  {isAssetOpening
                    ? `OPENING AR ASSET... ${assetLoadProgress}%`
                    : `SCANNING VICINITY... ${scanProgress}%`}
                </Text>
                {isAssetOpening && (
                  <View style={styles.assetProgressContainer}>
                    <View style={styles.assetProgressBar}>
                      <View
                        style={[
                          styles.assetProgressFill,
                          { width: `${assetLoadProgress}%` },
                        ]}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <Animated.View
            style={[
              styles.modelContainer,
              {
                opacity: fadeAnimationRef,
              },
            ]}
          >
            <OrbitControlsView
              style={styles.modelView}
              camera={cameraRef.current}
            >
              <GLView
                ref={glViewRef}
                style={styles.modelView}
                onContextCreate={onContextCreate}
              />
            </OrbitControlsView>
          </Animated.View>
        )}

        {capturedImageUri && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Photo Captured!</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setCapturedImageUri(null)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: capturedImageUri }}
                  style={styles.modalImage}
                />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => setCapturedImageUri(null)}
                >
                  <Text style={styles.modalActionText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalPrimaryButton]}
                  onPress={() => {
                    setCapturedImageUri(null);
                    onComplete();
                  }}
                >
                  <Text
                    style={[styles.modalActionText, styles.modalPrimaryText]}
                  >
                    Use Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
  },
  cameraText: {
    color: "white",
    fontSize: 18,
    marginVertical: 5,
  },
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  scanLine: {
    width: 200,
    height: 4,
    backgroundColor: "#00ff00",
    borderRadius: 2,
  },
  scanText: {
    color: "#00ff00",
    fontSize: 16,
    marginTop: 10,
    fontFamily: "monospace",
  },
  modelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modelView: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  topRightButtons: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cameraButton: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureButton: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  cameraSwitchingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
  },
  cameraSwitchingText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  assetProgressContainer: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  assetProgressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  assetProgressFill: {
    height: "100%",
    backgroundColor: "#00ff00",
    borderRadius: 4,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    margin: 20,
    maxWidth: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "600",
  },
  modalImageContainer: {
    padding: 20,
    alignItems: "center",
  },
  modalImage: {
    width: 300,
    height: 400,
    borderRadius: 10,
    resizeMode: "contain",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  modalPrimaryButton: {
    backgroundColor: "#007AFF",
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalPrimaryText: {
    color: "white",
  },
});
