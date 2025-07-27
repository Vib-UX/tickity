import { CameraView, useCameraPermissions } from "expo-camera";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function BasicGLUsage() {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const glViewRef = useRef<GLView>(null);
  const cameraRef = useRef<CameraView>(null);
  const arSessionRef = useRef<any>(null);

  // Add debug info helper
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [
      ...prev.slice(-4),
      `${new Date().toLocaleTimeString()}: ${info}`,
    ]);
  };

  async function onContextCreate(gl: ExpoWebGLRenderingContext) {
    try {
      setError(null);
      addDebugInfo("Starting AR setup...");

      // Check if GLView ref is available
      if (!glViewRef.current) {
        throw new Error("GLView reference not available");
      }

      // Check for AR support on GLView component
      const hasStartARSession =
        typeof glViewRef.current.startARSessionAsync === "function";
      const hasCreateCameraTexture =
        typeof glViewRef.current.createCameraTextureAsync === "function";

      if (!hasStartARSession || !hasCreateCameraTexture) {
        throw new Error("AR methods not available on this device");
      }

      addDebugInfo("AR methods available, checking platform support...");

      // Platform-specific AR support check
      let arSupported = false;
      if (Platform.OS === "ios") {
        arSupported = parseFloat(Platform.Version as string) >= 11.0; // ARKit requires iOS 11+
      } else if (Platform.OS === "android") {
        arSupported = Platform.Version >= 24; // ARCore requires API level 24+
      }

      if (!arSupported) {
        throw new Error(
          `AR not supported on ${Platform.OS} ${Platform.Version}`
        );
      }

      addDebugInfo("Platform supports AR, starting AR session...");

      // Step 1: Start AR Session using GLView method
      const arSession = await glViewRef.current.startARSessionAsync();
      console.log("glViewRef", glViewRef);
      arSessionRef.current = arSession;
      addDebugInfo("✅ AR session started successfully");

      // Step 2: Set up basic WebGL rendering
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0); // Transparent background for AR

      // Step 3: Create shaders for basic AR object rendering
      const vertexShaderSource = `
        attribute vec4 position;
        uniform mat4 mvpMatrix;
        void main() {
          gl_Position = mvpMatrix * position;
        }
      `;

      const fragmentShaderSource = `
        precision mediump float;
        uniform vec3 color;
        void main() {
          gl_FragColor = vec4(color, 0.8);
        }
      `;

      // Create and compile shaders
      const vertexShader = createShader(
        gl,
        gl.VERTEX_SHADER,
        vertexShaderSource
      );
      const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
      );

      if (!vertexShader || !fragmentShader) {
        throw new Error("Failed to create shaders");
      }

      // Create program
      const program = gl.createProgram();
      if (!program) {
        throw new Error("Failed to create program");
      }

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
      }

      gl.useProgram(program);
      addDebugInfo("✅ Shaders compiled and linked");

      // Step 4: Create a simple 3D cube for AR
      const vertices = new Float32Array([
        // Front face
        -0.1, -0.1, 0.1, 0.1, -0.1, 0.1, 0.1, 0.1, 0.1, -0.1, 0.1, 0.1,
        // Back face
        -0.1, -0.1, -0.1, -0.1, 0.1, -0.1, 0.1, 0.1, -0.1, 0.1, -0.1, -0.1,
      ]);

      const indices = new Uint16Array([
        0,
        1,
        2,
        0,
        2,
        3, // front
        4,
        5,
        6,
        4,
        6,
        7, // back
        5,
        0,
        3,
        5,
        3,
        6, // top
        1,
        4,
        7,
        1,
        7,
        2, // bottom
        5,
        4,
        1,
        5,
        1,
        0, // left
        3,
        2,
        7,
        3,
        7,
        6, // right
      ]);

      // Create buffers
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      // Get attribute and uniform locations
      const positionLocation = gl.getAttribLocation(program, "position");
      const mvpMatrixLocation = gl.getUniformLocation(program, "mvpMatrix");
      const colorLocation = gl.getUniformLocation(program, "color");

      addDebugInfo("✅ 3D geometry created");

      // Step 5: Try to create camera texture using GLView method
      try {
        if (cameraRef.current) {
          const cameraTexture =
            await glViewRef.current.createCameraTextureAsync(cameraRef.current);
          addDebugInfo("✅ Camera texture created successfully");

          // Note: In a full implementation, you'd bind this texture to a background quad
          // For this basic example, we'll just log that it was created
        }
      } catch (cameraError) {
        addDebugInfo(`⚠️ Camera texture creation failed: ${cameraError}`);
        // Continue without camera texture - AR session still works
      }

      // Step 6: Render loop
      let startTime = Date.now();

      const render = () => {
        if (!arSessionRef.current) return;

        const currentTime = Date.now();
        const elapsed = (currentTime - startTime) / 1000;

        // Clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Create a simple model-view-projection matrix
        const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
        const mvpMatrix = createMVPMatrix(elapsed, aspect);

        // Set uniforms
        gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix);
        gl.uniform3f(colorLocation, 1.0, 0.5, 0.0); // Orange color

        // Set up vertex attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        gl.endFrameEXP();
        requestAnimationFrame(render);
      };

      addDebugInfo("🚀 Starting AR render loop");
      render();
    } catch (err) {
      console.error("AR setup failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addDebugInfo(`❌ Error: ${errorMessage}`);
    }
  }

  // Helper function to create shaders
  function createShader(
    gl: ExpoWebGLRenderingContext,
    type: number,
    source: string
  ) {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  // Helper function to create MVP matrix
  function createMVPMatrix(time: number, aspect: number): Float32Array {
    const mvp = new Float32Array(16);

    // Simple perspective projection + model transformation
    const fov = Math.PI / 4;
    const near = 0.01;
    const far = 100;

    // Perspective matrix
    const f = 1.0 / Math.tan(fov / 2);
    mvp[0] = f / aspect;
    mvp[5] = f;
    mvp[10] = (far + near) / (near - far);
    mvp[11] = -1;
    mvp[14] = (2 * far * near) / (near - far);
    mvp[15] = 0;

    // Add rotation around Y axis
    const rotation = time * 0.5;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // Apply rotation to the matrix
    const temp0 = mvp[0] * cos + mvp[8] * sin;
    const temp8 = mvp[8] * cos - mvp[0] * sin;
    mvp[0] = temp0;
    mvp[8] = temp8;

    return mvp;
  }

  // Request camera permissions on mount
  React.useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Show permission request if needed
  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission required for AR</Text>
        <Text style={styles.debugText}>
          Tap to grant camera access for AR functionality
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera view for AR background */}
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      {/* GLView for 3D rendering overlay */}
      <GLView
        ref={glViewRef}
        style={styles.glOverlay}
        onContextCreate={onContextCreate}
      />

      {/* Debug info overlay */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>AR Status:</Text>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.debugText}>
            {info}
          </Text>
        ))}
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  debugContainer: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 5,
  },
  debugTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  debugText: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 2,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
});
