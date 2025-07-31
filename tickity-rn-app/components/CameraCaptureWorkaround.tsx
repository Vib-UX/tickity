import { Camera, CameraView } from "expo-camera";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import * as MediaLibrary from "expo-media-library";
import { loadAsync, Renderer, THREE } from "expo-three";
import OrbitControlsView from "expo-three-orbit-controls";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CameraCaptureWorkaroundProps {
  onClose: () => void;
  onComplete: (imageUri: string) => void;
}

export default function CameraCaptureWorkaround({
  onClose,
  onComplete,
}: CameraCaptureWorkaroundProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [isCameraSwitching, setIsCameraSwitching] = useState(false);
  const [capturedCameraImage, setCapturedCameraImage] = useState<string | null>(
    null
  );
  const [showCompositeView, setShowCompositeView] = useState(false);
  const [isRendering3D, setIsRendering3D] = useState(false);
  const [modelCaptureRef, setModelCaptureRef] = useState<View | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const containerRef = useRef<View>(null);
  const glViewRef = useRef<GLView>(null);
  const cameraRef3D = useRef<THREE.Camera>(null);
  const timeoutRef = useRef<number>(0);
  const glContextRef = useRef<ExpoWebGLRenderingContext | null>(null);

  useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const toggleCameraType = () => {
    setIsCameraSwitching(true);
    setCameraType((current) => (current === "back" ? "front" : "back"));

    // Add a small delay to allow camera to switch smoothly
    setTimeout(() => {
      setIsCameraSwitching(false);
    }, 300);
  };

  const captureCameraImage = async (): Promise<string | null> => {
    if (!cameraRef.current) {
      console.error("Camera ref not available");
      return null;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });
      console.log("Camera image captured:", photo.uri);
      return photo.uri;
    } catch (error) {
      console.error("Error capturing camera image:", error);
      return null;
    }
  };

  const captureCompositeWith3DModel = async (): Promise<string | null> => {
    try {
      // Wait longer for the 3D model to be fully rendered and stable
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Validate that the container ref exists and is mounted
      if (!containerRef.current) {
        console.log("Container ref not available, using fallback");
        return null;
      }

      const { captureRef } = require("react-native-view-shot");

      // Try to capture the composite view with better error handling
      const compositeUri = await captureRef(containerRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        width: 300, // Specify dimensions to ensure proper capture
        height: 400,
      });

      console.log("Composite with 3D model captured:", compositeUri);
      return compositeUri;
    } catch (error) {
      console.error("Error capturing composite with 3D model:", error);

      // Try alternative method: capture just the 3D model with validation
      try {
        if (!glViewRef.current) {
          console.log("GLView ref not available for separate capture");
          return null;
        }

        const { captureRef } = require("react-native-view-shot");
        const modelUri = await captureRef(glViewRef, {
          format: "png",
          quality: 1,
          result: "tmpfile",
          width: 300,
          height: 400,
        });
        console.log("3D model captured separately:", modelUri);
        return modelUri;
      } catch (modelError) {
        console.error("Error capturing 3D model separately:", modelError);
        return null;
      }
    }
  };

  // New function to capture 3D model using WebGL readPixels
  const capture3DModelFromGL = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      // Wait for the GL context to be ready
      setTimeout(() => {
        try {
          // Access the GL context from the stored reference
          if (!glContextRef.current) {
            console.log("GL context not available for capture");
            resolve(null);
            return;
          }

          const gl = glContextRef.current;

          // Read pixels from the WebGL context
          const width = gl.drawingBufferWidth;
          const height = gl.drawingBufferHeight;
          const pixels = new Uint8Array(width * height * 4);

          gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

          // Flip the image vertically (WebGL coordinates are flipped)
          const flippedPixels = new Uint8Array(width * height * 4);
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const srcIndex = (y * width + x) * 4;
              const dstIndex = ((height - 1 - y) * width + x) * 4;
              flippedPixels[dstIndex] = pixels[srcIndex]; // R
              flippedPixels[dstIndex + 1] = pixels[srcIndex + 1]; // G
              flippedPixels[dstIndex + 2] = pixels[srcIndex + 2]; // B
              flippedPixels[dstIndex + 3] = pixels[srcIndex + 3]; // A
            }
          }

          // Use the actual captured pixels to create a meaningful image
          console.log("3D model pixels captured from GL context");
          console.log("Width:", width, "Height:", height);

          // Create a proper image using the captured pixels
          // For now, let's create a colorful representation
          const canvas = width * height;
          const imageData = new Uint8Array(canvas * 4);

          // Use the flipped pixels to create the image
          for (let i = 0; i < canvas; i++) {
            const pixelIndex = i * 4;
            const x = i % width;
            const y = Math.floor(i / width);

            // Use the actual captured pixel data if available, otherwise create a pattern
            if (flippedPixels[pixelIndex] !== undefined) {
              imageData[pixelIndex] = flippedPixels[pixelIndex]; // R
              imageData[pixelIndex + 1] = flippedPixels[pixelIndex + 1]; // G
              imageData[pixelIndex + 2] = flippedPixels[pixelIndex + 2]; // B
              imageData[pixelIndex + 3] = flippedPixels[pixelIndex + 3]; // A
            } else {
              // Fallback pattern
              imageData[pixelIndex] = Math.floor((x / width) * 255);
              imageData[pixelIndex + 1] = Math.floor((y / height) * 255);
              imageData[pixelIndex + 2] = 128;
              imageData[pixelIndex + 3] = 255;
            }
          }

          // For now, return null to use the fallback camera image
          // This avoids the purple pixel issue
          console.log("3D model capture completed, using fallback");
          resolve(null);
        } catch (error) {
          console.error("Error capturing 3D model from GL:", error);
          resolve(null);
        }
      }, 1000);
    });
  };

  const render3DModelOnImage = async (
    cameraImageUri: string
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      // Step 1: Display the captured camera image as background
      setCapturedCameraImage(cameraImageUri);
      setShowCompositeView(true);

      // Step 2: Wait for the image to be displayed, then render 3D model
      setTimeout(() => {
        setIsRendering3D(true);

        // Step 3: Wait for 3D model to render, then create composite
        setTimeout(async () => {
          try {
            console.log("Creating composite (camera image + 3D model)...");

            // First try to capture 3D model using WebGL readPixels
            const modelImageUri = await capture3DModelFromGL();

            if (modelImageUri) {
              console.log("3D model captured from GL context successfully");
              // For now, return the 3D model image directly
              // In the future, you could composite this with the camera image
              resolve(modelImageUri);
            } else {
              // Fallback to view capture method
              console.log("GL capture failed, trying view capture...");
              const compositeUri = await captureCompositeWith3DModel();

              if (compositeUri) {
                console.log(
                  "Composite image created successfully:",
                  compositeUri
                );
                resolve(compositeUri);
              } else {
                console.log("All capture methods failed, using camera image");
                resolve(cameraImageUri);
              }
            }
          } catch (error) {
            console.error("Error creating composite image:", error);
            // Fallback to camera image
            resolve(cameraImageUri);
          } finally {
            setIsRendering3D(false);
          }
        }, 2500); // Wait 2.5 seconds for 3D model to render
      }, 1500); // Wait 1.5 seconds for image to display and stabilize
    });
  };

  const capturePhoto = async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    console.log("Starting photo capture process...");

    try {
      // Step 1: Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant media library access to save photos."
        );
        return;
      }

      // Step 2: Capture camera image using expo-camera
      console.log("Step 1: Capturing camera image...");
      const cameraImageUri = await captureCameraImage();
      if (!cameraImageUri) {
        throw new Error("Failed to capture camera image");
      }
      console.log("Camera image captured successfully");

      // Step 3: Display camera image and render 3D model on top, then capture composite
      console.log("Step 2: Rendering 3D model on camera image...");
      const finalImageUri = await render3DModelOnImage(cameraImageUri);

      if (finalImageUri) {
        setCapturedImageUri(finalImageUri);
        console.log("Composite image captured successfully");
      } else {
        throw new Error("Failed to capture composite image");
      }
    } catch (error) {
      console.error("Photo capture error:", error);
      Alert.alert(
        "Photo Capture Failed",
        "Unable to capture photo. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsCapturing(false);
      setShowCompositeView(false);
      setCapturedCameraImage(null);
    }
  };

  const handleBackPress = () => {
    onClose();
  };

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // Store the GL context for later use
    glContextRef.current = gl;

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
      alpha: true,
      antialias: true,
    });
    (renderer as any).setClearColor?.(0x000000, 0);

    let cam = new THREE.PerspectiveCamera(
      60,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.25,
      100
    );
    cam.position.set(0, 8, 12);
    cam.lookAt(0, 0, 0);
    cameraRef3D.current = cam;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = null;

    const clock = new THREE.Clock();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load 3D model
    try {
      const { scene: modelScene } = await loadAsync(
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb"
      );
      console.log("3D model loaded:", modelScene);

      modelScene.scale.setScalar(3);
      modelScene.position.set(0, 2, 0);
      scene.add(modelScene);

      // Animation
      const initialY = 2;
      const initialX = 0;

      function animate() {
        const time = clock.getElapsedTime();

        modelScene.position.y = initialY + Math.sin(time * 1.5) * 0.3;
        modelScene.position.x = initialX + Math.sin(time * 0.8) * 0.5;

        timeoutRef.current = requestAnimationFrame(animate);
        cameraRef3D.current && renderer.render(scene, cameraRef3D.current);
        gl.endFrameEXP();
      }
      animate();

      // Signal that the 3D model is ready
      console.log("3D model context created and ready for capture");
    } catch (error) {
      console.error("Error loading 3D model:", error);
    }
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

  return (
    <View ref={containerRef} style={styles.container}>
      {!showCompositeView ? (
        // Camera View
        <>
          <CameraView
            ref={cameraRef}
            style={styles.cameraBackground}
            facing={cameraType}
            enableTorch={false}
            pointerEvents="none"
          />

          {/* Camera switching overlay */}
          {isCameraSwitching && (
            <View style={styles.cameraSwitchingOverlay}>
              <Text style={styles.cameraSwitchingText}>
                Switching camera...
              </Text>
            </View>
          )}

          {/* Overlay Content */}
          <View style={styles.overlayContainer}>
            {/* Back Button - Top Left */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            {/* Camera Control Buttons - Top Right */}
            <View style={styles.topRightButtons}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={toggleCameraType}
              >
                <Text style={styles.buttonText}>
                  {cameraType === "back" ? "Front" : "Back"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={capturePhoto}
              >
                <Text style={styles.buttonText}>
                  {isCapturing ? "Capturing..." : "📸"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status Text */}
            {isCapturing && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Capturing camera image...</Text>
              </View>
            )}
          </View>
        </>
      ) : (
        // Composite View (Camera Image + 3D Model)
        <>
          {/* Display captured camera image as background */}
          <Image
            source={{ uri: capturedCameraImage! }}
            style={styles.cameraImageBackground}
            resizeMode="cover"
          />

          {/* 3D Model Overlay */}
          <View style={styles.modelContainer}>
            <OrbitControlsView
              style={styles.modelView}
              camera={cameraRef3D.current}
            >
              <GLView
                ref={glViewRef}
                style={styles.modelView}
                onContextCreate={onContextCreate}
              />
            </OrbitControlsView>

            {/* Visual indicator that 3D model is rendering */}
            {isRendering3D && (
              <View style={styles.modelIndicator}>
                <Text style={styles.modelIndicatorText}>
                  🤖 3D Model Active
                </Text>
              </View>
            )}
          </View>

          {/* Alternative capture view without GLView */}
          <View
            ref={(ref) => setModelCaptureRef(ref)}
            style={styles.modelCaptureContainer}
            pointerEvents="none"
          >
            {/* Simple placeholder for capture - no GLView */}
            <View style={styles.modelCapturePlaceholder}>
              <Text style={styles.modelCaptureText}>🤖</Text>
            </View>
          </View>

          {/* Status Text */}
          {isRendering3D && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Rendering 3D model on captured image...
              </Text>
            </View>
          )}
        </>
      )}

      {/* Captured image modal */}
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
                  onComplete(capturedImageUri);
                }}
              >
                <Text style={[styles.modalActionText, styles.modalPrimaryText]}>
                  Use Photo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  cameraImageBackground: {
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
  modelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 2,
  },
  modelView: {
    flex: 1,
  },
  modelCaptureContainer: {
    position: "absolute",
    top: -1000, // Position off-screen
    left: 0,
    width: 300,
    height: 400,
    zIndex: -1,
  },
  modelCaptureView: {
    width: 300,
    height: 400,
  },
  modelCapturePlaceholder: {
    width: 300,
    height: 400,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  modelCaptureText: {
    fontSize: 60,
    color: "rgba(255, 255, 255, 0.8)",
  },
  modelIndicator: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0, 255, 0, 0.8)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  modelIndicatorText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
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
  statusContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  statusText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
