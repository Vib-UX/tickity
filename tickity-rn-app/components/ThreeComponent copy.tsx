// // This example demonstrates how to load a GCode file using the GCodeLoader from three.js with AR camera background.
// // https://threejs.org/examples/#webgl_loader_gcode

// // Fast refresh doesn't work very well with GLViews.
// // Always reload the entire component when the file changes:
// // https://reactnative.dev/docs/fast-refresh#fast-refresh-and-hooks
// // @refresh reset

// import { CameraView, useCameraPermissions } from "expo-camera";
// import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
// import { Renderer, THREE } from "expo-three";
// import OrbitControlsView from "expo-three-orbit-controls";
// import React, { useEffect, useRef, useState } from "react";
// import { Alert, StyleSheet, View } from "react-native";
// import { GCodeLoader } from "three/examples/jsm/loaders/GCodeLoader";

// import { LoadingView } from "../components/LoadingView";
// import { useSceneStats } from "../components/StatsPanel";
// export default function ThreeScene() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [permission, requestPermission] = useCameraPermissions();
//   const cameraRef = useRef<THREE.Camera>();

//   const { calculateSceneStats, StatsPanel, mark } = useSceneStats();

//   const timeoutRef = useRef<number>();
//   useEffect(() => {
//     // Clear the animation loop when the component unmounts
//     return () => clearTimeout(timeoutRef.current);
//   }, []);

//   // Request camera permissions on mount
//   useEffect(() => {
//     if (!permission) {
//       requestPermission();
//     } else if (!permission.granted) {
//       Alert.alert(
//         "Camera Permission Required",
//         "This app needs camera access to create an AR experience.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Grant Permission", onPress: requestPermission },
//         ]
//       );
//     }
//   }, [permission, requestPermission]);

//   const sceneRef = useRef<THREE.Scene>();
//   const clockRef = useRef<THREE.Clock>();

//   const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
//     setIsLoading(true);
//     clockRef.current = new THREE.Clock();

//     // removes the warning EXGL: gl.pixelStorei() doesn't support this parameter yet!
//     const pixelStorei = gl.pixelStorei.bind(gl);
//     gl.pixelStorei = function (...args) {
//       const [parameter] = args;
//       switch (parameter) {
//         case gl.UNPACK_FLIP_Y_WEBGL:
//           return pixelStorei(...args);
//       }
//     };

//     const renderer = new Renderer({
//       gl,
//       alpha: true, // Enable alpha for transparency
//       antialias: true,
//     });

//     // Enable transparency
//     renderer.setClearColor(0x000000, 0); // Transparent background

//     const cam = new THREE.PerspectiveCamera(
//       60,
//       gl.drawingBufferWidth / gl.drawingBufferHeight,
//       1,
//       1000
//     );
//     cam.position.set(0, 0, 100);
//     cameraRef.current = cam;

//     sceneRef.current = new THREE.Scene();
//     // Remove background color to make it transparent for AR effect
//     // sceneRef.current.background = new THREE.Color(0x000000);

//     // Add ambient light for better visibility
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
//     sceneRef.current.add(ambientLight);

//     // Add directional light
//     const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//     directionalLight.position.set(50, 50, 50);
//     sceneRef.current.add(directionalLight);

//     // Add the rest of your objects here:
//     const loader = new GCodeLoader();
//     const object = await loader.loadAsync(
//       "https://threejs.org/examples/models/gcode/benchy.gcode"
//     );
//     object.position.set(-100, -20, 100);

//     // Scale down the object for better AR visualization
//     object.scale.setScalar(0.8);

//     sceneRef.current.add(object);
//     // cameraRef.current.lookAt(object.position);

//     function animate() {
//       timeoutRef.current = requestAnimationFrame(animate);

//       // FPS counter
//       mark();

//       if (cameraRef.current && sceneRef.current) {
//         renderer.render(sceneRef.current, cameraRef.current);
//       }
//       gl.endFrameEXP();
//     }
//     animate();

//     setIsLoading(false);

//     // Calculate the objects, vertices, and triangles in the scene
//     calculateSceneStats(sceneRef.current);
//   };

//   // Show loading if camera permissions are not granted
//   if (!permission?.granted) {
//     return <LoadingView />;
//   }

//   return (
//     <View style={styles.container}>
//       {/* Camera background */}
//       <CameraView
//         style={styles.camera}
//         facing="back"
//         enableTorch={false}
//         pointerEvents="none"
//       />

//       {/* 3D Scene overlay */}
//       <View style={styles.overlay} pointerEvents="box-none">
//         <OrbitControlsView style={{ flex: 1 }} camera={cameraRef.current}>
//           <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
//         </OrbitControlsView>
//       </View>

//       {isLoading ? <LoadingView /> : <StatsPanel style={styles.stats} />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   camera: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "transparent",
//   },
//   stats: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     padding: 10,
//     backgroundColor: "rgba(255, 255, 0, 0.8)", // Semi-transparent yellow
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
// });

import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as THREE from "three";

export default function ThreeScene() {
  const glViewRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [isArSupported, setIsArSupported] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  const [key, setKey] = useState(0); // Force re-render when needed

  // Refs to track current state
  const renderLoopRef = useRef<number | null>(null);
  const glContextRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const cameraSessionRef = useRef<any>(null);

  // Add debug logging function
  const addDebugInfo = (info: string) => {
    console.log(`[AR Debug]: ${info}`);
    setDebugInfo((prev) => [...prev.slice(-4), info]); // Keep last 5 debug messages
  };

  // Handle React Navigation focus/blur events
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused
      addDebugInfo("Screen focused - activating AR");
      setIsFocused(true);
      setIsActive(true);

      // Force recreation after a short delay to ensure clean state
      setTimeout(() => {
        setKey((prev) => prev + 1);
      }, 200);

      return () => {
        // Screen is blurred (user navigated away)
        addDebugInfo("Screen blurred - deactivating AR");
        setIsFocused(false);
        setIsActive(false);
        cleanupResources();
      };
    }, [])
  );

  // Handle app state changes (for backgrounding)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      addDebugInfo(`App state changed to: ${nextAppState}`);

      if (nextAppState === "active" && isFocused) {
        setIsActive(true);
        // Force component to recreate when becoming active
        setTimeout(() => {
          setKey((prev) => prev + 1);
        }, 100);
      } else {
        setIsActive(false);
        // Clean up resources when going to background
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

  // Request camera permissions on mount
  useEffect(() => {
    addDebugInfo(`Platform: ${Platform.OS}`);
    addDebugInfo(
      `Running on: ${Platform.select({
        ios: "iOS",
        android: "Android",
        default: "Unknown",
      })}`
    );

    if (!permission) {
      requestPermission();
    } else if (!permission.granted) {
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to create an AR experience.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Grant Permission", onPress: requestPermission },
        ]
      );
    }
  }, [permission, requestPermission]);

  // Cleanup function for resources
  const cleanupResources = () => {
    addDebugInfo("Cleaning up resources");

    if (renderLoopRef.current) {
      cancelAnimationFrame(renderLoopRef.current);
      renderLoopRef.current = null;
    }

    if (cameraSessionRef.current) {
      try {
        if (typeof cameraSessionRef.current.stop === "function") {
          cameraSessionRef.current.stop();
        }
      } catch (e) {
        console.warn("Error stopping camera session:", e);
      }
      cameraSessionRef.current = null;
    }

    glContextRef.current = null;
  };

  async function onContextCreate(gl: ExpoWebGLRenderingContext) {
    try {
      // Clean up any existing resources first
      cleanupResources();

      glContextRef.current = gl;
      setError(null);
      addDebugInfo("Starting GL context creation");

      // Check if component is still active and focused
      if (!isActive || !isFocused) {
        addDebugInfo("Component not active/focused, aborting setup");
        return;
      }

      // Add comprehensive AR support detection
      let arAvailable = false;

      // Method 1: Check for AR support via GL context
      try {
        if (typeof (gl as any).isARSupportedAsync === "function") {
          arAvailable = await (gl as any).isARSupportedAsync();
          addDebugInfo(`GL AR support check: ${arAvailable}`);
        } else {
          addDebugInfo("GL.isARSupportedAsync not available");
        }
      } catch (arCheckError) {
        addDebugInfo(`AR support check failed: ${arCheckError}`);
      }

      // Method 2: Platform-specific checks
      if (!arAvailable) {
        if (Platform.OS === "ios") {
          // iOS requires ARKit support
          addDebugInfo("Checking iOS ARKit availability");
          // Note: This is a basic check - real ARKit support needs native code
          arAvailable = Platform.Version >= "11.0"; // ARKit requires iOS 11+
        } else if (Platform.OS === "android") {
          // Android requires ARCore support
          addDebugInfo("Checking Android ARCore availability");
          // Note: This is a basic check - real ARCore support detection needs native code
          arAvailable = Platform.Version >= 24; // ARCore requires API level 24+
        }
        addDebugInfo(`Platform AR check result: ${arAvailable}`);
      }

      // Method 3: Check for expo-gl AR capabilities
      const hasARProps =
        !!(gl as any).startARSessionAsync || !!(gl as any).createARSession;
      addDebugInfo(`GL has AR methods: ${hasARProps}`);

      setIsArSupported(arAvailable && hasARProps);

      if (!arAvailable || !hasARProps) {
        const reason = !arAvailable
          ? "Platform doesn't support AR"
          : "GL context lacks AR methods";
        addDebugInfo(`AR not available: ${reason}`);
        setError(`AR not supported: ${reason}`);
        // Always fall back to camera + 3D overlay (which should work well)
        await setupCameraWith3DOverlay(gl);
        return;
      }

      addDebugInfo("Attempting AR session setup");
      await setupARSession(gl);
    } catch (err) {
      console.error("AR setup failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebugInfo(`Setup failed: ${errorMessage}`);
      setError(`Setup failed: ${errorMessage}`);
      // Fall back to camera + 3D overlay
      await setupCameraWith3DOverlay(gl);
    }
  }

  async function setupARSession(gl: ExpoWebGLRenderingContext) {
    try {
      addDebugInfo("Starting AR session");

      // Try different AR session creation methods
      let arSession = null;

      if (typeof (gl as any).startARSessionAsync === "function") {
        arSession = await (gl as any).startARSessionAsync();
        addDebugInfo("AR session created via startARSessionAsync");
      } else if (typeof (gl as any).createARSession === "function") {
        arSession = await (gl as any).createARSession();
        addDebugInfo("AR session created via createARSession");
      } else {
        throw new Error("No AR session creation method available");
      }

      cameraSessionRef.current = arSession;

      // Set up renderer for AR
      const renderer = new Renderer({
        gl,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });

      (renderer as any).setSize?.(
        gl.drawingBufferWidth,
        gl.drawingBufferHeight
      );
      (renderer as any).setClearColor?.(0x000000, 0); // Transparent background for AR

      // Enable shadows if supported
      if ((renderer as any).shadowMap) {
        (renderer as any).shadowMap.enabled = true;
        (renderer as any).shadowMap.type = THREE.PCFSoftShadowMap;
      }

      // Scene
      const scene = new THREE.Scene();

      // Try to set AR background texture with multiple methods
      await setupARBackground(scene, arSession, renderer);

      // Camera with proper AR settings
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.01,
        1000
      );

      // Add content to scene
      setupScene(scene);

      // Start render loop
      startARRenderLoop(renderer, scene, camera, arSession, gl);

      addDebugInfo("AR session setup complete");
    } catch (arError) {
      addDebugInfo(`AR session setup failed: ${arError}`);
      throw arError;
    }
  }

  async function setupARBackground(
    scene: THREE.Scene,
    arSession: any,
    renderer: any
  ) {
    try {
      // Method 1: Try expo-three AR background
      const ExpoTHREE = require("expo-three");
      if (
        ExpoTHREE.createARBackgroundTexture &&
        typeof ExpoTHREE.createARBackgroundTexture === "function"
      ) {
        scene.background = ExpoTHREE.createARBackgroundTexture(
          arSession,
          renderer
        );
        addDebugInfo(
          "AR background set via ExpoTHREE.createARBackgroundTexture"
        );
        return;
      }

      // Method 2: Try video texture
      if (arSession && arSession.video) {
        const backgroundTexture = new THREE.VideoTexture(arSession.video);
        backgroundTexture.minFilter = THREE.LinearFilter;
        backgroundTexture.magFilter = THREE.LinearFilter;
        backgroundTexture.format = THREE.RGBFormat;
        scene.background = backgroundTexture;
        addDebugInfo("AR background set via VideoTexture");
        return;
      }

      // Method 3: Try canvas texture
      if (arSession && arSession.canvas) {
        const backgroundTexture = new THREE.CanvasTexture(arSession.canvas);
        scene.background = backgroundTexture;
        addDebugInfo("AR background set via CanvasTexture");
        return;
      }

      addDebugInfo(
        "No AR background texture method worked - using transparent background"
      );
      // No background - let the CameraView show through
    } catch (bgError) {
      addDebugInfo(`AR background setup failed: ${bgError}`);
      // Continue without AR background texture
    }
  }

  async function setupCameraWith3DOverlay(gl: ExpoWebGLRenderingContext) {
    try {
      addDebugInfo("Setting up camera + 3D overlay");

      // Create renderer with transparency to let camera show through
      const renderer = new Renderer({
        gl,
        alpha: true,
        antialias: true,
      });

      (renderer as any).setSize?.(
        gl.drawingBufferWidth,
        gl.drawingBufferHeight
      );
      (renderer as any).setClearColor?.(0x000000, 0); // Fully transparent

      const scene = new THREE.Scene();
      // No background - let camera view show through

      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 2;

      // Add content to scene
      setupScene(scene);

      // Start render loop
      startRenderLoop(renderer, scene, camera, gl);

      addDebugInfo("Camera + 3D overlay setup complete");
    } catch (fallbackErr) {
      addDebugInfo(`Camera overlay setup failed: ${fallbackErr}`);
      await setupRegular3DScene(gl);
    }
  }

  function setupScene(scene: THREE.Scene) {
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add test object - rotating cube
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.8,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -0.5);
    mesh.castShadow = true;
    scene.add(mesh);

    // Store mesh reference for animation
    (scene as any).animatedMesh = mesh;
  }

  function startARRenderLoop(
    renderer: any,
    scene: THREE.Scene,
    camera: THREE.Camera,
    arSession: any,
    gl: ExpoWebGLRenderingContext
  ) {
    const render = () => {
      // Check if component is still active, focused and GL context is valid
      if (!isActive || !isFocused || gl !== glContextRef.current) {
        addDebugInfo(
          "Stopping AR render loop - component inactive/unfocused or GL context changed"
        );
        return;
      }

      renderLoopRef.current = requestAnimationFrame(render);

      // Update AR session if method exists
      if (arSession && typeof arSession.update === "function") {
        try {
          arSession.update();
        } catch (updateError) {
          console.warn("AR session update failed:", updateError);
        }
      }

      // Animate the mesh
      const mesh = (scene as any).animatedMesh;
      if (mesh) {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
      }

      // Render the scene
      if (
        (renderer as any).render &&
        typeof (renderer as any).render === "function"
      ) {
        try {
          (renderer as any).render(scene, camera);
        } catch (renderError) {
          console.warn("Render failed:", renderError);
        }
      }

      try {
        gl.endFrameEXP();
      } catch (endFrameError) {
        console.warn("EndFrame failed:", endFrameError);
      }
    };
    render();
  }

  function startRenderLoop(
    renderer: any,
    scene: THREE.Scene,
    camera: THREE.Camera,
    gl: ExpoWebGLRenderingContext
  ) {
    const render = () => {
      // Check if component is still active, focused and GL context is valid
      if (!isActive || !isFocused || gl !== glContextRef.current) {
        addDebugInfo(
          "Stopping render loop - component inactive/unfocused or GL context changed"
        );
        return;
      }

      renderLoopRef.current = requestAnimationFrame(render);

      // Animate the mesh
      const mesh = (scene as any).animatedMesh;
      if (mesh) {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
      }

      if (
        (renderer as any).render &&
        typeof (renderer as any).render === "function"
      ) {
        try {
          (renderer as any).render(scene, camera);
        } catch (renderError) {
          console.warn("Render failed:", renderError);
        }
      }

      try {
        gl.endFrameEXP();
      } catch (endFrameError) {
        console.warn("EndFrame failed:", endFrameError);
      }
    };
    render();
  }

  async function setupRegular3DScene(gl: ExpoWebGLRenderingContext) {
    try {
      addDebugInfo("Setting up regular 3D scene fallback");

      const renderer = new Renderer({ gl });
      (renderer as any).setSize?.(
        gl.drawingBufferWidth,
        gl.drawingBufferHeight
      );
      (renderer as any).setClearColor?.(0x222222, 1); // Dark background for fallback

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 2;

      // Add lighting and content
      setupScene(scene);

      // Different colored cube for fallback mode
      const mesh = (scene as any).animatedMesh;
      if (mesh && mesh.material) {
        mesh.material.color.setHex(0x00ff00); // Green for fallback mode
        mesh.scale.setScalar(2); // Make it bigger
      }

      startRenderLoop(renderer, scene, camera, gl);

      addDebugInfo("Regular 3D scene setup complete");
    } catch (fallbackErr) {
      const errorMessage =
        fallbackErr instanceof Error
          ? fallbackErr.message
          : String(fallbackErr);
      addDebugInfo(`Regular 3D scene failed: ${errorMessage}`);
      setError(`All rendering methods failed: ${errorMessage}`);
    }
  }

  // Show loading if camera permissions are not granted
  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission required for AR</Text>
      </View>
    );
  }

  // Don't render if not active or focused (helps with tab switching)
  if (!isActive || !isFocused) {
    return (
      <View style={styles.container}>
        <View style={styles.inactiveContainer}>
          <Text style={styles.inactiveText}>
            {!isFocused
              ? "Switch to this tab to activate camera"
              : "Camera paused - will activate shortly"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera background - always show for AR effect */}
      <CameraView
        key={`camera-${key}`} // Force camera to recreate when key changes
        style={styles.camera}
        facing="back"
        enableTorch={false}
        pointerEvents="none"
      />

      {/* 3D Scene overlay */}
      <GLView
        key={`gl-${key}`} // Force GL view to recreate when key changes
        ref={glViewRef}
        style={styles.overlay}
        onContextCreate={onContextCreate}
      />

      {/* Debug info overlay */}
      <View style={styles.debugContainer}>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.debugText}>
            {info}
          </Text>
        ))}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {!isArSupported && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>Using Camera + 3D Overlay mode</Text>
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
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    margin: 5,
  },
  debugContainer: {
    position: "absolute",
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: "white",
    fontSize: 12,
    marginBottom: 2,
  },
  warningContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 150, 255, 0.8)",
    padding: 10,
    borderRadius: 5,
  },
  warningText: {
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
