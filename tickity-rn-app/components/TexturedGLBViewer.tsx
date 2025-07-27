import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { LoadingView } from "./LoadingView";

interface TexturedGLBViewerProps {
  modelPath?: any;
  texturePath?: any;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  backgroundColor?: number;
  enableRotation?: boolean;
}

export default function TexturedGLBViewer({
  modelPath,
  texturePath = require("../assets/res/texture_S3.webp"),
  scale = 1,
  position = [0, 0, -2],
  rotation = [0, 0, 0],
  backgroundColor = 0x222222,
  enableRotation = true,
}: TexturedGLBViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const renderLoopRef = useRef<number | null>(null);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    try {
      setError(null);
      setIsLoading(true);

      // Create renderer
      const renderer = new Renderer({
        gl,
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      });

      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(backgroundColor, 1);
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

      // Load texture
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(texturePath);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = false;

      // If modelPath is provided, load GLB model
      if (modelPath) {
        try {
          await loadGLBModel(scene, modelPath, texture);
        } catch (modelError) {
          console.warn("GLB model loading failed:", modelError);
          addFallbackObject(scene, texture);
          setError("Model failed to load, showing textured cube");
        }
      } else {
        // Create a simple textured cube as example
        addFallbackObject(scene, texture);
      }

      // Start render loop
      startRenderLoop(renderer, scene, camera, gl);
      setIsLoading(false);
    } catch (err) {
      console.error("TexturedGLBViewer setup failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Setup failed: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  function setupLighting(scene: THREE.Scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point light for additional illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 10);
    pointLight.position.set(-5, 5, 0);
    scene.add(pointLight);
  }

  async function loadGLBModel(
    scene: THREE.Scene,
    modelPath: string,
    texture: THREE.Texture
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.load(
        modelPath,
        (gltf) => {
          try {
            const model = gltf.scene;

            // Apply scale, position, and rotation
            model.scale.setScalar(scale);
            model.position.set(...position);
            model.rotation.set(...rotation);

            // Apply texture to all meshes
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Apply custom texture
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                      if (mat instanceof THREE.MeshStandardMaterial) {
                        mat.map = texture;
                        mat.needsUpdate = true;
                      }
                    });
                  } else if (
                    child.material instanceof THREE.MeshStandardMaterial
                  ) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                  } else {
                    // Convert to MeshStandardMaterial if needed
                    child.material = new THREE.MeshStandardMaterial({
                      map: texture,
                    });
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
            resolve();
          } catch (setupError) {
            reject(setupError);
          }
        },
        (progress) => {
          if (progress.total > 0) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            console.log(`Loading progress: ${percentComplete.toFixed(2)}%`);
          }
        },
        (error) => {
          console.error("Error loading GLB model:", error);
          reject(
            new Error(
              `Failed to load model: ${error.message || "Unknown error"}`
            )
          );
        }
      );
    });
  }

  function addFallbackObject(scene: THREE.Scene, texture: THREE.Texture) {
    // Create a textured cube as fallback
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(...position);
    cube.scale.setScalar(scale);
    cube.castShadow = true;
    cube.receiveShadow = true;

    scene.add(cube);
    modelRef.current = cube;
  }

  function startRenderLoop(
    renderer: Renderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    gl: ExpoWebGLRenderingContext
  ) {
    const render = () => {
      renderLoopRef.current = requestAnimationFrame(render);

      // Update animations
      if (mixerRef.current) {
        const delta = clockRef.current.getDelta();
        mixerRef.current.update(delta);
      }

      // Auto-rotate model if enabled
      if (enableRotation && modelRef.current) {
        modelRef.current.rotation.y += 0.01;
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

  React.useEffect(() => {
    return () => {
      if (renderLoopRef.current) {
        cancelAnimationFrame(renderLoopRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
      {isLoading && <LoadingView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
  },
});
