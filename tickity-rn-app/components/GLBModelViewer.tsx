import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface GLBModelViewerProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  enableCamera?: boolean;
  backgroundColor?: number;
  enableRotation?: boolean;
}

export default function GLBModelViewer({
  modelPath,
  scale = 1,
  position = [0, 0, -2],
  rotation = [0, 0, 0],
  enableCamera = true,
  backgroundColor = 0x222222,
  enableRotation = true,
}: GLBModelViewerProps) {
  const glViewRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  const [key, setKey] = useState(0);

  // Refs to track current state
  const renderLoopRef = useRef<number | null>(null);
  const glContextRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Handle React Navigation focus/blur events
  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      setIsActive(true);
      setTimeout(() => {
        setKey((prev) => prev + 1);
      }, 200);

      return () => {
        setIsFocused(false);
        setIsActive(false);
        cleanupResources();
      };
    }, [])
  );

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && isFocused) {
        setIsActive(true);
        setTimeout(() => {
          setKey((prev) => prev + 1);
        }, 100);
      } else {
        setIsActive(false);
        cleanupResources();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription?.remove();
      cleanupResources();
    };
  }, [isFocused]);

  // Request camera permissions if camera is enabled
  useEffect(() => {
    if (enableCamera && !permission) {
      requestPermission();
    } else if (enableCamera && !permission?.granted) {
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to display the model with camera background.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Grant Permission", onPress: requestPermission },
        ]
      );
    }
  }, [permission, requestPermission, enableCamera]);

  const cleanupResources = () => {
    if (renderLoopRef.current) {
      cancelAnimationFrame(renderLoopRef.current);
      renderLoopRef.current = null;
    }

    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
    }

    modelRef.current = null;
    glContextRef.current = null;
  };

  async function onContextCreate(gl: ExpoWebGLRenderingContext) {
    try {
      cleanupResources();
      glContextRef.current = gl;
      setError(null);
      setIsLoading(true);

      if (!isActive || !isFocused) {
        return;
      }

      // Create renderer
      const renderer = new Renderer({
        gl,
        alpha: enableCamera,
        antialias: true,
        powerPreference: "high-performance",
      });

      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(
        enableCamera ? 0x000000 : backgroundColor,
        enableCamera ? 0 : 1
      );

      // Enable shadows
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Create scene
      const scene = new THREE.Scene();

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 3);

      // Add lighting
      setupLighting(scene);

      // Load GLB model
      try {
        await loadGLBModel(scene, modelPath);
      } catch (modelError) {
        console.warn("GLB model loading failed, showing fallback:", modelError);
        // Add fallback 3D object
        addFallbackObject(scene);
        setError("Model failed to load, showing fallback object");
      }

      // Start render loop
      startRenderLoop(renderer, scene, camera, gl);

      setIsLoading(false);
    } catch (err) {
      console.error("GLB Model setup failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Setup failed: ${errorMessage}`);
      setIsLoading(false);
    }
  }

  function setupLighting(scene: THREE.Scene) {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Fill light from the opposite direction
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, -5, -5);
    scene.add(fillLight);

    // Hemisphere light for natural sky/ground lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.3);
    scene.add(hemisphereLight);
  }

  function addFallbackObject(scene: THREE.Scene) {
    console.log("Adding fallback 3D object");

    // Create a colorful spinning cube as fallback
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.8,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.setScalar(scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
    modelRef.current = mesh;

    console.log("Fallback object added successfully");
  }

  async function loadGLBModel(
    scene: THREE.Scene,
    modelPath: string
  ): Promise<void> {
    console.log("Starting to load GLB model from:", modelPath);
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.load(
        modelPath,
        (gltf) => {
          console.log("GLB model loaded successfully:", gltf);
          try {
            const model = gltf.scene;

            // Apply scale, position, and rotation
            model.scale.setScalar(scale);
            model.position.set(...position);
            model.rotation.set(...rotation);

            // Enable shadows for all meshes
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Ensure materials are properly configured
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                      if (mat instanceof THREE.MeshStandardMaterial) {
                        mat.needsUpdate = true;
                      }
                    });
                  } else if (
                    child.material instanceof THREE.MeshStandardMaterial
                  ) {
                    child.material.needsUpdate = true;
                  }
                }
              }
            });

            // Set up animations if they exist
            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(model);
              mixerRef.current = mixer;

              gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.play();
              });
            }

            scene.add(model);
            modelRef.current = model;

            console.log("GLB model loaded successfully");
            resolve();
          } catch (setupError) {
            reject(setupError);
          }
        },
        (progress) => {
          console.log("Loading progress event:", progress);
          if (progress.total > 0) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            setLoadingProgress(percentComplete);
            console.log(`Loading progress: ${percentComplete.toFixed(2)}%`);
          } else {
            console.log(`Loaded: ${progress.loaded} bytes (total unknown)`);
          }
        },
        (error) => {
          console.error("Error loading GLB model:", error);
          console.error("Error details:", {
            message: error.message,
            type: error.type,
            target: error.target,
          });
          reject(
            new Error(
              `Failed to load model: ${error.message || "Unknown error"}`
            )
          );
        }
      );
    });
  }

  function startRenderLoop(
    renderer: Renderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    gl: ExpoWebGLRenderingContext
  ) {
    const render = () => {
      if (!isActive || !isFocused || gl !== glContextRef.current) {
        return;
      }

      renderLoopRef.current = requestAnimationFrame(render);

      // Update animations
      if (mixerRef.current) {
        const delta = clockRef.current.getDelta();
        mixerRef.current.update(delta);
      }

      // Auto-rotate model if enabled
      if (enableRotation && modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }

      try {
        renderer.render(scene, camera);
        gl.endFrameEXP();
      } catch (renderError) {
        console.warn("Render failed:", renderError);
      }
    };
    render();
  }

  // Show loading if camera permissions are not granted (when camera is enabled)
  if (enableCamera && !permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission required</Text>
      </View>
    );
  }

  // Don't render if not active or focused
  if (!isActive || !isFocused) {
    return (
      <View style={styles.container}>
        <View style={styles.inactiveContainer}>
          <Text style={styles.inactiveText}>
            {!isFocused
              ? "Switch to this tab to view model"
              : "Model viewer paused - will activate shortly"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera background if enabled */}
      {enableCamera && (
        <CameraView
          key={`camera-${key}`}
          style={styles.camera}
          facing="back"
          enableTorch={false}
          pointerEvents="none"
        />
      )}

      {/* 3D Scene */}
      <GLView
        key={`gl-${key}`}
        ref={glViewRef}
        style={enableCamera ? styles.overlay : styles.fullscreen}
        onContextCreate={onContextCreate}
      />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>
            Loading model... {loadingProgress.toFixed(0)}%
          </Text>
        </View>
      )}

      {/* Error overlay */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
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
  fullscreen: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  errorContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    padding: 15,
    borderRadius: 8,
  },
  errorText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  inactiveContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  inactiveText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
